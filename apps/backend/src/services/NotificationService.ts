/**
 * 📱 VETRIC - Serviço de Notificações WhatsApp via Evolution API
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { query } from '../config/database';
import { MoradorModel } from '../models/Morador';
import { logService } from './LogService';

interface TemplateNotificacao {
  id: number;
  tipo: string;
  mensagem: string;
  ativo: boolean;
}

export class NotificationService {
  private evolutionAPI: AxiosInstance | null = null;
  private instance: string = '';
  private isInitialized: boolean = false;

  constructor() {
    // Configurações serão carregadas do banco de dados dinamicamente
  }

  /**
   * Inicializar Evolution API com configurações do banco de dados
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Buscar configurações do banco de dados
      const configs = await query<{ chave: string; valor: string }>(
        'SELECT chave, valor FROM configuracoes_sistema WHERE chave LIKE $1',
        ['evolution_%']
      );

      const configMap: any = {};
      configs.forEach(c => {
        configMap[c.chave] = c.valor;
      });

      const baseUrl = configMap['evolution_api_url'] || config.evolution.baseUrl;
      const apiKey = configMap['evolution_api_key'] || config.evolution.apiKey;
      this.instance = configMap['evolution_instance'] || config.evolution.instanceName;

      console.log('🔄 Carregando configurações Evolution API do banco...');
      console.log(`  URL: ${baseUrl}`);
      console.log(`  Instância: ${this.instance}`);

      this.evolutionAPI = axios.create({
        baseURL: baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        timeout: 30000,
      });

      this.isInitialized = true;
      console.log('✅ Evolution API inicializada com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao inicializar Evolution API:', error.message);
      throw error;
    }
  }

  /**
   * Renderizar template com dados
   */
  private renderizarTemplate(mensagem: string, dados: any): string {
    let resultado = mensagem;

    for (const [key, value] of Object.entries(dados)) {
      const placeholder = `{{${key}}}`;
      resultado = resultado.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }

    return resultado;
  }

  /**
   * Buscar template do banco
   */
  private async buscarTemplate(tipo: string): Promise<TemplateNotificacao | null> {
    const sql = 'SELECT * FROM templates_notificacao WHERE tipo = $1 AND ativo = true';
    const result = await query<TemplateNotificacao>(sql, [tipo]);
    return result[0] || null;
  }

  /**
   * Salvar log de notificação
   */
  private async salvarLog(
    moradorId: number,
    tipo: string,
    mensagem: string,
    telefone: string,
    status: 'enviado' | 'falha',
    erro?: string
  ) {
    const sql = `
      INSERT INTO logs_notificacoes (
        morador_id, tipo, mensagem_enviada, telefone, status, erro, enviado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    await query(sql, [moradorId, tipo, mensagem, telefone, status, erro || null]);
  }

  /**
   * Enviar mensagem via Evolution API
   */
  private async enviarViaEvolution(telefone: string, mensagem: string): Promise<any> {
    await this.initialize(); // Garantir que está inicializado
    
    if (!this.evolutionAPI) {
      throw new Error('Evolution API não está inicializada');
    }
    
    const response = await this.evolutionAPI.post(`/message/sendText/${this.instance}`, {
      number: telefone.replace(/\D/g, ''), // Remove formatação
      text: mensagem,
    });
    return response.data;
  }

  /**
   * 🧪 ENVIAR MENSAGEM DE TESTE (sem verificações de morador)
   */
  async enviarMensagemTeste(telefone: string, mensagem: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`\n🧪 Enviando mensagem de teste...`);
      console.log(`📱 Telefone: ${telefone}`);
      console.log(`💬 Mensagem: ${mensagem}\n`);

      const response = await this.enviarViaEvolution(telefone, mensagem);

      console.log(`✅ Teste enviado com sucesso!`);
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error(`❌ Erro ao enviar teste:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 🔔 ENVIAR NOTIFICAÇÃO
   * Método principal que valida, renderiza e envia
   */
  async enviarNotificacao(
    tipo: string,
    moradorId: number,
    dados: any
  ): Promise<boolean> {
    try {
      // 1. Buscar morador
      const morador = await MoradorModel.findById(moradorId);
      if (!morador) {
        console.warn(`⚠️  Morador ${moradorId} não encontrado`);
        return false;
      }

      // 2. Verificar se tem telefone
      if (!morador.telefone) {
        console.log(`⏭️  Morador ${morador.nome} sem telefone cadastrado`);
        return false;
      }

      // 3. Verificar se notificações estão ativas
      if (!morador.notificacoes_ativas) {
        console.log(`⏭️  Notificações desativadas para ${morador.nome}`);
        return false;
      }

      // 4. Buscar template
      const template = await this.buscarTemplate(tipo);
      if (!template) {
        console.warn(`⚠️  Template "${tipo}" não encontrado ou inativo`);
        return false;
      }

      // 5. Renderizar mensagem
      const mensagem = this.renderizarTemplate(template.mensagem, {
        nome: morador.nome,
        apartamento: morador.apartamento,
        ...dados,
      });

      // 6. Enviar via Evolution API
      const response = await this.enviarViaEvolution(morador.telefone, mensagem);

      // 7. Salvar log de sucesso
      if (morador.id) {
        await this.salvarLog(morador.id, tipo, mensagem, morador.telefone, 'enviado');
      }

      console.log(`✅ Notificação "${tipo}" enviada para ${morador.nome} (${morador.telefone})`);
      
      // 🆕 LOG: Notificação enviada com sucesso
      await logService.logNotificacao(
        true,
        tipo.toUpperCase(),
        moradorId,
        morador.nome,
        dados.charger,
        `Notificação de ${tipo} enviada para ${morador.nome}`,
        undefined
      );
      
      return true;

    } catch (error: any) {
      console.error(`❌ Erro ao enviar notificação ${tipo}:`, error.message);

      // Salvar log de falha
      if (moradorId) {
        const morador = await MoradorModel.findById(moradorId);
        if (morador && morador.telefone && morador.id) {
          await this.salvarLog(
            morador.id,
            tipo,
            '',
            morador.telefone,
            'falha',
            error.message
          );
          
          // 🆕 LOG: Falha ao enviar notificação
          await logService.logNotificacao(
            false,
            tipo.toUpperCase(),
            morador.id,
            morador.nome,
            undefined,
            `Falha ao enviar notificação de ${tipo}`,
            error.message
          );
        }
      }

      return false;
    }
  }

  /**
   * 🔔 Notificação: Início de Carregamento
   */
  async notificarInicio(moradorId: number, chargerNome: string, localizacao: string) {
    return await this.enviarNotificacao('inicio_recarga', moradorId, {
      charger: chargerNome,
      localizacao,
      data: new Date().toLocaleString('pt-BR'),
    });
  }

  /**
   * ✅ Notificação: Fim de Carregamento (DEPRECATED)
   */
  async notificarFim(
    moradorId: number,
    chargerNome: string,
    energia: number,
    duracao: string,
    custo: number
  ) {
    // DEPRECATED: Use notificarBateriaCheia() ou notificarInterrupcao()
    console.warn('⚠️ notificarFim() está deprecated. Use notificarBateriaCheia() ou notificarInterrupcao().');
    return false;
  }

  /**
   * ⚠️ Notificação: Erro Detectado (DEPRECATED)
   */
  async notificarErro(moradorId: number, chargerNome: string, erro: string) {
    // DEPRECATED: Não há template correspondente no novo sistema
    console.warn('⚠️ notificarErro() está deprecated. Use notificarInterrupcao() se aplicável.');
    return false;
  }

  /**
   * 💤 Notificação: Início de Ociosidade
   */
  async notificarOciosidade(moradorId: number, chargerNome: string, energiaConsumida: string) {
    return await this.enviarNotificacao('inicio_ociosidade', moradorId, {
      charger: chargerNome,
      energia: energiaConsumida,
      data: new Date().toLocaleString('pt-BR'),
    });
  }

  /**
   * 🔋 Notificação: Bateria Cheia
   */
  async notificarBateriaCheia(moradorId: number, chargerNome: string, energiaConsumida: string, duracaoMinutos: number) {
    const horas = Math.floor(duracaoMinutos / 60);
    const minutos = duracaoMinutos % 60;
    const duracao = `${horas}h ${minutos}min`;

    return await this.enviarNotificacao('bateria_cheia', moradorId, {
      charger: chargerNome,
      energia: energiaConsumida,
      duracao,
    });
  }

  /**
   * ⚠️ Notificação: Interrupção de Carregamento
   */
  async notificarInterrupcao(moradorId: number, chargerNome: string, energiaConsumida: string, duracaoMinutos: number) {
    const horas = Math.floor(duracaoMinutos / 60);
    const minutos = duracaoMinutos % 60;
    const duracao = `${horas}h ${minutos}min`;

    return await this.enviarNotificacao('interrupcao', moradorId, {
      charger: chargerNome,
      energia: energiaConsumida,
      duracao,
    });
  }

  /**
   * 💤 Notificação: Ocioso (DEPRECATED - alias para notificarOciosidade)
   */
  async notificarOcioso(moradorId: number, chargerNome: string, tempoMinutos: number) {
    // Alias para compatibilidade - chama o novo método
    console.warn('⚠️ notificarOcioso() está deprecated. Use notificarOciosidade().');
    return await this.notificarOciosidade(moradorId, chargerNome, '0.0');
  }

  /**
   * ✨ Notificação: Carregador Disponível (DEPRECATED - mantido para compatibilidade)
   */
  async notificarDisponivel(moradorId: number, chargerNome: string) {
    // Este método foi deprecated, mas mantido para não quebrar código existente
    console.warn('⚠️ notificarDisponivel() está deprecated. Use os 4 novos tipos de notificação.');
    return false;
  }

  /**
   * 📊 Buscar estatísticas de notificações
   */
  async getStats(periodo: 'hoje' | 'semana' | 'mes' = 'hoje') {
    let filtroData = '';
    switch (periodo) {
      case 'hoje':
        filtroData = "AND enviado_em >= CURRENT_DATE";
        break;
      case 'semana':
        filtroData = "AND enviado_em >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'mes':
        filtroData = "AND enviado_em >= CURRENT_DATE - INTERVAL '30 days'";
        break;
    }

    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'enviado') as enviadas,
        COUNT(*) FILTER (WHERE status = 'falha') as falhas,
        AVG(EXTRACT(EPOCH FROM (enviado_em - criado_em))) as tempo_medio
      FROM logs_notificacoes
      WHERE 1=1 ${filtroData}
    `;

    const result = await query(sql);
    return result[0];
  }
}

export const notificationService = new NotificationService();

/**
 * 🔄 VETRIC - Serviço de Polling (Alternativa ao WebSocket)
 * 
 * Este serviço busca transações ativas da API CVE a cada X segundos
 * e identifica automaticamente os moradores pelo idTag (RFID).
 */

import { cveService } from './CVEService';
import { MoradorModel } from '../models/Morador';
import { CarregamentoModel } from '../models/Carregamento';
import { CVETransaction } from '../types';

export class PollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private pollingInterval: number = 10000; // 10 segundos
  private transacoesConhecidas: Map<string, number> = new Map(); // transactionId → carregamentoId

  constructor(pollingInterval?: number) {
    if (pollingInterval) {
      this.pollingInterval = pollingInterval;
    }
  }

  /**
   * Iniciar polling automático
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Polling já está rodando');
      return;
    }

    console.log(`🔄 Iniciando polling (intervalo: ${this.pollingInterval / 1000}s)...`);
    this.isRunning = true;

    // Executar imediatamente
    this.poll();

    // Executar a cada X segundos
    this.intervalId = setInterval(() => {
      this.poll();
    }, this.pollingInterval);

    console.log('✅ Polling iniciado com sucesso!');
  }

  /**
   * Parar polling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Polling parado');
  }

  /**
   * Verificar se está rodando
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Executar uma verificação
   */
  private async poll(): Promise<void> {
    try {
      // MÉTODO 1: Buscar transações ativas do CVE (mais confiável)
      const transacoesAtivas = await cveService.getActiveTransactions();

      if (transacoesAtivas.length === 0) {
        console.log(`📊 [Polling] Nenhuma transação ativa via /transactions`);
      } else {
        console.log(`📊 [Polling] ${transacoesAtivas.length} transação(ões) ativa(s) no CVE`);
        
        // Processar cada transação
        for (const transacao of transacoesAtivas) {
          await this.processarTransacao(transacao);
        }
      }

      // MÉTODO 2: SEMPRE verificar status dos carregadores diretamente
      // Isso garante que carregadores que voltaram para Available sejam finalizados
      console.log(`🔍 [Polling] Verificando status de todos os carregadores...`);
      await this.verificarStatusCarregadores();

      // Limpar transações conhecidas antigas
      await this.limparTransacoesFinalizadas();

    } catch (error: any) {
      console.error('❌ [Polling] Erro ao buscar transações:', error.message);
      
      // Fallback: verificar status dos carregadores diretamente
      try {
        console.log(`🔄 [Polling] Usando fallback: verificando carregadores...`);
        await this.verificarStatusCarregadores();
      } catch (fallbackError: any) {
        console.error('❌ [Polling] Erro no fallback:', fallbackError.message);
      }
    }
  }

  /**
   * NOVO: Verificar status dos carregadores diretamente (extrai idTag dos heartbeats/status)
   * Este método é usado quando o endpoint de transações falha ou não retorna dados
   */
  private async verificarStatusCarregadores(): Promise<void> {
    try {
      const chargers = await cveService.getChargers();
      let carregadoresAtivos = 0;

      for (const charger of chargers) {
        const connector = charger.connectors?.[0];
        if (!connector) continue;

        const status = connector.lastStatus?.status;
        
        // CASO 1: Carregador ESTÁ CARREGANDO/OCUPADO
        if (status === 'Charging' || status === 'Occupied' || status === 'Preparing') {
          carregadoresAtivos++;
          
          // Tentar extrair idTag usando o novo método híbrido
          const idTag = await cveService.extractIdTagFromCharger(charger);
          
          if (idTag) {
            console.log(`✅ [Polling] Carregador ${charger.description} com idTag: ${idTag}`);
            
            // Buscar morador
            const morador = await MoradorModel.findByTag(idTag);
            
            if (morador) {
              console.log(`👤 [Polling] Morador identificado: ${morador.nome} (Apto ${morador.apartamento})`);
              
              // Verificar se já existe carregamento ativo
              const carregamentoExistente = await CarregamentoModel.findActiveByCharger(
                charger.uuid,
                connector.connectorId
              );
              
              if (!carregamentoExistente) {
                // Criar novo carregamento
                const carregamento = await CarregamentoModel.create({
                  moradorId: morador.id!,
                  chargerUuid: charger.uuid,
                  chargerName: charger.description || charger.chargeBoxId,
                  connectorId: connector.connectorId,
                  status: status === 'Charging' ? 'carregando' : 'iniciado',
                });
                
                console.log(`✅ [Polling] Novo carregamento registrado via status: ID ${carregamento.id}`);
              } else if (!carregamentoExistente.morador_id) {
                // Atualizar status e associar morador
                const newStatus = status === 'Charging' ? 'carregando' : 'iniciado';
                // Como não temos um método update genérico, vamos usar SQL direto
                const sql = 'UPDATE carregamentos SET morador_id = $1, status = $2 WHERE id = $3';
                const { query } = await import('../config/database');
                await query(sql, [morador.id!, newStatus, carregamentoExistente.id!]);
                console.log(`✅ [Polling] Carregamento ${carregamentoExistente.id} atualizado com morador`);
              }
            } else {
              console.warn(`⚠️  [Polling] Tag RFID ${idTag} não cadastrada`);
            }
          } else {
            console.log(`⚠️  [Polling] Carregador ${charger.description} ativo mas sem idTag identificável`);
            console.log(`   📊 Status: ${status}`);
            console.log(`   🔍 Connector lastStatus:`, JSON.stringify(connector.lastStatus, null, 2));
            console.log(`   🎯 idTag no connector:`, connector.lastStatus?.idTag || 'N/A');
          }
        } 
        // CASO 2: Carregador ESTÁ DISPONÍVEL - Finalizar carregamentos ativos
        else if (status === 'Available') {
          // Verificar se existe carregamento ativo para este carregador
          const carregamentoAtivo = await CarregamentoModel.findActiveByCharger(
            charger.uuid,
            connector.connectorId
          );
          
          if (carregamentoAtivo) {
            // Finalizar o carregamento
            await CarregamentoModel.updateStatus(carregamentoAtivo.id!, 'finalizado');
            console.log(`🏁 [Polling] Carregador ${charger.description} voltou para Available - Carregamento ${carregamentoAtivo.id} finalizado`);
          }
        }
      }
      
      if (carregadoresAtivos === 0) {
        console.log(`📊 [Polling] Nenhum carregador ativo no momento`);
      }
      
    } catch (error: any) {
      console.error('❌ [Polling] Erro ao verificar status dos carregadores:', error.message);
    }
  }

  /**
   * Processar uma transação ativa
   */
  private async processarTransacao(transacao: CVETransaction): Promise<void> {
    try {
      const transactionId = transacao.id;
      const chargerUuid = transacao.chargeBoxUuid;
      const connectorId = transacao.connectorId;
      const ocppIdTag = transacao.ocppIdTag;
      const chargerName = transacao.chargeBoxDescription;

      // Verificar se já processamos esta transação
      if (this.transacoesConhecidas.has(String(transactionId))) {
        // Já existe - apenas atualizar se necessário
        return;
      }

      console.log(`🔍 [Polling] Nova transação detectada: ${transactionId}`);
      console.log(`   🔌 Carregador: ${chargerName} (${chargerUuid})`);
      console.log(`   🎯 ocppIdTag: ${ocppIdTag}`);
      console.log(`   👤 Usuário CVE: ${transacao.userName || 'N/A'}`);
      console.log(`   🏠 Complemento: ${transacao.userAddressComplement || 'N/A'}`);

      // Buscar morador pela tag RFID (ocppIdTag)
      let morador = null;
      let moradorId = null;

      if (ocppIdTag) {
        morador = await MoradorModel.findByTag(ocppIdTag);
        if (morador) {
          moradorId = morador.id!;
          console.log(`✅ [Polling] Morador identificado no nosso BD: ${morador.nome} (Apto ${morador.apartamento})`);
        } else {
          console.warn(`⚠️  [Polling] Tag RFID "${ocppIdTag}" não cadastrada no nosso sistema`);
          console.log(`   💡 Sugestão: Cadastrar morador com tag_rfid = "${ocppIdTag}"`);
          if (transacao.userName) {
            console.log(`   📝 Nome no CVE: ${transacao.userName}`);
          }
          if (transacao.userAddressComplement) {
            console.log(`   🏠 Apartamento no CVE: ${transacao.userAddressComplement}`);
          }
        }
      } else if (transacao.ocppTagPk) {
        // FALLBACK: Buscar morador pelo ocppTagPk na tabela de mapeamento manual
        console.log(`🔄 [Polling] ocppIdTag vazio, tentando mapeamento por ocppTagPk: ${transacao.ocppTagPk}`);
        
        try {
          const pool = await import('../config/database');
          const result = await pool.default.query(
            `SELECT m.* FROM moradores m
             INNER JOIN tag_pk_mapping tpm ON tpm.morador_id = m.id
             WHERE tpm.ocpp_tag_pk = $1`,
            [transacao.ocppTagPk]
          );
          
          if (result.rows.length > 0) {
            morador = result.rows[0];
            moradorId = morador.id;
            console.log(`✅ [Polling] Morador identificado via ocppTagPk: ${morador.nome} (Apto ${morador.apartamento})`);
          } else {
            console.warn(`⚠️  [Polling] ocppTagPk ${transacao.ocppTagPk} não mapeado`);
            console.log(`   💡 Sugestão: Adicionar mapeamento manual na tabela tag_pk_mapping`);
            if (transacao.userName) {
              console.log(`   📝 Nome no CVE: ${transacao.userName}`);
            }
          }
        } catch (error) {
          console.error(`❌ [Polling] Erro ao buscar mapeamento:`, error);
        }
      } else {
        console.warn(`⚠️  [Polling] Transação sem ocppIdTag e sem ocppTagPk`);
      }

      // Verificar se já existe carregamento para este carregador/conector
      const carregamentoExistente = await CarregamentoModel.findActiveByCharger(
        chargerUuid,
        connectorId
      );

      let carregamentoId: number;

      if (carregamentoExistente) {
        // Já existe - atualizar morador_id se necessário
        carregamentoId = carregamentoExistente.id!;
        
        if (moradorId && !carregamentoExistente.morador_id) {
          // Atualizar com o morador identificado
          const { query } = await import('../config/database');
          await query('UPDATE carregamentos SET morador_id = $1 WHERE id = $2', [moradorId, carregamentoId]);
          console.log(`✅ [Polling] Carregamento ${carregamentoId} atualizado com morador`);
        }
      } else {
        // Criar novo registro de carregamento
        const carregamento = await CarregamentoModel.create({
          moradorId,
          chargerUuid,
          chargerName,
          connectorId,
          status: 'carregando',
        });

        carregamentoId = carregamento.id!;
        console.log(`✅ [Polling] Novo carregamento registrado: ID ${carregamentoId}`);
        console.log(`   📊 Duração (CVE): ${transacao.durationHumanReadable || 'N/A'}`);
        console.log(`   ⚡ Energia (CVE): ${transacao.energyHumanReadable || 'Em andamento'}`);

        // Enviar notificação (se morador tem notificações ativas)
        if (morador && morador.notificacoes_ativas && morador.telefone) {
          try {
            const { notificationService } = await import('./NotificationService');
            const location = `${transacao.addressStreet}, ${transacao.addressCity}`;
            
            await notificationService.notificarInicio(
              moradorId!,
              chargerName,
              location
            );
            
            await CarregamentoModel.markNotificationSent(carregamentoId, 'inicio');
            console.log(`📱 [Polling] Notificação de início enviada para ${morador.nome}`);
          } catch (error) {
            console.error('❌ [Polling] Erro ao enviar notificação:', error);
          }
        }
      }

      // Registrar transação como conhecida
      this.transacoesConhecidas.set(String(transactionId), carregamentoId);

      // 🆕 MONITORAR EVENTOS (ociosidade, bateria cheia, interrupção)
      if (moradorId && morador && morador.notificacoes_ativas) {
        await this.monitorarEventosCarregamento(carregamentoId, transacao);
      }

    } catch (error: any) {
      console.error('❌ [Polling] Erro ao processar transação:', error.message);
    }
  }

  /**
   * 🆕 Monitorar eventos inteligentes de carregamento
   * Detecta: ociosidade, bateria cheia, interrupção
   */
  private async monitorarEventosCarregamento(
    carregamentoId: number,
    transacao: CVETransaction
  ): Promise<void> {
    try {
      const { query } = await import('../config/database');
      
      // Buscar carregamento atual com flags de notificação
      const result = await query(
        `SELECT * FROM carregamentos WHERE id = $1`,
        [carregamentoId]
      );
      
      if (result.length === 0) return;
      const carregamento = result[0];
      
      // Extrair potência atual dos MeterValues (se disponível)
      const powerAtual = this.extrairPotencia(transacao);
      
      if (powerAtual === null) {
        // Sem dados de potência, não pode monitorar
        return;
      }
      
      // Buscar configurações dos templates
      const templates = await query(
        `SELECT tipo, tempo_minutos, power_threshold_w, ativo 
         FROM templates_notificacao 
         WHERE tipo IN ('inicio_ociosidade', 'bateria_cheia')
           AND ativo = true`
      );
      
      const configOciosidade = templates.find((t: any) => t.tipo === 'inicio_ociosidade');
      const configBateria = templates.find((t: any) => t.tipo === 'bateria_cheia');
      
      if (!configOciosidade && !configBateria) {
        // Nenhuma notificação de evento ativa
        return;
      }
      
      const threshold = configOciosidade?.power_threshold_w || 10; // Default 10W
      
      // ========================================
      // CASO 2: INÍCIO DE OCIOSIDADE (IMEDIATO)
      // ========================================
      if (
        configOciosidade &&
        powerAtual <= threshold &&
        carregamento.ultimo_power_w > threshold &&
        !carregamento.notificacao_ociosidade_enviada
      ) {
        console.log(`⚠️  [Polling] Ociosidade detectada no carregamento ${carregamentoId}`);
        console.log(`   Power atual: ${powerAtual}W | Threshold: ${threshold}W`);
        
        try {
          const { notificationService } = await import('./NotificationService');
          const morador = await MoradorModel.findById(carregamento.morador_id);
          
          if (morador) {
            await notificationService.enviarNotificacao(
              'inicio_ociosidade',
              carregamento.morador_id,
              {
                charger: carregamento.charger_name,
                energia: (transacao.energyKwh || 0).toFixed(2),
                data: new Date().toLocaleString('pt-BR'),
              }
            );
            
            await query(
              `UPDATE carregamentos 
               SET notificacao_ociosidade_enviada = TRUE,
                   primeiro_ocioso_em = NOW()
               WHERE id = $1`,
              [carregamentoId]
            );
            
            console.log(`📱 [Polling] Notificação de ociosidade enviada`);
          }
        } catch (error) {
          console.error('❌ [Polling] Erro ao enviar notificação de ociosidade:', error);
        }
      }
      
      // ========================================
      // CASO 3: BATERIA CHEIA (após X minutos em 0W)
      // ========================================
      if (
        configBateria &&
        powerAtual <= threshold && 
        carregamento.primeiro_ocioso_em &&
        !carregamento.notificacao_bateria_cheia_enviada
      ) {
        const tempoEspera = configBateria.tempo_minutos || 3; // Default 3 min
        const minutosOcioso = (
          Date.now() - new Date(carregamento.primeiro_ocioso_em).getTime()
        ) / 60000;
        
        if (minutosOcioso >= tempoEspera) {
          console.log(`🔋 [Polling] Bateria cheia detectada no carregamento ${carregamentoId}`);
          console.log(`   Tempo ocioso: ${minutosOcioso.toFixed(1)} min | Necessário: ${tempoEspera} min`);
          
          try {
            const { notificationService } = await import('./NotificationService');
            const morador = await MoradorModel.findById(carregamento.morador_id);
            
            if (morador) {
              await notificationService.enviarNotificacao(
                'bateria_cheia',
                carregamento.morador_id,
                {
                  charger: carregamento.charger_name,
                  energia: (transacao.energyKwh || 0).toFixed(2),
                  duracao: transacao.durationHumanReadable || 'N/A',
                }
              );
              
              await query(
                `UPDATE carregamentos 
                 SET notificacao_bateria_cheia_enviada = TRUE
                 WHERE id = $1`,
                [carregamentoId]
              );
              
              console.log(`📱 [Polling] Notificação de bateria cheia enviada`);
            }
          } catch (error) {
            console.error('❌ [Polling] Erro ao enviar notificação de bateria cheia:', error);
          }
        }
      }
      
      // Atualizar ultimo_power_w para próxima comparação
      await query(
        'UPDATE carregamentos SET ultimo_power_w = $1 WHERE id = $2',
        [powerAtual, carregamentoId]
      );
      
    } catch (error: any) {
      console.error('❌ [Polling] Erro ao monitorar eventos:', error.message);
    }
  }

  /**
   * 🆕 Extrair potência (Power.Active.Import) dos MeterValues
   */
  private extrairPotencia(transacao: CVETransaction): number | null {
    try {
      // Tentar obter do campo direto (se a API retornar)
      if (transacao.powerW !== undefined && transacao.powerW !== null) {
        return transacao.powerW;
      }
      
      // Tentar extrair de meterValues (formato comum do OCPP)
      if (transacao.meterValues && Array.isArray(transacao.meterValues)) {
        for (const meterValue of transacao.meterValues) {
          if (meterValue.sampledValue && Array.isArray(meterValue.sampledValue)) {
            for (const sample of meterValue.sampledValue) {
              if (
                sample.measurand === 'Power.Active.Import' &&
                sample.value !== undefined
              ) {
                return parseFloat(sample.value);
              }
            }
          }
        }
      }
      
      return null; // Sem dados de potência
    } catch (error) {
      console.error('❌ [Polling] Erro ao extrair potência:', error);
      return null;
    }
  }

  /**
   * Limpar transações que foram finalizadas
   */
  private async limparTransacoesFinalizadas(): Promise<void> {
    try {
      // Buscar todas as transações conhecidas
      if (this.transacoesConhecidas.size === 0) {
        return;
      }

      // Buscar transações ativas do CVE
      const transacoesAtivas = await cveService.getActiveTransactions();
      const idsAtivos = new Set(
        transacoesAtivas.map(t => String(t.id))
      );

      // Encontrar transações que foram finalizadas
      const transacoesFinalizadas: string[] = [];
      
      for (const [transactionId, carregamentoId] of this.transacoesConhecidas.entries()) {
        if (!idsAtivos.has(transactionId)) {
          transacoesFinalizadas.push(transactionId);
          
          // Atualizar status para finalizado
          try {
            await CarregamentoModel.updateStatus(carregamentoId, 'finalizado');
            console.log(`🏁 [Polling] Carregamento ${carregamentoId} finalizado`);
            
            // Buscar dados do carregamento para notificação
            const carregamento = await CarregamentoModel.findById(carregamentoId);
            if (carregamento && carregamento.morador_id) {
              // Enviar notificação de fim (opcional)
              // TODO: Buscar dados de energia consumida da API CVE
            }
          } catch (error) {
            console.error(`❌ [Polling] Erro ao finalizar carregamento ${carregamentoId}:`, error);
          }
        }
      }

      // Remover transações finalizadas do mapa
      transacoesFinalizadas.forEach(id => {
        this.transacoesConhecidas.delete(id);
      });

      if (transacoesFinalizadas.length > 0) {
        console.log(`🧹 [Polling] ${transacoesFinalizadas.length} transação(ões) finalizada(s) removida(s)`);
      }

    } catch (error: any) {
      console.error('❌ [Polling] Erro ao limpar transações finalizadas:', error.message);
    }
  }

  /**
   * Obter estatísticas do polling
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      pollingInterval: this.pollingInterval,
      transacoesConhecidas: this.transacoesConhecidas.size,
    };
  }
}

// Singleton
export const pollingService = new PollingService();


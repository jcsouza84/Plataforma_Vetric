/**
 * 🔄 VETRIC - Serviço WebSocket para monitoramento em tempo real
 */

import { Client, StompConfig } from '@stomp/stompjs';
import { config } from '../config/env';
import { MoradorModel } from '../models/Morador';
import { CarregamentoModel } from '../models/Carregamento';
import { notificationService } from './NotificationService';
import { cveService } from '../services/CVEService';

export class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  constructor() {}

  /**
   * Conectar ao WebSocket STOMP da CVE-PRO
   */
  async connect(token: string): Promise<void> {
    if (this.connected) {
      console.log('⚠️  WebSocket já está conectado');
      return;
    }

    console.log('\n🔄 Conectando ao WebSocket CVE-PRO...');

    const wsUrl = config.cve.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');

    const stompConfig: StompConfig = {
      brokerURL: `${wsUrl}/stomp-endpoint?token=${token}`,
      
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      debug: (str: string) => {
        if (process.env.DEBUG_WS === 'true') {
          console.log(`[WS DEBUG] ${str}`);
        }
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('✅ WebSocket conectado com sucesso!');
        this.subscribeToTopics();
      },

      onStompError: (frame) => {
        console.error('❌ Erro STOMP:', frame.headers['message']);
        console.error('Detalhes:', frame.body);
        this.connected = false;
      },

      onWebSocketClose: () => {
        this.connected = false;
        console.warn('⚠️  WebSocket desconectado');
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        } else {
          console.error('❌ Máximo de tentativas de reconexão atingido');
        }
      },

      onWebSocketError: (error) => {
        console.error('❌ Erro no WebSocket:', error);
        this.connected = false;
      },
    };

    this.client = new Client(stompConfig);
    this.client.activate();
  }

  /**
   * Inscrever-se nos tópicos de eventos
   */
  private subscribeToTopics(): void {
    if (!this.client) return;

    console.log('\n📡 Inscrevendo-se nos tópicos...\n');

    // Tópico: Status dos carregadores
    this.client.subscribe('/topic/status', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.handleStatusUpdate(data);
      } catch (error) {
        console.error('❌ Erro ao processar mensagem de status:', error);
      }
    });

    // Tópico: Início de transação (carregamento)
    this.client.subscribe('/topic/transaction/start', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.handleTransactionStart(data);
      } catch (error) {
        console.error('❌ Erro ao processar início de transação:', error);
      }
    });

    // Tópico: Fim de transação
    this.client.subscribe('/topic/transaction/stop', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.handleTransactionStop(data);
      } catch (error) {
        console.error('❌ Erro ao processar fim de transação:', error);
      }
    });

    // Tópico: Erros (StatusNotification com ErrorCode)
    this.client.subscribe('/topic/error', (message) => {
      try {
        const data = JSON.parse(message.body);
        this.handleError(data);
      } catch (error) {
        console.error('❌ Erro ao processar erro de carregador:', error);
      }
    });

    console.log('✅ Inscrições realizadas com sucesso!\n');
  }

  /**
   * Processar atualização de status do carregador
   */
  private async handleStatusUpdate(data: any): Promise<void> {
    console.log(`📊 Status atualizado: ${data.chargeBoxId} - Conector ${data.connectorId} - ${data.status}`);
    
    // Detectar estado OCIOSO (SuspendedEV ou SuspendedEVSE)
    if (data.status === 'SuspendedEV' || data.status === 'SuspendedEVSE') {
      await this.handleIdleState(data);
    }

    // Detectar estado DISPONÍVEL após estar ocupado
    if (data.status === 'Available') {
      await this.handleAvailable(data);
    }
    
    // Aqui você pode emitir eventos para o frontend via Socket.IO, se necessário
    // Ex: io.emit('charger:status', data);
  }

  /**
   * Processar início de carregamento
   */
  private async handleTransactionStart(data: any): Promise<void> {
    console.log('\n🔋 INÍCIO DE CARREGAMENTO DETECTADO!');
    console.log(JSON.stringify(data, null, 2));

    try {
      // Extrair informações
      const chargerUuid = data.chargeBoxUuid || data.uuid;
      const connectorId = data.connectorId || 1;
      const idTag = data.idTag; // Tag RFID do usuário

      // Buscar carregador
      const charger = await cveService.getChargePointByUuid(chargerUuid);
      if (!charger) {
        console.warn(`⚠️  Carregador ${chargerUuid} não encontrado`);
        return;
      }

      // Buscar morador pela tag RFID
      let morador = null;
      let moradorId = null;
      
      if (idTag) {
        morador = await MoradorModel.findByTag(idTag);
        if (morador) {
          moradorId = morador.id!;
          console.log(`👤 Morador identificado: ${morador.nome} (Apto ${morador.apartamento})`);
        } else {
          console.warn(`⚠️  Tag RFID ${idTag} não cadastrada`);
        }
      }

      // Criar registro de carregamento
      const carregamento = await CarregamentoModel.create({
        moradorId,
        chargerUuid,
        chargerName: charger.description,
        connectorId,
        status: 'iniciado',
      });

      console.log(`✅ Carregamento registrado: ID ${carregamento.id}`);

      // Enviar notificação (se morador cadastrado e com notificações ativas)
      if (morador && morador.notificacoes_ativas) {
        const notificationSent = await notificationService.notificarInicio(
          moradorId!,
          charger.description,
          `${charger.address.street}, ${charger.address.city}`
        );

        if (notificationSent) {
          await CarregamentoModel.markNotificationSent(carregamento.id!, 'inicio');
          console.log('✅ Notificação de início enviada');
        }
      }

    } catch (error) {
      console.error('❌ Erro ao processar início de carregamento:', error);
    }
  }

  /**
   * Processar fim de carregamento
   */
  private async handleTransactionStop(data: any): Promise<void> {
    console.log('\n🏁 FIM DE CARREGAMENTO DETECTADO!');
    console.log(JSON.stringify(data, null, 2));

    try {
      const chargerUuid = data.chargeBoxUuid || data.uuid;
      const connectorId = data.connectorId || 1;
      const energiaKwh = data.meterStop ? (data.meterStop / 1000) : 0; // Converter Wh para kWh
      const duracaoSegundos = data.duration || 0;
      const duracaoMinutos = Math.round(duracaoSegundos / 60);

      // Buscar carregamento ativo
      const carregamento = await CarregamentoModel.findActiveByCharger(chargerUuid, connectorId);
      
      if (!carregamento) {
        console.warn('⚠️  Nenhum carregamento ativo encontrado para finalizar');
        return;
      }

      console.log(`📊 Carregamento ID ${carregamento.id}`);
      console.log(`   Energia: ${energiaKwh.toFixed(2)} kWh`);
      console.log(`   Duração: ${duracaoMinutos} minutos`);

      // Atualizar registro
      await CarregamentoModel.updateStatus(
        carregamento.id!,
        'finalizado',
        energiaKwh,
        duracaoMinutos
      );

      console.log('✅ Carregamento finalizado no banco de dados');

      // Enviar notificação de fim (se morador cadastrado)
      if (carregamento.morador_id) {
        // Buscar charger para pegar o nome
        const charger = await cveService.getChargePointByUuid(chargerUuid);
        const chargerNome = charger?.description || 'Carregador';
        
        // Calcular custo (exemplo: R$ 0,75/kWh)
        const custoKwh = 0.75;
        const custoTotal = energiaKwh * custoKwh;
        
        // Formatar duração
        const horas = Math.floor(duracaoMinutos / 60);
        const mins = duracaoMinutos % 60;
        const duracaoFormatada = horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
        
        const notificationSent = await notificationService.notificarFim(
          carregamento.morador_id,
          chargerNome,
          energiaKwh,
          duracaoFormatada,
          custoTotal
        );

        if (notificationSent) {
          await CarregamentoModel.markNotificationSent(carregamento.id!, 'fim');
          console.log('✅ Notificação de fim enviada');
        }
      }

    } catch (error) {
      console.error('❌ Erro ao processar fim de carregamento:', error);
    }
  }

  /**
   * Processar erro de carregamento
   */
  private async handleError(data: any): Promise<void> {
    console.log('\n⚠️ ERRO DETECTADO!');
    console.log(JSON.stringify(data, null, 2));

    try {
      const chargerUuid = data.chargeBoxUuid || data.uuid;
      const connectorId = data.connectorId || 1;
      const errorCode = data.errorCode || 'Erro desconhecido';

      // Buscar carregador
      const charger = await cveService.getChargePointByUuid(chargerUuid);
      if (!charger) {
        console.warn(`⚠️  Carregador ${chargerUuid} não encontrado`);
        return;
      }

      // Buscar carregamento ativo
      const carregamento = await CarregamentoModel.findActiveByCharger(chargerUuid, connectorId);
      
      if (!carregamento || !carregamento.morador_id) {
        console.warn('⚠️  Nenhum carregamento ativo com morador associado');
        return;
      }

      // Enviar notificação de erro
      const notificationSent = await notificationService.notificarErro(
        carregamento.morador_id,
        charger.description,
        errorCode
      );

      if (notificationSent) {
        console.log('✅ Notificação de erro enviada');
      }

    } catch (error) {
      console.error('❌ Erro ao processar erro de carregamento:', error);
    }
  }

  /**
   * Processar estado OCIOSO (carro conectado, mas não carregando)
   */
  private async handleIdleState(data: any): Promise<void> {
    console.log('\n💤 CARREGADOR OCIOSO DETECTADO!');
    console.log(JSON.stringify(data, null, 2));

    try {
      const chargerUuid = data.chargeBoxUuid || data.uuid;
      const connectorId = data.connectorId || 1;

      // Buscar carregador
      const charger = await cveService.getChargePointByUuid(chargerUuid);
      if (!charger) {
        console.warn(`⚠️  Carregador ${chargerUuid} não encontrado`);
        return;
      }

      // Buscar carregamento ativo
      const carregamento = await CarregamentoModel.findActiveByCharger(chargerUuid, connectorId);
      
      if (!carregamento || !carregamento.morador_id) {
        console.warn('⚠️  Nenhum carregamento ativo com morador associado');
        return;
      }

      // Calcular tempo ocioso (exemplo: 30 minutos)
      const tempoOcioso = 30; // TODO: Calcular tempo real com base no timestamp

      // Enviar notificação de ocioso (apenas se já passou um tempo significativo)
      const notificationSent = await notificationService.notificarOcioso(
        carregamento.morador_id,
        charger.description,
        tempoOcioso
      );

      if (notificationSent) {
        console.log('✅ Notificação de ocioso enviada');
      }

    } catch (error) {
      console.error('❌ Erro ao processar estado ocioso:', error);
    }
  }

  /**
   * Processar carregador DISPONÍVEL (após estar ocupado)
   */
  private async handleAvailable(data: any): Promise<void> {
    console.log('\n✨ CARREGADOR DISPONÍVEL!');
    console.log(JSON.stringify(data, null, 2));

    try {
      const chargerUuid = data.chargeBoxUuid || data.uuid;

      // Buscar carregador
      const charger = await cveService.getChargePointByUuid(chargerUuid);
      if (!charger) {
        console.warn(`⚠️  Carregador ${chargerUuid} não encontrado`);
        return;
      }

      // Buscar todos os moradores com notificações ativas
      const moradores = await MoradorModel.findAll();
      const moradoresAtivos = moradores.filter((m) => m.notificacoes_ativas && m.telefone);

      // Enviar notificação para moradores ativos (opcional: filtrar apenas alguns)
      // Por exemplo, enviar apenas para os 5 primeiros moradores da lista
      const moradoresParaNotificar = moradoresAtivos.slice(0, 3); // Enviar para 3 primeiros

      for (const morador of moradoresParaNotificar) {
        if (morador.id) {
          await notificationService.notificarDisponivel(morador.id, charger.description);
        }
      }

      console.log(`✅ Notificações de disponível enviadas para ${moradoresParaNotificar.length} moradores`);

    } catch (error) {
      console.error('❌ Erro ao processar carregador disponível:', error);
    }
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    if (this.client) {
      console.log('\n👋 Desconectando WebSocket...');
      this.client.deactivate();
      this.connected = false;
      console.log('✅ WebSocket desconectado');
    }
  }

  /**
   * Verificar se está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton
export const webSocketService = new WebSocketService();


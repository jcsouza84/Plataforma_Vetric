import { Client, StompSubscription, IFrame, IMessage } from '@stomp/stompjs';
import WebSocket from 'ws';
import { consoleLogger, rawLogger } from './logger';
import { CVEAuth } from './auth';
import { Charger, WebSocketMessage } from './types';

/**
 * Cliente WebSocket STOMP para CVE-PRO
 * Conecta, subscreve aos tópicos e captura todas as mensagens
 */

export class CVEWebSocketClient {
  private client: Client | null = null;
  private auth: CVEAuth;
  private chargers: Charger[];
  private subscriptions: StompSubscription[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private messagesReceived: number = 0;

  constructor(auth: CVEAuth, chargers: Charger[]) {
    this.auth = auth;
    this.chargers = chargers;
  }

  /**
   * Conecta ao WebSocket STOMP do CVE-PRO
   */
  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      consoleLogger.section('CONEXÃO WEBSOCKET STOMP');

      if (!this.auth.isLoggedIn()) {
        consoleLogger.error('Não é possível conectar: usuário não autenticado');
        resolve(false);
        return;
      }

      const sessionInfo = this.auth.getSessionInfo();
      if (!sessionInfo) {
        consoleLogger.error('Não foi possível obter informações da sessão');
        resolve(false);
        return;
      }

      // Construir URL do WebSocket
      // SockJS/STOMP geralmente usa um path específico
      const wsBaseUrl = process.env.CVEPRO_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://');
      
      // Gerar IDs aleatórios para SockJS (formato: /ws/{server-id}/{session-id}/websocket)
      const serverId = Math.floor(Math.random() * 1000);
      const sessionId = Array.from({length: 8}, () => 
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      const wsUrl = `${wsBaseUrl}/ws/${serverId}/${sessionId}/websocket`;

      consoleLogger.info('Conectando ao WebSocket STOMP...', { url: wsUrl });
      consoleLogger.debug(`Server ID: ${serverId}, Session ID: ${sessionId}`);

      // Preparar headers para WebSocket
      // IMPORTANTE: Origin deve ser o domínio do frontend (mundologic), não o da API (cs)
      const wsHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Origin': 'https://mundologic.intelbras-cve-pro.com.br',
        'Host': 'cs.intelbras-cve-pro.com.br',
      };

      // Adicionar cookies se disponíveis (CVE-PRO pode usar cookies para WebSocket)
      const cookieString = this.auth.getCookieString();
      if (cookieString) {
        wsHeaders['Cookie'] = cookieString;
        consoleLogger.debug('Usando cookies para autenticação WebSocket');
      }

      // Token JWT pode ser necessário em alguns casos
      if (sessionInfo.headers['authorization']) {
        wsHeaders['Authorization'] = sessionInfo.headers['authorization'];
        consoleLogger.debug('Token JWT adicionado aos headers WebSocket');
      }

      // Preparar headers STOMP para o frame CONNECT
      const stompHeaders: Record<string, string> = {
        'accept-version': '1.0,1.1,1.2',
        'heart-beat': '4000,4000',
      };

      // Adicionar token de autenticação nos headers STOMP
      if (sessionInfo.headers['authorization']) {
        // Extrair apenas o token (sem o "Bearer ")
        const token = sessionInfo.headers['authorization'].replace('Bearer ', '');
        stompHeaders['Authorization'] = `Bearer ${token}`;
        stompHeaders['X-Authorization'] = token;
        consoleLogger.debug('Token JWT adicionado aos headers STOMP');
      }

      // Configurar cliente STOMP
      this.client = new Client({
        webSocketFactory: () => {
          // Criar WebSocket com headers customizados
          const ws = new WebSocket(wsUrl, {
            headers: wsHeaders,
          });

          // Logar eventos do WebSocket
          ws.on('open', () => {
            consoleLogger.debug('WebSocket aberto (raw)');
          });

          ws.on('error', (error) => {
            consoleLogger.error('Erro no WebSocket (raw)', error);
          });

          ws.on('close', (code, reason) => {
            consoleLogger.warn(`WebSocket fechado: ${code} - ${reason}`);
          });

          return ws as any;
        },

        // Headers STOMP para o frame CONNECT
        connectHeaders: stompHeaders,

        // Configurações do cliente STOMP
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        // Debug habilitado
        debug: (str: string) => {
          if (process.env.DEBUG_MODE === 'true') {
            consoleLogger.debug(`STOMP: ${str}`);
          }
        },

        // Callback de conexão bem-sucedida
        onConnect: (frame: IFrame) => {
          consoleLogger.success('Conectado ao STOMP! ✓');
          consoleLogger.debug('Frame CONNECT:', frame);

          // Salvar frame de conexão
          rawLogger.saveMessage({
            timestamp: new Date().toISOString(),
            type: 'CONNECT',
            frame: frame,
          });

          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Subscrever aos tópicos
          this.subscribeToTopics();

          resolve(true);
        },

        // Callback de erro na conexão STOMP
        onStompError: (frame: IFrame) => {
          consoleLogger.error('Erro STOMP:', frame);
          rawLogger.saveMessage({
            timestamp: new Date().toISOString(),
            type: 'ERROR',
            frame: frame,
          });
          resolve(false);
        },

        // Callback de desconexão
        onDisconnect: () => {
          consoleLogger.warn('Desconectado do STOMP');
          this.isConnected = false;

          // Tentar reconectar se configurado
          if (process.env.AUTO_RECONNECT === 'true' && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            consoleLogger.info(`Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          }
        },

        // Callback de erro no WebSocket
        onWebSocketError: (event: any) => {
          consoleLogger.error('Erro no WebSocket:', event);
        },
      });

      // Ativar conexão
      try {
        this.client.activate();
      } catch (error) {
        consoleLogger.error('Erro ao ativar cliente STOMP', error);
        resolve(false);
      }
    });
  }

  /**
   * Subscreve aos tópicos dos carregadores
   */
  private subscribeToTopics() {
    if (!this.client || !this.isConnected) {
      consoleLogger.error('Cliente não conectado, não é possível subscrever');
      return;
    }

    consoleLogger.section('SUBSCRIÇÃO AOS TÓPICOS');
    consoleLogger.info(`Subscrevendo aos tópicos de ${this.chargers.length} carregadores...`);

    for (const charger of this.chargers) {
      for (const connectorId of charger.connectors) {
        // Formato do tópico descoberto: /topic/status/chargeBox/{ID}/connector/{NUM}
        const topic = `/topic/status/chargeBox/${charger.id}/connector/${connectorId}`;

        consoleLogger.info(`Subscrevendo: ${topic}`, {
          charger: charger.name,
          connector: connectorId,
        });

        try {
          const subscription = this.client.subscribe(
            topic,
            (message: IMessage) => this.handleMessage(message, charger, connectorId),
            {
              // Headers adicionais se necessário
              ack: 'auto',
            }
          );

          this.subscriptions.push(subscription);

          // Salvar log da subscrição
          rawLogger.saveMessage({
            timestamp: new Date().toISOString(),
            type: 'SUBSCRIBE',
            topic: topic,
            charger: charger.name,
            chargerId: charger.id,
            connectorId: connectorId,
          });

          consoleLogger.success(`✓ Subscrito: ${charger.name} - Conector ${connectorId}`);
        } catch (error) {
          consoleLogger.error(`Erro ao subscrever ao tópico ${topic}`, error);
        }
      }
    }

    // Também subscrever a tópicos genéricos que podem existir
    this.subscribeToGenericTopics();

    consoleLogger.success(`\nTotal de ${this.subscriptions.length} subscrições ativas ✓`);
    consoleLogger.info('Aguardando mensagens... (Pressione CTRL+C para sair)\n');
  }

  /**
   * Subscreve a tópicos genéricos que podem conter informações úteis
   */
  private subscribeToGenericTopics() {
    if (!this.client) return;

    const genericTopics = [
      '/topic/status',
      '/topic/notifications',
      '/user/queue/status',
      '/user/queue/notifications',
    ];

    for (const topic of genericTopics) {
      try {
        const subscription = this.client.subscribe(
          topic,
          (message: IMessage) => this.handleGenericMessage(message, topic)
        );

        this.subscriptions.push(subscription);
        consoleLogger.debug(`Subscrito ao tópico genérico: ${topic}`);
      } catch (error) {
        // Ignorar erros em tópicos genéricos (podem não existir)
        consoleLogger.debug(`Tópico genérico ${topic} não disponível`);
      }
    }
  }

  /**
   * Trata mensagens recebidas dos carregadores
   */
  private handleMessage(message: IMessage, charger: Charger, connectorId: number) {
    this.messagesReceived++;

    const timestamp = new Date().toISOString();
    
    // Parse do body (pode ser JSON ou texto)
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(message.body);
    } catch {
      parsedBody = message.body;
    }

    // Log no console
    consoleLogger.websocket('RECEIVE', `[${charger.name}] Conector ${connectorId}`, {
      headers: message.headers,
      body: parsedBody,
    });

    // Salvar mensagem completa
    const fullMessage: WebSocketMessage = {
      timestamp,
      type: 'MESSAGE',
      destination: message.headers.destination,
      body: parsedBody,
      headers: message.headers,
    };

    rawLogger.saveMessage({
      ...fullMessage,
      charger: charger.name,
      chargerId: charger.id,
      connectorId: connectorId,
    });

    // Exibir resumo a cada 10 mensagens
    if (this.messagesReceived % 10 === 0) {
      consoleLogger.stats();
    }
  }

  /**
   * Trata mensagens de tópicos genéricos
   */
  private handleGenericMessage(message: IMessage, topic: string) {
    const timestamp = new Date().toISOString();
    
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(message.body);
    } catch {
      parsedBody = message.body;
    }

    consoleLogger.websocket('RECEIVE', `[GENERIC] ${topic}`, { body: parsedBody });

    rawLogger.saveMessage({
      timestamp,
      type: 'GENERIC_MESSAGE',
      topic: topic,
      destination: message.headers.destination,
      body: parsedBody,
      headers: message.headers,
    });
  }

  /**
   * Desconecta do WebSocket
   */
  async disconnect() {
    if (this.client) {
      consoleLogger.info('Desconectando...');
      
      // Desinscrever de todos os tópicos
      for (const subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
      this.subscriptions = [];

      // Desativar cliente
      await this.client.deactivate();
      this.isConnected = false;
      
      consoleLogger.success('Desconectado ✓');
    }
  }

  /**
   * Retorna se está conectado
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Retorna número de mensagens recebidas
   */
  getMessagesCount(): number {
    return this.messagesReceived;
  }
}


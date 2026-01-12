import axios, { AxiosInstance } from 'axios';

/**
 * Serviço para integração com Evolution API
 * 
 * @example
 * ```typescript
 * const whatsapp = new EvolutionAPIService();
 * 
 * // Enviar mensagem
 * await whatsapp.sendText('5511999999999', 'Olá!');
 * 
 * // Verificar status
 * const isOnline = await whatsapp.isConnected();
 * ```
 */

export interface EvolutionConfig {
  baseUrl?: string;
  apiKey?: string;
  instanceName?: string;
}

export interface SendTextParams {
  number: string;
  text: string;
}

export interface SendMediaParams {
  number: string;
  mediaUrl: string;
  caption?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export interface EvolutionInstance {
  id: string;
  name: string;
  connectionStatus: string;
  number: string;
  profileName: string;
  token: string;
  _count: {
    Message: number;
    Contact: number;
    Chat: number;
  };
}

export class EvolutionAPIService {
  private client: AxiosInstance;
  private instanceName: string;

  constructor(config?: EvolutionConfig) {
    const baseUrl = config?.baseUrl || 
      process.env.EVOLUTION_API_URL || 
      'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me';
    
    const apiKey = config?.apiKey || 
      process.env.EVOLUTION_API_KEY || 
      't1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==';
    
    this.instanceName = config?.instanceName || 
      process.env.EVOLUTION_INSTANCE_NAME || 
      'Vetric Bot';

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Listar todas as instâncias disponíveis
   */
  async listInstances(): Promise<EvolutionInstance[]> {
    const response = await this.client.get('/instance/fetchInstances');
    return response.data;
  }

  /**
   * Verificar se a instância está conectada
   */
  async isConnected(): Promise<boolean> {
    try {
      const response = await this.client.get(
        `/instance/connectionState/${encodeURIComponent(this.instanceName)}`
      );
      return response.data.instance.state === 'open';
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter estado da conexão
   */
  async getConnectionState() {
    const response = await this.client.get(
      `/instance/connectionState/${encodeURIComponent(this.instanceName)}`
    );
    return response.data;
  }

  /**
   * Enviar mensagem de texto
   * 
   * @param number - Número do destinatário (formato: 5511999999999)
   * @param text - Texto da mensagem (suporta markdown WhatsApp)
   * 
   * @example
   * ```typescript
   * await whatsapp.sendText('5511999999999', 'Olá! *Negrito* _Itálico_');
   * ```
   */
  async sendText(number: string, text: string) {
    const response = await this.client.post(
      `/message/sendText/${encodeURIComponent(this.instanceName)}`,
      { number, text }
    );
    return response.data;
  }

  /**
   * Enviar mídia (imagem, vídeo, áudio, documento)
   * 
   * @example
   * ```typescript
   * await whatsapp.sendMedia({
   *   number: '5511999999999',
   *   mediaUrl: 'https://exemplo.com/imagem.jpg',
   *   caption: 'Legenda da imagem',
   *   mediaType: 'image'
   * });
   * ```
   */
  async sendMedia(params: SendMediaParams) {
    const response = await this.client.post(
      `/message/sendMedia/${encodeURIComponent(this.instanceName)}`,
      {
        number: params.number,
        media: params.mediaUrl,
        caption: params.caption || '',
        mediatype: params.mediaType || 'image'
      }
    );
    return response.data;
  }

  /**
   * Enviar localização
   */
  async sendLocation(number: string, latitude: number, longitude: number, name?: string) {
    const response = await this.client.post(
      `/message/sendLocation/${encodeURIComponent(this.instanceName)}`,
      {
        number,
        latitude,
        longitude,
        name: name || 'Localização'
      }
    );
    return response.data;
  }

  /**
   * Buscar todos os contatos
   */
  async getAllContacts() {
    const response = await this.client.get(
      `/chat/fetchAllContacts/${encodeURIComponent(this.instanceName)}`
    );
    return response.data;
  }

  /**
   * Buscar contato específico
   */
  async findContact(number: string) {
    const response = await this.client.get(
      `/chat/findContacts/${encodeURIComponent(this.instanceName)}`,
      { params: { number } }
    );
    return response.data;
  }

  /**
   * Listar todos os grupos
   */
  async getAllGroups() {
    const response = await this.client.get(
      `/group/fetchAllGroups/${encodeURIComponent(this.instanceName)}`
    );
    return response.data;
  }

  /**
   * Desconectar instância
   */
  async logout() {
    const response = await this.client.post(
      `/instance/logout/${encodeURIComponent(this.instanceName)}`
    );
    return response.data;
  }

  /**
   * Reiniciar instância
   */
  async restart() {
    const response = await this.client.post(
      `/instance/restart/${encodeURIComponent(this.instanceName)}`
    );
    return response.data;
  }

  // ============================================
  // MÉTODOS ESPECÍFICOS PARA VETRIC
  // ============================================

  /**
   * Notificar início de carregamento
   */
  async notifyChargingStarted(params: {
    userPhone: string;
    chargerName: string;
    userName: string;
  }) {
    const message = `
🔌 *Carregamento Iniciado*

✅ Seu carregamento foi iniciado com sucesso!

📍 Carregador: ${params.chargerName}
👤 Usuário: ${params.userName}
🕐 Horário: ${new Date().toLocaleString('pt-BR')}

_Sistema VETRIC - CVE_
    `.trim();

    return this.sendText(params.userPhone, message);
  }

  /**
   * Notificar conclusão de carregamento
   */
  async notifyChargingCompleted(params: {
    userPhone: string;
    chargerName: string;
    energyKwh: number;
    durationMinutes: number;
    cost: number;
  }) {
    const message = `
✅ *Carregamento Concluído*

Seu carregamento foi finalizado!

📍 Carregador: ${params.chargerName}
⚡ Energia: ${params.energyKwh.toFixed(2)} kWh
⏱️ Duração: ${params.durationMinutes} minutos
💰 Valor: R$ ${params.cost.toFixed(2)}

Obrigado por usar VETRIC! 🚀

_Sistema VETRIC - CVE_
    `.trim();

    return this.sendText(params.userPhone, message);
  }

  /**
   * Enviar alerta de falha para administradores
   */
  async sendFailureAlert(params: {
    adminPhone: string;
    chargerName: string;
    errorMessage: string;
  }) {
    const message = `
⚠️ *ALERTA DE FALHA*

Problema detectado no sistema!

📍 Carregador: ${params.chargerName}
❌ Erro: ${params.errorMessage}
🕐 Horário: ${new Date().toLocaleString('pt-BR')}

⚡ Ação necessária!

_Sistema VETRIC - CVE_
    `.trim();

    return this.sendText(params.adminPhone, message);
  }

  /**
   * Enviar relatório diário para administradores
   */
  async sendDailyReport(params: {
    adminPhone: string;
    totalCharges: number;
    totalEnergy: number;
    activeUsers: number;
    revenue: number;
  }) {
    const message = `
📊 *Relatório Diário - VETRIC*

Resumo das atividades de hoje:

⚡ Carregamentos: ${params.totalCharges}
🔋 Energia Total: ${params.totalEnergy.toFixed(2)} kWh
👥 Usuários Ativos: ${params.activeUsers}
💰 Receita: R$ ${params.revenue.toFixed(2)}

📅 Data: ${new Date().toLocaleDateString('pt-BR')}

_Sistema VETRIC - CVE_
    `.trim();

    return this.sendText(params.adminPhone, message);
  }

  /**
   * Confirmar reserva de carregador
   */
  async confirmReservation(params: {
    userPhone: string;
    chargerName: string;
    dateTime: string;
    userName: string;
  }) {
    const message = `
✅ *Reserva Confirmada*

Olá, ${params.userName}!

Sua reserva foi confirmada com sucesso:

📍 Carregador: ${params.chargerName}
📅 Data/Hora: ${params.dateTime}

Aguardamos você! 😊

_Sistema VETRIC - CVE_
    `.trim();

    return this.sendText(params.userPhone, message);
  }

  /**
   * Cancelar reserva
   */
  async cancelReservation(params: {
    userPhone: string;
    chargerName: string;
    reason?: string;
  }) {
    const message = `
❌ *Reserva Cancelada*

Sua reserva foi cancelada.

📍 Carregador: ${params.chargerName}
${params.reason ? `📝 Motivo: ${params.reason}` : ''}
🕐 Horário: ${new Date().toLocaleString('pt-BR')}

Para nova reserva, entre em contato.

_Sistema VETRIC - CVE_
    `.trim();

    return this.sendText(params.userPhone, message);
  }

  /**
   * Notificar carregador disponível (após fila de espera)
   */
  async notifyChargerAvailable(params: {
    userPhone: string;
    chargerName: string;
    userName: string;
  }) {
    const message = `
🎉 *Carregador Disponível!*

Olá, ${params.userName}!

O carregador que você aguardava está disponível:

📍 Carregador: ${params.chargerName}
⏰ Tempo limite: 15 minutos para uso

Aproveite! ⚡

_Sistema VETRIC - CVE_
    `.trim();

    return this.sendText(params.userPhone, message);
  }
}

// ============================================
// SINGLETON EXPORT (OPCIONAL)
// ============================================

let instance: EvolutionAPIService | null = null;

export function getEvolutionAPIService(config?: EvolutionConfig): EvolutionAPIService {
  if (!instance) {
    instance = new EvolutionAPIService(config);
  }
  return instance;
}

// ============================================
// EXEMPLO DE USO
// ============================================

/*
// 1. Uso básico
const whatsapp = new EvolutionAPIService();
await whatsapp.sendText('5511999999999', 'Olá!');

// 2. Uso com singleton
const whatsapp = getEvolutionAPIService();
await whatsapp.sendText('5511999999999', 'Olá!');

// 3. Notificar carregamento
await whatsapp.notifyChargingStarted({
  userPhone: '5511999999999',
  chargerName: 'Carregador 01',
  userName: 'João Silva'
});

// 4. Verificar conexão
const isOnline = await whatsapp.isConnected();
console.log(isOnline ? '✅ Online' : '❌ Offline');

// 5. Enviar alerta
await whatsapp.sendFailureAlert({
  adminPhone: '558291096461',
  chargerName: 'Carregador 02',
  errorMessage: 'Falha na comunicação OCPP'
});

// 6. Relatório diário
await whatsapp.sendDailyReport({
  adminPhone: '558291096461',
  totalCharges: 45,
  totalEnergy: 320.5,
  activeUsers: 12,
  revenue: 1250.00
});
*/


import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { CVECharger, CVEConnector, CVETransaction } from '../types';
import { query } from '../config/database';
import { simulatorService } from './SimulatorService';

export class CVEService {
  private api: AxiosInstance;
  private token: string = '';
  private tokenExpiry: Date | null = null;
  private maxRetries: number = 3; // NOVO: máximo de tentativas
  private retryDelay: number = 5000; // NOVO: 5 segundos entre tentativas

  constructor() {
    this.api = axios.create({
      baseURL: config.cve.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': config.cve.apiKey,
      },
      timeout: 30000, // 30 segundos
    });

    // Interceptor para adicionar token automaticamente
    // IMPORTANTE: API CVE-PRO NÃO usa o prefixo "Bearer"
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = this.token; // ← SEM "Bearer"
      }
      return config;
    });
  }

  /**
   * NOVO: Função de retry com backoff exponencial
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    operation: string,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isServerError = error.response?.status >= 500;
      const isNetworkError = !error.response;
      
      if ((isServerError || isNetworkError) && attempt < this.maxRetries) {
        const delay = this.retryDelay * attempt; // Backoff exponencial
        console.log(`⚠️  ${operation} falhou (tentativa ${attempt}/${this.maxRetries})`);
        console.log(`🔄 Tentando novamente em ${delay/1000}s...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, operation, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Fazer login na API CVE-Pro (com retry automático)
   */
  async login(): Promise<string> {
    console.log('🔑 Fazendo login na API CVE-PRO...');

    return this.retryWithBackoff(async () => {
      const response = await this.api.post('/api/v1/login', {
        email: config.cve.username,
        password: config.cve.password,
      });

      if (response.data.token) {
        this.token = response.data.token;
        // Token válido por 24 horas (aproximado)
        this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        console.log('✅ Login CVE-PRO realizado com sucesso!');
        console.log(`✅ Token obtido: ${this.token.substring(0, 30)}...`);
        
        return this.token;
      } else {
        throw new Error('Token não retornado pela API');
      }
    }, 'Login CVE-PRO');
  }

  /**
   * Verificar se o token ainda é válido
   */
  private isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }
    
    // Renovar com 1 hora de antecedência
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return this.tokenExpiry > oneHourFromNow;
  }

  /**
   * Garantir que temos um token válido
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.isTokenValid()) {
      console.log('🔄 Token expirado ou inválido, renovando...');
      await this.login();
    }
  }

  /**
   * Buscar todos os carregadores (com retry automático)
   */
  async getChargers(): Promise<CVECharger[]> {
    // 🎮 MODO SIMULAÇÃO: Retornar dados simulados
    if (process.env.ENABLE_SIMULATOR === 'true' && simulatorService.isRunning()) {
      return simulatorService.getSimulatedChargers();
    }

    await this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      const response = await this.api.get<{ chargePointList: CVECharger[] }>(
        '/api/v1/chargepoints'
      );

      return response.data.chargePointList || [];
    }, 'Busca de carregadores');
  }

  /**
   * Buscar informações do morador usando carregamento ativo
   */
  async getChargerWithMoradorInfo(
    chargerUuid: string,
    connectorId: number
  ): Promise<{ nome: string; apartamento: string; inicio: string; duracao_minutos: number } | null> {
    try {
      const result = await query<{ 
        nome: string; 
        apartamento: string; 
        inicio: string; 
        duracao_minutos: number 
      }>(
        `SELECT 
           m.nome, 
           m.apartamento,
           c.inicio,
           EXTRACT(EPOCH FROM (NOW() - c.inicio)) / 60 AS duracao_minutos
         FROM carregamentos c
         INNER JOIN moradores m ON c.morador_id = m.id
         WHERE c.charger_uuid = $1 
           AND c.connector_id = $2
           AND c.status IN ('iniciado', 'carregando')
           AND c.fim IS NULL
         LIMIT 1`,
        [chargerUuid, connectorId]
      );
      
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar morador do carregador:', error);
      return null;
    }
  }

  /**
   * Buscar carregadores com informações de moradores
   */
  async getChargersWithMoradores(): Promise<any[]> {
    const chargers = await this.getChargers();

    return Promise.all(
      chargers.map(async (charger) => {
        const connector = charger.connectors?.[0]; // Primeiro conector
        
        if (!connector) {
          return { ...charger, morador: null };
        }
        
        // Buscar morador do carregamento ativo
        const morador = await this.getChargerWithMoradorInfo(
          charger.uuid,
          connector.connectorId
        );
        
        return {
          ...charger,
          morador, // { nome, apartamento, inicio, duracao_minutos } ou null
        };
      })
    );
  }

  /**
   * Buscar ocppIdTag pelo ocppTagPk em transações anteriores
   * Usado quando a transação ativa não retorna o ocppIdTag (bug/limitação da API CVE)
   */
  async findOcppIdTagByPk(ocppTagPk: number): Promise<string | null> {
    try {
      // Buscar transações dos últimos 30 dias
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      const fromDate = formatDate(thirtyDaysAgo);
      // FIX: API CVE-PRO não respeita hora no toDate, adicionar +1 dia
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const toDate = formatDate(tomorrow);
      
      console.log(`🔍 [CVE] Buscando ocppIdTag para ocppTagPk ${ocppTagPk} no histórico...`);
      
      const transactions = await this.getTransactions(fromDate, toDate);
      
      // Procurar transações FINALIZADAS com este ocppTagPk que tenham ocppIdTag preenchido
      const matchingTransaction = transactions.find(
        t => t.ocppTagPk === ocppTagPk && t.ocppIdTag && t.ocppIdTag.trim() !== ''
      );
      
      if (matchingTransaction) {
        console.log(`✅ [CVE] ocppIdTag encontrado no histórico: ${matchingTransaction.ocppIdTag}`);
        console.log(`   📅 Transação anterior: ID ${matchingTransaction.id} (${matchingTransaction.startTimestamp})`);
        return matchingTransaction.ocppIdTag;
      }
      
      console.log(`⚠️  [CVE] Nenhum ocppIdTag encontrado no histórico para ocppTagPk ${ocppTagPk}`);
      return null;
    } catch (error) {
      console.error(`❌ [CVE] Erro ao buscar ocppIdTag por PK:`, error);
      return null;
    }
  }

  /**
   * Buscar transações com filtro de data
   * FORMATO CORRETO: "2026-01-11 00:00:00" (com espaço, não T!)
   */
  async getTransactions(fromDate: string, toDate: string): Promise<CVETransaction[]> {
    await this.ensureAuthenticated();

    console.log('🔍 [CVE] Buscando transações...');
    console.log(`   📅 fromDate: ${fromDate}`);
    console.log(`   📅 toDate: ${toDate}`);
    console.log(`   🔑 Token: ${this.token ? this.token.substring(0, 30) + '...' : 'N/A'}`);

    return this.retryWithBackoff(async () => {
      try {
        const response = await this.api.get<{ error: any; list: CVETransaction[]; count: number }>(
          '/api/v1/transaction', // SINGULAR!
          { 
            params: { 
              fromDate, // Formato: "2026-01-11 00:00:00"
              toDate,   // Formato: "2026-01-13 23:59:59"
              // timeZone: -3 // ← Removido, causa erro 401
            }
            // Headers customizados removidos - Authorization vem do interceptor
          }
        );

        console.log(`✅ [CVE] ${response.data.count || 0} transação(ões) encontrada(s)`);
        
        // Filtrar e logar transações ativas
        const activeTransactions = response.data.list?.filter(tx => tx.stopTimestamp === null) || [];
        if (activeTransactions.length > 0) {
          console.log(`⚡ [CVE] ${activeTransactions.length} transação(ões) ATIVA(S):`);
          activeTransactions.forEach(tx => {
            console.log(`   🔌 ${tx.chargeBoxDescription}`);
            console.log(`      👤 ${tx.userName || 'Sem nome'}`);
            console.log(`      🏠 ${tx.userAddressComplement || 'Sem apartamento'}`);
            console.log(`      🎯 ocppIdTag: ${tx.ocppIdTag}`);
          });
        }
        
        return response.data.list || [];
      } catch (error: any) {
        console.error('❌ [CVE] Erro ao buscar transações:');
        console.error(`   Status: ${error.response?.status}`);
        console.error(`   Mensagem: ${error.response?.data?.error || error.message}`);
        throw error;
      }
    }, 'Busca de transações');
  }

  /**
   * Buscar transações ativas (sem stopTimestamp)
   */
  async getActiveTransactions(): Promise<CVETransaction[]> {
    // 🎮 MODO SIMULAÇÃO: Retornar dados simulados
    if (process.env.ENABLE_SIMULATOR === 'true' && simulatorService.isRunning()) {
      return simulatorService.getSimulatedTransactions();
    }

    // Buscar transações do dia inteiro (00:00:00 até 23:59:59)
    const now = new Date();
    
    // Início do dia: hoje às 00:00:00
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // FIX: API CVE-PRO não respeita hora no toDate, então sempre adicionar +2 dias
    // Exemplo: Para buscar transações de hoje completo (incluindo as de amanhã cedo), 
    // precisa colocar +2 dias no toDate
    const endOfDay = new Date(now);
    endOfDay.setDate(endOfDay.getDate() + 2); // +2 dias para pegar todo hoje e amanhã
    endOfDay.setHours(0, 0, 0, 0); // meia-noite
    
    // Formato com ESPAÇO: "2026-01-11 00:00:00"
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const allTransactions = await this.getTransactions(
      formatDate(startOfDay),
      formatDate(endOfDay)
    );

    // Filtrar apenas transações ativas (stopTimestamp === null)
    const activeTransactions = allTransactions.filter(tx => tx.stopTimestamp === null);
    
    // ENRIQUECIMENTO: Para transações sem ocppIdTag, buscar no histórico
    const enrichedTransactions = await Promise.all(
      activeTransactions.map(async (tx) => {
        // Se ocppIdTag está vazio MAS ocppTagPk existe, buscar no histórico
        if ((!tx.ocppIdTag || tx.ocppIdTag.trim() === '') && tx.ocppTagPk) {
          console.log(`🔄 [CVE] Transação ${tx.id} sem ocppIdTag, buscando no histórico...`);
          const historicalTag = await this.findOcppIdTagByPk(tx.ocppTagPk);
          
          if (historicalTag) {
            console.log(`✅ [CVE] ocppIdTag recuperado do histórico: ${historicalTag}`);
            return {
              ...tx,
              ocppIdTag: historicalTag
            };
          }
        }
        
        return tx;
      })
    );
    
    return enrichedTransactions;
  }

  /**
   * Buscar histórico de transações (com retry automático)
   */
  async getTransactionHistory(
    startDate?: string,
    endDate?: string
  ): Promise<CVETransaction[]> {
    await this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await this.api.get<{ transactions: CVETransaction[] }>(
        '/api/v1/transactions',
        { params }
      );

      return response.data.transactions || [];
    }, 'Busca de histórico de transações');
  }

  /**
   * Buscar tags RFID cadastrados (com retry automático)
   */
  async getIdTags(): Promise<any[]> {
    await this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      const response = await this.api.get<{ idTags: any[] }>('/api/v1/id-tag');

      return response.data.idTags || [];
    }, 'Busca de tags RFID');
  }

  /**
   * Buscar carregador por UUID
   */
  async getChargePointByUuid(uuid: string): Promise<CVECharger | null> {
    const chargers = await this.getChargers();
    return chargers.find((c) => c.uuid === uuid) || null;
  }

  /**
   * Estatísticas dos carregadores
   */
  async getChargerStats(): Promise<{
    total: number;
    disponiveis: number;
    ocupados: number;
    indisponiveis: number;
  }> {
    const chargers = await this.getChargers();
    
    const stats = {
      total: chargers.length,
      disponiveis: 0,
      ocupados: 0,
      indisponiveis: 0,
    };
    
    chargers.forEach((charger) => {
      const connector = charger.connectors?.[0];
      const status = connector?.lastStatus?.status;
      
      if (status === 'Available') {
        stats.disponiveis++;
      } else if (status === 'Charging' || status === 'Occupied') {
        stats.ocupados++;
      } else {
        stats.indisponiveis++;
      }
    });
    
    return stats;
  }

  /**
   * Formatar informações do carregador
   */
  formatChargerInfo(charger: CVECharger): any {
    const connector = charger.connectors?.[0];
    
    return {
      uuid: charger.uuid,
      chargeBoxId: charger.chargeBoxId,
      nome: charger.description,
      modelo: `${charger.chargePointVendor} ${charger.chargePointModel}`,
      firmware: charger.fwVersion,
      status: connector?.lastStatus?.status || 'Unavailable',
      potencia: connector?.powerMax || null,
      tipoConector: connector?.connectorType || 'Type 2',
      velocidade: connector?.speed || 'SLOW',
      localizacao: {
        latitude: charger.locationLatitude,
        longitude: charger.locationLongitude,
        endereco: charger.address
          ? `${charger.address.street}, ${charger.address.houseNumber} - ${charger.address.city}/${charger.address.state}`
          : '',
      },
      ultimoBatimento: charger.lastHeartbeatTimestamp,
      consumoMensal: charger.monthConsumption,
      ativo: charger.active,
    };
  }

  /**
   * NOVO: Extrair idTag de um carregador de múltiplas formas (abordagem híbrida)
   * Tenta em ordem:
   * 1. lastStatus do connector (mensagem de status mais recente)
   * 2. Transações ativas (endpoint /transactions)
   * 3. Busca específica do conector (endpoint /chargeBoxes/{id}/connectors/{id})
   */
  async extractIdTagFromCharger(charger: CVECharger): Promise<string | null> {
    const connector = charger.connectors?.[0];
    if (!connector) return null;

    // 1. Tentar pegar do lastStatus (mensagens de heartbeat/status podem ter idTag)
    const lastStatus = connector.lastStatus as any;
    if (lastStatus) {
      // Verificar se tem idTag no lastStatus
      if (lastStatus.idTag) {
        console.log(`✅ [${charger.description}] idTag encontrado no lastStatus: ${lastStatus.idTag}`);
        return lastStatus.idTag;
      }

      // Verificar se tem currentUser ou currentChargingUserName
      if (lastStatus.currentChargingUserName) {
        console.log(`✅ [${charger.description}] currentChargingUserName: ${lastStatus.currentChargingUserName}`);
        return lastStatus.currentChargingUserName;
      }
    }

    // 2. Tentar buscar de transações ativas
    try {
      const activeTransactions = await this.getActiveTransactions();
      const matchingTx = activeTransactions.find(
        tx => tx.chargeBoxId === charger.chargeBoxId && tx.connectorId === connector.connectorId
      );
      
      if (matchingTx?.ocppIdTag) {
        console.log(`✅ [${charger.description}] ocppIdTag encontrado em transação ativa: ${matchingTx.ocppIdTag}`);
        return matchingTx.ocppIdTag;
      }
    } catch (error: any) {
      console.warn(`⚠️  Erro ao buscar transações ativas: ${error.message}`);
    }

    // 3. Tentar buscar endpoint específico do conector (com ambos chargeBoxId e uuid)
    const possibleIds = [charger.chargeBoxId, charger.uuid].filter(Boolean);
    
    for (const id of possibleIds) {
      try {
        const response = await this.api.get(
          `/api/v1/chargeBoxes/${id}/connectors/${connector.connectorId}`
        );
        
        const data = response.data as any;
        if (data.idTag) {
          console.log(`✅ [${charger.description}] idTag via endpoint conector: ${data.idTag}`);
          return data.idTag;
        }
        
        if (data.currentTransaction?.idTag) {
          console.log(`✅ [${charger.description}] idTag em currentTransaction: ${data.currentTransaction.idTag}`);
          return data.currentTransaction.idTag;
        }
      } catch (error: any) {
        // Não logar erro aqui, pode ser que o endpoint não exista ou esteja em formato diferente
      }
    }

    return null;
  }

  /**
   * Health check da API (sem retry, para diagnóstico)
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      const chargers = await this.api.get('/api/v1/chargepoints');
      return chargers.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const cveService = new CVEService();

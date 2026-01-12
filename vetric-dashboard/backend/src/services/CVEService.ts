import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { CVECharger, CVEConnector, CVETransaction } from '../types';
import { query } from '../config/database';

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
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
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
    await this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      const response = await this.api.get<{ chargePointList: CVECharger[] }>(
        '/api/v1/chargepoints'
      );

      return response.data.chargePointList || [];
    }, 'Busca de carregadores');
  }

  /**
   * Buscar carregadores com informações de moradores
   */
  async getChargersWithMoradores(): Promise<any[]> {
    const chargers = await this.getChargers();

    return Promise.all(
      chargers.map(async (charger) => {
        const chargerId = charger.chargeBoxPk;
        const connectors = charger.connectors || [];

        // Para cada conector, buscar o morador associado
        const connectorsWithMoradores = await Promise.all(
          connectors.map(async (connector: CVEConnector) => {
            let moradorNome = null;

            // Se o conector tem um idTag (RFID), buscar o morador
            if (connector.idTag) {
              try {
                const moradores = await query<{ nome: string }>(
                  'SELECT nome FROM moradores WHERE tag_rfid = $1 LIMIT 1',
                  [connector.idTag]
                );

                if (moradores.length > 0) {
                  moradorNome = moradores[0].nome;
                }
              } catch (error) {
                console.error(`Erro ao buscar morador para tag ${connector.idTag}:`, error);
              }
            }

            return {
              ...connector,
              moradorNome,
            };
          })
        );

        return {
          ...charger,
          connectors: connectorsWithMoradores,
        };
      })
    );
  }

  /**
   * Buscar transações ativas (com retry automático)
   */
  async getActiveTransactions(): Promise<CVETransaction[]> {
    await this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      const response = await this.api.get<{ transactions: CVETransaction[] }>(
        '/api/v1/transactions/active'
      );

      return response.data.transactions || [];
    }, 'Busca de transações ativas');
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

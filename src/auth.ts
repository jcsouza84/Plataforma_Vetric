import axios, { AxiosInstance } from 'axios';
import { consoleLogger, rawLogger } from './logger';
import { LoginCredentials, SessionInfo } from './types';
import { manualSession } from './manual-session';

/**
 * Módulo de Autenticação do CVE-PRO
 * Responsável por fazer login e manter a sessão ativa
 */

export class CVEAuth {
  private baseUrl: string;
  private credentials: LoginCredentials;
  private axiosInstance: AxiosInstance;
  private sessionInfo: SessionInfo | null = null;
  private isAuthenticated: boolean = false;

  constructor(baseUrl: string, credentials: LoginCredentials) {
    this.baseUrl = baseUrl;
    this.credentials = credentials;

    // Criar instância do Axios com configurações personalizadas
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      maxRedirects: 5,
      withCredentials: true, // Importante para cookies
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    // Interceptor para logar todas as requisições
    this.axiosInstance.interceptors.request.use(
      (config) => {
        consoleLogger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: this.maskSensitiveData(config.headers),
        });
        return config;
      },
      (error) => {
        consoleLogger.error('Erro na requisição HTTP', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para capturar respostas e cookies
    this.axiosInstance.interceptors.response.use(
      (response) => {
        consoleLogger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
        
        // Capturar cookies do response
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
          consoleLogger.debug('Cookies recebidos:', setCookieHeaders);
        }
        
        return response;
      },
      (error) => {
        if (error.response) {
          consoleLogger.error(
            `HTTP Error: ${error.response.status} ${error.config?.url}`,
            { data: error.response.data }
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Tenta fazer login no CVE-PRO testando várias estratégias
   */
  async login(): Promise<boolean> {
    consoleLogger.section('AUTENTICAÇÃO CVE-PRO');
    
    // Verificar se há sessão manual configurada
    if (manualSession.enabled) {
      consoleLogger.info('Usando sessão manual (cookies pré-capturados)');
      return this.useManualSession();
    }
    
    consoleLogger.info('Tentando autenticar...', {
      url: this.baseUrl,
      username: this.credentials.username,
    });

    try {
      // Estratégia 1: Login via formulário POST tradicional
      const success = await this.tryFormLogin();
      
      if (success) {
        this.isAuthenticated = true;
        consoleLogger.success('Autenticação realizada com sucesso! ✓');
        
        // Salvar informações da sessão
        if (this.sessionInfo) {
          rawLogger.saveSessionInfo({
            timestamp: new Date().toISOString(),
            baseUrl: this.baseUrl,
            username: this.credentials.username,
            sessionInfo: this.sessionInfo,
          });
        }
        
        return true;
      }

      return false;
    } catch (error: any) {
      consoleLogger.error('Erro durante autenticação', error);
      return false;
    }
  }

  /**
   * Estratégia de login via API (descoberto via DevTools)
   */
  private async tryFormLogin(): Promise<boolean> {
    consoleLogger.info('Estratégia 1: API Login (CVE-PRO)');

    try {
      // Endpoint descoberto via DevTools
      const endpoint = '/api/v1/login';
      
      consoleLogger.debug(`Tentando login em: ${endpoint}`);
      
      // Tentar login sem reCAPTCHA primeiro
      try {
        const loginResponse = await this.axiosInstance.post(
          endpoint,
          {
            email: this.credentials.username,
            password: this.credentials.password,
            // reCAPTCHA omitido propositalmente - tentar sem
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        // Verificar se retornou token
        if (loginResponse.data && loginResponse.data.token) {
          consoleLogger.success('Login bem-sucedido! Token recebido.');
          
          // Extrair token e salvar
          const token = loginResponse.data.token;
          const sessionCookies = this.extractCookies(loginResponse.headers['set-cookie']);
          
          this.sessionInfo = {
            cookies: sessionCookies,
            headers: {
              'authorization': `Bearer ${token}`,
              ...this.extractRelevantHeaders(loginResponse.headers),
            },
            timestamp: new Date().toISOString(),
          };

          return true;
        }
      } catch (error: any) {
        // Se erro 400/401, pode ser por falta de reCAPTCHA
        if (error.response?.status === 400 || error.response?.status === 401) {
          consoleLogger.warn('Login falhou - pode precisar de reCAPTCHA');
          consoleLogger.warn('Response:', error.response?.data);
        }
        throw error;
      }

      // Tentar outros endpoints como fallback
      const fallbackEndpoints = [
        '/auth/login',
        '/login',
        '/api/login',
      ];

      for (const endpoint of fallbackEndpoints) {
        try {
          consoleLogger.debug(`Tentando endpoint fallback: ${endpoint}`);
          
          const loginResponse = await this.axiosInstance.post(
            endpoint,
            {
              email: this.credentials.username,
              password: this.credentials.password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          // Verificar se tem token ou cookies
          const token = loginResponse.data?.token;
          const sessionCookies = this.extractCookies(loginResponse.headers['set-cookie']);
          
          if (token || sessionCookies.length > 0) {
            this.sessionInfo = {
              cookies: sessionCookies,
              headers: {
                ...(token && { 'authorization': `Bearer ${token}` }),
                ...this.extractRelevantHeaders(loginResponse.headers),
              },
              timestamp: new Date().toISOString(),
            };

            consoleLogger.success(`Login bem-sucedido via ${endpoint}`);
            consoleLogger.debug('Sessão estabelecida', {
              cookies: sessionCookies.length,
              token: token ? 'sim' : 'não',
              headers: Object.keys(this.sessionInfo.headers),
            });

            return true;
          }
        } catch (error: any) {
          // Se for 404, continua tentando outros endpoints
          if (error.response?.status === 404) {
            continue;
          }
          
          // Se for erro de autenticação, logar e continuar
          if (error.response?.status === 401 || error.response?.status === 403) {
            consoleLogger.warn(`Credenciais rejeitadas em ${endpoint}`);
            continue;
          }
          
          // Outro erro, logar e continuar
          consoleLogger.debug(`Erro em ${endpoint}: ${error.message}`);
        }
      }

      consoleLogger.warn('Nenhum endpoint de login funcionou');
      return false;
    } catch (error: any) {
      consoleLogger.error('Erro na estratégia de formulário POST', error);
      return false;
    }
  }

  /**
   * Extrai cookies do header Set-Cookie
   */
  private extractCookies(setCookieHeader?: string[]): string[] {
    if (!setCookieHeader) return [];
    
    return setCookieHeader.map((cookie) => {
      // Extrair apenas nome=valor, ignorando path, domain, etc
      return cookie.split(';')[0];
    });
  }

  /**
   * Extrai headers relevantes da resposta
   */
  private extractRelevantHeaders(headers: any): Record<string, string> {
    const relevant: Record<string, string> = {};
    
    const headerKeys = ['authorization', 'x-auth-token', 'x-csrf-token', 'x-xsrf-token'];
    
    for (const key of headerKeys) {
      if (headers[key]) {
        relevant[key] = headers[key];
      }
    }
    
    return relevant;
  }

  /**
   * Mascara dados sensíveis para logs
   */
  private maskSensitiveData(data: any): any {
    if (!data) return data;
    
    const masked = { ...data };
    const sensitiveKeys = ['password', 'authorization', 'cookie', 'set-cookie'];
    
    for (const key of Object.keys(masked)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        masked[key] = '***MASKED***';
      }
    }
    
    return masked;
  }

  /**
   * Retorna informações da sessão para uso no WebSocket
   */
  getSessionInfo(): SessionInfo | null {
    return this.sessionInfo;
  }

  /**
   * Retorna cookie string para conexão WebSocket
   */
  getCookieString(): string {
    if (!this.sessionInfo) return '';
    return this.sessionInfo.cookies.join('; ');
  }

  /**
   * Verifica se está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Retorna instância do Axios configurada
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Usa sessão manual (cookies pré-capturados ou token JWT)
   */
  private useManualSession(): boolean {
    try {
      // Verificar se há pelo menos cookies OU token
      const hasCookies = manualSession.cookies && manualSession.cookies.length > 0;
      const hasToken = manualSession.token && manualSession.token.length > 0;
      
      if (!hasCookies && !hasToken) {
        consoleLogger.error('Sessão manual habilitada mas nenhum cookie ou token configurado!');
        consoleLogger.info('Edite o arquivo src/manual-session.ts e adicione cookies ou token');
        return false;
      }

      // Log do que foi carregado
      if (hasCookies) {
        consoleLogger.success(`${manualSession.cookies.length} cookie(s) carregado(s)`);
      }
      
      const headers: Record<string, string> = {};
      if (hasToken) {
        headers['authorization'] = `Bearer ${manualSession.token}`;
        consoleLogger.success('✓ Token JWT carregado');
      }

      this.sessionInfo = {
        cookies: manualSession.cookies || [],
        headers: headers,
        timestamp: new Date().toISOString(),
      };

      this.isAuthenticated = true;
      
      consoleLogger.success('✓ Sessão manual estabelecida com sucesso!');
      
      // Salvar informações da sessão
      rawLogger.saveSessionInfo({
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        username: 'manual-session',
        sessionInfo: this.sessionInfo,
      });

      return true;
    } catch (error: any) {
      consoleLogger.error('Erro ao usar sessão manual', error);
      return false;
    }
  }
}


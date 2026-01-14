/**
 * 🔌 VETRIC - Serviço de API
 * Integração com Backend Node.js
 */

import axios, { AxiosInstance } from 'axios';

// URL do backend (ajuste conforme necessário)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class VetricAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      // Pegar token do localStorage
      const token = localStorage.getItem('@vetric:token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[API Error]', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats() {
    const { data } = await this.api.get('/dashboard/stats');
    return data.data;
  }

  async getChargers() {
    const { data } = await this.api.get('/dashboard/chargers');
    return data.data;
  }

  async getChargerByUuid(uuid: string) {
    const { data } = await this.api.get(`/dashboard/charger/${uuid}`);
    return data.data;
  }

  // ==================== MORADORES ====================

  async getMoradores() {
    const { data } = await this.api.get('/moradores');
    return data.data;
  }

  async getMoradorById(id: number) {
    const { data } = await this.api.get(`/moradores/${id}`);
    return data.data;
  }

  async getMoradorByTag(tag: string) {
    const { data } = await this.api.get(`/moradores/tag/${tag}`);
    return data.data;
  }

  async createMorador(morador: {
    nome: string;
    apartamento: string;
    telefone: string;
    tag_rfid: string;
    notificacoes_ativas?: boolean;
  }) {
    const { data } = await this.api.post('/moradores', morador);
    return data.data;
  }

  async updateMorador(id: number, updates: {
    nome?: string;
    apartamento?: string;
    telefone?: string;
    tag_rfid?: string;
    notificacoes_ativas?: boolean;
  }) {
    const { data } = await this.api.put(`/moradores/${id}`, updates);
    return data.data;
  }

  async deleteMorador(id: number) {
    const { data } = await this.api.delete(`/moradores/${id}`);
    return data;
  }

  async getMoradoresStats() {
    const { data } = await this.api.get('/moradores/stats/summary');
    return data.data;
  }

  // ==================== CARREGAMENTOS ====================

  async getCarregamentos(limit: number = 100) {
    const { data } = await this.api.get(`/carregamentos?limit=${limit}`);
    return data.data;
  }

  async getCarregamentosAtivos() {
    const { data } = await this.api.get('/carregamentos/ativos');
    return data.data;
  }

  async getCarregamentosByMorador(moradorId: number, limit: number = 50) {
    const { data } = await this.api.get(`/carregamentos/morador/${moradorId}?limit=${limit}`);
    return data.data;
  }

  async getCarregamentosStatsToday() {
    const { data } = await this.api.get('/carregamentos/stats/today');
    return data.data;
  }

  async getCarregamentosStatsByPeriod(start: string, end: string) {
    const { data } = await this.api.get(`/carregamentos/stats/period?start=${start}&end=${end}`);
    return data.data;
  }

  // ==================== TEMPLATES ====================

  async getTemplates() {
    const { data } = await this.api.get('/templates');
    return data.data;
  }

  async getTemplateByTipo(tipo: string) {
    const { data } = await this.api.get(`/templates/${tipo}`);
    return data.data;
  }

  async updateTemplate(tipo: string, updates: {
    mensagem?: string;
    ativo?: boolean;
  }) {
    const { data } = await this.api.put(`/templates/${tipo}`, updates);
    return data.data;
  }

  // ==================== RELATÓRIOS ====================

  async getRelatorios() {
    const { data } = await this.api.get('/relatorios');
    return data.data;
  }

  async uploadRelatorio(formData: FormData) {
    const { data } = await this.api.post('/relatorios/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  }

  async downloadRelatorio(id: number) {
    const response = await this.api.get(`/relatorios/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteRelatorio(id: number) {
    const { data } = await this.api.delete(`/relatorios/${id}`);
    return data;
  }

  // ==================== EVOLUTION API ====================

  async testEvolutionApi(telefone: string, mensagem: string) {
    const { data } = await this.api.post('/test-evolution', {
      telefone,
      mensagem,
    });
    return data.data;
  }

  // ==================== CONFIGURAÇÕES ====================

  async getConfiguracoes() {
    const { data } = await this.api.get('/config');
    return data.data;
  }

  async getConfiguracao(chave: string) {
    const { data } = await this.api.get(`/config/${chave}`);
    return data.data;
  }

  async updateConfiguracao(chave: string, valor: string) {
    const { data } = await this.api.put(`/config/${chave}`, { valor });
    return data.data;
  }

  async updateConfiguracoes(configs: Array<{ chave: string; valor: string }>) {
    const { data } = await this.api.post('/config/batch', { configs });
    return data.data;
  }

  // ==================== SYSTEM ====================

  async restartBackend() {
    const { data } = await this.api.post('/system/restart');
    return data;
  }

  async getSystemStatus() {
    const { data } = await this.api.get('/system/status');
    return data.data;
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck() {
    const { data } = await axios.get(`${API_BASE_URL}/health`);
    return data;
  }
}

// Exportar instância única
export const vetricAPI = new VetricAPI();
export default vetricAPI;


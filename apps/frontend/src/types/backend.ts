/**
 * 📦 VETRIC - Types do Backend
 * Interfaces que correspondem aos dados da API
 */

// ==================== DASHBOARD ====================

export interface DashboardStats {
  totalCarregadores: number;
  carregadoresDisponiveis: number;
  carregadoresOcupados: number;
  carregadoresIndisponiveis: number;
  totalMoradores: number;
  moradoresAtivos: number;
  carregamentosHoje: number;
  energiaConsumidaHoje: number;
}

export interface ChargerInfo {
  uuid: string;
  chargeBoxId: string;
  nome: string;
  status: string;
  statusConector: 'Available' | 'Occupied' | 'Charging' | 'Unavailable' | 'Faulted' | 'Reserved';
  usuarioAtual: string | null;
  morador?: {
    nome: string;
    apartamento: string;
    inicio: string;
    duracao_minutos: number;
  } | null;
  carregamentoAtivo?: {
    inicio: string;
    duracaoMinutos: number;
  } | null;
  ultimoBatimento: string;
  localizacao: {
    latitude: number;
    longitude: number;
    endereco: string;
  };
  potenciaMaxima: number | null;
  tipoConector: string;
  velocidade: string;
}

// ==================== MORADORES ====================

export interface Morador {
  id: number;
  nome: string;
  apartamento: string;
  telefone: string;
  tag_rfid: string;
  notificacoes_ativas: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CreateMoradorDTO {
  nome: string;
  apartamento: string;
  telefone: string;
  tag_rfid: string;
  notificacoes_ativas?: boolean;
}

export interface UpdateMoradorDTO {
  nome?: string;
  apartamento?: string;
  telefone?: string;
  tag_rfid?: string;
  notificacoes_ativas?: boolean;
}

// ==================== CARREGAMENTOS ====================

export interface Carregamento {
  id: number;
  morador_id: number | null;
  charger_uuid: string;
  charger_name: string;
  connector_id: number;
  status: 'iniciado' | 'carregando' | 'finalizado' | 'erro';
  inicio: string;
  fim?: string;
  energia_kwh?: number;
  duracao_minutos?: number;
  notificacao_inicio_enviada: boolean;
  notificacao_fim_enviada: boolean;
  criado_em?: string;
}

export interface CarregamentoStatsToday {
  total: number;
  finalizados: number;
  em_andamento: number;
  energia_total: number;
}

export interface CarregamentoStatsByPeriod {
  data: string;
  total_carregamentos: number;
  energia_total: number;
  duracao_media: number;
}

// ==================== TEMPLATES ====================

export interface TemplateNotificacao {
  id: number;
  tipo: 'inicio_carregamento' | 'fim_carregamento' | 'erro_carregamento';
  mensagem: string;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface UpdateTemplateDTO {
  mensagem?: string;
  ativo?: boolean;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  websocket: boolean;
}


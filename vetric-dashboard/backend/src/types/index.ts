/**
 * 📦 VETRIC - Definições de Tipos TypeScript
 */

// ==================== API CVE-PRO ====================

export interface CVEChargePoint {
  chargeBoxPk: number;
  chargeBoxId: string;
  uuid: string;
  description: string;
  lastHeartbeatTimestamp: string;
  locationLatitude: number;
  locationLongitude: number;
  connectors: CVEConnector[];
  address: CVEAddress;
  usage: number;
  monthConsumption: number;
  active: boolean;
  chargePointVendor: string;
  chargePointModel: string;
  fwVersion: string;
  speedCount: {
    nrSlowTotal: number;
    nrSlowAvailable: number;
    nrFastTotal: number;
    nrFastAvailable: number;
  };
}

export interface CVEConnector {
  connectorPk: number;
  connectorId: number;
  powerMax: number | null;
  connectorUuid: string | null;
  lastStatus: CVEConnectorStatus;
  connectorType: string;
  currentType: string;
  speed: 'SLOW' | 'FAST';
  chargeBoxUuid: string;
}

export interface CVEConnectorStatus {
  timeStamp: string;
  errorCode: string;
  status: 'Available' | 'Occupied' | 'Charging' | 'Unavailable' | 'Faulted' | 'Reserved';
  usage: number;
  totalDuration: number;
  socPercentage: number | null;
  currentChargingUserName: string | null;
}

export interface CVEAddress {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
}

export interface CVEApiResponse<T> {
  error: any;
  data?: T;
}

// ==================== BANCO DE DADOS ====================

export interface Morador {
  id?: number;
  nome: string;
  apartamento: string;
  telefone: string;
  tag_rfid: string;
  notificacoes_ativas: boolean;
  criado_em?: Date;
  atualizado_em?: Date;
}

export interface Carregamento {
  id?: number;
  morador_id: number;
  charger_uuid: string;
  charger_name: string;
  connector_id: number;
  status: 'iniciado' | 'carregando' | 'finalizado' | 'erro';
  inicio: Date;
  fim?: Date;
  energia_kwh?: number;
  duracao_minutos?: number;
  notificacao_inicio_enviada: boolean;
  notificacao_fim_enviada: boolean;
  criado_em?: Date;
}

export interface TemplateNotificacao {
  id?: number;
  tipo: 'inicio_carregamento' | 'fim_carregamento' | 'erro_carregamento';
  mensagem: string;
  ativo: boolean;
  criado_em?: Date;
  atualizado_em?: Date;
}

// ==================== API REST ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateMoradorDTO {
  nome: string;
  apartamento: string;
  telefone: string | null;
  tag_rfid: string;
  notificacoes_ativas?: boolean;
}

export interface UpdateMoradorDTO {
  nome?: string;
  apartamento?: string;
  telefone?: string | null;
  tag_rfid?: string;
  notificacoes_ativas?: boolean;
}

export interface UpdateTemplateDTO {
  mensagem?: string;
  ativo?: boolean;
}

// ==================== WEBSOCKET ====================

export interface WebSocketMessage {
  type: 'charger_status' | 'transaction_start' | 'transaction_end' | 'error';
  timestamp: string;
  chargeBoxId: string;
  connectorId: number;
  status?: string;
  data?: any;
}

export interface ChargerStatusUpdate {
  chargeBoxId: string;
  chargeBoxUuid: string;
  description: string;
  connectorId: number;
  status: CVEConnectorStatus['status'];
  timestamp: string;
  currentUser: string | null;
  socPercentage: number | null;
}

// ==================== EVOLUTION API ====================

export interface EvolutionWhatsAppMessage {
  number: string;
  text: string;
}

export interface EvolutionApiConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

// ==================== CONFIGURAÇÃO ====================

export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  cve: {
    baseUrl: string;
    apiKey: string;
    username: string;
    password: string;
    token?: string;
  };
  evolution: EvolutionApiConfig;
}

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
  statusConector: CVEConnectorStatus['status'];
  usuarioAtual: string | null;
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


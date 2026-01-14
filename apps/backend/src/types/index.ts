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
  status: 'Available' | 'Occupied' | 'Charging' | 'Unavailable' | 'Faulted' | 'Reserved' | 'Preparing' | 'Finishing';
  usage: number;
  totalDuration: number;
  socPercentage: number | null;
  currentChargingUserName: string | null;
  idTag?: string; // Tag RFID do usuário (quando disponível)
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

// Alias para compatibilidade
export type CVECharger = CVEChargePoint;

export interface CVETransaction {
  id: number;
  transactionPk?: number;
  transactionId?: number;
  connectorId: number;
  connectorPk: number;
  chargeBoxPk: number;
  chargeBoxUuid: string;
  chargeBoxId: string;
  chargeBoxDescription: string;
  ocppIdTag: string;
  ocppTagPk: number;
  
  // Timestamps e duração
  startTimestamp: string; // Formato: "12/01/2026 19:29:33"
  stopTimestamp: string | null; // null = em andamento
  duration: number; // Em segundos
  durationHumanReadable: string; // "05:03:36"
  durationTime: string; // "05:03:36"
  
  // Energia
  energy: number | null; // Em Wh (null = em andamento)
  energyHumanReadable: string | null; // "20,8200 kWh"
  startValue: string; // Meter start
  stopValue: string | null; // Meter stop
  
  // Usuário
  userName: string | null;
  userPhone: string | null;
  userEmail: string | null;
  userDocNumber: string | null;
  userDocType: string | null;
  userAddressComplement: string | null; // APARTAMENTO aqui!
  userAddressStreet: string | null;
  userAddressHouseNumber: string | null;
  userAddressCity: string | null;
  userAddressState: string | null;
  userUuid: string | null;
  userPk: number | null;
  
  // Localização do carregador
  addressStreet: string;
  addressHouseNumber: string;
  addressCity: string;
  addressState: string;
  addressComplement: string | null;
  
  // Custos
  cost: number | null;
  costHumanReadable: string | null;
  income: number | null;
  incomeHumanReadable: string | null;
  
  // Ociosidade
  idleDuration: number | null; // Em segundos
  idleDurationHumanReadable: string | null;
  
  // Indicadores
  autonomy: number | null; // km
  autonomyHumanReadable: string | null;
  environIndicator: number | null; // CO2 em kg
  environIndicatorHumanReadable: string | null;
  km: number | null;
  kmKWh: number;
  kmKWhHumanReadable: string;
  
  // Outros
  stopReason: string | null;
  stopEventActor: string | null;
  origin: string | null;
  hasPayment: boolean;
  isPaid: boolean | null;
  connectorTypeName: string;
  uuid: string;
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
    token?: string; // Token obtido via login (opcional)
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


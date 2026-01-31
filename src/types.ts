/**
 * Tipos e Interfaces do Discovery Tool
 */

export interface Charger {
  id: string;
  name: string;
  connectors: number[];
}

export interface ChargersConfig {
  chargers: Charger[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SessionInfo {
  cookies: string[];
  headers: Record<string, string>;
  timestamp: string;
}

export interface WebSocketMessage {
  timestamp: string;
  type: string;
  destination?: string;
  body: any;
  headers?: Record<string, string>;
}

export interface DiscoveryConfig {
  baseUrl: string;
  credentials: LoginCredentials;
  chargers: Charger[];
  debug: boolean;
  saveRawMessages: boolean;
  autoReconnect: boolean;
}







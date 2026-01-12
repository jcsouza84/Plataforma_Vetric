# 💻 Exemplos de Código - API CVE-Pro

> Código pronto para copiar e usar em seu projeto

---

## 🔐 Exemplo 1: Autenticação Simples

```typescript
import axios from 'axios';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post<LoginResponse>(
      'https://cs.intelbras-cve-pro.com.br/api/v1/login',
      {
        email,
        password
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const token = response.data.token;
    console.log('✓ Login bem-sucedido!');
    console.log('Token:', token.substring(0, 20) + '...');
    
    return token;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Credenciais inválidas');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Erro ao fazer login');
    }
  }
}

// USO:
const token = await login('admin@exemplo.com', 'senha123');
```

---

## 📦 Exemplo 2: Listar Carregadores

```typescript
import axios from 'axios';

interface Charger {
  id: string;
  name: string;
  model: string;
  status: string;
  connectors: Array<{
    id: number;
    status: string;
    type: string;
    power: number;
  }>;
  location: {
    lat: number;
    lng: number;
  };
  lastHeartbeat: string;
}

async function getChargers(token: string): Promise<Charger[]> {
  try {
    const response = await axios.get<Charger[]>(
      'https://cs.intelbras-cve-pro.com.br/api/v1/chargeBoxes',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log(`✓ ${response.data.length} carregadores encontrados`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Token expirado. Faça login novamente.');
    }
    throw new Error('Erro ao buscar carregadores');
  }
}

// USO:
const chargers = await getChargers(token);

chargers.forEach(c => {
  console.log(`${c.name} (${c.id}): ${c.status}`);
  c.connectors.forEach(conn => {
    console.log(`  ↳ Conector ${conn.id}: ${conn.status} - ${conn.power}W`);
  });
});
```

---

## 🔌 Exemplo 3: Cliente WebSocket Completo

```typescript
import { Client, IMessage } from '@stomp/stompjs';
import WebSocket from 'ws';

interface ChargerConfig {
  id: string;
  name: string;
  connectors: number[];
}

class CVEProWebSocketClient {
  private client: Client | null = null;
  private token: string;
  private chargers: ChargerConfig[];
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(token: string, chargers: ChargerConfig[]) {
    this.token = token;
    this.chargers = chargers;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Gerar IDs para SockJS
      const serverId = Math.floor(Math.random() * 1000);
      const sessionId = this.generateSessionId();
      const wsUrl = `wss://cs.intelbras-cve-pro.com.br/ws/${serverId}/${sessionId}/websocket`;

      console.log('Conectando ao WebSocket...');

      this.client = new Client({
        webSocketFactory: () => {
          return new WebSocket(wsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              'Origin': 'https://mundologic.intelbras-cve-pro.com.br',
              'Authorization': `Bearer ${this.token}`
            }
          }) as any;
        },

        connectHeaders: {
          'accept-version': '1.0,1.1,1.2',
          'heart-beat': '4000,4000',
          'Authorization': `Bearer ${this.token}`
        },

        debug: (str) => {
          // console.log('STOMP:', str);
        },

        onConnect: () => {
          console.log('✓ Conectado ao WebSocket!');
          this.subscribeToChargers();
          resolve();
        },

        onStompError: (frame) => {
          console.error('Erro STOMP:', frame.headers['message']);
          reject(new Error(frame.headers['message']));
        },

        onWebSocketError: (event) => {
          console.error('Erro WebSocket:', event);
          reject(event);
        }
      });

      this.client.activate();
    });
  }

  private subscribeToChargers(): void {
    if (!this.client) return;

    console.log(`Subscrevendo aos ${this.chargers.length} carregadores...`);

    this.chargers.forEach(charger => {
      charger.connectors.forEach(connectorId => {
        const topic = `/topic/status/chargeBox/${charger.id}/connector/${connectorId}`;
        
        this.client!.subscribe(topic, (message: IMessage) => {
          this.handleMessage(message, charger, connectorId);
        });

        console.log(`✓ ${charger.name} - Conector ${connectorId}`);
      });
    });
  }

  private handleMessage(message: IMessage, charger: ChargerConfig, connectorId: number): void {
    try {
      const data = JSON.parse(message.body);
      
      // Chamar handler customizado se existir
      const handlerKey = `${charger.id}-${connectorId}`;
      const handler = this.messageHandlers.get(handlerKey);
      
      if (handler) {
        handler(data);
      } else {
        // Handler padrão
        console.log(`[${charger.name}] Conector ${connectorId}:`, data.status);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  onChargerStatus(
    chargerId: string,
    connectorId: number,
    handler: (data: any) => void
  ): void {
    const key = `${chargerId}-${connectorId}`;
    this.messageHandlers.set(key, handler);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.deactivate();
      console.log('✓ Desconectado');
    }
  }

  private generateSessionId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}

// USO:
const wsClient = new CVEProWebSocketClient(token, [
  { id: 'JDBM1900145Z6', name: 'Gran Marine 1', connectors: [1] },
  { id: 'JDBM1900101FE', name: 'Gran Marine 2', connectors: [1] }
]);

// Definir handlers customizados
wsClient.onChargerStatus('JDBM1900145Z6', 1, (data) => {
  console.log('Gran Marine 1:', data.status);
  
  if (data.status === 'Charging') {
    console.log('  TAG:', data.idTag);
    console.log('  Transação:', data.transactionId);
    
    if (data.meterValue) {
      const power = data.meterValue.sampledValue.find(
        (v: any) => v.measurand === 'Power.Active.Import'
      );
      console.log('  Potência:', power?.value, 'W');
    }
  }
});

// Conectar
await wsClient.connect();

// Manter rodando...
// Para desconectar: await wsClient.disconnect();
```

---

## 📊 Exemplo 4: Buscar Transações com Filtros

```typescript
import axios from 'axios';

interface Transaction {
  id: number;
  chargeBoxId: string;
  connectorId: number;
  idTag: string;
  startTime: string;
  stopTime: string;
  meterStart: number;
  meterStop: number;
  energyConsumed: number;
  duration: number;
  cost: number;
  status: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

async function getTransactions(
  token: string,
  options: {
    chargeBoxId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  
  if (options.chargeBoxId) params.append('chargeBoxId', options.chargeBoxId);
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());

  const response = await axios.get<TransactionsResponse>(
    `https://cs.intelbras-cve-pro.com.br/api/v1/transactions?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );

  return response.data;
}

// USO: Buscar transações do mês atual
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const result = await getTransactions(token, {
  startDate: startOfMonth.toISOString(),
  endDate: endOfMonth.toISOString(),
  limit: 100
});

console.log(`Total de transações: ${result.pagination.total}`);
console.log(`Mostrando ${result.transactions.length} transações\n`);

result.transactions.forEach(tx => {
  const duration = (tx.duration / 3600).toFixed(1); // horas
  console.log(`
Transação #${tx.id}
├─ Carregador: ${tx.chargeBoxId}
├─ TAG: ${tx.idTag}
├─ Energia: ${tx.energyConsumed.toFixed(2)} kWh
├─ Duração: ${duration}h
├─ Custo: R$ ${tx.cost.toFixed(2)}
└─ Data: ${new Date(tx.startTime).toLocaleString()}
  `);
});
```

---

## 💳 Exemplo 5: Gerenciar Tags RFID

```typescript
import axios from 'axios';

interface IdTag {
  idTag: string;
  userId: string;
  userName: string;
  blocked: boolean;
  expiryDate: string;
  parentIdTag?: string;
}

async function getAllTags(token: string): Promise<IdTag[]> {
  const response = await axios.get<IdTag[]>(
    'https://cs.intelbras-cve-pro.com.br/api/v1/idTags',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );

  return response.data;
}

async function createOrUpdateTag(
  token: string,
  tag: Omit<IdTag, 'blocked'>
): Promise<IdTag> {
  const response = await axios.post<IdTag>(
    'https://cs.intelbras-cve-pro.com.br/api/v1/idTags',
    tag,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );

  return response.data;
}

// USO: Criar mapeamento TAG → Morador
const tagMappings = [
  {
    idTag: 'TAG_001_123456',
    userId: 'morador_101',
    userName: 'João Silva',
    expiryDate: '2027-12-31T23:59:59Z'
  },
  {
    idTag: 'TAG_002_789012',
    userId: 'morador_102',
    userName: 'Maria Santos',
    expiryDate: '2027-12-31T23:59:59Z'
  }
];

for (const mapping of tagMappings) {
  try {
    await createOrUpdateTag(token, mapping);
    console.log(`✓ TAG criada: ${mapping.userName} → ${mapping.idTag}`);
  } catch (error) {
    console.error(`✗ Erro ao criar TAG de ${mapping.userName}:`, error);
  }
}

// Listar todas as tags
const allTags = await getAllTags(token);
console.log('\nTags cadastradas:');
allTags.forEach(tag => {
  const status = tag.blocked ? '🔒 BLOQUEADA' : '✓ Ativa';
  console.log(`${tag.userName} (${tag.idTag}): ${status}`);
});
```

---

## ⚙️ Exemplo 6: Comandos Remotos OCPP

```typescript
import axios from 'axios';

// Iniciar carregamento remotamente
async function remoteStartCharging(
  token: string,
  chargeBoxId: string,
  connectorId: number,
  idTag: string
): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://cs.intelbras-cve-pro.com.br/api/v1/ocpp/chargeBoxes/${chargeBoxId}/remoteStart`,
      {
        connectorId,
        idTag
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Comando enviado para iniciar carregamento');
    return response.data.status === 'Accepted';
  } catch (error) {
    console.error('✗ Erro ao iniciar carregamento:', error);
    return false;
  }
}

// Parar carregamento remotamente
async function remoteStopCharging(
  token: string,
  chargeBoxId: string,
  transactionId: number
): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://cs.intelbras-cve-pro.com.br/api/v1/ocpp/chargeBoxes/${chargeBoxId}/remoteStop`,
      {
        transactionId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Comando enviado para parar carregamento');
    return response.data.status === 'Accepted';
  } catch (error) {
    console.error('✗ Erro ao parar carregamento:', error);
    return false;
  }
}

// Destravar conector
async function unlockConnector(
  token: string,
  chargeBoxId: string,
  connectorId: number
): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://cs.intelbras-cve-pro.com.br/api/v1/ocpp/chargeBoxes/${chargeBoxId}/unlockConnector`,
      {
        connectorId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Comando enviado para destravar conector');
    return response.data.status === 'Unlocked';
  } catch (error) {
    console.error('✗ Erro ao destravar conector:', error);
    return false;
  }
}

// Resetar carregador
async function resetCharger(
  token: string,
  chargeBoxId: string,
  type: 'Soft' | 'Hard' = 'Soft'
): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://cs.intelbras-cve-pro.com.br/api/v1/ocpp/chargeBoxes/${chargeBoxId}/reset`,
      {
        type
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✓ Comando enviado para ${type} reset`);
    return response.data.status === 'Accepted';
  } catch (error) {
    console.error('✗ Erro ao resetar carregador:', error);
    return false;
  }
}

// USO:
await remoteStartCharging(token, 'JDBM1900145Z6', 1, 'TAG_001_123456');
await remoteStopCharging(token, 'JDBM1900145Z6', 12345);
await unlockConnector(token, 'JDBM1900145Z6', 1);
await resetCharger(token, 'JDBM1900145Z6', 'Soft');
```

---

## 📊 Exemplo 7: Processar MeterValues em Tempo Real

```typescript
interface MeterValue {
  timestamp: string;
  sampledValue: Array<{
    value: string;
    context: string;
    format: string;
    measurand: string;
    location: string;
    unit: string;
  }>;
}

class MeterValueProcessor {
  static getPower(meterValue: MeterValue): number {
    const power = meterValue.sampledValue.find(
      v => v.measurand === 'Power.Active.Import'
    );
    return power ? parseFloat(power.value) : 0;
  }

  static getEnergy(meterValue: MeterValue): number {
    const energy = meterValue.sampledValue.find(
      v => v.measurand === 'Energy.Active.Import.Register'
    );
    return energy ? parseFloat(energy.value) / 1000 : 0; // Converter para kWh
  }

  static getCurrent(meterValue: MeterValue): number {
    const current = meterValue.sampledValue.find(
      v => v.measurand === 'Current.Import'
    );
    return current ? parseFloat(current.value) : 0;
  }

  static getVoltage(meterValue: MeterValue): number {
    const voltage = meterValue.sampledValue.find(
      v => v.measurand === 'Voltage'
    );
    return voltage ? parseFloat(voltage.value) : 0;
  }

  static getTemperature(meterValue: MeterValue): number {
    const temp = meterValue.sampledValue.find(
      v => v.measurand === 'Temperature'
    );
    return temp ? parseFloat(temp.value) : 0;
  }

  static getSoC(meterValue: MeterValue): number {
    const soc = meterValue.sampledValue.find(
      v => v.measurand === 'SoC'
    );
    return soc ? parseFloat(soc.value) : 0;
  }

  static formatForDisplay(meterValue: MeterValue): string {
    const power = this.getPower(meterValue);
    const energy = this.getEnergy(meterValue);
    const current = this.getCurrent(meterValue);
    const voltage = this.getVoltage(meterValue);
    const temp = this.getTemperature(meterValue);
    const soc = this.getSoC(meterValue);

    return `
┌─────────────────────────────────┐
│  Medições em Tempo Real         │
├─────────────────────────────────┤
│  🔋 Potência:  ${power.toFixed(1)} W (${(power/1000).toFixed(2)} kW)
│  ⚡ Energia:   ${energy.toFixed(2)} kWh
│  🔌 Corrente:  ${current.toFixed(1)} A
│  ⚡ Tensão:    ${voltage.toFixed(1)} V
│  🌡️  Temp:      ${temp.toFixed(1)} °C
│  📊 SoC:       ${soc.toFixed(0)}%
└─────────────────────────────────┘
    `.trim();
  }
}

// USO:
wsClient.onChargerStatus('JDBM1900145Z6', 1, (data) => {
  if (data.status === 'Charging' && data.meterValue) {
    console.log(MeterValueProcessor.formatForDisplay(data.meterValue));
    
    // Calcular custo em tempo real
    const energy = MeterValueProcessor.getEnergy(data.meterValue);
    const costPerKwh = 0.65; // R$ 0,65 por kWh
    const currentCost = energy * costPerKwh;
    
    console.log(`💰 Custo até agora: R$ ${currentCost.toFixed(2)}`);
  }
});
```

---

## 📈 Exemplo 8: Relatório de Consumo por Morador

```typescript
interface ChargerUsageReport {
  userName: string;
  idTag: string;
  totalSessions: number;
  totalEnergy: number; // kWh
  totalCost: number; // R$
  totalDuration: number; // segundos
  averageEnergy: number; // kWh
  averageDuration: number; // segundos
}

async function generateUsageReport(
  token: string,
  startDate: string,
  endDate: string
): Promise<ChargerUsageReport[]> {
  // 1. Buscar todas as transações do período
  const { transactions } = await getTransactions(token, {
    startDate,
    endDate,
    limit: 1000
  });

  // 2. Buscar informações das tags
  const tags = await getAllTags(token);
  const tagMap = new Map(tags.map(t => [t.idTag, t.userName]));

  // 3. Agrupar por usuário
  const reportMap = new Map<string, ChargerUsageReport>();

  transactions.forEach(tx => {
    const userName = tagMap.get(tx.idTag) || 'Desconhecido';
    
    if (!reportMap.has(tx.idTag)) {
      reportMap.set(tx.idTag, {
        userName,
        idTag: tx.idTag,
        totalSessions: 0,
        totalEnergy: 0,
        totalCost: 0,
        totalDuration: 0,
        averageEnergy: 0,
        averageDuration: 0
      });
    }

    const report = reportMap.get(tx.idTag)!;
    report.totalSessions++;
    report.totalEnergy += tx.energyConsumed;
    report.totalCost += tx.cost;
    report.totalDuration += tx.duration;
  });

  // 4. Calcular médias
  const reports = Array.from(reportMap.values());
  reports.forEach(report => {
    report.averageEnergy = report.totalEnergy / report.totalSessions;
    report.averageDuration = report.totalDuration / report.totalSessions;
  });

  // 5. Ordenar por consumo total
  reports.sort((a, b) => b.totalEnergy - a.totalEnergy);

  return reports;
}

// USO: Relatório do mês atual
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const reports = await generateUsageReport(
  token,
  startOfMonth.toISOString(),
  endOfMonth.toISOString()
);

console.log('\n📊 RELATÓRIO DE CONSUMO POR MORADOR\n');
console.log('─'.repeat(80));
console.log(
  'Nome'.padEnd(20),
  'Sessões'.padEnd(10),
  'Energia'.padEnd(15),
  'Custo'.padEnd(12),
  'Tempo'
);
console.log('─'.repeat(80));

reports.forEach(report => {
  const avgDurationHours = (report.averageDuration / 3600).toFixed(1);
  const totalDurationHours = (report.totalDuration / 3600).toFixed(1);
  
  console.log(
    report.userName.padEnd(20),
    report.totalSessions.toString().padEnd(10),
    `${report.totalEnergy.toFixed(1)} kWh`.padEnd(15),
    `R$ ${report.totalCost.toFixed(2)}`.padEnd(12),
    `${totalDurationHours}h (avg ${avgDurationHours}h)`
  );
});

console.log('─'.repeat(80));

const totals = reports.reduce((acc, r) => ({
  sessions: acc.sessions + r.totalSessions,
  energy: acc.energy + r.totalEnergy,
  cost: acc.cost + r.totalCost
}), { sessions: 0, energy: 0, cost: 0 });

console.log(
  'TOTAL'.padEnd(20),
  totals.sessions.toString().padEnd(10),
  `${totals.energy.toFixed(1)} kWh`.padEnd(15),
  `R$ ${totals.cost.toFixed(2)}`
);
```

---

## 🔄 Exemplo 9: Sistema Completo com Auto-Reconnect

```typescript
import { Client } from '@stomp/stompjs';
import WebSocket from 'ws';
import axios from 'axios';

class CVEProMonitor {
  private token: string = '';
  private wsClient: CVEProWebSocketClient | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private isRunning: boolean = false;

  async start(email: string, password: string): Promise<void> {
    this.isRunning = true;
    
    try {
      // Login
      console.log('🔐 Fazendo login...');
      this.token = await login(email, password);
      console.log('✓ Login bem-sucedido\n');

      // Buscar carregadores
      console.log('📦 Buscando carregadores...');
      const chargers = await getChargers(this.token);
      console.log(`✓ ${chargers.length} carregadores encontrados\n`);

      const chargerConfigs = chargers.map(c => ({
        id: c.id,
        name: c.name,
        connectors: c.connectors.map(conn => conn.id)
      }));

      // Conectar WebSocket
      await this.connectWebSocket(chargerConfigs);

    } catch (error) {
      console.error('❌ Erro ao iniciar monitor:', error);
      await this.retry();
    }
  }

  private async connectWebSocket(chargers: ChargerConfig[]): Promise<void> {
    try {
      console.log('🔌 Conectando ao WebSocket...');
      
      this.wsClient = new CVEProWebSocketClient(this.token, chargers);
      
      // Configurar handlers
      chargers.forEach(charger => {
        charger.connectors.forEach(connectorId => {
          this.wsClient!.onChargerStatus(charger.id, connectorId, (data) => {
            this.handleStatusUpdate(charger.name, connectorId, data);
          });
        });
      });

      await this.wsClient.connect();
      console.log('✓ WebSocket conectado\n');
      console.log('📡 Monitorando em tempo real...\n');

      this.reconnectAttempts = 0;

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      await this.retry();
    }
  }

  private handleStatusUpdate(chargerName: string, connectorId: number, data: any): void {
    const timestamp = new Date().toLocaleString();
    console.log(`\n[${timestamp}] ${chargerName} - Conector ${connectorId}`);
    console.log(`Status: ${data.status}`);

    if (data.status === 'Charging') {
      console.log(`TAG: ${data.idTag}`);
      if (data.meterValue) {
        const power = MeterValueProcessor.getPower(data.meterValue);
        const energy = MeterValueProcessor.getEnergy(data.meterValue);
        console.log(`Potência: ${(power/1000).toFixed(2)} kW`);
        console.log(`Energia: ${energy.toFixed(2)} kWh`);
      }
    }

    console.log('─'.repeat(50));
  }

  private async retry(): Promise<void> {
    if (!this.isRunning) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Número máximo de tentativas de reconexão excedido');
      this.stop();
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`⏳ Tentando reconectar em ${delay/1000}s... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Tentar conectar novamente
    if (this.wsClient) {
      const chargers = []; // Buscar novamente ou usar cache
      await this.connectWebSocket(chargers);
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.wsClient) {
      await this.wsClient.disconnect();
    }
    console.log('✓ Monitor encerrado');
  }
}

// USO:
const monitor = new CVEProMonitor();

// Iniciar
await monitor.start('admin@exemplo.com', 'senha123');

// Para parar: Ctrl+C ou
process.on('SIGINT', async () => {
  console.log('\n\nEncerrando...');
  await monitor.stop();
  process.exit(0);
});
```

---

## 📝 Configuração package.json

```json
{
  "name": "vetric-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node-esm src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "monitor": "ts-node-esm examples/monitor.ts"
  },
  "dependencies": {
    "axios": "^1.6.5",
    "@stomp/stompjs": "^7.0.0",
    "ws": "^8.16.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "@types/node": "^20.11.5",
    "@types/ws": "^8.5.10"
  }
}
```

---

## 🔒 Arquivo .env

```env
# CVE-Pro API
CVEPRO_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVEPRO_EMAIL=admin@exemplo.com
CVEPRO_PASSWORD=sua_senha_aqui

# Configurações
DEBUG_MODE=false
AUTO_RECONNECT=true
RECONNECT_MAX_ATTEMPTS=10

# Custo de energia
ENERGY_COST_PER_KWH=0.65
```

---

**Desenvolvido para VETRIC** 🚀  
**Exemplos de Código v1.0**

> 💡 **Dica:** Copie estes exemplos e adapte para seu caso de uso específico!


# 📡 Documentação Completa - API Intelbras CVE-Pro

## 📌 Visão Geral

A **Intelbras CVE-Pro** é uma plataforma de gerenciamento de carregadores de veículos elétricos (CVE) que oferece duas formas principais de integração:

1. **API REST** - Para operações CRUD e consultas
2. **WebSocket STOMP** - Para monitoramento em tempo real

**URL Base:** `https://cs.intelbras-cve-pro.com.br`  
**Frontend:** `https://mundologic.intelbras-cve-pro.com.br`  
**Documentação:** https://cs-test.intelbras-cve-pro.com.br/doc-api#/

---

## 🔐 Autenticação

### Sistema de Autenticação

O CVE-Pro usa **autenticação baseada em JWT** (JSON Web Token) com proteção adicional de **reCAPTCHA v3**.

### Endpoint de Login

```
POST /api/v1/login
```

**Request:**
```json
{
  "email": "seu_usuario@exemplo.com",
  "password": "sua_senha",
  "recaptchaToken": "token_do_recaptcha_v3"
}
```

**Response (Sucesso):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "seu_usuario@exemplo.com",
    "name": "Seu Nome",
    "role": "ADMIN"
  }
}
```

### Headers Necessários

Após autenticação, todas as requisições devem incluir:

```http
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
Accept: application/json
```

### Cookies de Sessão

Além do token JWT, o sistema pode usar cookies de sessão:
- `JSESSIONID` - Cookie de sessão Java/Spring
- `session` - Cookie de sessão genérico

---

## 🌐 API REST - Endpoints Principais

### 1. Carregadores (Charge Boxes)

#### Listar Todos os Carregadores
```
GET /api/v1/chargeBoxes
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "JDBM1900145Z6",
    "name": "Gran Marine 1",
    "model": "JDBM",
    "status": "Available",
    "connectors": [
      {
        "id": 1,
        "status": "Available",
        "type": "Type2",
        "power": 7400
      }
    ],
    "location": {
      "lat": -23.5505,
      "lng": -46.6333
    },
    "lastHeartbeat": "2026-01-08T12:00:00Z"
  }
]
```

#### Detalhes de um Carregador
```
GET /api/v1/chargeBoxes/{chargeBoxId}
Authorization: Bearer <token>
```

#### Status de um Conector
```
GET /api/v1/chargeBoxes/{chargeBoxId}/connectors/{connectorId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "chargeBoxId": "JDBM1900145Z6",
  "connectorId": 1,
  "status": "Charging",
  "currentTransaction": {
    "transactionId": 12345,
    "idTag": "TAG_RFID_123",
    "startTime": "2026-01-08T10:00:00Z",
    "meterStart": 1234567,
    "meterValue": 1234580,
    "energyConsumed": 13.5,
    "currentPower": 7.4,
    "duration": 7200
  },
  "errorCode": "NoError"
}
```

### 2. Transações

#### Listar Transações
```
GET /api/v1/transactions
Authorization: Bearer <token>

Query Parameters:
- chargeBoxId: string (opcional)
- startDate: ISO8601 date
- endDate: ISO8601 date
- status: Active | Completed
- page: number
- limit: number
```

**Response:**
```json
{
  "transactions": [
    {
      "id": 12345,
      "chargeBoxId": "JDBM1900145Z6",
      "connectorId": 1,
      "idTag": "TAG_RFID_123",
      "startTime": "2026-01-08T10:00:00Z",
      "stopTime": "2026-01-08T12:00:00Z",
      "meterStart": 1234567,
      "meterStop": 1234590,
      "energyConsumed": 23.5,
      "duration": 7200,
      "cost": 15.50,
      "status": "Completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### Detalhes de uma Transação
```
GET /api/v1/transactions/{transactionId}
Authorization: Bearer <token>
```

#### Iniciar Transação Remotamente
```
POST /api/v1/chargeBoxes/{chargeBoxId}/connectors/{connectorId}/start
Authorization: Bearer <token>

Body:
{
  "idTag": "TAG_RFID_123"
}
```

#### Parar Transação Remotamente
```
POST /api/v1/chargeBoxes/{chargeBoxId}/connectors/{connectorId}/stop
Authorization: Bearer <token>

Body:
{
  "transactionId": 12345
}
```

### 3. Usuários e Tags RFID

#### Listar Usuários
```
GET /api/v1/users
Authorization: Bearer <token>
```

#### Listar Tags RFID
```
GET /api/v1/idTags
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "idTag": "TAG_RFID_123",
    "userId": "user_001",
    "userName": "João Silva",
    "blocked": false,
    "expiryDate": "2027-12-31T23:59:59Z",
    "parentIdTag": null
  }
]
```

#### Criar/Atualizar Tag RFID
```
POST /api/v1/idTags
Authorization: Bearer <token>

Body:
{
  "idTag": "TAG_RFID_456",
  "userId": "user_002",
  "userName": "Maria Santos",
  "expiryDate": "2027-12-31T23:59:59Z"
}
```

### 4. Estatísticas e Relatórios

#### Dashboard de Estatísticas
```
GET /api/v1/dashboard/stats
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO8601 date
- endDate: ISO8601 date
```

**Response:**
```json
{
  "totalChargeBoxes": 5,
  "availableChargeBoxes": 3,
  "chargingChargeBoxes": 2,
  "faultedChargeBoxes": 0,
  "totalTransactions": 1500,
  "totalEnergyConsumed": 12450.5,
  "totalRevenue": 8500.25,
  "averageSessionDuration": 3600
}
```

#### Consumo de Energia
```
GET /api/v1/reports/energy
Authorization: Bearer <token>

Query Parameters:
- chargeBoxId: string (opcional)
- startDate: ISO8601 date
- endDate: ISO8601 date
- groupBy: hour | day | week | month
```

---

## 🔌 WebSocket STOMP - Tempo Real

### Conexão WebSocket

O CVE-Pro usa **STOMP** (Simple Text Oriented Messaging Protocol) sobre **WebSocket** para comunicação em tempo real.

#### URL de Conexão
```
wss://cs.intelbras-cve-pro.com.br/ws/{server-id}/{session-id}/websocket
```

- `{server-id}`: Número aleatório entre 0-999
- `{session-id}`: String aleatória de 8 caracteres alfanuméricos

**Exemplo:**
```
wss://cs.intelbras-cve-pro.com.br/ws/123/abc12def/websocket
```

### Headers WebSocket

```javascript
{
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Origin': 'https://mundologic.intelbras-cve-pro.com.br',
  'Host': 'cs.intelbras-cve-pro.com.br',
  'Cookie': 'JSESSIONID=xxx; session=yyy',
  'Authorization': 'Bearer <token_jwt>'
}
```

### Frame CONNECT (STOMP)

```stomp
CONNECT
accept-version:1.0,1.1,1.2
heart-beat:4000,4000
Authorization:Bearer <token_jwt>
X-Authorization:<token_jwt>

^@
```

### Tópicos Disponíveis

#### 1. Status de Conector Específico
```
/topic/status/chargeBox/{chargeBoxId}/connector/{connectorId}
```

**Exemplo:**
```
/topic/status/chargeBox/JDBM1900145Z6/connector/1
```

**Mensagens Recebidas:**

**Estado: Disponível**
```json
{
  "connectorId": 1,
  "status": "Available",
  "timestamp": "2026-01-08T12:00:00Z",
  "errorCode": "NoError",
  "info": "",
  "vendorId": "",
  "vendorErrorCode": ""
}
```

**Estado: Carregando**
```json
{
  "connectorId": 1,
  "status": "Charging",
  "timestamp": "2026-01-08T12:05:00Z",
  "errorCode": "NoError",
  "transactionId": 12345,
  "idTag": "TAG_RFID_123",
  "meterValue": {
    "timestamp": "2026-01-08T12:05:00Z",
    "sampledValue": [
      {
        "value": "7400",
        "context": "Sample.Periodic",
        "format": "Raw",
        "measurand": "Power.Active.Import",
        "location": "Outlet",
        "unit": "W"
      },
      {
        "value": "1234580",
        "context": "Sample.Periodic",
        "format": "Raw",
        "measurand": "Energy.Active.Import.Register",
        "location": "Outlet",
        "unit": "Wh"
      },
      {
        "value": "220.5",
        "context": "Sample.Periodic",
        "format": "Raw",
        "measurand": "Voltage",
        "location": "Outlet",
        "unit": "V"
      },
      {
        "value": "32.1",
        "context": "Sample.Periodic",
        "format": "Raw",
        "measurand": "Current.Import",
        "location": "Outlet",
        "unit": "A"
      },
      {
        "value": "45",
        "context": "Sample.Periodic",
        "format": "Raw",
        "measurand": "Temperature",
        "location": "Body",
        "unit": "Celsius"
      }
    ]
  }
}
```

**Estado: Ocupado (Cabo Conectado)**
```json
{
  "connectorId": 1,
  "status": "Occupied",
  "timestamp": "2026-01-08T12:03:00Z",
  "errorCode": "NoError",
  "idTag": "TAG_RFID_123"
}
```

**Estado: Preparando**
```json
{
  "connectorId": 1,
  "status": "Preparing",
  "timestamp": "2026-01-08T12:04:00Z",
  "errorCode": "NoError",
  "transactionId": 12345,
  "idTag": "TAG_RFID_123"
}
```

**Estado: Finalizando**
```json
{
  "connectorId": 1,
  "status": "Finishing",
  "timestamp": "2026-01-08T14:00:00Z",
  "errorCode": "NoError",
  "transactionId": 12345,
  "idTag": "TAG_RFID_123",
  "meterStop": 1234590,
  "energyConsumed": 23.5
}
```

**Estado: Falha**
```json
{
  "connectorId": 1,
  "status": "Faulted",
  "timestamp": "2026-01-08T12:30:00Z",
  "errorCode": "OverCurrentFailure",
  "info": "Corrente acima do limite permitido",
  "vendorId": "INTELBRAS",
  "vendorErrorCode": "ERR_001"
}
```

#### 2. Status Geral do Carregador
```
/topic/status/chargeBox/{chargeBoxId}
```

**Mensagens:**
```json
{
  "chargeBoxId": "JDBM1900145Z6",
  "status": "Available",
  "timestamp": "2026-01-08T12:00:00Z",
  "connectors": [
    {
      "id": 1,
      "status": "Available",
      "errorCode": "NoError"
    }
  ],
  "firmwareVersion": "1.2.5",
  "lastHeartbeat": "2026-01-08T12:00:00Z"
}
```

#### 3. Notificações Gerais
```
/topic/notifications
/user/queue/notifications
```

**Mensagens:**
```json
{
  "type": "TRANSACTION_STARTED",
  "chargeBoxId": "JDBM1900145Z6",
  "connectorId": 1,
  "transactionId": 12345,
  "idTag": "TAG_RFID_123",
  "timestamp": "2026-01-08T10:00:00Z"
}
```

```json
{
  "type": "TRANSACTION_COMPLETED",
  "chargeBoxId": "JDBM1900145Z6",
  "connectorId": 1,
  "transactionId": 12345,
  "energyConsumed": 23.5,
  "duration": 7200,
  "cost": 15.50,
  "timestamp": "2026-01-08T12:00:00Z"
}
```

```json
{
  "type": "CHARGER_OFFLINE",
  "chargeBoxId": "JDBM1900145Z6",
  "lastSeen": "2026-01-08T11:50:00Z",
  "timestamp": "2026-01-08T12:05:00Z"
}
```

#### 4. Status Geral
```
/topic/status
/user/queue/status
```

---

## 📊 Protocolo OCPP

O CVE-Pro implementa o **OCPP** (Open Charge Point Protocol), que é o padrão internacional para comunicação com carregadores de VE.

### Estados Possíveis de Conector

| Estado | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| `Available` | Disponível para uso | Carregador livre, sem cabo conectado |
| `Preparing` | Preparando para carregar | Após autorização, antes de iniciar carga |
| `Charging` | Carregando | Carga em andamento |
| `SuspendedEV` | Suspenso pelo veículo | Veículo pausou a carga (bateria cheia, etc) |
| `SuspendedEVSE` | Suspenso pela estação | Estação pausou a carga (limite de energia, etc) |
| `Finishing` | Finalizando | Carga concluída, aguardando desconexão |
| `Reserved` | Reservado | Conector reservado para usuário específico |
| `Occupied` | Ocupado | Cabo conectado mas não carregando |
| `Unavailable` | Indisponível | Carregador offline ou em manutenção |
| `Faulted` | Com falha | Erro no carregador |

### Códigos de Erro (Error Codes)

| Código | Descrição |
|--------|-----------|
| `NoError` | Sem erro |
| `ConnectorLockFailure` | Falha ao travar conector |
| `EVCommunicationError` | Erro de comunicação com veículo |
| `GroundFailure` | Falha de aterramento |
| `HighTemperature` | Temperatura alta |
| `InternalError` | Erro interno |
| `LocalListConflict` | Conflito na lista local de autorizações |
| `OtherError` | Outro erro |
| `OverCurrentFailure` | Sobrecorrente detectada |
| `OverVoltage` | Sobretensão |
| `PowerMeterFailure` | Falha no medidor de energia |
| `PowerSwitchFailure` | Falha no switch de energia |
| `ReaderFailure` | Falha no leitor RFID |
| `ResetFailure` | Falha ao resetar |
| `UnderVoltage` | Subtensão |
| `WeakSignal` | Sinal fraco (comunicação) |

### Medidas (Measurands)

Valores que podem ser medidos durante o carregamento:

| Measurand | Unidade | Descrição |
|-----------|---------|-----------|
| `Energy.Active.Import.Register` | Wh | Energia total consumida |
| `Power.Active.Import` | W | Potência ativa atual |
| `Current.Import` | A | Corrente elétrica |
| `Current.Offered` | A | Corrente oferecida |
| `Voltage` | V | Tensão |
| `Temperature` | Celsius | Temperatura do equipamento |
| `SoC` | Percent | Estado de carga da bateria do VE |
| `Frequency` | Hz | Frequência da rede |
| `Power.Factor` | - | Fator de potência |
| `RPM` | RPM | Rotações (se aplicável) |

---

## 🔧 Comandos Remotos (OCPP)

O CVE-Pro permite enviar comandos remotos para os carregadores:

### 1. Remote Start Transaction
```
POST /api/v1/ocpp/chargeBoxes/{chargeBoxId}/remoteStart
Authorization: Bearer <token>

Body:
{
  "connectorId": 1,
  "idTag": "TAG_RFID_123"
}
```

### 2. Remote Stop Transaction
```
POST /api/v1/ocpp/chargeBoxes/{chargeBoxId}/remoteStop
Authorization: Bearer <token>

Body:
{
  "transactionId": 12345
}
```

### 3. Unlock Connector
```
POST /api/v1/ocpp/chargeBoxes/{chargeBoxId}/unlockConnector
Authorization: Bearer <token>

Body:
{
  "connectorId": 1
}
```

### 4. Reset
```
POST /api/v1/ocpp/chargeBoxes/{chargeBoxId}/reset
Authorization: Bearer <token>

Body:
{
  "type": "Soft" // ou "Hard"
}
```

### 5. Change Configuration
```
POST /api/v1/ocpp/chargeBoxes/{chargeBoxId}/changeConfiguration
Authorization: Bearer <token>

Body:
{
  "key": "HeartbeatInterval",
  "value": "300"
}
```

### 6. Get Configuration
```
POST /api/v1/ocpp/chargeBoxes/{chargeBoxId}/getConfiguration
Authorization: Bearer <token>

Body:
{
  "key": ["HeartbeatInterval", "MeterValueSampleInterval"]
}
```

### 7. Trigger Message
```
POST /api/v1/ocpp/chargeBoxes/{chargeBoxId}/triggerMessage
Authorization: Bearer <token>

Body:
{
  "requestedMessage": "StatusNotification", // ou "MeterValues", "Heartbeat"
  "connectorId": 1
}
```

---

## 🔒 Segurança e Boas Práticas

### Tokens JWT

- **Validade:** Tokens geralmente expiram em 24 horas
- **Renovação:** Faça novo login quando o token expirar
- **Armazenamento:** NUNCA comite tokens em repositórios
- **HTTPS:** Sempre use HTTPS/WSS em produção

### Rate Limiting

A API pode ter limites de taxa:
- Respeite os headers `X-RateLimit-*` nas respostas
- Implemente retry com exponential backoff
- Use WebSocket para dados em tempo real (mais eficiente)

### Cookies e CORS

- **Origin:** Use `https://mundologic.intelbras-cve-pro.com.br` como Origin
- **Credentials:** Sempre use `withCredentials: true` em requisições AJAX
- **Cookies:** SameSite pode bloquear cookies entre domínios

---

## 💡 Casos de Uso Comuns

### 1. Monitorar Status de Todos os Carregadores

**Via REST (Polling):**
```javascript
setInterval(async () => {
  const response = await axios.get('/api/v1/chargeBoxes', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(response.data);
}, 30000); // A cada 30 segundos
```

**Via WebSocket (Tempo Real):**
```javascript
// Subscrever a cada carregador
chargers.forEach(charger => {
  client.subscribe(`/topic/status/chargeBox/${charger.id}/connector/1`, 
    (message) => {
      console.log('Status atualizado:', JSON.parse(message.body));
    }
  );
});
```

### 2. Identificar Quem Está Carregando

```javascript
// Quando receber mensagem com status "Charging"
if (message.body.status === 'Charging') {
  const idTag = message.body.idTag;
  
  // Buscar informações do usuário
  const user = await axios.get(`/api/v1/idTags/${idTag}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log(`${user.data.userName} está carregando`);
}
```

### 3. Calcular Consumo e Custo

```javascript
// Quando transação finalizar
if (message.body.status === 'Finishing') {
  const transactionId = message.body.transactionId;
  
  // Buscar detalhes completos
  const transaction = await axios.get(`/api/v1/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const energyKwh = transaction.data.energyConsumed;
  const durationHours = transaction.data.duration / 3600;
  const cost = energyKwh * 0.65; // R$ 0,65 por kWh (exemplo)
  
  console.log(`Consumo: ${energyKwh} kWh | Custo: R$ ${cost.toFixed(2)}`);
}
```

### 4. Relatório de Uso por Morador

```javascript
// Buscar todas as transações de um período
const response = await axios.get('/api/v1/transactions', {
  params: {
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-31T23:59:59Z'
  },
  headers: { Authorization: `Bearer ${token}` }
});

// Agrupar por usuário
const byUser = {};
response.data.transactions.forEach(tx => {
  if (!byUser[tx.idTag]) {
    byUser[tx.idTag] = {
      count: 0,
      totalEnergy: 0,
      totalCost: 0
    };
  }
  byUser[tx.idTag].count++;
  byUser[tx.idTag].totalEnergy += tx.energyConsumed;
  byUser[tx.idTag].totalCost += tx.cost;
});

console.table(byUser);
```

---

## 🛠️ Exemplo Completo de Integração

```typescript
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import WebSocket from 'ws';

class CVEProClient {
  private baseUrl: string;
  private token: string | null = null;
  private wsClient: Client | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // 1. Fazer Login
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/v1/login`, {
        email,
        password
      });
      
      this.token = response.data.token;
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }

  // 2. Listar Carregadores
  async getChargers() {
    const response = await axios.get(`${this.baseUrl}/api/v1/chargeBoxes`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  // 3. Conectar WebSocket
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      const wsUrl = this.baseUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://') + '/ws/123/abcd1234/websocket';

      this.wsClient = new Client({
        webSocketFactory: () => new WebSocket(wsUrl, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Origin': 'https://mundologic.intelbras-cve-pro.com.br'
          }
        }) as any,
        
        connectHeaders: {
          'Authorization': `Bearer ${this.token}`
        },
        
        onConnect: () => {
          console.log('✓ Conectado ao WebSocket');
          resolve(true);
        },
        
        onStompError: (frame) => {
          console.error('Erro STOMP:', frame);
          reject(frame);
        }
      });

      this.wsClient.activate();
    });
  }

  // 4. Subscrever a um Carregador
  subscribeToCharger(chargeBoxId: string, connectorId: number, callback: (data: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket não conectado');
    }

    const topic = `/topic/status/chargeBox/${chargeBoxId}/connector/${connectorId}`;
    
    this.wsClient.subscribe(topic, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  // 5. Iniciar Carregamento Remoto
  async startCharging(chargeBoxId: string, connectorId: number, idTag: string) {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/ocpp/chargeBoxes/${chargeBoxId}/remoteStart`,
      { connectorId, idTag },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return response.data;
  }

  // 6. Parar Carregamento Remoto
  async stopCharging(chargeBoxId: string, transactionId: number) {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/ocpp/chargeBoxes/${chargeBoxId}/remoteStop`,
      { transactionId },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return response.data;
  }
}

// USO:
const client = new CVEProClient('https://cs.intelbras-cve-pro.com.br');

// Login
await client.login('admin@exemplo.com', 'senha123');

// Listar carregadores
const chargers = await client.getChargers();
console.log('Carregadores:', chargers);

// Conectar WebSocket
await client.connectWebSocket();

// Monitorar carregador
client.subscribeToCharger('JDBM1900145Z6', 1, (data) => {
  console.log('Status atualizado:', data);
  
  if (data.status === 'Charging') {
    console.log(`💡 Carregando - ${data.meterValue?.sampledValue[0]?.value} W`);
  }
});
```

---

## 📋 Checklist de Implementação

### ✅ Fase 1: Autenticação
- [ ] Implementar login com JWT
- [ ] Tratar expiração de token
- [ ] Armazenar token de forma segura
- [ ] Implementar refresh token (se disponível)

### ✅ Fase 2: API REST
- [ ] Listar carregadores
- [ ] Obter status de conectores
- [ ] Buscar transações
- [ ] Buscar usuários/tags RFID
- [ ] Implementar paginação
- [ ] Tratar erros de API

### ✅ Fase 3: WebSocket Real-Time
- [ ] Conectar ao WebSocket STOMP
- [ ] Subscrever aos tópicos corretos
- [ ] Processar mensagens de status
- [ ] Implementar reconexão automática
- [ ] Tratar erros de conexão

### ✅ Fase 4: Lógica de Negócio
- [ ] Mapear TAG RFID → Nome do morador
- [ ] Calcular consumo de energia
- [ ] Calcular custo por sessão
- [ ] Gerar relatórios
- [ ] Alertas e notificações

### ✅ Fase 5: Interface
- [ ] Dashboard em tempo real
- [ ] Lista de carregadores com status
- [ ] Histórico de transações
- [ ] Relatórios por morador
- [ ] Gráficos de consumo

---

## 🐛 Troubleshooting

### Problema: "401 Unauthorized"
**Causa:** Token expirado ou inválido  
**Solução:** Faça login novamente e atualize o token

### Problema: "reCAPTCHA validation failed"
**Causa:** Login via API requer token reCAPTCHA  
**Solução:** Use sessão manual com cookies capturados do navegador (ver `MANUAL_COOKIES_GUIDE.md`)

### Problema: WebSocket desconecta imediatamente
**Causa:** Cookies ou token incorretos/expirados  
**Solução:** Capture novos cookies do navegador após novo login

### Problema: "No messages received"
**Causa:** IDs dos carregadores incorretos ou carregadores offline  
**Solução:** Verifique IDs em `chargers.json` e status dos carregadores

### Problema: "CORS error"
**Causa:** Origin incorreto nas requisições  
**Solução:** Use `https://mundologic.intelbras-cve-pro.com.br` como Origin

---

## 📚 Recursos Adicionais

### Documentação Oficial
- **API Docs:** https://cs-test.intelbras-cve-pro.com.br/doc-api#/
- **Suporte Intelbras:** https://www.intelbras.com/en/support

### Protocolo OCPP
- **OCPP 1.6 Spec:** https://www.openchargealliance.org/protocols/ocpp-16/
- **OCPP 2.0.1 Spec:** https://www.openchargealliance.org/protocols/ocpp-201/

### Ferramentas
- **STOMP.js:** https://stomp-js.github.io/
- **Axios:** https://axios-http.com/
- **WebSocket (ws):** https://github.com/websockets/ws

---

## 📞 Suporte

**Projeto:** VETRIC CVE Discovery Tool  
**Versão:** 1.0.0  
**Data:** Janeiro 2026

Para dúvidas sobre este documento ou o Discovery Tool, consulte:
- `README.md` - Documentação principal do projeto
- `MANUAL_COOKIES_GUIDE.md` - Como capturar cookies manualmente
- `TEST_CHECKLIST.md` - Checklist de testes

---

**Desenvolvido para VETRIC** 🚀


# ⚡ Referência Rápida - API CVE-Pro

> Guia visual de consulta rápida para desenvolvimento

---

## 🔐 Autenticação

```javascript
// Login
POST /api/v1/login
{
  "email": "admin@exemplo.com",
  "password": "senha123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Usar em todas as requisições
Authorization: Bearer <token>
```

---

## 🌐 Endpoints REST Principais

### Carregadores
```
GET  /api/v1/chargeBoxes                           # Listar todos
GET  /api/v1/chargeBoxes/{id}                      # Detalhes
GET  /api/v1/chargeBoxes/{id}/connectors/{num}    # Status conector
```

### Transações
```
GET  /api/v1/transactions                          # Histórico
GET  /api/v1/transactions/{id}                     # Detalhes
```

### Tags RFID
```
GET  /api/v1/idTags                                # Listar
POST /api/v1/idTags                                # Criar/atualizar
```

### Comandos OCPP
```
POST /api/v1/ocpp/chargeBoxes/{id}/remoteStart    # Iniciar carga
POST /api/v1/ocpp/chargeBoxes/{id}/remoteStop     # Parar carga
POST /api/v1/ocpp/chargeBoxes/{id}/reset          # Resetar
```

---

## 🔌 WebSocket STOMP

### URL
```
wss://cs.intelbras-cve-pro.com.br/ws/{server-id}/{session-id}/websocket
```

### Tópicos
```stomp
/topic/status/chargeBox/{id}/connector/{num}    # Status conector específico
/topic/status/chargeBox/{id}                    # Status carregador
/topic/notifications                            # Notificações gerais
```

---

## 📊 Estados OCPP (Connector Status)

```
┌─────────────────────────────────────────────────────┐
│  Available    → Livre, sem cabo conectado          │
│  Preparing    → Autorizando, preparando            │
│  Charging     → 🔋 CARREGANDO                      │
│  SuspendedEV  → ⏸️  Pausado pelo veículo            │
│  SuspendedEVSE→ ⏸️  Pausado pela estação           │
│  Finishing    → Concluindo, desconectando          │
│  Occupied     → Cabo conectado, não carregando     │
│  Reserved     → Reservado para alguém              │
│  Unavailable  → Offline/manutenção                 │
│  Faulted      → ⚠️  COM ERRO                        │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Códigos de Erro

```
✅ NoError                 Tudo certo
🔒 ConnectorLockFailure    Falha na trava
📡 EVCommunicationError   Erro com veículo
⚡ GroundFailure          Falha aterramento
🌡️  HighTemperature       Temperatura alta
⚙️  InternalError         Erro interno
⚡ OverCurrentFailure     Sobrecorrente
⚡ OverVoltage            Sobretensão
⚡ UnderVoltage           Subtensão
📊 PowerMeterFailure      Falha medidor
💳 ReaderFailure          Falha RFID
📶 WeakSignal             Sinal fraco
```

---

## 📏 Medições (MeterValues)

### Durante Carregamento

```json
{
  "meterValue": {
    "sampledValue": [
      {
        "value": "7400",
        "measurand": "Power.Active.Import",
        "unit": "W"
      },
      {
        "value": "1234580",
        "measurand": "Energy.Active.Import.Register",
        "unit": "Wh"
      },
      {
        "value": "220.5",
        "measurand": "Voltage",
        "unit": "V"
      },
      {
        "value": "32.1",
        "measurand": "Current.Import",
        "unit": "A"
      },
      {
        "value": "45",
        "measurand": "Temperature",
        "unit": "Celsius"
      }
    ]
  }
}
```

### Measurands Comuns

| Medição | Unidade | O Que É |
|---------|---------|---------|
| `Energy.Active.Import.Register` | Wh | Energia total consumida |
| `Power.Active.Import` | W | Potência atual |
| `Current.Import` | A | Corrente elétrica |
| `Voltage` | V | Tensão |
| `Temperature` | °C | Temperatura |
| `SoC` | % | Carga da bateria do VE |

---

## 🔄 Fluxo Típico de Carregamento

```
1️⃣  Available          Carregador livre
          ↓
     [Conecta cabo]
          ↓
2️⃣  Occupied           Cabo conectado
          ↓
     [Passa TAG RFID]
          ↓
3️⃣  Preparing          Autorizando
          ↓
4️⃣  Charging           🔋 CARREGANDO
          ↓              (recebe MeterValues a cada X segundos)
     [Bateria cheia]
          ↓
5️⃣  Finishing          Concluindo
          ↓
     [Remove cabo]
          ↓
6️⃣  Available          Livre novamente
```

---

## 🎯 Casos de Uso Rápidos

### 1. Obter Status de Todos os Carregadores

**Opção A: REST (Polling)**
```javascript
const response = await axios.get('/api/v1/chargeBoxes', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Opção B: WebSocket (Real-Time)**
```javascript
chargers.forEach(c => {
  client.subscribe(`/topic/status/chargeBox/${c.id}/connector/1`, 
    msg => console.log(JSON.parse(msg.body))
  );
});
```

---

### 2. Identificar Quem Está Carregando

```javascript
// Quando receber mensagem com status "Charging"
if (status === 'Charging') {
  const idTag = message.body.idTag;
  
  // Buscar usuário
  const user = await axios.get(`/api/v1/idTags/${idTag}`);
  console.log(`${user.data.userName} está carregando`);
}
```

---

### 3. Calcular Consumo Real

```javascript
// Quando receber MeterValues durante carga
const energy = meterValue.sampledValue.find(
  v => v.measurand === 'Energy.Active.Import.Register'
);

const power = meterValue.sampledValue.find(
  v => v.measurand === 'Power.Active.Import'
);

console.log(`
  Energia: ${energy.value / 1000} kWh
  Potência: ${power.value / 1000} kW
`);
```

---

### 4. Iniciar Carga Remota

```javascript
await axios.post(
  `/api/v1/ocpp/chargeBoxes/${chargeBoxId}/remoteStart`,
  {
    connectorId: 1,
    idTag: 'TAG_RFID_123'
  },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

---

### 5. Parar Carga Remota

```javascript
await axios.post(
  `/api/v1/ocpp/chargeBoxes/${chargeBoxId}/remoteStop`,
  {
    transactionId: 12345
  },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

---

## 🔍 Debugging Rápido

### Verificar Autenticação
```bash
curl -X POST https://cs.intelbras-cve-pro.com.br/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"senha"}'
```

### Listar Carregadores
```bash
curl -X GET https://cs.intelbras-cve-pro.com.br/api/v1/chargeBoxes \
  -H "Authorization: Bearer <token>"
```

### Verificar Logs do Discovery Tool
```bash
cat logs/combined.log | grep ERROR
cat logs/raw-messages/messages-*.json | jq '.'
```

---

## ⚙️ Configuração Rápida

### Headers Padrão
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

### WebSocket Headers
```javascript
const wsHeaders = {
  'User-Agent': 'Mozilla/5.0...',
  'Origin': 'https://mundologic.intelbras-cve-pro.com.br',
  'Host': 'cs.intelbras-cve-pro.com.br',
  'Cookie': 'JSESSIONID=xxx; session=yyy',
  'Authorization': `Bearer ${token}`
};
```

### STOMP Connect Headers
```javascript
const stompHeaders = {
  'accept-version': '1.0,1.1,1.2',
  'heart-beat': '4000,4000',
  'Authorization': `Bearer ${token}`
};
```

---

## 🐛 Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `401 Unauthorized` | Token expirado | Fazer login novamente |
| `reCAPTCHA failed` | Login automático | Usar cookies manuais |
| `WebSocket closed` | Cookies incorretos | Capturar novos cookies |
| `No messages` | IDs errados | Verificar `chargers.json` |
| `CORS error` | Origin incorreto | Usar `mundologic...` |

---

## 📚 Links Úteis

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentação completa
- **[API_SUMMARY.md](API_SUMMARY.md)** - Resumo executivo
- **[MANUAL_COOKIES_GUIDE.md](MANUAL_COOKIES_GUIDE.md)** - Capturar cookies
- **[README.md](README.md)** - Doc principal do projeto

---

## 💡 Dicas Pro

### Performance
- Use WebSocket para dados em tempo real (mais eficiente)
- Use REST apenas para consultas pontuais
- Implemente cache para reduzir requisições

### Segurança
- NUNCA comite tokens em repositórios
- Use variáveis de ambiente (`.env`)
- Renove tokens periodicamente
- Use HTTPS/WSS em produção

### Reliability
- Implemente retry com exponential backoff
- Trate desconexões WebSocket com auto-reconnect
- Valide dados recebidos antes de processar
- Monitore heartbeats

---

## 🚀 Template Rápido

```typescript
import axios from 'axios';
import { Client } from '@stomp/stompjs';

// 1. Login
const { data } = await axios.post('/api/v1/login', {
  email: 'admin@exemplo.com',
  password: 'senha'
});
const token = data.token;

// 2. Listar carregadores
const { data: chargers } = await axios.get('/api/v1/chargeBoxes', {
  headers: { Authorization: `Bearer ${token}` }
});

// 3. WebSocket
const client = new Client({
  brokerURL: 'wss://cs.intelbras-cve-pro.com.br/ws/123/abc/websocket',
  connectHeaders: { Authorization: `Bearer ${token}` },
  
  onConnect: () => {
    chargers.forEach(c => {
      client.subscribe(
        `/topic/status/chargeBox/${c.id}/connector/1`,
        msg => {
          const data = JSON.parse(msg.body);
          console.log(`${c.name}: ${data.status}`);
        }
      );
    });
  }
});

client.activate();
```

---

**Desenvolvido para VETRIC** 🚀  
**Referência Rápida v1.0**


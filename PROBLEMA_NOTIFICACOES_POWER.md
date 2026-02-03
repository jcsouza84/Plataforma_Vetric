# 🚨 PROBLEMA: Notificações de Ociosidade e Bateria Cheia Não Funcionam

**Data:** 03/02/2026 01:45  
**Status:** ⚠️ **PROBLEMA IDENTIFICADO - PRECISA IMPLEMENTAÇÃO**

---

## 🎯 RESUMO DO PROBLEMA

### **Eventos que NÃO funcionam:**
- ❌ **Evento 2:** Início de Ociosidade (power < 10W)
- ❌ **Evento 3:** Bateria Cheia (3+ min ocioso)

### **Eventos que funcionam:**
- ✅ **Evento 1:** Início de Recarga (baseado em transação)
- ✅ **Evento 4:** Interrupção (baseado em status do connector)

---

## 🔍 CAUSA RAIZ

### **API CVE não retorna potência (power) no endpoint `/chargers`**

#### O que tentamos usar:
```typescript
const currentPower = connector.power || connector.lastStatus?.power || 0;
```

#### O que a API CVE realmente retorna:

**Tipo `CVEConnector`:**
```typescript
{
  connectorPk: number,
  connectorId: number,
  powerMax: number | null,    // ← Potência MÁXIMA (7kW, 22kW, etc.)
  lastStatus: {
    status: 'Charging',
    usage: 50,                // ← Parece ser percentual, não power em watts
    // power: NÃO EXISTE! ❌
  }
}
```

#### Onde o power REALMENTE está:

**Logs OCPP - MeterValues:**
```json
{
  "timestamp": "2026-02-02T20:15:14.939580Z",
  "sampledValue": [
    {
      "value": "217.30",
      "measurand": "Voltage",
      "phase": "L1",
      "unit": "V"
    },
    {
      "value": "3293.69",          // ← ESTE É O POWER!
      "measurand": "Power.Active.Import",
      "phase": "L1",
      "unit": "W"                  // ← Em Watts
    }
  ]
}
```

**O power está nos MeterValues que são enviados a cada 15-30 segundos durante o carregamento!**

---

## 🔧 CORREÇÃO TEMPORÁRIA APLICADA

### Para permitir que o deploy funcione:

1. ✅ **Removido** acesso a `connector.power` (não existe)
2. ✅ **Corrigido** `chargerUuid` para `chargeBoxUuid`
3. ⚠️ **Desabilitado** detecção baseada em power:
   ```typescript
   const currentPower = 0; // Temporariamente desabilitado
   ```

### Resultado:
- ✅ Deploy vai funcionar
- ✅ Evento 1 (Início) continua funcionando
- ✅ Evento 4 (Interrupção) continua funcionando
- ❌ Eventos 2 e 3 NÃO vão disparar (aguardando implementação)

---

## 💡 SOLUÇÃO NECESSÁRIA

### **OPÇÃO 1: Buscar Power via Endpoint de Transações (RECOMENDADO)**

A API CVE tem um endpoint que retorna informações detalhadas da transação ativa:

```bash
GET /transactions/{transactionId}
```

**Pode retornar:**
```json
{
  "id": 440059,
  "energy": 15570,              // Energia em Wh
  "energyHumanReadable": "15.57 kWh",
  "duration": 1800,             // Duração em segundos
  "currentPower": 3293          // ← PODE TER POWER AQUI! (verificar)
}
```

**Implementação:**

```typescript
// Em PollingService.ts - método processarEventosCarregamento()

async getPowerFromTransaction(chargerUuid: string): Promise<number> {
  try {
    // Buscar transação ativa do charger
    const transacoes = await cveService.getActiveTransactions();
    const transacao = transacoes.find(t => t.chargeBoxUuid === chargerUuid);
    
    if (!transacao) return 0;
    
    // Se API retornar power atual
    if (transacao.currentPower !== undefined) {
      return transacao.currentPower;
    }
    
    // FALLBACK: Calcular power pela energia/tempo
    // Se energia aumentou muito pouco nos últimos 15seg → ocioso
    // Precisaria guardar energia anterior no banco
    
    return 0;
  } catch (error) {
    console.error('Erro ao buscar power:', error);
    return 0;
  }
}
```

---

### **OPÇÃO 2: Implementar Endpoint MeterValues no CVE**

Criar endpoint na API CVE que retorna últimos MeterValues:

```bash
GET /chargers/{uuid}/metervalues/latest
```

**Resposta:**
```json
{
  "timestamp": "2026-02-02T20:15:14.939Z",
  "power": 3293.69,
  "voltage": 217.30,
  "current": 15.47
}
```

**Vantagem:** Dados em tempo real  
**Desvantagem:** Requer mudança na API CVE (fora do nosso controle)

---

### **OPÇÃO 3: Heurística Baseada em Energia (WORKAROUND)**

Estimar ociosidade pela variação de energia:

```typescript
// Guardar energia anterior no banco
// Se energia NÃO aumentou significativamente em 1 minuto → ocioso

const energiaAnterior = carregamento.energia_kwh || 0;
const energiaAtual = parseFloat(transacao.energyHumanReadable) || 0;
const deltaEnergia = energiaAtual - energiaAnterior;

// Se consumiu menos de 0.01 kWh em 1 minuto (= 600W) → considera ocioso
if (deltaEnergia < 0.01) {
  console.log('Possível ociosidade detectada por baixo consumo');
  // Marcar como ocioso
}
```

**Vantagem:** Não precisa de power direto  
**Desvantagem:** Menos preciso, delay de 1-2 minutos

---

## 🚀 IMPLEMENTAÇÃO RECOMENDADA

### **FASE 1: Investigar API CVE (10 min)**

Testar se transação retorna power:

```bash
# Pegar ID de uma transação ativa
curl "https://api.cve.com.br/transactions?active=true" \
  -H "Authorization: Bearer TOKEN"

# Buscar detalhes da transação
curl "https://api.cve.com.br/transactions/440059" \
  -H "Authorization: Bearer TOKEN"

# Verificar se resposta tem campo "power" ou "currentPower"
```

---

### **FASE 2: Implementar Busca de Power (30 min)**

**Se API retornar power:**

```typescript
// apps/backend/src/services/CVEService.ts

async getTransactionPower(transactionId: number): Promise<number> {
  try {
    const response = await this.api.get(`/transactions/${transactionId}`);
    return response.data.currentPower || response.data.power || 0;
  } catch (error) {
    console.error('Erro ao buscar power:', error);
    return 0;
  }
}
```

```typescript
// apps/backend/src/services/PollingService.ts

// No método processarEventosCarregamento():

// Buscar transação ativa
const transacoes = await cveService.getActiveTransactions();
const transacao = transacoes.find(t => t.chargeBoxUuid === carregamento.charger_uuid);

if (transacao) {
  // Buscar power da transação
  const currentPower = await cveService.getTransactionPower(transacao.id);
  
  // Agora pode detectar ociosidade
  if (currentPower < 10) {
    // Enviar notificação de ociosidade
  }
}
```

---

**Se API NÃO retornar power:**

Usar OPÇÃO 3 (heurística por energia):

```typescript
// Adicionar campos no banco:
ALTER TABLE carregamentos 
ADD COLUMN energia_ultima_checagem DECIMAL,
ADD COLUMN horario_ultima_checagem TIMESTAMP;

// Na lógica:
const energiaAtual = parseFloat(transacao.energyHumanReadable) || 0;
const energiaAnterior = carregamento.energia_ultima_checagem || energiaAtual;
const deltaMinutos = (Date.now() - new Date(carregamento.horario_ultima_checagem).getTime()) / 60000;
const consumoPorMinuto = (energiaAtual - energiaAnterior) / deltaMinutos;

// Se consumo < 0.01 kWh/min (= 600W) → ocioso
if (consumoPorMinuto < 0.01) {
  // Detectar ociosidade
}

// Atualizar checagem
UPDATE carregamentos SET 
  energia_ultima_checagem = energiaAtual,
  horario_ultima_checagem = NOW()
WHERE id = ?
```

---

## 📊 TABELA COMPARATIVA

| Opção | Precisão | Delay | Complexidade | Depende de CVE |
|-------|----------|-------|--------------|----------------|
| **1. Transaction API** | Alta | Imediato | Baixa | Sim (verificar) |
| **2. MeterValues Endpoint** | Muito Alta | Tempo Real | Média | Sim (precisa criar) |
| **3. Heurística Energia** | Média | 1-2 min | Média | Não |

---

## ✅ PRÓXIMOS PASSOS

### **AGORA:**
1. ⏱️ Aguardar deploy (3-5 min) - vai funcionar sem erros
2. ✅ Evento 1 e 4 continuam funcionando
3. ⚠️ Eventos 2 e 3 não vão disparar (esperado)

### **DEPOIS DO DEPLOY:**
1. 🔍 **Testar API CVE** para ver se retorna power
2. 💻 **Implementar solução** baseado no resultado
3. 🧪 **Testar** com carregamento real
4. ✅ **Validar** todos os 4 eventos funcionando

---

## 📝 ARQUIVOS RELEVANTES

```
apps/backend/src/services/
├── PollingService.ts        ← Lógica de detecção (linha 402)
├── CVEService.ts            ← API CVE
└── NotificationService.ts   ← Envio de mensagens (OK)

apps/backend/src/types/
└── index.ts                 ← Tipos CVE (ver CVEConnector)
```

---

## 📞 PARA REFERÊNCIA

### Logs OCPP com MeterValues completos:

```
[INFO] 20:15:01.054 MeterValues {
  "connectorId":1,
  "transactionId":440059,
  "meterValue":[{
    "timestamp":"2026-02-02T20:14:58.939580Z",
    "sampledValue":[
      {"value":"217.30","measurand":"Voltage","phase":"L1","unit":"V"},
      {"value":"15.47","measurand":"Current.Import","phase":"L1","unit":"A"},
      {"value":"3293.69","measurand":"Power.Active.Import","phase":"L1","unit":"W"},  ← POWER!
      {"value":"15.57","measurand":"Energy.Active.Import.Register","unit":"Wh"}
    ]
  }]
}
```

---

**Criado em:** 03/02/2026 01:45  
**Status:** ⚠️ **Deploy vai funcionar, mas Eventos 2 e 3 desabilitados**  
**Próxima ação:** Testar API CVE para ver se retorna power

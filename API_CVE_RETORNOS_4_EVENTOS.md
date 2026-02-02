# 🔌 API CVE PRO - Retornos Esperados para os 4 Eventos

**Data:** 02/02/2026  
**Sistema:** VETRIC - Notificações Inteligentes  
**Baseado em:** Transação Saskya (439071) e análise da API CVE

---

## 📡 ENDPOINT PRINCIPAL MONITORADO

```
GET https://api.cvepro.com.br/api/v1/Transaction/{idTransaction}
```

**Frequência:** A cada **10 segundos** (PollingService)  
**Método:** GET  
**Autenticação:** Bearer Token (renovado automaticamente)

---

## 🎯 OS 4 EVENTOS E SEUS TRIGGERS DA API

### **1️⃣ 🔋 INÍCIO DE RECARGA**

#### **O que estamos aguardando da API CVE:**

```json
{
  "transactionStatus": "InProgress",
  "startTransactionTime": "2026-01-30T23:45:44.000Z",
  "idTag": "A41D06E2",
  "chargerPointSerialNumber": "PCEV0000024",
  "meterValues": [
    {
      "timestamp": "2026-01-30T23:45:44.000Z",
      "sampledValue": [
        {
          "value": "6297",
          "context": "Sample.Periodic",
          "measurand": "Power.Active.Import",
          "unit": "W"
        }
      ]
    }
  ]
}
```

#### **Campos Críticos:**
- ✅ `transactionStatus: "InProgress"` - Transação está ativa
- ✅ `startTransactionTime` - Momento exato do início
- ✅ `idTag` - RFID para identificar o morador
- ✅ `meterValues[0].sampledValue[0].value` - Power inicial (> 0W)
- ✅ `chargerPointSerialNumber` - Identificar o carregador

#### **Lógica de Detecção:**

```typescript
// PollingService.ts - processarTransacao()
if (
  transacao.transactionStatus === 'InProgress' &&
  !carregamentoJaExiste &&
  idTag &&
  morador &&
  morador.notificacoes_ativas
) {
  // 🚀 TRIGGER: Enviar notificação de INÍCIO
  await notificationService.notificarInicio(
    morador.id,
    nomeCarregador,
    localizacao,
    transacao.startTransactionTime
  );
}
```

#### **Quando dispara:**
- 🕐 **IMEDIATAMENTE** ao detectar nova transação `InProgress`
- 🕐 Máximo **10 segundos** de atraso (ciclo do polling)

---

### **2️⃣ ⚠️ INÍCIO DE OCIOSIDADE**

#### **O que estamos aguardando da API CVE:**

```json
{
  "transactionStatus": "InProgress",
  "meterValues": [
    {
      "timestamp": "2026-01-31T01:34:45.000Z",
      "sampledValue": [
        {
          "value": "6271",  // ← Estava carregando forte
          "measurand": "Power.Active.Import",
          "unit": "W"
        }
      ]
    },
    {
      "timestamp": "2026-01-31T01:35:07.000Z",
      "sampledValue": [
        {
          "value": "0",     // ← POWER ZEROU! 🚨
          "measurand": "Power.Active.Import",
          "unit": "W"
        }
      ]
    }
  ]
}
```

#### **Campos Críticos:**
- ✅ `meterValues[última].sampledValue[0].value` - Power ATUAL
- ✅ Comparação com `carregamento.ultimo_power_w` - Power ANTERIOR
- ✅ `transactionStatus: "InProgress"` - Ainda está conectado

#### **Lógica de Detecção:**

```typescript
// PollingService.ts - monitorarEventosCarregamento()
const powerAtual = this.extrairPower(transacao.meterValues); // Ex: 0W
const powerAnterior = carregamento.ultimo_power_w; // Ex: 6271W

// Buscar threshold configurado (padrão: 10W)
const templateOciosidade = await query(
  'SELECT power_threshold_w FROM templates_notificacao WHERE tipo = $1',
  ['inicio_ociosidade']
);
const threshold = templateOciosidade[0]?.power_threshold_w || 10;

if (
  powerAtual <= threshold &&                     // 0W <= 10W ✅
  powerAnterior > threshold &&                   // 6271W > 10W ✅
  !carregamento.notificacao_ociosidade_enviada   // Ainda não enviou ✅
) {
  // 🚨 TRIGGER: Enviar notificação de OCIOSIDADE
  await notificationService.enviarNotificacao(
    'inicio_ociosidade',
    morador,
    carregador,
    {
      energia: carregamento.energia_kwh,
      data: new Date().toISOString()
    }
  );

  // Marcar campos de rastreamento
  await query(`
    UPDATE carregamentos SET
      primeiro_ocioso_em = NOW(),
      ultimo_power_w = $1,
      notificacao_ociosidade_enviada = TRUE
    WHERE id = $2
  `, [powerAtual, carregamento.id]);
}
```

#### **Quando dispara:**
- 🕐 **IMEDIATAMENTE** ao detectar queda de power
- 🕐 Próximo ciclo de polling (máximo **10 segundos**)

#### **Valores de Exemplo:**
```
ANTES:
├─ Power: 6271W
├─ ultimo_power_w: 6271
└─ notificacao_ociosidade_enviada: FALSE

API RETORNA:
├─ Power: 0W (CAIU!)

DEPOIS:
├─ Power: 0W
├─ ultimo_power_w: 0
├─ primeiro_ocioso_em: 2026-01-31 01:35:07
├─ notificacao_ociosidade_enviada: TRUE ✅
└─ Notificação enviada! 📨
```

---

### **3️⃣ 🔋 BATERIA CHEIA**

#### **O que estamos aguardando da API CVE:**

```json
{
  "transactionStatus": "InProgress",
  "meterValues": [
    // Múltiplos registros consecutivos com power baixo
    {
      "timestamp": "2026-01-31T01:35:07.000Z",
      "sampledValue": [{ "value": "0", "unit": "W" }]
    },
    {
      "timestamp": "2026-01-31T01:36:07.000Z",
      "sampledValue": [{ "value": "0", "unit": "W" }]  // 1 min
    },
    {
      "timestamp": "2026-01-31T01:37:07.000Z",
      "sampledValue": [{ "value": "0", "unit": "W" }]  // 2 min
    },
    {
      "timestamp": "2026-01-31T01:38:07.000Z",
      "sampledValue": [{ "value": "0", "unit": "W" }]  // 3 min ✅
    }
  ]
}
```

#### **Campos Críticos:**
- ✅ `meterValues[última].sampledValue[0].value` - Power ATUAL (≤ threshold)
- ✅ `carregamento.primeiro_ocioso_em` - Timestamp de quando ficou ocioso
- ✅ Diferença de tempo entre `NOW()` e `primeiro_ocioso_em`

#### **Lógica de Detecção:**

```typescript
// PollingService.ts - monitorarEventosCarregamento()
const powerAtual = this.extrairPower(transacao.meterValues); // Ex: 0W

// Buscar threshold e tempo configurados (padrão: 10W e 3 min)
const templateBateria = await query(
  'SELECT power_threshold_w, tempo_minutos FROM templates_notificacao WHERE tipo = $1',
  ['bateria_cheia']
);
const threshold = templateBateria[0]?.power_threshold_w || 10;
const tempoEspera = templateBateria[0]?.tempo_minutos || 3;

if (
  powerAtual <= threshold &&                          // 0W <= 10W ✅
  carregamento.primeiro_ocioso_em &&                  // Já registrou quando ficou ocioso ✅
  !carregamento.notificacao_bateria_cheia_enviada     // Ainda não enviou ✅
) {
  // Calcular há quanto tempo está ocioso
  const primeiroOcioso = new Date(carregamento.primeiro_ocioso_em);
  const agora = new Date();
  const minutosOcioso = Math.floor(
    (agora.getTime() - primeiroOcioso.getTime()) / 1000 / 60
  );

  if (minutosOcioso >= tempoEspera) {
    // 🔋 TRIGGER: Enviar notificação de BATERIA CHEIA
    await notificationService.enviarNotificacao(
      'bateria_cheia',
      morador,
      carregador,
      {
        energia: carregamento.energia_kwh,
        duracao: this.calcularDuracao(
          carregamento.inicio,
          agora
        )
      }
    );

    // Marcar como enviada
    await query(`
      UPDATE carregamentos SET
        notificacao_bateria_cheia_enviada = TRUE
      WHERE id = $1
    `, [carregamento.id]);
  }
}
```

#### **Quando dispara:**
- 🕐 **APÓS X MINUTOS** em baixa potência
- 🕐 Configurável via `tempo_minutos` (padrão: **3 minutos**)

#### **Valores de Exemplo:**
```
CICLO 1 (01:35:07):
├─ Power: 0W
├─ primeiro_ocioso_em: 2026-01-31 01:35:07
├─ Tempo ocioso: 0 min (aguarda...)

CICLO 2 (01:36:07):
├─ Power: 0W
├─ Tempo ocioso: 1 min (aguarda...)

CICLO 3 (01:37:07):
├─ Power: 0W
├─ Tempo ocioso: 2 min (aguarda...)

CICLO 4 (01:38:07):
├─ Power: 0W
├─ Tempo ocioso: 3 min ✅
├─ minutosOcioso (3) >= tempoEspera (3) ✅
├─ notificacao_bateria_cheia_enviada: TRUE
└─ Notificação enviada! 📨
```

---

### **4️⃣ ⚠️ INTERRUPÇÃO**

#### **O que estamos aguardando da API CVE:**

**Cenário 1: StopTransaction inesperado**

```json
{
  "transactionStatus": "Completed",  // ← Mudou de InProgress para Completed
  "stopTransactionTime": "2026-01-31T14:30:15.000Z",
  "stopReason": "EVDisconnected",     // ← Cabo desconectado
  "meterValues": [
    {
      "timestamp": "2026-01-31T14:30:00.000Z",
      "sampledValue": [
        {
          "value": "6500",  // ← Estava carregando forte!
          "unit": "W"
        }
      ]
    }
  ]
}
```

**Cenário 2: Carregador fica Available sem passar por ociosidade**

```json
// Última consulta mostrava:
{
  "transactionStatus": "InProgress",
  "meterValues": [...{ "value": "6500" }]  // Carregando
}

// Nova consulta mostra:
{
  "message": "Transaction not found"  // ← Sumiu!
}

// E o carregador voltou para:
GET /Charger/{chargerPointId}
{
  "status": "Available"  // ← Não está mais ocupado
}
```

#### **Campos Críticos:**
- ✅ `transactionStatus` mudou de `"InProgress"` para `"Completed"`
- ✅ `stopReason` diferente de `"Local"` ou `"Remote"` (finalizações normais)
- ✅ `carregamento.ultimo_power_w` era alto (estava realmente carregando)
- ✅ Não passou pela fase de ociosidade (`primeiro_ocioso_em` é NULL)

#### **Lógica de Detecção:**

```typescript
// PollingService.ts - processarTransacao()
if (
  transacao.transactionStatus === 'Completed' &&
  carregamento &&
  carregamento.ultimo_power_w > 1000 &&           // Estava carregando forte
  !carregamento.primeiro_ocioso_em &&             // NÃO passou por ociosidade
  !carregamento.notificacao_interrupcao_enviada   // Ainda não enviou
) {
  // Verificar se foi finalização inesperada
  const stopReason = transacao.stopReason;
  const foiFinalizacaoNormal = 
    stopReason === 'Local' || 
    stopReason === 'Remote' ||
    stopReason === 'Unlock';

  if (!foiFinalizacaoNormal) {
    // ⚠️ TRIGGER: Enviar notificação de INTERRUPÇÃO
    await notificationService.enviarNotificacao(
      'interrupcao',
      morador,
      carregador,
      {
        energia: carregamento.energia_kwh,
        duracao: this.calcularDuracao(
          carregamento.inicio,
          new Date(transacao.stopTransactionTime)
        ),
        motivo: stopReason
      }
    );

    await query(`
      UPDATE carregamentos SET
        notificacao_interrupcao_enviada = TRUE
      WHERE id = $1
    `, [carregamento.id]);
  }
}
```

#### **Quando dispara:**
- 🕐 **IMEDIATAMENTE** ao detectar parada inesperada
- 🕐 Próximo ciclo de polling (máximo **10 segundos**)

#### **Valores de Exemplo:**

```
ESTADO ANTES DA INTERRUPÇÃO:
├─ transactionStatus: "InProgress"
├─ ultimo_power_w: 6500W (carregando forte)
├─ primeiro_ocioso_em: NULL (não ficou ocioso)
└─ Tudo normal...

API RETORNA (INESPERADO):
├─ transactionStatus: "Completed"
├─ stopTransactionTime: "2026-01-31T14:30:15Z"
├─ stopReason: "EVDisconnected" (cabo desconectado!)
└─ Não foi finalização normal!

TRIGGER:
├─ ultimo_power_w (6500) > 1000 ✅
├─ primeiro_ocioso_em = NULL ✅
├─ stopReason ≠ Local/Remote ✅
├─ notificacao_interrupcao_enviada: TRUE
└─ Notificação enviada! 📨
```

---

## 📊 RESUMO: CAMPOS MONITORADOS POR EVENTO

| Evento | Campo Principal | Condição | Threshold | Tempo |
|--------|----------------|----------|-----------|-------|
| 🔋 **Início** | `transactionStatus` | `"InProgress"` nova | - | 0s |
| ⚠️ **Ociosidade** | `meterValues[].value` | Power caiu de >10W para ≤10W | 10W | 0s |
| 🔋 **Bateria Cheia** | `meterValues[].value` + tempo | Power ≤10W por 3+ min | 10W | 3 min |
| ⚠️ **Interrupção** | `transactionStatus` + `stopReason` | `"Completed"` sem passar por ociosidade | - | 0s |

---

## 🔄 FLUXO COMPLETO DO POLLING

```
┌─────────────────────────────────────────────────────────────┐
│  PollingService.start() - A cada 10 segundos                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  1. Buscar todos carregadores ativos do banco                │
│     SELECT * FROM carregadores WHERE ativo = TRUE            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Para cada carregador, buscar transação ativa na API CVE  │
│     GET /Transaction?chargerPointId={id}&status=InProgress   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Se encontrou transação, processar:                       │
│     ↓                                                        │
│     ├─ Identificar morador pelo idTag                        │
│     ├─ Extrair power dos meterValues                         │
│     ├─ Verificar se é nova transação → 🔋 INÍCIO             │
│     ├─ Verificar se power caiu → ⚠️ OCIOSIDADE              │
│     ├─ Verificar tempo ocioso → 🔋 BATERIA CHEIA             │
│     └─ Verificar se parou → ⚠️ INTERRUPÇÃO                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Atualizar banco de dados:                                │
│     UPDATE carregamentos SET                                 │
│       ultimo_power_w = ...,                                  │
│       contador_minutos_ocioso = ...,                         │
│       notificacao_*_enviada = TRUE                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Se necessário, chamar NotificationService:               │
│     await notificationService.enviarNotificacao(...)         │
│       ↓                                                      │
│       ├─ Buscar template do banco                            │
│       ├─ Renderizar variáveis {{nome}}, {{charger}}, etc    │
│       ├─ Enviar via Evolution API                            │
│       └─ Salvar log no banco                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
                     ⏰ Aguardar 10s
                            ↓
                   Repetir ciclo... ♻️
```

---

## 🎯 COMANDOS CRÍTICOS DA API CVE

### **1. Buscar Transações Ativas**

```http
GET https://api.cvepro.com.br/api/v1/Transaction
  ?chargerPointId=PCEV0000024
  &status=InProgress

Authorization: Bearer {token}
```

**Retorno esperado:**
- `200 OK` com array de transações
- `[]` se não há transação ativa
- `401 Unauthorized` se token expirou (renova automaticamente)

### **2. Buscar Detalhes da Transação**

```http
GET https://api.cvepro.com.br/api/v1/Transaction/439071

Authorization: Bearer {token}
```

**Retorno esperado:**
- `200 OK` com objeto completo da transação
- `404 Not Found` se transação foi deletada

### **3. Buscar Status do Carregador**

```http
GET https://api.cvepro.com.br/api/v1/Charger/PCEV0000024

Authorization: Bearer {token}
```

**Retorno esperado:**
```json
{
  "status": "Available" | "Charging" | "Preparing" | "Finishing" | "Unavailable"
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Para cada evento ser disparado, o sistema verifica:

### **🔋 Início de Recarga:**
- [ ] API retornou `transactionStatus: "InProgress"`
- [ ] Transação não existe no banco local ainda
- [ ] `idTag` presente na resposta
- [ ] Morador identificado pelo idTag
- [ ] Morador tem `notificacoes_ativas = TRUE`
- [ ] Template `inicio` está `ativo = TRUE`

### **⚠️ Início de Ociosidade:**
- [ ] API retornou `meterValues` com power atual
- [ ] Power ATUAL ≤ threshold (padrão: 10W)
- [ ] Power ANTERIOR > threshold (estava carregando)
- [ ] `notificacao_ociosidade_enviada = FALSE`
- [ ] Template `inicio_ociosidade` está `ativo = TRUE`

### **🔋 Bateria Cheia:**
- [ ] API retornou power ≤ threshold
- [ ] `primeiro_ocioso_em` já foi registrado
- [ ] Diferença de tempo ≥ `tempo_minutos` (padrão: 3 min)
- [ ] `notificacao_bateria_cheia_enviada = FALSE`
- [ ] Template `bateria_cheia` está `ativo = TRUE`

### **⚠️ Interrupção:**
- [ ] API retornou `transactionStatus: "Completed"`
- [ ] `ultimo_power_w` era alto (> 1000W)
- [ ] `primeiro_ocioso_em = NULL` (não passou por ociosidade)
- [ ] `stopReason` não é Local/Remote/Unlock
- [ ] `notificacao_interrupcao_enviada = FALSE`
- [ ] Template `interrupcao` está `ativo = TRUE`

---

## 🛠️ ARQUIVOS ENVOLVIDOS

| Arquivo | Responsabilidade |
|---------|------------------|
| `apps/backend/src/services/PollingService.ts` | Busca dados da API CVE e detecta eventos |
| `apps/backend/src/services/NotificationService.ts` | Envia notificações via Evolution API |
| `apps/backend/src/services/CVEService.ts` | Comunica com API CVE (autenticação, requisições) |
| `apps/backend/src/models/CarregamentoModel.ts` | Operações CRUD da tabela `carregamentos` |
| `apps/backend/src/models/MoradorModel.ts` | Operações CRUD da tabela `moradores` |

---

## 📝 EXEMPLO DE LOG COMPLETO (Saskya)

```
[PollingService] Iniciando ciclo de polling...
[PollingService] Buscando transações ativas para carregador: PCEV0000024

[CVEService] GET /Transaction?chargerPointId=PCEV0000024&status=InProgress
[CVEService] ✅ Resposta: 200 OK

[PollingService] Transação encontrada: 439071
├─ Status: InProgress
├─ idTag: A41D06E2
├─ Power: 6297W
└─ Nova transação detectada!

[PollingService] Identificando morador...
[MoradorModel] Buscando morador com RFID: A41D06E2
[MoradorModel] ✅ Morador encontrado: Saskya Lorena (ID: 15)

[NotificationService] 🔋 Enviando notificação de INÍCIO
├─ Morador: Saskya Lorena
├─ Telefone: 5582996176797
├─ Template: inicio
└─ Variáveis: {nome, charger, localizacao, data, apartamento}

[EvolutionAPI] POST /message/sendText/gran-marine
[EvolutionAPI] ✅ Mensagem enviada com sucesso!

[CarregamentoModel] Salvando carregamento no banco...
├─ transacao_id: 439071
├─ morador_id: 15
├─ carregador_id: 6
├─ ultimo_power_w: 6297
└─ notificacao_inicio_enviada: TRUE ✅

[PollingService] Ciclo concluído! Aguardando 10s...
```

---

**VETRIC - Sistema de Notificações Inteligentes**  
**Versão:** 1.0  
**Data:** 02/02/2026  
**Branch:** feature/eventos-notificacoes-limpa

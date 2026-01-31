# 🎯 PADRÕES REAIS IDENTIFICADOS - Análise do Log CVE-PRO

## 📊 Sumário Executivo

Após análise detalhada de **3 transações reais** do log CVE-PRO (mundo_logic-20260131-025549.txt), identificamos os seguintes padrões:

### ✅ Padrões Encontrados:
1. **INTERRUPÇÃO MANUAL durante carregamento ativo** (Transação 439071 - Saskya)
2. **DESCONEXÃO NORMAL após carregamento completo** (Transação 439082)
3. **CARREGAMENTO LONGO ativo** (Transação 439081)

### ❌ Padrões NÃO Encontrados:
- **Bateria cheia com ociosidade prolongada** (0W por 3+ minutos)
- **SuspendedEV natural** (apenas após interrupção manual)

---

## 🔍 ANÁLISE DETALHADA

### TRANSAÇÃO 1: 439071 (Saskya - Gran Marine 6) ⚠️ INTERRUPÇÃO MANUAL

**Período:** 30/01/2026 23:45:44 → 31/01/2026 01:36:00 (1h 50min)

**Sequência de Eventos:**

```
ANTES (Carregamento Normal):
  01:30:51 → ⚡ 6312W, 30.8A [CARREGANDO]
  01:31:51 → ⚡ 6305W, 30.7A [CARREGANDO]
  01:32:51 → ⚡ 6315W, 30.8A [CARREGANDO]
  01:33:51 → ⚡ 5493W, 26.7A [CARREGANDO]
  01:34:51 → ⚡ 6317W, 30.8A [CARREGANDO PLENA POTÊNCIA]

INTERRUPÇÃO ABRUPTA:
  01:35:06 → 🔴 181W, 0.8A [QUEDA INSTANTÂNEA!]
  01:35:07 → StatusNotification: SuspendedEV (1 segundo depois!)

FINALIZAÇÃO:
  01:35:50 → 🛑 RemoteStopTransaction (Plataforma enviou)
  01:36:00 → 🏁 StopTransaction (reason: Remote)
  01:36:07 → StatusNotification: Finishing
  01:37:25 → StatusNotification: Available
```

**Interpretação:**
- ⚠️ **INTERRUPÇÃO MANUAL**
- Carregamento estava em **plena carga** (6317W)
- Queda **abrupta** para 181W em 1 segundo
- SuspendedEV **imediato** (1s depois)
- Provável causa:
  - Moradora **abriu a porta do carro**
  - OU usou **botão de parada no app do veículo**
  - OU **comando manual** no carregador

**📱 Notificação Ideal:**
```
⚠️ Carregamento interrompido

Seu carregamento foi finalizado antes do esperado.

⚡ Consumo: 6.59 kWh
⏱️ Duração: 1h 50min
📍 Gran Marine 6

Se não foi você, verifique seu veículo.
```

---

### TRANSAÇÃO 2: 439082 (Charger QUXM12000122V) ✅ DESCONEXÃO NORMAL

**Período:** 31/01/2026 00:41:00 → 02:35:02 (1h 54min)

**Sequência de Eventos:**

```
PREPARAÇÃO (2 minutos):
  00:41:00 → 🔴 0W, 0A [PREPARANDO]
  00:41:01 → 🔴 0W, 0A [PREPARANDO]

CARREGAMENTO ATIVO (quase 2 horas):
  00:42:00 → ⚡ 6551W [INÍCIO]
  ...
  02:30:05 → ⚡ 6569W
  02:31:05 → ⚡ 6558W
  02:32:05 → ⚡ 6575W
  02:33:05 → ⚡ 6611W
  02:34:05 → ⚡ 6627W [ÚLTIMO - PLENA POTÊNCIA!]

FINALIZAÇÃO:
  02:35:00 → StatusNotification: Finishing
  02:35:02 → 🏁 StopTransaction (reason: EVDisconnected)
  02:35:03 → StatusNotification: Available
```

**Interpretação:**
- ✅ **DESCONEXÃO NORMAL**
- Carregou por **quase 2 horas** em plena potência (~6550W)
- **NÃO houve ociosidade** (última medição: 6627W)
- Morador simplesmente **desconectou o cabo** quando quis
- Possíveis razões:
  - Bateria atingiu o **limite configurado no veículo** (ex: 80%)
  - Morador precisava **sair/mover o carro**
  - **Horário programado** no veículo

**📱 Notificação Ideal:**
```
✅ Carregamento finalizado!

⚡ Consumo: 18.42 kWh
⏱️ Duração: 1h 54min
📍 Charger QUXM12000122V

Obrigado por liberar o carregador!
```

---

### TRANSAÇÃO 3: 439081 (Charger JDBM1900101FE) ⚡ CARREGAMENTO LONGO

**Período:** 30/01/2026 00:40:11 → ainda ativo no final do log (2h+ de carga)

**Sequência de Eventos:**

```
PREPARAÇÃO:
  00:40:11 → 🔴 0W [PREPARANDO]
  00:40:12 → 🔴 0W [PREPARANDO]

CARREGAMENTO ATIVO (2+ horas contínuas):
  00:41:11 → ⚡ 8898W
  00:44:12 → ⚡ 10052W
  ...
  02:47:19 → ⚡ 10321W
  02:50:20 → ⚡ 10336W
  02:53:20 → ⚡ 10348W [ÚLTIMA MEDIÇÃO]
  (log termina aqui - transação ainda ativa)
```

**Interpretação:**
- ⚡ **CARREGAMENTO NORMAL LONGO**
- Carregou por **2h+ em potência máxima** (~10kW)
- **Sem interrupções, sem ociosidade**
- Log terminou antes da finalização

---

## 🚨 PROBLEMA: Não Encontramos Padrão de "Bateria Cheia"

### O que esperávamos encontrar:
```
Carregando → Declínio gradual → 0W por 3+ min → SuspendedEV → Stop
```

### O que realmente encontramos:
1. **Interrupção manual** → Queda abrupta → SuspendedEV → Stop (Saskya)
2. **Desconexão normal** → Carregando plena potência → EVDisconnected (439082)
3. **Carregamento contínuo** → Sem finalização no log (439081)

### 💡 Conclusão:
**Nenhuma das transações no log apresentou o padrão de "bateria 100% cheia com ociosidade"!**

Isso pode significar:
- Os moradores **não deixam carregar até 100%**
- Os veículos estão configurados para **parar antes** (80%, 90%)
- O **período do log** (31/01 00:00-03:00) não capturou esse cenário
- Este padrão é **raro** na prática

---

## 🎯 REGRAS DE NOTIFICAÇÃO REVISADAS (Baseadas em Dados Reais)

### 1️⃣ **NOTIFICAÇÃO DE INÍCIO**
**Trigger:** `StartTransaction`
```
🔋 Carregamento iniciado no [Carregador]
🕐 Início: [Data/Hora]
```

---

### 2️⃣ **INTERRUPÇÃO MANUAL** (Padrão da Saskya)
**Trigger:** 
- Último `MeterValues` com `Power > 5000W` (carregando ativamente)
- `StatusNotification: SuspendedEV` 
- `StopTransaction (reason: Remote)` dentro de 2 minutos

**Lógica:**
```typescript
let lastPower: number = 0;
let suspendedEVTime: Date | null = null;

onMeterValues(data) {
  lastPower = extractPower(data);
}

onStatusNotification(status) {
  if (status === 'SuspendedEV') {
    suspendedEVTime = new Date();
  }
}

onStopTransaction(stop) {
  if (stop.reason === 'Remote' && suspendedEVTime) {
    const timeSince = (new Date() - suspendedEVTime) / 1000;
    
    if (timeSince < 120 && lastPower > 5000) {
      // Padrão: Interrupção manual durante carga ativa
      sendInterruptionNotification(stop);
      return;
    }
  }
  
  // Outros padrões...
}
```

**Mensagem:**
```
⚠️ Carregamento interrompido

Seu carregamento foi finalizado antes do esperado.

⚡ Consumo: X.XX kWh
⏱️ Duração: Xh XXmin
📍 [Nome do Carregador]

Se não foi você, verifique seu veículo.
```

---

### 3️⃣ **DESCONEXÃO NORMAL** (Padrão da 439082)
**Trigger:**
- `StopTransaction (reason: EVDisconnected)`
- Último `MeterValues` com `Power > 1000W` (estava carregando)

**Lógica:**
```typescript
onStopTransaction(stop) {
  if (stop.reason === 'EVDisconnected' && lastPower > 1000) {
    // Padrão: Desconexão normal após carregamento ativo
    sendCompletedNotification(stop);
    return;
  }
}
```

**Mensagem:**
```
✅ Carregamento finalizado!

⚡ Consumo: X.XX kWh
⏱️ Duração: Xh XXmin
📍 [Nome do Carregador]

Obrigado por liberar o carregador!
```

---

### 4️⃣ **BATERIA CHEIA COM OCIOSIDADE** (Teórico - não encontrado)
**Trigger:**
- 3+ `MeterValues` consecutivos com `Power < 100W`
- Seguido de `StopTransaction`

**Lógica:**
```typescript
let consecutiveIdleCount = 0;

onMeterValues(data) {
  const power = extractPower(data);
  
  if (power < 100) {
    consecutiveIdleCount++;
    
    if (consecutiveIdleCount === 3) {
      // Alerta após 3 minutos de ociosidade
      sendIdleAlert();
    }
  } else {
    consecutiveIdleCount = 0;
  }
}

onStopTransaction(stop) {
  if (consecutiveIdleCount >= 3) {
    // Padrão: Bateria cheia
    sendFullyChargedNotification(stop);
    return;
  }
}
```

**Mensagem (Alerta após 3 min):**
```
⚠️ Carregamento ocioso

Seu carregamento está sem consumo há 3 minutos.
Sua bateria pode estar cheia.

⚡ Consumo até agora: X.XX kWh
📍 [Nome do Carregador]

Por favor, remova o cabo para liberar.
```

**Mensagem (Finalização):**
```
🔋 Carga completa!

Seu veículo está com a bateria carregada.

⚡ Consumo: X.XX kWh
⏱️ Duração: Xh XXmin
📍 [Nome do Carregador]

Obrigado por liberar o carregador!
```

---

### 5️⃣ **ERRO/FALHA**
**Trigger:**
- `StatusNotification: Faulted`
- OU `errorCode !== "NoError"`

**Mensagem:**
```
❌ Erro no carregamento

O carregador detectou um problema.

⚡ Consumo até o erro: X.XX kWh
📍 [Nome do Carregador]

Entre em contato com o síndico.
```

---

## 📊 Tabela Comparativa dos Padrões

| Padrão | Power antes do Stop | Transição | Reason | Tempo até Stop |
|--------|---------------------|-----------|--------|----------------|
| **Interrupção Manual** | > 5000W | Abrupta (1s) | Remote | < 2 min após SuspendedEV |
| **Desconexão Normal** | > 1000W | Imediata | EVDisconnected | N/A |
| **Bateria Cheia** | < 100W por 3+ min | Gradual | EVDisconnected | Após ociosidade |
| **Erro** | Qualquer | Variável | Other/PowerLoss | Imediato |

---

## 🚀 Recomendações de Implementação

### Prioridade 1: Implementar os padrões encontrados
1. ✅ Interrupção Manual (caso Saskya)
2. ✅ Desconexão Normal (caso 439082)

### Prioridade 2: Preparar para o padrão teórico
3. ⚠️ Bateria Cheia com Ociosidade (ainda não observado, mas possível)

### Prioridade 3: Casos de erro
4. ❌ Erro/Falha

---

## 💾 Campos Necessários no Banco

```sql
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  ultimo_power_w INTEGER DEFAULT NULL,
  contador_ociosidade INTEGER DEFAULT 0,
  ultimo_alerta_ociosidade TIMESTAMP DEFAULT NULL,
  suspended_ev_timestamp TIMESTAMP DEFAULT NULL,
  tipo_finalizacao VARCHAR(50) DEFAULT NULL;
  -- Valores: 'interrupcao_manual', 'desconexao_normal', 'bateria_cheia', 'erro'
```

---

**Data:** 31/01/2026  
**Fonte:** mundo_logic-20260131-025549.txt  
**Transações Analisadas:** 439071 (Saskya), 439082, 439081  
**Status:** ✅ Análise Completa - Padrões Reais Identificados


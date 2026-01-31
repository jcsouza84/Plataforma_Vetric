# 📱 PROPOSTA: Sistema de Notificações Inteligentes

## 🎯 Objetivo

Implementar um sistema de notificações **contextualizadas e inteligentes** que informe o morador corretamente sobre o estado do carregamento, evitando mensagens redundantes e fornecendo informações úteis no momento certo.

---

## 📊 Cenários Identificados (Análise Real do Log CVE-PRO)

### CENÁRIO 1️⃣: **BATERIA CHEIA** (SuspendedEV + Remote)

**Exemplo Real:** Transação 439071 (Saskya - Gran Marine 6)

**Sequência de Eventos:**
```
00:00 - 01:35   → ⚡ Carregando (Power: ~6270W)
01:35:07        → 🔴 StatusNotification: SuspendedEV
                   (Veículo pausou - bateria provavelmente cheia)
01:35:50 (+43s) → 🛑 RemoteStopTransaction (Plataforma encerra)
01:36:00 (+10s) → 🏁 StopTransaction (reason: Remote)
01:36:07        → 📊 StatusNotification: Finishing
01:37:25        → ✅ StatusNotification: Available
```

**Interpretação:**
- Veículo atingiu carga máxima e suspendeu automaticamente
- Plataforma detectou e enviou comando de parada
- Cabo ainda conectado (morador não retirou)

**📱 Notificação Proposta:**
```
🔋 Carga completa!

Seu veículo está com a bateria carregada.

⚡ Consumo: 6.59 kWh
⏱️ Duração: 55 minutos
📍 Gran Marine 6

Por favor, remova o cabo do carregador para 
liberar a vaga para outros moradores.
```

---

### CENÁRIO 2️⃣: **MORADOR DESCONECTOU** (EVDisconnected)

**Exemplo Real:** Transação 439082 (Charger QUXM12000122V)

**Sequência de Eventos:**
```
02:18 - 02:34   → ⚡ MeterValues (Power: 0W por 16+ minutos!)
02:35:00        → 📊 StatusNotification: Finishing
02:35:02        → 🏁 StopTransaction (reason: EVDisconnected)
02:35:03        → ✅ StatusNotification: Available
```

**Interpretação:**
- Carregamento estava ocioso (0W) por muito tempo
- Morador desconectou o cabo fisicamente
- Carregador detectou desconexão e finalizou

**📱 Notificação Proposta:**
```
✅ Carregamento finalizado!

⚡ Consumo: 8.23 kWh
⏱️ Duração: 2h 15min
📍 Charger QUXM12000122V

Obrigado por liberar o carregador!
```

---

### CENÁRIO 3️⃣: **OCIOSIDADE PROLONGADA** (Alerta Preventivo)

**Exemplo Real:** Transação 439082 (antes da desconexão)

**Sequência de Eventos:**
```
02:18:07        → ⚡ MeterValues (Power: 0W)
02:19:05        → ⚡ MeterValues (Power: 0W)
02:20:05        → ⚡ MeterValues (Power: 0W)
02:21:06        → ⚡ MeterValues (Power: 0W) ← 3 MINUTOS!
... (continua em 0W)
```

**Interpretação:**
- Carregamento atingiu 0W por 3+ minutos consecutivos
- Bateria provavelmente cheia
- Morador NÃO removeu o cabo

**📱 Notificação Proposta (após 3 min de 0W):**
```
⚠️ Carregamento ocioso

Seu carregamento está sem consumo há 3 minutos.
Sua bateria pode estar cheia.

⚡ Consumo até agora: 8.23 kWh
📍 Charger QUXM12000122V

Por favor, remova o cabo para liberar o carregador.
```

---

### CENÁRIO 4️⃣: **INTERRUPÇÃO DURANTE CARREGAMENTO ATIVO**

**Sequência de Eventos:**
```
10:00 - 10:30   → ⚡ Carregando (Power: ~6000W)
10:30:15        → 🏁 StopTransaction (reason: Remote ou EVDisconnected)
                   (Power ainda estava > 1000W)
```

**Interpretação:**
- Carregamento foi interrompido enquanto estava ativo
- Pode ter sido erro, falha ou decisão do morador
- Não é uma finalização "natural"

**📱 Notificação Proposta:**
```
⚠️ Carregamento interrompido

Seu carregamento foi finalizado antes do esperado.

⚡ Consumo parcial: 3.15 kWh
⏱️ Duração: 30 minutos
📍 Gran Marine 6

Se não foi você, verifique seu veículo.
```

---

### CENÁRIO 5️⃣: **FALHA/ERRO NO CARREGADOR**

**Sequência de Eventos:**
```
10:00 - 10:15   → ⚡ Carregando (Power: ~6000W)
10:15:30        → ❌ StatusNotification: Faulted (errorCode: OtherError)
10:15:35        → 🏁 StopTransaction (reason: Other)
```

**Interpretação:**
- Carregador detectou um erro
- Carregamento foi interrompido automaticamente
- Requer atenção

**📱 Notificação Proposta:**
```
❌ Erro no carregamento

O carregador detectou um problema e interrompeu 
o carregamento.

⚡ Consumo até o erro: 1.50 kWh
📍 Gran Marine 6

Entre em contato com o síndico ou tente novamente.
```

---

## 🎯 Regras de Notificação (Implementação)

### 1️⃣ **NOTIFICAÇÃO DE INÍCIO**
**Trigger:** `StartTransaction`

**Condições:** Sempre enviar

**Mensagem:**
```
🔋 Carregamento iniciado!

📍 [Nome do Carregador]
🕐 Início: [Data/Hora]
🏢 Apartamento: [Número]

Acompanhe pelo dashboard VETRIC!
```

---

### 2️⃣ **ALERTA DE OCIOSIDADE**
**Trigger:** 3 `MeterValues` consecutivos com `Power < 100W`

**Condições:**
- Carregamento ainda ativo (não recebeu `StopTransaction`)
- Não enviou este alerta nos últimos 10 minutos (evitar spam)

**Lógica:**
```typescript
let consecutiveIdleCount = 0;
let lastIdleAlertSent: Date | null = null;

onMeterValues(meterValues) {
  const power = extractPower(meterValues);
  
  if (power < 100) {
    consecutiveIdleCount++;
    
    if (consecutiveIdleCount >= 3) {
      const now = new Date();
      const canSendAlert = !lastIdleAlertSent || 
                          (now - lastIdleAlertSent) > 10 * 60 * 1000;
      
      if (canSendAlert) {
        sendIdleNotification();
        lastIdleAlertSent = now;
      }
    }
  } else {
    consecutiveIdleCount = 0; // Reset se voltou a carregar
  }
}
```

**Mensagem:**
```
⚠️ Carregamento ocioso

Seu carregamento está sem consumo há 3 minutos.
Sua bateria pode estar cheia.

⚡ Consumo até agora: [X.XX] kWh
📍 [Nome do Carregador]

Por favor, remova o cabo para liberar o carregador.
```

---

### 3️⃣ **CARGA COMPLETA** (SuspendedEV → Remote)
**Trigger:** `StatusNotification: SuspendedEV` + `StopTransaction (reason: Remote)`

**Condições:**
- Recebeu `SuspendedEV` nos últimos 2 minutos
- `StopTransaction` com `reason: "Remote"`

**Lógica:**
```typescript
let lastSuspendedEV: Date | null = null;

onStatusNotification(status) {
  if (status === 'SuspendedEV') {
    lastSuspendedEV = new Date();
  }
}

onStopTransaction(stop) {
  if (stop.reason === 'Remote' && lastSuspendedEV) {
    const timeSinceSuspended = new Date() - lastSuspendedEV;
    
    if (timeSinceSuspended < 2 * 60 * 1000) { // 2 minutos
      sendCompletedNotification(stop);
      return; // Não enviar notificação de "fim normal"
    }
  }
  
  // Outros casos...
}
```

**Mensagem:**
```
🔋 Carga completa!

Seu veículo está com a bateria carregada.

⚡ Consumo: [X.XX] kWh
⏱️ Duração: [X] minutos
📍 [Nome do Carregador]

Por favor, remova o cabo para liberar a vaga.
```

---

### 4️⃣ **FIM NORMAL** (EVDisconnected após ociosidade)
**Trigger:** `StopTransaction (reason: EVDisconnected)`

**Condições:**
- `reason === 'EVDisconnected'`
- Último `MeterValues` tinha `Power < 100W` (estava ocioso)

**Mensagem:**
```
✅ Carregamento finalizado!

⚡ Consumo: [X.XX] kWh
⏱️ Duração: [Xh XXmin]
📍 [Nome do Carregador]

Obrigado por liberar o carregador!
```

---

### 5️⃣ **INTERRUPÇÃO DURANTE CARREGAMENTO ATIVO**
**Trigger:** `StopTransaction` com `Power > 1000W`

**Condições:**
- Último `MeterValues` tinha `Power > 1000W` (estava carregando ativamente)
- `reason !== 'EVDisconnected'` (não foi desconexão natural após ociosidade)

**Mensagem:**
```
⚠️ Carregamento interrompido

Seu carregamento foi finalizado antes do esperado.

⚡ Consumo parcial: [X.XX] kWh
⏱️ Duração: [X] minutos
📍 [Nome do Carregador]

Se não foi você, verifique seu veículo.
```

---

### 6️⃣ **ERRO/FALHA**
**Trigger:** `StatusNotification: Faulted` ou `StopTransaction (reason: Other/PowerLoss/EmergencyStop)`

**Condições:**
- Status mudou para `Faulted`
- OU `reason` indica erro

**Mensagem:**
```
❌ Erro no carregamento

O carregador detectou um problema e interrompeu 
o carregamento.

⚡ Consumo até o erro: [X.XX] kWh
📍 [Nome do Carregador]

Entre em contato com o síndico ou tente novamente.
```

---

## 🔄 Fluxo de Decisão (Diagrama)

```
StartTransaction
    ↓
[NOTIFICAÇÃO 1: Início]
    ↓
MeterValues (loop)
    ↓
    ├─ Power > 100W → Carregando normalmente
    │                  ↓
    │              (continua loop)
    │
    └─ Power < 100W → Contador de ociosidade++
                       ↓
                   ≥ 3 MeterValues com Power < 100W?
                       ↓
                   [NOTIFICAÇÃO 2: Ociosidade]
                       ↓
                   (aguarda StopTransaction)
    ↓
StatusNotification: SuspendedEV
    ↓
(Marca timestamp: lastSuspendedEV)
    ↓
RemoteStopTransaction
    ↓
StopTransaction
    ↓
    ├─ reason: "Remote" + SuspendedEV recente?
    │       ↓
    │   [NOTIFICAÇÃO 3: Carga Completa]
    │
    ├─ reason: "EVDisconnected" + Power < 100W?
    │       ↓
    │   [NOTIFICAÇÃO 4: Fim Normal]
    │
    ├─ Power > 1000W (estava carregando)?
    │       ↓
    │   [NOTIFICAÇÃO 5: Interrupção]
    │
    └─ errorCode !== "NoError"?
            ↓
        [NOTIFICAÇÃO 6: Erro]
```

---

## 💾 Estrutura de Dados Necessária

### Adicionar na tabela `carregamentos`:

```sql
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  ultimo_power_w INTEGER DEFAULT NULL,
  contador_ociosidade INTEGER DEFAULT 0,
  ultimo_alerta_ociosidade TIMESTAMP DEFAULT NULL,
  suspended_ev_timestamp TIMESTAMP DEFAULT NULL,
  tipo_finalizacao VARCHAR(50) DEFAULT NULL;
  -- Valores: 'completa', 'normal', 'interrompida', 'erro', 'ociosidade'
```

### Adicionar campo em `logs_notificacoes`:

```sql
ALTER TABLE logs_notificacoes ADD COLUMN IF NOT EXISTS
  tipo_notificacao VARCHAR(50) DEFAULT NULL;
  -- Valores: 'inicio', 'ociosidade', 'completa', 'fim', 'interrupção', 'erro'
```

---

## 🚀 Próximos Passos

1. ✅ **Análise completa** (CONCLUÍDO)
2. 📝 **Aprovar proposta** (AGUARDANDO)
3. 💻 **Implementar lógica no WebSocket handler**
4. 🧪 **Testar com dados reais**
5. 🚀 **Deploy em produção**

---

## 📋 Checklist de Implementação

- [ ] Atualizar schema do banco de dados
- [ ] Implementar lógica de MeterValues (contador de ociosidade)
- [ ] Implementar lógica de StatusNotification (detectar SuspendedEV)
- [ ] Implementar lógica de StopTransaction (decidir tipo de notificação)
- [ ] Criar templates de mensagens
- [ ] Adicionar logs detalhados para debug
- [ ] Testar cenário 1: Bateria cheia
- [ ] Testar cenário 2: Morador desconectou
- [ ] Testar cenário 3: Ociosidade
- [ ] Testar cenário 4: Interrupção
- [ ] Testar cenário 5: Erro
- [ ] Validar em produção

---

**Data:** 31/01/2026  
**Autor:** Sistema de Análise VETRIC  
**Status:** Aguardando aprovação


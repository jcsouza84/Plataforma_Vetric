# 🔍 Onde Ver Mensagens CVE-PRO ↔ Plataforma do Síndico

## 🎯 Situação Atual

**Transação Analisada:**
- **ID:** 439071
- **Usuário:** Saskya Lorena  
- **Carregador:** Gran Marine 6 (JDBM1200040BB)
- **Data:** 30/01/2026 20:45 - 22:35
- **Duração:** 1h50min
- **Energia:** 11,4 kWh
- **Problema:** WhatsApp só recebeu notificação de INÍCIO, não de FINALIZAÇÃO

---

## 📊 3 Lugares Onde as Mensagens Podem Estar

### 1️⃣ **CVE-PRO (Origem)** 
📍 **Localização:** Servidor Intelbras  
🔗 **URL:** https://cs.intelbras-cve-pro.com.br

**Como acessar:**
```bash
# Via API REST
npx ts-node buscar-transacao-saskya.ts

# Testa múltiplos endpoints para encontrar a transação
```

**O que você verá:**
- Status de cada fase (Charging → Finishing → Available)
- Timestamps exatos
- Energia consumida
- MeterValues

---

### 2️⃣ **Plataforma do Síndico - Backend (Intermediário)**
📍 **Localização:** Seu servidor Node.js (Render)  
🗄️ **Banco:** PostgreSQL

**Como acessar:**
```bash
# Buscar no banco de dados local/produção
npx ts-node buscar-no-banco-saskya.ts
```

**O que você verá:**
- Carregamentos registrados
- Status armazenado
- Notificações enviadas
- Logs do sistema

**Tabelas importantes:**
- `carregamentos` → Transações registradas
- `logs_notificacoes` → WhatsApp enviados
- `moradores` → Mapeamento Tag RFID → Nome

---

### 3️⃣ **WhatsApp (Destino Final)**
📍 **Localização:** Evolution API  
📱 **Destino:** Telefones dos moradores

**Como verificar:**
- Ver telefone de teste que você configurou
- Verificar histórico de mensagens enviadas
- Logs da Evolution API (se disponíveis)

---

## 🔄 Fluxo Completo das Mensagens

```
┌─────────────────────┐
│    CVE-PRO          │
│  (Intelbras Server) │
└──────────┬──────────┘
           │
           │ WebSocket STOMP
           │ /topic/status/chargeBox/JDBM1200040BB/connector/1
           │
           ▼
    [MENSAGENS]
    ├─ status: "Charging"     (20:45)
    ├─ status: "SuspendedEV"  (22:35?) ← Pode estar perdendo
    ├─ status: "Finishing"    (22:35?) ← Pode estar perdendo
    └─ status: "Available"    (22:35?) ← Pode estar perdendo
           │
           ▼
┌─────────────────────┐
│ Plataforma Síndico  │
│   (Seu Backend)     │
│                     │
│ Serviços:           │
│ • WebSocketService  │ ← Recebe mensagens
│ • PollingService    │ ← Busca via REST
│ • NotificationSvc   │ ← Envia WhatsApp
└──────────┬──────────┘
           │
           │ Processa e decide
           │ se envia notificação
           │
           ▼
    [DECISÃO]
    ├─ "Charging" → ✅ ENVIA WhatsApp
    ├─ "Finishing" → ❓ DEVERIA enviar mas...
    └─ "Available" → ❓ DEVERIA enviar mas...
           │
           ▼
┌─────────────────────┐
│   Evolution API     │
│   (WhatsApp Bot)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  📱 WhatsApp        │
│  (Morador recebe)   │
└─────────────────────┘
```

---

## 🔍 Como Diagnosticar Onde Está o Problema

### Teste 1: CVE-PRO Envia a Mensagem?

**Execute:**
```bash
npx ts-node buscar-transacao-saskya.ts
```

**Procure:**
- A transação 439071 existe?
- Tem timestamp de `stopTimestamp`?
- O status final é "Completed"?

**Resultado:**
- ✅ **SIM** → CVE-PRO enviou corretamente
- ❌ **NÃO** → Problema no CVE-PRO (improvável)

---

### Teste 2: Backend Recebeu e Registrou?

**Execute:**
```bash
npx ts-node buscar-no-banco-saskya.ts
```

**Procure:**
- Existe registro com `transaction_pk = 439071`?
- Tem data de `fim`?
- Status é "Completed"?
- Há registro em `logs_notificacoes`?

**Resultado:**
- ✅ **SIM** com status "Completed" → Backend recebeu a finalização
- ✅ **SIM** mas sem data `fim` → Backend NÃO recebeu finalização
- ❌ **NÃO existe** → Backend nem registrou a transação

---

### Teste 3: Backend Tentou Enviar WhatsApp?

**No resultado do teste 2, verifique:**

```sql
SELECT * FROM logs_notificacoes 
WHERE mensagem LIKE '%439071%' 
   OR mensagem LIKE '%saskya%'
ORDER BY created_at DESC;
```

**Procure:**
- Quantas notificações foram enviadas?
- Há notificação de finalização?
- Status da notificação (sucesso/erro)?

**Resultado:**
- ✅ **1 notificação** (início) → Backend não processou finalização
- ✅ **2+ notificações** → Backend processou mas pode ter falhado envio
- ❌ **0 notificações** → Backend não enviou nada

---

## 🎯 Possíveis Causas do Problema

### Causa 1: WebSocket Não Subscrito aos Status de Finalização ⚠️

**Problema:**
```typescript
// Se o código só processa "Charging"
if (message.status === 'Charging') {
  sendWhatsApp();
}
// Então "Finishing" e "Available" são ignorados!
```

**Onde verificar:**
- `apps/backend/src/services/WebSocketService.ts`
- Procure por `subscribe` e veja quais status são processados

**Como corrigir:**
```typescript
// Processar TODOS os status relevantes
if (['Charging', 'Finishing', 'SuspendedEV', 'Available'].includes(message.status)) {
  processMessage(message);
}
```

---

### Causa 2: Mensagens Chegam em Tópico Diferente 🔌

**Problema:**
Mensagens de finalização podem vir em tópico diferente:

```typescript
// Está subscrito apenas a:
/topic/status/chargeBox/JDBM1200040BB/connector/1

// Mas finalizações podem vir em:
/topic/notifications  ← TRANSACTION_COMPLETED
/user/queue/notifications
```

**Como corrigir:**
Subscrever aos 3 tópicos

---

### Causa 3: PollingService Não Busca Finalizações 🔄

**Problema:**
Se o WebSocket falhar, o PollingService deveria buscar via REST, mas pode estar:
- Buscando apenas transações "Active"
- Não atualizando transações já registradas

**Onde verificar:**
- `apps/backend/src/services/PollingService.ts`
- Ver filtro de `status` nas queries

---

### Causa 4: Lógica de Notificação Condicional 📢

**Problema:**
```typescript
// Se tem condição que só notifica em "Charging"
if (carregamento.status === 'Charging' && !carregamento.notificacao_enviada) {
  sendWhatsApp();
}
// Nunca vai notificar finalização!
```

**Onde verificar:**
- `apps/backend/src/services/NotificationService.ts`
- Procure por condições `if` antes de enviar

---

## 🚀 Próximos Passos

### Passo 1: Diagnóstico (AGORA)
```bash
# 1. Ver se CVE-PRO tem os dados
npx ts-node buscar-transacao-saskya.ts

# 2. Ver se banco registrou
npx ts-node buscar-no-banco-saskya.ts

# 3. Comparar resultados
```

### Passo 2: Identificar Onde Parou
Compare os 2 resultados:
- CVE-PRO tem `stopTimestamp`? 
- Banco tem `fim`?
- Tem log de notificação de finalização?

### Passo 3: Monitorar Próxima Recarga
```bash
# Rodar em tempo real para ver o que acontece
./monitor-gran-marine-6.sh
```

### Passo 4: Corrigir (Depois de Identificar)
Baseado no diagnóstico, corrigir:
- WebSocketService (processar mais status)
- PollingService (buscar finalizações)
- NotificationService (notificar finalização)

---

## 📁 Arquivos Criados para Você

1. ✅ `buscar-transacao-saskya.ts` - Busca na API CVE-PRO
2. ✅ `buscar-no-banco-saskya.ts` - Busca no banco local
3. ✅ `buscar-mensagens-saskya.sh` - Busca nos logs
4. ✅ `monitor-gran-marine-6.sh` - Monitor tempo real

---

## 💡 Resumo: O Que Fazer AGORA

```bash
# Execute estes 2 comandos:
npx ts-node buscar-transacao-saskya.ts
npx ts-node buscar-no-banco-saskya.ts

# Compare os resultados e me mostre!
```

**Perguntas a responder:**
1. CVE-PRO tem a transação 439071 completa? (com stopTime?)
2. Seu banco tem ela registrada? (com data de fim?)
3. Tem notificação de finalização em logs_notificacoes?

**Com essas respostas, saberemos exatamente onde o fluxo está quebrando!** 🎯

---

**Desenvolvido para VETRIC** 🚀


# 🔍 Como Executar o Teste da Transação 439071

## 📋 Métodos Disponíveis

---

## ✅ MÉTODO 1: Via Render Dashboard (Recomendado)

### Passo 1: Acessar Shell do Render
1. Acesse: https://dashboard.render.com
2. Vá no serviço **Backend**
3. Clique em **Shell**

### Passo 2: Executar Queries SQL
No shell do Render, execute:

```bash
# Conectar ao banco
psql $DATABASE_URL

# Depois, executar as queries:
```

```sql
-- 1. Buscar transação 439071
SELECT 
  c.transaction_pk,
  c.carregador_nome,
  c.inicio,
  c.fim,
  c.status,
  c.energia_consumida,
  m.nome as morador_nome,
  m.tag_rfid
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.transaction_pk = 439071;

-- 2. Buscar notificações
SELECT 
  created_at,
  tipo,
  mensagem,
  status
FROM logs_notificacoes
WHERE mensagem LIKE '%439071%'
   OR mensagem LIKE '%saskya%'
ORDER BY created_at DESC;

-- 3. Ver últimos carregamentos da Saskya
SELECT 
  c.transaction_pk,
  c.inicio,
  c.fim,
  c.status,
  m.nome
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE LOWER(m.nome) LIKE '%saskya%'
ORDER BY c.inicio DESC
LIMIT 5;
```

---

## ✅ MÉTODO 2: Via Terminal Local

### Passo 1: Obter DATABASE_URL

No Render Dashboard:
1. Vá em **Environment**
2. Copie o valor de `DATABASE_URL`

### Passo 2: Executar Script

```bash
# Cole a URL do banco
export DATABASE_URL="postgresql://usuario:senha@host/database"

# Execute o script
npx ts-node buscar-producao-saskya.ts
```

---

## ✅ MÉTODO 3: Via Script Shell

```bash
# Definir URL e executar
DATABASE_URL="postgresql://..." ./testar-transacao-saskya.sh
```

---

## 📊 O Que Procurar nos Resultados

### ✅ Cenário 1: Tudo OK
```
transaction_pk: 439071
inicio: 2026-01-30 20:45:00
fim: 2026-01-30 22:35:00  ✅
status: Completed
energia_consumida: 11.4

Notificações: 2
- Início enviado ✅
- Fim enviado ✅
```

**Diagnóstico:** Sistema funcionando corretamente!

---

### ⚠️ Cenário 2: Sem Data de Fim
```
transaction_pk: 439071
inicio: 2026-01-30 20:45:00
fim: NULL  ❌
status: Charging
energia_consumida: NULL

Notificações: 1
- Início enviado ✅
- Fim NÃO enviado ❌
```

**Diagnóstico:** Backend **NÃO RECEBEU** mensagem de finalização do CVE-Pro!

**Problema:** WebSocket/Polling não está capturando:
- `StopTransaction`
- `StatusNotification` com status="Finishing"
- `StatusNotification` com status="Available"

---

### ❌ Cenário 3: Transação Não Existe
```
0 rows returned
```

**Diagnóstico:** Backend **NÃO REGISTROU** a transação!

**Problema:** Sistema não capturou nem o início da carga.

---

## 🎯 Após Identificar o Problema

### Se Backend NÃO Recebeu Finalização:

Verificar código em:
- `apps/backend/src/services/WebSocketService.ts`
- `apps/backend/src/services/PollingService.ts`

Procurar por:
```typescript
// Código atual (provável):
if (message.status === 'Charging') {
  processarInicio(message);
}

// Falta adicionar:
if (message.status === 'Finishing' || message.status === 'SuspendedEV') {
  processarFinalizacao(message);
}

if (message.type === 'StopTransaction') {
  finalizarCarregamento(message);
}
```

---

### Se Backend Recebeu MAS Não Notificou:

Verificar código em:
- `apps/backend/src/services/NotificationService.ts`

Procurar por lógica que decide quando enviar WhatsApp.

---

## 📝 Comandos Rápidos

```bash
# Ver estrutura da tabela carregamentos
\d carregamentos

# Ver estrutura da tabela logs_notificacoes  
\d logs_notificacoes

# Contar total de carregamentos
SELECT COUNT(*) FROM carregamentos;

# Ver últimos 5 carregamentos
SELECT transaction_pk, inicio, fim, status, carregador_nome 
FROM carregamentos 
ORDER BY created_at DESC 
LIMIT 5;

# Ver últimas notificações
SELECT created_at, tipo, LEFT(mensagem, 50) as mensagem, status
FROM logs_notificacoes
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚀 Executar AGORA

**Escolha um método e execute!**

Me mostre os resultados para identificarmos exatamente onde está o problema! 🔍

---

**Desenvolvido para VETRIC** 🚀


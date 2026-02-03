# 🔍 MONITORAR SISTEMA EM TEMPO REAL - RENDER

**Objetivo:** Acompanhar notificações sendo enviadas em produção  
**Onde:** Sistema rodando no Render (não local)

---

## 🎯 OPÇÃO 1: LOGS DO RENDER (RECOMENDADO)

### Como acessar:

1. Acesse: https://dashboard.render.com
2. Selecione o serviço **Backend**
3. Clique em **"Logs"**
4. Role até o final (logs mais recentes)

### O que você verá em tempo real:

```
🔍 [Polling] Buscando transações ativas do CVE...
✅ [Polling] 2 transações ativas encontradas
✅ [Polling] Processando transação: abc123...
✅ [Polling] Morador identificado: Fernando Luis Tenorio Mascarenhas
⏰ [Polling] Aguardando tempo mínimo (2/3 min)
...
📱 [Polling] Notificação de início enviada para Fernando Luis Tenorio Mascarenhas
✅ [Polling] Carregamento 180 marcado com notificação enviada
```

**Frequência:** Atualiza a cada 10 segundos (intervalo do Polling)

---

## 🎯 OPÇÃO 2: CONSULTAR BANCO EM TEMPO REAL

Vou criar um script para você monitorar o banco do Render.

---

## 📊 OPÇÃO 3: DASHBOARD (Próxima implementação)

Futuramente podemos criar um dashboard web para monitorar em tempo real.

---

## 🔍 O QUE MONITORAR:

### 1. Carregamentos Ativos:
```sql
SELECT 
  c.id,
  c.charger_name,
  m.nome,
  c.notificacao_inicio_enviada,
  ROUND(EXTRACT(EPOCH FROM (NOW() - c.inicio))/60) as minutos
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.fim IS NULL
ORDER BY c.inicio DESC;
```

### 2. Notificações Enviadas (última hora):
```sql
SELECT 
  l.id,
  m.nome,
  l.status,
  l.criado_em
FROM logs_notificacoes l
JOIN moradores m ON l.morador_id = m.id
WHERE l.criado_em > NOW() - INTERVAL '1 hour'
ORDER BY l.criado_em DESC;
```

### 3. Moradores com Notificações Ativas:
```sql
SELECT 
  COUNT(*) as total
FROM moradores
WHERE notificacoes_ativas = true
  AND telefone IS NOT NULL;
```

---

## 🚀 PRÓXIMOS CARREGAMENTOS:

O Polling está rodando **A CADA 10 SEGUNDOS**.

Quando um novo carregamento iniciar:
1. **T+0s:** CVE detecta carregamento
2. **T+10s:** Polling detecta
3. **T+3min:** Notificação enviada
4. **WhatsApp chega** no morador

**Todos os moradores** com `notificacoes_ativas = true` receberão!

---

## ⚡ MONITORAMENTO ATIVO:

Vou criar um script para você acompanhar em tempo real...

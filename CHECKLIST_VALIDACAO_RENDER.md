# ✅ CHECKLIST: VALIDAÇÃO DO SISTEMA NO RENDER

**Data:** 02/02/2026  
**Deploy:** ✅ Concluído  
**Próximo passo:** Validar que está funcionando

---

## 🎯 OBJETIVO

Confirmar que o sistema está:
1. ✅ Rodando sem erros
2. ✅ Detectando carregamentos
3. ✅ Enviando notificações

---

## 📋 CHECKLIST DE VALIDAÇÃO

### PARTE 1: LOGS DO RENDER

Acesse: https://dashboard.render.com → Backend → Logs

#### ✅ Sistema Inicializado:
- [ ] Vejo mensagem: "Servidor rodando na porta 3001"
- [ ] Vejo mensagem: "Polling iniciado com sucesso"
- [ ] Backend está com status "Running" (verde)

#### ✅ Polling Ativo:
- [ ] Vejo mensagem: "Buscando transações ativas do CVE"
- [ ] Esta mensagem se repete a cada ~10 segundos
- [ ] Não há erros em vermelho

#### ✅ Processamento de Transações:
- [ ] Vejo: "X transações ativas encontradas" (onde X pode ser 0 ou mais)
- [ ] Se X > 0: Vejo "Processando transação: [UUID]"
- [ ] Se X = 0: Normal, aguardar próximo carregamento

#### ✅ Identificação de Moradores:
- [ ] Vejo: "Morador identificado: [Nome]" (se houver carregamento)
- [ ] Ou vejo: "Morador não identificado" (normal se for visita)

#### ✅ Envio de Notificações:
- [ ] Vejo: "Notificação de início enviada para [Nome]"
- [ ] Ou vejo: "Aguardando tempo mínimo (X/3 min)" (normal se recém iniciou)

#### ❌ Verificar Erros:
- [ ] NÃO vejo erros de "Cannot find module"
- [ ] NÃO vejo erros de "TypeError"
- [ ] NÃO vejo erros de "Database error"
- [ ] NÃO vejo erros de "Evolution API"

---

### PARTE 2: BANCO DE DADOS

Execute no terminal:

```bash
psql "postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db" << 'SQL'
-- Carregamentos ativos agora
SELECT COUNT(*) as ativos 
FROM carregamentos 
WHERE fim IS NULL;

-- Última notificação enviada
SELECT criado_em, tipo, status 
FROM logs_notificacoes 
ORDER BY criado_em DESC 
LIMIT 1;
SQL
```

#### ✅ Resultados Esperados:
- [ ] Consulta executou sem erro
- [ ] Se `ativos > 0`: Há carregamentos para processar
- [ ] Se `ativos = 0`: Normal, aguardar próximo
- [ ] Se há log recente (última hora): Sistema funcionando!

---

### PARTE 3: TESTE PRÁTICO (Opcional)

Se quiser testar localmente sem esperar carregamento real:

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
./executar-simulacao-teste.sh
```

#### ✅ No Simulador:
- [ ] Escolhi modo MOCK (seguro)
- [ ] Sistema mostrou mensagem que seria enviada
- [ ] Log foi salvo no banco
- [ ] Teste concluído sem erros

---

## 🎯 RESULTADO DA VALIDAÇÃO

### ✅ SUCESSO TOTAL (Tudo OK!)

Se você marcou:
- [x] Sistema iniciado
- [x] Polling rodando
- [x] Sem erros
- [x] Se houver carregamento: processando corretamente

**→ PARABÉNS! Sistema 100% funcional! 🎉**

**Próximo passo:**
- Monitorar próximo carregamento real
- Confirmar que notificação chega no WhatsApp

---

### ⚠️ SUCESSO PARCIAL (Aguardando validação)

Se você marcou:
- [x] Sistema iniciado
- [x] Polling rodando
- [x] Sem erros
- [ ] Nenhum carregamento ativo no momento

**→ SISTEMA FUNCIONANDO! Aguardando carregamento real para validar 100%**

**Próximo passo:**
- Aguardar próximo carregamento
- Monitorar logs quando iniciar
- Confirmar envio após 3 minutos

---

### ⚠️ PROBLEMA DETECTADO

Se você marcou:
- [ ] Polling NÃO está rodando
- [ ] Vejo erros nos logs
- [ ] Sistema não está processando

**→ REQUER AÇÃO CORRETIVA**

**Ações:**

1. **Se Polling não aparece:**
   - Forçar restart: Render → Manual Deploy
   - Verificar variáveis de ambiente
   - Verificar branch: deve ser `feature/4-eventos-notificacao`

2. **Se há erros:**
   - Copiar mensagem COMPLETA do erro
   - Anotar horário do erro
   - Verificar se migrations foram aplicadas

3. **Se processa mas não envia:**
   - Verificar se passou 3 minutos
   - Verificar se morador tem telefone
   - Verificar se morador tem `notificacoes_ativas = true`

---

## 📊 CENÁRIOS COMUNS

### CENÁRIO A: "Tudo OK nos logs, mas nenhum carregamento ativo"
**Status:** ✅ **NORMAL**  
**Ação:** Aguardar próximo carregamento real  
**Timeline:** Quando alguém conectar veículo

### CENÁRIO B: "Logs mostram processamento, mas 'Aguardando tempo mínimo'"
**Status:** ✅ **NORMAL**  
**Ação:** Aguardar completar 3 minutos  
**Timeline:** Notificação será enviada em poucos minutos

### CENÁRIO C: "Polling roda a cada 10s, mas 0 transações"
**Status:** ✅ **NORMAL**  
**Ação:** Nenhum carregamento ativo no CVE  
**Timeline:** Aguardar próximo

### CENÁRIO D: "Processou, enviou, mas morador não recebeu"
**Status:** ⚠️ **VERIFICAR EVOLUTION API**  
**Ação:** 
- Confirmar que log mostra `status = 'enviado'`
- Verificar número de telefone do morador
- Testar Evolution API manualmente

### CENÁRIO E: "Polling não aparece nos logs"
**Status:** ❌ **PROBLEMA**  
**Ação:** 
- Forçar restart do backend
- Verificar variáveis: `DATABASE_URL`, `CVE_USERNAME`, etc
- Verificar branch correta

### CENÁRIO F: "Erros de 'Cannot find module' ou 'TypeError'"
**Status:** ❌ **PROBLEMA CRÍTICO**  
**Ação:**
- Copiar erro completo
- Verificar se migrations 014 e 015 foram aplicadas
- Pode precisar redeployar

---

## 🔍 COMANDOS ÚTEIS PARA DEBUG

### Verificar carregamentos ativos detalhado:
```sql
SELECT 
  c.id,
  c.charger_name,
  m.nome as morador,
  c.inicio,
  c.notificacao_inicio_enviada,
  ROUND(EXTRACT(EPOCH FROM (NOW() - c.inicio))/60) as minutos_ativo
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.fim IS NULL
ORDER BY c.inicio DESC;
```

### Verificar moradores válidos para notificação:
```sql
SELECT 
  id, 
  nome, 
  telefone, 
  notificacoes_ativas
FROM moradores
WHERE telefone IS NOT NULL 
  AND notificacoes_ativas = true;
```

### Verificar templates ativos:
```sql
SELECT 
  tipo, 
  ativo, 
  tempo_minutos, 
  power_threshold_w
FROM templates_notificacao
ORDER BY tipo;
```

### Ver últimos logs de notificação:
```sql
SELECT 
  l.id,
  m.nome,
  l.tipo,
  l.status,
  l.criado_em,
  SUBSTRING(l.mensagem_enviada, 1, 50) as preview
FROM logs_notificacoes l
LEFT JOIN moradores m ON l.morador_id = m.id
ORDER BY l.criado_em DESC
LIMIT 10;
```

---

## 📞 SE PRECISAR DE AJUDA

### Logs do Render mostram erro desconhecido:
1. Copie mensagem COMPLETA (incluindo stack trace)
2. Anote horário exato do erro
3. Informe se erro se repete ou foi pontual

### Notificações não chegam no WhatsApp:
1. Confirme que log mostra `status = 'enviado'`
2. Verifique Evolution API:
   ```sql
   SELECT chave, LEFT(valor, 20) 
   FROM configuracoes_sistema 
   WHERE chave LIKE 'evolution_%';
   ```
3. Teste Evolution API separadamente

### Polling não roda:
1. Print dos logs do Render
2. Print das variáveis de ambiente (sem valores sensíveis!)
3. Branch ativa no Render

---

## ✅ CHECKLIST FINAL

Marque quando completar cada etapa:

- [ ] Acessei logs do Render
- [ ] Verifiquei que Polling está rodando
- [ ] Verifiquei se há erros
- [ ] Consultei banco de dados
- [ ] (Opcional) Executei teste local
- [ ] Determinei status: SUCESSO / AGUARDANDO / PROBLEMA
- [ ] Se problema: anotei detalhes do erro
- [ ] Se sucesso: aguardando próximo carregamento real

---

## 🎯 RESULTADO

**Preencha após validação:**

```
Data/Hora da validação: _______________
Polling rodando: [ ] SIM [ ] NÃO
Carregamentos ativos: _______ (quantidade)
Notificações enviadas (última hora): _______
Erros encontrados: [ ] SIM [ ] NÃO

Se SIM, qual erro:
________________________________
________________________________

Status final: 
[ ] ✅ Sistema funcionando 100%
[ ] ⚠️  Sistema OK, aguardando carregamento para validar
[ ] ❌ Problema encontrado, requer correção
```

---

## 📚 DOCUMENTOS DE REFERÊNCIA

- **RESUMO_SESSAO_COMPLETA.md** - Resumo de tudo que foi feito
- **VERIFICAR_LOGS_RENDER.md** - Como interpretar logs
- **ERROS_CRITICOS_CORRIGIDOS.md** - Erros que já foram resolvidos
- **SIMULADOR_TESTE_GUIA.md** - Como testar localmente

---

**Preparado por:** Cursor AI  
**Data:** 02/02/2026  
**Versão:** 1.0  
**Deploy:** feature/4-eventos-notificacao

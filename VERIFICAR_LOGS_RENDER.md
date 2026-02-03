# 🔍 GUIA: VERIFICAR LOGS DO RENDER

**Objetivo:** Entender se o backend está funcionando e detectando carregamentos  
**Tempo:** 5 minutos  
**Urgência:** 🔴 **ALTA**

---

## 🎯 POR QUE VERIFICAR?

**Situação Atual:**
- ✅ Deploy OK
- ✅ Backend rodando
- ❌ **Nenhuma notificação nas últimas 2h**

**Possíveis Causas:**
1. Polling não está rodando
2. Polling está com erro silencioso
3. Carregamentos não estão sendo detectados
4. Evolution API não está respondendo

---

## 📋 PASSO A PASSO

### 1️⃣ ACESSAR O RENDER

1. Abra: https://dashboard.render.com
2. Faça login
3. Localize o serviço **Backend** (Web Service)
4. Clique no serviço

### 2️⃣ ABRIR LOGS EM TEMPO REAL

1. No menu lateral esquerdo, clique em **"Logs"**
2. Os logs aparecem em tempo real
3. Role até o final (logs mais recentes)

### 3️⃣ PROCURAR POR MENSAGENS-CHAVE

Procure pelas seguintes mensagens:

#### ✅ **Mensagens de Sucesso (esperadas):**

```
🔍 [Polling] Buscando transações ativas do CVE...
✅ [Polling] X transações ativas encontradas
✅ [Polling] Processando transação: [UUID]
✅ [Polling] Morador identificado: [Nome]
📱 [Polling] Notificação de início enviada para [Nome]
```

#### ⚠️ **Mensagens de Alerta (OK se aparecerem):**

```
⚠️ [Polling] Morador não identificado
⚠️ [Polling] Aguardando tempo mínimo
⚠️ [Polling] Notificação já enviada anteriormente
```

#### ❌ **Mensagens de Erro (PROBLEMA!):**

```
❌ Erro ao buscar transações
❌ Erro ao enviar notificação
❌ Error: Cannot find module
❌ TypeError: ...
❌ Evolution API error
❌ Database error
```

---

## 🔍 O QUE CADA MENSAGEM SIGNIFICA

### 🟢 `Polling iniciado com sucesso`
**Significado:** Sistema de polling está ativo  
**O que fazer:** ✅ OK, continue observando

### 🟢 `Buscando transações ativas do CVE...`
**Significado:** Polling está consultando API do CVE  
**Frequência esperada:** A cada 10 segundos  
**O que fazer:** ✅ OK, sistema funcionando

### 🟡 `0 transações ativas encontradas`
**Significado:** Nenhum carregamento ativo no momento  
**O que fazer:** ✅ Normal se ninguém está carregando

### 🟢 `X transações ativas encontradas`
**Significado:** Tem carregamentos ativos  
**O que fazer:** ✅ Verificar próxima linha, deve processar

### 🟢 `Processando transação: [UUID]`
**Significado:** Detectou carregamento e está processando  
**O que fazer:** ✅ Verificar próximas linhas

### 🟢 `Morador identificado: [Nome]`
**Significado:** Sistema identificou quem está carregando  
**O que fazer:** ✅ Excelente! Deve enviar notificação

### 🟡 `Morador não identificado para tag [XXXXX]`
**Significado:** Carregamento sem dono  
**O que fazer:** ✅ Normal, pode ser visita ou tag não cadastrada

### 🟡 `Aguardando tempo mínimo (X/3 min)`
**Significado:** Carregamento detectado, mas ainda não passou 3 min  
**O que fazer:** ✅ Normal! Esperar chegar a 3 minutos

### 🟢 `Notificação de início enviada para [Nome]`
**Significado:** ✅ **SUCESSO TOTAL!** Mensagem enviada  
**O que fazer:** 🎉 Sistema funcionando!

### 🟡 `Notificação já enviada anteriormente`
**Significado:** Carregamento já tem notificação  
**O que fazer:** ✅ Normal, não reenvia duplicado

### 🔴 `Erro ao enviar notificação:`
**Significado:** Falha no envio  
**O que fazer:** ⚠️ Copiar mensagem de erro completa e enviar

### 🔴 `Evolution API error`
**Significado:** API do WhatsApp não respondeu  
**O que fazer:** ⚠️ Verificar configurações da Evolution API

### 🔴 `Database error`
**Significado:** Erro ao acessar banco  
**O que fazer:** ⚠️ Verificar se migrations foram aplicadas

---

## 📊 CENÁRIOS POSSÍVEIS

### CENÁRIO 1: Logs Mostram Polling Ativo + Processando
```
🔍 [Polling] Buscando transações ativas do CVE...
✅ [Polling] 1 transações ativas encontradas
✅ [Polling] Processando transação: 12345-abc...
✅ [Polling] Morador identificado: João Silva
⚠️ [Polling] Aguardando tempo mínimo (2/3 min)
```

**✅ DIAGNÓSTICO:** Sistema funcionando perfeitamente!  
**📋 AÇÃO:** Aguardar 1 minuto, deve enviar notificação

---

### CENÁRIO 2: Logs Mostram Polling Mas 0 Transações
```
🔍 [Polling] Buscando transações ativas do CVE...
ℹ️ [Polling] 0 transações ativas encontradas
```

**✅ DIAGNÓSTICO:** Sistema funcionando, mas sem carregamentos  
**📋 AÇÃO:** Aguardar próximo carregamento real

---

### CENÁRIO 3: Logs NÃO Mostram Polling
```
(Nenhuma mensagem sobre Polling)
```

**❌ DIAGNÓSTICO:** Polling não está iniciando!  
**📋 AÇÃO URGENTE:**
1. Verificar variáveis de ambiente no Render
2. Forçar restart do serviço
3. Verificar se arquivo `PollingService.ts` foi deployado

---

### CENÁRIO 4: Logs Mostram Erros
```
❌ [Polling] Erro ao buscar transações: Error: ...
```

**❌ DIAGNÓSTICO:** Problema técnico  
**📋 AÇÃO URGENTE:**
1. Copiar mensagem de erro completa
2. Enviar para análise
3. Verificar se API do CVE está acessível

---

### CENÁRIO 5: Morador Não Identificado
```
✅ [Polling] Processando transação: 12345-abc...
⚠️ [Polling] Morador não identificado para tag [ABC123]
```

**🟡 DIAGNÓSTICO:** Tag não cadastrada  
**📋 AÇÃO:** Normal se for visita. Se for morador, cadastrar tag.

---

## 🎯 CHECKLIST DE VERIFICAÇÃO

### No Render Logs, procure por:

- [ ] `Polling iniciado com sucesso` (deve aparecer 1x ao iniciar)
- [ ] `Buscando transações ativas` (deve aparecer a cada 10s)
- [ ] Transações sendo processadas (se houver carregamentos)
- [ ] Notificações sendo enviadas (se passou 3 min)
- [ ] **Nenhum erro em vermelho**

---

## 🔧 AÇÕES CORRETIVAS

### Se Polling NÃO está rodando:

1. **Forçar Restart:**
   - Render Dashboard → Backend
   - Settings → Manual Deploy → Deploy latest commit
   - Aguardar 2 minutos

2. **Verificar Variáveis de Ambiente:**
   - Environment → Deve ter:
     - `DATABASE_URL`
     - `CVE_USERNAME`
     - `CVE_PASSWORD`
     - `CVE_API_BASE_URL`

3. **Verificar Branch:**
   - Deploy → Deve ser `feature/4-eventos-notificacao`

---

### Se Polling está rodando MAS não envia notificações:

1. **Verificar Tempo:**
   - Sistema aguarda 3 minutos COMPLETOS
   - Ver nos logs: `Aguardando tempo mínimo (X/3 min)`

2. **Verificar Morador:**
   - Morador precisa estar identificado
   - Morador precisa ter telefone cadastrado
   - Morador precisa ter `notificacoes_ativas = true`

3. **Verificar Evolution API:**
   ```sql
   -- Rodar no banco
   SELECT chave, LEFT(valor, 20) as valor_parcial
   FROM configuracoes_sistema 
   WHERE chave LIKE 'evolution_%';
   ```

---

### Se houver ERRO nos logs:

**1. Copiar mensagem completa:**
```
Exemplo:
❌ [Polling] Erro ao enviar notificação: Error: Template não encontrado
    at NotificationService.enviarNotificacao (/app/src/services/NotificationService.ts:42:15)
    ...
```

**2. Enviar para análise**

**3. NÃO reiniciar antes de copiar**

---

## 📸 PRINT IDEAL (Tudo Funcionando)

```
2026-02-02T16:15:30Z 🔍 [Polling] Buscando transações ativas do CVE...
2026-02-02T16:15:30Z ✅ [Polling] 1 transações ativas encontradas
2026-02-02T16:15:30Z ✅ [Polling] Processando transação: a1b2c3...
2026-02-02T16:15:30Z ✅ [Polling] Morador identificado: João Silva
2026-02-02T16:15:30Z ⚠️ [Polling] Aguardando tempo mínimo (2/3 min)

... (1 minuto depois) ...

2026-02-02T16:16:30Z 🔍 [Polling] Buscando transações ativas do CVE...
2026-02-02T16:16:30Z ✅ [Polling] 1 transações ativas encontradas
2026-02-02T16:16:30Z ✅ [Polling] Processando transação: a1b2c3...
2026-02-02T16:16:30Z ✅ [Polling] Morador identificado: João Silva
2026-02-02T16:16:30Z 📱 [Polling] Notificação de início enviada para João Silva
2026-02-02T16:16:30Z ✅ [Polling] Carregamento 182 marcado com notificação enviada
```

---

## ⏱️ TIMELINE ESPERADA

**T+0s:** Carregamento inicia  
**T+10s:** Polling detecta  
**T+20s:** Polling verifica tempo (0/3 min)  
**T+30s:** Polling verifica tempo (0/3 min)  
...  
**T+3min:** Polling verifica tempo (3/3 min)  
**T+3min:** 📱 **NOTIFICAÇÃO ENVIADA!**  

---

## 🎯 RESULTADO ESPERADO

Depois de verificar os logs, você deve conseguir responder:

1. ✅ Polling está rodando? (Sim/Não)
2. ✅ Polling está detectando carregamentos? (Sim/Não/Nenhum ativo)
3. ✅ Sistema está processando corretamente? (Sim/Não)
4. ✅ Notificações estão sendo enviadas? (Sim/Não/Aguardando tempo)
5. ✅ Há algum erro? (Sim/Não - se sim, qual?)

---

## 📞 PRÓXIMO PASSO

Depois de verificar os logs do Render:

### Se tudo OK mas sem carregamentos ativos:
✅ **AGUARDAR** próximo carregamento real e monitorar

### Se tudo OK e carregamentos sendo processados:
✅ **MONITORAR** até completar 3 minutos e ver notificação

### Se encontrar erros:
❌ **COPIAR** mensagem completa de erro e enviar

---

**Tempo estimado:** 5 minutos  
**Dificuldade:** Fácil  
**Importância:** 🔴 **CRÍTICA**

**Próximo documento:** Após verificar logs, consultar `RESUMO_SESSAO_COMPLETA.md` para próximas ações.

# 🚀 GUIA COMPLETO - DEPLOY NO RENDER

**Data:** 02/02/2026 02:20 AM  
**Branch:** `feature/4-eventos-notificacao`  
**Objetivo:** Fazer deploy da nova versão no Render

---

## 📋 CHECKLIST PRÉ-DEPLOY

- [x] Branch criada e sincronizada no GitHub
- [x] Validação Backend ↔ Frontend ↔ BD (100%)
- [x] Sistema testado localmente
- [x] Documentação completa criada
- [ ] Código dos eventos 2, 3, 4 implementado no PollingService.ts
- [ ] Migrations aplicadas no banco de dados Render
- [ ] Branch alterada no Render para `feature/4-eventos-notificacao`
- [ ] Redeploy manual executado

---

## 🗄️ PASSO 1: APLICAR MIGRATIONS NO BANCO RENDER

### **Acesso ao Banco de Dados:**

```
Host:     dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com
Database: vetric_db
User:     vetric_user
Password: 7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu
```

### **Como Acessar via Render Dashboard:**

1. Acesse: https://dashboard.render.com
2. Selecione o database: `vetric-db`
3. Clique em **"Shell"** ou **"Connect"**
4. Execute os SQLs abaixo

---

### **Migration 014: Limpar templates antigos**

```sql
-- Migration: 014_limpar_e_ajustar_templates
-- Objetivo: Remover templates antigos e inserir os 4 novos

-- 1. Adicionar colunas se não existirem
ALTER TABLE templates_notificacao
  ADD COLUMN IF NOT EXISTS tempo_minutos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS power_threshold_w INTEGER DEFAULT NULL;

-- 2. Remover templates antigos
DELETE FROM templates_notificacao
WHERE tipo IN ('inicio', 'fim', 'erro', 'ocioso', 'disponivel');

-- 3. Inserir os 4 novos templates
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES 
  ('inicio_recarga', '🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!', 3, NULL, true),
  
  ('inicio_ociosidade', '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} entrou em OCIOSIDADE.

⚡ Consumo até agora: {{energia}} kWh
🕐 {{data}}

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏', 0, 10, false),
  
  ('bateria_cheia', '🔋 Olá {{nome}}!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏', 3, 10, false),
  
  ('interrupcao', '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} foi INTERROMPIDO.

⚡ Consumo parcial: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999', 0, NULL, false)
ON CONFLICT (tipo) DO UPDATE SET
  mensagem = EXCLUDED.mensagem,
  tempo_minutos = EXCLUDED.tempo_minutos,
  power_threshold_w = EXCLUDED.power_threshold_w,
  ativo = EXCLUDED.ativo,
  atualizado_em = NOW();

-- 4. Verificar
SELECT tipo, tempo_minutos, power_threshold_w, ativo FROM templates_notificacao ORDER BY tipo;
```

---

### **Migration 015: Adicionar campos de rastreamento**

```sql
-- Migration: 015_adicionar_campos_rastreamento_carregamentos
-- Objetivo: Adicionar campos para rastreamento de eventos

-- 1. Adicionar colunas na tabela carregamentos
ALTER TABLE carregamentos
  ADD COLUMN IF NOT EXISTS ultimo_power_w INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contador_minutos_ocioso INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primeiro_ocioso_em TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS power_zerou_em TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS interrupcao_detectada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tipo_finalizacao VARCHAR(50) DEFAULT NULL;

-- 2. Criar índice para otimização
CREATE INDEX IF NOT EXISTS idx_carregamentos_power_tracking
  ON carregamentos(ultimo_power_w, primeiro_ocioso_em)
  WHERE fim IS NULL;

-- 3. Verificar
\d carregamentos
```

---

## 🔀 PASSO 2: MUDAR BRANCH NO RENDER

### **Para o Backend:**

1. Acesse: https://dashboard.render.com
2. Selecione o serviço: **`vetric-dashboard-backend`** (ou nome do seu backend)
3. Clique em **"Settings"**
4. Na seção **"Build & Deploy"**, encontre **"Branch"**
5. Mude de `main` para **`feature/4-eventos-notificacao`**
6. Clique em **"Save Changes"**

### **Para o Frontend:**

1. Acesse: https://dashboard.render.com
2. Selecione o serviço: **`vetric-dashboard-frontend`** (ou nome do seu frontend)
3. Clique em **"Settings"**
4. Na seção **"Build & Deploy"**, encontre **"Branch"**
5. Mude de `main` para **`feature/4-eventos-notificacao`**
6. Clique em **"Save Changes"**

---

## 🚀 PASSO 3: FAZER REDEPLOY MANUAL

### **Backend:**

1. No dashboard do backend, clique em **"Manual Deploy"**
2. Selecione **"Clear build cache & deploy"**
3. Aguarde o deploy completar (~5-10 minutos)
4. Verifique os logs em **"Logs"**

### **Frontend:**

1. No dashboard do frontend, clique em **"Manual Deploy"**
2. Selecione **"Clear build cache & deploy"**
3. Aguarde o deploy completar (~5-10 minutos)
4. Verifique os logs em **"Logs"**

---

## ✅ PASSO 4: VALIDAR EM PRODUÇÃO

### **1. Verificar Backend:**

```bash
curl https://seu-backend.onrender.com/health
```

**Esperado:**
```json
{
  "status": "ok",
  "websocket": false,
  "polling": {
    "isRunning": true,
    "pollingInterval": 10000
  }
}
```

### **2. Verificar Templates no Banco:**

```sql
SELECT tipo, tempo_minutos, power_threshold_w, ativo 
FROM templates_notificacao 
ORDER BY tipo;
```

**Esperado:** 4 templates (inicio_recarga, inicio_ociosidade, bateria_cheia, interrupcao)

### **3. Testar Frontend:**

- Acessar: https://seu-frontend.onrender.com
- Login: admin@vetric.com / admin123
- Ir em **Configurações**
- Verificar se os **4 cards** estão visíveis
- Verificar indicador de branch na sidebar (deve mostrar `feature/4-eventos-notificacao`)

---

## 📊 LOGS IMPORTANTES

### **O que verificar nos logs do Backend:**

```
✅ Conectado ao banco de dados PostgreSQL
✅ Templates de notificação inseridos (4 eventos principais)
✅ Polling iniciado com sucesso!
✅ Polling ativo - identificação automática de moradores habilitada!
```

### **Erros Comuns:**

1. **"Templates de notificação inseridos (5 tipos)"** ❌
   - Significa que está usando código antigo
   - Verificar se a branch foi alterada corretamente

2. **"Column does not exist: ultimo_power_w"** ❌
   - Significa que a migration 015 não foi aplicada
   - Aplicar manualmente via Shell do Render

3. **"Cannot find module processarEventosCarregamento"** ❌
   - Código dos eventos 2, 3, 4 não foi implementado
   - Implementar conforme IMPLEMENTACAO_EVENTOS_234.md

---

## 🔄 ROLLBACK (SE NECESSÁRIO)

Se algo der errado:

### **1. Voltar para branch main:**
- Settings → Branch → `main`
- Manual Deploy → Clear cache & deploy

### **2. Reverter migrations:**
```sql
-- Remover colunas adicionadas
ALTER TABLE carregamentos
  DROP COLUMN IF EXISTS ultimo_power_w,
  DROP COLUMN IF EXISTS contador_minutos_ocioso,
  DROP COLUMN IF EXISTS primeiro_ocioso_em,
  DROP COLUMN IF EXISTS power_zerou_em,
  DROP COLUMN IF EXISTS interrupcao_detectada,
  DROP COLUMN IF EXISTS notificacao_ociosidade_enviada,
  DROP COLUMN IF EXISTS notificacao_bateria_cheia_enviada,
  DROP COLUMN IF EXISTS tipo_finalizacao;

-- Reverter templates (se necessário)
DELETE FROM templates_notificacao;
-- Inserir templates antigos manualmente
```

---

## 📝 OBSERVAÇÕES IMPORTANTES

### **Downtime:**
- ⚠️ Haverá ~5-10 minutos de downtime durante o deploy
- O banco de dados **não** terá downtime (migrations são aplicadas manualmente)

### **Migrations:**
- ✅ Migrations são **idempotentes** (podem ser executadas múltiplas vezes)
- ✅ Usam `IF NOT EXISTS` e `ON CONFLICT` para segurança

### **Branch:**
- ✅ A branch `feature/4-eventos-notificacao` está sincronizada no GitHub
- ✅ Pode ser mesclada para `main` após validação
- ✅ Pode criar Pull Request no GitHub para revisão

---

## 🎯 RESUMO RÁPIDO

```bash
# 1. Aplicar migrations no banco via Shell do Render
# 2. Mudar branch: Settings → Branch → feature/4-eventos-notificacao
# 3. Deploy: Manual Deploy → Clear cache & deploy
# 4. Validar: /health, /api/templates, frontend
# 5. Monitorar logs por 30 minutos
```

---

## ✅ CHECKLIST PÓS-DEPLOY

- [ ] Health check retorna OK
- [ ] Templates no banco: 4 eventos
- [ ] Campos de rastreamento existem em `carregamentos`
- [ ] Frontend exibe 4 cards
- [ ] Indicador de branch visível
- [ ] Polling ativo nos logs
- [ ] Sem erros críticos nos logs
- [ ] Notificação de "Carregamento Iniciado" funciona
- [ ] Testar por 30 minutos em produção

---

**Criado em:** 02/02/2026 02:20 AM  
**Por:** Sistema de Deploy Automatizado

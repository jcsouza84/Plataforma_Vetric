# 🚨 GUIA RÁPIDO DE CORREÇÃO - NOTIFICAÇÕES

**Tempo estimado:** 15-20 minutos  
**Prioridade:** 🔴 CRÍTICA

---

## 🎯 O QUE ESTÁ QUEBRADO?

```
✅ Evento 1 (Início): Funciona nos chargers 2 e 3
❌ Evento 1 (Início): NÃO funciona nos chargers 4, 5, 6 (novos)
❌ Evento 2 (Ociosidade): NÃO funciona em NENHUM charger
❌ Evento 3 (Bateria Cheia): NÃO funciona em NENHUM charger
❌ Evento 4 (Interrupção): NÃO funciona em NENHUM charger
```

---

## 🔍 DIAGNÓSTICO EM 3 PASSOS (5 MIN)

### PASSO 1: Conectar ao Banco (2 min)

```bash
# Use a INTERNAL DATABASE URL do Render
psql postgresql://vetric_user:SENHA@dpg-XXXXX.render.com/vetric_db
```

### PASSO 2: Executar Diagnóstico (2 min)

```bash
# Copie e cole no terminal do psql:
\i diagnostico-completo-notificacoes.sql
```

### PASSO 3: Analisar Resultados (1 min)

**O que você vai ver:**

#### ✅ SE ESTIVER TUDO OK:

```
📋 VERIFICAÇÃO 1: TEMPLATES
inicio_recarga      | ✅
inicio_ociosidade   | ✅
bateria_cheia       | ✅
interrupcao         | ✅

👤 VERIFICAÇÃO 2: CLAUDEVANIA
nome        | ✅ Tag cadastrada | ✅ Telefone OK | ✅ Notif. Ativas

📱 VERIFICAÇÃO 5: ÚLTIMAS NOTIFICAÇÕES
(Mostra notificações enviadas HOJE)
```

#### ❌ SE TIVER PROBLEMA:

```
📋 VERIFICAÇÃO 1: TEMPLATES
(0 rows) ← ❌ TEMPLATES NÃO EXISTEM!

OU

inicio_recarga      | ❌  ← TEMPLATE INATIVO!

👤 VERIFICAÇÃO 2: CLAUDEVANIA
nome        | ❌ SEM TAG  ← PROBLEMA DE MAPEAMENTO!

📱 VERIFICAÇÃO 5: ÚLTIMAS NOTIFICAÇÕES
(0 rows) ← ❌ NENHUMA NOTIFICAÇÃO FOI ENVIADA!
```

---

## 🔧 CORREÇÕES RÁPIDAS

### CORREÇÃO A: Templates Não Existem (5 min)

```sql
-- Copie e cole no psql:

INSERT INTO templates_notificacao (tipo, mensagem, ativo, tempo_minutos, power_threshold_w) VALUES
('inicio_recarga', 
'🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!', 
true, 3, NULL),

('inicio_ociosidade', 
'⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} entrou em OCIOSIDADE.

⚡ Consumo até agora: {{energia}}
🕐 {{data}}

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏', 
true, 0, 10),

('bateria_cheia', 
'🔋 Olá {{nome}}!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: {{energia}}
⏱️ Duração: {{duracao}}
📍 {{charger}}

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏', 
true, 3, 10),

('interrupcao', 
'⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} foi INTERROMPIDO.

⚡ Consumo parcial: {{energia}}
⏱️ Duração: {{duracao}}
📍 {{charger}}

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999', 
true, 0, NULL);

-- Verificar se inseriu:
SELECT tipo, ativo FROM templates_notificacao;
```

---

### CORREÇÃO B: Claudevania Sem Tag (3 min)

**Se o diagnóstico mostrou:**
```
👤 CLAUDEVANIA | ❌ SEM TAG
```

**Então:**

#### Opção 1: Encontrar idTag nos Logs do Render

```bash
# Acesse: https://dashboard.render.com/web/[SEU-SERVICE]/logs
# Procure por: "Claudevania" ou "440159" (ID do carregamento)
# Copie o valor de "ocppIdTag" ou "ocppTagPk"
```

#### Opção 2: Adicionar Mapeamento Manual

```sql
-- 1. Buscar ID da Claudevania
SELECT id FROM moradores WHERE nome ILIKE '%claudevania%';
-- Resultado: 24 (exemplo)

-- 2. Adicionar mapeamento (use ocppTagPk dos logs)
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (9876543, 24, 'Gran Marine 6 - Adicionado em 02/02/2026');

-- 3. Verificar
SELECT * FROM tag_pk_mapping;
```

---

### CORREÇÃO C: PollingService Parado (2 min)

**Sintomas:**
- Diagnóstico SQL mostra templates OK
- Claudevania tem tag cadastrada
- MAS: Nenhuma notificação foi enviada

**Solução:**

#### Via Dashboard Render:

1. Acesse: https://dashboard.render.com
2. Clique em `vetric-backend`
3. Clique em **Manual Deploy** > **Deploy latest commit**
4. Aguarde ~2 minutos
5. Verifique logs: Procure por `✅ PollingService iniciado`

#### Via Render CLI:

```bash
render services restart vetric-backend
```

---

## 📊 VERIFICAÇÃO FINAL (2 MIN)

Após fazer as correções, execute novamente:

```bash
psql PRODUCTION_DATABASE_URL
\i diagnostico-completo-notificacoes.sql
```

**Resultado esperado:**

```
✅ 4 templates ativos
✅ Claudevania identificada
✅ Carregamento 440159 com morador_id preenchido
✅ Últimas notificações mostram envios HOJE
```

---

## 🎯 TESTE PRÁTICO (10 MIN)

### Cenário: Claudevania está carregando AGORA

1. **Aguarde 3 minutos** após início do carregamento
2. **Ela DEVE receber** mensagem de Evento 1 (Início)
3. **Quando bateria chegar a 100%** (power < 10W)
4. **Ela DEVE receber** mensagem de Evento 2 (Ociosidade)
5. **Após 3 minutos em ociosidade**
6. **Ela DEVE receber** mensagem de Evento 3 (Bateria Cheia)

### Monitorar no Render:

```
Logs > Search: "Claudevania" ou "440159" ou "[Evento"

Deve aparecer:
📱 [Evento 1] Notificação de início enviada para Claudevania...
⚠️  [Evento 2] Ociosidade detectada! Gran Marine 6 - Power: 5W < 10W
📱 [Evento 2] Notificação de ociosidade enviada para Claudevania...
🔋 [Evento 3] Bateria cheia detectada! Gran Marine 6 - 3 min ocioso
📱 [Evento 3] Notificação de bateria cheia enviada para Claudevania...
```

---

## 🆘 SE NADA FUNCIONAR

### Última Tentativa: Deploy Completo

```bash
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE
git add .
git commit -m "fix: corrigir notificações - adicionar templates e mapeamentos"
git push origin main
```

Aguarde 3-5 minutos para deploy automático no Render.

---

## 📞 SUPORTE

**Documentos de referência:**

1. `ANALISE_PROBLEMAS_NOTIFICACOES_02FEV2026.md` - Análise completa
2. `notificacao.md` - Documentação técnica do sistema
3. `diagnostico-completo-notificacoes.sql` - Queries de diagnóstico

**Logs importantes:**

- Backend Render: https://dashboard.render.com/web/[SERVICE]/logs
- Banco de dados: `SELECT * FROM logs_notificacoes ORDER BY criado_em DESC LIMIT 20;`

---

**Criado em:** 02/02/2026  
**Tempo total estimado:** 15-20 minutos  
**Prioridade:** 🔴 CRÍTICA

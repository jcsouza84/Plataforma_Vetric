# 🚨 ANÁLISE CRÍTICA: PROBLEMAS COM NOTIFICAÇÕES - 02/02/2026

**Data:** 02/02/2026  
**Status:** 🔴 **CRÍTICO - SISTEMA PARCIALMENTE QUEBRADO**

---

## 📋 PROBLEMAS IDENTIFICADOS

### ❌ PROBLEMA 1: Carregadores Novos (4, 5, 6) Não Identificam Moradores

**Sintoma:**
- Gran Marine 2 e 3: ✅ Enviam notificação de início
- Gran Marine 4, 5 e 6: ❌ NÃO enviam notificação de início

**Causa Raiz:**
Os **IdTags/ocppTagPk** dos carregadores novos **NÃO estão mapeados** na tabela `moradores` ou `tag_pk_mapping`.

**Evidência na Tabela:**
| Recarga ID | Carregador | Usuário | Status | Observação |
|------------|------------|---------|--------|------------|
| 440159 | Gran Marine 6 | CLAUDEVANIA | ⚠️ Carregando SEM energia | **MORADOR NÃO IDENTIFICADO** |
| 440139 | Gran Marine 2 | Wemilson | ✅ Finalizado | Funcionou |
| 440094 | Gran Marine 5 | Raffaella | ✅ Finalizado | Funcionou |
| 440063 | Gran Marine 3 | Anne Karolline | ✅ 4h, 25kWh | Funcionou mas **SEM notificações 2,3,4** |

**Conclusão:**
- Carregadores 2 e 3 têm mapeamento correto
- Carregadores 5 e 6 identificam ALGUNS usuários mas não TODOS
- Claudevania está carregando AGORA no Gran Marine 6 mas **não foi identificada**

---

### ❌ PROBLEMA 2: Eventos 2, 3 e 4 NÃO Funcionam

**Sintoma:**
Mesmo com código implementado e templates ativos, **NENHUMA** notificação dos eventos 2, 3 e 4 foi enviada.

**Evidência:**
- **ID 440063** (Anne Karolline): Carregou por **4 HORAS** (17:18 - 21:19) consumindo **25.4 kWh**
  - ❌ NÃO recebeu notificação de ociosidade
  - ❌ NÃO recebeu notificação de bateria cheia  
  - ❌ NÃO recebeu notificação de interrupção

**Possíveis Causas:**

#### Causa 2.1: PollingService Não Está Rodando
```typescript
// O código ESTÁ implementado:
await this.processarEventosCarregamento(); // Linha 92
```

**Verificação necessária:**
```bash
# Ver logs do Render para confirmar se polling está rodando
render logs --tail --service vetric-backend
```

Procurar por:
- `🔍 [Eventos] Processando X carregamento(s) ativo(s)...`
- `⚠️  [Evento 2] Ociosidade detectada!`
- `🔋 [Evento 3] Bateria cheia detectada!`
- `⚠️  [Evento 4] Interrupção detectada!`

#### Causa 2.2: Templates Inativos no Banco
```sql
SELECT tipo, ativo FROM templates_notificacao;
```

Se retornar `ativo = false`, os eventos não disparam.

#### Causa 2.3: Power Sempre Zero ou Sempre Alto
O CVE pode não estar retornando valores de `power_w` corretos:

```typescript
const currentPower = connector.power || connector.lastStatus?.power || 0;
```

Se `power` sempre = 0 → Evento 2 dispara sempre  
Se `power` sempre > 10W → Evento 2 nunca dispara

#### Causa 2.4: Flags de Controle Travadas
```sql
SELECT 
  id,
  notificacao_ociosidade_enviada,
  notificacao_bateria_cheia_enviada,
  interrupcao_detectada,
  primeiro_ocioso_em,
  ultimo_power_w
FROM carregamentos
WHERE id IN (440063, 440139, 440094);
```

Se flags = `true` antes da hora, eventos não disparam novamente.

---

### ❌ PROBLEMA 3: Sistema Não Identifica Moradores em Tempo Real

**Sintoma:**
Claudevania está carregando **AGORA** no Gran Marine 6, mas sistema não detectou.

**Possíveis Causas:**

#### Causa 3.1: IdTag/ocppTagPk Não Mapeado
```sql
-- Verificar se Claudevania tem tag_rfid cadastrada
SELECT id, nome, tag_rfid, telefone, notificacoes_ativas 
FROM moradores 
WHERE nome ILIKE '%claudevania%';
```

#### Causa 3.2: Transação Não Retornada pela API CVE
```bash
# Testar endpoint de transações ativas
curl -X GET "https://api.cve.com.br/transactions?active=true" \
  -H "Authorization: Bearer SEU_TOKEN"
```

Verificar se ID 440159 aparece com `stopTimestamp = null`.

#### Causa 3.3: PollingService Travou ou Parou
O serviço pode ter dado erro e parado de fazer polling:

```typescript
// Ver no Render se há erros recentes
❌ [Polling] Erro ao buscar transações: <erro>
```

---

## 🔍 ANÁLISE DETALHADA DA TABELA

### Carregamentos Finalizados (Teste para Eventos):

**ID 440063** - Anne Karolline (Gran Marine 3):
- ✅ Duração: **4h 1min** (17:18 - 21:19)
- ✅ Energia: **25.41 kWh** (carga LONGA, provavelmente bateria grande)
- ❌ **PROBLEMA:** Deveria ter recebido:
  - Evento 1: Início (após 3 min) ✅ *Provavelmente enviado*
  - Evento 2: Ociosidade (quando power < 10W) ❌ **NÃO ENVIADO**
  - Evento 3: Bateria cheia (após 3 min ocioso) ❌ **NÃO ENVIADO**
  - Evento 4: Interrupção (ao desconectar) ❌ **NÃO ENVIADO**

**ID 440139** - Wemilson Silva (Gran Marine 2):
- ✅ Duração: **1h 39min** (19:51 - 21:30)
- ✅ Energia: **6.77 kWh**
- ❌ **PROBLEMA:** Mesma situação - falta eventos 2, 3, 4

---

### Carregamentos "Vetric" (Testes do Sistema):

**IDs 440057, 440058, 440059, 440060, 440061:**
- ⚠️ Usuário: "Vetric" (sistema de teste?)
- ⚠️ Energia: 0 - 1.15 kWh (testes curtos)
- ⚠️ Duração: < 3 minutos

**Conclusão:** Testes do sistema não devem receber notificações.

---

## 🎯 CAUSAS PROVÁVEIS (Por Ordem de Probabilidade)

### 1️⃣ **MAIS PROVÁVEL:** PollingService Parou ou Está com Erro

**Evidência:**
- Código está implementado corretamente ✅
- Templates existem no código ✅  
- MAS nenhuma notificação foi enviada ❌

**Solução:**
```bash
# 1. Ver logs do backend no Render
render logs --tail --service vetric-backend

# 2. Verificar se aparece:
📊 [Polling] X transação(ões) ativa(s) no CVE
🔍 [Polling] Verificando status de todos os carregadores...
🔍 [Eventos] Processando X carregamento(s) ativo(s) para eventos 2, 3, 4...

# 3. Se NÃO aparecer, polling está parado
```

---

### 2️⃣ **PROVÁVEL:** Templates Inativos ou Não Existem no Banco

**Evidência:**
- `templates_notificacao` pode não ter sido criada ou populada

**Solução:**
```sql
-- Verificar templates
SELECT * FROM templates_notificacao;

-- Se vazio, inserir templates padrão
INSERT INTO templates_notificacao (tipo, mensagem, ativo, tempo_minutos, power_threshold_w) VALUES
('inicio_recarga', '🔋 Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n🕐 Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!', true, 3, NULL),
('inicio_ociosidade', '⚠️ Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{energia}}\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\n\nObrigado pela compreensão! 🙏', true, 0, 10),
('bateria_cheia', '🔋 Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{energia}}\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nPor favor, remova o cabo para liberar o carregador.\n\nObrigado por utilizar nosso sistema! 🙏', true, 3, 10),
('interrupcao', '⚠️ Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{energia}}\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\n\nTelefone: (82) 3333-4444\nWhatsApp: (82) 99999-9999', true, 0, NULL);
```

---

### 3️⃣ **POSSÍVEL:** Mapeamento de Tags Incompleto

**Evidência:**
- Claudevania não foi identificada no Gran Marine 6
- Alguns moradores funcionam, outros não

**Solução:**
```sql
-- 1. Verificar Claudevania
SELECT id, nome, tag_rfid, telefone, notificacoes_ativas 
FROM moradores 
WHERE nome ILIKE '%claudevania%';

-- 2. Verificar mapeamento manual
SELECT * FROM tag_pk_mapping;

-- 3. Ver logs do backend para identificar ocppTagPk
-- Procurar por:
⚠️  [Polling] ocppTagPk XXXXX não mapeado
📝 Nome no CVE: CLAUDEVANIA PEREIRA MARTINS

-- 4. Adicionar mapeamento
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (XXXXX, ID_DA_CLAUDEVANIA, 'Mapeado manualmente - Gran Marine 6');
```

---

## ✅ PLANO DE AÇÃO IMEDIATO

### PASSO 1: Verificar se PollingService Está Rodando ⏱️ 2 min

```bash
# Ver logs em tempo real do backend
render logs --tail --service vetric-backend
```

**Procurar por:**
- ✅ `📊 [Polling] X transação(ões) ativa(s) no CVE` (a cada 10 seg)
- ✅ `🔍 [Eventos] Processando X carregamento(s) ativo(s)...` (a cada 10 seg)

**Se NÃO aparecer:**
```bash
# Reiniciar serviço no Render
render restart --service vetric-backend
```

---

### PASSO 2: Verificar Templates no Banco ⏱️ 3 min

```bash
# Conectar ao banco Render
psql postgresql://vetric_user:SENHA@HOST/vetric_db

# Verificar templates
SELECT tipo, ativo, tempo_minutos, power_threshold_w FROM templates_notificacao;
```

**Resultado esperado:**
| tipo | ativo | tempo_minutos | power_threshold_w |
|------|-------|---------------|-------------------|
| inicio_recarga | true | 3 | NULL |
| inicio_ociosidade | true | 0 | 10 |
| bateria_cheia | true | 3 | 10 |
| interrupcao | true | 0 | NULL |

**Se vazio ou incorreto:**
- Executar SQL de inserção acima

---

### PASSO 3: Identificar Claudevania ⏱️ 5 min

```bash
# Ver logs do backend AGORA (Claudevania está carregando)
render logs --tail --service vetric-backend | grep -A 5 "440159\|Claudevania\|Gran Marine 6"
```

**Procurar por:**
```
🔍 [Polling] Nova transação detectada: 440159
   🔌 Carregador: Gran Marine 6
   🎯 ocppIdTag: XXXXX
   👤 Usuário CVE: CLAUDEVANIA PEREIRA MARTINS
```

**Copiar o `ocppIdTag` ou `ocppTagPk` e:**

```sql
-- 1. Buscar Claudevania no banco
SELECT id, nome, tag_rfid FROM moradores WHERE nome ILIKE '%claudevania%';

-- 2. Atualizar tag_rfid
UPDATE moradores 
SET tag_rfid = 'VALOR_DO_OCPPIDTAG'
WHERE id = ID_CLAUDEVANIA;

-- OU adicionar mapeamento manual
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (VALOR_DO_OCPPTAGPK, ID_CLAUDEVANIA, 'Gran Marine 6');
```

---

### PASSO 4: Testar Evento 2 em Produção ⏱️ 10 min

**Cenário:**
- Claudevania está carregando agora
- Quando bateria chegar perto de 100%, power vai cair < 10W
- Sistema DEVE enviar Evento 2 automaticamente

**Monitoramento:**
```bash
# Ficar observando logs
render logs --tail --service vetric-backend | grep -i "evento\|ociosidade\|bateria"
```

**Esperar por:**
```
⚠️  [Evento 2] Ociosidade detectada! Gran Marine 6 - Power: 5W < 10W
📱 [Evento 2] Notificação de ociosidade enviada para CLAUDEVANIA...
```

**Se NÃO aparecer após 5 min com power < 10W:**
- PollingService está parado
- Templates inativos
- Morador não tem `notificacoes_ativas = true`

---

## 📊 QUERIES DE DIAGNÓSTICO

### Query 1: Ver Status de TODOS os Carregamentos Ativos

```sql
SELECT 
  c.id,
  c.charger_name,
  m.nome AS morador,
  m.telefone,
  m.notificacoes_ativas,
  c.inicio,
  EXTRACT(EPOCH FROM (NOW() - c.inicio)) / 60 AS minutos_ativo,
  c.notificacao_inicio_enviada AS evt1,
  c.notificacao_ociosidade_enviada AS evt2,
  c.notificacao_bateria_cheia_enviada AS evt3,
  c.interrupcao_detectada AS evt4,
  c.ultimo_power_w,
  c.primeiro_ocioso_em
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.fim IS NULL
ORDER BY c.inicio DESC;
```

---

### Query 2: Ver Últimas 20 Notificações Enviadas

```sql
SELECT 
  ln.criado_em,
  m.nome,
  ln.tipo,
  ln.status,
  ln.erro
FROM logs_notificacoes ln
JOIN moradores m ON ln.morador_id = m.id
ORDER BY ln.criado_em DESC
LIMIT 20;
```

---

### Query 3: Ver Moradores Sem Tag RFID

```sql
SELECT 
  id,
  nome,
  apartamento,
  telefone,
  tag_rfid,
  notificacoes_ativas
FROM moradores
WHERE tag_rfid IS NULL OR tag_rfid = ''
ORDER BY nome;
```

---

## 🎯 AVALIAÇÃO DO DOCUMENTO `notificacao.md`

### ✅ PONTOS FORTES:

1. **Documentação clara e completa** dos 4 eventos
2. **Estrutura do banco bem definida** com campos e flags
3. **Templates padrão bem escritos** com placeholders corretos
4. **8 falhas catalogadas** com diagnósticos
5. **Queries SQL úteis** para troubleshooting
6. **Fluxogramas de execução** fáceis de seguir

### ⚠️ PONTOS QUE PRECISAM SER ATUALIZADOS:

#### 1. **Linha 421** - Condição do Evento 2 está incorreta na documentação

**Documentado:**
```typescript
currentPower < threshold && ultimoPower >= threshold
```

**Implementado (PollingService.ts linha 421):**
```typescript
if (currentPower < threshold && ultimoPower >= threshold && !carregamento.notificacao_ociosidade_enviada)
```

✅ Implementação está correta, mas doc deveria mencionar a flag de controle.

---

#### 2. **Falta Documentar Causa: "PollingService Parado"**

Adicionar em **FALHA F09**:

```markdown
### FALHA F09: PollingService não está rodando

**Sintoma:**
- Nenhum evento é detectado
- Logs não mostram mensagens [Polling] ou [Eventos]
- Sistema parece "congelado"

**Causa:**
- Erro não tratado travou o polling
- Serviço foi reiniciado e não subiu corretamente
- Variável de ambiente incorreta impediu inicialização

**Verificação:**
```bash
render logs --tail --service vetric-backend | grep "\[Polling\]"
```

**Solução:**
```bash
# Reiniciar serviço
render restart --service vetric-backend

# Verificar se subiu corretamente
render logs --tail | grep "✅ PollingService iniciado"
```
```

---

#### 3. **Adicionar Seção: "Como Adicionar Novo Morador"**

```markdown
## 🆕 ADICIONAR NOVO MORADOR

### Método 1: Com ocppIdTag conhecido

```sql
INSERT INTO moradores (nome, apartamento, telefone, tag_rfid, notificacoes_ativas)
VALUES (
  'Nome do Morador',
  '101',
  '+5582999999999',
  'VALOR_DO_OCPPIDTAG',
  true
);
```

### Método 2: Com ocppTagPk (fallback)

```sql
-- 1. Identificar ocppTagPk nos logs
⚠️  [Polling] ocppTagPk 4266890 não mapeado
📝 Nome no CVE: CLAUDEVANIA PEREIRA MARTINS

-- 2. Buscar morador no banco
SELECT id FROM moradores WHERE nome = 'CLAUDEVANIA PEREIRA MARTINS';

-- 3. Adicionar mapeamento
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (4266890, 24, 'Mapeado manualmente');
```
```

---

## 📝 RESUMO EXECUTIVO

### 🔴 SITUAÇÃO ATUAL:

- **Evento 1 (Início):** ✅ Funcionando PARCIALMENTE (só chargers 2, 3)
- **Evento 2 (Ociosidade):** ❌ NÃO funcionando
- **Evento 3 (Bateria Cheia):** ❌ NÃO funcionando
- **Evento 4 (Interrupção):** ❌ NÃO funcionando
- **Identificação de Moradores:** ⚠️ Funcionando PARCIALMENTE

### 🎯 HIPÓTESE PRINCIPAL:

**PollingService não está executando `processarEventosCarregamento()`** ou está com erro silencioso.

### ⏱️ TEMPO ESTIMADO DE RESOLUÇÃO:

- **Diagnóstico:** 15 minutos
- **Correção:** 30 minutos
- **Teste:** 20 minutos
- **TOTAL:** ~1 hora

---

**Documento criado por:** Cursor AI  
**Data:** 02/02/2026  
**Próxima ação:** Executar PASSO 1 - Verificar logs do Render

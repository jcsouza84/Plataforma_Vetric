# 📱 SISTEMA DE NOTIFICAÇÕES - DOCUMENTAÇÃO TÉCNICA

**Última atualização:** 02/02/2026

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Eventos de Notificação](#eventos-de-notificação)
3. [Condições e Regras](#condições-e-regras)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Fluxo de Execução](#fluxo-de-execução)
6. [Variáveis e Placeholders](#variáveis-e-placeholders)
7. [Possíveis Falhas](#possíveis-falhas)
8. [Troubleshooting](#troubleshooting)
9. [Logs e Monitoramento](#logs-e-monitoramento)

---

## 📊 VISÃO GERAL

O sistema detecta 4 eventos durante o ciclo de vida de um carregamento de veículo elétrico e envia notificações automáticas via WhatsApp.

### Serviços Envolvidos:

1. **PollingService** - Detecta eventos a cada 10 segundos
2. **NotificationService** - Envia mensagens via Evolution API
3. **CVE API** - Fornece dados de chargers e transações
4. **Evolution API** - Envia mensagens WhatsApp

### Frequência de Verificação:

- **Polling Principal:** A cada 10 segundos
- **Eventos 2, 3, 4:** Processados no mesmo ciclo do polling

---

## 🎯 EVENTOS DE NOTIFICAÇÃO

### EVENTO 1: INÍCIO DE RECARGA

**Tipo no banco:** `inicio_recarga`

**Quando é disparado:**
- Nova transação detectada no CVE (StartTransaction)
- OU carregamento existente sem notificação enviada

**Condições obrigatórias:**
```typescript
morador_id != NULL
morador.notificacoes_ativas == true
morador.telefone != NULL
notificacao_inicio_enviada == false
```

**Tempo de espera:** 3 minutos após início do carregamento

**Threshold de power:** Não aplicável

**Ação no banco:**
```sql
UPDATE carregamentos 
SET notificacao_inicio_enviada = true 
WHERE id = ?
```

**Template padrão:**
```
🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!
```

**Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{localizacao}}` - Endereço do carregador
- `{{data}}` - Data/hora de início
- `{{apartamento}}` - Número do apartamento

---

### EVENTO 2: INÍCIO DE OCIOSIDADE

**Tipo no banco:** `inicio_ociosidade`

**Quando é disparado:**
- Potência atual cai abaixo do threshold
- Potência anterior estava acima do threshold

**Condições obrigatórias:**
```typescript
currentPower < power_threshold_w (10W)
ultimo_power_w >= power_threshold_w (10W)
notificacao_ociosidade_enviada == false
morador_id != NULL
morador.notificacoes_ativas == true
```

**Tempo de espera:** IMEDIATO (0 minutos)

**Threshold de power:** 10W (configurável)

**Ação no banco:**
```sql
UPDATE carregamentos 
SET 
  primeiro_ocioso_em = NOW(),
  notificacao_ociosidade_enviada = true,
  ultimo_power_w = ?
WHERE id = ?
```

**Template padrão:**
```
⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} entrou em OCIOSIDADE.

⚡ Consumo até agora: {{energia}} kWh
🕐 {{data}}

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏
```

**Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia consumida até o momento (kWh)
- `{{data}}` - Data/hora do evento

**Lógica especial:**
- Se power voltar a subir (>= 10W), reseta `primeiro_ocioso_em`
- Não envia nova notificação se `notificacao_ociosidade_enviada == true`

---

### EVENTO 3: BATERIA CHEIA

**Tipo no banco:** `bateria_cheia`

**Quando é disparado:**
- Carregamento em ociosidade há pelo menos X minutos
- Potência continua abaixo do threshold

**Condições obrigatórias:**
```typescript
primeiro_ocioso_em != NULL
(NOW() - primeiro_ocioso_em) >= tempo_minutos (3 min)
currentPower < power_threshold_w (10W)
notificacao_bateria_cheia_enviada == false
morador_id != NULL
morador.notificacoes_ativas == true
```

**Tempo de espera:** 3 minutos após `primeiro_ocioso_em`

**Threshold de power:** 10W (configurável)

**Ação no banco:**
```sql
UPDATE carregamentos 
SET 
  notificacao_bateria_cheia_enviada = true,
  tipo_finalizacao = 'bateria_cheia',
  ultimo_power_w = ?
WHERE id = ?
```

**Template padrão:**
```
🔋 Olá {{nome}}!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏
```

**Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia total consumida (kWh)
- `{{duracao}}` - Tempo total de carregamento (formato: Xh Ymin)

**Lógica especial:**
- Só dispara se Evento 2 já foi detectado (`primeiro_ocioso_em` existe)
- Conta tempo a partir de `primeiro_ocioso_em`, não do início do carregamento

---

### EVENTO 4: INTERRUPÇÃO

**Tipo no banco:** `interrupcao`

**Quando é disparado:**
- Status do connector muda para 'Available'
- Carregamento ainda ativo no banco (fim == NULL)
- Interrupção não foi previamente detectada

**Condições obrigatórias:**
```typescript
connector.lastStatus.status == 'Available'
carregamento.fim == NULL
interrupcao_detectada == false
morador_id != NULL
morador.notificacoes_ativas == true
```

**Tempo de espera:** IMEDIATO (0 minutos)

**Threshold de power:** Não aplicável

**Ação no banco:**
```sql
UPDATE carregamentos 
SET 
  interrupcao_detectada = true,
  tipo_finalizacao = 'interrupcao',
  fim = NOW()
WHERE id = ?
```

**Template padrão:**
```
⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} foi INTERROMPIDO.

⚡ Consumo parcial: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999
```

**Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia consumida até a interrupção (kWh)
- `{{duracao}}` - Tempo de carregamento até interrupção (formato: Xh Ymin)

**Lógica especial:**
- Finaliza automaticamente o carregamento no banco
- Marca `tipo_finalizacao = 'interrupcao'`

---

## ⚙️ CONDIÇÕES E REGRAS

### Prioridade de Execução:

1. **Evento 1** - Detectado no `processarTransacaoAtiva()`
2. **Evento 2** - Detectado no `processarEventosCarregamento()`
3. **Evento 3** - Detectado no `processarEventosCarregamento()`
4. **Evento 4** - Detectado no `processarEventosCarregamento()`

### Ordem de Verificação (por carregamento):

```
1. Buscar dados de power do CVE
2. Verificar Evento 2 (Ociosidade)
   ├─ Se detectado: enviar notificação
   └─ Se não: verificar se saiu da ociosidade
3. Verificar Evento 3 (Bateria Cheia)
   ├─ Só se primeiro_ocioso_em existe
   └─ Se detectado: enviar notificação
4. Verificar Evento 4 (Interrupção)
   ├─ Se detectado: enviar notificação e finalizar
5. Atualizar ultimo_power_w
```

### Regras de Negócio:

**RN01: Morador deve estar elegível**
```sql
SELECT * FROM moradores 
WHERE id = ? 
  AND telefone IS NOT NULL 
  AND notificacoes_ativas = true
```

**RN02: Template deve estar ativo**
```sql
SELECT * FROM templates_notificacao 
WHERE tipo = ? 
  AND ativo = true
```

**RN03: Notificação não pode ser duplicada**
- Cada evento só pode enviar notificação UMA VEZ por carregamento
- Flags de controle: `notificacao_*_enviada`

**RN04: Carregamento deve estar ativo**
- `fim` deve ser `NULL` para Eventos 2 e 3
- Evento 4 finaliza automaticamente o carregamento

**RN05: Thresholds são respeitados**
- Ociosidade: Power < 10W
- Bateria Cheia: Power < 10W por 3+ minutos

**RN06: Temporização é aplicada**
- Evento 1: Aguarda 3 minutos após `inicio`
- Evento 2: IMEDIATO
- Evento 3: Aguarda 3 minutos após `primeiro_ocioso_em`
- Evento 4: IMEDIATO

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `templates_notificacao`

```sql
CREATE TABLE templates_notificacao (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL, -- 'inicio_recarga', 'inicio_ociosidade', etc.
  mensagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  tempo_minutos INTEGER DEFAULT 0,
  power_threshold_w INTEGER DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Valores padrão:**
| tipo | ativo | tempo_minutos | power_threshold_w |
|------|-------|---------------|-------------------|
| inicio_recarga | true | 3 | NULL |
| inicio_ociosidade | true | 0 | 10 |
| bateria_cheia | true | 3 | 10 |
| interrupcao | true | 0 | NULL |

---

### Tabela: `carregamentos`

**Campos relacionados a notificações:**

```sql
-- Identificação
id INTEGER PRIMARY KEY
morador_id INTEGER -- FK para moradores
charger_uuid VARCHAR(255)
charger_name VARCHAR(255)

-- Controle de tempo
inicio TIMESTAMP
fim TIMESTAMP

-- Energia
energia_consumida_kwh DECIMAL

-- Tracking de power
ultimo_power_w INTEGER
primeiro_ocioso_em TIMESTAMP
power_zerou_em TIMESTAMP
contador_minutos_ocioso INTEGER

-- Flags de notificação
notificacao_inicio_enviada BOOLEAN DEFAULT false
notificacao_ociosidade_enviada BOOLEAN DEFAULT false
notificacao_bateria_cheia_enviada BOOLEAN DEFAULT false
interrupcao_detectada BOOLEAN DEFAULT false

-- Tipo de finalização
tipo_finalizacao VARCHAR(50) -- 'bateria_cheia', 'interrupcao', NULL
```

**Estados possíveis:**

| Estado | Descrição | Flags |
|--------|-----------|-------|
| Iniciando | Carregamento detectado mas sem notificação | `inicio != NULL`, `notificacao_inicio_enviada = false` |
| Carregando | Notificação de início enviada | `notificacao_inicio_enviada = true`, `fim = NULL` |
| Ocioso | Power caiu abaixo do threshold | `primeiro_ocioso_em != NULL`, `notificacao_ociosidade_enviada = true` |
| Bateria Cheia | Confirmado após tempo em ociosidade | `notificacao_bateria_cheia_enviada = true` |
| Interrompido | Status Available detectado | `interrupcao_detectada = true`, `fim != NULL` |

---

### Tabela: `moradores`

**Campos relevantes:**

```sql
id INTEGER PRIMARY KEY
nome VARCHAR(255)
telefone VARCHAR(20) -- Formato: +5582996176797
apartamento VARCHAR(50)
notificacoes_ativas BOOLEAN DEFAULT true
```

**Validação de telefone:**
- Deve começar com `+55` (Brasil)
- Formato completo: `+55XXYYYYYYYY`
- Exemplo: `+5582996176797`

---

### Tabela: `logs_notificacoes`

```sql
CREATE TABLE logs_notificacoes (
  id SERIAL PRIMARY KEY,
  morador_id INTEGER,
  tipo VARCHAR(50), -- Tipo da notificação
  status VARCHAR(50), -- 'enviado', 'erro', 'pendente'
  mensagem TEXT,
  erro TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Tabela: `configuracoes_sistema`

**Configurações da Evolution API:**

```sql
chave = 'evolution_api_url'
valor = 'https://evolution.example.com'

chave = 'evolution_api_key'
valor = 'sua-api-key'

chave = 'evolution_instance'
valor = 'nome-da-instancia'
```

---

## 🔄 FLUXO DE EXECUÇÃO

### Ciclo Principal (a cada 10 segundos):

```
┌─────────────────────────────────────┐
│   PollingService.poll()             │
├─────────────────────────────────────┤
│                                     │
│ 1. Buscar transações ativas CVE    │
│    └─ processarTransacao()         │
│       └─ processarTransacaoAtiva() │
│          └─ EVENTO 1 detectado     │
│                                     │
│ 2. Verificar status dos chargers   │
│    └─ verificarStatusCarregadores()│
│                                     │
│ 3. Processar eventos de notif.     │
│    └─ processarEventosCarregamento()│
│       ├─ EVENTO 2 detectado        │
│       ├─ EVENTO 3 detectado        │
│       └─ EVENTO 4 detectado        │
│                                     │
│ 4. Limpar transações finalizadas   │
│                                     │
└─────────────────────────────────────┘
```

### Fluxo do Evento 1 (Início):

```
StartTransaction detectado
  └─ Carregamento já existe no banco?
      ├─ SIM: Atualizar morador_id (se necessário)
      │   └─ notificacao_inicio_enviada == false?
      │       └─ SIM: Enviar notificação PENDENTE
      └─ NÃO: Criar novo carregamento
          └─ morador tem notificações ativas?
              └─ SIM: Enviar notificação
```

### Fluxo do Evento 2 (Ociosidade):

```
Para cada carregamento ativo:
  └─ Buscar power atual do CVE
      └─ currentPower < 10W?
          ├─ SIM: primeiro_ocioso_em existe?
          │   ├─ NÃO: Marcar NOW()
          │   └─ SIM: Calcular tempo ocioso
          │       └─ tempo >= 0 min?
          │           └─ SIM: Enviar notificação
          └─ NÃO: Resetar primeiro_ocioso_em (se existir)
```

### Fluxo do Evento 3 (Bateria Cheia):

```
Para cada carregamento ativo:
  └─ primeiro_ocioso_em existe?
      └─ SIM: Calcular tempo desde ociosidade
          └─ tempo >= 3 min?
              └─ SIM: currentPower < 10W?
                  └─ SIM: Enviar notificação
```

### Fluxo do Evento 4 (Interrupção):

```
Para cada carregamento ativo:
  └─ Status do connector == 'Available'?
      └─ SIM: carregamento.fim == NULL?
          └─ SIM: interrupcao_detectada == false?
              └─ SIM: Enviar notificação + Finalizar
```

---

## 📝 VARIÁVEIS E PLACEHOLDERS

### Sistema de Substituição:

O `NotificationService` usa o método `renderizarTemplate()` para substituir placeholders.

**Formato:** `{{variavel}}`

**Exemplo:**
```typescript
const template = "Olá {{nome}}, seu carregamento no {{charger}} iniciou!";
const dados = { nome: "João", charger: "Gran Marine 2" };
const resultado = renderizarTemplate(template, dados);
// Resultado: "Olá João, seu carregamento no Gran Marine 2 iniciou!"
```

### Variáveis Disponíveis por Evento:

**Evento 1 (Início):**
- `{{nome}}` - `morador.nome`
- `{{charger}}` - `carregamento.charger_name`
- `{{localizacao}}` - `${addressStreet}, ${addressCity}`
- `{{data}}` - `new Date().toLocaleString('pt-BR')`
- `{{apartamento}}` - `morador.apartamento`

**Evento 2 (Ociosidade):**
- `{{nome}}` - `morador.nome`
- `{{charger}}` - `carregamento.charger_name`
- `{{energia}}` - `carregamento.energia_consumida_kwh.toFixed(2)`
- `{{data}}` - `new Date().toLocaleString('pt-BR')`

**Evento 3 (Bateria Cheia):**
- `{{nome}}` - `morador.nome`
- `{{charger}}` - `carregamento.charger_name`
- `{{energia}}` - `carregamento.energia_consumida_kwh.toFixed(2)`
- `{{duracao}}` - `${horas}h ${minutos}min`

**Evento 4 (Interrupção):**
- `{{nome}}` - `morador.nome`
- `{{charger}}` - `carregamento.charger_name`
- `{{energia}}` - `carregamento.energia_consumida_kwh.toFixed(2)`
- `{{duracao}}` - `${horas}h ${minutos}min`

### Cálculo de Duração:

```typescript
const duracaoMinutos = Math.floor((Date.now() - inicio.getTime()) / 60000);
const horas = Math.floor(duracaoMinutos / 60);
const minutos = duracaoMinutos % 60;
const duracaoFormatada = `${horas}h ${minutos}min`;
```

---

## ⚠️ POSSÍVEIS FALHAS

### FALHA F01: Template não encontrado

**Sintoma:**
```
❌ Template não encontrado ou inativo: inicio_recarga
```

**Causa:**
- Template foi deletado do banco
- Tipo do template está incorreto no código
- Template está com `ativo = false`

**Verificação:**
```sql
SELECT tipo, ativo FROM templates_notificacao;
```

**Solução:**
- Inserir template faltante
- Corrigir tipo no código
- Ativar template: `UPDATE templates_notificacao SET ativo = true WHERE tipo = ?`

---

### FALHA F02: Morador sem telefone

**Sintoma:**
```
❌ Morador sem telefone ou notificações desativadas
```

**Causa:**
- Campo `telefone` é `NULL`
- `notificacoes_ativas = false`

**Verificação:**
```sql
SELECT id, nome, telefone, notificacoes_ativas 
FROM moradores 
WHERE id = ?;
```

**Solução:**
- Cadastrar telefone do morador
- Ativar notificações: `UPDATE moradores SET notificacoes_ativas = true WHERE id = ?`

---

### FALHA F03: Evolution API não responde

**Sintoma:**
```
❌ Erro ao enviar notificação: ECONNREFUSED
❌ Erro ao enviar notificação: 401 Unauthorized
```

**Causa:**
- URL da Evolution API incorreta
- API Key inválida
- Instância não existe
- Evolution API offline

**Verificação:**
```sql
SELECT chave, valor 
FROM configuracoes_sistema 
WHERE chave LIKE 'evolution_%';
```

**Teste manual:**
```bash
curl -X POST "https://evolution.example.com/message/sendText/sua-instancia" \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{"number": "+5582999999999", "text": "Teste"}'
```

**Solução:**
- Verificar credenciais no banco
- Testar conexão com Evolution API
- Validar se instância está ativa

---

### FALHA F04: Notificação duplicada

**Sintoma:**
- Morador recebe mesma notificação múltiplas vezes

**Causa:**
- Flag `notificacao_*_enviada` não foi atualizada
- Transação do banco falhou
- Race condition no polling

**Verificação:**
```sql
SELECT 
  id,
  notificacao_inicio_enviada,
  notificacao_ociosidade_enviada,
  notificacao_bateria_cheia_enviada
FROM carregamentos
WHERE id = ?;
```

**Solução:**
- Verificar se `markNotificationSent()` foi chamado
- Adicionar transação SQL
- Verificar logs de erro

---

### FALHA F05: Evento não detectado

**Sintoma:**
- Power cai abaixo de 10W mas notificação não é enviada

**Causa possível 1: CVE não retorna power**
```typescript
const currentPower = connector.power || connector.lastStatus?.power || 0;
// Se ambos forem undefined, currentPower = 0 (sempre < 10W)
```

**Causa possível 2: primeiro_ocioso_em não foi marcado**
```sql
SELECT primeiro_ocioso_em FROM carregamentos WHERE id = ?;
-- Se NULL, Evento 3 nunca dispara
```

**Causa possível 3: Template inativo**
```sql
SELECT ativo FROM templates_notificacao WHERE tipo = 'inicio_ociosidade';
-- Se false, notificação não é enviada
```

**Verificação:**
```sql
SELECT 
  c.id,
  c.charger_name,
  c.ultimo_power_w,
  c.primeiro_ocioso_em,
  c.notificacao_ociosidade_enviada,
  t.ativo AS template_ativo
FROM carregamentos c
CROSS JOIN templates_notificacao t
WHERE c.id = ? 
  AND t.tipo = 'inicio_ociosidade';
```

---

### FALHA F06: Placeholder não substituído

**Sintoma:**
- Mensagem WhatsApp contém `{{variavel}}` ao invés do valor

**Causa:**
- Variável não foi passada no `dados`
- Nome da variável está incorreto
- Variável é `undefined` ou `null`

**Exemplo de erro:**
```typescript
// ❌ ERRADO
await notificationService.notificarOciosidade(moradorId, chargerName);
// Falta o parâmetro energiaConsumida

// ✅ CORRETO
await notificationService.notificarOciosidade(
  moradorId, 
  chargerName, 
  energiaConsumida
);
```

**Verificação:**
- Conferir assinatura do método
- Verificar se todos os parâmetros estão sendo passados
- Testar template com dados mockados

---

### FALHA F07: Carregamento não finalizado

**Sintoma:**
- Carregamento aparece como ativo mesmo após StopTransaction

**Causa:**
- `verificarStatusCarregadores()` não detectou mudança
- Evento 4 não foi processado
- Status do CVE não atualizou para 'Available'

**Verificação:**
```sql
SELECT 
  id,
  charger_uuid,
  inicio,
  fim,
  interrupcao_detectada
FROM carregamentos
WHERE fim IS NULL
ORDER BY inicio DESC;
```

**Solução:**
- Verificar logs do `verificarStatusCarregadores()`
- Consultar status real no CVE
- Finalizar manualmente se necessário:
```sql
UPDATE carregamentos 
SET fim = NOW(), tipo_finalizacao = 'manual' 
WHERE id = ?;
```

---

### FALHA F08: Tempo de ociosidade não conta

**Sintoma:**
- Bateria Cheia nunca é detectado mesmo após horas em ociosidade

**Causa:**
- `primeiro_ocioso_em` é resetado ao invés de persistir
- Cálculo de tempo está incorreto
- Template tem `tempo_minutos` muito alto

**Verificação:**
```sql
SELECT 
  c.primeiro_ocioso_em,
  EXTRACT(EPOCH FROM (NOW() - c.primeiro_ocioso_em)) / 60 AS minutos_ocioso,
  t.tempo_minutos AS tempo_necessario
FROM carregamentos c
CROSS JOIN templates_notificacao t
WHERE c.id = ? 
  AND t.tipo = 'bateria_cheia';
```

**Solução:**
- Verificar se power não está oscilando (causando reset)
- Ajustar `tempo_minutos` no template
- Verificar lógica de reset no código

---

## 🔍 TROUBLESHOOTING

### Checklist de Diagnóstico:

**1. Verificar morador:**
```sql
SELECT id, nome, telefone, notificacoes_ativas 
FROM moradores 
WHERE id = ?;
```
- [ ] Telefone preenchido
- [ ] `notificacoes_ativas = true`

**2. Verificar carregamento:**
```sql
SELECT 
  id,
  morador_id,
  inicio,
  fim,
  notificacao_inicio_enviada,
  notificacao_ociosidade_enviada,
  notificacao_bateria_cheia_enviada,
  interrupcao_detectada,
  ultimo_power_w,
  primeiro_ocioso_em
FROM carregamentos
WHERE id = ?;
```
- [ ] `morador_id` preenchido
- [ ] `fim = NULL` (para eventos 2 e 3)
- [ ] Flags de notificação corretas

**3. Verificar template:**
```sql
SELECT tipo, ativo, tempo_minutos, power_threshold_w 
FROM templates_notificacao 
WHERE tipo = ?;
```
- [ ] Template existe
- [ ] `ativo = true`
- [ ] `tempo_minutos` correto
- [ ] `power_threshold_w` correto (se aplicável)

**4. Verificar Evolution API:**
```sql
SELECT chave, LENGTH(valor) AS tam 
FROM configuracoes_sistema 
WHERE chave LIKE 'evolution_%';
```
- [ ] `evolution_api_url` configurada
- [ ] `evolution_api_key` configurada
- [ ] `evolution_instance` configurada

**5. Verificar logs:**
```sql
SELECT tipo, status, erro, criado_em 
FROM logs_notificacoes 
WHERE morador_id = ? 
ORDER BY criado_em DESC 
LIMIT 10;
```
- [ ] Notificações foram tentadas
- [ ] Status = 'enviado' (sucesso)
- [ ] Campo `erro` vazio

---

### Comandos Úteis de Debug:

**Ver todos os carregamentos ativos:**
```sql
SELECT 
  c.id,
  c.charger_name,
  m.nome AS morador,
  m.telefone,
  c.inicio,
  EXTRACT(EPOCH FROM (NOW() - c.inicio)) / 60 AS minutos_ativo,
  c.notificacao_inicio_enviada,
  c.primeiro_ocioso_em
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.fim IS NULL
ORDER BY c.inicio DESC;
```

**Ver notificações enviadas hoje:**
```sql
SELECT 
  m.nome,
  ln.tipo,
  ln.status,
  ln.criado_em
FROM logs_notificacoes ln
JOIN moradores m ON ln.morador_id = m.id
WHERE DATE(ln.criado_em) = CURRENT_DATE
ORDER BY ln.criado_em DESC;
```

**Ver moradores elegíveis para notificação:**
```sql
SELECT 
  id,
  nome,
  telefone,
  apartamento,
  notificacoes_ativas
FROM moradores
WHERE telefone IS NOT NULL 
  AND notificacoes_ativas = true
ORDER BY nome;
```

**Ver carregamentos com eventos pendentes:**
```sql
SELECT 
  c.id,
  c.charger_name,
  m.nome,
  CASE 
    WHEN c.notificacao_inicio_enviada = false THEN 'Evento 1 pendente'
    WHEN c.ultimo_power_w < 10 AND c.notificacao_ociosidade_enviada = false THEN 'Evento 2 pendente'
    WHEN c.primeiro_ocioso_em IS NOT NULL 
      AND EXTRACT(EPOCH FROM (NOW() - c.primeiro_ocioso_em)) / 60 >= 3 
      AND c.notificacao_bateria_cheia_enviada = false THEN 'Evento 3 pendente'
    ELSE 'Nenhum evento pendente'
  END AS status_evento
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.fim IS NULL;
```

---

## 📊 LOGS E MONITORAMENTO

### Mensagens de Log por Evento:

**Evento 1 (Início):**
```
✅ [Polling] Novo carregamento registrado: ID 123
📱 [Polling] Notificação de início enviada para João Silva
✅ [Polling] Carregamento 123 atualizado com morador
📱 [Polling] Notificação de início PENDENTE enviada para João Silva (Carregamento 123)
```

**Evento 2 (Ociosidade):**
```
🔍 [Eventos] Processando 2 carregamento(s) ativo(s)...
💤 [Eventos] Carregamento 123 entrou em ociosidade (Power: 5W)
📱 [Eventos] Notificação de ociosidade enviada para João Silva (Carregamento 123)
⚡ [Eventos] Carregamento 123 saiu da ociosidade (Power: 150W)
```

**Evento 3 (Bateria Cheia):**
```
🔋 [Eventos] Notificação de bateria cheia enviada para João Silva (Carregamento 123)
```

**Evento 4 (Interrupção):**
```
🚨 [Eventos] Notificação de interrupção enviada para João Silva (Carregamento 123)
```

**Erros:**
```
❌ [Polling] Erro ao enviar notificação: Error message
❌ [Eventos] Erro ao processar carregamento 123: Error message
❌ [Eventos] Erro geral ao processar eventos de carregamento: Error message
```

---

### Métricas a Monitorar:

**Taxa de sucesso de notificações:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'enviado') AS sucesso,
  COUNT(*) FILTER (WHERE status = 'erro') AS erro,
  ROUND(COUNT(*) FILTER (WHERE status = 'enviado')::numeric / COUNT(*) * 100, 2) AS taxa_sucesso
FROM logs_notificacoes
WHERE criado_em >= NOW() - INTERVAL '24 hours';
```

**Distribuição de eventos:**
```sql
SELECT 
  tipo,
  COUNT(*) AS total
FROM logs_notificacoes
WHERE criado_em >= NOW() - INTERVAL '24 hours'
GROUP BY tipo
ORDER BY total DESC;
```

**Tempo médio até ociosidade:**
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (primeiro_ocioso_em - inicio)) / 60) AS minutos_media
FROM carregamentos
WHERE primeiro_ocioso_em IS NOT NULL;
```

**Carregamentos sem notificação:**
```sql
SELECT COUNT(*) 
FROM carregamentos 
WHERE morador_id IS NOT NULL 
  AND notificacao_inicio_enviada = false 
  AND fim IS NULL;
```

---

## 📌 REFERÊNCIAS RÁPIDAS

### Tipos de Eventos:
- `inicio_recarga`
- `inicio_ociosidade`
- `bateria_cheia`
- `interrupcao`

### Flags de Controle:
- `notificacao_inicio_enviada`
- `notificacao_ociosidade_enviada`
- `notificacao_bateria_cheia_enviada`
- `interrupcao_detectada`

### Campos de Rastreamento:
- `ultimo_power_w`
- `primeiro_ocioso_em`
- `power_zerou_em`
- `contador_minutos_ocioso`
- `tipo_finalizacao`

### Métodos do NotificationService:
- `notificarInicio(moradorId, chargerNome, localizacao)`
- `notificarOciosidade(moradorId, chargerNome, energiaConsumida)`
- `notificarBateriaCheia(moradorId, chargerNome, energiaTotal, duracaoTotal)`
- `notificarInterrupcao(moradorId, chargerNome, energiaParcial, duracaoParcial)`

### Arquivos-chave:
- `apps/backend/src/services/PollingService.ts` - Detecção de eventos
- `apps/backend/src/services/NotificationService.ts` - Envio de notificações
- `apps/backend/src/models/Carregamento.ts` - Model de carregamentos
- `apps/backend/src/models/TemplateNotificacao.ts` - Model de templates

---

**Documento mantido por:** Cursor AI  
**Última atualização:** 02/02/2026  
**Versão:** 1.0

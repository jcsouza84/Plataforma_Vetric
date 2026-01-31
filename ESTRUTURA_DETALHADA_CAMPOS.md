# 🎯 ESTRUTURA COMPLETA - Campos Existentes vs Novos

## Data: 31/01/2026
## Status: Análise da Estrutura Atual ✅

---

## 📊 ESTRUTURA ATUAL DO BANCO

### ✅ Tabela `carregamentos` (13 campos EXISTENTES)

```sql
1.  id                          INTEGER (PK)
2.  morador_id                  INTEGER (FK)
3.  charger_uuid                VARCHAR
4.  charger_name                VARCHAR
5.  connector_id                INTEGER
6.  status                      VARCHAR
7.  inicio                      TIMESTAMP
8.  fim                         TIMESTAMP
9.  energia_kwh                 NUMERIC
10. duracao_minutos             INTEGER
11. notificacao_inicio_enviada  BOOLEAN (default: false) ✅
12. notificacao_fim_enviada     BOOLEAN (default: false) ✅
13. criado_em                   TIMESTAMP
```

**✅ Campos de notificação JÁ EXISTEM!**
- `notificacao_inicio_enviada`
- `notificacao_fim_enviada`

---

### ✅ Tabela `configuracoes_sistema` (JÁ EXISTE!)

```sql
1. id               INTEGER (PK)
2. chave            VARCHAR
3. valor            TEXT
4. descricao        TEXT
5. atualizado_em    TIMESTAMP
6. atualizado_por   UUID
```

**✅ Estrutura perfeita para nossas configurações!**

---

### ✅ Tabela `logs_notificacoes` (JÁ EXISTE!)

```sql
1. id                 INTEGER (PK)
2. morador_id         INTEGER (FK)
3. tipo               VARCHAR
4. mensagem_enviada   TEXT
5. telefone           VARCHAR
6. status             VARCHAR
7. erro               TEXT
8. enviado_em         TIMESTAMP
9. criado_em          TIMESTAMP
```

**✅ Estrutura perfeita para logs!**

---

### ❌ Tabela `mensagens_notificacoes` (NÃO EXISTE - CRIAR!)

**Precisa criar do zero com:**
```sql
1. id               INTEGER (PK)
2. tipo             VARCHAR (inicio_recarga, inicio_ociosidade, etc.)
3. titulo           TEXT
4. corpo            TEXT
5. tempo_minutos    INTEGER (campo de tempo do card)
6. ativo            BOOLEAN
7. criado_em        TIMESTAMP
8. atualizado_em    TIMESTAMP
```

---

## 🆕 CAMPOS NOVOS NECESSÁRIOS

### Tabela `carregamentos` - ADICIONAR 8 campos:

```sql
-- Para rastreamento de potência
14. ultimo_power_w              INTEGER

-- Para contagem de ociosidade
15. contador_minutos_ocioso     INTEGER DEFAULT 0
16. primeiro_ocioso_em          TIMESTAMP

-- Para detecção de interrupção
17. power_zerou_em              TIMESTAMP
18. interrupcao_detectada       BOOLEAN DEFAULT FALSE

-- Para controle de notificações específicas
19. notificacao_ociosidade_enviada      BOOLEAN DEFAULT FALSE
20. notificacao_bateria_cheia_enviada   BOOLEAN DEFAULT FALSE

-- Tipo de finalização
21. tipo_finalizacao            VARCHAR(50)
    -- Valores: 'bateria_cheia', 'interrupcao', 'normal'
```

---

## 📱 OS 4 CASOS DE NOTIFICAÇÃO

### CASO 1️⃣: INÍCIO DE RECARGA
**Campos envolvidos:**
- `notificacao_inicio_enviada` ✅ (JÁ EXISTE!)
- Usa mensagem do tipo `'inicio_recarga'`
- Tempo configurável no card da mensagem

---

### CASO 2️⃣: INÍCIO DE OCIOSIDADE
**Campos envolvidos:**
- `notificacao_ociosidade_enviada` 🆕 (NOVO!)
- `primeiro_ocioso_em` 🆕 (NOVO!)
- `ultimo_power_w` 🆕 (NOVO!)
- Usa mensagem do tipo `'inicio_ociosidade'`
- Envia IMEDIATAMENTE (tempo = 0)

---

### CASO 3️⃣: BATERIA CHEIA
**Campos envolvidos:**
- `notificacao_bateria_cheia_enviada` 🆕 (NOVO!)
- `contador_minutos_ocioso` 🆕 (NOVO!)
- `tipo_finalizacao` 🆕 (NOVO!)
- Usa mensagem do tipo `'bateria_cheia'`
- Tempo configurável no card da mensagem

---

### CASO 4️⃣: INTERRUPÇÃO
**Campos envolvidos:**
- `notificacao_fim_enviada` ✅ (JÁ EXISTE! - Reusar para interrupção)
- `power_zerou_em` 🆕 (NOVO!)
- `interrupcao_detectada` 🆕 (NOVO!)
- `tipo_finalizacao` 🆕 (NOVO!)
- Usa mensagem do tipo `'interrupcao'`
- Envia ao detectar (tempo = 0)

---

## ⚙️ CONFIGURAÇÕES NO CARD DE MENSAGEM

### Todas as 4 mensagens terão campo "Tempo (minutos)":

```
┌──────────────────────────────────────────┐
│ 🔋 Início de Carregamento       [toggle] │
│ Enviado quando o carregamento é iniciado │
├──────────────────────────────────────────┤
│ Mensagem                                 │
│ ┌──────────────────────────────────────┐ │
│ │ [área de texto editável]            │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              Tempo: [3] minutos ⏱️       │
│                                          │
│ [Editar Template]                        │
└──────────────────────────────────────────┘
```

### Valores Iniciais:

| Mensagem | Tempo (minutos) | Comportamento |
|----------|-----------------|---------------|
| **Início de Recarga** | `3` | Aguarda 3 min após StartTransaction |
| **Início de Ociosidade** | `0` | Envia IMEDIATAMENTE no primeiro 0W |
| **Bateria Cheia** | `3` | Aguarda 3 min consecutivos em 0W |
| **Interrupção** | `0` | Envia ao detectar interrupção |

**✅ TODOS os 4 terão campo de tempo editável!**

---

## ⚙️ CONFIGURAÇÃO DA POTÊNCIA OCIOSA

### Configuração Individual (NÃO GLOBAL!)

```
┌──────────────────────────────────────────┐
│ ⚠️ Início de Ociosidade         [toggle] │
│ Enviado quando detecta primeiro 0W       │
├──────────────────────────────────────────┤
│ Mensagem                                 │
│ ┌──────────────────────────────────────┐ │
│ │ [área de texto]                     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ⚡ Detectar ociosidade:                  │
│    Menor que [10] W ← EDITÁVEL           │
│                                          │
│              Tempo: [0] minutos ⏱️       │
│                                          │
│ [Editar Template]                        │
└──────────────────────────────────────────┘
```

**CAMPO ADICIONAL:** `power_threshold_w`

---

## 🗄️ ESTRUTURA FINAL DA TABELA `mensagens_notificacoes`

```sql
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  
  -- Identificação
  tipo VARCHAR(50) UNIQUE NOT NULL,
  
  -- Conteúdo (editável)
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  
  -- Configuração de tempo (editável)
  tempo_minutos INTEGER DEFAULT 0,
  
  -- Configuração de potência (apenas para ociosidade/bateria)
  power_threshold_w INTEGER DEFAULT NULL,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Inserção Inicial:

```sql
INSERT INTO mensagens_notificacoes 
  (tipo, titulo, corpo, tempo_minutos, power_threshold_w, ativo) 
VALUES
  (
    'inicio_recarga',
    '🔋 Início de Carregamento',
    'Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n🕐 Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!',
    3,      -- Aguarda 3 minutos
    NULL,   -- Não usa threshold de potência
    TRUE
  ),
  (
    'inicio_ociosidade',
    '⚠️ Carregamento ocioso',
    'Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{consumo}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.',
    0,      -- Envia imediatamente
    10,     -- Menor que 10W = ocioso ⚡ EDITÁVEL!
    TRUE
  ),
  (
    'bateria_cheia',
    '🔋 Carga completa!',
    'Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nObrigado por liberar o carregador!',
    3,      -- Aguarda 3 minutos consecutivos em 0W
    10,     -- Usa mesmo threshold (10W) ⚡
    TRUE
  ),
  (
    'interrupcao',
    '⚠️ Carregamento interrompido',
    'Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo.',
    0,      -- Envia ao detectar
    NULL,   -- Não usa threshold
    TRUE
  );
```

---

## 📊 RESUMO: QUANTOS CAMPOS?

### ✅ Campos JÁ EXISTENTES (não mexer):
```
carregamentos:
  • notificacao_inicio_enviada ✅
  • notificacao_fim_enviada ✅

configuracoes_sistema: (tabela completa) ✅
logs_notificacoes: (tabela completa) ✅
```

---

### 🆕 CAMPOS NOVOS A ADICIONAR:

#### Tabela `carregamentos`: **8 campos novos**
```sql
1. ultimo_power_w                        INTEGER
2. contador_minutos_ocioso               INTEGER
3. primeiro_ocioso_em                    TIMESTAMP
4. power_zerou_em                        TIMESTAMP
5. interrupcao_detectada                 BOOLEAN
6. notificacao_ociosidade_enviada        BOOLEAN
7. notificacao_bateria_cheia_enviada     BOOLEAN
8. tipo_finalizacao                      VARCHAR(50)
```

#### Tabela `mensagens_notificacoes`: **CRIAR COMPLETA (7 campos)**
```sql
1. id                    SERIAL PRIMARY KEY
2. tipo                  VARCHAR(50) UNIQUE
3. titulo                TEXT
4. corpo                 TEXT
5. tempo_minutos         INTEGER ⏱️ (campo do card)
6. power_threshold_w     INTEGER ⚡ (para ociosidade/bateria)
7. ativo                 BOOLEAN
8. criado_em             TIMESTAMP
9. atualizado_em         TIMESTAMP
```

---

## 🎯 INTERFACE ADMIN - CADA CARD DE MENSAGEM

### Campos Editáveis em CADA Card:

```
┌────────────────────────────────────────────┐
│ 🔋 [TÍTULO EDITÁVEL]            [toggle]   │
│ [Descrição editável]                       │
├────────────────────────────────────────────┤
│                                            │
│ Variáveis disponíveis:                     │
│ {{nome}} {{charger}} {{localizacao}}       │
│ {{data}} {{apartamento}} {{consumo}}       │
│ {{duracao}}                                │
│                                            │
├────────────────────────────────────────────┤
│ Mensagem                                   │
│ ┌────────────────────────────────────────┐ │
│ │                                        │ │
│ │ [ÁREA DE TEXTO EDITÁVEL]               │ │
│ │                                        │ │
│ │                                        │ │
│ └────────────────────────────────────────┘ │
│                                            │
├────────────────────────────────────────────┤
│ ⚡ Detectar ociosidade: (se aplicável)     │
│    Menor que [10] W                        │
│    ⚠️ Só aparece em "Ociosidade" e "Bateria"│
│                                            │
│              Tempo: [3] minutos ⏱️         │
│              ⚠️ Aparece em TODOS           │
│                                            │
│ [Salvar] [Cancelar]                        │
└────────────────────────────────────────────┘
```

---

## 📋 OS 4 CARDS DE MENSAGENS

### 1️⃣ Início de Recarga
```
Campos editáveis:
  ✅ Título
  ✅ Corpo (com variáveis)
  ✅ Tempo (minutos) ⏱️ [3]
  ❌ Power threshold (não usa)
  ✅ Ativo (toggle)
```

### 2️⃣ Início de Ociosidade
```
Campos editáveis:
  ✅ Título
  ✅ Corpo (com variáveis)
  ✅ Tempo (minutos) ⏱️ [0] (imediato)
  ✅ Power threshold ⚡ [10] W
  ✅ Ativo (toggle)
```

### 3️⃣ Bateria Cheia
```
Campos editáveis:
  ✅ Título
  ✅ Corpo (com variáveis)
  ✅ Tempo (minutos) ⏱️ [3]
  ✅ Power threshold ⚡ [10] W (mesmo da ociosidade)
  ✅ Ativo (toggle)
```

### 4️⃣ Interrupção
```
Campos editáveis:
  ✅ Título
  ✅ Corpo (com variáveis)
  ✅ Tempo (minutos) ⏱️ [0] (ao detectar)
  ❌ Power threshold (não usa)
  ✅ Ativo (toggle)
```

---

## 🎯 RESPOSTA ÀS SUAS PERGUNTAS

### 1. "A potência da ociosidade não será global"
✅ **CORRETO!** 
- Campo `power_threshold_w` na tabela `mensagens_notificacoes`
- Cada mensagem (Ociosidade e Bateria Cheia) tem seu próprio threshold
- Editável no próprio card da mensagem

---

### 2. "Todos os campos de mensagem deverão ter campo de tempo"
✅ **CORRETO!** 
- TODOS os 4 cards terão campo `tempo_minutos`
- Editável no canto inferior direito de cada card
- Valores: 0 (imediato), 3, 5, 10, etc.

---

### 3. "Serão quantos campos?"

#### Em `carregamentos`: **8 campos novos**
```
1. ultimo_power_w
2. contador_minutos_ocioso
3. primeiro_ocioso_em
4. power_zerou_em
5. interrupcao_detectada
6. notificacao_ociosidade_enviada
7. notificacao_bateria_cheia_enviada
8. tipo_finalizacao
```

#### Tabela nova `mensagens_notificacoes`: **9 campos**
```
1. id
2. tipo
3. titulo
4. corpo
5. tempo_minutos ⏱️ (TODOS têm!)
6. power_threshold_w ⚡ (só ociosidade/bateria)
7. ativo
8. criado_em
9. atualizado_em
```

**Total de campos NOVOS: 17**
- 8 em `carregamentos`
- 9 na nova tabela `mensagens_notificacoes`

---

### 4. "Quais os existentes atualmente?"

#### ✅ Tabela `carregamentos`: **13 campos existentes**
```
✅ id, morador_id, charger_uuid, charger_name, 
✅ connector_id, status, inicio, fim, 
✅ energia_kwh, duracao_minutos, 
✅ notificacao_inicio_enviada, notificacao_fim_enviada,
✅ criado_em
```

#### ✅ Tabela `configuracoes_sistema`: **Existe completa!**
```
✅ id, chave, valor, descricao, atualizado_em, atualizado_por
```

#### ✅ Tabela `logs_notificacoes`: **Existe completa!**
```
✅ id, morador_id, tipo, mensagem_enviada, 
✅ telefone, status, erro, enviado_em, criado_em
```

#### ❌ Tabela `mensagens_notificacoes`: **NÃO EXISTE**
```
❌ Precisa criar do zero
```

---

## ✅ ESTRUTURA FINAL CONFIRMADA

### Migration 1: Adicionar campos em `carregamentos`
```sql
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  ultimo_power_w INTEGER,
  contador_minutos_ocioso INTEGER DEFAULT 0,
  primeiro_ocioso_em TIMESTAMP,
  power_zerou_em TIMESTAMP,
  interrupcao_detectada BOOLEAN DEFAULT FALSE,
  notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
  notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE,
  tipo_finalizacao VARCHAR(50);
```

### Migration 2: Criar tabela `mensagens_notificacoes`
```sql
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  tempo_minutos INTEGER DEFAULT 0,
  power_threshold_w INTEGER DEFAULT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Migration 3: Inserir 4 mensagens padrão
```sql
INSERT INTO mensagens_notificacoes (...) VALUES (...);
-- (4 mensagens completas)
```

---

## 🎯 ESTÁ TUDO CLARO AGORA?

✅ **Potência ociosa:** Campo individual `power_threshold_w` no card  
✅ **Tempo:** TODOS os 4 cards têm campo `tempo_minutos`  
✅ **Campos novos:** 8 em `carregamentos` + 1 tabela nova (9 campos)  
✅ **Campos existentes:** 13 em `carregamentos` (2 já são de notificação!)  

**Pronto para implementar? 🚀**


# 🗃️ COMO EXECUTAR AS MIGRATIONS NO RENDER

## ⚠️ SITUAÇÃO ATUAL

O deploy foi feito com sucesso ✅, mas **as migrations SQL não foram executadas no banco de dados**.

Por isso a tela de configurações não mudou - os dados não existem no banco ainda!

---

## 📋 PASSO A PASSO

### **1️⃣ Acessar o Dashboard do Render**

1. Acesse: https://dashboard.render.com
2. Clique em **"vetric_db"** (seu PostgreSQL)
3. Clique na aba **"Shell"** (console SQL)

---

### **2️⃣ Executar Migration 1: Criar Tabela de Mensagens**

**Cole o SQL abaixo no console:**

```sql
-- ================================================
-- Migration: Criar Tabela de Mensagens Configuráveis
-- ================================================

BEGIN;

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  tempo_minutos INTEGER DEFAULT 0,
  power_threshold_w INTEGER DEFAULT NULL,
  ativo BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir 4 mensagens padrão (TODAS DESATIVADAS)
INSERT INTO mensagens_notificacoes 
  (tipo, titulo, corpo, tempo_minutos, power_threshold_w, ativo) 
VALUES
  -- 1. Início de Recarga
  (
    'inicio_recarga',
    '🔋 Início de Carregamento',
    E'Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n🕐 Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!',
    3,
    NULL,
    FALSE
  ),
  
  -- 2. Início de Ociosidade
  (
    'inicio_ociosidade',
    '⚠️ Carregamento ocioso',
    E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{consumo}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\n\nObrigado pela compreensão! 🙏',
    0,
    10,
    FALSE
  ),
  
  -- 3. Bateria Cheia
  (
    'bateria_cheia',
    '🔋 Carga completa!',
    E'Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nPor favor, remova o cabo para liberar o carregador.\n\nObrigado por utilizar nosso sistema! 🙏',
    3,
    10,
    FALSE
  ),
  
  -- 4. Interrupção
  (
    'interrupcao',
    '⚠️ Carregamento interrompido',
    E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\n\nTelefone: (82) 3333-4444\nWhatsApp: (82) 99999-9999',
    0,
    NULL,
    FALSE
  );

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_tipo 
  ON mensagens_notificacoes(tipo);

CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_ativo 
  ON mensagens_notificacoes(ativo) WHERE ativo = TRUE;

COMMIT;

-- Verificar se funcionou
SELECT tipo, titulo, tempo_minutos, power_threshold_w, ativo 
FROM mensagens_notificacoes 
ORDER BY id;
```

**✅ Você deve ver 4 linhas retornadas (as 4 mensagens criadas)!**

---

### **3️⃣ Executar Migration 2: Adicionar Campos em Carregamentos**

**Cole o SQL abaixo:**

```sql
-- ================================================
-- Migration: Adicionar Campos de Notificações
-- ================================================

BEGIN;

-- Adicionar campos
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  ultimo_power_w INTEGER DEFAULT NULL;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  contador_minutos_ocioso INTEGER DEFAULT 0;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  primeiro_ocioso_em TIMESTAMP DEFAULT NULL;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  power_zerou_em TIMESTAMP DEFAULT NULL;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  interrupcao_detectada BOOLEAN DEFAULT FALSE;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  tipo_finalizacao VARCHAR(50) DEFAULT NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_carregamentos_fim_null 
  ON carregamentos(fim) WHERE fim IS NULL;

CREATE INDEX IF NOT EXISTS idx_carregamentos_notificacoes 
  ON carregamentos(notificacao_inicio_enviada, notificacao_fim_enviada, notificacao_ociosidade_enviada);

CREATE INDEX IF NOT EXISTS idx_carregamentos_morador_ativo 
  ON carregamentos(morador_id, fim) WHERE fim IS NULL;

COMMIT;

-- Verificar se funcionou
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'carregamentos' 
  AND column_name IN (
    'ultimo_power_w',
    'contador_minutos_ocioso',
    'primeiro_ocioso_em',
    'power_zerou_em',
    'interrupcao_detectada',
    'notificacao_ociosidade_enviada',
    'notificacao_bateria_cheia_enviada',
    'tipo_finalizacao'
  )
ORDER BY ordinal_position;
```

**✅ Você deve ver 8 linhas retornadas (os 8 novos campos)!**

---

## 🎯 PRÓXIMO PASSO

**Depois de executar as migrations, precisamos criar a INTERFACE para editar as mensagens!**

A tela de "Configurações" atual só mostra as mensagens antigas.

Vou criar a nova interface para você editar:
- ✏️ Título e corpo da mensagem
- ⏱️ Tempo em minutos
- ⚡ Power threshold (W)
- 🔘 Toggle ON/OFF

---

## ⚠️ IMPORTANTE

**Todas as mensagens estão DESLIGADAS (`ativo: FALSE`)** por padrão!

Você precisará ativar manualmente cada uma depois que a interface estiver pronta.

---

**Execute as migrations agora e me avise quando estiver pronto! 🚀**


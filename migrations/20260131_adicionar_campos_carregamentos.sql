-- ================================================
-- Migration: Adicionar Campos de Notificações em Carregamentos
-- Data: 31/01/2026
-- Autor: Sistema VETRIC
-- Descrição: Adiciona campos para rastreamento de
--            notificações inteligentes
-- ================================================

BEGIN;

-- Adicionar campos para rastreamento de potência e ociosidade
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

-- Adicionar campos para controle de notificações específicas
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE;

-- Tipo de finalização
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  tipo_finalizacao VARCHAR(50) DEFAULT NULL;

-- Comentários
COMMENT ON COLUMN carregamentos.ultimo_power_w IS 'Última potência registrada em Watts (MeterValues)';
COMMENT ON COLUMN carregamentos.contador_minutos_ocioso IS 'Contador de minutos consecutivos em 0W';
COMMENT ON COLUMN carregamentos.primeiro_ocioso_em IS 'Timestamp do primeiro MeterValues em 0W';
COMMENT ON COLUMN carregamentos.power_zerou_em IS 'Timestamp quando potência foi para 0W';
COMMENT ON COLUMN carregamentos.interrupcao_detectada IS 'TRUE se detectou queda abrupta + SuspendedEV';
COMMENT ON COLUMN carregamentos.notificacao_ociosidade_enviada IS 'TRUE se enviou alerta de ociosidade';
COMMENT ON COLUMN carregamentos.notificacao_bateria_cheia_enviada IS 'TRUE se enviou notificação de bateria cheia';
COMMENT ON COLUMN carregamentos.tipo_finalizacao IS 'bateria_cheia, interrupcao, ou normal';

-- Criar índices para queries de notificações
CREATE INDEX IF NOT EXISTS idx_carregamentos_fim_null 
  ON carregamentos(fim) WHERE fim IS NULL;

CREATE INDEX IF NOT EXISTS idx_carregamentos_notificacoes 
  ON carregamentos(notificacao_inicio_enviada, notificacao_fim_enviada, notificacao_ociosidade_enviada);

CREATE INDEX IF NOT EXISTS idx_carregamentos_morador_ativo 
  ON carregamentos(morador_id, fim) WHERE fim IS NULL;

COMMIT;

-- ================================================
-- Validação
-- ================================================
-- Verificar se colunas foram adicionadas
SELECT 
    column_name, 
    data_type, 
    column_default 
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


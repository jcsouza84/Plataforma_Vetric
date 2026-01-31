-- ============================================
-- MIGRATION 2: Adicionar Campos em carregamentos
-- Execute este SQL no console do Render
-- ============================================

BEGIN;

ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS ultimo_power_w INTEGER DEFAULT NULL;
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS contador_minutos_ocioso INTEGER DEFAULT 0;
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS primeiro_ocioso_em TIMESTAMP DEFAULT NULL;
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS power_zerou_em TIMESTAMP DEFAULT NULL;
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS interrupcao_detectada BOOLEAN DEFAULT FALSE;
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE;
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE;
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS tipo_finalizacao VARCHAR(50) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_carregamentos_fim_null ON carregamentos(fim) WHERE fim IS NULL;
CREATE INDEX IF NOT EXISTS idx_carregamentos_notificacoes ON carregamentos(notificacao_inicio_enviada, notificacao_fim_enviada, notificacao_ociosidade_enviada);
CREATE INDEX IF NOT EXISTS idx_carregamentos_morador_ativo ON carregamentos(morador_id, fim) WHERE fim IS NULL;

COMMIT;

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'carregamentos' AND column_name IN ('ultimo_power_w', 'contador_minutos_ocioso', 'primeiro_ocioso_em', 'power_zerou_em', 'interrupcao_detectada', 'notificacao_ociosidade_enviada', 'notificacao_bateria_cheia_enviada', 'tipo_finalizacao') ORDER BY column_name;


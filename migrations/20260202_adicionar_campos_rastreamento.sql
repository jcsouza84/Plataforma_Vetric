-- ================================================
-- Migration: Adicionar Campos de Rastreamento
-- Data: 02/02/2026
-- Descrição: Adiciona campos em 'carregamentos' para
--            rastrear estado de potência e notificações
-- ================================================

BEGIN;

-- ============================================
-- PASSO 1: Adicionar campos de rastreamento
-- ============================================

ALTER TABLE carregamentos 
  ADD COLUMN IF NOT EXISTS ultimo_power_w INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contador_minutos_ocioso INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primeiro_ocioso_em TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS power_zerou_em TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS interrupcao_detectada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tipo_finalizacao VARCHAR(50) DEFAULT NULL;

-- ============================================
-- PASSO 2: Adicionar comentários
-- ============================================

COMMENT ON COLUMN carregamentos.ultimo_power_w 
  IS 'Última potência registrada em Watts (para detectar mudanças)';

COMMENT ON COLUMN carregamentos.contador_minutos_ocioso 
  IS 'Contador de minutos consecutivos com potência baixa';

COMMENT ON COLUMN carregamentos.primeiro_ocioso_em 
  IS 'Timestamp da primeira detecção de ociosidade (< threshold)';

COMMENT ON COLUMN carregamentos.power_zerou_em 
  IS 'Timestamp quando potência chegou a 0W';

COMMENT ON COLUMN carregamentos.interrupcao_detectada 
  IS 'Flag indicando se houve interrupção abrupta do carregamento';

COMMENT ON COLUMN carregamentos.notificacao_ociosidade_enviada 
  IS 'Flag indicando se notificação de ociosidade já foi enviada';

COMMENT ON COLUMN carregamentos.notificacao_bateria_cheia_enviada 
  IS 'Flag indicando se notificação de bateria cheia já foi enviada';

COMMENT ON COLUMN carregamentos.tipo_finalizacao 
  IS 'Tipo de finalização: normal, bateria_cheia, interrupcao, timeout';

-- ============================================
-- PASSO 3: Criar índices para performance
-- ============================================

-- Índice para buscar carregamentos ativos com rastreamento
CREATE INDEX IF NOT EXISTS idx_carregamentos_power_tracking 
  ON carregamentos(ultimo_power_w, primeiro_ocioso_em) 
  WHERE fim IS NULL;

-- Índice para buscar carregamentos que precisam de notificação
CREATE INDEX IF NOT EXISTS idx_carregamentos_pendentes_notificacao 
  ON carregamentos(
    notificacao_ociosidade_enviada, 
    notificacao_bateria_cheia_enviada,
    primeiro_ocioso_em
  ) 
  WHERE fim IS NULL;

-- Índice para análise de finalizações
CREATE INDEX IF NOT EXISTS idx_carregamentos_tipo_finalizacao 
  ON carregamentos(tipo_finalizacao, fim) 
  WHERE fim IS NOT NULL;

COMMIT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se todos os campos foram adicionados
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
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

-- Verificar índices criados
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'carregamentos'
  AND indexname LIKE 'idx_carregamentos_%'
ORDER BY indexname;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- 
-- column_name                          | data_type | column_default | is_nullable
-- -------------------------------------+-----------+----------------+-------------
-- ultimo_power_w                       | integer   | NULL           | YES
-- contador_minutos_ocioso              | integer   | 0              | YES
-- primeiro_ocioso_em                   | timestamp | NULL           | YES
-- power_zerou_em                       | timestamp | NULL           | YES
-- interrupcao_detectada                | boolean   | false          | YES
-- notificacao_ociosidade_enviada       | boolean   | false          | YES
-- notificacao_bateria_cheia_enviada    | boolean   | false          | YES
-- tipo_finalizacao                     | varchar   | NULL           | YES
-- 
-- indexname                                      | indexdef
-- -----------------------------------------------+---------
-- idx_carregamentos_power_tracking               | CREATE INDEX...
-- idx_carregamentos_pendentes_notificacao        | CREATE INDEX...
-- idx_carregamentos_tipo_finalizacao             | CREATE INDEX...
-- 
-- ✅ SUCESSO: 8 campos adicionados!
-- ✅ SUCESSO: 3 índices criados!
-- ✅ COMPATIBILIDADE: Carregamentos existentes não foram afetados (DEFAULT NULL/0/false)

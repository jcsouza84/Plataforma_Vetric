-- ============================================================
-- Migration 009: Corrigir Case Sensitivity de Tags RFID
-- Data: 03/02/2026
-- 
-- Problema: Chargers diferentes enviam idTag em maiúsculo ou minúsculo
-- Solução: Padronizar tags e criar índice case-insensitive
-- ============================================================

-- 1. Padronizar todas as tags existentes para MAIÚSCULO
UPDATE moradores 
SET tag_rfid = UPPER(tag_rfid)
WHERE tag_rfid IS NOT NULL
  AND tag_rfid != UPPER(tag_rfid);

-- 2. Criar índice funcional case-insensitive para performance
CREATE INDEX IF NOT EXISTS idx_moradores_tag_rfid_upper 
ON moradores (UPPER(tag_rfid));

-- 3. Adicionar comentário na tabela
COMMENT ON COLUMN moradores.tag_rfid IS 
'Tag RFID do morador (case-insensitive). Chargers diferentes podem enviar em maiúsculo ou minúsculo.';

-- 4. Verificar resultado
SELECT 
  'Tags padronizadas' AS acao,
  COUNT(*) AS total_tags,
  COUNT(*) FILTER (WHERE tag_rfid ~ '[a-z]') AS com_minusculas,
  COUNT(*) FILTER (WHERE tag_rfid = UPPER(tag_rfid)) AS todas_maiusculas
FROM moradores
WHERE tag_rfid IS NOT NULL;

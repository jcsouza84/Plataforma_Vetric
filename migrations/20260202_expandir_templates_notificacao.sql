-- ================================================
-- Migration: Expandir Templates de Notificação
-- Data: 02/02/2026
-- Descrição: Adiciona campos para tempo e threshold,
--            e insere 3 novos tipos de notificação
-- ================================================

BEGIN;

-- ============================================
-- PASSO 1: Adicionar novos campos na tabela
-- ============================================

ALTER TABLE templates_notificacao 
  ADD COLUMN IF NOT EXISTS tempo_minutos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS power_threshold_w INTEGER DEFAULT NULL;

COMMENT ON COLUMN templates_notificacao.tempo_minutos 
  IS 'Tempo em minutos para aguardar antes de enviar (0 = imediato)';
  
COMMENT ON COLUMN templates_notificacao.power_threshold_w 
  IS 'Threshold de potência em Watts (para detecção de ociosidade/bateria cheia)';

-- ============================================
-- PASSO 2: Inserir 3 novos tipos de notificação
-- ============================================

-- 1. Início de Ociosidade (IMEDIATO ao detectar < 10W)
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES (
  'inicio_ociosidade',
  '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} entrou em OCIOSIDADE.

⚡ Consumo até agora: {{energia}} kWh
🕐 {{data}}

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏',
  0,    -- Envia IMEDIATAMENTE
  10,   -- Considera ocioso abaixo de 10W
  FALSE -- Desligado por padrão (admin deve ativar)
)
ON CONFLICT (tipo) DO NOTHING;

-- 2. Bateria Cheia (após 3 min em 0W)
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES (
  'bateria_cheia',
  '🔋 Olá {{nome}}!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏',
  3,    -- Aguarda 3 minutos em 0W
  10,   -- Abaixo de 10W
  FALSE -- Desligado por padrão
)
ON CONFLICT (tipo) DO NOTHING;

-- 3. Interrupção (IMEDIATO ao detectar StopTransaction inesperado)
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES (
  'interrupcao',
  '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} foi INTERROMPIDO.

⚡ Consumo parcial: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999',
  0,    -- Envia IMEDIATAMENTE
  NULL, -- Não usa threshold
  FALSE -- Desligado por padrão
)
ON CONFLICT (tipo) DO NOTHING;

-- ============================================
-- PASSO 3: Atualizar templates existentes
-- ============================================

-- Adicionar tempo_minutos = 0 para templates antigos (retrocompatibilidade)
UPDATE templates_notificacao 
SET tempo_minutos = 0 
WHERE tipo IN ('inicio', 'fim', 'erro', 'ocioso', 'disponivel')
  AND tempo_minutos IS NULL;

COMMIT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Mostrar todos os templates com as novas configurações
SELECT 
  tipo, 
  tempo_minutos,
  power_threshold_w,
  ativo,
  LEFT(mensagem, 50) || '...' AS mensagem_preview
FROM templates_notificacao 
ORDER BY 
  CASE tipo
    WHEN 'inicio' THEN 1
    WHEN 'inicio_ociosidade' THEN 2
    WHEN 'bateria_cheia' THEN 3
    WHEN 'interrupcao' THEN 4
    WHEN 'fim' THEN 5
    WHEN 'erro' THEN 6
    WHEN 'ocioso' THEN 7
    WHEN 'disponivel' THEN 8
  END;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- 
-- tipo               | tempo_minutos | power_threshold_w | ativo | mensagem_preview
-- -------------------+---------------+-------------------+-------+------------------
-- inicio             |             0 |            (null) | true  | 🔋 Olá {{nome}}!...
-- inicio_ociosidade  |             0 |                10 | false | ⚠️ Olá {{nome}}!...
-- bateria_cheia      |             3 |                10 | false | 🔋 Olá {{nome}}!...
-- interrupcao        |             0 |            (null) | false | ⚠️ Olá {{nome}}!...
-- fim                |             0 |            (null) | true  | ✅ Olá {{nome}}!...
-- erro               |             0 |            (null) | true  | ⚠️ Olá {{nome}}!...
-- ocioso             |             0 |            (null) | true  | 💤 Olá {{nome}}!...
-- disponivel         |             0 |            (null) | true  | ✨ Olá {{nome}}!...
-- 
-- ✅ SUCESSO: 8 templates configurados!
-- ✅ NOVOS: 3 tipos adicionados (inicio_ociosidade, bateria_cheia, interrupcao)
-- ✅ PADRÃO: Todos os novos desligados (ativo = false)

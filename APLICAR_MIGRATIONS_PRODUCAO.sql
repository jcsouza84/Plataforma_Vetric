-- ============================================================
-- MIGRATIONS PARA PRODUÇÃO - VETRIC Gran Marine
-- Data: 02/02/2026
-- Aplicar VIA RENDER DASHBOARD SHELL
-- ============================================================

-- IMPORTANTE: 
-- 1. Copie TODO este arquivo
-- 2. Cole no Shell do Render (Dashboard > Database > Shell)
-- 3. Execute e aguarde a confirmação

-- ============================================================
-- MIGRATION 1: Expandir templates_notificacao
-- ============================================================

-- Adicionar campos tempo_minutos e power_threshold_w
ALTER TABLE templates_notificacao 
  ADD COLUMN IF NOT EXISTS tempo_minutos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS power_threshold_w INTEGER DEFAULT NULL;

-- Inserir 3 novos tipos de notificação
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES 
  (
    'inicio_ociosidade',
    E'⚠️ Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{energia}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\n\nObrigado pela compreensão! 🙏',
    0,
    10,
    FALSE
  ),
  (
    'bateria_cheia',
    E'🔋 Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{energia}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nPor favor, remova o cabo para liberar o carregador.\n\nObrigado por utilizar nosso sistema! 🙏',
    3,
    10,
    FALSE
  ),
  (
    'interrupcao',
    E'⚠️ Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{energia}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\n\nTelefone: (82) 3333-4444\nWhatsApp: (82) 99999-9999',
    0,
    NULL,
    FALSE
  )
ON CONFLICT (tipo) DO NOTHING;

-- ============================================================
-- MIGRATION 2: Adicionar campos de rastreamento em carregamentos
-- ============================================================

ALTER TABLE carregamentos 
  ADD COLUMN IF NOT EXISTS ultimo_power_w INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contador_minutos_ocioso INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primeiro_ocioso_em TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ultimo_check_ociosidade TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notificacao_inicio_enviada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notificacao_interrupcao_enviada BOOLEAN DEFAULT FALSE;

-- ============================================================
-- VERIFICAÇÃO: Confirmar que tudo foi aplicado
-- ============================================================

-- Verificar templates (deve retornar 8 templates)
SELECT 
  tipo, 
  ativo, 
  tempo_minutos, 
  power_threshold_w,
  CASE 
    WHEN tempo_minutos IS NOT NULL THEN '✅'
    ELSE '❌'
  END as campo_tempo,
  CASE 
    WHEN power_threshold_w IS NOT NULL OR tipo IN ('inicio', 'interrupcao') THEN '✅'
    ELSE '❌'
  END as campo_threshold
FROM templates_notificacao 
ORDER BY 
  CASE tipo
    WHEN 'inicio' THEN 1
    WHEN 'inicio_ociosidade' THEN 2
    WHEN 'bateria_cheia' THEN 3
    WHEN 'interrupcao' THEN 4
    ELSE 5
  END;

-- Verificar se campos foram adicionados em carregamentos
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'carregamentos' 
  AND column_name IN (
    'ultimo_power_w',
    'contador_minutos_ocioso',
    'primeiro_ocioso_em',
    'ultimo_check_ociosidade',
    'notificacao_inicio_enviada',
    'notificacao_ociosidade_enviada',
    'notificacao_bateria_cheia_enviada',
    'notificacao_interrupcao_enviada'
  )
ORDER BY column_name;

-- Verificar contagem de moradores (deve ser 60)
SELECT 
  COUNT(*) as total_moradores,
  COUNT(CASE WHEN notificacoes_ativas = true THEN 1 END) as com_notificacoes_ativas,
  COUNT(CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 END) as com_telefone
FROM moradores;

-- ============================================================
-- FIM DAS MIGRATIONS
-- ============================================================
-- Se chegou até aqui sem erros, está tudo pronto! ✅

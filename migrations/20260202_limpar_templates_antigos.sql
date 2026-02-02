-- ============================================================================
-- MIGRATION: Limpar Templates Antigos e Manter Apenas os 4 Principais
-- Data: 02/02/2026
-- Descrição: Remove templates antigos e mantém apenas os 4 eventos principais
-- ============================================================================

-- PASSO 1: Remover templates antigos que não são mais usados
DELETE FROM templates_notificacao 
WHERE tipo IN ('inicio', 'fim', 'erro', 'ocioso', 'disponivel');

-- PASSO 2: Garantir que existem apenas os 4 templates principais
-- Se não existirem, serão criados. Se já existirem, serão atualizados.

-- Template: Início de Recarga
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES (
  'inicio_recarga',
  E'🔌 Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n⏰ Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!',
  0,
  NULL,
  TRUE
)
ON CONFLICT (tipo) DO UPDATE SET
  mensagem = EXCLUDED.mensagem,
  tempo_minutos = EXCLUDED.tempo_minutos,
  power_threshold_w = EXCLUDED.power_threshold_w,
  atualizado_em = NOW();

-- Template: Início de Ociosidade
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES (
  'inicio_ociosidade',
  E'⚠️ Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{energia}} kWh\n⏰ {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\n\nObrigado pela compreensão! 🙏',
  0,
  10,
  FALSE
)
ON CONFLICT (tipo) DO UPDATE SET
  mensagem = EXCLUDED.mensagem,
  tempo_minutos = EXCLUDED.tempo_minutos,
  power_threshold_w = EXCLUDED.power_threshold_w,
  atualizado_em = NOW();

-- Template: Bateria Cheia
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES (
  'bateria_cheia',
  E'🔋 Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{energia}} kWh\n⏱️ Duração: {{duracao}}\n💰 {{charger}}\n\nPor favor, remova o cabo para liberar o carregador.\n\nObrigado por utilizar nosso sistema! 🙏',
  3,
  10,
  FALSE
)
ON CONFLICT (tipo) DO UPDATE SET
  mensagem = EXCLUDED.mensagem,
  tempo_minutos = EXCLUDED.tempo_minutos,
  power_threshold_w = EXCLUDED.power_threshold_w,
  atualizado_em = NOW();

-- Template: Interrupção
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES (
  'interrupcao',
  E'⚠️ Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo até (a): {{energia}} kWh\n⏰ Duração: {{duracao}}\n💰 {{charger}}\n\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\n\nTelefone: (82) 3333-4444\nWhatsApp: (82) 99999-9999',
  0,
  NULL,
  FALSE
)
ON CONFLICT (tipo) DO UPDATE SET
  mensagem = EXCLUDED.mensagem,
  tempo_minutos = EXCLUDED.tempo_minutos,
  power_threshold_w = EXCLUDED.power_threshold_w,
  atualizado_em = NOW();

-- PASSO 3: Verificar resultado final
SELECT 
  id,
  tipo,
  LEFT(mensagem, 50) as mensagem_preview,
  tempo_minutos,
  power_threshold_w,
  ativo,
  atualizado_em
FROM templates_notificacao
ORDER BY 
  CASE tipo
    WHEN 'inicio_recarga' THEN 1
    WHEN 'inicio_ociosidade' THEN 2
    WHEN 'bateria_cheia' THEN 3
    WHEN 'interrupcao' THEN 4
    ELSE 5
  END;

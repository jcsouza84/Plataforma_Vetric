-- ============================================
-- AJUSTAR TEMPLATES PARA OS 4 EVENTOS PRINCIPAIS
-- Executar no banco LOCAL
-- ============================================

BEGIN;

-- 1. Adicionar campos novos na tabela templates_notificacao
ALTER TABLE templates_notificacao 
  ADD COLUMN IF NOT EXISTS tempo_minutos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS power_threshold_w INTEGER DEFAULT NULL;

-- 2. Remover os 5 templates antigos
DELETE FROM templates_notificacao WHERE tipo IN ('inicio', 'fim', 'erro', 'ocioso', 'disponivel');

-- 3. Inserir os 4 NOVOS templates baseados na análise da Saskya
INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
VALUES 
  -- ==========================================
  -- EVENTO 1: INÍCIO DE RECARGA
  -- ==========================================
  (
    'inicio_recarga',
    '🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!',
    3,     -- Aguarda 3 minutos após o StartTransaction
    NULL,  -- Não usa threshold de potência
    TRUE   -- ATIVO por padrão (já funciona)
  ),
  
  -- ==========================================
  -- EVENTO 2: INÍCIO DE OCIOSIDADE
  -- ==========================================
  (
    'inicio_ociosidade',
    '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} entrou em OCIOSIDADE.

⚡ Consumo até agora: {{energia}} kWh
🕐 {{data}}

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏',
    0,   -- IMEDIATO (0 minutos)
    10,  -- Considera ocioso quando Power < 10W
    FALSE -- DESLIGADO por padrão
  ),
  
  -- ==========================================
  -- EVENTO 3: BATERIA CHEIA
  -- ==========================================
  (
    'bateria_cheia',
    '🔋 Olá {{nome}}!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏',
    3,   -- Aguarda 3 minutos APÓS entrar em ociosidade
    10,  -- Considera ocioso quando Power < 10W
    FALSE -- DESLIGADO por padrão
  ),
  
  -- ==========================================
  -- EVENTO 4: INTERRUPÇÃO
  -- ==========================================
  (
    'interrupcao',
    '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} foi INTERROMPIDO.

⚡ Consumo parcial: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999',
    0,    -- IMEDIATO (quando detecta StopTransaction inesperado)
    NULL, -- Não usa threshold de potência
    FALSE -- DESLIGADO por padrão
  );

COMMIT;

-- Verificar se funcionou
SELECT 
  tipo,
  tempo_minutos,
  power_threshold_w,
  ativo,
  LENGTH(mensagem) as tamanho_mensagem
FROM templates_notificacao 
ORDER BY 
  CASE tipo
    WHEN 'inicio_recarga' THEN 1
    WHEN 'inicio_ociosidade' THEN 2
    WHEN 'bateria_cheia' THEN 3
    WHEN 'interrupcao' THEN 4
  END;

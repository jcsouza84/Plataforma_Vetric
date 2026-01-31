-- ================================================
-- Migration: Criar Tabela de Mensagens Configuráveis
-- Data: 31/01/2026
-- Autor: Sistema VETRIC
-- Descrição: Tabela para armazenar mensagens editáveis
--            de notificações WhatsApp
-- ================================================

BEGIN;

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  
  -- Tipo da mensagem
  tipo VARCHAR(50) UNIQUE NOT NULL,
  
  -- Conteúdo editável
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  
  -- Configurações
  tempo_minutos INTEGER DEFAULT 0,
  power_threshold_w INTEGER DEFAULT NULL,
  
  -- Status
  ativo BOOLEAN DEFAULT FALSE, -- ⚠️ Desligado por padrão
  
  -- Auditoria
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
    FALSE -- ⚠️ DESLIGADO
  ),
  
  -- 2. Início de Ociosidade
  (
    'inicio_ociosidade',
    '⚠️ Carregamento ocioso',
    E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{consumo}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\n\nObrigado pela compreensão! 🙏',
    0,
    10,
    FALSE -- ⚠️ DESLIGADO
  ),
  
  -- 3. Bateria Cheia
  (
    'bateria_cheia',
    '🔋 Carga completa!',
    E'Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nPor favor, remova o cabo para liberar o carregador.\n\nObrigado por utilizar nosso sistema! 🙏',
    3,
    10,
    FALSE -- ⚠️ DESLIGADO
  ),
  
  -- 4. Interrupção
  (
    'interrupcao',
    '⚠️ Carregamento interrompido',
    E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\n\nTelefone: (82) 3333-4444\nWhatsApp: (82) 99999-9999',
    0,
    NULL,
    FALSE -- ⚠️ DESLIGADO
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_tipo 
  ON mensagens_notificacoes(tipo);

CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_ativo 
  ON mensagens_notificacoes(ativo) WHERE ativo = TRUE;

-- Comentários
COMMENT ON TABLE mensagens_notificacoes IS 'Mensagens configuráveis para notificações WhatsApp';
COMMENT ON COLUMN mensagens_notificacoes.tipo IS 'Tipo: inicio_recarga, inicio_ociosidade, bateria_cheia, interrupcao';
COMMENT ON COLUMN mensagens_notificacoes.tempo_minutos IS 'Minutos a aguardar antes de enviar (0 = imediato)';
COMMENT ON COLUMN mensagens_notificacoes.power_threshold_w IS 'Potência em W para detectar ociosidade (apenas ociosidade/bateria)';
COMMENT ON COLUMN mensagens_notificacoes.ativo IS 'Se FALSE, não envia notificação (toggle OFF)';

COMMIT;

-- ================================================
-- Validação
-- ================================================
SELECT 
  tipo, 
  titulo, 
  tempo_minutos, 
  power_threshold_w, 
  ativo 
FROM mensagens_notificacoes 
ORDER BY id;


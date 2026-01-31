-- ============================================
-- MIGRATION 1: Criar Tabela mensagens_notificacoes
-- Execute este SQL no console do Render
-- ============================================

BEGIN;

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

INSERT INTO mensagens_notificacoes (tipo, titulo, corpo, tempo_minutos, power_threshold_w, ativo) VALUES
('inicio_recarga', '🔋 Início de Carregamento', E'Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n🕐 Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!', 3, NULL, FALSE),
('inicio_ociosidade', '⚠️ Carregamento ocioso', E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{consumo}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\n\nObrigado pela compreensão! 🙏', 0, 10, FALSE),
('bateria_cheia', '🔋 Carga completa!', E'Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nPor favor, remova o cabo para liberar o carregador.\n\nObrigado por utilizar nosso sistema! 🙏', 3, 10, FALSE),
('interrupcao', '⚠️ Carregamento interrompido', E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\n\nTelefone: (82) 3333-4444\nWhatsApp: (82) 99999-9999', 0, NULL, FALSE);

CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_tipo ON mensagens_notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_ativo ON mensagens_notificacoes(ativo) WHERE ativo = TRUE;

COMMIT;

SELECT tipo, titulo, tempo_minutos, power_threshold_w, ativo FROM mensagens_notificacoes ORDER BY id;


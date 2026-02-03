-- Migration: Sistema de Logs Visuais
-- Descrição: Cria tabela para armazenar logs do sistema por 24 horas
-- Data: 03/02/2026

-- ============================================================================
-- TABELA: logs_sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs_sistema (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'CVE_API', 'POLLING', 'NOTIFICACAO', 'IDENTIFICACAO', 'ERRO', 'SISTEMA'
  nivel VARCHAR(20) NOT NULL, -- 'INFO', 'WARN', 'ERROR', 'SUCCESS', 'DEBUG'
  carregador_uuid VARCHAR(50), -- UUID do carregador (se aplicável)
  carregador_nome VARCHAR(100), -- Nome do carregador para facilitar
  morador_id INTEGER REFERENCES moradores(id) ON DELETE SET NULL,
  morador_nome VARCHAR(200), -- Denormalizado para performance
  evento VARCHAR(100) NOT NULL, -- 'HEARTBEAT', 'STATUS_CHANGE', 'START_CHARGE', 'STOP_CHARGE', 'NOTIFICATION_SENT', etc
  mensagem TEXT NOT NULL, -- Mensagem descritiva
  dados_json JSONB, -- Dados adicionais em JSON
  duracao_ms INTEGER, -- Duração da operação em ms (se aplicável)
  sucesso BOOLEAN DEFAULT true, -- Se a operação teve sucesso
  erro_detalhes TEXT -- Detalhes do erro (se houver)
);

-- Índices para performance
CREATE INDEX idx_logs_timestamp ON logs_sistema (timestamp DESC);
CREATE INDEX idx_logs_tipo ON logs_sistema (tipo);
CREATE INDEX idx_logs_nivel ON logs_sistema (nivel);
CREATE INDEX idx_logs_carregador ON logs_sistema (carregador_uuid) WHERE carregador_uuid IS NOT NULL;
CREATE INDEX idx_logs_morador ON logs_sistema (morador_id) WHERE morador_id IS NOT NULL;
CREATE INDEX idx_logs_evento ON logs_sistema (evento);
CREATE INDEX idx_logs_busca ON logs_sistema (timestamp DESC, tipo, nivel);

-- Índice GIN para busca rápida em JSON
CREATE INDEX idx_logs_dados_json ON logs_sistema USING GIN (dados_json);

-- ============================================================================
-- FUNÇÃO: Limpar logs antigos (> 24 horas)
-- ============================================================================
CREATE OR REPLACE FUNCTION limpar_logs_antigos()
RETURNS INTEGER AS $$
DECLARE
  linhas_deletadas INTEGER;
BEGIN
  DELETE FROM logs_sistema 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS linhas_deletadas = ROW_COUNT;
  
  RETURN linhas_deletadas;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- JOB AUTOMÁTICO: Limpar logs a cada hora
-- ============================================================================
-- Nota: No Render/Supabase, isso pode ser feito via cron job externo
-- ou chamando a função periodicamente do backend

COMMENT ON TABLE logs_sistema IS 'Logs do sistema com TTL de 24 horas para monitoramento visual';
COMMENT ON COLUMN logs_sistema.tipo IS 'Categoria do log: CVE_API, POLLING, NOTIFICACAO, IDENTIFICACAO, ERRO, SISTEMA';
COMMENT ON COLUMN logs_sistema.nivel IS 'Nível de severidade: INFO, WARN, ERROR, SUCCESS, DEBUG';
COMMENT ON COLUMN logs_sistema.evento IS 'Tipo específico do evento ocorrido';
COMMENT ON COLUMN logs_sistema.dados_json IS 'Dados adicionais em formato JSON para análise detalhada';
COMMENT ON FUNCTION limpar_logs_antigos() IS 'Remove logs com mais de 24 horas';

-- ============================================================================
-- VIEW: Estatísticas de logs por carregador
-- ============================================================================
CREATE OR REPLACE VIEW v_logs_stats_carregador AS
SELECT 
  carregador_uuid,
  carregador_nome,
  COUNT(*) as total_eventos,
  COUNT(*) FILTER (WHERE nivel = 'ERROR') as total_erros,
  COUNT(*) FILTER (WHERE nivel = 'WARN') as total_avisos,
  COUNT(*) FILTER (WHERE tipo = 'IDENTIFICACAO' AND sucesso = true) as identificacoes_sucesso,
  COUNT(*) FILTER (WHERE tipo = 'IDENTIFICACAO' AND sucesso = false) as identificacoes_falha,
  COUNT(*) FILTER (WHERE tipo = 'NOTIFICACAO' AND sucesso = true) as notificacoes_enviadas,
  MAX(timestamp) as ultimo_evento,
  MIN(timestamp) FILTER (WHERE timestamp > NOW() - INTERVAL '1 hour') as primeiro_evento_hora
FROM logs_sistema
WHERE carregador_uuid IS NOT NULL
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY carregador_uuid, carregador_nome;

COMMENT ON VIEW v_logs_stats_carregador IS 'Estatísticas de logs por carregador nas últimas 24 horas';

-- ============================================================================
-- VIEW: Logs recentes (últimas 100 entradas)
-- ============================================================================
CREATE OR REPLACE VIEW v_logs_recentes AS
SELECT 
  id,
  timestamp,
  tipo,
  nivel,
  carregador_nome,
  morador_nome,
  evento,
  mensagem,
  sucesso,
  duracao_ms
FROM logs_sistema
ORDER BY timestamp DESC
LIMIT 100;

COMMENT ON VIEW v_logs_recentes IS 'Últimas 100 entradas de log para visualização rápida';

-- ============================================================================
-- FUNCTION: Inserir log (helper para facilitar uso)
-- ============================================================================
CREATE OR REPLACE FUNCTION inserir_log(
  p_tipo VARCHAR(50),
  p_nivel VARCHAR(20),
  p_evento VARCHAR(100),
  p_mensagem TEXT,
  p_carregador_uuid VARCHAR(50) DEFAULT NULL,
  p_carregador_nome VARCHAR(100) DEFAULT NULL,
  p_morador_id INTEGER DEFAULT NULL,
  p_morador_nome VARCHAR(200) DEFAULT NULL,
  p_dados_json JSONB DEFAULT NULL,
  p_duracao_ms INTEGER DEFAULT NULL,
  p_sucesso BOOLEAN DEFAULT true,
  p_erro_detalhes TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  log_id BIGINT;
BEGIN
  INSERT INTO logs_sistema (
    tipo, nivel, evento, mensagem,
    carregador_uuid, carregador_nome,
    morador_id, morador_nome,
    dados_json, duracao_ms, sucesso, erro_detalhes
  ) VALUES (
    p_tipo, p_nivel, p_evento, p_mensagem,
    p_carregador_uuid, p_carregador_nome,
    p_morador_id, p_morador_nome,
    p_dados_json, p_duracao_ms, p_sucesso, p_erro_detalhes
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION inserir_log IS 'Helper function para inserir logs de forma simplificada';

-- ============================================================================
-- Dados iniciais: Log de criação do sistema
-- ============================================================================
INSERT INTO logs_sistema (tipo, nivel, evento, mensagem, sucesso)
VALUES ('SISTEMA', 'INFO', 'MIGRATION', 'Sistema de logs visuais criado com sucesso', true);

-- ============================================================================
-- Relatório final
-- ============================================================================
SELECT 
  'Logs Sistema' as tabela,
  COUNT(*) as registros
FROM logs_sistema;

/**
 * Migration 003: Criar tabela de carregamentos
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS carregamentos (
      id SERIAL PRIMARY KEY,
      morador_id INTEGER REFERENCES moradores(id) ON DELETE SET NULL,
      charger_uuid VARCHAR(100) NOT NULL,
      charger_name VARCHAR(255) NOT NULL,
      connector_id INTEGER NOT NULL,
      status VARCHAR(50) NOT NULL,
      inicio TIMESTAMP NOT NULL,
      fim TIMESTAMP,
      energia_kwh DECIMAL(10, 2),
      duracao_minutos INTEGER,
      notificacao_inicio_enviada BOOLEAN DEFAULT false,
      notificacao_fim_enviada BOOLEAN DEFAULT false,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_carregamentos_morador_id ON carregamentos(morador_id);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_charger_uuid ON carregamentos(charger_uuid);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_status ON carregamentos(status);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_inicio ON carregamentos(inicio);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_fim ON carregamentos(fim);
    
    COMMENT ON TABLE carregamentos IS 'Histórico de carregamentos de veículos elétricos';
    COMMENT ON COLUMN carregamentos.status IS 'Status do carregamento: ATIVO, CONCLUIDO, ERRO, etc';
    COMMENT ON COLUMN carregamentos.energia_kwh IS 'Energia consumida em kWh';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS carregamentos CASCADE;
  `);
};

export const name = '003_create_carregamentos';
export const description = 'Criar tabela de histórico de carregamentos';






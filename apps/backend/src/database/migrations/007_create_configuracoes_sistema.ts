/**
 * Migration 007: Criar tabela de configurações do sistema
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS configuracoes_sistema (
      id SERIAL PRIMARY KEY,
      chave VARCHAR(100) UNIQUE NOT NULL,
      valor TEXT,
      descricao TEXT,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_por UUID REFERENCES usuarios(id)
    );

    CREATE INDEX IF NOT EXISTS idx_configuracoes_sistema_chave ON configuracoes_sistema(chave);
    
    COMMENT ON TABLE configuracoes_sistema IS 'Configurações dinâmicas do sistema';
    COMMENT ON COLUMN configuracoes_sistema.chave IS 'Chave única da configuração';
    COMMENT ON COLUMN configuracoes_sistema.valor IS 'Valor da configuração (JSON ou texto)';
  `);

  // Inserir configurações padrão Evolution API
  await pool.query(`
    INSERT INTO configuracoes_sistema (chave, valor, descricao)
    VALUES
      ('evolution_api_url', '', 'URL base da Evolution API'),
      ('evolution_api_key', '', 'API Key da Evolution API'),
      ('evolution_instance', '', 'Nome da instância Evolution API'),
      ('tarifa_kwh', '0.85', 'Tarifa por kWh em reais'),
      ('polling_interval', '10000', 'Intervalo de polling em ms')
    ON CONFLICT (chave) DO NOTHING;
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS configuracoes_sistema CASCADE;
  `);
};

export const name = '007_create_configuracoes_sistema';
export const description = 'Criar tabela de configurações do sistema';


/**
 * Migration 005: Criar tabela de relatórios
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS relatorios (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(200) NOT NULL,
      arquivo_nome VARCHAR(255) NOT NULL,
      arquivo_path VARCHAR(500) NOT NULL,
      mes INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      descricao TEXT,
      tamanho_kb INTEGER,
      uploaded_por UUID REFERENCES usuarios(id),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_relatorios_mes_ano ON relatorios(ano, mes);
    CREATE INDEX IF NOT EXISTS idx_relatorios_uploaded_por ON relatorios(uploaded_por);
    
    COMMENT ON TABLE relatorios IS 'Relatórios mensais de consumo e uso dos carregadores';
    COMMENT ON COLUMN relatorios.mes IS 'Mês do relatório (1-12)';
    COMMENT ON COLUMN relatorios.ano IS 'Ano do relatório';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS relatorios CASCADE;
  `);
};

export const name = '005_create_relatorios';
export const description = 'Criar tabela de relatórios mensais';


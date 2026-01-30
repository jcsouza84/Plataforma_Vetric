/**
 * Migration 009: Criar tabela de empreendimentos para módulo de relatórios
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS empreendimentos_relatorio (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(255) NOT NULL,
      logo_url TEXT,
      sistema_carregamento VARCHAR(50) DEFAULT 'CVE_PRO' NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_empreendimentos_relatorio_nome ON empreendimentos_relatorio(nome);
    
    COMMENT ON TABLE empreendimentos_relatorio IS 'Empreendimentos do módulo de relatórios (isolado do sistema principal)';
    COMMENT ON COLUMN empreendimentos_relatorio.sistema_carregamento IS 'CVE_PRO ou WEMOB';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS empreendimentos_relatorio CASCADE;
  `);
};

export const name = '009_create_empreendimentos_relatorio';
export const description = 'Criar tabela de empreendimentos para módulo de relatórios';


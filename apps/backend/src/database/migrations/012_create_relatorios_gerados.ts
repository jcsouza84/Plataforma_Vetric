/**
 * Migration 012: Criar tabela de relatórios gerados
 * 🆕 Com campo dadosCompletos para correção do bug do localStorage
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS relatorios_gerados (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      empreendimento_id UUID NOT NULL,
      mes_ano VARCHAR(10) NOT NULL,
      pdf_url TEXT DEFAULT '',
      total_recargas INTEGER NOT NULL,
      total_consumo DECIMAL(10, 2) NOT NULL,
      total_valor DECIMAL(10, 2) NOT NULL,
      dados_completos JSONB NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_empreendimento_relatorio FOREIGN KEY (empreendimento_id)
        REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_relatorios_gerados_empreendimento ON relatorios_gerados(empreendimento_id);
    CREATE INDEX IF NOT EXISTS idx_relatorios_gerados_mes_ano ON relatorios_gerados(mes_ano);
    CREATE INDEX IF NOT EXISTS idx_relatorios_gerados_criado_em ON relatorios_gerados(criado_em DESC);
    
    COMMENT ON TABLE relatorios_gerados IS 'Relatórios gerados com snapshot completo dos dados (correção do bug localStorage)';
    COMMENT ON COLUMN relatorios_gerados.dados_completos IS 'JSON completo: resumos, gráficos, transações, config (imutável)';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS relatorios_gerados CASCADE;
  `);
};

export const name = '012_create_relatorios_gerados';
export const description = 'Criar tabela de relatórios gerados com snapshot completo';


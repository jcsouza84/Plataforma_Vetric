/**
 * Migration 011: Criar tabela de usuários para módulo de relatórios
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios_relatorio (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      empreendimento_id UUID NOT NULL,
      nome VARCHAR(255) NOT NULL,
      unidade VARCHAR(50) NOT NULL,
      torre VARCHAR(50) NOT NULL,
      telefone VARCHAR(50),
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_empreendimento_usuario FOREIGN KEY (empreendimento_id)
        REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_usuarios_relatorio_empreendimento ON usuarios_relatorio(empreendimento_id);
    CREATE INDEX IF NOT EXISTS idx_usuarios_relatorio_nome ON usuarios_relatorio(nome);
    CREATE INDEX IF NOT EXISTS idx_usuarios_relatorio_tags ON usuarios_relatorio USING GIN (tags);
    
    COMMENT ON TABLE usuarios_relatorio IS 'Usuários/moradores do módulo de relatórios (suporta múltiplas TAGs)';
    COMMENT ON COLUMN usuarios_relatorio.tags IS 'Array JSON de TAGs de carregamento: ["TAG1", "TAG2"]';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS usuarios_relatorio CASCADE;
  `);
};

export const name = '011_create_usuarios_relatorio';
export const description = 'Criar tabela de usuários para módulo de relatórios';


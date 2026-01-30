/**
 * Migration 010: Criar tabela de configurações tarifárias
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS configuracoes_tarifarias (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      empreendimento_id UUID NOT NULL UNIQUE,
      tarifa_ponta DECIMAL(10, 2) DEFAULT 3.08 NOT NULL,
      tarifa_fora_ponta DECIMAL(10, 2) DEFAULT 0.53 NOT NULL,
      ponta_inicio_hora INTEGER DEFAULT 17 NOT NULL,
      ponta_inicio_minuto INTEGER DEFAULT 30 NOT NULL,
      ponta_fim_hora INTEGER DEFAULT 20 NOT NULL,
      ponta_fim_minuto INTEGER DEFAULT 29 NOT NULL,
      ponta_segunda BOOLEAN DEFAULT true NOT NULL,
      ponta_terca BOOLEAN DEFAULT true NOT NULL,
      ponta_quarta BOOLEAN DEFAULT true NOT NULL,
      ponta_quinta BOOLEAN DEFAULT true NOT NULL,
      ponta_sexta BOOLEAN DEFAULT true NOT NULL,
      ponta_sabado BOOLEAN DEFAULT false NOT NULL,
      ponta_domingo BOOLEAN DEFAULT false NOT NULL,
      limite_energia_max_kwh DECIMAL(10, 2) DEFAULT 50.00 NOT NULL,
      limite_ociosidade_min INTEGER DEFAULT 15 NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_empreendimento_config FOREIGN KEY (empreendimento_id)
        REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_configuracoes_tarifarias_empreendimento ON configuracoes_tarifarias(empreendimento_id);
    
    COMMENT ON TABLE configuracoes_tarifarias IS 'Configurações de tarifação ponta/fora ponta por empreendimento';
    COMMENT ON COLUMN configuracoes_tarifarias.limite_ociosidade_min IS 'Minutos mínimos para contabilizar ocorrência de ociosidade';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS configuracoes_tarifarias CASCADE;
  `);
};

export const name = '010_create_configuracoes_tarifarias';
export const description = 'Criar tabela de configurações tarifárias';


/**
 * 🔧 Migration: Converter UUIDs para TEXT (CUID do Prisma)
 */

import { Pool } from 'pg';

export const name = '013_fix_uuid_to_text';
export const description = 'Converter colunas UUID para TEXT para suportar CUIDs do Prisma';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    -- 1. Remover Foreign Keys
    ALTER TABLE configuracoes_tarifarias DROP CONSTRAINT IF EXISTS fk_empreendimento_config;
    ALTER TABLE usuarios_relatorio DROP CONSTRAINT IF EXISTS fk_empreendimento_usuario;
    ALTER TABLE relatorios_gerados DROP CONSTRAINT IF EXISTS fk_empreendimento_relatorio;

    -- 2. Alterar tipos para TEXT
    ALTER TABLE empreendimentos_relatorio ALTER COLUMN id TYPE TEXT;

    ALTER TABLE configuracoes_tarifarias 
      ALTER COLUMN id TYPE TEXT,
      ALTER COLUMN empreendimento_id TYPE TEXT;

    ALTER TABLE usuarios_relatorio 
      ALTER COLUMN id TYPE TEXT,
      ALTER COLUMN empreendimento_id TYPE TEXT;

    ALTER TABLE relatorios_gerados 
      ALTER COLUMN id TYPE TEXT,
      ALTER COLUMN empreendimento_id TYPE TEXT;

    -- 3. Recriar Foreign Keys
    ALTER TABLE configuracoes_tarifarias
      ADD CONSTRAINT fk_empreendimento_config
      FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE;

    ALTER TABLE usuarios_relatorio
      ADD CONSTRAINT fk_empreendimento_usuario
      FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE;

    ALTER TABLE relatorios_gerados
      ADD CONSTRAINT fk_empreendimento_relatorio
      FOREIGN KEY (empreendimento_id) REFERENCES empreendimentos_relatorio(id) ON DELETE CASCADE;
  `);
}

export async function down(pool: Pool): Promise<void> {
  await pool.query(`
    -- Reverter para UUID (não recomendado se já houver dados)
    ALTER TABLE empreendimentos_relatorio
      ALTER COLUMN id TYPE UUID USING id::UUID;

    ALTER TABLE configuracoes_tarifarias
      ALTER COLUMN id TYPE UUID USING id::UUID,
      ALTER COLUMN empreendimento_id TYPE UUID USING empreendimento_id::UUID;

    ALTER TABLE usuarios_relatorio
      ALTER COLUMN id TYPE UUID USING id::UUID,
      ALTER COLUMN empreendimento_id TYPE UUID USING empreendimento_id::UUID;

    ALTER TABLE relatorios_gerados
      ALTER COLUMN id TYPE UUID USING id::UUID,
      ALTER COLUMN empreendimento_id TYPE UUID USING empreendimento_id::UUID;
  `);
}


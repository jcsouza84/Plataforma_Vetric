/**
 * Migration 008: Criar tabela de mapeamento ocppTagPk -> moradores
 * Usado quando a API CVE retorna ocppTagPk mas não retorna ocppIdTag
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tag_pk_mapping (
      id SERIAL PRIMARY KEY,
      ocpp_tag_pk INTEGER NOT NULL UNIQUE,
      morador_id INTEGER NOT NULL REFERENCES moradores(id) ON DELETE CASCADE,
      observacao TEXT,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tag_pk_mapping_ocpp_tag_pk ON tag_pk_mapping(ocpp_tag_pk);
    CREATE INDEX IF NOT EXISTS idx_tag_pk_mapping_morador_id ON tag_pk_mapping(morador_id);
    
    COMMENT ON TABLE tag_pk_mapping IS 'Mapeamento manual entre ocppTagPk (API CVE) e moradores (quando ocppIdTag não é retornado)';
    COMMENT ON COLUMN tag_pk_mapping.ocpp_tag_pk IS 'Primary Key da tag no sistema CVE-PRO';
    COMMENT ON COLUMN tag_pk_mapping.morador_id IS 'ID do morador associado';
    COMMENT ON COLUMN tag_pk_mapping.observacao IS 'Observações sobre o mapeamento';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS tag_pk_mapping CASCADE;
  `);
};

export const name = '008_create_tag_pk_mapping';
export const description = 'Criar tabela de mapeamento ocppTagPk para moradores';




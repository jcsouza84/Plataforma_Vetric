/**
 * Migration 002: Criar tabela de moradores
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS moradores (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      apartamento VARCHAR(50) NOT NULL,
      telefone VARCHAR(20),
      tag_rfid VARCHAR(100) UNIQUE NOT NULL,
      notificacoes_ativas BOOLEAN DEFAULT false,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_moradores_tag_rfid ON moradores(tag_rfid);
    CREATE INDEX IF NOT EXISTS idx_moradores_apartamento ON moradores(apartamento);
    
    COMMENT ON TABLE moradores IS 'Moradores cadastrados no condomínio';
    COMMENT ON COLUMN moradores.tag_rfid IS 'Tag RFID do morador (ocppIdTag do CVE)';
    COMMENT ON COLUMN moradores.notificacoes_ativas IS 'Se o morador aceita receber notificações via WhatsApp';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS moradores CASCADE;
  `);
};

export const name = '002_create_moradores';
export const description = 'Criar tabela de moradores do condomínio';






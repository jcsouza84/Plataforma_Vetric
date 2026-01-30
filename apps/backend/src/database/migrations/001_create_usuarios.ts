/**
 * Migration 001: Criar tabela de usuários (autenticação)
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      nome VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'CLIENTE')),
      ativo BOOLEAN DEFAULT true NOT NULL,
      ultimo_acesso TIMESTAMP,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    
    COMMENT ON TABLE usuarios IS 'Usuários do sistema VETRIC Dashboard';
    COMMENT ON COLUMN usuarios.role IS 'ADMIN: acesso total | CLIENTE: acesso limitado';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS usuarios CASCADE;
  `);
};

export const name = '001_create_usuarios';
export const description = 'Criar tabela de usuários com autenticação JWT';




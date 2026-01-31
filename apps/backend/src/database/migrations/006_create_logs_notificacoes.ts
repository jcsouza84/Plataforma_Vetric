/**
 * Migration 006: Criar tabela de logs de notificações
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS logs_notificacoes (
      id SERIAL PRIMARY KEY,
      morador_id INTEGER REFERENCES moradores(id),
      tipo VARCHAR(50) NOT NULL,
      mensagem_enviada TEXT NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL,
      erro TEXT,
      enviado_em TIMESTAMP,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_logs_notificacoes_morador_id ON logs_notificacoes(morador_id);
    CREATE INDEX IF NOT EXISTS idx_logs_notificacoes_status ON logs_notificacoes(status);
    CREATE INDEX IF NOT EXISTS idx_logs_notificacoes_criado_em ON logs_notificacoes(criado_em);
    
    COMMENT ON TABLE logs_notificacoes IS 'Log de todas as notificações enviadas via WhatsApp';
    COMMENT ON COLUMN logs_notificacoes.status IS 'Status do envio: SUCESSO, ERRO, PENDENTE';
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS logs_notificacoes CASCADE;
  `);
};

export const name = '006_create_logs_notificacoes';
export const description = 'Criar tabela de logs de notificações enviadas';






/**
 * Migration 015: Adicionar campos de rastreamento em carregamentos
 * Data: 02/02/2026
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  console.log('🔄 Adicionando campos de rastreamento em carregamentos...');

  await pool.query(`
    ALTER TABLE carregamentos 
      ADD COLUMN IF NOT EXISTS ultimo_power_w INTEGER DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS contador_minutos_ocioso INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS primeiro_ocioso_em TIMESTAMP DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS power_zerou_em TIMESTAMP DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS interrupcao_detectada BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS tipo_finalizacao VARCHAR(50) DEFAULT NULL;
  `);
  console.log('✅ Campos de rastreamento adicionados');

  // Criar índices para performance
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_carregamentos_power_tracking 
      ON carregamentos(ultimo_power_w, primeiro_ocioso_em) 
      WHERE fim IS NULL;

    CREATE INDEX IF NOT EXISTS idx_carregamentos_notificacoes_eventos
      ON carregamentos(
        notificacao_ociosidade_enviada, 
        notificacao_bateria_cheia_enviada
      ) 
      WHERE fim IS NULL;
  `);
  console.log('✅ Índices criados');
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    ALTER TABLE carregamentos 
      DROP COLUMN IF EXISTS ultimo_power_w,
      DROP COLUMN IF EXISTS contador_minutos_ocioso,
      DROP COLUMN IF EXISTS primeiro_ocioso_em,
      DROP COLUMN IF EXISTS power_zerou_em,
      DROP COLUMN IF EXISTS interrupcao_detectada,
      DROP COLUMN IF EXISTS notificacao_ociosidade_enviada,
      DROP COLUMN IF EXISTS notificacao_bateria_cheia_enviada,
      DROP COLUMN IF EXISTS tipo_finalizacao;

    DROP INDEX IF EXISTS idx_carregamentos_power_tracking;
    DROP INDEX IF EXISTS idx_carregamentos_notificacoes_eventos;
  `);
};

export const name = '015_adicionar_campos_rastreamento_carregamentos';
export const description = 'Adicionar campos para rastreamento de eventos de notificação';

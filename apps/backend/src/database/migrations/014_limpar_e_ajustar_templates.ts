/**
 * Migration 014: Limpar templates antigos e manter apenas os 4 eventos principais
 * Data: 02/02/2026
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  console.log('🔄 Limpando templates antigos e ajustando para 4 eventos...');

  // 1. Remover templates antigos
  await pool.query(`
    DELETE FROM templates_notificacao 
    WHERE tipo IN ('inicio', 'fim', 'erro', 'ocioso', 'disponivel');
  `);
  console.log('✅ Templates antigos removidos');

  // 2. Atualizar/Inserir os 4 templates principais
  await pool.query(`
    INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
    VALUES 
      (
        'inicio_recarga',
        '🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!',
        3,
        NULL,
        TRUE
      ),
      (
        'inicio_ociosidade',
        '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} entrou em OCIOSIDADE.

⚡ Consumo até agora: {{energia}} kWh
🕐 {{data}}

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏',
        0,
        10,
        FALSE
      ),
      (
        'bateria_cheia',
        '🔋 Olá {{nome}}!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏',
        3,
        10,
        FALSE
      ),
      (
        'interrupcao',
        '⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} foi INTERROMPIDO.

⚡ Consumo parcial: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999',
        0,
        NULL,
        FALSE
      )
    ON CONFLICT (tipo) DO UPDATE SET
      mensagem = EXCLUDED.mensagem,
      tempo_minutos = EXCLUDED.tempo_minutos,
      power_threshold_w = EXCLUDED.power_threshold_w,
      ativo = EXCLUDED.ativo;
  `);
  console.log('✅ 4 templates principais configurados');
};

export const down = async (pool: Pool): Promise<void> => {
  // Não há rollback - manter templates
  console.log('⚠️  Rollback não implementado para esta migration');
};

export const name = '014_limpar_e_ajustar_templates';
export const description = 'Limpar templates antigos e manter apenas os 4 eventos principais';

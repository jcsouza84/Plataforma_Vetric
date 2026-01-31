/**
 * Migration 004: Criar tabela de templates de notificação
 */

import { Pool } from 'pg';

export const up = async (pool: Pool): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS templates_notificacao (
      id SERIAL PRIMARY KEY,
      tipo VARCHAR(50) UNIQUE NOT NULL,
      mensagem TEXT NOT NULL,
      ativo BOOLEAN DEFAULT true,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    COMMENT ON TABLE templates_notificacao IS 'Templates de mensagens para notificações via WhatsApp';
    COMMENT ON COLUMN templates_notificacao.tipo IS 'Tipo da notificação: inicio, fim, erro, ocioso, disponivel';
    COMMENT ON COLUMN templates_notificacao.mensagem IS 'Mensagem com placeholders: {{nome}}, {{charger}}, etc';
  `);

  // Inserir templates padrão
  await pool.query(`
    INSERT INTO templates_notificacao (tipo, mensagem, ativo)
    VALUES 
      ('inicio', '🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!', true),
      
      ('fim', '✅ Olá {{nome}}!

Seu carregamento foi concluído com sucesso!

⚡ Energia consumida: {{energia}} kWh
⏱️ Duração: {{duracao}}
💰 Custo estimado: R$ {{custo}}

🔌 O carregador {{charger}} está novamente disponível.

Obrigado por utilizar nosso sistema!', true),
      
      ('erro', '⚠️ Olá {{nome}}!

Detectamos um problema no seu carregamento:

🔌 Carregador: {{charger}}
❌ Erro: {{erro}}
🕐 Horário: {{data}}
🏢 Apartamento: {{apartamento}}

Por favor, entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999', true),
      
      ('ocioso', '💤 Olá {{nome}}!

Seu carregador está ocioso há {{tempo}}.

🔌 Carregador: {{charger}}
📍 Local: {{localizacao}}

Se o carregamento já terminou, por favor libere a vaga para outros moradores.

Obrigado pela compreensão! 🙏', true),
      
      ('disponivel', '✨ Olá {{nome}}!

O carregador {{charger}} está disponível!

📍 Local: {{localizacao}}
🏢 Próximo ao seu apartamento: {{apartamento}}

Aproveite para carregar seu veículo elétrico!', true)
    ON CONFLICT (tipo) DO NOTHING;
  `);
};

export const down = async (pool: Pool): Promise<void> => {
  await pool.query(`
    DROP TABLE IF EXISTS templates_notificacao CASCADE;
  `);
};

export const name = '004_create_templates_notificacao';
export const description = 'Criar tabela de templates de notificação WhatsApp';






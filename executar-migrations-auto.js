#!/usr/bin/env node

/**
 * 🚀 EXECUTAR MIGRATIONS - AUTOMÁTICO
 */

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\n❌ DATABASE_URL não encontrada!');
  console.log('📌 Use: DATABASE_URL="sua_url" node executar-migrations-auto.js\n');
  process.exit(1);
}

console.log('\n🗃️  EXECUTANDO MIGRATIONS - Sistema VETRIC\n');
console.log('='.repeat(60));

async function executar() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n🔄 Conectando ao banco de dados...\n');
    await client.connect();
    console.log('✅ Conectado ao banco!\n');
    
    // ========================================
    // MIGRATION 1: Criar tabela mensagens_notificacoes
    // ========================================
    console.log('📝 Migration 1/2: Criando tabela "mensagens_notificacoes"...\n');
    
    await client.query(`
      BEGIN;
      
      CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) UNIQUE NOT NULL,
        titulo TEXT NOT NULL,
        corpo TEXT NOT NULL,
        tempo_minutos INTEGER DEFAULT 0,
        power_threshold_w INTEGER DEFAULT NULL,
        ativo BOOLEAN DEFAULT FALSE,
        criado_em TIMESTAMP DEFAULT NOW(),
        atualizado_em TIMESTAMP DEFAULT NOW()
      );
      
      INSERT INTO mensagens_notificacoes (tipo, titulo, corpo, tempo_minutos, power_threshold_w, ativo) 
      VALUES
      ('inicio_recarga', '🔋 Início de Carregamento', E'Olá {{nome}}!\\n\\nSeu carregamento foi iniciado no {{charger}}.\\n\\n📍 Local: {{localizacao}}\\n🕐 Início: {{data}}\\n🏢 Apartamento: {{apartamento}}\\n\\nAcompanhe pelo dashboard VETRIC Gran Marine!', 3, NULL, FALSE),
      ('inicio_ociosidade', '⚠️ Carregamento ocioso', E'Olá {{nome}}!\\n\\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\\n\\n⚡ Consumo até agora: {{consumo}} kWh\\n🕐 {{data}}\\n\\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\\n\\nObrigado pela compreensão! 🙏', 0, 10, FALSE),
      ('bateria_cheia', '🔋 Carga completa!', E'Olá {{nome}}!\\n\\nSeu veículo está com a bateria CARREGADA! 🎉\\n\\n⚡ Consumo total: {{consumo}} kWh\\n⏱️ Duração: {{duracao}}\\n📍 {{charger}}\\n\\nPor favor, remova o cabo para liberar o carregador.\\n\\nObrigado por utilizar nosso sistema! 🙏', 3, 10, FALSE),
      ('interrupcao', '⚠️ Carregamento interrompido', E'Olá {{nome}}!\\n\\nSeu carregamento no {{charger}} foi INTERROMPIDO.\\n\\n⚡ Consumo parcial: {{consumo}} kWh\\n⏱️ Duração: {{duracao}}\\n📍 {{charger}}\\n\\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\\n\\nTelefone: (82) 3333-4444\\nWhatsApp: (82) 99999-9999', 0, NULL, FALSE)
      ON CONFLICT (tipo) DO NOTHING;
      
      CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_tipo ON mensagens_notificacoes(tipo);
      CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_ativo ON mensagens_notificacoes(ativo) WHERE ativo = TRUE;
      
      COMMIT;
    `);
    
    const mensagens = await client.query(`
      SELECT tipo, titulo, tempo_minutos, power_threshold_w, ativo 
      FROM mensagens_notificacoes 
      ORDER BY id;
    `);
    
    console.log(`✅ Tabela criada com ${mensagens.rows.length} mensagens:\n`);
    mensagens.rows.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.titulo} (${msg.ativo ? '🟢 ATIVO' : '🔴 DESLIGADO'})`);
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // ========================================
    // MIGRATION 2: Adicionar campos em carregamentos
    // ========================================
    console.log('📝 Migration 2/2: Adicionando campos em "carregamentos"...\n');
    
    await client.query(`
      BEGIN;
      
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS ultimo_power_w INTEGER DEFAULT NULL;
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS contador_minutos_ocioso INTEGER DEFAULT 0;
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS primeiro_ocioso_em TIMESTAMP DEFAULT NULL;
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS power_zerou_em TIMESTAMP DEFAULT NULL;
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS interrupcao_detectada BOOLEAN DEFAULT FALSE;
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE;
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE;
      ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS tipo_finalizacao VARCHAR(50) DEFAULT NULL;
      
      CREATE INDEX IF NOT EXISTS idx_carregamentos_fim_null ON carregamentos(fim) WHERE fim IS NULL;
      CREATE INDEX IF NOT EXISTS idx_carregamentos_notificacoes ON carregamentos(notificacao_inicio_enviada, notificacao_fim_enviada, notificacao_ociosidade_enviada);
      CREATE INDEX IF NOT EXISTS idx_carregamentos_morador_ativo ON carregamentos(morador_id, fim) WHERE fim IS NULL;
      
      COMMIT;
    `);
    
    const campos = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'carregamentos' 
        AND column_name IN (
          'ultimo_power_w', 'contador_minutos_ocioso', 'primeiro_ocioso_em',
          'power_zerou_em', 'interrupcao_detectada', 'notificacao_ociosidade_enviada',
          'notificacao_bateria_cheia_enviada', 'tipo_finalizacao'
        )
      ORDER BY column_name;
    `);
    
    console.log(`✅ ${campos.rows.length} novos campos adicionados:\n`);
    campos.rows.forEach((col, i) => {
      console.log(`   ${i + 1}. ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 MIGRATIONS EXECUTADAS COM SUCESSO!\n');
    console.log('✅ Tabela "mensagens_notificacoes" criada');
    console.log('✅ 4 mensagens padrão inseridas (TODAS DESLIGADAS)');
    console.log('✅ 8 campos adicionados em "carregamentos"');
    console.log('✅ Todos os índices criados\n');
    console.log('📌 PRÓXIMO PASSO: Interface de edição será criada!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nDetalhes:', error);
    console.log('\n💡 DICA: Verifique se a DATABASE_URL está correta.\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

executar();


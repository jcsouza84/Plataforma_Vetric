#!/usr/bin/env node

/**
 * 🗃️ EXECUTAR MIGRATIONS - SOLUÇÃO DEFINITIVA
 * Execute UMA VEZ para criar a tabela mensagens_notificacoes
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db';

async function executarMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Conectando ao banco...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // ========================================
    // MIGRATION 1: Criar tabela mensagens_notificacoes
    // ========================================
    console.log('📝 MIGRATION 1: Criando tabela mensagens_notificacoes...');
    
    await client.query(`
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
    `);
    
    console.log('✅ Tabela criada!\n');

    // ========================================
    // Inserir mensagens padrão
    // ========================================
    console.log('📝 Inserindo mensagens padrão...');
    
    await client.query(`
      INSERT INTO mensagens_notificacoes 
        (tipo, titulo, corpo, tempo_minutos, power_threshold_w, ativo)
      VALUES
        ('inicio_recarga', '🔋 Início de Carregamento', 
         E'Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n🕐 Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!', 
         3, NULL, FALSE),
        
        ('inicio_ociosidade', '⚠️ Carregamento ocioso', 
         E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{consumo}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.\n\nObrigado pela compreensão! 🙏', 
         0, 10, FALSE),
        
        ('bateria_cheia', '🔋 Carga completa!', 
         E'Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nPor favor, remova o cabo para liberar o carregador.\n\nObrigado por utilizar nosso sistema! 🙏', 
         3, 10, FALSE),
        
        ('interrupcao', '⚠️ Carregamento interrompido', 
         E'Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo ou entre em contato com a administração.\n\nTelefone: (82) 3333-4444\nWhatsApp: (82) 99999-9999', 
         0, NULL, FALSE)
      ON CONFLICT (tipo) DO NOTHING;
    `);
    
    console.log('✅ Mensagens inseridas!\n');

    // ========================================
    // Criar índices
    // ========================================
    console.log('📝 Criando índices...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_tipo 
        ON mensagens_notificacoes(tipo);
      
      CREATE INDEX IF NOT EXISTS idx_mensagens_notificacoes_ativo 
        ON mensagens_notificacoes(ativo) WHERE ativo = TRUE;
    `);
    
    console.log('✅ Índices criados!\n');

    // ========================================
    // MIGRATION 2: Adicionar campos em carregamentos
    // ========================================
    console.log('📝 MIGRATION 2: Adicionando campos em carregamentos...');
    
    await client.query(`
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
    
    console.log('✅ Campos adicionados!\n');

    // ========================================
    // Criar índices em carregamentos
    // ========================================
    console.log('📝 Criando índices em carregamentos...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_carregamentos_fim_null 
        ON carregamentos(fim) WHERE fim IS NULL;
      
      CREATE INDEX IF NOT EXISTS idx_carregamentos_notificacoes 
        ON carregamentos(notificacao_inicio_enviada, notificacao_fim_enviada, notificacao_ociosidade_enviada);
      
      CREATE INDEX IF NOT EXISTS idx_carregamentos_morador_ativo 
        ON carregamentos(morador_id, fim) WHERE fim IS NULL;
    `);
    
    console.log('✅ Índices criados!\n');

    // ========================================
    // VERIFICAR SE FUNCIONOU
    // ========================================
    console.log('🔍 Verificando se funcionou...\n');
    
    const result = await client.query(`
      SELECT tipo, titulo, tempo_minutos, power_threshold_w, ativo 
      FROM mensagens_notificacoes 
      ORDER BY tipo;
    `);
    
    console.log('✅ MENSAGENS NO BANCO:');
    console.table(result.rows);
    
    console.log('\n🎉 MIGRATIONS EXECUTADAS COM SUCESSO!\n');
    console.log('📋 Próximo passo:');
    console.log('   1. Abra o navegador em modo anônimo (⌘ + Shift + N)');
    console.log('   2. Acesse: https://plataforma-vetric.onrender.com');
    console.log('   3. Vá em: Configurações → Notificações Inteligentes');
    console.log('   4. Deve aparecer os 4 cards! 🎯\n');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('\n💡 Se o erro for de conexão:');
    console.error('   - Verifique se o DATABASE_URL está correto');
    console.error('   - Verifique se o IP está na whitelist do Render\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

executarMigrations();


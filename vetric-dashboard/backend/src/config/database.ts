/**
 * 🗄️ VETRIC - Configuração do Banco de Dados PostgreSQL
 */

import { Pool } from 'pg';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

// Sequelize instance (para models)
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vetric_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: false, // Set to console.log to see SQL queries
});

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vetric_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão ao iniciar
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('❌ Erro no pool de conexões do banco:', err);
  process.exit(-1);
});

// Helper para executar queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] Query executada em ${duration}ms`);
    return res.rows;
  } catch (error: any) {
    console.error('[DB] Erro na query:', error.message);
    throw error;
  }
}

// Helper para transações
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Criar tabelas se não existirem
export async function initDatabase() {
  console.log('\n🗄️  Inicializando banco de dados...\n');

  // Tabela: usuarios (AUTENTICAÇÃO)
  await query(`
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
    )
  `);
  console.log('✅ Tabela "usuarios" verificada');

  // Tabela: moradores
  await query(`
    CREATE TABLE IF NOT EXISTS moradores (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      apartamento VARCHAR(50) NOT NULL,
      telefone VARCHAR(20),
      tag_rfid VARCHAR(100) UNIQUE NOT NULL,
      notificacoes_ativas BOOLEAN DEFAULT false,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabela "moradores" verificada');

  // Tabela: carregamentos
  await query(`
    CREATE TABLE IF NOT EXISTS carregamentos (
      id SERIAL PRIMARY KEY,
      morador_id INTEGER REFERENCES moradores(id) ON DELETE SET NULL,
      charger_uuid VARCHAR(100) NOT NULL,
      charger_name VARCHAR(255) NOT NULL,
      connector_id INTEGER NOT NULL,
      status VARCHAR(50) NOT NULL,
      inicio TIMESTAMP NOT NULL,
      fim TIMESTAMP,
      energia_kwh DECIMAL(10, 2),
      duracao_minutos INTEGER,
      notificacao_inicio_enviada BOOLEAN DEFAULT false,
      notificacao_fim_enviada BOOLEAN DEFAULT false,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabela "carregamentos" verificada');

  // Tabela: templates_notificacao
  await query(`
    CREATE TABLE IF NOT EXISTS templates_notificacao (
      id SERIAL PRIMARY KEY,
      tipo VARCHAR(50) UNIQUE NOT NULL,
      mensagem TEXT NOT NULL,
      ativo BOOLEAN DEFAULT true,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabela "templates_notificacao" verificada');

  // Inserir templates padrão (5 tipos)
  await query(`
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
    ON CONFLICT (tipo) DO NOTHING
  `);
  console.log('✅ Templates de notificação inseridos (5 tipos)');

  // Tabela: relatorios
  await query(`
    CREATE TABLE IF NOT EXISTS relatorios (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(200) NOT NULL,
      arquivo_nome VARCHAR(255) NOT NULL,
      arquivo_path VARCHAR(500) NOT NULL,
      mes INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      descricao TEXT,
      tamanho_kb INTEGER,
      uploaded_por UUID REFERENCES usuarios(id),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabela "relatorios" verificada');

  // Tabela: logs_notificacoes
  await query(`
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
    )
  `);
  console.log('✅ Tabela "logs_notificacoes" verificada');

  // Tabela: configuracoes_sistema
  await query(`
    CREATE TABLE IF NOT EXISTS configuracoes_sistema (
      id SERIAL PRIMARY KEY,
      chave VARCHAR(100) UNIQUE NOT NULL,
      valor TEXT,
      descricao TEXT,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_por UUID REFERENCES usuarios(id)
    )
  `);
  console.log('✅ Tabela "configuracoes_sistema" verificada');

  // Inserir configurações padrão Evolution API (se não existirem)
  await query(`
    INSERT INTO configuracoes_sistema (chave, valor, descricao)
    VALUES
      ('evolution_api_url', '', 'URL base da Evolution API'),
      ('evolution_api_key', '', 'API Key da Evolution API'),
      ('evolution_instance', '', 'Nome da instância Evolution API')
    ON CONFLICT (chave) DO NOTHING
  `);
  console.log('✅ Configurações Evolution API inseridas');

  // Criar índices
  await query(`
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_moradores_tag_rfid ON moradores(tag_rfid);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_morador_id ON carregamentos(morador_id);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_charger_uuid ON carregamentos(charger_uuid);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_status ON carregamentos(status);
    CREATE INDEX IF NOT EXISTS idx_carregamentos_inicio ON carregamentos(inicio);
  `);
  console.log('✅ Índices criados');

  console.log('\n✅ Banco de dados inicializado com sucesso!\n');
}

export default pool;


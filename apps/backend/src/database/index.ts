/**
 * 🗄️ VETRIC - Database Migrations Entry Point
 * Executa todas as migrations do sistema
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { MigrationRunner } from './migrationRunner';

dotenv.config();

/**
 * Executar migrations
 */
export async function runMigrations(): Promise<void> {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vetric_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 5,
    connectionTimeoutMillis: 5000,
  });

  const runner = new MigrationRunner(pool);

  try {
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado ao banco de dados\n');

    // Carregar e executar migrations
    await runner.loadMigrations();
    await runner.runPending();

  } catch (error: any) {
    console.error('❌ Erro ao executar migrations:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Ver status das migrations
 */
export async function migrationStatus(): Promise<void> {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vetric_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const runner = new MigrationRunner(pool);

  try {
    await runner.loadMigrations();
    await runner.status();
  } finally {
    await pool.end();
  }
}

/**
 * Reverter última migration
 */
export async function rollbackMigration(): Promise<void> {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vetric_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const runner = new MigrationRunner(pool);

  try {
    await runner.loadMigrations();
    await runner.rollbackLast();
  } finally {
    await pool.end();
  }
}

// CLI - Executar se chamado diretamente
if (require.main === module) {
  const command = process.argv[2] || 'run';

  (async () => {
    try {
      switch (command) {
        case 'run':
          await runMigrations();
          break;
        case 'status':
          await migrationStatus();
          break;
        case 'rollback':
          await rollbackMigration();
          break;
        default:
          console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🔄 VETRIC - Database Migrations                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Comandos disponíveis:

  npm run migrate              - Executar migrations pendentes
  npm run migrate:status       - Ver status das migrations
  npm run migrate:rollback     - Reverter última migration

Ou use diretamente:

  ts-node src/database/index.ts run
  ts-node src/database/index.ts status
  ts-node src/database/index.ts rollback
`);
      }
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro:', error);
      process.exit(1);
    }
  })();
}




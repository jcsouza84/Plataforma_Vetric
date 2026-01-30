/**
 * 🔄 VETRIC - Migration Runner
 * Sistema de migrations com controle de versão
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface Migration {
  name: string;
  description: string;
  up: (pool: Pool) => Promise<void>;
  down: (pool: Pool) => Promise<void>;
}

export class MigrationRunner {
  private pool: Pool;
  private migrations: Migration[] = [];

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Criar tabela de controle de migrations
   */
  private async createMigrationsTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        execution_time_ms INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);
      CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON _migrations(executed_at);
      
      COMMENT ON TABLE _migrations IS 'Controle de migrations executadas no banco de dados';
    `);
  }

  /**
   * Registrar uma migration
   */
  public register(migration: Migration): void {
    this.migrations.push(migration);
  }

  /**
   * Carregar todas as migrations da pasta
   */
  public async loadMigrations(): Promise<void> {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  Pasta de migrations não encontrada');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
      .sort(); // Ordena por nome (001, 002, 003...)

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const migration = await import(filePath);
      
      this.register({
        name: migration.name,
        description: migration.description,
        up: migration.up,
        down: migration.down,
      });
    }

    console.log(`📦 ${this.migrations.length} migration(s) carregada(s)`);
  }

  /**
   * Verificar quais migrations já foram executadas
   */
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await this.pool.query(
        'SELECT name FROM _migrations ORDER BY executed_at ASC'
      );
      return result.rows.map(row => row.name);
    } catch (error) {
      return [];
    }
  }

  /**
   * Executar todas as migrations pendentes
   */
  public async runPending(): Promise<void> {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║           🔄 VETRIC - Executando Migrations               ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Criar tabela de controle
    await this.createMigrationsTable();

    // Buscar migrations já executadas
    const executed = await this.getExecutedMigrations();
    console.log(`✅ ${executed.length} migration(s) já executada(s)\n`);

    // Filtrar pendentes
    const pending = this.migrations.filter(m => !executed.includes(m.name));

    if (pending.length === 0) {
      console.log('✨ Nenhuma migration pendente. Banco de dados está atualizado!\n');
      return;
    }

    console.log(`🔄 ${pending.length} migration(s) pendente(s):\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const migration of pending) {
      const startTime = Date.now();
      
      try {
        console.log(`⏳ Executando: ${migration.name}`);
        console.log(`   📝 ${migration.description}`);

        // Executar migration
        await migration.up(this.pool);

        const executionTime = Date.now() - startTime;

        // Registrar no banco
        await this.pool.query(
          `INSERT INTO _migrations (name, description, execution_time_ms) 
           VALUES ($1, $2, $3)`,
          [migration.name, migration.description, executionTime]
        );

        console.log(`   ✅ Concluída em ${executionTime}ms\n`);
        successCount++;

      } catch (error: any) {
        console.error(`   ❌ ERRO: ${error.message}\n`);
        errorCount++;
        
        // Parar no primeiro erro
        console.error('⛔ Migrations interrompidas devido ao erro acima.\n');
        throw error;
      }
    }

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`✅ ${successCount} migration(s) executada(s) com sucesso`);
    
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} migration(s) com erro`);
    }
    
    console.log('\n✨ Migrations concluídas!\n');
  }

  /**
   * Reverter a última migration
   */
  public async rollbackLast(): Promise<void> {
    console.log('\n⏪ Revertendo última migration...\n');

    const result = await this.pool.query(
      'SELECT name FROM _migrations ORDER BY executed_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      console.log('⚠️  Nenhuma migration para reverter.\n');
      return;
    }

    const lastMigrationName = result.rows[0].name;
    const migration = this.migrations.find(m => m.name === lastMigrationName);

    if (!migration) {
      console.error(`❌ Migration ${lastMigrationName} não encontrada nos arquivos.\n`);
      return;
    }

    try {
      console.log(`⏳ Revertendo: ${migration.name}`);
      
      await migration.down(this.pool);
      
      await this.pool.query(
        'DELETE FROM _migrations WHERE name = $1',
        [migration.name]
      );

      console.log(`✅ Revertida com sucesso!\n`);
    } catch (error: any) {
      console.error(`❌ Erro ao reverter: ${error.message}\n`);
      throw error;
    }
  }

  /**
   * Listar status de todas as migrations
   */
  public async status(): Promise<void> {
    await this.createMigrationsTable();
    const executed = await this.getExecutedMigrations();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║           📊 Status das Migrations                        ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    for (const migration of this.migrations) {
      const status = executed.includes(migration.name) ? '✅' : '⏳';
      const statusText = executed.includes(migration.name) ? 'EXECUTADA' : 'PENDENTE';
      
      console.log(`${status} ${migration.name.padEnd(30)} - ${statusText}`);
      console.log(`   ${migration.description}`);
      console.log('');
    }

    const pendingCount = this.migrations.length - executed.length;
    console.log(`📊 Total: ${this.migrations.length} migrations`);
    console.log(`✅ Executadas: ${executed.length}`);
    console.log(`⏳ Pendentes: ${pendingCount}\n`);
  }

  /**
   * Executar todas as migrations (fresh install)
   */
  public async runAll(): Promise<void> {
    await this.runPending();
  }
}




/**
 * 📦 Script de Migração - VETRIC Reports V2 → Sistema Integrado
 * Copia dados do SQLite original para o PostgreSQL
 */

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Pool } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface EmpreendimentoSQLite {
  id: string;
  nome: string;
  logoUrl: string | null;
  sistemaCarregamento: string;
  createdAt: number;
}

interface ConfiguracaoSQLite {
  id: string;
  empreendimentoId: string;
  tarifaPonta: number;
  tarifaForaPonta: number;
  pontaInicioHora: number;
  pontaInicioMinuto: number;
  pontaFimHora: number;
  pontaFimMinuto: number;
  pontaSegunda: number;
  pontaTerca: number;
  pontaQuarta: number;
  pontaQuinta: number;
  pontaSexta: number;
  pontaSabado: number;
  pontaDomingo: number;
  limiteEnergiaMaxKWh: number;
  limiteOciosidadeMin: number;
}

interface UsuarioSQLite {
  id: string;
  empreendimentoId: string;
  nome: string;
  unidade: string;
  torre: string;
  telefone: string | null;
  tags: string; // JSON array
}

let db: Database;
let pool: Pool;

async function connectPostgreSQL() {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vetric_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Testar conexão
  await pool.query('SELECT NOW()');
  console.log('✅ PostgreSQL conectado!\n');
}

async function openSQLite() {
  const dbPath = path.join(
    '/Users/juliocesarsouza/Desktop/Vetric/vetric-reports-v2/prisma',
    'dev.db'
  );

  console.log(`📂 Abrindo banco SQLite: ${dbPath}`);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  console.log('✅ SQLite conectado!\n');
}

async function migrarEmpreendimentos() {
  console.log('🏢 MIGRANDO EMPREENDIMENTOS...\n');

  const empreendimentos = await db.all<EmpreendimentoSQLite[]>(
    'SELECT * FROM Empreendimento'
  );

  console.log(`📊 Encontrados: ${empreendimentos.length} empreendimentos\n`);

  for (const emp of empreendimentos) {
    try {
      // Verificar se já existe
      const existe = await pool.query(
        'SELECT id FROM empreendimentos_relatorio WHERE id = $1',
        [emp.id]
      );

      if (existe.rows.length > 0) {
        console.log(`⏭️  [${emp.nome}] Já existe, pulando...`);
        continue;
      }

      // Inserir
      await pool.query(
        `INSERT INTO empreendimentos_relatorio 
         (id, nome, logo_url, sistema_carregamento, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0), to_timestamp($6 / 1000.0))`,
        [
          emp.id,
          emp.nome,
          emp.logoUrl,
          emp.sistemaCarregamento,
          emp.createdAt,
          emp.createdAt,
        ]
      );

      console.log(`✅ [${emp.nome}] Migrado com sucesso!`);
    } catch (error: any) {
      console.error(`❌ [${emp.nome}] Erro:`, error.message);
    }
  }

  console.log('\n✅ Empreendimentos migrados!\n');
}

async function migrarConfiguracoes() {
  console.log('⚙️  MIGRANDO CONFIGURAÇÕES TARIFÁRIAS...\n');

  const configs = await db.all<ConfiguracaoSQLite[]>(
    'SELECT * FROM ConfiguracaoTarifaria'
  );

  console.log(`📊 Encontrados: ${configs.length} configurações\n`);

  for (const config of configs) {
    try {
      // Verificar se já existe
      const existe = await pool.query(
        'SELECT id FROM configuracoes_tarifarias WHERE empreendimento_id = $1',
        [config.empreendimentoId]
      );

      if (existe.rows.length > 0) {
        console.log(`⏭️  [Config ${config.empreendimentoId}] Já existe, pulando...`);
        continue;
      }

      // Inserir
      await pool.query(
        `INSERT INTO configuracoes_tarifarias 
         (id, empreendimento_id, tarifa_ponta, tarifa_fora_ponta,
          ponta_inicio_hora, ponta_inicio_minuto, ponta_fim_hora, ponta_fim_minuto,
          ponta_segunda, ponta_terca, ponta_quarta, ponta_quinta, ponta_sexta, ponta_sabado, ponta_domingo,
          limite_energia_max_kwh, limite_ociosidade_min,
          criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
        [
          config.id,
          config.empreendimentoId,
          config.tarifaPonta,
          config.tarifaForaPonta,
          config.pontaInicioHora,
          config.pontaInicioMinuto,
          config.pontaFimHora,
          config.pontaFimMinuto,
          config.pontaSegunda === 1,
          config.pontaTerca === 1,
          config.pontaQuarta === 1,
          config.pontaQuinta === 1,
          config.pontaSexta === 1,
          config.pontaSabado === 1,
          config.pontaDomingo === 1,
          config.limiteEnergiaMaxKWh,
          config.limiteOciosidadeMin,
        ]
      );

      console.log(`✅ [Config ${config.empreendimentoId}] Migrado com sucesso!`);
    } catch (error: any) {
      console.error(`❌ [Config ${config.empreendimentoId}] Erro:`, error.message);
    }
  }

  console.log('\n✅ Configurações migradas!\n');
}

async function migrarUsuarios() {
  console.log('👥 MIGRANDO USUÁRIOS...\n');

  const usuarios = await db.all<UsuarioSQLite[]>('SELECT * FROM Usuario');

  console.log(`📊 Encontrados: ${usuarios.length} usuários\n`);

  let migrados = 0;
  let pulados = 0;

  for (const usuario of usuarios) {
    try {
      // Verificar se já existe
      const existe = await pool.query(
        'SELECT id FROM usuarios_relatorio WHERE id = $1',
        [usuario.id]
      );

      if (existe.rows.length > 0) {
        pulados++;
        continue;
      }

      // Parsear tags
      let tags: string[] = [];
      try {
        tags = JSON.parse(usuario.tags);
      } catch {
        tags = [];
      }

      // Inserir
      await pool.query(
        `INSERT INTO usuarios_relatorio 
         (id, empreendimento_id, nome, unidade, torre, telefone, tags, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW(), NOW())`,
        [
          usuario.id,
          usuario.empreendimentoId,
          usuario.nome,
          usuario.unidade,
          usuario.torre,
          usuario.telefone,
          JSON.stringify(tags),
        ]
      );

      migrados++;

      if (migrados % 10 === 0) {
        console.log(`📈 Progresso: ${migrados}/${usuarios.length} usuários migrados...`);
      }
    } catch (error: any) {
      console.error(`❌ [${usuario.nome}] Erro:`, error.message);
    }
  }

  console.log(`\n✅ ${migrados} usuários migrados!`);
  console.log(`⏭️  ${pulados} usuários já existiam (pulados)\n`);
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     📦 MIGRAÇÃO VETRIC REPORTS V2 → SISTEMA INTEGRADO    ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Conectar ao PostgreSQL
    await connectPostgreSQL();

    // 2. Conectar ao SQLite
    await openSQLite();

    // 3. Migrar empreendimentos
    await migrarEmpreendimentos();

    // 4. Migrar configurações
    await migrarConfiguracoes();

    // 5. Migrar usuários
    await migrarUsuarios();

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║              ✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!           ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NA MIGRAÇÃO:', error.message);
    console.error(error);
  } finally {
    // Fechar conexões
    if (pool) {
      await pool.end();
      console.log('🔌 PostgreSQL desconectado\n');
    }
    if (db) {
      await db.close();
      console.log('🔌 SQLite desconectado\n');
    }
  }

  process.exit(0);
}

// Executar
main();


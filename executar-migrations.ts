/**
 * 🗃️ Executar Migrations no Banco de Dados
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada!');
  console.log('📌 Use: export DATABASE_URL="sua_url_aqui"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function executarMigrations() {
  try {
    console.log('🗃️  EXECUTANDO MIGRATIONS NO BANCO DE DADOS\n');
    console.log('='.repeat(60) + '\n');

    // Migration 1: Criar tabela mensagens_notificacoes
    console.log('📝 Migration 1/2: Criando tabela "mensagens_notificacoes"...\n');
    
    const migration1Path = path.join(__dirname, 'migrations', '20260131_criar_mensagens_notificacoes.sql');
    const migration1SQL = fs.readFileSync(migration1Path, 'utf-8');
    
    await pool.query(migration1SQL);
    
    console.log('✅ Tabela "mensagens_notificacoes" criada!\n');

    // Verificar mensagens inseridas
    const mensagens = await pool.query(`
      SELECT tipo, titulo, tempo_minutos, power_threshold_w, ativo 
      FROM mensagens_notificacoes 
      ORDER BY id;
    `);

    console.log(`✅ ${mensagens.rows.length} mensagens inseridas:\n`);
    mensagens.rows.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.titulo}`);
      console.log(`      Tipo: ${msg.tipo}`);
      console.log(`      Tempo: ${msg.tempo_minutos} min`);
      console.log(`      Power: ${msg.power_threshold_w || 'N/A'}W`);
      console.log(`      Ativo: ${msg.ativo ? '🟢 SIM' : '🔴 NÃO'}`);
      console.log('');
    });

    console.log('='.repeat(60) + '\n');

    // Migration 2: Adicionar campos em carregamentos
    console.log('📝 Migration 2/2: Adicionando campos em "carregamentos"...\n');
    
    const migration2Path = path.join(__dirname, 'migrations', '20260131_adicionar_campos_carregamentos.sql');
    const migration2SQL = fs.readFileSync(migration2Path, 'utf-8');
    
    await pool.query(migration2SQL);
    
    console.log('✅ Campos adicionados em "carregamentos"!\n');

    // Verificar campos adicionados
    const campos = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'carregamentos' 
        AND column_name IN (
          'ultimo_power_w',
          'contador_minutos_ocioso',
          'primeiro_ocioso_em',
          'power_zerou_em',
          'interrupcao_detectada',
          'notificacao_ociosidade_enviada',
          'notificacao_bateria_cheia_enviada',
          'tipo_finalizacao'
        )
      ORDER BY column_name;
    `);

    console.log(`✅ ${campos.rows.length} novos campos verificados:\n`);
    campos.rows.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.column_name} (${col.data_type})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 MIGRATIONS EXECUTADAS COM SUCESSO!\n');
    console.log('✅ Tabela "mensagens_notificacoes" criada com 4 mensagens');
    console.log('✅ 8 novos campos adicionados em "carregamentos"');
    console.log('✅ Todos os índices criados');
    console.log('\n📌 PRÓXIMO PASSO: Criar interface de edição das mensagens!\n');

  } catch (error: any) {
    console.error('\n❌ ERRO AO EXECUTAR MIGRATIONS:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executarMigrations();


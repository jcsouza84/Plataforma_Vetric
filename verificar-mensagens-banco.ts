/**
 * 🔍 Verifica se as mensagens de notificação foram criadas no banco
 */

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada!');
  console.log('📌 Execute: export DATABASE_URL="sua_url_aqui"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verificarMensagens() {
  try {
    console.log('🔍 Verificando mensagens no banco de dados...\n');

    // Verificar se a tabela existe
    const tabelaExiste = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mensagens_notificacoes'
      );
    `);

    if (!tabelaExiste.rows[0].exists) {
      console.log('❌ Tabela "mensagens_notificacoes" NÃO existe!');
      console.log('⚠️  A migration ainda não foi executada no banco de dados.\n');
      return;
    }

    console.log('✅ Tabela "mensagens_notificacoes" existe!\n');

    // Buscar todas as mensagens
    const resultado = await pool.query(`
      SELECT 
        id,
        tipo,
        titulo,
        corpo,
        tempo_minutos,
        power_threshold_w,
        ativo,
        criado_em,
        atualizado_em
      FROM mensagens_notificacoes
      ORDER BY id;
    `);

    if (resultado.rows.length === 0) {
      console.log('⚠️  Tabela existe, mas está VAZIA!');
      console.log('❌ As mensagens padrão não foram inseridas.\n');
      return;
    }

    console.log(`✅ ${resultado.rows.length} mensagens encontradas:\n`);

    resultado.rows.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.titulo}`);
      console.log(`   Tipo: ${msg.tipo}`);
      console.log(`   Ativo: ${msg.ativo ? '🟢 SIM' : '🔴 NÃO'}`);
      console.log(`   Tempo: ${msg.tempo_minutos} minutos`);
      console.log(`   Power Threshold: ${msg.power_threshold_w}W`);
      console.log(`   Corpo: ${msg.corpo.substring(0, 80)}...`);
      console.log('');
    });

    // Verificar novos campos em carregamentos
    console.log('🔍 Verificando novos campos em "carregamentos"...\n');

    const colunas = await pool.query(`
      SELECT column_name, data_type
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

    if (colunas.rows.length === 0) {
      console.log('❌ Novos campos NÃO existem na tabela "carregamentos"!');
      console.log('⚠️  A migration ainda não foi executada.\n');
    } else {
      console.log(`✅ ${colunas.rows.length} novos campos encontrados:\n`);
      colunas.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await pool.end();
  }
}

verificarMensagens();


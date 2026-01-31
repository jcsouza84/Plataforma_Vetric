/**
 * 🔍 Análise Detalhada - Mensagens Recebidas pela Plataforma
 * Transação da Saskya - ID 160
 */

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

async function analisarDetalhado() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('================================================');
  console.log('🔍 ANÁLISE DETALHADA - TRANSAÇÃO SASKYA (ID 160)');
  console.log('================================================\n');

  try {
    // 1. Detalhes completos da transação
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  DADOS COMPLETOS DA TRANSAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const tx = await pool.query(`
      SELECT 
        c.*,
        m.nome as morador_nome,
        m.tag_rfid,
        m.telefone
      FROM carregamentos c
      LEFT JOIN moradores m ON c.morador_id = m.id
      WHERE c.id = 160
    `);

    if (tx.rows.length > 0) {
      const t = tx.rows[0];
      console.log('📊 TODOS OS CAMPOS:\n');
      Object.keys(t).forEach(key => {
        const value = t[key];
        console.log(`  ${key.padEnd(30)} → ${value !== null ? value : 'NULL'}`);
      });
      console.log('');
    }

    // 2. Verificar se existe tabela de logs/histórico
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  VERIFICANDO TABELAS DE LOG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name LIKE '%log%'
      ORDER BY table_name
    `);

    if (tables.rows.length > 0) {
      console.log('📋 Tabelas de log encontradas:\n');
      tables.rows.forEach(t => {
        console.log(`  - ${t.table_name}`);
      });
      console.log('');
    } else {
      console.log('⚠️  Nenhuma tabela de log encontrada\n');
    }

    // 3. Buscar em logs_notificacoes
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  NOTIFICAÇÕES RELACIONADAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const notifs = await pool.query(`
      SELECT *
      FROM logs_notificacoes
      WHERE destinatario = '+5582996176797'
        AND created_at BETWEEN '2026-01-30' AND '2026-02-01'
      ORDER BY created_at ASC
    `);

    if (notifs.rows.length > 0) {
      console.log(`✅ ${notifs.rows.length} notificação(ões) encontrada(s):\n`);
      notifs.rows.forEach((n, i) => {
        console.log(`━━━ Notificação ${i + 1} ━━━`);
        console.log(`Data:         ${n.created_at}`);
        console.log(`Tipo:         ${n.tipo}`);
        console.log(`Destinatário: ${n.destinatario}`);
        console.log(`Status:       ${n.status}`);
        console.log(`Mensagem:`);
        console.log(`  ${n.mensagem}`);
        if (n.erro) {
          console.log(`Erro:         ${n.erro}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma notificação encontrada para este telefone\n');
    }

    // 4. Comparar com horários do log CVE
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣  COMPARAÇÃO: CVE-PRO vs PLATAFORMA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📅 DO LOG CVE-PRO (mundo_logic):\n');
    console.log('  20:45 (30/01) → Início do carregamento');
    console.log('  00:00 - 01:35 → MeterValues (carregando)');
    console.log('  01:35:07      → StatusNotification: "SuspendedEV"');
    console.log('  01:35:50      → RemoteStopTransaction');
    console.log('  01:36:00      → StopTransaction (finalizado)');
    console.log('  01:36:07      → StatusNotification: "Finishing"');
    console.log('  01:37:25      → StatusNotification: "Available"\n');

    if (tx.rows.length > 0) {
      const t = tx.rows[0];
      console.log('📅 NA PLATAFORMA DO SÍNDICO:\n');
      console.log(`  INÍCIO:       ${t.inicio}`);
      console.log(`  FIM:          ${t.fim || 'NULL'}`);
      console.log(`  CRIADO EM:    ${t.criado_em}`);
      console.log(`  STATUS:       ${t.status}`);
      console.log(`  NOTIF INÍCIO: ${t.notificacao_inicio_enviada ? 'SIM' : 'NÃO'}`);
      console.log(`  NOTIF FIM:    ${t.notificacao_fim_enviada ? 'SIM' : 'NÃO'}\n');
    }

    // 5. Buscar outros carregamentos próximos (para entender padrão)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5️⃣  CARREGAMENTOS PRÓXIMOS (CONTEXTO)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const proximos = await pool.query(`
      SELECT 
        c.id,
        c.charger_name,
        c.inicio,
        c.fim,
        c.status,
        c.criado_em,
        m.nome as morador
      FROM carregamentos c
      LEFT JOIN moradores m ON c.morador_id = m.id
      WHERE c.inicio BETWEEN '2026-01-30 15:00:00' AND '2026-01-31 02:00:00'
      ORDER BY c.inicio ASC
    `);

    if (proximos.rows.length > 0) {
      console.log(`✅ ${proximos.rows.length} carregamentos neste período:\n`);
      proximos.rows.forEach((c, i) => {
        const isTarget = c.id === 160;
        console.log(`${isTarget ? '👉 ' : '   '}${i + 1}. ID ${c.id} - ${c.charger_name} - ${c.morador}`);
        console.log(`     Início: ${c.inicio}`);
        console.log(`     Fim:    ${c.fim || 'NULL'}`);
        console.log(`     Criado: ${c.criado_em}`);
        console.log(`     Status: ${c.status}`);
        console.log('');
      });
    }

    // 6. Verificar se existe campo para transaction_id/transaction_pk
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('6️⃣  MAPEAMENTO TRANSACTION_PK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar se existe tabela de mapeamento
    const mapping = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%mapping%' OR table_name LIKE '%transaction%')
      ORDER BY table_name
    `);

    if (mapping.rows.length > 0) {
      console.log('📋 Tabelas relacionadas a transações:\n');
      for (const t of mapping.rows) {
        console.log(`  - ${t.table_name}`);
        
        // Ver estrutura
        const cols = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [t.table_name]);
        
        cols.rows.forEach(c => {
          console.log(`      ${c.column_name} (${c.data_type})`);
        });
        console.log('');
      }
    } else {
      console.log('⚠️  Nenhuma tabela de mapeamento encontrada\n');
      console.log('   Isso significa que não há como rastrear o transaction_pk');
      console.log('   do CVE-PRO (439071) com o ID da plataforma (160)\n');
    }

    console.log('\n================================================');
    console.log('✅ ANÁLISE COMPLETA');
    console.log('================================================\n');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    if (error.code) console.error('Código:', error.code);
  } finally {
    await pool.end();
  }
}

analisarDetalhado();


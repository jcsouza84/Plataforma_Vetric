import pg from 'pg';
const { Client } = pg;

async function verificarEstrutura() {
  const DATABASE_URL = 'postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db';
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco!\n');

    // 1. Campos da tabela "carregamentos"
    console.log('================================================');
    console.log('📋 TABELA: carregamentos');
    console.log('================================================\n');

    const carregamentosResult = await client.query(`
      SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
      FROM 
          information_schema.columns
      WHERE 
          table_name = 'carregamentos'
      ORDER BY 
          ordinal_position;
    `);

    console.log(`Total de campos: ${carregamentosResult.rows.length}\n`);
    carregamentosResult.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name}`);
      console.log(`   Tipo: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      console.log(`   Default: ${col.column_default || 'NULL'}`);
      console.log('');
    });

    // 2. Verificar se "mensagens_notificacoes" existe
    console.log('\n================================================');
    console.log('📋 TABELA: mensagens_notificacoes');
    console.log('================================================\n');

    const msgExiste = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'mensagens_notificacoes'
      );
    `);

    if (msgExiste.rows[0].exists) {
      console.log('✅ Tabela existe!\n');
      
      const msgCampos = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'mensagens_notificacoes'
        ORDER BY ordinal_position;
      `);

      msgCampos.rows.forEach((col, index) => {
        console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ Tabela NÃO existe (precisa criar)');
    }

    // 3. Verificar se "configuracoes_sistema" existe
    console.log('\n================================================');
    console.log('📋 TABELA: configuracoes_sistema');
    console.log('================================================\n');

    const configExiste = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'configuracoes_sistema'
      );
    `);

    if (configExiste.rows[0].exists) {
      console.log('✅ Tabela existe!\n');
      
      const configCampos = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'configuracoes_sistema'
        ORDER BY ordinal_position;
      `);

      configCampos.rows.forEach((col, index) => {
        console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ Tabela NÃO existe (precisa criar)');
    }

    // 4. Ver "logs_notificacoes"
    console.log('\n================================================');
    console.log('📋 TABELA: logs_notificacoes');
    console.log('================================================\n');

    const logsExiste = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'logs_notificacoes'
      );
    `);

    if (logsExiste.rows[0].exists) {
      console.log('✅ Tabela existe!\n');
      
      const logsCampos = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'logs_notificacoes'
        ORDER BY ordinal_position;
      `);

      logsCampos.rows.forEach((col, index) => {
        console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ Tabela NÃO existe');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

verificarEstrutura();


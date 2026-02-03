import { Pool } from 'pg';
import axios from 'axios';

const DATABASE_URL = 'postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db';

const testarFernandoRender = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🚀 TESTE COMPLETO - FERNANDO (BANCO RENDER)               ║
║                                                               ║
║   Testa lógica completa com Evolution API                    ║
║   ⚠️  Envia WhatsApp REAL!                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Buscar carregamento do Fernando
    console.log('🔍 Buscando carregamento do Fernando no Render...');
    const carregamentoResult = await pool.query(
      `SELECT 
        c.*,
        m.nome,
        m.telefone,
        m.apartamento,
        m.notificacoes_ativas,
        ROUND(EXTRACT(EPOCH FROM (NOW() - c.inicio))/60) as minutos_ativo
       FROM carregamentos c
       JOIN moradores m ON c.morador_id = m.id
       WHERE c.id = 180`
    );

    if (carregamentoResult.rows.length === 0) {
      console.error('❌ Carregamento não encontrado!');
      await pool.end();
      return;
    }

    const carregamento = carregamentoResult.rows[0];

    console.log('\n📊 DADOS DO CARREGAMENTO (RENDER):');
    console.log(`   ID: ${carregamento.id}`);
    console.log(`   Charger: ${carregamento.charger_name}`);
    console.log(`   Morador: ${carregamento.nome}`);
    console.log(`   Telefone: ${carregamento.telefone}`);
    console.log(`   Apartamento: ${carregamento.apartamento}`);
    console.log(`   Tempo ativo: ${carregamento.minutos_ativo} minutos`);
    console.log(`   Notificação enviada: ${carregamento.notificacao_inicio_enviada ? 'SIM' : 'NÃO'}`);
    console.log(`   Notificações ativas: ${carregamento.notificacoes_ativas ? 'SIM' : 'NÃO'}`);

    // 2. Validações
    if (!carregamento.notificacoes_ativas) {
      console.error('\n❌ Morador com notificações DESATIVADAS!');
      await pool.end();
      return;
    }

    if (!carregamento.telefone) {
      console.error('\n❌ Morador sem telefone!');
      await pool.end();
      return;
    }

    // 3. Buscar configurações Evolution API
    console.log('\n🔍 Buscando configurações Evolution API...');
    const configResult = await pool.query(
      "SELECT chave, valor FROM configuracoes_sistema WHERE chave LIKE 'evolution_%'"
    );

    const config: any = {};
    configResult.rows.forEach((row: any) => {
      config[row.chave] = row.valor;
    });

    console.log('✅ Evolution API configurada');

    // 4. Buscar template
    console.log('\n🔍 Buscando template inicio_recarga...');
    const templateResult = await pool.query(
      "SELECT * FROM templates_notificacao WHERE tipo = 'inicio_recarga' AND ativo = true"
    );

    if (templateResult.rows.length === 0) {
      console.error('❌ Template não encontrado ou inativo!');
      await pool.end();
      return;
    }

    const template = templateResult.rows[0];
    console.log('✅ Template encontrado');
    console.log(`   Tipo: ${template.tipo}`);
    console.log(`   Tempo mínimo: ${template.tempo_minutos} minutos`);
    console.log(`   Power threshold: ${template.power_threshold_w || 'N/A'}`);

    // 5. Renderizar mensagem
    console.log('\n📝 Renderizando mensagem...');
    let mensagem = template.mensagem;
    mensagem = mensagem.replace(/{{nome}}/g, carregamento.nome);
    mensagem = mensagem.replace(/{{charger}}/g, carregamento.charger_name);
    mensagem = mensagem.replace(/{{localizacao}}/g, 'General Luiz de França Albuquerque, Maceió');
    mensagem = mensagem.replace(/{{data}}/g, new Date().toLocaleString('pt-BR'));
    mensagem = mensagem.replace(/{{apartamento}}/g, carregamento.apartamento || 'N/A');

    console.log('\n📄 MENSAGEM FINAL:');
    console.log('─────────────────────────────────────────');
    console.log(mensagem);
    console.log('─────────────────────────────────────────');

    // 6. Enviar via Evolution API
    console.log('\n📱 ENVIANDO VIA EVOLUTION API...');
    console.log(`   Para: ${carregamento.telefone}`);

    const url = `${config.evolution_api_url}/message/sendText/${config.evolution_instance}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': config.evolution_api_key
    };
    const data = {
      number: carregamento.telefone,
      text: mensagem
    };

    try {
      const response = await axios.post(url, data, { headers });

      console.log('\n✅✅✅ WHATSAPP ENVIADO COM SUCESSO! ✅✅✅');
      console.log('\n📊 Resposta da Evolution API:');
      console.log(`   Status: ${response.data.status || 'PENDING'}`);
      console.log(`   Message ID: ${response.data.key?.id || 'N/A'}`);

      // 7. Salvar log no banco
      console.log('\n💾 Salvando log no banco...');
      await pool.query(
        `INSERT INTO logs_notificacoes 
         (morador_id, tipo, status, telefone, mensagem_enviada)
         VALUES ($1, $2, $3, $4, $5)`,
        [carregamento.morador_id, 'inicio', 'enviado', carregamento.telefone, mensagem]
      );
      console.log('✅ Log salvo');

      // 8. Marcar como enviada
      console.log('\n✅ Marcando carregamento como notificação enviada...');
      await pool.query(
        'UPDATE carregamentos SET notificacao_inicio_enviada = true WHERE id = $1',
        [carregamento.id]
      );
      console.log('✅ Carregamento marcado');

      // Resultado final
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                                                               ║');
      console.log('║         ✅✅✅ TESTE COMPLETO BEM-SUCEDIDO! ✅✅✅              ║');
      console.log('║                                                               ║');
      console.log('║   TODO O FLUXO EXECUTADO COM SUCESSO:                         ║');
      console.log('║                                                               ║');
      console.log('║   ✅ Banco Render conectado                                   ║');
      console.log('║   ✅ Carregamento real buscado                                ║');
      console.log('║   ✅ Template do banco carregado                              ║');
      console.log('║   ✅ Placeholders renderizados                                ║');
      console.log('║   ✅ WhatsApp enviado via Evolution API                       ║');
      console.log('║   ✅ Log salvo no banco                                       ║');
      console.log('║   ✅ Carregamento marcado como enviado                        ║');
      console.log('║                                                               ║');
      console.log('║   🎯 Sistema 100% VALIDADO!                                   ║');
      console.log('║                                                               ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');

      console.log('\n🎯 CONFIRME AGORA:');
      console.log(`   Verifique o WhatsApp: ${carregamento.telefone}`);
      console.log(`   Destinatário: ${carregamento.nome}`);
      console.log('');
      console.log('   A mensagem deve ter chegado AGORA!');

    } catch (apiError: any) {
      console.error('\n❌ ERRO AO ENVIAR VIA EVOLUTION API:');
      console.error(`   Status: ${apiError.response?.status}`);
      console.error(`   Mensagem: ${apiError.response?.data?.message || apiError.message}`);
      
      if (apiError.response?.data) {
        console.error('\n🔍 Resposta completa:');
        console.error(JSON.stringify(apiError.response.data, null, 2));
      }

      // Salvar log de falha
      await pool.query(
        `INSERT INTO logs_notificacoes 
         (morador_id, tipo, status, telefone, mensagem_enviada, erro)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          carregamento.morador_id,
          'inicio',
          'falha',
          carregamento.telefone,
          mensagem,
          apiError.response?.data?.message || apiError.message
        ]
      );
    }

    await pool.end();

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:');
    console.error(`   ${error.message}`);
    console.error('\n🔍 Stack trace:');
    console.error(error.stack);
    await pool.end();
  }

  console.log('\n');
};

testarFernandoRender();

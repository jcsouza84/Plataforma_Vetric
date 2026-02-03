import { query } from './apps/backend/src/config/database';
import axios from 'axios';

const enviarWhatsAppDireto = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        🚀 TESTE REAL - ENVIO DIRETO DE WHATSAPP               ║
║                                                               ║
║   ⚠️  Este teste ENVIARÁ WhatsApp de VERDADE!                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  try {
    // 1. Buscar configurações Evolution API
    console.log('🔍 Buscando configurações Evolution API...');
    const configs = await query(
      "SELECT chave, valor FROM configuracoes_sistema WHERE chave LIKE 'evolution_%'"
    );

    const evolutionConfig: any = {};
    configs.forEach((c: any) => {
      evolutionConfig[c.chave] = c.valor;
    });

    console.log('✅ Configurações encontradas:');
    console.log(`   URL: ${evolutionConfig.evolution_api_url}`);
    console.log(`   Instance: ${evolutionConfig.evolution_instance}`);
    console.log(`   Key: ${evolutionConfig.evolution_api_key?.substring(0, 10)}...`);

    // 2. Buscar morador de teste
    console.log('\n🔍 Buscando morador de teste...');
    const moradores = await query(
      `SELECT id, nome, telefone, apartamento 
       FROM moradores 
       WHERE telefone IS NOT NULL 
         AND notificacoes_ativas = true 
       LIMIT 1`
    );

    if (moradores.length === 0) {
      console.error('❌ Nenhum morador com notificações ativas encontrado!');
      return;
    }

    const morador = moradores[0];
    console.log('✅ Morador encontrado:');
    console.log(`   ID: ${morador.id}`);
    console.log(`   Nome: ${morador.nome}`);
    console.log(`   Telefone: ${morador.telefone}`);
    console.log(`   Apartamento: ${morador.apartamento}`);

    // 3. Buscar template
    console.log('\n🔍 Buscando template de notificação...');
    const templates = await query(
      "SELECT * FROM templates_notificacao WHERE tipo = 'inicio_recarga'"
    );

    if (templates.length === 0) {
      console.error('❌ Template não encontrado!');
      return;
    }

    const template = templates[0];
    console.log('✅ Template encontrado:');
    console.log(`   Tipo: ${template.tipo}`);
    console.log(`   Ativo: ${template.ativo}`);

    // 4. Renderizar mensagem
    let mensagem = template.mensagem;
    mensagem = mensagem.replace(/{{nome}}/g, morador.nome);
    mensagem = mensagem.replace(/{{charger}}/g, 'Gran Marine 3 (TESTE)');
    mensagem = mensagem.replace(/{{localizacao}}/g, 'General Luiz de França Albuquerque, Maceió');
    mensagem = mensagem.replace(/{{data}}/g, new Date().toLocaleString('pt-BR'));
    mensagem = mensagem.replace(/{{apartamento}}/g, morador.apartamento || 'N/A');

    console.log('\n📄 MENSAGEM FINAL:');
    console.log('─────────────────────────────────────────');
    console.log(mensagem);
    console.log('─────────────────────────────────────────');

    // 5. Enviar via Evolution API
    console.log('\n📱 ENVIANDO VIA EVOLUTION API...');
    console.log(`   Para: ${morador.telefone}`);

    const url = `${evolutionConfig.evolution_api_url}/message/sendText/${evolutionConfig.evolution_instance}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': evolutionConfig.evolution_api_key
    };
    const data = {
      number: morador.telefone,
      text: mensagem
    };

    console.log(`   URL: ${url}`);
    console.log(`   Number: ${morador.telefone}`);

    try {
      const response = await axios.post(url, data, { headers });

      console.log('\n✅✅✅ WHATSAPP ENVIADO COM SUCESSO! ✅✅✅');
      console.log('\n📊 Resposta da Evolution API:');
      console.log(JSON.stringify(response.data, null, 2));

      // 6. Salvar log
      await query(
        `INSERT INTO logs_notificacoes 
         (morador_id, tipo, status, telefone, mensagem_enviada)
         VALUES ($1, $2, $3, $4, $5)`,
        [morador.id, 'inicio', 'enviado', morador.telefone, mensagem]
      );
      console.log('\n✅ Log salvo no banco de dados');

      console.log('\n🎯 VERIFIQUE O WHATSAPP AGORA!');
      console.log(`   Destinatário: ${morador.nome}`);
      console.log(`   Telefone: ${morador.telefone}`);

    } catch (apiError: any) {
      console.error('\n❌ ERRO AO ENVIAR WHATSAPP:');
      console.error(`   Status: ${apiError.response?.status}`);
      console.error(`   Mensagem: ${apiError.response?.data?.message || apiError.message}`);
      console.error('\n🔍 Resposta completa:');
      console.error(JSON.stringify(apiError.response?.data, null, 2));

      // Salvar log de falha
      await query(
        `INSERT INTO logs_notificacoes 
         (morador_id, tipo, status, telefone, mensagem_enviada, erro)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          morador.id, 
          'inicio', 
          'falha', 
          morador.telefone, 
          mensagem,
          apiError.response?.data?.message || apiError.message
        ]
      );
    }

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:');
    console.error(`   ${error.message}`);
    console.error('\n🔍 Stack trace:');
    console.error(error.stack);
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║                    🎯 TESTE CONCLUÍDO!                        ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
};

enviarWhatsAppDireto();

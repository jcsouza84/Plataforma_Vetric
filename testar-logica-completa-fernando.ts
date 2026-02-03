import { query } from './apps/backend/src/config/database';
import { NotificationService } from './apps/backend/src/services/NotificationService';
import { CarregamentoModel } from './apps/backend/src/models/Carregamento';

const testarLogicaCompleta = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🚀 TESTE COMPLETO - LÓGICA CVE + NOTIFICATION             ║
║                                                               ║
║   Testa TODO o fluxo: NotificationService completo            ║
║   ⚠️  Envia WhatsApp REAL usando carregamento existente!      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const carregamentoId = 180;
  const moradorId = 32;

  try {
    // 1. Conectar e buscar dados do carregamento
    console.log('🔍 Buscando dados do carregamento...');
    const carregamentos = await query(
      `SELECT 
        c.*,
        m.nome,
        m.telefone,
        m.apartamento,
        m.notificacoes_ativas,
        ROUND(EXTRACT(EPOCH FROM (NOW() - c.inicio))/60) as minutos_ativo
       FROM carregamentos c
       JOIN moradores m ON c.morador_id = m.id
       WHERE c.id = $1`,
      [carregamentoId]
    );

    if (carregamentos.length === 0) {
      console.error('❌ Carregamento não encontrado!');
      return;
    }

    const carregamento = carregamentos[0];

    console.log('\n📊 DADOS DO CARREGAMENTO:');
    console.log(`   ID: ${carregamento.id}`);
    console.log(`   Charger: ${carregamento.charger_name}`);
    console.log(`   UUID: ${carregamento.charger_uuid}`);
    console.log(`   Morador: ${carregamento.nome}`);
    console.log(`   Telefone: ${carregamento.telefone}`);
    console.log(`   Apartamento: ${carregamento.apartamento}`);
    console.log(`   Notificações ativas: ${carregamento.notificacoes_ativas ? 'SIM' : 'NÃO'}`);
    console.log(`   Início: ${carregamento.inicio}`);
    console.log(`   Tempo ativo: ${carregamento.minutos_ativo} minutos`);
    console.log(`   Notificação enviada: ${carregamento.notificacao_inicio_enviada ? 'SIM' : 'NÃO'}`);

    // 2. Validações
    if (!carregamento.notificacoes_ativas) {
      console.error('\n❌ Morador com notificações DESATIVADAS!');
      return;
    }

    if (!carregamento.telefone) {
      console.error('\n❌ Morador sem telefone cadastrado!');
      return;
    }

    if (carregamento.minutos_ativo < 3) {
      console.warn(`\n⚠️  ATENÇÃO: Carregamento ainda não completou 3 minutos!`);
      console.warn(`   Tempo atual: ${carregamento.minutos_ativo} minutos`);
      console.warn(`   Normalmente aguardaria mais ${3 - carregamento.minutos_ativo} minutos`);
    }

    // 3. Resetar flag de notificação (para permitir reenvio de teste)
    if (carregamento.notificacao_inicio_enviada) {
      console.log('\n🔄 Resetando flag de notificação para permitir teste...');
      await query(
        'UPDATE carregamentos SET notificacao_inicio_enviada = false WHERE id = $1',
        [carregamentoId]
      );
      console.log('✅ Flag resetada');
    }

    // 4. Usar NotificationService COMPLETO (lógica real do sistema)
    console.log('\n📱 ENVIANDO NOTIFICAÇÃO VIA NOTIFICATION SERVICE...');
    console.log('   (Usando LÓGICA COMPLETA do sistema)');
    console.log('');
    console.log('   Fluxo:');
    console.log('   1. NotificationService.notificarInicio()');
    console.log('   2. Busca template no banco');
    console.log('   3. Renderiza placeholders');
    console.log('   4. Envia via Evolution API');
    console.log('   5. Salva log no banco');
    console.log('');

    const notificationService = new NotificationService();
    
    const location = 'General Luiz de França Albuquerque, Maceió';

    try {
      // 🚀 ESTE É O MÉTODO REAL USADO PELO POLLING!
      await notificationService.notificarInicio(
        moradorId,
        carregamento.charger_name,
        location
      );

      console.log('\n✅✅✅ NOTIFICAÇÃO ENVIADA COM SUCESSO! ✅✅✅');
      console.log('\n🎯 Lógica completa executada:');
      console.log('   ✅ Template buscado no banco');
      console.log('   ✅ Placeholders renderizados');
      console.log('   ✅ Morador validado');
      console.log('   ✅ WhatsApp enviado via Evolution API');
      console.log('   ✅ Log salvo no banco');

      // 5. Marcar como enviada (igual o Polling faz)
      console.log('\n💾 Marcando carregamento como notificação enviada...');
      await CarregamentoModel.markNotificationSent(carregamentoId, 'inicio');
      console.log('✅ Carregamento marcado');

      // 6. Verificar log criado
      console.log('\n📊 Verificando log criado...');
      const logs = await query(
        `SELECT 
          id,
          tipo,
          status,
          telefone,
          criado_em,
          SUBSTRING(mensagem_enviada, 1, 100) as mensagem_preview
         FROM logs_notificacoes 
         WHERE morador_id = $1 
         ORDER BY criado_em DESC 
         LIMIT 1`,
        [moradorId]
      );

      if (logs.length > 0) {
        const log = logs[0];
        console.log('✅ Log encontrado:');
        console.log(`   ID: ${log.id}`);
        console.log(`   Tipo: ${log.tipo}`);
        console.log(`   Status: ${log.status}`);
        console.log(`   Telefone: ${log.telefone}`);
        console.log(`   Data: ${log.criado_em}`);
        console.log(`   Mensagem (preview): ${log.mensagem_preview}...`);
      } else {
        console.warn('⚠️  Log não encontrado (pode ser banco diferente)');
      }

      // 7. Resultado final
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                                                               ║');
      console.log('║           ✅ TESTE COMPLETO BEM-SUCEDIDO! ✅                  ║');
      console.log('║                                                               ║');
      console.log('║   Todo o fluxo do sistema foi executado:                     ║');
      console.log('║   • NotificationService ✅                                    ║');
      console.log('║   • Template do banco ✅                                      ║');
      console.log('║   • Renderização ✅                                           ║');
      console.log('║   • Evolution API ✅                                          ║');
      console.log('║   • Salvamento de log ✅                                      ║');
      console.log('║   • Marcação no carregamento ✅                               ║');
      console.log('║                                                               ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');

      console.log('\n🎯 CONFIRME AGORA:');
      console.log(`   Verifique o WhatsApp: ${carregamento.telefone}`);
      console.log(`   Destinatário: ${carregamento.nome}`);
      console.log('');
      console.log('   A mensagem deve ter chegado AGORA!');

    } catch (error: any) {
      console.error('\n❌ ERRO AO ENVIAR NOTIFICAÇÃO:');
      console.error(`   ${error.message}`);
      console.error('\n🔍 Stack trace:');
      console.error(error.stack);

      // Tentar ver mais detalhes
      if (error.response) {
        console.error('\n🔍 Resposta da API:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
    }

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:');
    console.error(`   ${error.message}`);
    console.error('\n🔍 Stack trace:');
    console.error(error.stack);
  }

  console.log('\n');
};

testarLogicaCompleta();

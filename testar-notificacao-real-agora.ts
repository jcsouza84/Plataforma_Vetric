import { query } from './apps/backend/src/config/database';
import { NotificationService } from './apps/backend/src/services/NotificationService';
import { MoradorModel } from './apps/backend/src/models/Morador';
import { CarregamentoModel } from './apps/backend/src/models/Carregamento';

const executarTesteReal = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        🚀 TESTE REAL - ENVIO DE WHATSAPP                      ║
║                                                               ║
║   ⚠️  ATENÇÃO: Este teste ENVIARÁ WhatsApp de VERDADE!        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  try {
    // 1. Conectar ao banco
    await query('SELECT 1');
    console.log('✅ Conectado ao banco de dados');

    // 2. Buscar morador Vetric (usuário de teste)
    const morador = await MoradorModel.findById(1); // Vetric (teste)
    if (!morador) {
      console.error('❌ Morador não encontrado');
      return;
    }

    console.log(`\n📋 DADOS DO MORADOR:`);
    console.log(`   Nome: ${morador.nome}`);
    console.log(`   Telefone: ${morador.telefone}`);
    console.log(`   Apartamento: ${morador.apartamento || 'N/A'}`);
    console.log(`   Notificações: ${morador.notificacoes_ativas ? 'ATIVAS' : 'DESATIVADAS'}`);

    if (!morador.notificacoes_ativas) {
      console.error('❌ Notificações desativadas para este morador!');
      return;
    }

    if (!morador.telefone) {
      console.error('❌ Morador sem telefone cadastrado!');
      return;
    }

    // 3. Criar um novo carregamento de teste
    console.log(`\n🔋 CRIANDO CARREGAMENTO DE TESTE...`);
    const carregamentoTeste = await CarregamentoModel.create({
      moradorId: morador.id!,
      chargerUuid: 'test-uuid-' + Date.now(),
      chargerName: 'Gran Marine 3 (TESTE)',
      connectorId: 1,
      status: 'carregando'
    });

    console.log(`✅ Carregamento de teste criado: ID ${carregamentoTeste.id}`);

    // 4. Enviar notificação REAL
    console.log(`\n📱 ENVIANDO NOTIFICAÇÃO REAL VIA WHATSAPP...`);
    console.log(`   Para: ${morador.telefone}`);
    console.log(`   Tipo: Início de Recarga`);
    console.log(`   Charger: Gran Marine 3 (TESTE)`);

    const notificationService = new NotificationService();
    
    try {
      await notificationService.notificarInicio(
        morador.id!,
        'Gran Marine 3 (TESTE)',
        'General Luiz de França Albuquerque, Maceió'
      );

      console.log(`\n✅✅✅ NOTIFICAÇÃO ENVIADA COM SUCESSO! ✅✅✅`);
      console.log(`\n🎯 AGORA VERIFIQUE O WHATSAPP DE ${morador.nome}`);
      console.log(`   Telefone: ${morador.telefone}`);

      // Marcar como enviada
      await CarregamentoModel.markNotificationSent(carregamentoTeste.id!, 'inicio');
      console.log(`✅ Carregamento marcado com notificação enviada`);

      // Verificar log criado
      const logs = await query(
        'SELECT * FROM logs_notificacoes WHERE morador_id = $1 ORDER BY criado_em DESC LIMIT 1',
        [morador.id]
      );

      if (logs.length > 0) {
        console.log(`\n📝 LOG CRIADO NO BANCO:`);
        console.log(`   ID: ${logs[0].id}`);
        console.log(`   Tipo: ${logs[0].tipo}`);
        console.log(`   Status: ${logs[0].status}`);
        console.log(`   Data: ${logs[0].criado_em}`);
      }

      // Limpar carregamento de teste
      console.log(`\n🧹 LIMPANDO CARREGAMENTO DE TESTE...`);
      await query('DELETE FROM carregamentos WHERE id = $1', [carregamentoTeste.id]);
      console.log(`✅ Carregamento de teste removido`);

    } catch (error: any) {
      console.error(`\n❌ ERRO AO ENVIAR NOTIFICAÇÃO:`);
      console.error(`   ${error.message}`);
      console.error(`\n🔍 Stack trace:`);
      console.error(error.stack);

      // Limpar carregamento de teste mesmo com erro
      await query('DELETE FROM carregamentos WHERE id = $1', [carregamentoTeste.id]);
    }

  } catch (error: any) {
    console.error(`\n❌ ERRO FATAL:`);
    console.error(`   ${error.message}`);
  }

  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║                                                               ║`);
  console.log(`║                    🎯 TESTE CONCLUÍDO!                        ║`);
  console.log(`║                                                               ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
};

executarTesteReal();

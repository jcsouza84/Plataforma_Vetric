/**
 * 🧪 Script de Teste - Identificação de Morador
 * 
 * Este script testa se o sistema está identificando corretamente
 * os moradores nos carregadores em uso.
 */

import { cveService } from './src/services/CVEService';
import { query } from './src/config/database';

async function testMoradorIdentification() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║      🧪 TESTE: Identificação de Morador                  ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Verificar carregamentos ativos no banco
    console.log('📊 1. Verificando carregamentos ativos no banco...\n');
    
    const carregamentosAtivos = await query<{
      id: number;
      charger_uuid: string;
      connector_id: number;
      status: string;
      morador_nome: string;
      morador_apartamento: string;
      tag_rfid: string;
    }>(
      `SELECT 
        c.id,
        c.charger_uuid,
        c.connector_id,
        c.status,
        m.nome as morador_nome,
        m.apartamento as morador_apartamento,
        m.tag_rfid
      FROM carregamentos c
      LEFT JOIN moradores m ON c.morador_id = m.id
      WHERE c.status IN ('iniciado', 'carregando')
      ORDER BY c.inicio DESC`
    );

    if (carregamentosAtivos.length === 0) {
      console.log('⚠️  Nenhum carregamento ativo encontrado no banco.');
      console.log('   Para testar, inicie um carregamento ou insira dados de teste.\n');
    } else {
      console.log(`✅ ${carregamentosAtivos.length} carregamento(s) ativo(s) encontrado(s):\n`);
      
      carregamentosAtivos.forEach((c, index) => {
        console.log(`   ${index + 1}. Carregador: ${c.charger_uuid}`);
        console.log(`      Conector: ${c.connector_id}`);
        console.log(`      Status: ${c.status}`);
        console.log(`      Morador: ${c.morador_nome || 'NÃO IDENTIFICADO'}`);
        console.log(`      Apartamento: ${c.morador_apartamento || '-'}`);
        console.log(`      Tag RFID: ${c.tag_rfid || '-'}\n`);
      });
    }

    // 2. Testar método getChargerWithMoradorInfo
    console.log('🔍 2. Testando método getChargerWithMoradorInfo...\n');
    
    if (carregamentosAtivos.length > 0) {
      const primeiroCarregamento = carregamentosAtivos[0];
      
      const morador = await cveService.getChargerWithMoradorInfo(
        primeiroCarregamento.charger_uuid,
        primeiroCarregamento.connector_id
      );
      
      if (morador) {
        console.log(`✅ Morador identificado com sucesso!`);
        console.log(`   Nome: ${morador.nome}`);
        console.log(`   Apartamento: ${morador.apartamento}\n`);
      } else {
        console.log(`❌ Falha ao identificar morador.`);
        console.log(`   UUID: ${primeiroCarregamento.charger_uuid}`);
        console.log(`   Conector: ${primeiroCarregamento.connector_id}\n`);
      }
    }

    // 3. Testar endpoint /api/dashboard/chargers
    console.log('🌐 3. Testando método getChargersWithMoradores...\n');
    
    const chargers = await cveService.getChargersWithMoradores();
    
    console.log(`✅ ${chargers.length} carregador(es) encontrado(s):\n`);
    
    chargers.forEach((charger: any, index: number) => {
      const connector = charger.connectors?.[0];
      const morador = charger.morador;
      
      console.log(`   ${index + 1}. ${charger.description || charger.chargeBoxId}`);
      console.log(`      UUID: ${charger.uuid}`);
      console.log(`      Status: ${connector?.lastStatus?.status || 'Unavailable'}`);
      
      if (morador) {
        console.log(`      ✅ Morador: ${morador.nome} (Apto ${morador.apartamento})`);
      } else {
        console.log(`      ⚪ Morador: —`);
      }
      console.log('');
    });

    // 4. Resumo dos testes
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                     RESUMO DOS TESTES                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const chargersComMorador = chargers.filter((c: any) => c.morador !== null).length;
    const chargersSemMorador = chargers.filter((c: any) => c.morador === null).length;
    
    console.log(`   Total de carregadores: ${chargers.length}`);
    console.log(`   Com morador identificado: ${chargersComMorador}`);
    console.log(`   Sem morador: ${chargersSemMorador}`);
    console.log(`   Carregamentos ativos no banco: ${carregamentosAtivos.length}\n`);
    
    if (carregamentosAtivos.length > 0 && chargersComMorador > 0) {
      console.log('✅ TESTE PASSOU: Sistema identificando moradores corretamente!\n');
    } else if (carregamentosAtivos.length === 0) {
      console.log('⚠️  TESTE INCONCLUSIVO: Nenhum carregamento ativo para testar.\n');
      console.log('   Sugestões:');
      console.log('   1. Inicie um carregamento real');
      console.log('   2. Ou execute o script de dados de teste:\n');
      console.log('      npm run seed:test-carregamento\n');
    } else {
      console.log('❌ TESTE FALHOU: Carregamentos ativos mas moradores não identificados.\n');
      console.log('   Verifique:');
      console.log('   1. Se os UUIDs dos carregadores estão corretos');
      console.log('   2. Se o WebSocket está conectado e salvando dados');
      console.log('   3. Se há moradores cadastrados com tag_rfid\n');
    }

  } catch (error: any) {
    console.error('\n❌ ERRO durante o teste:', error.message);
    console.error(error);
  }
}

// Executar teste
testMoradorIdentification()
  .then(() => {
    console.log('🏁 Teste finalizado!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


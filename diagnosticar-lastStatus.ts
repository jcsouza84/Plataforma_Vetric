/**
 * 🔍 DIAGNÓSTICO: O que vem no lastStatus do CVE?
 */

import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function diagnosticar() {
  try {
    console.log('🔑 Autenticando...\n');
    await cveService.login();
    
    console.log('📊 Buscando carregadores...\n');
    const chargers = await cveService.getChargers();
    
    console.log(`✅ ${chargers.length} carregadores encontrados\n`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (const charger of chargers) {
      const connector = charger.connectors?.[0];
      if (!connector) continue;
      
      const status = connector.lastStatus?.status;
      
      console.log(`\n🔌 ${charger.description || charger.chargeBoxId}`);
      console.log(`   UUID: ${charger.uuid}`);
      console.log(`   chargeBoxId: ${charger.chargeBoxId}`);
      console.log(`   Status: ${status}`);
      
      if (status === 'Charging' || status === 'Occupied') {
        console.log(`\n   🔍 CARREGADOR ATIVO! Analisando lastStatus...\n`);
        console.log('   ╔════════════════════════════════════════════════╗');
        console.log('   ║         lastStatus COMPLETO:                  ║');
        console.log('   ╚════════════════════════════════════════════════╝\n');
        console.log(JSON.stringify(connector.lastStatus, null, 3));
        console.log('\n   ╔════════════════════════════════════════════════╗');
        console.log('   ║         connector COMPLETO:                    ║');
        console.log('   ╚════════════════════════════════════════════════╝\n');
        console.log(JSON.stringify(connector, null, 3));
      }
      
      console.log('\n───────────────────────────────────────────────────────');
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

diagnosticar();


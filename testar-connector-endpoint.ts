/**
 * 🎯 TESTE: GET /api/v1/chargepoints/connector/{connectorPk}
 * Buscar usuário carregando no conector
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarConnectorEndpoint() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    // Buscar carregadores para pegar connectorPk
    console.log('📊 Buscando carregadores...\n');
    const chargers = await cveService.getChargers();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔌 CARREGADORES E SEUS CONECTORES:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (const charger of chargers) {
      const connector = charger.connectors?.[0];
      if (!connector) continue;
      
      const status = connector.lastStatus?.status;
      const isActive = status === 'Charging' || status === 'Occupied';
      
      console.log(`${isActive ? '🟢' : '⚪'} ${charger.description}`);
      console.log(`   connectorPk: ${connector.connectorPk}`);
      console.log(`   Status: ${status}\n`);
    }
    
    // Testar com TODOS os conectores (ativos e inativos)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 TESTANDO ENDPOINT PARA CADA CONECTOR');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Api-Key': process.env.CVE_API_KEY || '',
      'Platform': 'API',
    };
    
    for (const charger of chargers) {
      const connector = charger.connectors?.[0];
      if (!connector) continue;
      
      const connectorPk = connector.connectorPk;
      const status = connector.lastStatus?.status;
      
      console.log(`\n─────────────────────────────────────────────────────`);
      console.log(`🔌 ${charger.description}`);
      console.log(`   connectorPk: ${connectorPk}`);
      console.log(`   Status: ${status}`);
      console.log(`─────────────────────────────────────────────────────`);
      
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br/api/v1/chargepoints/connector/${connectorPk}`,
          {
            headers,
            timeout: 5000
          }
        );
        
        console.log('✅ SUCESSO!');
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.data.currentChargingUserName) {
          console.log(`\n🎯 ✅ USUÁRIO ENCONTRADO: "${response.data.currentChargingUserName}"`);
        } else {
          console.log('\n⚪ Nenhum usuário carregando no momento');
        }
        
      } catch (error: any) {
        const status = error.response?.status;
        console.log(`❌ Erro: ${status}`);
        
        if (error.response?.data) {
          console.log('Mensagem:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
    // Teste adicional: Testar SEM Platform header
    const activeCharger = chargers.find(c => 
      c.connectors?.[0]?.lastStatus?.status === 'Charging'
    );
    
    if (activeCharger) {
      const connector = activeCharger.connectors[0];
      
      console.log('\n\n═══════════════════════════════════════════════════════');
      console.log('🧪 TESTE ADICIONAL: SEM Platform header');
      console.log(`   Carregador: ${activeCharger.description}`);
      console.log(`   connectorPk: ${connector.connectorPk}`);
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br/api/v1/chargepoints/connector/${connector.connectorPk}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Api-Key': process.env.CVE_API_KEY || '',
            },
            timeout: 5000
          }
        );
        
        console.log('✅ SUCESSO (sem Platform)!');
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
      } catch (error: any) {
        console.log(`❌ Erro: ${error.response?.status}`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarConnectorEndpoint();


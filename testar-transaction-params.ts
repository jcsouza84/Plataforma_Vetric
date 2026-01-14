/**
 * 🧪 TESTE: /api/v1/transaction com diferentes parâmetros
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarParametros() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    // Primeiro, buscar os carregadores para pegar UUIDs reais
    const chargers = await cveService.getChargers();
    const activeCharger = chargers.find(c => c.connectors?.[0]?.lastStatus?.status === 'Charging');
    
    if (activeCharger) {
      console.log(`✅ Carregador ativo encontrado: ${activeCharger.description}`);
      console.log(`   UUID: ${activeCharger.uuid}`);
      console.log(`   chargeBoxId: ${activeCharger.chargeBoxId}\n`);
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 TESTANDO /api/v1/transaction COM PARÂMETROS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const testParams = [
      { status: 'Active' },
      { active: true },
      { isActive: true },
      { completed: false },
      { chargeBoxId: activeCharger?.chargeBoxId },
      { chargeBoxUuid: activeCharger?.uuid },
      { connectorId: 1 },
      { chargeBoxId: activeCharger?.chargeBoxId, connectorId: 1 },
      { chargeBoxUuid: activeCharger?.uuid, connectorId: 1 },
      { chargeBoxId: activeCharger?.chargeBoxId, status: 'Active' },
      { limit: 10 },
      { page: 1, limit: 10 },
    ];
    
    for (const params of testParams) {
      try {
        const response = await axios.get(
          'https://cs.intelbras-cve-pro.com.br/api/v1/transaction',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Api-Key': process.env.CVE_API_KEY || ''
            },
            params,
            timeout: 5000
          }
        );
        
        console.log(`✅ SUCESSO com parâmetros:`, JSON.stringify(params));
        console.log(`   Status: ${response.status}`);
        console.log(`   Resposta:\n`);
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n───────────────────────────────────────────────────────\n');
        
      } catch (error: any) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        if (status === 400) {
          console.log(`❌ 400 com:`, JSON.stringify(params));
          if (errorData && typeof errorData === 'object' && errorData.message) {
            console.log(`   Mensagem: ${errorData.message}`);
          }
        } else if (status) {
          console.log(`⚠️  ${status} com:`, JSON.stringify(params));
        }
      }
    }
    
    // Testar também GET simples para ver a mensagem de erro
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 TESTE: GET /api/v1/transaction SEM parâmetros (ver erro)');
    console.log('═══════════════════════════════════════════════════════\n');
    
    try {
      await axios.get(
        'https://cs.intelbras-cve-pro.com.br/api/v1/transaction',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Api-Key': process.env.CVE_API_KEY || ''
          },
          timeout: 5000
        }
      );
    } catch (error: any) {
      console.log(`Status: ${error.response?.status}`);
      console.log(`Erro completo:`);
      console.log(JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarParametros();


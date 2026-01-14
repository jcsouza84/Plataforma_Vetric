/**
 * 🔍 BUSCAR: transactionPk de uma transação ativa
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function buscarTransactionPk() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    console.log('📊 Buscando carregadores...\n');
    const chargers = await cveService.getChargers();
    
    const activeCharger = chargers.find(c => 
      c.connectors?.[0]?.lastStatus?.status === 'Charging'
    );
    
    if (!activeCharger) {
      console.log('⚠️  Nenhum carregador ativo no momento');
      return;
    }
    
    console.log(`✅ Carregador ativo: ${activeCharger.description}`);
    console.log(`   UUID: ${activeCharger.uuid}`);
    console.log(`   chargeBoxId: ${activeCharger.chargeBoxId}`);
    console.log(`   Status: ${activeCharger.connectors[0].lastStatus.status}`);
    console.log(`   Duração: ${activeCharger.connectors[0].lastStatus.totalDuration}s\n`);
    
    // Tentar buscar detalhes do conector específico
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 TENTATIVA 1: Buscar conector específico');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const connectorEndpoints = [
      `/api/v1/chargeBoxes/${activeCharger.chargeBoxId}/connectors/1`,
      `/api/v1/chargeboxes/${activeCharger.chargeBoxId}/connectors/1`,
      `/api/v1/charge-boxes/${activeCharger.chargeBoxId}/connectors/1`,
      `/api/v1/chargepoints/${activeCharger.chargeBoxId}/connectors/1`,
      `/api/v1/chargepoint/${activeCharger.chargeBoxId}/connector/1`,
    ];
    
    for (const endpoint of connectorEndpoints) {
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br${endpoint}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Api-Key': process.env.CVE_API_KEY || ''
            },
            timeout: 5000
          }
        );
        
        console.log(`✅ SUCESSO: ${endpoint}\n`);
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.currentTransaction) {
          console.log(`\n🎯 currentTransaction encontrado:`);
          console.log(JSON.stringify(response.data.currentTransaction, null, 2));
        }
        
        if (response.data.transactionPk || response.data.transactionId) {
          const txId = response.data.transactionPk || response.data.transactionId;
          console.log(`\n🎯 transactionPk/ID: ${txId}`);
          
          // AGORA TESTAR O ENDPOINT QUE VOCÊ MOSTROU!
          console.log('\n═══════════════════════════════════════════════════════');
          console.log(`🧪 TESTANDO: /api/v1/transaction/${txId}`);
          console.log('═══════════════════════════════════════════════════════\n');
          
          const txResponse = await axios.get(
            `https://cs.intelbras-cve-pro.com.br/api/v1/transaction/${txId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Api-Key': process.env.CVE_API_KEY || ''
              }
            }
          );
          
          console.log('✅ SUCESSO! Resposta completa:\n');
          console.log(JSON.stringify(txResponse.data, null, 2));
          
          // Verificar idTag
          if (txResponse.data.idTag) {
            console.log(`\n🎯 ✅ TEM idTag: "${txResponse.data.idTag}"`);
          } else {
            console.log('\n⚠️  NÃO TEM idTag');
          }
        }
        
        break; // Se funcionou, parar
        
      } catch (error: any) {
        const status = error.response?.status;
        if (status !== 404) {
          console.log(`⚠️  ${endpoint} - Status ${status}`);
        }
      }
    }
    
    // Se não encontrou via conector, tentar endpoints alternativos
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 TENTATIVA 2: Endpoints alternativos');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const alternativeEndpoints = [
      `/api/v1/chargepoint/${activeCharger.uuid}`,
      `/api/v1/charge-box/${activeCharger.uuid}`,
      `/api/v1/chargebox/${activeCharger.chargeBoxId}`,
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br${endpoint}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Api-Key': process.env.CVE_API_KEY || ''
            },
            timeout: 5000
          }
        );
        
        console.log(`✅ ${endpoint}`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 500));
        console.log('\n');
        
      } catch (error: any) {
        // Ignorar 404
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

buscarTransactionPk();


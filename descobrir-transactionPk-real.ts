/**
 * 🔍 DESCOBRIR: Como encontrar um transactionPk real
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function descobrirTransactionPk() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Api-Key': process.env.CVE_API_KEY || '',
      'Platform': 'API',
      'X-Timezone-Offset': -180,
    };
    
    // 1. Buscar carregadores e ver se algum campo tem transactionPk
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 ANALISANDO CARREGADOR ATIVO');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const chargers = await cveService.getChargers();
    const activeCharger = chargers.find(c => 
      c.connectors?.[0]?.lastStatus?.status === 'Charging'
    );
    
    if (activeCharger) {
      console.log(`✅ Carregador ativo: ${activeCharger.description}`);
      console.log(`\n📋 Dados COMPLETOS do carregador:\n`);
      console.log(JSON.stringify(activeCharger, null, 2));
      
      // Procurar por qualquer campo que pareça um transaction ID
      const chargerStr = JSON.stringify(activeCharger);
      const possibleFields = [
        'transactionPk', 'transactionId', 'transaction_pk', 'transaction_id',
        'currentTransactionPk', 'currentTransactionId', 'txPk', 'txId'
      ];
      
      console.log('\n🔍 Procurando campos de transação...\n');
      for (const field of possibleFields) {
        if (chargerStr.includes(field)) {
          console.log(`✅ Encontrado: "${field}"`);
        }
      }
    }
    
    // 2. Tentar endpoint de histórico (últimas transações)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 TENTANDO LISTAR ÚLTIMAS TRANSAÇÕES');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const historyEndpoints = [
      { url: '/api/v1/transaction', params: { page: 1, limit: 5 } },
      { url: '/api/v1/transaction', params: { limit: 5 } },
      { url: '/api/v1/transaction', params: {} },
      { url: '/api/v1/history/transaction', params: { limit: 5 } },
      { url: '/api/v1/transactions/history', params: { limit: 5 } },
      { url: '/api/v1/transaction/list', params: { limit: 5 } },
      { url: '/api/v1/transaction/search', params: { limit: 5 } },
    ];
    
    for (const { url, params } of historyEndpoints) {
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br${url}`,
          {
            headers,
            params: { ...params, timeZone: -3 },
            timeout: 5000
          }
        );
        
        console.log(`✅ ${url} FUNCIONOU!\n`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 1000));
        console.log('\n...(resposta truncada)\n');
        
        // Se tiver transações, pegar o primeiro transactionPk
        if (response.data && Array.isArray(response.data)) {
          const firstTx = response.data[0];
          if (firstTx && (firstTx.transactionPk || firstTx.id)) {
            const txPk = firstTx.transactionPk || firstTx.id;
            console.log(`\n🎯 Primeiro transactionPk encontrado: ${txPk}`);
            
            // Testar endpoint individual
            console.log(`\n🧪 Testando /api/v1/transaction/${txPk}...\n`);
            
            const txResponse = await axios.get(
              `https://cs.intelbras-cve-pro.com.br/api/v1/transaction/${txPk}`,
              {
                headers,
                params: { timeZone: -3 },
                timeout: 5000
              }
            );
            
            console.log('✅ SUCESSO! Detalhes da transação:\n');
            console.log(JSON.stringify(txResponse.data, null, 2));
            
            if (txResponse.data.transaction?.ocppIdTag) {
              console.log(`\n🎯 ✅ ocppIdTag: "${txResponse.data.transaction.ocppIdTag}"`);
            }
          }
        }
        
        break; // Se funcionou, parar
        
      } catch (error: any) {
        const status = error.response?.status;
        if (status && status !== 404) {
          console.log(`⚠️  ${url}: Status ${status}`);
          if (error.response?.data) {
            console.log(`   Erro:`, JSON.stringify(error.response.data).substring(0, 200));
          }
        }
      }
    }
    
    // 3. Verificar se há endpoint de "active" ou "current"
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 TENTANDO ENDPOINTS DE TRANSAÇÕES ATIVAS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const activeEndpoints = [
      '/api/v1/transaction/active',
      '/api/v1/transaction/current',
      '/api/v1/transaction/running',
      '/api/v1/transaction/ongoing',
    ];
    
    for (const url of activeEndpoints) {
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br${url}`,
          {
            headers,
            params: { timeZone: -3 },
            timeout: 5000
          }
        );
        
        console.log(`✅ ${url} FUNCIONOU!\n`);
        console.log(JSON.stringify(response.data, null, 2));
        break;
        
      } catch (error: any) {
        // Silencioso para 404
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

descobrirTransactionPk();


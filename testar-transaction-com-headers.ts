/**
 * 🧪 TESTE: /api/v1/transaction/{transactionPk} com headers corretos
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarTransaction() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Api-Key': process.env.CVE_API_KEY || '',
      'Platform': 'API',
      'X-Timezone-Offset': -180, // GMT-3 (Brasil)
    };
    
    // Estratégia: Testar IDs sequenciais recentes
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 BUSCANDO transactionPk VÁLIDO');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Tentar IDs de 1 a 100000 (começando de trás)
    const testIds = [
      // IDs recentes (mais prováveis)
      100000, 99999, 99998, 99997, 99996, 99995,
      50000, 40000, 30000, 20000, 10000,
      1000, 500, 100, 50, 10, 5, 1
    ];
    
    let foundTransaction = null;
    
    for (const transactionPk of testIds) {
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br/api/v1/transaction/${transactionPk}`,
          {
            headers,
            params: { timeZone: -3 },
            timeout: 3000
          }
        );
        
        console.log(`✅ SUCESSO com transactionPk: ${transactionPk}\n`);
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 RESPOSTA COMPLETA:');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.transaction) {
          const tx = response.data.transaction;
          
          console.log('\n═══════════════════════════════════════════════════════');
          console.log('🎯 INFORMAÇÕES IMPORTANTES:');
          console.log('═══════════════════════════════════════════════════════\n');
          
          console.log(`✅ ocppIdTag: "${tx.ocppIdTag}"`);
          console.log(`✅ userName: "${tx.userName}"`);
          console.log(`✅ userPhone: "${tx.userPhone}"`);
          console.log(`✅ chargeBoxId: "${tx.chargeBoxId}"`);
          console.log(`✅ chargeBoxDescription: "${tx.chargeBoxDescription}"`);
          console.log(`✅ startTimestamp: "${tx.startTimestamp}"`);
          console.log(`✅ stopTimestamp: "${tx.stopTimestamp}"`);
          console.log(`✅ energy: ${tx.energy} kWh`);
          console.log(`✅ duration: ${tx.duration}s`);
          
          foundTransaction = { transactionPk, data: response.data };
        }
        
        break; // Se encontrou, parar
        
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 404) {
          // Não logar 404, é esperado
        } else if (status === 401 || status === 403) {
          console.log(`🔒 Sem permissão para transactionPk ${transactionPk}`);
        } else if (status) {
          console.log(`⚠️  transactionPk ${transactionPk}: Status ${status}`);
        }
      }
    }
    
    if (!foundTransaction) {
      console.log('\n⚠️  Não encontrei nenhum transactionPk válido nos IDs testados');
      console.log('\n💡 Vou tentar outra abordagem...\n');
      
      // Tentar listar todas as transações (sem filtro de status)
      const listEndpoints = [
        '/api/v1/transaction',
        '/transaction',
        '/api/transaction',
        '/api/v1/ocpp/transaction',
      ];
      
      for (const endpoint of listEndpoints) {
        try {
          const response = await axios.get(
            `https://cs.intelbras-cve-pro.com.br${endpoint}`,
            {
              headers,
              params: { 
                timeZone: -3,
                limit: 10,
                page: 1
              },
              timeout: 5000
            }
          );
          
          console.log(`✅ ${endpoint} FUNCIONOU!\n`);
          console.log(JSON.stringify(response.data, null, 2));
          break;
          
        } catch (error: any) {
          // Ignorar erros
        }
      }
    } else {
      console.log('\n\n🎉 SUCESSO! Endpoint funciona!');
      console.log('\n💡 Agora podemos usar esse endpoint no polling service!');
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarTransaction();


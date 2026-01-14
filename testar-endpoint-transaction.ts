/**
 * 🧪 TESTE: Endpoint /api/v1/transaction/{transactionPk}
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarEndpoint() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    // Primeiro, vamos buscar transações ativas para pegar um transactionPk válido
    console.log('📊 Buscando transações ativas...\n');
    
    try {
      const response = await axios.get('https://cs.intelbras-cve-pro.com.br/api/v1/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Api-Key': process.env.CVE_API_KEY || ''
        },
        params: {
          status: 'Active'
        }
      });
      
      console.log('✅ Transações encontradas:', response.data);
      
      if (response.data.transactions && response.data.transactions.length > 0) {
        const firstTx = response.data.transactions[0];
        const transactionPk = firstTx.transactionPk || firstTx.transactionId || firstTx.id;
        
        console.log(`\n🔍 Testando endpoint com transactionPk: ${transactionPk}\n`);
        
        // TESTAR ENDPOINT SINGULAR
        console.log('═══════════════════════════════════════════════════════');
        console.log('🧪 TESTE 1: /api/v1/transaction/{transactionPk} (SINGULAR)');
        console.log('═══════════════════════════════════════════════════════\n');
        
        try {
          const detailsResponse = await axios.get(
            `https://cs.intelbras-cve-pro.com.br/api/v1/transaction/${transactionPk}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Api-Key': process.env.CVE_API_KEY || ''
              }
            }
          );
          
          console.log('✅ SUCESSO! Resposta:\n');
          console.log(JSON.stringify(detailsResponse.data, null, 2));
          
          // Verificar se tem idTag
          if (detailsResponse.data.idTag) {
            console.log(`\n🎯 ✅ TEM idTag: ${detailsResponse.data.idTag}`);
          } else {
            console.log('\n⚠️  NÃO TEM idTag na resposta');
          }
          
        } catch (error: any) {
          console.log(`❌ ERRO (${error.response?.status}):`, error.response?.data || error.message);
        }
        
        // TESTAR ENDPOINT PLURAL TAMBÉM
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🧪 TESTE 2: /api/v1/transactions/{transactionId} (PLURAL)');
        console.log('═══════════════════════════════════════════════════════\n');
        
        try {
          const detailsResponse2 = await axios.get(
            `https://cs.intelbras-cve-pro.com.br/api/v1/transactions/${transactionPk}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Api-Key': process.env.CVE_API_KEY || ''
              }
            }
          );
          
          console.log('✅ SUCESSO! Resposta:\n');
          console.log(JSON.stringify(detailsResponse2.data, null, 2));
          
        } catch (error: any) {
          console.log(`❌ ERRO (${error.response?.status}):`, error.response?.data || error.message);
        }
        
      } else {
        console.log('⚠️  Nenhuma transação ativa encontrada para testar');
        console.log('\n💡 Vou tentar buscar transações completas (últimas 100)...\n');
        
        const allTxResponse = await axios.get('https://cs.intelbras-cve-pro.com.br/api/v1/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Api-Key': process.env.CVE_API_KEY || ''
          },
          params: {
            limit: 5
          }
        });
        
        console.log('📋 Últimas transações:');
        console.log(JSON.stringify(allTxResponse.data, null, 2));
        
        if (allTxResponse.data.transactions && allTxResponse.data.transactions.length > 0) {
          const lastTx = allTxResponse.data.transactions[0];
          const transactionPk = lastTx.transactionPk || lastTx.transactionId || lastTx.id;
          
          console.log(`\n🔍 Testando com última transação: ${transactionPk}\n`);
          
          try {
            const detailsResponse = await axios.get(
              `https://cs.intelbras-cve-pro.com.br/api/v1/transaction/${transactionPk}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Api-Key': process.env.CVE_API_KEY || ''
                }
              }
            );
            
            console.log('✅ SUCESSO! Resposta:\n');
            console.log(JSON.stringify(detailsResponse.data, null, 2));
            
          } catch (error: any) {
            console.log(`❌ ERRO:`, error.response?.data || error.message);
          }
        }
      }
      
    } catch (error: any) {
      console.log('❌ Erro ao buscar transações:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarEndpoint();


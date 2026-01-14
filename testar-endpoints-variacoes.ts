/**
 * 🧪 TESTE: Diferentes variações de endpoints de transação
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarEndpoints() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    const endpoints = [
      '/api/v1/transaction',           // Singular, sem parâmetro
      '/api/v1/transactions',           // Plural, sem parâmetro
      '/transaction',                   // Sem /api/v1
      '/transactions',                  // Sem /api/v1
      '/api/transaction',               // Sem v1
      '/api/transactions',              // Sem v1
      '/api/v1/ocpp/transactions',      // Com ocpp
      '/api/v1/charge-sessions',        // Nome alternativo
      '/api/v1/charging-sessions',      // Nome alternativo
    ];
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 TESTANDO DIFERENTES ENDPOINTS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `https://cs.intelbras-cve-pro.com.br${endpoint}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Api-Key': process.env.CVE_API_KEY || ''
            },
            params: {
              status: 'Active',
              limit: 5
            },
            timeout: 5000
          }
        );
        
        console.log(`✅ ${endpoint}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Dados: ${JSON.stringify(response.data).substring(0, 200)}...\n`);
        
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 404) {
          console.log(`❌ ${endpoint} - 404 (Não existe)`);
        } else if (status === 401 || status === 403) {
          console.log(`🔒 ${endpoint} - ${status} (Sem permissão)`);
        } else if (status) {
          console.log(`⚠️  ${endpoint} - ${status} (${error.message})`);
        } else {
          console.log(`💥 ${endpoint} - Timeout ou erro de rede`);
        }
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 TESTANDO COM IDs ESPECÍFICOS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Testar com IDs fictícios para ver qual endpoint responde
    const testIds = ['1', '12345', '9a8b4db3-2188-4229-ae20-2c4aa61cd10a']; // UUID de um carregador
    
    for (const id of testIds) {
      const testEndpoints = [
        `/api/v1/transaction/${id}`,
        `/api/v1/transactions/${id}`,
        `/api/v1/charge-session/${id}`,
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await axios.get(
            `https://cs.intelbras-cve-pro.com.br${endpoint}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Api-Key': process.env.CVE_API_KEY || ''
              },
              timeout: 3000
            }
          );
          
          console.log(`✅ ${endpoint}`);
          console.log(`   Resposta:`, JSON.stringify(response.data, null, 2).substring(0, 300));
          console.log('');
          
        } catch (error: any) {
          const status = error.response?.status;
          if (status !== 404) {
            console.log(`⚠️  ${endpoint} - Status ${status}`);
          }
        }
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarEndpoints();


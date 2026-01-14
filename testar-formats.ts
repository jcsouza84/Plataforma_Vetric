/**
 * 🧪 TESTE: Diferentes formatos de requisição
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarFormatos() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 dias
    
    console.log('📅 Período:');
    console.log(`   De: ${fromDate.toISOString()}`);
    console.log(`   Até: ${toDate.toISOString()}\n`);
    
    const testCases = [
      {
        name: 'Platform: DASHBOARD',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Platform': 'DASHBOARD',
          'X-Timezone-Offset': -180,
        },
        params: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          timeZone: -3
        }
      },
      {
        name: 'Platform: API (sem Api-Key)',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Platform': 'API',
          'X-Timezone-Offset': -180,
        },
        params: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          timeZone: 0
        }
      },
      {
        name: 'Sem Platform header',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
        }
      },
      {
        name: 'Data formato alternativo (sem Z)',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Platform': 'API',
        },
        params: {
          fromDate: fromDate.toISOString().replace('Z', ''),
          toDate: toDate.toISOString().replace('Z', ''),
        }
      },
      {
        name: 'Data formato simples (YYYY-MM-DD)',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Platform': 'API',
        },
        params: {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        }
      },
      {
        name: 'Com size e page',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Platform': 'API',
        },
        params: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          size: 10,
          page: 0
        }
      },
    ];
    
    for (const test of testCases) {
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🧪 ${test.name}`);
      console.log('═══════════════════════════════════════════════════════');
      
      try {
        const response = await axios.get(
          'https://cs.intelbras-cve-pro.com.br/api/v1/transaction',
          {
            headers: test.headers,
            params: test.params,
            timeout: 10000
          }
        );
        
        console.log('✅ SUCESSO!\n');
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(response.data, null, 2).substring(0, 500));
        console.log('\n✅✅✅ ESSE FORMATO FUNCIONA! ✅✅✅\n');
        
        // Se funcionou, parar aqui
        break;
        
      } catch (error: any) {
        const status = error.response?.status;
        console.log(`❌ Status: ${status}`);
        
        if (error.response?.data) {
          const errorData = typeof error.response.data === 'string' 
            ? error.response.data.substring(0, 200)
            : JSON.stringify(error.response.data);
          console.log(`   Erro: ${errorData}`);
        }
        console.log('');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarFormatos();


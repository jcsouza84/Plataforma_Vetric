/**
 * 🎯 TESTE: /api/v1/transaction com formato de data CORRETO
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarFormatoCorreto() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Api-Key': process.env.CVE_API_KEY || '',
    };
    
    // Formato CORRETO (com espaço!)
    const fromDate = '2026-01-11 00:00:00';
    const toDate = '2026-01-13 23:59:59';
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 TESTE: Formato de data CORRETO (com espaço)');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`fromDate: "${fromDate}"`);
    console.log(`toDate: "${toDate}"`);
    console.log('');
    
    try {
      const response = await axios.get(
        'https://cs.intelbras-cve-pro.com.br/api/v1/transaction',
        {
          headers,
          params: {
            fromDate,
            toDate,
            timeZone: -3,
            page: 1,
            size: 10
          },
          timeout: 10000
        }
      );
      
      console.log('✅ SUCESSO!\n');
      console.log('Status:', response.status);
      console.log('\n📊 RESPOSTA:\n');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Analisar transações
      if (response.data.content && Array.isArray(response.data.content)) {
        console.log(`\n\n═══════════════════════════════════════════════════════`);
        console.log(`📋 ${response.data.content.length} TRANSAÇÃO(ÕES) ENCONTRADA(S)`);
        console.log('═══════════════════════════════════════════════════════\n');
        
        response.data.content.forEach((tx: any, index: number) => {
          console.log(`\n${index + 1}. Transação ID: ${tx.id}`);
          console.log(`   🎯 ocppIdTag: "${tx.ocppIdTag}"`);
          console.log(`   👤 userName: ${tx.userName || 'N/A'}`);
          console.log(`   📱 userPhone: ${tx.userPhone || 'N/A'}`);
          console.log(`   🔌 Carregador: ${tx.chargeBoxDescription}`);
          console.log(`   📅 Início: ${tx.startTimestamp}`);
          console.log(`   🏁 Fim: ${tx.stopTimestamp || 'EM ANDAMENTO'}`);
          console.log(`   ⚡ Energia: ${tx.energy} kWh`);
          console.log(`   ⏱️  Duração: ${tx.durationHumanReadable || tx.duration + 's'}`);
          console.log(`   💰 Custo: ${tx.costHumanReadable || 'R$ 0,00'}`);
        });
        
        console.log('\n\n🎉 ENDPOINT FUNCIONANDO PERFEITAMENTE!\n');
      } else if (response.data && Array.isArray(response.data)) {
        console.log(`\n📋 ${response.data.length} transação(ões) encontrada(s)\n`);
        
        response.data.forEach((tx: any, index: number) => {
          console.log(`${index + 1}. ${tx.chargeBoxDescription}`);
          console.log(`   ocppIdTag: ${tx.ocppIdTag}`);
          console.log(`   userName: ${tx.userName}`);
        });
      }
      
    } catch (error: any) {
      const status = error.response?.status;
      console.log(`❌ Erro: ${status}`);
      console.log('Resposta:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarFormatoCorreto();


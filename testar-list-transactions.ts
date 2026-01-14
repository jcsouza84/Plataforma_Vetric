/**
 * 🎯 TESTE: GET /api/v1/transaction (LISTAGEM com filtros)
 */

import axios from 'axios';
import { cveService } from './vetric-dashboard/backend/src/services/CVEService';

async function testarListagemTransacoes() {
  try {
    console.log('🔑 Autenticando...\n');
    const token = await cveService.login();
    
    // Buscar carregador ativo para pegar o chargeBoxPk
    const chargers = await cveService.getChargers();
    const activeCharger = chargers.find(c => 
      c.connectors?.[0]?.lastStatus?.status === 'Charging'
    );
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Api-Key': process.env.CVE_API_KEY || '',
      'Platform': 'API',
      'X-Timezone-Offset': -180,
    };
    
    // Período: últimas 24 horas
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 TESTE 1: Listar TODAS as transações (últimas 24h)');
    console.log('═══════════════════════════════════════════════════════\n');
    
    try {
      const response = await axios.get(
        'https://cs.intelbras-cve-pro.com.br/api/v1/transaction',
        {
          headers,
          params: {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            timeZone: -3,
            size: 100,
            page: 0
          },
          timeout: 10000
        }
      );
      
      console.log('✅ SUCESSO!\n');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      // Analisar resposta
      if (response.data && Array.isArray(response.data)) {
        console.log(`\n📊 ${response.data.length} transação(ões) encontrada(s)\n`);
        
        response.data.forEach((tx: any, index: number) => {
          console.log(`\n───────────────────────────────────────────────────────`);
          console.log(`Transação ${index + 1}:`);
          console.log(`  transactionPk: ${tx.id || tx.transactionPk}`);
          console.log(`  ocppIdTag: "${tx.ocppIdTag}"`);
          console.log(`  chargeBoxId: ${tx.chargeBoxId}`);
          console.log(`  chargeBoxDescription: ${tx.chargeBoxDescription}`);
          console.log(`  userName: ${tx.userName}`);
          console.log(`  startTimestamp: ${tx.startTimestamp}`);
          console.log(`  stopTimestamp: ${tx.stopTimestamp || 'EM ANDAMENTO'}`);
          console.log(`  energy: ${tx.energy} kWh`);
          console.log(`  duration: ${tx.duration}s`);
        });
      } else if (response.data && response.data.content) {
        console.log(`\n📊 ${response.data.content.length} transação(ões) encontrada(s)\n`);
        
        response.data.content.forEach((tx: any, index: number) => {
          console.log(`\n───────────────────────────────────────────────────────`);
          console.log(`Transação ${index + 1}:`);
          console.log(`  transactionPk: ${tx.id || tx.transactionPk}`);
          console.log(`  ocppIdTag: "${tx.ocppIdTag}"`);
          console.log(`  chargeBoxId: ${tx.chargeBoxId}`);
          console.log(`  chargeBoxDescription: ${tx.chargeBoxDescription}`);
          console.log(`  userName: ${tx.userName}`);
          console.log(`  startTimestamp: ${tx.startTimestamp}`);
          console.log(`  stopTimestamp: ${tx.stopTimestamp || 'EM ANDAMENTO'}`);
        });
      }
      
    } catch (error: any) {
      console.log('❌ Erro:', error.response?.status);
      console.log('Mensagem:', error.response?.data || error.message);
    }
    
    // Teste 2: Filtrar por carregador específico
    if (activeCharger) {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log(`🧪 TESTE 2: Filtrar por carregador "${activeCharger.description}"`);
      console.log(`   chargeBoxPK: ${activeCharger.chargeBoxPk}`);
      console.log('═══════════════════════════════════════════════════════\n');
      
      try {
        const response = await axios.get(
          'https://cs.intelbras-cve-pro.com.br/api/v1/transaction',
          {
            headers,
            params: {
              fromDate: fromDate.toISOString(),
              toDate: toDate.toISOString(),
              chargeBoxPK: activeCharger.chargeBoxPk,
              timeZone: -3,
              size: 100
            },
            timeout: 10000
          }
        );
        
        console.log('✅ SUCESSO!\n');
        console.log(JSON.stringify(response.data, null, 2));
        
      } catch (error: any) {
        console.log('❌ Erro:', error.response?.status);
        console.log('Mensagem:', error.response?.data || error.message);
      }
    }
    
    // Teste 3: Buscar apenas transações em andamento (sem stopTimestamp)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 TESTE 3: Buscar transações ATIVAS (sem data fim)');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const veryOldDate = new Date('2020-01-01');
    
    try {
      const response = await axios.get(
        'https://cs.intelbras-cve-pro.com.br/api/v1/transaction',
        {
          headers,
          params: {
            fromDate: veryOldDate.toISOString(),
            toDate: toDate.toISOString(),
            timeZone: -3,
            size: 10,
            page: 0,
            sortField: 'startTimestamp',
            sortOrder: 'DESC'
          },
          timeout: 10000
        }
      );
      
      console.log('✅ SUCESSO!\n');
      console.log('Primeiras transações (mais recentes):');
      
      const data = response.data.content || response.data;
      if (Array.isArray(data)) {
        data.slice(0, 5).forEach((tx: any, index: number) => {
          const isActive = !tx.stopTimestamp;
          console.log(`\n${index + 1}. ${tx.chargeBoxDescription}`);
          console.log(`   ocppIdTag: "${tx.ocppIdTag}"`);
          console.log(`   Status: ${isActive ? '🟢 ATIVO' : '⚪ Finalizado'}`);
          console.log(`   Início: ${tx.startTimestamp}`);
          if (tx.stopTimestamp) {
            console.log(`   Fim: ${tx.stopTimestamp}`);
          }
        });
      }
      
    } catch (error: any) {
      console.log('❌ Erro:', error.response?.status);
      console.log('Mensagem:', error.response?.data || error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

testarListagemTransacoes();


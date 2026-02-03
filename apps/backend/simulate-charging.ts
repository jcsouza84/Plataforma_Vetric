/**
 * 🎮 Script de Simulação de Carregamento
 * 
 * Executa uma simulação completa nos 5 carregadores Gran Marine
 * usando a tag RFID da VETRIC (87BA5C4E)
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function main() {
  console.log('🎮 ========================================');
  console.log('🎮 INICIADOR DE SIMULAÇÃO DE CARREGAMENTO');
  console.log('🎮 ========================================\n');

  try {
    // 1. Verificar se o simulador está disponível
    console.log('🔍 Verificando status do simulador...');
    const statusResponse = await axios.get(`${API_URL}/simulator/status`);
    
    if (statusResponse.data.data.isRunning) {
      console.log('❌ Simulação já está em execução!');
      console.log('   Use POST /api/simulator/stop para parar primeiro.\n');
      process.exit(1);
    }

    console.log('✅ Simulador disponível!\n');

    // 2. Iniciar simulação
    console.log('🚀 Iniciando simulação sequencial...');
    const startResponse = await axios.post(`${API_URL}/simulator/start`);

    console.log('✅ Simulação iniciada com sucesso!\n');
    console.log('📋 Informações:');
    console.log(`   Carregadores: ${startResponse.data.info.carregadores}`);
    console.log(`   Tag RFID: ${startResponse.data.info.tag_rfid}`);
    console.log(`   Duração: ${startResponse.data.info.duracao_estimada}\n`);

    console.log('📊 Fases da simulação:');
    startResponse.data.info.fases.forEach((fase: string, index: number) => {
      console.log(`   ${index + 1}. ${fase}`);
    });

    console.log('\n🎯 ACOMPANHE EM TEMPO REAL:');
    console.log('   Monitor Terminal: http://localhost:3000/logs');
    console.log('   Status Simulador: GET /api/simulator/status');
    console.log('   Parar Simulação:  POST /api/simulator/stop\n');

    console.log('🎉 Simulação em andamento! Aguarde ~25 minutos...\n');

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.response?.data?.error || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 DICA: O backend está rodando em http://localhost:3001?');
      console.error('   Execute: cd apps/backend && npm run dev\n');
    }
    
    process.exit(1);
  }
}

main();

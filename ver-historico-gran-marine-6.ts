/**
 * 🔍 Visualizar Histórico Completo - Gran Marine 6
 * 
 * Este script busca TODAS as informações do Gran Marine 6:
 * - Status atual do conector
 * - Transações recentes (completas e ativas)
 * - Histórico de mudanças de status
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const CHARGER_ID = 'JDBM1200040BB';
const CHARGER_NAME = 'Gran Marine 6';
const CONNECTOR_ID = 1;

// Configuração
const BASE_URL = 'https://cs.intelbras-cve-pro.com.br';
const TOKEN_FILE = path.join(__dirname, '.auth-token');

interface Transaction {
  transactionPk: number;
  idTag: string;
  startTimestamp: string;
  stopTimestamp?: string;
  startValue: number;
  stopValue?: number;
  chargeBoxId: string;
  connectorId: number;
}

async function getToken(): Promise<string> {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const token = fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
      console.log('✅ Token carregado do arquivo');
      return token;
    }
  } catch (error) {
    console.log('⚠️  Arquivo de token não encontrado');
  }
  
  throw new Error('Token não encontrado. Execute o script de login primeiro.');
}

async function getChargerStatus(token: string) {
  console.log('\n📊 Buscando status atual do conector...');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/chargeBoxes/${CHARGER_ID}/connectors/${CONNECTOR_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('\n✅ STATUS ATUAL:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar status:', error.response?.data || error.message);
    return null;
  }
}

async function getRecentTransactions(token: string) {
  console.log('\n📋 Buscando transações recentes...');
  
  // Buscar transações dos últimos 7 dias
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/transactions`,
      {
        params: {
          chargeBoxId: CHARGER_ID,
          from: startDate.toISOString(),
          to: endDate.toISOString()
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('\n✅ TRANSAÇÕES ENCONTRADAS:');
    console.log(`Total: ${response.data?.length || 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log('\nDetalhes:');
      response.data.forEach((tx: Transaction, index: number) => {
        console.log(`\n--- Transação ${index + 1} ---`);
        console.log(`ID: ${tx.transactionPk}`);
        console.log(`Tag RFID: ${tx.idTag}`);
        console.log(`Início: ${tx.startTimestamp}`);
        console.log(`Fim: ${tx.stopTimestamp || 'EM ANDAMENTO'}`);
        console.log(`Energia: ${tx.stopValue ? (tx.stopValue - tx.startValue) + ' Wh' : 'N/A'}`);
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar transações:', error.response?.data || error.message);
    return [];
  }
}

async function getAllChargerInfo(token: string) {
  console.log('\n🔍 Buscando informações gerais do carregador...');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/chargeBoxes/${CHARGER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('\n✅ INFORMAÇÕES GERAIS:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar info geral:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('================================================');
  console.log('🔍 HISTÓRICO COMPLETO - GRAN MARINE 6');
  console.log('================================================');
  console.log(`Carregador: ${CHARGER_NAME}`);
  console.log(`ID: ${CHARGER_ID}`);
  console.log(`Conector: ${CONNECTOR_ID}`);
  console.log('================================================\n');
  
  try {
    const token = await getToken();
    
    // 1. Status atual
    const status = await getChargerStatus(token);
    
    // 2. Informações gerais
    const info = await getAllChargerInfo(token);
    
    // 3. Transações recentes
    const transactions = await getRecentTransactions(token);
    
    // Salvar em arquivo
    const outputFile = `gran_marine_6_historico_${new Date().toISOString().split('T')[0]}.json`;
    const output = {
      charger: {
        id: CHARGER_ID,
        name: CHARGER_NAME,
        connector: CONNECTOR_ID
      },
      timestamp: new Date().toISOString(),
      currentStatus: status,
      generalInfo: info,
      recentTransactions: transactions
    };
    
    fs.writeFileSync(
      path.join(__dirname, outputFile),
      JSON.stringify(output, null, 2)
    );
    
    console.log('\n================================================');
    console.log(`✅ Histórico salvo em: ${outputFile}`);
    console.log('================================================\n');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

main();


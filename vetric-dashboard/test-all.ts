/**
 * 🧪 VETRIC - Script de Testes Completo
 * Testa TODOS os endpoints da API CVE-Pro e salva resultados
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const TOKEN = '4B367B21C8CFA428AC65201603DA9433F2411B51727F3D54FC7782B8F0D41B7338F58D409BAB47488C611D815D1F1946FEED079848209E602B8BD0914F5F04924A0DB553376C4B2DD292B6522F1870CD';
const BASE_URL = 'https://cs-test.intelbras-cve-pro.com.br';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  statusCode?: number;
  data?: any;
  error?: string;
  timestamp: string;
}

const results: TestResult[] = [];

// Criar pasta de resultados
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Helper para fazer requisição
async function testEndpoint(
  endpoint: string, 
  method: string = 'GET',
  description: string = ''
): Promise<TestResult> {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🧪 Testando: ${description || endpoint}`);
  console.log(`   ${method} ${endpoint}`);
  console.log('═'.repeat(80));

  const result: TestResult = {
    endpoint,
    method,
    success: false,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await axios({
      method: method as any,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    result.success = true;
    result.statusCode = response.status;
    result.data = response.data;

    console.log(`✅ Sucesso! Status: ${response.status}`);
    
    if (Array.isArray(response.data)) {
      console.log(`   📊 Total de itens: ${response.data.length}`);
    } else if (typeof response.data === 'object') {
      console.log(`   📊 Campos retornados: ${Object.keys(response.data).length}`);
      console.log(`   🔑 Campos: ${Object.keys(response.data).join(', ')}`);
    }

  } catch (error: any) {
    result.success = false;
    result.statusCode = error.response?.status;
    result.error = error.response?.data?.error || error.message;
    
    console.log(`❌ Erro! Status: ${error.response?.status || 'N/A'}`);
    console.log(`   Mensagem: ${result.error}`);
  }

  results.push(result);
  return result;
}

// Executar todos os testes
async function runAllTests() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║        🧪 VETRIC - TESTE COMPLETO API CVE-PRO             ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('🎯 Objetivo: Validar todos os endpoints e mapear estrutura\n');
  console.log('⏰ Início:', new Date().toLocaleString());
  console.log('🌐 Ambiente: TESTE');
  console.log('🔗 Base URL:', BASE_URL);
  console.log('\n' + '━'.repeat(80) + '\n');

  // 1. Testar Carregadores (ChargePoints)
  const chargersResult = await testEndpoint(
    '/api/v1/chargepoints',
    'GET',
    'Listar Carregadores'
  );
  
  if (chargersResult.success && chargersResult.data) {
    // Salvar resultado completo
    fs.writeFileSync(
      path.join(resultsDir, 'chargepoints.json'),
      JSON.stringify(chargersResult.data, null, 2)
    );
    console.log('   💾 Dados salvos em: test-results/chargepoints.json');
  }

  // 2. Testar Tags RFID
  const tagsResult = await testEndpoint(
    '/api/v1/id-tag',
    'GET',
    'Listar Tags RFID'
  );
  
  if (tagsResult.success && tagsResult.data) {
    fs.writeFileSync(
      path.join(resultsDir, 'tags.json'),
      JSON.stringify(tagsResult.data, null, 2)
    );
    console.log('   💾 Dados salvos em: test-results/tags.json');
  }

  // 3. Testar Transações
  const transactionsResult = await testEndpoint(
    '/api/v1/transactions?limit=50',
    'GET',
    'Listar Transações (últimas 50)'
  );
  
  if (transactionsResult.success && transactionsResult.data) {
    fs.writeFileSync(
      path.join(resultsDir, 'transactions.json'),
      JSON.stringify(transactionsResult.data, null, 2)
    );
    console.log('   💾 Dados salvos em: test-results/transactions.json');
  }

  // 4. Testar Estatísticas
  await testEndpoint(
    '/api/v1/stats/all_stats',
    'GET',
    'Estatísticas Gerais'
  );

  // 5. Testar Usuários Associados
  await testEndpoint(
    '/api/v1/users_data/associated_users',
    'GET',
    'Usuários Associados'
  );

  // 6. Testar Marcas de Carros
  await testEndpoint(
    '/api/v1/brand',
    'GET',
    'Marcas de Veículos'
  );

  // 7. Testar Modelos de Carros
  await testEndpoint(
    '/api/v1/model',
    'GET',
    'Modelos de Veículos'
  );

  // Gerar Relatório
  generateReport();
}

// Gerar relatório final
function generateReport() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║              📊 RELATÓRIO DE TESTES                       ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const successRate = ((successCount / results.length) * 100).toFixed(1);

  console.log('📊 RESUMO GERAL:');
  console.log('━'.repeat(80));
  console.log(`✅ Sucesso: ${successCount}/${results.length} (${successRate}%)`);
  console.log(`❌ Falhas:  ${failCount}/${results.length}`);
  console.log('━'.repeat(80));

  console.log('\n📋 DETALHES POR ENDPOINT:\n');
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.statusCode || 'N/A';
    console.log(`${icon} [${status}] ${result.method} ${result.endpoint}`);
    if (result.error) {
      console.log(`   └─ Erro: ${result.error}`);
    }
  });

  // Análise de Dados
  console.log('\n\n📊 ANÁLISE DE DADOS:\n');
  console.log('━'.repeat(80));

  // Carregadores
  const chargersData = results.find(r => r.endpoint.includes('chargepoints'))?.data;
  if (chargersData) {
    const chargers = Array.isArray(chargersData) ? chargersData : [chargersData];
    console.log(`\n🔌 CARREGADORES:`);
    console.log(`   Total: ${chargers.length}`);
    if (chargers.length > 0) {
      console.log(`   Campos disponíveis: ${Object.keys(chargers[0]).join(', ')}`);
      console.log(`\n   Lista de IDs:`);
      chargers.forEach((c: any, i: number) => {
        console.log(`   ${i + 1}. ID: ${c.id || c.chargeBoxId || 'N/A'} | Nome: ${c.name || c.chargePointId || 'N/A'}`);
      });
    }
  }

  // Tags
  const tagsData = results.find(r => r.endpoint.includes('id-tag'))?.data;
  if (tagsData) {
    const tags = Array.isArray(tagsData) ? tagsData : [tagsData];
    console.log(`\n💳 TAGS RFID:`);
    console.log(`   Total: ${tags.length}`);
    if (tags.length > 0) {
      console.log(`   Campos disponíveis: ${Object.keys(tags[0]).join(', ')}`);
      console.log(`   Primeiras 5 tags:`);
      tags.slice(0, 5).forEach((t: any, i: number) => {
        console.log(`   ${i + 1}. ${t.idTag || t.tag || 'N/A'}`);
      });
    }
  }

  // Transações
  const transData = results.find(r => r.endpoint.includes('transactions'))?.data;
  if (transData) {
    const transactions = Array.isArray(transData) ? transData : [transData];
    console.log(`\n📊 TRANSAÇÕES:`);
    console.log(`   Total retornadas: ${transactions.length}`);
    if (transactions.length > 0) {
      console.log(`   Campos disponíveis: ${Object.keys(transactions[0]).join(', ')}`);
    }
  }

  // Salvar relatório completo
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'test',
    baseUrl: BASE_URL,
    summary: {
      total: results.length,
      success: successCount,
      failed: failCount,
      successRate: `${successRate}%`
    },
    results: results
  };

  fs.writeFileSync(
    path.join(resultsDir, 'test-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n\n💾 ARQUIVOS SALVOS:');
  console.log('━'.repeat(80));
  console.log('📁 test-results/');
  console.log('   ├─ chargepoints.json      (dados dos carregadores)');
  console.log('   ├─ tags.json              (dados das tags RFID)');
  console.log('   ├─ transactions.json      (histórico de transações)');
  console.log('   └─ test-report.json       (relatório completo)');

  console.log('\n\n✅ TESTES CONCLUÍDOS!');
  console.log('⏰ Fim:', new Date().toLocaleString());
  console.log('\n' + '═'.repeat(80) + '\n');

  // Próximos passos
  console.log('📋 PRÓXIMOS PASSOS:\n');
  console.log('1. Revisar os arquivos JSON salvos em test-results/');
  console.log('2. Confirmar estrutura dos dados');
  console.log('3. Mapear campos necessários para o sistema');
  console.log('4. Pronto para iniciar desenvolvimento! 🚀\n');
}

// Executar
runAllTests()
  .then(() => {
    console.log('✅ Script finalizado com sucesso!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });


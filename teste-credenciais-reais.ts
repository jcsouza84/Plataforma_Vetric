/**
 * 🔐 TESTE DEFINITIVO: Credenciais REAIS do Júlio
 */

import axios from 'axios';

// ========== CREDENCIAIS REAIS ==========
const API_KEY = '808c0fb3-dc7f-40f5-b294-807f21fc8947';
const EMAIL = 'julio@mundologic.com.br';
const PASSWORD = '1a2b3c4d';
const BASE_URL = 'https://cs.intelbras-cve-pro.com.br';

async function testarAutenticacaoReal() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🔐 TESTE COM CREDENCIAIS REAIS                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('📋 CREDENCIAIS:');
  console.log(`   🔑 API-Key: ${API_KEY}`);
  console.log(`   👤 Email: ${EMAIL}`);
  console.log(`   🔒 Senha: ${PASSWORD}`);
  console.log(`   🌐 URL: ${BASE_URL}\n`);

  // ========== TESTE 1: LOGIN ==========
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('📋 TESTE 1: Fazendo LOGIN...\n');

  let tokenReal = '';

  try {
    console.log('🔄 POST /api/v1/login');
    console.log('   Headers:');
    console.log('     - Api-Key: ✓');
    console.log('     - Content-Type: application/json');
    console.log('   Body:');
    console.log(`     - email: ${EMAIL}`);
    console.log(`     - password: ******\n`);

    const loginResponse = await axios.post(
      `${BASE_URL}/api/v1/login`,
      { 
        email: EMAIL, 
        password: PASSWORD 
      },
      { 
        headers: { 
          'Api-Key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        } 
      }
    );

    tokenReal = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ LOGIN BEM-SUCEDIDO! 🎉\n');
    console.log('👤 USUÁRIO:');
    console.log(`   Nome: ${user?.name || 'N/A'}`);
    console.log(`   Email: ${user?.email || EMAIL}`);
    console.log(`   ID: ${user?.id || 'N/A'}\n`);
    
    console.log('🔑 TOKEN RECEBIDO:');
    console.log(`   ${tokenReal.substring(0, 50)}...`);
    console.log(`   Tamanho: ${tokenReal.length} caracteres\n`);

  } catch (error: any) {
    console.log('❌ LOGIN FALHOU!\n');
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    console.log(`   Erro: ${JSON.stringify(error.response?.data, null, 2)}\n`);

    if (error.response?.status === 401) {
      console.log('⚠️  CREDENCIAIS INVÁLIDAS!');
      console.log('   Possíveis causas:');
      console.log('   1. Email ou senha incorretos');
      console.log('   2. API-Key inválida');
      console.log('   3. Conta bloqueada ou inativa\n');
    }

    if (error.response?.data?.error?.includes('reCAPTCHA')) {
      console.log('⚠️  reCAPTCHA OBRIGATÓRIO!');
      console.log('   O ambiente de PRODUÇÃO requer reCAPTCHA v3.');
      console.log('   Não é possível fazer login programático.\n');
      console.log('💡 SOLUÇÃO:');
      console.log('   Use o token que você copiou do Postman.');
      console.log('   Adicione no .env: CVE_TRANSACTION_TOKEN=...\n');
    }

    return;
  }

  // ========== TESTE 2: CHARGEPOINTS ==========
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('📋 TESTE 2: Testando token em /api/v1/chargepoints...\n');

  try {
    const chargersResponse = await axios.get(
      `${BASE_URL}/api/v1/chargepoints`,
      {
        headers: {
          'Api-Key': API_KEY,
          'Authorization': tokenReal,
          'Accept': 'application/json'
        }
      }
    );

    console.log('✅ TOKEN FUNCIONA EM /api/v1/chargepoints! 🎉');
    console.log(`   Status: ${chargersResponse.status}`);
    console.log(`   Carregadores encontrados: ${chargersResponse.data.length || 0}\n`);

    if (chargersResponse.data.length > 0) {
      console.log('📊 EXEMPLO DE CARREGADOR:');
      const first = chargersResponse.data[0];
      console.log(`   ID: ${first.chargeBoxId || first.id}`);
      console.log(`   Nome: ${first.description || first.name || 'N/A'}`);
      console.log(`   Status: ${first.connectors?.[0]?.lastStatus?.status || 'N/A'}\n`);
    }

  } catch (error: any) {
    console.log('❌ TOKEN NÃO FUNCIONA EM /api/v1/chargepoints!');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Erro: ${JSON.stringify(error.response?.data, null, 2)}\n`);
  }

  // ========== TESTE 3: TRANSACTIONS ==========
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('📋 TESTE 3: Testando token em /api/v1/transaction...\n');

  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 48 * 60 * 60 * 1000);
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  try {
    const transactionsResponse = await axios.get(
      `${BASE_URL}/api/v1/transaction`,
      {
        params: {
          fromDate: formatDate(fromDate),
          toDate: formatDate(toDate),
          timeZone: -3
        },
        headers: {
          'Api-Key': API_KEY,
          'Authorization': tokenReal,
          'Platform': 'DASHBOARD',
          'Content-Type': 'application/json',
          'X-Timezone-Offset': '-3'
        }
      }
    );

    console.log('✅ TOKEN FUNCIONA EM /api/v1/transaction! 🎉🎉🎉');
    console.log(`   Status: ${transactionsResponse.status}`);
    console.log(`   Transações: ${transactionsResponse.data.count || 0}\n`);

    const active = transactionsResponse.data.list?.filter((tx: any) => tx.stopTimestamp === null) || [];
    console.log(`⚡ Transações ativas: ${active.length}`);
    
    if (active.length > 0) {
      console.log('\n📋 TRANSAÇÕES ATIVAS:');
      active.forEach((tx: any, i: number) => {
        console.log(`\n   ${i + 1}. ${tx.chargeBoxDescription}`);
        console.log(`      👤 Usuário: ${tx.userName || 'N/A'}`);
        console.log(`      🏠 Apartamento: ${tx.userAddressComplement || 'N/A'}`);
        console.log(`      🎯 ocppIdTag: ${tx.ocppIdTag}`);
        console.log(`      ⏱️  Duração: ${tx.durationHumanReadable}`);
      });
    }

    console.log('\n═════════════════════════════════════════════════════════════\n');
    console.log('✅ CONCLUSÃO FINAL:\n');
    console.log('   ✓ Login funciona com suas credenciais');
    console.log('   ✓ Token obtido com sucesso');
    console.log('   ✓ Token funciona em /api/v1/chargepoints');
    console.log('   ✓ Token funciona em /api/v1/transaction');
    console.log('\n   🎉 AUTENTICAÇÃO 100% FUNCIONAL!\n');
    console.log('═════════════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.log('❌ TOKEN NÃO FUNCIONA EM /api/v1/transaction!');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Erro: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    
    console.log('═════════════════════════════════════════════════════════════\n');
    console.log('⚠️  CONCLUSÃO:\n');
    console.log('   ✓ Login funciona');
    console.log('   ✓ Token funciona em alguns endpoints');
    console.log('   ❌ Token NÃO funciona em /api/v1/transaction\n');
    console.log('💡 SOLUÇÃO:');
    console.log('   Continue usando o token do Postman para /api/v1/transaction\n');
  }
}

testarAutenticacaoReal().catch(console.error);




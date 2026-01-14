/**
 * 🔍 DIAGNÓSTICO COMPLETO: Autenticação CVE-Pro
 */

import axios from 'axios';

async function diagnosticoAutenticacao() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO CVE-PRO');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // 1. Carregar variáveis de ambiente
  const CVE_USERNAME = process.env.CVE_USERNAME || '';
  const CVE_PASSWORD = process.env.CVE_PASSWORD || '';
  const CVE_API_KEY = process.env.CVE_API_KEY || '';
  const CVE_BASE_URL = process.env.CVE_BASE_URL || 'https://cs.intelbras-cve-pro.com.br';
  
  console.log('📋 CREDENCIAIS CONFIGURADAS:');
  console.log(`   CVE_USERNAME: ${CVE_USERNAME ? '✅ ' + CVE_USERNAME : '❌ NÃO CONFIGURADO'}`);
  console.log(`   CVE_PASSWORD: ${CVE_PASSWORD ? '✅ ' + '*'.repeat(CVE_PASSWORD.length) : '❌ NÃO CONFIGURADO'}`);
  console.log(`   CVE_API_KEY: ${CVE_API_KEY ? '✅ ' + CVE_API_KEY.substring(0, 20) + '...' : '❌ NÃO CONFIGURADO'}`);
  console.log(`   CVE_BASE_URL: ${CVE_BASE_URL}\n`);
  
  if (!CVE_USERNAME || !CVE_PASSWORD) {
    console.log('❌ ERRO: Credenciais não configuradas!\n');
    return;
  }
  
  // 2. Fazer login
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔑 ETAPA 1: LOGIN');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    console.log('Endpoint: POST /api/v1/login');
    console.log('Body:', JSON.stringify({ email: CVE_USERNAME, password: '***' }));
    console.log('Headers:');
    console.log(`   Api-Key: ${CVE_API_KEY ? CVE_API_KEY.substring(0, 20) + '...' : 'NÃO ENVIADO'}\n`);
    
    const loginResponse = await axios.post(
      `${CVE_BASE_URL}/api/v1/login`,
      {
        email: CVE_USERNAME,
        password: CVE_PASSWORD,
      },
      {
        headers: CVE_API_KEY ? { 'Api-Key': CVE_API_KEY } : {},
        timeout: 10000
      }
    );
    
    const token = loginResponse.data.token;
    
    console.log('✅ LOGIN SUCESSO!');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Token: ${token.substring(0, 30)}...`);
    console.log(`   Token completo length: ${token.length} caracteres\n`);
    
    // 3. Testar endpoints com o token
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 ETAPA 2: TESTAR ENDPOINTS COM TOKEN');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const endpoints = [
      {
        name: 'Chargepoints (FUNCIONA)',
        method: 'GET',
        url: '/api/v1/chargepoints',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Api-Key': CVE_API_KEY,
        },
        params: {}
      },
      {
        name: 'Transaction (SEM Platform)',
        method: 'GET',
        url: '/api/v1/transaction',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Api-Key': CVE_API_KEY,
        },
        params: {
          fromDate: '2026-01-01T00:00:00Z',
          toDate: '2026-01-13T23:59:59Z',
        }
      },
      {
        name: 'Transaction (COM Platform: API)',
        method: 'GET',
        url: '/api/v1/transaction',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Api-Key': CVE_API_KEY,
          'Platform': 'API',
        },
        params: {
          fromDate: '2026-01-01T00:00:00Z',
          toDate: '2026-01-13T23:59:59Z',
        }
      },
      {
        name: 'Transaction (COM Platform: DASHBOARD)',
        method: 'GET',
        url: '/api/v1/transaction',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Api-Key': CVE_API_KEY,
          'Platform': 'DASHBOARD',
          'X-Timezone-Offset': -180,
        },
        params: {
          fromDate: '2026-01-01T00:00:00.000Z',
          toDate: '2026-01-13T23:59:59.999Z',
          timeZone: -3,
        }
      },
      {
        name: 'Transaction (SÓ Authorization)',
        method: 'GET',
        url: '/api/v1/transaction',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          fromDate: '2026-01-01',
          toDate: '2026-01-13',
        }
      },
    ];
    
    for (const test of endpoints) {
      console.log(`\n─────────────────────────────────────────────────────`);
      console.log(`🧪 ${test.name}`);
      console.log(`─────────────────────────────────────────────────────`);
      console.log(`Endpoint: ${test.method} ${test.url}`);
      console.log(`Headers:`, JSON.stringify(test.headers, null, 2));
      console.log(`Params:`, JSON.stringify(test.params, null, 2));
      
      try {
        const response = await axios({
          method: test.method,
          url: `${CVE_BASE_URL}${test.url}`,
          headers: test.headers,
          params: test.params,
          timeout: 10000
        });
        
        console.log(`\n✅ SUCESSO!`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Dados:`, JSON.stringify(response.data, null, 2).substring(0, 300) + '...');
        
      } catch (error: any) {
        const status = error.response?.status;
        console.log(`\n❌ ERRO!`);
        console.log(`   Status: ${status}`);
        
        if (error.response?.data) {
          const errorData = typeof error.response.data === 'string'
            ? error.response.data.substring(0, 300)
            : JSON.stringify(error.response.data, null, 2).substring(0, 300);
          console.log(`   Resposta:`, errorData);
        }
        
        // Analisar o erro
        if (status === 400) {
          console.log(`\n   💡 Possíveis causas do erro 400:`);
          console.log(`      - Parâmetros obrigatórios faltando`);
          console.log(`      - Formato de data incorreto`);
          console.log(`      - Headers obrigatórios faltando`);
        } else if (status === 401) {
          console.log(`\n   ⚠️  Token inválido ou expirado!`);
        } else if (status === 403) {
          console.log(`\n   🔒 Sem permissão para acessar este endpoint!`);
        } else if (status === 404) {
          console.log(`\n   ❌ Endpoint não existe!`);
        }
      }
    }
    
    // 4. Conclusão
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('📊 CONCLUSÃO');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ Autenticação: OK');
    console.log('✅ Token obtido: OK');
    console.log('✅ Endpoint /chargepoints: FUNCIONA');
    console.log('❓ Endpoint /transaction: VERIFICAR ACIMA\n');
    
  } catch (error: any) {
    console.log('❌ ERRO NO LOGIN!');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Mensagem:`, error.response?.data || error.message);
  }
}

diagnosticoAutenticacao();


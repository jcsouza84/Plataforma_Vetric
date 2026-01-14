/**
 * 🔬 TESTE: Comparar tokens - Login Normal vs Token do Postman
 */

import axios from 'axios';

const API_BASE_URL = 'https://cs.intelbras-cve-pro.com.br';
const API_KEY = '808c0fb3-dc7f-40f5-b294-807f21fc8947';

// Credenciais do sistema
const EMAIL = 'admin@vetric.com.br';
const PASSWORD = 'Vetric@2026';

// Token do Postman (fornecido pelo usuário)
const TOKEN_POSTMAN = 'W5tMmxBXON94kpglbfWlzIVURoqGUMsBm4eaVqhRrUvrNCYP5ZyViqjMabxZyQbrrJvowSsHBlScu5Vovx-5hwxQNtPAiuFFp6ez3fBdTIA3cAy0ww0WouHqby3nhCB00QAeeM7qD8XCU3MKZ6Bt3d3Ij3d4tWnlW0GPBRHTAf14vMC8kmQnK-Le4rgwly-d368CmimFTqa15Ilw4nk4jvIKqOdsvO5VrTNSl8aRrq696gEq1uO8KT4R8FMB-TP1OaXTLeYToCnbSpEPiq1qWVLbBqNTvfstKdxKJTVX3hMdY-5ACXsneurfMG5uUGIjG6gq4QxgwzpnSnLd-4tKmpQkbTPLx4Hg68pRe_v98jUy0hR2jdE6WyJ3RKGCL6vbZoDPQ-O9HFXDRuz8jQOnQklN7YdbF3QEJPwFTNTip4ry9c-3l8mv7t80bw';

async function compararTokens() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🔬 COMPARAÇÃO DE TOKENS                                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ========== PASSO 1: FAZER LOGIN NORMAL ==========
  console.log('📋 PASSO 1: Fazendo login com credenciais do sistema...\n');
  console.log(`   Email: ${EMAIL}`);
  console.log(`   Senha: ${PASSWORD}`);
  console.log(`   API-Key: ${API_KEY}\n`);

  let tokenNormal = '';

  try {
    const loginResponse = await axios.post(
      `${API_BASE_URL}/api/v1/login`,
      { 
        email: EMAIL, 
        password: PASSWORD 
      },
      { 
        headers: { 
          'Api-Key': API_KEY,
          'Content-Type': 'application/json'
        } 
      }
    );

    tokenNormal = loginResponse.data.token;
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`   Token retornado (primeiros 50 chars): ${tokenNormal.substring(0, 50)}...`);
    console.log(`   Tamanho do token: ${tokenNormal.length} caracteres\n`);

  } catch (error: any) {
    console.error('❌ Erro ao fazer login:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Erro: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    
    if (error.response?.status === 401) {
      console.log('⚠️  CREDENCIAIS INVÁLIDAS!');
      console.log('   As credenciais "admin@vetric.com.br / Vetric@2026" são do NOSSO sistema interno,');
      console.log('   NÃO são credenciais válidas na API da Intelbras.\n');
      console.log('💡 PRECISAMOS:');
      console.log('   Email e senha que VOCÊ USA NO POSTMAN para fazer login na API Intelbras.\n');
    }
    
    // Continuar mesmo com erro para testar o token do Postman
    console.log('═════════════════════════════════════════════════════════════\n');
    console.log('📋 Pulando para teste do TOKEN DO POSTMAN...\n');
  }

  // ========== PASSO 2: COMPARAR TOKENS (SE TIVER TOKEN DO LOGIN) ==========
  if (tokenNormal) {
    console.log('═════════════════════════════════════════════════════════════\n');
    console.log('📊 PASSO 2: Comparando tokens...\n');

    console.log('🔑 TOKEN DO LOGIN NORMAL:');
    console.log(`   Início: ${tokenNormal.substring(0, 30)}...`);
    console.log(`   Tamanho: ${tokenNormal.length} caracteres`);
    console.log(`   Formato: ${tokenNormal.includes('-') ? 'Contém hífens' : 'Sem hífens'}\n`);

    console.log('🔑 TOKEN DO POSTMAN (fornecido):');
    console.log(`   Início: ${TOKEN_POSTMAN.substring(0, 30)}...`);
    console.log(`   Tamanho: ${TOKEN_POSTMAN.length} caracteres`);
    console.log(`   Formato: ${TOKEN_POSTMAN.includes('-') ? 'Contém hífens' : 'Sem hífens'}\n`);

    const saoIguais = tokenNormal === TOKEN_POSTMAN;
    
    if (saoIguais) {
      console.log('✅ TOKENS SÃO IDÊNTICOS! 🎉\n');
    } else {
      console.log('❌ TOKENS SÃO DIFERENTES! ⚠️\n');
    }

    // ========== PASSO 3: TESTAR TOKEN DO LOGIN NO ENDPOINT DE TRANSAÇÕES ==========
    console.log('═════════════════════════════════════════════════════════════\n');
    console.log('📋 PASSO 3: Testando TOKEN DO LOGIN no endpoint /api/v1/transaction...\n');

    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    
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
      console.log('   Usando: Token do login normal');
      console.log('   Headers:');
      console.log('     - Api-Key: ✓');
      console.log('     - Authorization: [Token do login]');
      console.log('     - Platform: DASHBOARD\n');

      const response1 = await axios.get(
        `${API_BASE_URL}/api/v1/transaction`,
        {
          params: {
            fromDate: formatDate(fromDate),
            toDate: formatDate(toDate),
            timeZone: -3
          },
          headers: {
            'Api-Key': API_KEY,
            'Authorization': tokenNormal,
            'Platform': 'DASHBOARD',
            'Content-Type': 'application/json',
            'X-Timezone-Offset': '-3'
          }
        }
      );

      console.log('✅ TOKEN DO LOGIN FUNCIONA NO ENDPOINT DE TRANSAÇÕES! 🎉');
      console.log(`   Status: ${response1.status}`);
      console.log(`   Transações retornadas: ${response1.data.count || 0}\n`);

    } catch (error: any) {
      console.log('❌ TOKEN DO LOGIN NÃO FUNCIONA NO ENDPOINT DE TRANSAÇÕES! ⚠️');
      console.log(`   Status: ${error.response?.status || 'N/A'}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}\n`);
    }
  }
  
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // ========== PASSO 4: TESTAR TOKEN DO POSTMAN ==========
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('📋 PASSO 4: Testando TOKEN DO POSTMAN no endpoint /api/v1/transaction...\n');

  try {
    console.log('   Usando: Token fornecido pelo usuário (Postman)');
    console.log('   Headers:');
    console.log('     - Api-Key: ✓');
    console.log('     - Authorization: [Token do Postman]');
    console.log('     - Platform: DASHBOARD\n');

    const response2 = await axios.get(
      `${API_BASE_URL}/api/v1/transaction`,
      {
        params: {
          fromDate: formatDate(fromDate),
          toDate: formatDate(toDate),
          timeZone: -3
        },
        headers: {
          'Api-Key': API_KEY,
          'Authorization': TOKEN_POSTMAN,
          'Platform': 'DASHBOARD',
          'Content-Type': 'application/json',
          'X-Timezone-Offset': '-3'
        }
      }
    );

    console.log('✅ TOKEN DO POSTMAN FUNCIONA NO ENDPOINT DE TRANSAÇÕES! 🎉');
    console.log(`   Status: ${response2.status}`);
    console.log(`   Transações retornadas: ${response2.data.count || 0}\n`);

  } catch (error: any) {
    console.log('❌ TOKEN DO POSTMAN NÃO FUNCIONA NO ENDPOINT DE TRANSAÇÕES! ⚠️');
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    console.log(`   Erro: ${error.response?.data?.error || error.message}\n`);
  }

  // ========== CONCLUSÃO ==========
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('📊 CONCLUSÃO:\n');

  if (saoIguais) {
    console.log('✅ Os tokens são IDÊNTICOS.');
    console.log('✅ O sistema pode usar login automático normalmente!');
    console.log('✅ Não é necessário token fixo no .env\n');
  } else {
    console.log('❌ Os tokens são DIFERENTES!');
    console.log('⚠️  Isso significa que:');
    console.log('   1. O Postman usa um processo de login diferente, OU');
    console.log('   2. O Postman usa credenciais diferentes, OU');
    console.log('   3. Há um endpoint de login alternativo\n');
    console.log('💡 RECOMENDAÇÃO:');
    console.log('   - Verificar qual email/senha o Postman está usando');
    console.log('   - Pode ser uma conta diferente da conta "admin@vetric.com.br"\n');
  }
}

compararTokens().catch(console.error);


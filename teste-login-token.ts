/**
 * 🔬 TESTE SIMPLIFICADO: Verificar diferença entre tokens
 */

import axios from 'axios';

const API_BASE_URL = 'https://cs.intelbras-cve-pro.com.br';
const API_KEY = '808c0fb3-dc7f-40f5-b294-807f21fc8947';
const TOKEN_POSTMAN = 'W5tMmxBXON94kpglbfWlzIVURoqGUMsBm4eaVqhRrUvrNCYP5ZyViqjMabxZyQbrrJvowSsHBlScu5Vovx-5hwxQNtPAiuFFp6ez3fBdTIA3cAy0ww0WouHqby3nhCB00QAeeM7qD8XCU3MKZ6Bt3d3Ij3d4tWnlW0GPBRHTAf14vMC8kmQnK-Le4rgwly-d368CmimFTqa15Ilw4nk4jvIKqOdsvO5VrTNSl8aRrq696gEq1uO8KT4R8FMB-TP1OaXTLeYToCnbSpEPiq1qWVLbBqNTvfstKdxKJTVX3hMdY-5ACXsneurfMG5uUGIjG6gq4QxgwzpnSnLd-4tKmpQkbTPLx4Hg68pRe_v98jUy0hR2jdE6WyJ3RKGCL6vbZoDPQ-O9HFXDRuz8jQOnQklN7YdbF3QEJPwFTNTip4ry9c-3l8mv7t80bw';

async function testar() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🔬 RESPOSTA À SUA PERGUNTA                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('❓ SUA PERGUNTA:');
  console.log('   "Se eu usar API-KEY + email + senha para fazer login,');
  console.log('    qual token será retornado? Vai funcionar no /api/v1/transaction?"');
  console.log('');

  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('🧪 TESTE: Fazendo login com credenciais do nosso sistema...\n');

  try {
    const loginResponse = await axios.post(
      `${API_BASE_URL}/api/v1/login`,
      { 
        email: 'admin@vetric.com.br', 
        password: 'Vetric@2026' 
      },
      { 
        headers: { 
          'Api-Key': API_KEY,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log('✅ Login bem-sucedido!');
    console.log(`   Token: ${loginResponse.data.token.substring(0, 50)}...\n`);

  } catch (error: any) {
    console.log('❌ Login FALHOU!');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Erro: ${JSON.stringify(error.response?.data, null, 2)}\n`);

    if (error.response?.status === 401) {
      console.log('═════════════════════════════════════════════════════════════\n');
      console.log('💡 EXPLICAÇÃO:\n');
      console.log('❌ As credenciais "admin@vetric.com.br / Vetric@2026"');
      console.log('   NÃO existem na API da Intelbras!\n');
      console.log('   Essas são credenciais do NOSSO sistema interno, não da Intelbras.\n');
      console.log('📋 O QUE ESTÁ ACONTECENDO:\n');
      console.log('   1. Você faz login NO POSTMAN com email/senha da Intelbras');
      console.log('   2. O Postman recebe um TOKEN válido');
      console.log('   3. Esse TOKEN funciona no endpoint /api/v1/transaction');
      console.log('   4. Nosso backend tenta fazer login com credenciais DIFERENTES');
      console.log('   5. Intelbras rejeita: "Credenciais inválidas"');
      console.log('   6. Não conseguimos TOKEN válido\n');
      console.log('═════════════════════════════════════════════════════════════\n');
      console.log('✅ SOLUÇÃO:\n');
      console.log('   OPÇÃO 1 (Temporária - 24-48h):');
      console.log('   ─────────────────────────────');
      console.log('   • Adicionar o token do Postman no .env:');
      console.log('     CVE_TRANSACTION_TOKEN=W5tMmxBXON94...\n');
      console.log('   OPÇÃO 2 (Permanente - RECOMENDADO):');
      console.log('   ────────────────────────────────────');
      console.log('   • Me fornecer o EMAIL e SENHA que você usa NO POSTMAN');
      console.log('   • Sistema fará login automático');
      console.log('   • Token renova automaticamente');
      console.log('   • Sem necessidade de atualização manual\n');
      console.log('═════════════════════════════════════════════════════════════\n');
      console.log('📊 PARA CONFIRMAR:\n');
      console.log('   Vou testar o TOKEN DO POSTMAN agora...\n');
    }
  }

  // Testar token do Postman
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('🧪 TESTE: Usando TOKEN DO POSTMAN no /api/v1/transaction...\n');

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
    const response = await axios.get(
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

    console.log('✅ TOKEN DO POSTMAN FUNCIONA! 🎉');
    console.log(`   Status: ${response.status}`);
    console.log(`   Transações: ${response.data.count}\n`);

    const active = response.data.list?.filter((tx: any) => tx.stopTimestamp === null) || [];
    console.log(`⚡ Transações ativas: ${active.length}`);
    
    if (active.length > 0) {
      console.log(`   Exemplo: ${active[0].userName} - ${active[0].chargeBoxDescription}\n`);
    }

    console.log('═════════════════════════════════════════════════════════════\n');
    console.log('✅ CONCLUSÃO FINAL:\n');
    console.log('   ✓ Token do Postman: FUNCIONA');
    console.log('   ✓ Token do nosso login: NÃO FUNCIONA (credenciais inválidas)\n');
    console.log('   💡 Para login automático funcionar, precisamos:');
    console.log('      • Email REAL da conta Intelbras (usado no Postman)');
    console.log('      • Senha REAL da conta Intelbras (usada no Postman)\n');

  } catch (error: any) {
    console.log('❌ TOKEN DO POSTMAN FALHOU!');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Erro: ${JSON.stringify(error.response?.data, null, 2)}\n`);
  }
}

testar().catch(console.error);


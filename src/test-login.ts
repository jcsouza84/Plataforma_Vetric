import axios from 'axios';

/**
 * Função de teste de login na API CVE-Pro Intelbras
 * Usando credenciais de teste da documentação
 */

interface LoginResponse {
  token: string;
  user?: any;
}

async function testLogin() {
  console.log('🔐 Testando login na API CVE-Pro...\n');

  // Dados de teste da documentação
  const credentials = {
    apiKey: 'fc961d23-0ebe-41df-b044-72fa60b3d89a',
    email: 'cve-api@intelbras.com.br',
    password: 'cve-api'
  };

  const baseUrl = 'https://cs.intelbras-cve-pro.com.br';

  // Tentar múltiplas abordagens
  const attempts = [
    {
      name: 'Tentativa 1: API-Key no body',
      body: {
        email: credentials.email,
        password: credentials.password,
        apiKey: credentials.apiKey
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    },
    {
      name: 'Tentativa 2: X-API-Key header',
      body: {
        email: credentials.email,
        password: credentials.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': credentials.apiKey,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    },
    {
      name: 'Tentativa 3: Api-Key header',
      body: {
        email: credentials.email,
        password: credentials.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Api-Key': credentials.apiKey,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    },
    {
      name: 'Tentativa 4: tenant no body',
      body: {
        email: credentials.email,
        password: credentials.password,
        tenant: credentials.apiKey
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    },
    {
      name: 'Tentativa 5: username ao invés de email',
      body: {
        username: credentials.email,
        password: credentials.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': credentials.apiKey,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`\n${'━'.repeat(80)}`);
      console.log(`🔄 ${attempt.name}`);
      console.log('━'.repeat(80));
      console.log('📍 URL:', `${baseUrl}/api/v1/login`);
      console.log('👤 User:', credentials.email);
      console.log('📦 Body:', JSON.stringify(attempt.body, null, 2));
      console.log('📋 Headers:', JSON.stringify(attempt.headers, null, 2));
      console.log('\n⏳ Enviando requisição...\n');

      // Tentar login
      const response = await axios.post<LoginResponse>(
        `${baseUrl}/api/v1/login`,
        attempt.body,
        {
          headers: attempt.headers
        }
      );

      // Sucesso!
      console.log('✅ Login realizado com sucesso!\n');
      console.log('━'.repeat(80));
      console.log('📋 RESPOSTA COMPLETA:');
      console.log('━'.repeat(80));
      console.log(JSON.stringify(response.data, null, 2));
      console.log('━'.repeat(80));

      if (response.data.token) {
        console.log('\n🎉 TOKEN JWT RECEBIDO:\n');
        console.log('━'.repeat(80));
        console.log(response.data.token);
        console.log('━'.repeat(80));
        
        // Mostrar partes do token
        const tokenParts = response.data.token.split('.');
        console.log('\n📊 Estrutura do Token:');
        console.log(`  • Header:  ${tokenParts[0].substring(0, 20)}...`);
        console.log(`  • Payload: ${tokenParts[1].substring(0, 20)}...`);
        console.log(`  • Sign:    ${tokenParts[2].substring(0, 20)}...`);
        
        console.log('\n💡 Para usar o token, adicione no header:');
        console.log(`Authorization: Bearer ${response.data.token}`);
        
        console.log('\n✅ MÉTODO QUE FUNCIONOU:');
        console.log(`   ${attempt.name}`);
        
        return response.data.token;
      } else {
        console.log('⚠️  Token não encontrado na resposta');
      }

    } catch (error: any) {
      console.error('\n❌ ERRO nesta tentativa!\n');
      
      if (error.response) {
        console.log('Status:', error.response.status, '-', error.response.statusText);
        console.log('Resposta:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 401) {
          console.log('💡 Dica: Credenciais inválidas ou API-Key incorreta');
        } else if (error.response.status === 400) {
          console.log('💡 Dica: Formato da requisição incorreto ou tenant não encontrado');
        }
      } else if (error.request) {
        console.error('❌ Nenhuma resposta recebida do servidor');
      } else {
        console.error('❌ Erro:', error.message);
      }
      
      // Continuar para próxima tentativa
      console.log('\n⏭️  Tentando próxima abordagem...');
    }
  }

  // Se chegou aqui, nenhuma tentativa funcionou
  console.log('\n\n' + '━'.repeat(80));
  console.log('❌ TODAS AS TENTATIVAS FALHARAM');
  console.log('━'.repeat(80));
  console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
  console.log('   1. As credenciais de teste podem estar desatualizadas');
  console.log('   2. Entre em contato com suporte Intelbras: (48) 2106 0006');
  console.log('   3. Use a sessão manual (capture cookies do navegador)');
  console.log('      Ver: MANUAL_COOKIES_GUIDE.md\n');
  
  throw new Error('Login falhou em todas as tentativas');
}

// Executar teste
testLogin()
  .then((token) => {
    console.log('\n✅ Teste concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou!');
    process.exit(1);
  });


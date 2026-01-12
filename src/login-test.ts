import axios from 'axios';

/**
 * Login no ambiente de TESTE da API CVE-Pro Intelbras
 * Base URL: cs-test.intelbras-cve-pro.com.br
 * 
 * Credenciais de teste fornecidas pela documentação:
 * - API-Key: fc961d23-0ebe-41df-b044-72fa60b3d89a
 * - User: cve-api@intelbras.com.br
 * - Senha: cve-api
 */

interface LoginResponse {
  token: string;
  user?: any;
  error?: string;
}

async function loginTest() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     🧪 LOGIN NO AMBIENTE DE TESTE - CVE-Pro API           ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Credenciais do ambiente de TESTE (da documentação)
  const credentials = {
    apiKey: 'fc961d23-0ebe-41df-b044-72fa60b3d89a',
    user: 'cve-api@intelbras.com.br',
    senha: 'cve-api'
  };

  // Base URL do ambiente de TESTE
  const baseUrl = 'https://cs-test.intelbras-cve-pro.com.br';

  console.log('━'.repeat(80));
  console.log('📋 CONFIGURAÇÕES');
  console.log('━'.repeat(80));
  console.log('🌐 Base URL:', baseUrl);
  console.log('🔑 API-Key:', credentials.apiKey);
  console.log('👤 User:', credentials.user);
  console.log('🔒 Senha:', credentials.senha);
  console.log('━'.repeat(80));

  // Tentar diferentes abordagens
  const methods = [
    {
      name: 'Método 1: POST /api/v1/login (padrão)',
      url: `${baseUrl}/api/v1/login`,
      method: 'POST',
      body: {
        email: credentials.user,
        password: credentials.senha
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'API-Key': credentials.apiKey
      }
    },
    {
      name: 'Método 2: POST /api/login',
      url: `${baseUrl}/api/login`,
      method: 'POST',
      body: {
        email: credentials.user,
        password: credentials.senha
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': credentials.apiKey
      }
    },
    {
      name: 'Método 3: POST /login',
      url: `${baseUrl}/login`,
      method: 'POST',
      body: {
        username: credentials.user,
        password: credentials.senha,
        apiKey: credentials.apiKey
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    {
      name: 'Método 4: POST /auth/login',
      url: `${baseUrl}/auth/login`,
      method: 'POST',
      body: {
        email: credentials.user,
        password: credentials.senha
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Api-Key': credentials.apiKey
      }
    }
  ];

  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    
    console.log('\n' + '═'.repeat(80));
    console.log(`🔄 ${method.name}`);
    console.log('═'.repeat(80));
    console.log('📍 URL:', method.url);
    console.log('📦 Body:', JSON.stringify(method.body, null, 2));
    console.log('📋 Headers:', JSON.stringify(method.headers, null, 2));
    console.log('\n⏳ Enviando requisição...\n');

    try {
      const response = await axios({
        method: method.method as any,
        url: method.url,
        data: method.body,
        headers: method.headers,
        timeout: 15000,
        validateStatus: () => true // Aceitar qualquer status
      });

      console.log('📬 Status:', response.status, response.statusText);
      console.log('📄 Response:');
      console.log(JSON.stringify(response.data, null, 2));

      // Verificar se obteve sucesso
      if (response.status === 200 && response.data) {
        const data = response.data as LoginResponse;
        
        if (data.token) {
          console.log('\n' + '🎉'.repeat(40));
          console.log('✅ LOGIN BEM-SUCEDIDO! ✅');
          console.log('🎉'.repeat(40) + '\n');
          
          console.log('━'.repeat(80));
          console.log('🔑 TOKEN JWT RECEBIDO:');
          console.log('━'.repeat(80));
          console.log(data.token);
          console.log('━'.repeat(80));

          // Análise do token
          const tokenParts = data.token.split('.');
          if (tokenParts.length === 3) {
            console.log('\n📊 Estrutura do Token:');
            console.log(`  ├─ Header:  ${tokenParts[0].substring(0, 30)}...`);
            console.log(`  ├─ Payload: ${tokenParts[1].substring(0, 30)}...`);
            console.log(`  └─ Sign:    ${tokenParts[2].substring(0, 30)}...`);

            // Decodificar payload
            try {
              const payloadDecoded = JSON.parse(
                Buffer.from(tokenParts[1], 'base64').toString('utf-8')
              );
              console.log('\n📦 Payload Decodificado:');
              console.log(JSON.stringify(payloadDecoded, null, 2));

              if (payloadDecoded.exp) {
                const expiryDate = new Date(payloadDecoded.exp * 1000);
                const now = new Date();
                const hoursValid = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                
                console.log(`\n⏰ Validade do Token:`);
                console.log(`   Expira em: ${expiryDate.toLocaleString()}`);
                console.log(`   Válido por: ${hoursValid} horas`);
              }
            } catch (e) {
              console.log('\n⚠️  Não foi possível decodificar o payload');
            }
          }

          // Instruções de uso
          console.log('\n\n' + '═'.repeat(80));
          console.log('💡 COMO USAR O TOKEN');
          console.log('═'.repeat(80));
          console.log('\nAdicione este header em todas as requisições:\n');
          console.log('Authorization: Bearer ' + data.token);
          console.log('\n' + '═'.repeat(80));

          console.log('\n📝 EXEMPLO DE USO EM CÓDIGO:\n');
          console.log('```javascript');
          console.log('const axios = require("axios");');
          console.log('');
          console.log(`const token = "${data.token.substring(0, 50)}...";`);
          console.log('');
          console.log('// Listar carregadores');
          console.log(`axios.get("${baseUrl}/api/v1/chargeBoxes", {`);
          console.log('  headers: {');
          console.log('    "Authorization": `Bearer ${token}`,');
          console.log('    "Accept": "application/json"');
          console.log('  }');
          console.log('})');
          console.log('.then(response => {');
          console.log('  console.log("Carregadores:", response.data);');
          console.log('})');
          console.log('.catch(error => {');
          console.log('  console.error("Erro:", error.response?.data);');
          console.log('});');
          console.log('```\n');

          // Informações do usuário
          if (data.user) {
            console.log('👤 INFORMAÇÕES DO USUÁRIO:');
            console.log('━'.repeat(80));
            console.log(JSON.stringify(data.user, null, 2));
            console.log('━'.repeat(80));
          }

          console.log('\n✅ MÉTODO QUE FUNCIONOU:');
          console.log(`   ${method.name}`);
          console.log(`   ${method.url}\n`);

          return data.token;
        } else if (data.error) {
          console.log('❌ Erro na resposta:', data.error);
        } else {
          console.log('⚠️  Token não encontrado na resposta');
        }
      } else if (response.status >= 400) {
        console.log('❌ Erro HTTP:', response.status);
      }

    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Conexão recusada - Servidor pode estar offline');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('❌ Timeout - Servidor não respondeu');
      } else if (error.response) {
        console.log('❌ Erro:', error.response.status, error.response.statusText);
        if (error.response.data) {
          console.log('Resposta:', JSON.stringify(error.response.data, null, 2));
        }
      } else {
        console.log('❌ Erro:', error.message);
      }
    }

    // Pequena pausa entre tentativas
    if (i < methods.length - 1) {
      console.log('\n⏭️  Tentando próximo método...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Se chegou aqui, nenhum método funcionou
  console.log('\n\n' + '═'.repeat(80));
  console.log('❌ NENHUM MÉTODO DE LOGIN FUNCIONOU');
  console.log('═'.repeat(80));
  
  console.log('\n💡 ANÁLISE DAS DIFICULDADES:\n');
  console.log('1️⃣  AMBIENTE DE TESTE vs PRODUÇÃO');
  console.log('   • Ambiente de teste pode ter configurações diferentes');
  console.log('   • Credenciais de teste podem estar desatualizadas');
  console.log('   • Servidor de teste pode estar offline\n');
  
  console.log('2️⃣  POSSÍVEIS CAUSAS:');
  console.log('   • API requer reCAPTCHA mesmo no ambiente de teste');
  console.log('   • Endpoint de login pode ser diferente da documentação');
  console.log('   • Credenciais fornecidas podem ser apenas exemplos');
  console.log('   • Tenant/API-Key pode precisar de configuração especial\n');
  
  console.log('3️⃣  SOLUÇÕES ALTERNATIVAS:\n');
  console.log('   A) USAR PRODUÇÃO COM SESSÃO MANUAL:');
  console.log('      • Fazer login no navegador (cs.intelbras-cve-pro.com.br)');
  console.log('      • Capturar cookies do DevTools');
  console.log('      • Usar no Discovery Tool (src/manual-session.ts)');
  console.log('      • Guia: MANUAL_COOKIES_GUIDE.md\n');
  
  console.log('   B) CONTATAR SUPORTE INTELBRAS:');
  console.log('      • Telefone: (48) 2106 0006');
  console.log('      • Solicitar credenciais válidas para teste');
  console.log('      • Perguntar endpoint correto para ambiente de teste\n');
  
  console.log('   C) USAR ESTAÇÃO SIMULADORA OCPP:');
  console.log('      • Conectar direto via WebSocket OCPP');
  console.log('      • ws://cs-test.intelbras-cve-pro.com.br:443/ocpp');
  console.log('      • Estações: INTELBRAS01, INTELBRAS03\n');

  console.log('═'.repeat(80));
  console.log('📞 SUPORTE');
  console.log('═'.repeat(80));
  console.log('Intelbras: (48) 2106 0006');
  console.log('Site: https://www.intelbras.com/en/support');
  console.log('═'.repeat(80));

  throw new Error('Login falhou em todos os métodos');
}

// Executar
console.log('\n');
loginTest()
  .then((token) => {
    console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║               ✅ TESTE CONCLUÍDO COM SUCESSO              ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║                  ❌ TESTE FALHOU                          ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    process.exit(1);
  });


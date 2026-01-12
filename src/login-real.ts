import axios from 'axios';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Função de login REAL na API CVE-Pro Intelbras
 * Usando suas credenciais do arquivo .env
 */

interface LoginResponse {
  token: string;
  user?: any;
}

async function loginReal() {
  console.log('🔐 Login Real na API CVE-Pro Intelbras\n');
  console.log('━'.repeat(80));

  // Pegar credenciais do .env
  const email = process.env.CVEPRO_USERNAME || process.env.CVEPRO_EMAIL;
  const password = process.env.CVEPRO_PASSWORD;
  const baseUrl = process.env.CVEPRO_BASE_URL || 'https://cs.intelbras-cve-pro.com.br';

  if (!email || !password) {
    console.error('❌ ERRO: Credenciais não encontradas!\n');
    console.log('Configure seu arquivo .env com:');
    console.log('CVEPRO_USERNAME=seu_usuario@exemplo.com');
    console.log('CVEPRO_PASSWORD=sua_senha\n');
    process.exit(1);
  }

  console.log('📍 URL:', baseUrl);
  console.log('👤 User:', email);
  console.log('🔑 Senha:', '*'.repeat(password.length));
  console.log('\n⏳ Tentando login...\n');

  try {
    // Tentativa 1: Login padrão (sem reCAPTCHA)
    console.log('🔄 Método 1: Login direto (sem reCAPTCHA)');
    
    const response = await axios.post<LoginResponse>(
      `${baseUrl}/api/v1/login`,
      {
        email: email,
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Origin': 'https://mundologic.intelbras-cve-pro.com.br'
        },
        timeout: 30000
      }
    );

    // Sucesso!
    console.log('\n✅ LOGIN BEM-SUCEDIDO!\n');
    console.log('━'.repeat(80));
    console.log('📋 RESPOSTA COMPLETA:');
    console.log('━'.repeat(80));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('━'.repeat(80));

    if (response.data.token) {
      console.log('\n🎉 TOKEN JWT RECEBIDO!\n');
      console.log('━'.repeat(80));
      console.log(response.data.token);
      console.log('━'.repeat(80));
      
      // Decodificar partes do token
      const tokenParts = response.data.token.split('.');
      if (tokenParts.length === 3) {
        console.log('\n📊 Estrutura do Token JWT:');
        console.log(`  • Header:  ${tokenParts[0].substring(0, 30)}...`);
        console.log(`  • Payload: ${tokenParts[1].substring(0, 30)}...`);
        console.log(`  • Sign:    ${tokenParts[2].substring(0, 30)}...`);
        
        // Tentar decodificar payload
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('\n📦 Payload decodificado:');
          console.log(JSON.stringify(payload, null, 2));
          
          if (payload.exp) {
            const expiryDate = new Date(payload.exp * 1000);
            console.log(`\n⏰ Token expira em: ${expiryDate.toLocaleString()}`);
          }
        } catch (e) {
          console.log('\n⚠️  Não foi possível decodificar o payload');
        }
      }
      
      console.log('\n\n✅ SUCESSO! Agora você pode usar este token.\n');
      console.log('💡 Para usar o token nas próximas requisições:');
      console.log('━'.repeat(80));
      console.log('Authorization: Bearer ' + response.data.token);
      console.log('━'.repeat(80));
      
      console.log('\n📝 Exemplo de uso:');
      console.log(`
const axios = require('axios');

const token = '${response.data.token.substring(0, 50)}...';

axios.get('${baseUrl}/api/v1/chargeBoxes', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('Carregadores:', response.data);
})
.catch(error => {
  console.error('Erro:', error.response?.data);
});
      `);

      return response.data.token;
    } else {
      console.log('\n⚠️  Token não encontrado na resposta');
      console.log('Resposta completa:', response.data);
      return null;
    }

  } catch (error: any) {
    console.error('\n❌ ERRO AO FAZER LOGIN!\n');
    console.log('━'.repeat(80));
    
    if (error.response) {
      console.log('📋 DETALHES DO ERRO:');
      console.log('━'.repeat(80));
      console.log('Status:', error.response.status, '-', error.response.statusText);
      console.log('\nResposta do servidor:');
      console.log(JSON.stringify(error.response.data, null, 2));
      console.log('━'.repeat(80));
      
      if (error.response.status === 401) {
        console.log('\n💡 Possíveis causas:');
        console.log('   • Usuário ou senha incorretos');
        console.log('   • Conta bloqueada ou inativa');
        console.log('   • Necessário fazer login pelo navegador primeiro');
      } else if (error.response.status === 400) {
        const errorData = error.response.data;
        if (errorData?.error?.includes('reCAPTCHA') || errorData?.error?.includes('recaptcha')) {
          console.log('\n💡 ATENÇÃO: Login requer reCAPTCHA!');
          console.log('━'.repeat(80));
          console.log('A API exige validação reCAPTCHA v3 para login automático.');
          console.log('\n✅ SOLUÇÃO: Use Sessão Manual');
          console.log('━'.repeat(80));
          console.log('\n📋 Passos:');
          console.log('1. Abra o Chrome e faça login em:');
          console.log('   https://mundologic.intelbras-cve-pro.com.br/auth/login');
          console.log('\n2. Abra DevTools (CMD + Option + I)');
          console.log('\n3. Vá em Application → Cookies');
          console.log('   Copie: JSESSIONID, session, etc');
          console.log('\n4. Abra: src/manual-session.ts');
          console.log('   Cole seus cookies');
          console.log('\n5. Execute: npm run dev');
          console.log('\n📖 Guia completo: MANUAL_COOKIES_GUIDE.md\n');
        } else {
          console.log('\n💡 Erro 400: Requisição inválida');
          console.log('   • Verifique se suas credenciais estão corretas no .env');
          console.log('   • Entre em contato com suporte: (48) 2106 0006');
        }
      } else if (error.response.status === 403) {
        console.log('\n💡 Acesso negado');
        console.log('   • Sua conta pode não ter permissões necessárias');
        console.log('   • Entre em contato com administrador do sistema');
      }
    } else if (error.request) {
      console.error('❌ Nenhuma resposta recebida do servidor');
      console.error('   • Verifique sua conexão de internet');
      console.error('   • Verifique se a URL está correta:', baseUrl);
      console.error('   • Firewall pode estar bloqueando a conexão');
    } else {
      console.error('❌ Erro ao configurar requisição:', error.message);
    }
    
    console.log('\n━'.repeat(80));
    console.log('📞 SUPORTE INTELBRAS');
    console.log('━'.repeat(80));
    console.log('Telefone: (48) 2106 0006');
    console.log('Site: https://www.intelbras.com/en/support');
    console.log('━'.repeat(80));
    
    throw error;
  }
}

// Executar
loginReal()
  .then((token) => {
    console.log('\n\n✅ Processo concluído com sucesso!');
    console.log('Token salvo e pronto para uso.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n\n❌ Processo falhou.');
    console.log('Use sessão manual ou entre em contato com suporte.\n');
    process.exit(1);
  });


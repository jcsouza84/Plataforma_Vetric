/**
 * 🧪 Testar API de Mensagens Notificações
 */

const API_URL = 'https://vetric-backend.onrender.com';

async function testarAPI() {
  console.log('🧪 Testando API de Mensagens Notificações...\n');

  try {
    console.log('📡 GET /api/mensagens-notificacoes\n');
    
    const response = await fetch(`${API_URL}/api/mensagens-notificacoes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nota: Precisa de autenticação!
      },
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('\nResposta:', JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log(`\n✅ ${data.data.length} mensagens encontradas!`);
      data.data.forEach((msg, i) => {
        console.log(`\n${i + 1}. ${msg.titulo}`);
        console.log(`   Tipo: ${msg.tipo}`);
        console.log(`   Ativo: ${msg.ativo ? '🟢' : '🔴'}`);
      });
    } else {
      console.log('\n❌ Nenhuma mensagem encontrada ou erro na API');
    }

  } catch (error) {
    console.error('\n❌ Erro ao testar API:', error.message);
  }
}

testarAPI();


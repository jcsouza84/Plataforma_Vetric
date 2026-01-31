import axios from 'axios';
import chalk from 'chalk';

/**
 * Script de teste rápido para enviar mensagem via Evolution API
 * Use este script para validar a integração
 */

const config = {
  baseUrl: 'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me',
  apiKey: 't1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg=='
};

async function sendTestMessage() {
  console.log(chalk.bold.cyan('\n🚀 TESTE DE ENVIO - EVOLUTION API\n'));
  
  // Configurações da mensagem de teste
  const instanceName = 'Vetric Bot';
  const phoneNumber = '558291096461'; // Número do próprio bot para teste
  const message = `
🎉 *TESTE VETRIC BOT*

✅ Conexão estabelecida com sucesso!
📱 Instância: ${instanceName}
🕐 Data/Hora: ${new Date().toLocaleString('pt-BR')}

O bot está pronto para uso! 🚀

_Sistema VETRIC - CVE_
  `.trim();

  console.log(chalk.white('📋 Configuração:'));
  console.log(chalk.gray(`  Instância: ${instanceName}`));
  console.log(chalk.gray(`  Número: ${phoneNumber}`));
  console.log(chalk.gray(`  Base URL: ${config.baseUrl}\n`));

  try {
    console.log(chalk.yellow('⏳ Enviando mensagem...\n'));

    const response = await axios.post(
      `${config.baseUrl}/message/sendText/${encodeURIComponent(instanceName)}`,
      {
        number: phoneNumber,
        text: message
      },
      {
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(chalk.green('✅ MENSAGEM ENVIADA COM SUCESSO!\n'));
    console.log(chalk.white('📊 Resposta da API:'));
    console.log(chalk.gray(JSON.stringify(response.data, null, 2)));
    
    console.log(chalk.green('\n✅ TESTE CONCLUÍDO!'));
    console.log(chalk.white('\n💡 Próximos passos:'));
    console.log(chalk.white('  1. Verifique o WhatsApp do número 558291096461'));
    console.log(chalk.white('  2. Confirme o recebimento da mensagem'));
    console.log(chalk.white('  3. Comece a integrar no projeto VETRIC'));
    console.log(chalk.white('  4. Leia a documentação completa: EVOLUTION_API_ANALYSIS.md\n'));

  } catch (error: any) {
    console.log(chalk.red('\n❌ ERRO AO ENVIAR MENSAGEM\n'));
    
    if (error.response) {
      console.log(chalk.yellow('Status:', error.response.status));
      console.log(chalk.yellow('Erro:', JSON.stringify(error.response.data, null, 2)));
      
      // Dicas específicas por tipo de erro
      if (error.response.status === 404) {
        console.log(chalk.white('\n💡 Dica: Verifique se o nome da instância está correto.'));
        console.log(chalk.gray('   Instâncias disponíveis:'));
        console.log(chalk.gray('   - Spresso Bot'));
        console.log(chalk.gray('   - Alisson (Pessoal)'));
        console.log(chalk.gray('   - Vetric Bot'));
      } else if (error.response.status === 401) {
        console.log(chalk.white('\n💡 Dica: API Key inválida ou expirada.'));
      } else if (error.response.status === 400) {
        console.log(chalk.white('\n💡 Dica: Verifique o formato do número de telefone.'));
        console.log(chalk.gray('   Formato correto: código do país + DDD + número'));
        console.log(chalk.gray('   Exemplo: 5582991096461'));
      }
    } else {
      console.log(chalk.red('Erro:', error.message));
    }
    
    process.exit(1);
  }
}

// Executar teste
sendTestMessage();






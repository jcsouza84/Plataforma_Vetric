import axios from 'axios';
import chalk from 'chalk';

/**
 * Teste prático - Envio de mensagem via Vetric Bot
 * Número destino: 5582996176797
 * Mensagem: teste VETRIC
 */

async function sendPracticalTest() {
  console.log(chalk.bold.cyan('\n🚀 TESTE PRÁTICO - VETRIC BOT\n'));

  const config = {
    baseUrl: 'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me',
    apiKey: 't1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==',
    instanceName: 'Vetric Bot',
    targetPhone: '5582996176797',
    message: 'teste VETRIC'
  };

  console.log(chalk.white('📋 Configuração do Teste:'));
  console.log(chalk.gray(`  Instância: ${config.instanceName}`));
  console.log(chalk.gray(`  Número Destino: ${config.targetPhone}`));
  console.log(chalk.gray(`  Mensagem: "${config.message}"`));
  console.log(chalk.gray(`  Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`));

  try {
    console.log(chalk.yellow('⏳ Enviando mensagem...\n'));

    const response = await axios.post(
      `${config.baseUrl}/message/sendText/${encodeURIComponent(config.instanceName)}`,
      {
        number: config.targetPhone,
        text: config.message
      },
      {
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      }
    );

    console.log(chalk.green('✅ MENSAGEM ENVIADA COM SUCESSO!\n'));
    console.log(chalk.white('📊 Detalhes da Resposta:'));
    console.log(chalk.gray('─'.repeat(60)));
    
    // Informações principais
    if (response.data.key) {
      console.log(chalk.white(`  ID da Mensagem: ${chalk.bold(response.data.key.id)}`));
      console.log(chalk.white(`  Destinatário: ${chalk.bold(response.data.key.remoteJid)}`));
      console.log(chalk.white(`  Enviada de: ${chalk.bold(response.data.key.fromMe ? 'Bot' : 'Outro')}`));
    }
    
    if (response.data.status) {
      const statusColor = response.data.status === 'PENDING' ? chalk.yellow : 
                         response.data.status === 'SENT' ? chalk.green : chalk.white;
      console.log(chalk.white(`  Status: ${statusColor(response.data.status)}`));
    }
    
    if (response.data.messageTimestamp) {
      const timestamp = new Date(response.data.messageTimestamp * 1000);
      console.log(chalk.white(`  Timestamp: ${chalk.bold(timestamp.toLocaleString('pt-BR'))}`));
    }
    
    console.log(chalk.gray('─'.repeat(60)));
    
    // Mostrar mensagem enviada
    if (response.data.message) {
      console.log(chalk.white('\n💬 Conteúdo da Mensagem:'));
      const messageText = response.data.message.conversation || 
                         response.data.message.text || 
                         JSON.stringify(response.data.message);
      console.log(chalk.cyan(`  "${messageText}"`));
    }
    
    // Resposta completa (para debug)
    console.log(chalk.white('\n📦 Resposta Completa da API:'));
    console.log(chalk.gray(JSON.stringify(response.data, null, 2)));
    
    console.log(chalk.green('\n✅ TESTE CONCLUÍDO COM SUCESSO!'));
    console.log(chalk.white(`\n💡 A mensagem foi enviada para o WhatsApp ${config.targetPhone}`));
    console.log(chalk.white('   Verifique o aplicativo para confirmar o recebimento.\n'));

  } catch (error: any) {
    console.log(chalk.red('\n❌ ERRO AO ENVIAR MENSAGEM\n'));
    
    if (error.response) {
      console.log(chalk.yellow('📋 Detalhes do Erro:'));
      console.log(chalk.white(`  Status HTTP: ${error.response.status}`));
      console.log(chalk.white(`  Status Text: ${error.response.statusText}`));
      
      if (error.response.data) {
        console.log(chalk.white('\n  Resposta da API:'));
        console.log(chalk.gray(JSON.stringify(error.response.data, null, 2)));
      }
      
      // Dicas específicas por tipo de erro
      console.log(chalk.white('\n💡 Possíveis Soluções:'));
      
      if (error.response.status === 404) {
        console.log(chalk.gray('   • Verifique se o nome da instância está correto'));
        console.log(chalk.gray('   • Confirme que a instância "Vetric Bot" existe'));
      } else if (error.response.status === 401 || error.response.status === 403) {
        console.log(chalk.gray('   • Verifique se a API Key está correta'));
        console.log(chalk.gray('   • Confirme que a API Key tem permissão para essa ação'));
      } else if (error.response.status === 400) {
        console.log(chalk.gray('   • Verifique o formato do número (deve ser: 5582996176797)'));
        console.log(chalk.gray('   • Confirme que a instância está conectada ao WhatsApp'));
      } else if (error.response.status === 500) {
        console.log(chalk.gray('   • Erro no servidor da Evolution API'));
        console.log(chalk.gray('   • Tente novamente em alguns instantes'));
      }
      
    } else if (error.request) {
      console.log(chalk.yellow('⚠️ Nenhuma resposta recebida do servidor'));
      console.log(chalk.white('\n💡 Possíveis causas:'));
      console.log(chalk.gray('   • Servidor Evolution API pode estar offline'));
      console.log(chalk.gray('   • Problema de conexão de rede'));
      console.log(chalk.gray('   • Timeout na requisição'));
      
    } else {
      console.log(chalk.red(`Erro: ${error.message}`));
    }
    
    console.log('');
    process.exit(1);
  }
}

// Executar teste
sendPracticalTest().catch(error => {
  console.error(chalk.red('\n❌ Erro fatal:'), error.message);
  process.exit(1);
});




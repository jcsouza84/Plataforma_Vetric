import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { consoleLogger, rawLogger } from './logger';
import { CVEAuth } from './auth';
import { CVEWebSocketClient } from './websocket';
import { ChargersConfig, DiscoveryConfig } from './types';

/**
 * VETRIC CVE Discovery Tool
 * Ferramenta para descobrir e monitorar o protocolo WebSocket do CVE-PRO
 */

// Carregar variáveis de ambiente
dotenv.config();

// Banner inicial
function printBanner() {
  console.clear();
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║        🔍 VETRIC CVE DISCOVERY TOOL v1.0                  ║');
  console.log('║                                                           ║');
  console.log('║        Monitoramento WebSocket CVE-PRO Intelbras          ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// Validar configurações
function validateConfig(): DiscoveryConfig | null {
  consoleLogger.section('VALIDAÇÃO DE CONFIGURAÇÕES');

  // Validar variáveis de ambiente
  const baseUrl = process.env.CVEPRO_BASE_URL;
  const username = process.env.CVEPRO_USERNAME;
  const password = process.env.CVEPRO_PASSWORD;

  if (!baseUrl || !username || !password) {
    consoleLogger.error('Configurações incompletas no arquivo .env');
    consoleLogger.error('Certifique-se de configurar:');
    consoleLogger.error('  - CVEPRO_BASE_URL');
    consoleLogger.error('  - CVEPRO_USERNAME');
    consoleLogger.error('  - CVEPRO_PASSWORD');
    consoleLogger.info('\nDica: Copie o arquivo .env.example para .env e preencha os valores');
    return null;
  }

  // Carregar lista de carregadores
  const chargersPath = join(process.cwd(), 'chargers.json');
  let chargersConfig: ChargersConfig;

  try {
    const chargersData = readFileSync(chargersPath, 'utf8');
    chargersConfig = JSON.parse(chargersData);

    if (!chargersConfig.chargers || chargersConfig.chargers.length === 0) {
      consoleLogger.error('Nenhum carregador configurado em chargers.json');
      return null;
    }
  } catch (error: any) {
    consoleLogger.error('Erro ao ler chargers.json', error);
    consoleLogger.info('Certifique-se de que o arquivo chargers.json existe e está no formato correto');
    return null;
  }

  // Exibir resumo da configuração
  consoleLogger.success('Configurações válidas ✓');
  consoleLogger.info(`URL Base: ${baseUrl}`);
  consoleLogger.info(`Usuário: ${username}`);
  consoleLogger.info(`Carregadores: ${chargersConfig.chargers.length}`);
  consoleLogger.info(`Debug Mode: ${process.env.DEBUG_MODE === 'true' ? 'Ativado' : 'Desativado'}`);
  consoleLogger.info(`Auto Reconnect: ${process.env.AUTO_RECONNECT === 'true' ? 'Ativado' : 'Desativado'}`);

  console.log('\n📋 Carregadores configurados:');
  for (const charger of chargersConfig.chargers) {
    consoleLogger.info(`  • ${charger.name} (${charger.id}) - ${charger.connectors.length} conector(es)`);
  }
  console.log('');

  return {
    baseUrl,
    credentials: { username, password },
    chargers: chargersConfig.chargers,
    debug: process.env.DEBUG_MODE === 'true',
    saveRawMessages: process.env.SAVE_RAW_MESSAGES !== 'false',
    autoReconnect: process.env.AUTO_RECONNECT === 'true',
  };
}

// Função principal
async function main() {
  printBanner();

  // Validar configurações
  const config = validateConfig();
  if (!config) {
    process.exit(1);
  }

  // Aguardar 2 segundos para o usuário ler as configurações
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Etapa 1: Autenticação
    const auth = new CVEAuth(config.baseUrl, config.credentials);
    const loginSuccess = await auth.login();

    if (!loginSuccess) {
      consoleLogger.error('Falha na autenticação. Verifique suas credenciais e tente novamente.');
      process.exit(1);
    }

    // Aguardar 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Etapa 2: Conectar ao WebSocket
    const wsClient = new CVEWebSocketClient(auth, config.chargers);
    const wsConnected = await wsClient.connect();

    if (!wsConnected) {
      consoleLogger.error('Falha ao conectar no WebSocket STOMP.');
      process.exit(1);
    }

    // Etapa 3: Aguardar mensagens
    consoleLogger.section('MONITORAMENTO ATIVO');
    consoleLogger.success('Sistema online e monitorando! 🚀');
    consoleLogger.info('Todas as mensagens estão sendo capturadas e salvas em logs/');
    consoleLogger.info('Pressione CTRL+C para encerrar e gerar relatório final\n');

    // Exibir estatísticas a cada 30 segundos
    setInterval(() => {
      consoleLogger.stats();
    }, 30000);

    // Manter processo rodando
    process.on('SIGINT', async () => {
      consoleLogger.section('FINALIZANDO');
      
      // Desconectar WebSocket
      await wsClient.disconnect();
      
      // Estatísticas finais
      console.log('\n📊 Estatísticas da Sessão:');
      consoleLogger.info(`  • Mensagens recebidas: ${wsClient.getMessagesCount()}`);
      consoleLogger.info(`  • Mensagens salvas: ${rawLogger.getMessageCount()}`);
      consoleLogger.info(`  • Arquivo de logs: ${rawLogger.getMessagesFile()}`);
      
      consoleLogger.success('\n✓ Discovery Tool finalizado com sucesso!');
      consoleLogger.info('Analise os arquivos em logs/ para entender o protocolo\n');
      
      process.exit(0);
    });

  } catch (error: any) {
    consoleLogger.error('Erro fatal durante execução', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  consoleLogger.error('Rejeição não tratada:', reason);
});

process.on('uncaughtException', (error) => {
  consoleLogger.error('Exceção não capturada:', error);
  process.exit(1);
});

// Iniciar aplicação
main().catch((error) => {
  consoleLogger.error('Erro ao iniciar aplicação', error);
  process.exit(1);
});







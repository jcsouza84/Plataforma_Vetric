import { ManualMessageAnalyzer } from './manual-analyzer';
import { consoleLogger, rawLogger } from './logger';
import { join } from 'path';

/**
 * Script para analisar mensagens capturadas manualmente
 */

function printBanner() {
  console.clear();
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     📊 VETRIC CVE - Analisador de Mensagens Manual       ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');
}

async function main() {
  printBanner();

  consoleLogger.section('MODO: ANÁLISE MANUAL');
  consoleLogger.info('Este modo analisa mensagens que você capturou do Chrome DevTools');
  console.log('');

  // Nome do arquivo onde as mensagens devem estar
  const messagesFile = join(process.cwd(), 'captured-messages.json');

  consoleLogger.info('Procurando arquivo: captured-messages.json');
  consoleLogger.info('Instruções:');
  console.log('  1. Vá no Chrome DevTools → Network → WS');
  console.log('  2. Copie as mensagens da aba "Messages"');
  console.log('  3. Cole em um arquivo chamado: captured-messages.json');
  console.log('  4. Execute este script novamente');
  console.log('');

  // Criar analisador
  const analyzer = new ManualMessageAnalyzer();

  // Tentar carregar mensagens
  let loaded = analyzer.loadFromFile(messagesFile);

  // Se não encontrou JSON, tentar .txt
  if (!loaded) {
    const textFile = join(process.cwd(), 'captured-messages.txt');
    consoleLogger.info('Tentando arquivo .txt...');
    loaded = analyzer.loadFromText(textFile);
  }

  if (!loaded) {
    consoleLogger.error('Nenhum arquivo de mensagens encontrado!');
    consoleLogger.info('Crie um arquivo chamado "captured-messages.json" na raiz do projeto');
    consoleLogger.info('Formato esperado:');
    console.log('');
    console.log('Opção 1 - Array de mensagens:');
    console.log('[');
    console.log('  {"status": "Available", "connector": 1},');
    console.log('  {"status": "Charging", "power": 7.4}');
    console.log(']');
    console.log('');
    console.log('Opção 2 - Arquivo de texto (uma mensagem JSON por linha):');
    console.log('{"status": "Available"}');
    console.log('{"status": "Charging"}');
    console.log('');
    process.exit(1);
  }

  // Analisar mensagens
  analyzer.analyze();

  // Estatísticas finais
  consoleLogger.section('FINALIZAÇÃO');
  consoleLogger.success(`Análise completa! ${analyzer.getMessages().length} mensagens processadas`);
  consoleLogger.info(`Logs salvos em: logs/raw-messages/`);
  console.log('');
}

// Executar
main().catch((error) => {
  consoleLogger.error('Erro durante análise', error);
  process.exit(1);
});


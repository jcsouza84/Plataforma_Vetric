import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Script de análise de logs coletados
 */

const LOGS_DIR = join(process.cwd(), 'logs');
const RAW_MESSAGES_DIR = join(LOGS_DIR, 'raw-messages');

function printHeader(title: string) {
  console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
  console.log(chalk.bold.cyan(`  ${title}`));
  console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');
}

function analyzeMessages() {
  printHeader('ANÁLISE DOS LOGS COLETADOS');

  if (!existsSync(RAW_MESSAGES_DIR)) {
    console.log(chalk.red('❌ Diretório de logs não encontrado.'));
    console.log(chalk.yellow('Execute o Discovery Tool primeiro: npm run dev'));
    return;
  }

  const files = readdirSync(RAW_MESSAGES_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(chalk.red('❌ Nenhum arquivo de log encontrado.'));
    return;
  }

  console.log(chalk.green(`✓ Encontrados ${files.length} arquivo(s) de log\n`));

  // Analisar o arquivo mais recente
  const latestFile = files.sort().reverse()[0];
  const filePath = join(RAW_MESSAGES_DIR, latestFile);

  console.log(chalk.white(`📄 Analisando: ${latestFile}\n`));

  try {
    const content = readFileSync(filePath, 'utf8');
    const messages = JSON.parse(content);

    if (!Array.isArray(messages) || messages.length === 0) {
      console.log(chalk.yellow('⚠ Arquivo vazio ou sem mensagens'));
      return;
    }

    // Estatísticas gerais
    printHeader('ESTATÍSTICAS GERAIS');
    console.log(chalk.white(`Total de mensagens: ${chalk.bold.green(messages.length)}`));

    // Contar por tipo
    const byType: Record<string, number> = {};
    messages.forEach(msg => {
      const type = msg.type || 'UNKNOWN';
      byType[type] = (byType[type] || 0) + 1;
    });

    console.log(chalk.white('\nPor tipo:'));
    Object.entries(byType).forEach(([type, count]) => {
      console.log(chalk.white(`  • ${type}: ${chalk.bold(count)}`));
    });

    // Contar por carregador
    const byCharger: Record<string, number> = {};
    messages.forEach(msg => {
      if (msg.charger) {
        byCharger[msg.charger] = (byCharger[msg.charger] || 0) + 1;
      }
    });

    if (Object.keys(byCharger).length > 0) {
      console.log(chalk.white('\nPor carregador:'));
      Object.entries(byCharger).forEach(([charger, count]) => {
        console.log(chalk.white(`  • ${charger}: ${chalk.bold(count)} mensagens`));
      });
    }

    // Mostrar primeiras mensagens
    printHeader('PRIMEIRAS 3 MENSAGENS (EXEMPLO)');
    
    const firstMessages = messages.filter(m => m.type === 'MESSAGE').slice(0, 3);
    
    if (firstMessages.length === 0) {
      console.log(chalk.yellow('Nenhuma mensagem do tipo MESSAGE encontrada'));
    } else {
      firstMessages.forEach((msg, idx) => {
        console.log(chalk.cyan(`\n[${idx + 1}] ${msg.charger || 'Unknown'} - ${msg.timestamp}`));
        console.log(chalk.white('Body:'));
        console.log(chalk.gray(JSON.stringify(msg.body, null, 2)));
      });
    }

    // Identificar campos únicos no body
    printHeader('CAMPOS ENCONTRADOS NOS BODIES');
    
    const allFields = new Set<string>();
    messages.forEach(msg => {
      if (msg.body && typeof msg.body === 'object') {
        Object.keys(msg.body).forEach(key => allFields.add(key));
      }
    });

    if (allFields.size > 0) {
      console.log(chalk.white('Campos detectados:'));
      Array.from(allFields).sort().forEach(field => {
        console.log(chalk.white(`  • ${chalk.bold(field)}`));
      });
    } else {
      console.log(chalk.yellow('Nenhum campo estruturado encontrado'));
    }

    // Análise de possíveis estados
    printHeader('ANÁLISE DE ESTADOS (se disponível)');
    
    const statusFields = ['status', 'state', 'chargePointStatus', 'connectorStatus'];
    const foundStatuses = new Set<string>();
    
    messages.forEach(msg => {
      if (msg.body && typeof msg.body === 'object') {
        statusFields.forEach(field => {
          if (msg.body[field]) {
            foundStatuses.add(`${field}: ${msg.body[field]}`);
          }
        });
      }
    });

    if (foundStatuses.size > 0) {
      console.log(chalk.white('Estados detectados:'));
      Array.from(foundStatuses).forEach(status => {
        console.log(chalk.white(`  • ${chalk.bold(status)}`));
      });
    } else {
      console.log(chalk.yellow('Nenhum campo de status identificado automaticamente'));
      console.log(chalk.gray('Verifique manualmente o conteúdo dos bodies'));
    }

    // Sugestões
    printHeader('PRÓXIMOS PASSOS');
    console.log(chalk.white('1. Revise os exemplos de mensagens acima'));
    console.log(chalk.white('2. Identifique como detectar cada estado:'));
    console.log(chalk.gray('   - Livre/Disponível'));
    console.log(chalk.gray('   - Ocupado/Carregando'));
    console.log(chalk.gray('   - Ocioso'));
    console.log(chalk.gray('   - Falha'));
    console.log(chalk.white('3. Verifique se aparece informação do usuário/TAG'));
    console.log(chalk.white(`4. Compartilhe o arquivo: ${chalk.bold(latestFile)}`));
    console.log('');

  } catch (error: any) {
    console.log(chalk.red('❌ Erro ao analisar logs:'), error.message);
  }
}

// Executar análise
analyzeMessages();



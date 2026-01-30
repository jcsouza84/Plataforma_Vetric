import winston from 'winston';
import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

/**
 * Sistema de Logging Avançado para Discovery Tool
 */

const LOGS_DIR = join(process.cwd(), 'logs');
const RAW_MESSAGES_DIR = join(LOGS_DIR, 'raw-messages');

// Criar diretórios de logs se não existirem
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}
if (!existsSync(RAW_MESSAGES_DIR)) {
  mkdirSync(RAW_MESSAGES_DIR, { recursive: true });
}

// Configuração do Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: join(LOGS_DIR, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: join(LOGS_DIR, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Logger colorido para console
class ConsoleLogger {
  private sessionStartTime: Date;
  private messageCount: number = 0;

  constructor() {
    this.sessionStartTime = new Date();
  }

  info(message: string, data?: any) {
    console.log(chalk.blue('ℹ'), chalk.white(message));
    if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
    logger.info(message, data);
  }

  success(message: string, data?: any) {
    console.log(chalk.green('✓'), chalk.white(message));
    if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
    logger.info(message, data);
  }

  warn(message: string, data?: any) {
    console.log(chalk.yellow('⚠'), chalk.white(message));
    if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
    logger.warn(message, data);
  }

  error(message: string, error?: any) {
    console.log(chalk.red('✖'), chalk.white(message));
    if (error) {
      if (error.stack) {
        console.log(chalk.red(error.stack));
      } else {
        console.log(chalk.red(JSON.stringify(error, null, 2)));
      }
    }
    logger.error(message, error);
  }

  debug(message: string, data?: any) {
    if (process.env.DEBUG_MODE === 'true') {
      console.log(chalk.magenta('🔍'), chalk.white(message));
      if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
    logger.debug(message, data);
  }

  websocket(type: string, message: string, data?: any) {
    this.messageCount++;
    const icon = type === 'RECEIVE' ? '⬇' : '⬆';
    const color = type === 'RECEIVE' ? chalk.cyan : chalk.magenta;
    console.log(color(icon), chalk.white(message));
    if (data && process.env.DEBUG_MODE === 'true') {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  section(title: string) {
    console.log('\n' + chalk.bold.cyan('━'.repeat(60)));
    console.log(chalk.bold.cyan(`  ${title}`));
    console.log(chalk.bold.cyan('━'.repeat(60)) + '\n');
  }

  stats() {
    const uptime = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
    console.log(chalk.gray(`\n📊 Estatísticas: ${this.messageCount} mensagens | ${uptime}s online`));
  }
}

// Classe para salvar mensagens brutas
class RawMessageLogger {
  private messagesFile: string;
  private sessionFile: string;
  private messages: any[] = [];

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.messagesFile = join(RAW_MESSAGES_DIR, `messages-${timestamp}.json`);
    this.sessionFile = join(LOGS_DIR, 'session-info.json');
    
    // Inicializar arquivo de mensagens
    writeFileSync(this.messagesFile, '[\n', 'utf8');
  }

  saveSessionInfo(info: any) {
    writeFileSync(this.sessionFile, JSON.stringify(info, null, 2), 'utf8');
  }

  saveMessage(message: any) {
    this.messages.push(message);
    
    // Salvar mensagem no arquivo (append)
    const json = JSON.stringify(message, null, 2);
    const separator = this.messages.length > 1 ? ',\n' : '';
    appendFileSync(this.messagesFile, separator + json, 'utf8');
  }

  finalize() {
    appendFileSync(this.messagesFile, '\n]', 'utf8');
  }

  getMessagesFile() {
    return this.messagesFile;
  }

  getMessageCount() {
    return this.messages.length;
  }
}

// Exportar instâncias
export const consoleLogger = new ConsoleLogger();
export const rawLogger = new RawMessageLogger();

// Interceptar CTRL+C para finalizar logs
process.on('SIGINT', () => {
  consoleLogger.info('Finalizando Discovery Tool...');
  rawLogger.finalize();
  consoleLogger.success(`Logs salvos em: ${LOGS_DIR}`);
  consoleLogger.stats();
  process.exit(0);
});

process.on('SIGTERM', () => {
  rawLogger.finalize();
  process.exit(0);
});





/**
 * Analisador de Mensagens WebSocket
 * Cole mensagens capturadas manualmente do Chrome DevTools
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { consoleLogger, rawLogger } from './logger';

interface CapturedMessage {
  timestamp?: string;
  type?: string;
  data: string;
  direction?: 'sent' | 'received';
}

/**
 * Analisa mensagens capturadas manualmente
 */
export class ManualMessageAnalyzer {
  private messages: any[] = [];
  
  /**
   * Carrega mensagens de um arquivo JSON
   */
  loadFromFile(filePath: string): boolean {
    try {
      if (!existsSync(filePath)) {
        consoleLogger.error(`Arquivo não encontrado: ${filePath}`);
        return false;
      }

      consoleLogger.info(`Carregando mensagens de: ${filePath}`);
      const content = readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Suportar diferentes formatos
      if (Array.isArray(data)) {
        this.messages = data;
      } else if (data.messages && Array.isArray(data.messages)) {
        this.messages = data.messages;
      } else {
        this.messages = [data];
      }

      consoleLogger.success(`${this.messages.length} mensagem(ns) carregada(s)`);
      return true;
    } catch (error: any) {
      consoleLogger.error('Erro ao carregar arquivo', error);
      return false;
    }
  }

  /**
   * Carrega mensagens de texto bruto (uma por linha)
   */
  loadFromText(filePath: string): boolean {
    try {
      if (!existsSync(filePath)) {
        consoleLogger.error(`Arquivo não encontrado: ${filePath}`);
        return false;
      }

      consoleLogger.info(`Carregando mensagens de texto: ${filePath}`);
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      this.messages = lines.map((line, index) => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line, index };
        }
      });

      consoleLogger.success(`${this.messages.length} mensagem(ns) carregada(s)`);
      return true;
    } catch (error: any) {
      consoleLogger.error('Erro ao carregar arquivo de texto', error);
      return false;
    }
  }

  /**
   * Analisa as mensagens carregadas
   */
  analyze() {
    if (this.messages.length === 0) {
      consoleLogger.warn('Nenhuma mensagem para analisar');
      return;
    }

    consoleLogger.section('ANÁLISE DAS MENSAGENS');

    // Estatísticas básicas
    consoleLogger.info(`Total de mensagens: ${this.messages.length}`);

    // Identificar tipos de mensagens
    const types = new Set<string>();
    const fields = new Set<string>();

    this.messages.forEach((msg, index) => {
      // Salvar no logger
      rawLogger.saveMessage({
        timestamp: new Date().toISOString(),
        type: 'MANUAL_CAPTURE',
        index: index,
        data: msg,
      });

      // Analisar estrutura
      if (typeof msg === 'object') {
        Object.keys(msg).forEach(key => fields.add(key));
        if (msg.type) types.add(msg.type);
      }

      // Log de cada mensagem
      consoleLogger.debug(`Mensagem ${index + 1}:`, msg);
    });

    // Resumo
    consoleLogger.section('RESUMO DA ANÁLISE');
    consoleLogger.info(`Tipos de mensagens: ${Array.from(types).join(', ') || 'N/A'}`);
    consoleLogger.info(`Campos detectados: ${Array.from(fields).join(', ')}`);

    // Identificar padrões
    this.identifyPatterns();
  }

  /**
   * Identifica padrões nas mensagens
   */
  private identifyPatterns() {
    consoleLogger.section('PADRÕES IDENTIFICADOS');

    // Procurar campos de status
    const statusFields = ['status', 'state', 'chargePointStatus', 'connectorStatus'];
    const statusValues = new Set<string>();

    this.messages.forEach(msg => {
      if (typeof msg === 'object') {
        statusFields.forEach(field => {
          if (msg[field]) {
            statusValues.add(`${field}: ${msg[field]}`);
          }
        });
      }
    });

    if (statusValues.size > 0) {
      consoleLogger.success('Estados detectados:');
      Array.from(statusValues).forEach(status => {
        consoleLogger.info(`  • ${status}`);
      });
    }

    // Procurar campos de energia
    const energyFields = ['energy', 'kWh', 'power', 'meterValue'];
    const hasEnergy = this.messages.some(msg => 
      energyFields.some(field => msg[field] !== undefined)
    );

    if (hasEnergy) {
      consoleLogger.success('✓ Dados de energia encontrados');
    }

    // Procurar campos de usuário
    const userFields = ['user', 'userName', 'idTag', 'tagId'];
    const hasUser = this.messages.some(msg => 
      userFields.some(field => msg[field] !== undefined)
    );

    if (hasUser) {
      consoleLogger.success('✓ Dados de usuário encontrados');
    }
  }

  /**
   * Retorna as mensagens carregadas
   */
  getMessages() {
    return this.messages;
  }
}


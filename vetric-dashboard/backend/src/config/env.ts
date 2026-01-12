/**
 * ⚙️ VETRIC - Configuração de Variáveis de Ambiente
 */

import * as dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001'),
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vetric_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  
  cve: {
    baseUrl: process.env.CVE_API_BASE_URL || process.env.CVE_BASE_URL || 'https://cs.intelbras-cve-pro.com.br',
    apiKey: process.env.CVE_API_KEY || '',
    username: process.env.CVE_USERNAME || '',
    password: process.env.CVE_PASSWORD || '',
    token: process.env.CVE_TOKEN || '',
  },
  
  evolution: {
    baseUrl: process.env.EVOLUTION_API_URL || '',
    apiKey: process.env.EVOLUTION_API_KEY || '',
    instanceName: process.env.EVOLUTION_INSTANCE || '',
  },
};

// Validar configurações obrigatórias
export function validateConfig() {
  const errors: string[] = [];

  if (!config.cve.apiKey) {
    errors.push('CVE_API_KEY não configurado');
  }

  if (!config.cve.username || !config.cve.password) {
    if (!config.cve.token) {
      errors.push('Credenciais CVE não configuradas (username/password ou token)');
    }
  }

  if (!config.evolution.baseUrl || !config.evolution.apiKey) {
    console.warn('⚠️  Evolution API não configurada - notificações desabilitadas');
  }

  if (errors.length > 0) {
    console.error('\n❌ ERRO DE CONFIGURAÇÃO:\n');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n');
    throw new Error('Configuração inválida. Verifique o arquivo .env');
  }

  console.log('✅ Configuração validada com sucesso\n');
}

export default config;


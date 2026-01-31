/**
 * 🚀 VETRIC Dashboard - Servidor Principal
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { config, validateConfig } from './config/env';
import { initDatabase } from './config/database';
import { cveService } from './services/CVEService';
import { webSocketService } from './services/WebSocketService';
import { pollingService } from './services/PollingService';
import { createDefaultUsers } from './seeds/createDefaultUsers';

// Importar rotas
import authRoutes from './routes/auth';
import moradoresRoutes from './routes/moradores';
import carregamentosRoutes from './routes/carregamentos';
import templatesRoutes from './routes/templates';
import dashboardRoutes from './routes/dashboard';
import relatoriosRoutes from './routes/relatorios'; // Sistema antigo (upload de PDFs)
import testEvolutionRoutes from './routes/testEvolution';
import configRoutes from './routes/config';
import systemRoutes from './routes/system';

// 🆕 Sistema de Relatórios V2 (VETRIC Reports)
// ⚠️ TEMPORARIAMENTE DESATIVADO - Focar em notificações primeiro
// import vetricReportsRoutes from './relatorios/routes';

dotenv.config();

const app: Application = express();

// ┌─────────────────────────────────────────────────────────┐
// │ SEGURANÇA - Middlewares de Proteção                     │
// └─────────────────────────────────────────────────────────┘

// Helmet: Headers HTTP seguros
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP (apenas para API)
  crossOriginEmbedderPolicy: false,
}));

// CORS: Controle de origem
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        process.env.ADMIN_URL || '',
        process.env.CLIENT_URL || '',
        process.env.FRONTEND_URL || 'http://localhost:3000'
      ].filter(Boolean)
    : '*', // Desenvolvimento: permitir qualquer origem
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting: Prevenir ataques DDoS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  max: process.env.NODE_ENV === 'production' 
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    : 1000, // Desenvolvimento: 1000 requisições, Produção: 100
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
  },
  standardHeaders: true, // Retornar info no header `RateLimit-*`
  legacyHeaders: false, // Desabilitar headers `X-RateLimit-*`
  skip: (req) => {
    // Skip rate limiting para health check
    return req.path === '/health';
  },
});

// Aplicar rate limiting apenas em rotas de API
app.use('/api/', limiter);

// Rate limiting mais restrito para login (prevenir brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // Desenvolvimento: 100 tentativas, Produção: 5
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
});

// ┌─────────────────────────────────────────────────────────┐
// │ PARSERS E MIDDLEWARES GERAIS                            │
// └─────────────────────────────────────────────────────────┘

app.use(express.json({ limit: '10mb' })); // Limite de payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger simples
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ┌─────────────────────────────────────────────────────────┐
// │ ROTAS DA API                                             │
// └─────────────────────────────────────────────────────────┘

// Aplicar rate limiting específico para login
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/moradores', moradoresRoutes);
app.use('/api/carregamentos', carregamentosRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relatorios', relatoriosRoutes); // Sistema antigo (upload de PDFs)
app.use('/api/test-evolution', testEvolutionRoutes);
app.use('/api/config', configRoutes);
app.use('/api/system', systemRoutes);

// 🆕 Sistema de Relatórios V2 (VETRIC Reports)
// ⚠️ TEMPORARIAMENTE DESATIVADO - Focar em notificações primeiro
// app.use('/api/vetric-reports', vetricReportsRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    websocket: webSocketService.isConnected(),
    polling: pollingService.getStats(),
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'VETRIC Dashboard API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET  /health',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'POST /api/auth/logout',
      'GET  /api/dashboard/stats',
      'GET  /api/dashboard/chargers',
      'GET  /api/moradores',
      'POST /api/moradores',
      'GET  /api/carregamentos',
      'GET  /api/carregamentos/ativos',
      'GET  /api/templates',
      'PUT  /api/templates/:tipo',
    ],
  });
});

// Handler de erros
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: err.message,
  });
});

// Função principal de inicialização
async function startServer() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║             🚀 VETRIC DASHBOARD - INICIANDO               ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Validar configurações
    console.log('⚙️  Validando configurações...');
    validateConfig();

    // 2. Inicializar banco de dados
    await initDatabase();

    // 2.1. Criar usuários padrão (seed)
    await createDefaultUsers();

    // 3. Fazer login na API CVE-PRO (não crítico)
    console.log('🔑 Autenticando na API CVE-PRO...');
    let token = config.cve.token;
    
    try {
      if (!token) {
        token = await cveService.login();
      } else {
        console.log('✅ Token encontrado no .env');
      }

      // 4. Testar conexão com API
      console.log('🔌 Testando conexão com CVE-PRO...');
      const chargers = await cveService.getChargers();
      console.log(`✅ ${chargers.length} carregador(es) encontrado(s)\n`);

      // 5. Tentar conectar ao WebSocket para monitoramento em tempo real
      console.log('🔄 Tentando conectar ao WebSocket...');
      try {
        await webSocketService.connect(token);
      } catch (wsError: any) {
        console.warn('⚠️  WebSocket não disponível:', wsError.message);
        console.log('🔄 Usando modo Polling (API REST) como alternativa...');
      }

      // 6. Iniciar Polling Service (funciona com ou sem WebSocket)
      console.log('🔄 Iniciando serviço de polling...');
      pollingService.start();
      console.log('✅ Polling ativo - identificação automática de moradores habilitada!');
      
    } catch (error: any) {
      console.warn('⚠️  Falha na conexão com CVE-PRO:', error.message);
      console.warn('⚠️  Servidor continuará sem integração CVE-PRO');
    }

    // 7. Iniciar servidor HTTP
    app.listen(config.port, () => {
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║           ✅ VETRIC DASHBOARD ONLINE!                     ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      console.log(`🌐 Servidor rodando em: http://localhost:${config.port}`);
      console.log(`📊 Dashboard API: http://localhost:${config.port}/api/dashboard/stats`);
      console.log(`💚 Health Check: http://localhost:${config.port}/health`);
      console.log(`🔄 WebSocket: ${webSocketService.isConnected() ? 'CONECTADO' : 'DESCONECTADO'}`);
      console.log(`🔄 Polling: ${pollingService.isActive() ? 'ATIVO ✅' : 'INATIVO'}`);
      console.log('\n' + '═'.repeat(63) + '\n');
      console.log('📋 Sistema pronto para uso!\n');
    });

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL ao iniciar servidor:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Tratamento de sinais para shutdown graceful
process.on('SIGINT', () => {
  console.log('\n\n👋 Recebido SIGINT, encerrando graciosamente...');
  pollingService.stop();
  webSocketService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Recebido SIGTERM, encerrando graciosamente...');
  pollingService.stop();
  webSocketService.disconnect();
  process.exit(0);
});

// Iniciar!
startServer();


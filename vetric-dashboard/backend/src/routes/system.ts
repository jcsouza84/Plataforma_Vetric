/**
 * ⚙️ VETRIC - Rotas: Sistema
 */

import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Todas as rotas exigem autenticação ADMIN
router.use(authenticate);
router.use(adminOnly);

// POST /api/system/restart - Reiniciar o backend
router.post('/restart', async (req: Request, res: Response) => {
  try {
    console.log(`\n🔄 REINICIANDO BACKEND...`);
    console.log(`👤 Solicitado por: ${req.user?.email} (${req.user?.nome})`);
    console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n`);

    // Enviar resposta antes de reiniciar
    res.json({
      success: true,
      message: 'Backend será reiniciado em 2 segundos...',
      restartTime: new Date().toISOString(),
    });

    // Aguardar 2 segundos para enviar a resposta
    setTimeout(() => {
      console.log('\n👋 Reiniciando backend...');
      console.log('✨ Enviando sinal SIGUSR2 para ts-node-dev\n');
      
      // Enviar sinal de restart para o ts-node-dev
      // SIGUSR2 é o sinal padrão que o ts-node-dev usa para restart
      process.kill(process.pid, 'SIGUSR2');
    }, 2000);

  } catch (error: any) {
    console.error('❌ Erro ao reiniciar backend:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/system/status - Status do backend
router.get('/status', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        node_version: process.version,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


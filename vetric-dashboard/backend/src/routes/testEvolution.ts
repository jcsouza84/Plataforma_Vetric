/**
 * 🧪 VETRIC - Rotas: Teste Evolution API
 */

import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { notificationService } from '../services/NotificationService';

const router = Router();

// Todas as rotas exigem autenticação ADMIN
router.use(authenticate);
router.use(adminOnly);

// POST /api/test-evolution - Enviar mensagem de teste
router.post('/', async (req: Request, res: Response) => {
  try {
    const { telefone, mensagem } = req.body;

    if (!telefone || !mensagem) {
      return res.status(400).json({
        success: false,
        error: 'Telefone e mensagem são obrigatórios',
      });
    }

    console.log(`\n🧪 TESTE EVOLUTION API`);
    console.log(`📱 Telefone: ${telefone}`);
    console.log(`💬 Mensagem: ${mensagem}\n`);

    // Enviar mensagem de teste (sem salvar log)
    const result = await notificationService.enviarMensagemTeste(telefone, mensagem);

    if (result.success) {
      res.json({
        success: true,
        data: {
          message: 'Mensagem enviada com sucesso!',
          telefone,
          response: result.data,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Erro ao enviar mensagem',
      });
    }
  } catch (error: any) {
    console.error('❌ Erro ao enviar teste:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


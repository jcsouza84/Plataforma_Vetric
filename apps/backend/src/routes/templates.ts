/**
 * 💬 VETRIC - Rotas: Templates de Notificação
 */

import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { TemplateNotificacaoModel } from '../models/TemplateNotificacao';
import { ApiResponse, UpdateTemplateDTO } from '../types';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/templates - Listar todos
router.get('/', async (req: Request, res: Response) => {
  try {
    const templates = await TemplateNotificacaoModel.findAll();
    
    const response: ApiResponse = {
      success: true,
      data: templates,
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/templates/:tipo - Buscar por tipo
router.get('/:tipo', async (req: Request, res: Response) => {
  try {
    const tipo = req.params.tipo;
    const template = await TemplateNotificacaoModel.findByTipo(tipo);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/templates/:tipo - Atualizar template
router.put('/:tipo', adminOnly, async (req: Request, res: Response) => {
  try {
    const tipo = req.params.tipo;
    const data: UpdateTemplateDTO = req.body;

    // Validações básicas - verificar se pelo menos um campo foi enviado
    const hasUpdates = 
      data.mensagem !== undefined || 
      data.ativo !== undefined ||
      data.tempo_minutos !== undefined ||
      data.power_threshold_w !== undefined;

    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar',
      });
    }

    const template = await TemplateNotificacaoModel.update(tipo, data);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    res.json({
      success: true,
      data: template,
      message: 'Template atualizado com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


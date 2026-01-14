/**
 * 🔋 VETRIC - Rotas: Carregamentos
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { CarregamentoModel } from '../models/Carregamento';
import { ApiResponse } from '../types';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/carregamentos - Listar todos (com limite)
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const carregamentos = await CarregamentoModel.findAll(limit);
    
    const response: ApiResponse = {
      success: true,
      data: carregamentos,
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/carregamentos/ativos - Listar carregamentos em andamento
router.get('/ativos', async (req: Request, res: Response) => {
  try {
    const carregamentos = await CarregamentoModel.findActive();
    
    res.json({
      success: true,
      data: carregamentos,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/carregamentos/morador/:moradorId - Listar por morador
router.get('/morador/:moradorId', async (req: Request, res: Response) => {
  try {
    const moradorId = parseInt(req.params.moradorId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    const carregamentos = await CarregamentoModel.findByMorador(moradorId, limit);
    
    res.json({
      success: true,
      data: carregamentos,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/carregamentos/stats/today - Estatísticas do dia
router.get('/stats/today', async (req: Request, res: Response) => {
  try {
    const stats = await CarregamentoModel.getStatsToday();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/carregamentos/stats/period - Estatísticas por período
router.get('/stats/period', async (req: Request, res: Response) => {
  try {
    const startDate = new Date(req.query.start as string || new Date());
    const endDate = new Date(req.query.end as string || new Date());
    
    const stats = await CarregamentoModel.getStatsByPeriod(startDate, endDate);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/carregamentos/:id - Buscar por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const carregamento = await CarregamentoModel.findById(id);
    
    if (!carregamento) {
      return res.status(404).json({
        success: false,
        error: 'Carregamento não encontrado',
      });
    }

    res.json({
      success: true,
      data: carregamento,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


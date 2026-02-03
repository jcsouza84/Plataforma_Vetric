/**
 * Rotas para Sistema de Logs Visuais
 * 
 * Endpoints para acessar logs do sistema em tempo real
 */

import { Router, Request, Response } from 'express';
import { logService, LogFiltros } from '../services/LogService';

const router = Router();

/**
 * GET /api/logs
 * Buscar logs com filtros
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtros: LogFiltros = {
      tipo: req.query.tipo ? (Array.isArray(req.query.tipo) ? req.query.tipo as any[] : [req.query.tipo as any]) : undefined,
      nivel: req.query.nivel ? (Array.isArray(req.query.nivel) ? req.query.nivel as any[] : [req.query.nivel as any]) : undefined,
      carregador_uuid: req.query.carregador_uuid as string,
      morador_id: req.query.morador_id ? parseInt(req.query.morador_id as string) : undefined,
      evento: req.query.evento as string,
      sucesso: req.query.sucesso !== undefined ? req.query.sucesso === 'true' : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const logs = await logService.buscar(filtros);

    res.json({
      success: true,
      data: logs,
      count: logs.length,
      filtros
    });
  } catch (error) {
    console.error('[API Logs] Erro ao buscar logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * GET /api/logs/recentes
 * Buscar logs recentes (últimos 100)
 */
router.get('/recentes', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const logs = await logService.recentes(limit);

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('[API Logs] Erro ao buscar logs recentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs recentes'
    });
  }
});

/**
 * GET /api/logs/tempo-real
 * Buscar logs em tempo real (últimos 5 minutos)
 */
router.get('/tempo-real', async (req: Request, res: Response) => {
  try {
    const minutos = req.query.minutos ? parseInt(req.query.minutos as string) : 5;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    const logs = await logService.tempoReal(minutos, limit);

    res.json({
      success: true,
      data: logs,
      count: logs.length,
      minutos
    });
  } catch (error) {
    console.error('[API Logs] Erro ao buscar logs em tempo real:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs em tempo real'
    });
  }
});

/**
 * GET /api/logs/stats
 * Estatísticas por carregador
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await logService.estatisticasPorCarregador();

    res.json({
      success: true,
      data: stats,
      count: stats.length
    });
  } catch (error) {
    console.error('[API Logs] Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
});

/**
 * GET /api/logs/carregador/:uuid
 * Logs de um carregador específico
 */
router.get('/carregador/:uuid', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const logs = await logService.buscar({
      carregador_uuid: uuid,
      limit
    });

    res.json({
      success: true,
      data: logs,
      count: logs.length,
      carregador_uuid: uuid
    });
  } catch (error) {
    console.error('[API Logs] Erro ao buscar logs do carregador:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs do carregador'
    });
  }
});

/**
 * GET /api/logs/morador/:id
 * Logs de um morador específico
 */
router.get('/morador/:id', async (req: Request, res: Response) => {
  try {
    const morador_id = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const logs = await logService.buscar({
      morador_id,
      limit
    });

    res.json({
      success: true,
      data: logs,
      count: logs.length,
      morador_id
    });
  } catch (error) {
    console.error('[API Logs] Erro ao buscar logs do morador:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs do morador'
    });
  }
});

/**
 * POST /api/logs/limpar
 * Limpar logs antigos (> 24 horas)
 */
router.post('/limpar', async (req: Request, res: Response) => {
  try {
    const linhasRemovidas = await logService.limparAntigos();

    res.json({
      success: true,
      message: `${linhasRemovidas} logs antigos removidos`,
      linhas_removidas: linhasRemovidas
    });
  } catch (error) {
    console.error('[API Logs] Erro ao limpar logs antigos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar logs antigos'
    });
  }
});

/**
 * GET /api/logs/stream
 * Stream de logs em tempo real (Server-Sent Events)
 */
router.get('/stream', async (req: Request, res: Response) => {
  // Configurar SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx

  res.write('data: {"status": "connected"}\n\n');

  // Enviar logs a cada 2 segundos
  const interval = setInterval(async () => {
    try {
      const logs = await logService.tempoReal(1, 10); // Último minuto, max 10
      
      if (logs.length > 0) {
        res.write(`data: ${JSON.stringify({ logs })}\n\n`);
      }
    } catch (error) {
      console.error('[API Logs] Erro no stream:', error);
    }
  }, 2000);

  // Cleanup quando conexão fecha
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;

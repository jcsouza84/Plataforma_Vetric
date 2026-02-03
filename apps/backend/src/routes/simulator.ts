/**
 * 🎮 VETRIC - Rotas do Simulador
 */

import { Router, Request, Response } from 'express';
import { simulatorService } from '../services/SimulatorService';

const router = Router();

/**
 * POST /api/simulator/start
 * Iniciar simulação sequencial
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    // Verificar se já está rodando
    if (simulatorService.isRunning()) {
      return res.status(400).json({
        success: false,
        error: 'Simulação já está em execução!'
      });
    }

    // Iniciar simulação (não bloqueia a resposta)
    simulatorService.startSequentialSimulation().catch(error => {
      console.error('❌ Erro na simulação:', error);
    });

    res.json({
      success: true,
      message: 'Simulação sequencial iniciada!',
      info: {
        carregadores: 5,
        tag_rfid: '87BA5C4E',
        duracao_estimada: '~25 minutos',
        fases: [
          '1. Início de carga',
          '2. Carregando (5 min)',
          '3. Ociosidade (1 min)',
          '4. Bateria cheia (3 min)',
          '5. Interrupção'
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/simulator/stop
 * Parar simulação
 */
router.post('/stop', (req: Request, res: Response) => {
  try {
    simulatorService.stopSimulation();

    res.json({
      success: true,
      message: 'Simulação parada com sucesso!'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/simulator/status
 * Obter status da simulação
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = simulatorService.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/simulator/chargers
 * Obter carregadores simulados (formato CVE)
 */
router.get('/chargers', (req: Request, res: Response) => {
  try {
    const chargers = simulatorService.getSimulatedChargers();

    res.json({
      success: true,
      data: chargers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/simulator/transactions
 * Obter transações simuladas (formato CVE)
 */
router.get('/transactions', (req: Request, res: Response) => {
  try {
    const transactions = simulatorService.getSimulatedTransactions();

    res.json({
      success: true,
      data: transactions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

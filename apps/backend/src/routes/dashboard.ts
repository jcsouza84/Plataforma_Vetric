/**
 * 📊 VETRIC - Rotas: Dashboard
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { cveService } from '../services/CVEService';
import { MoradorModel } from '../models/Morador';
import { CarregamentoModel } from '../models/Carregamento';
import { DashboardStats } from '../types';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/dashboard/stats - Estatísticas gerais
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Buscar dados em paralelo
    const [chargerStats, moradorStats, carregamentoStats] = await Promise.all([
      cveService.getChargerStats(),
      MoradorModel.getStats(),
      CarregamentoModel.getStatsToday(),
    ]);

    const stats: DashboardStats = {
      totalCarregadores: chargerStats.total,
      carregadoresDisponiveis: chargerStats.disponiveis,
      carregadoresOcupados: chargerStats.ocupados,
      carregadoresIndisponiveis: chargerStats.indisponiveis,
      totalMoradores: parseInt(moradorStats.total),
      moradoresAtivos: parseInt(moradorStats.com_notificacoes),
      carregamentosHoje: parseInt(carregamentoStats.total),
      energiaConsumidaHoje: parseFloat(carregamentoStats.energia_total),
    };

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

// GET /api/dashboard/chargers - Listar carregadores formatados COM moradores
router.get('/chargers', async (req: Request, res: Response) => {
  try {
    const chargers = await cveService.getChargersWithMoradores();
    
    // Formatar dados para o formato esperado pelo frontend
    const formattedChargers = chargers.map((charger: any) => {
      const connector = charger.connectors?.[0]; // Primeiro conector
      const lastStatus = connector?.lastStatus;
      const morador = charger.morador; // { nome, apartamento } ou null
      
      return {
        uuid: charger.uuid,
        chargeBoxId: charger.chargeBoxId,
        chargeBoxPk: charger.chargeBoxPk,
        nome: charger.description || charger.chargeBoxId,
        status: lastStatus?.status || 'Unavailable',
        statusConector: lastStatus?.status || 'Unavailable',
        usuarioAtual: morador ? `${morador.nome} (Apto ${morador.apartamento})` : null,
        morador: morador, // { nome, apartamento, inicio, duracao_minutos } ou null
        ultimoBatimento: charger.lastHeartbeatTimestamp,
        // Adicionar dados do carregamento ativo
        carregamentoAtivo: morador ? {
          inicio: morador.inicio,
          duracaoMinutos: Math.floor(morador.duracao_minutos),
        } : null,
        localizacao: {
          latitude: charger.locationLatitude,
          longitude: charger.locationLongitude,
          endereco: charger.address ? 
            `${charger.address.street}, ${charger.address.houseNumber} - ${charger.address.city}/${charger.address.state}` 
            : '',
        },
        potenciaMaxima: connector?.powerMax || null,
        tipoConector: connector?.connectorType || 'Type 2',
        velocidade: connector?.speed || 'SLOW',
        connectors: charger.connectors,
      };
    });
    
    res.json({
      success: true,
      data: formattedChargers,
    });
  } catch (error: any) {
    console.error('Erro ao buscar carregadores:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/dashboard/charger/:uuid - Detalhes de um carregador
router.get('/charger/:uuid', async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid;
    const charger = await cveService.getChargePointByUuid(uuid);
    
    if (!charger) {
      return res.status(404).json({
        success: false,
        error: 'Carregador não encontrado',
      });
    }

    const chargerInfo = cveService.formatChargerInfo(charger);
    
    res.json({
      success: true,
      data: chargerInfo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


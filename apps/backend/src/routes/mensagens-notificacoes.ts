/**
 * 📧 VETRIC - Rotas: Mensagens de Notificações
 */

import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

// Todas as rotas exigem autenticação ADMIN
router.use(authenticate);
router.use(adminOnly);

// GET /api/mensagens-notificacoes - Buscar todas as mensagens
router.get('/', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        id, 
        tipo, 
        titulo, 
        corpo, 
        tempo_minutos, 
        power_threshold_w, 
        ativo,
        criado_em,
        atualizado_em
      FROM mensagens_notificacoes 
      ORDER BY id
    `;
    const mensagens = await query(sql);

    res.json({
      success: true,
      data: mensagens,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/mensagens-notificacoes/:tipo - Buscar mensagem específica
router.get('/:tipo', async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;
    const sql = `
      SELECT 
        id, 
        tipo, 
        titulo, 
        corpo, 
        tempo_minutos, 
        power_threshold_w, 
        ativo,
        criado_em,
        atualizado_em
      FROM mensagens_notificacoes 
      WHERE tipo = $1
    `;
    const result = await query(sql, [tipo]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada',
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/mensagens-notificacoes/:tipo - Atualizar mensagem
router.put('/:tipo', async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;
    const { titulo, corpo, tempo_minutos, power_threshold_w, ativo } = req.body;

    // Validações
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Título é obrigatório',
      });
    }

    if (!corpo || corpo.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Corpo da mensagem é obrigatório',
      });
    }

    if (tempo_minutos !== undefined && (tempo_minutos < 0 || tempo_minutos > 1440)) {
      return res.status(400).json({
        success: false,
        error: 'Tempo deve estar entre 0 e 1440 minutos (24 horas)',
      });
    }

    if (power_threshold_w !== undefined && power_threshold_w !== null && power_threshold_w < 0) {
      return res.status(400).json({
        success: false,
        error: 'Power threshold não pode ser negativo',
      });
    }

    const sql = `
      UPDATE mensagens_notificacoes 
      SET 
        titulo = $1,
        corpo = $2,
        tempo_minutos = $3,
        power_threshold_w = $4,
        ativo = $5,
        atualizado_em = NOW()
      WHERE tipo = $6
      RETURNING *
    `;

    const result = await query(sql, [
      titulo,
      corpo,
      tempo_minutos || 0,
      power_threshold_w,
      ativo !== undefined ? ativo : false,
      tipo,
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada',
      });
    }

    console.log(`✅ Mensagem "${tipo}" atualizada (Ativo: ${ativo ? 'SIM' : 'NÃO'})`);

    res.json({
      success: true,
      message: 'Mensagem atualizada com sucesso',
      data: result[0],
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PATCH /api/mensagens-notificacoes/:tipo/toggle - Alternar status ativo/inativo
router.patch('/:tipo/toggle', async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    const sql = `
      UPDATE mensagens_notificacoes 
      SET 
        ativo = NOT ativo,
        atualizado_em = NOW()
      WHERE tipo = $1
      RETURNING *
    `;

    const result = await query(sql, [tipo]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada',
      });
    }

    console.log(`✅ Mensagem "${tipo}" ${result[0].ativo ? 'ATIVADA' : 'DESATIVADA'}`);

    res.json({
      success: true,
      message: `Mensagem ${result[0].ativo ? 'ativada' : 'desativada'} com sucesso`,
      data: result[0],
    });
  } catch (error: any) {
    console.error('❌ Erro ao alternar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


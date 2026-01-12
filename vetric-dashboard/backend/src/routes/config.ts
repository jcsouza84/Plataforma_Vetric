/**
 * ⚙️ VETRIC - Rotas: Configurações do Sistema
 */

import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

// Todas as rotas exigem autenticação ADMIN
router.use(authenticate);
router.use(adminOnly);

// GET /api/config - Buscar todas as configurações
router.get('/', async (req: Request, res: Response) => {
  try {
    const sql = 'SELECT id, chave, valor, descricao, atualizado_em FROM configuracoes_sistema ORDER BY chave';
    const configs = await query(sql);

    res.json({
      success: true,
      data: configs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/config/:chave - Buscar configuração específica
router.get('/:chave', async (req: Request, res: Response) => {
  try {
    const { chave } = req.params;
    const sql = 'SELECT id, chave, valor, descricao, atualizado_em FROM configuracoes_sistema WHERE chave = $1';
    const result = await query(sql, [chave]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada',
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/config/:chave - Atualizar configuração
router.put('/:chave', async (req: Request, res: Response) => {
  try {
    const { chave } = req.params;
    const { valor } = req.body;
    const userId = req.user?.userId;

    if (valor === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Campo "valor" é obrigatório',
      });
    }

    const sql = `
      UPDATE configuracoes_sistema 
      SET valor = $1, atualizado_em = NOW(), atualizado_por = $2
      WHERE chave = $3
      RETURNING id, chave, valor, descricao, atualizado_em
    `;
    
    const result = await query(sql, [valor, userId, chave]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada',
      });
    }

    console.log(`✅ Configuração "${chave}" atualizada por ${req.user?.email}`);

    res.json({
      success: true,
      data: result[0],
      message: 'Configuração atualizada com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/config/batch - Atualizar múltiplas configurações
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { configs } = req.body; // Array de { chave, valor }
    const userId = req.user?.userId;

    if (!Array.isArray(configs) || configs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Campo "configs" deve ser um array não vazio',
      });
    }

    const updatedConfigs = [];

    for (const config of configs) {
      const { chave, valor } = config;
      
      if (!chave || valor === undefined) {
        continue; // Pular configurações inválidas
      }

      const sql = `
        UPDATE configuracoes_sistema 
        SET valor = $1, atualizado_em = NOW(), atualizado_por = $2
        WHERE chave = $3
        RETURNING id, chave, valor, descricao, atualizado_em
      `;
      
      const result = await query(sql, [valor, userId, chave]);
      
      if (result.length > 0) {
        updatedConfigs.push(result[0]);
      }
    }

    console.log(`✅ ${updatedConfigs.length} configuração(ões) atualizada(s) por ${req.user?.email}`);

    res.json({
      success: true,
      data: updatedConfigs,
      message: `${updatedConfigs.length} configuração(ões) atualizada(s) com sucesso`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


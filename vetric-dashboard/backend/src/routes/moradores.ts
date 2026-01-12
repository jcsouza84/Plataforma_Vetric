/**
 * 👥 VETRIC - Rotas: Moradores
 */

import { Router, Request, Response } from 'express';
import { MoradorModel } from '../models/Morador';
import { ApiResponse, CreateMoradorDTO, UpdateMoradorDTO } from '../types';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/moradores - Listar todos
router.get('/', async (req: Request, res: Response) => {
  try {
    const moradores = await MoradorModel.findAll();
    const response: ApiResponse = {
      success: true,
      data: moradores,
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/moradores/:id - Buscar por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const morador = await MoradorModel.findById(id);
    
    if (!morador) {
      return res.status(404).json({
        success: false,
        error: 'Morador não encontrado',
      });
    }

    res.json({
      success: true,
      data: morador,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/moradores/tag/:tag - Buscar por Tag RFID
router.get('/tag/:tag', async (req: Request, res: Response) => {
  try {
    const tag = req.params.tag;
    const morador = await MoradorModel.findByTag(tag);
    
    if (!morador) {
      return res.status(404).json({
        success: false,
        error: 'Tag RFID não cadastrada',
      });
    }

    res.json({
      success: true,
      data: morador,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/moradores - Criar novo (ADMIN ONLY)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const data: CreateMoradorDTO = req.body;

    // Validações básicas
    if (!data.nome || !data.apartamento || !data.telefone || !data.tag_rfid) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nome, apartamento, telefone, tag_rfid',
      });
    }

    // Verificar se tag já existe
    const existingTag = await MoradorModel.findByTag(data.tag_rfid);
    if (existingTag) {
      return res.status(400).json({
        success: false,
        error: 'Tag RFID já cadastrada para outro morador',
      });
    }

    const morador = await MoradorModel.create(data);
    
    res.status(201).json({
      success: true,
      data: morador,
      message: 'Morador cadastrado com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/moradores/:id - Atualizar (ADMIN ONLY)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data: UpdateMoradorDTO = req.body;

    // Se está alterando a tag, verificar se não está em uso
    if (data.tag_rfid) {
      const existingTag = await MoradorModel.findByTag(data.tag_rfid);
      if (existingTag && existingTag.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Tag RFID já cadastrada para outro morador',
        });
      }
    }

    const morador = await MoradorModel.update(id, data);
    
    if (!morador) {
      return res.status(404).json({
        success: false,
        error: 'Morador não encontrado',
      });
    }

    res.json({
      success: true,
      data: morador,
      message: 'Morador atualizado com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/moradores/:id - Deletar (ADMIN ONLY)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar se morador existe
    const morador = await MoradorModel.findById(id);
    if (!morador) {
      return res.status(404).json({
        success: false,
        error: 'Morador não encontrado',
      });
    }

    await MoradorModel.delete(id);
    
    res.json({
      success: true,
      message: 'Morador removido com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/moradores/stats/summary - Estatísticas
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const stats = await MoradorModel.getStats();
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

export default router;


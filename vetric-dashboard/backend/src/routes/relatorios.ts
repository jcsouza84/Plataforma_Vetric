/**
 * 📄 VETRIC - Rotas: Relatórios PDF
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, adminOnly } from '../middleware/auth';
import { RelatorioModel } from '../models/Relatorio';

const router = Router();

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/relatorios/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `relatorio_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  }
});

// Todas as rotas exigem autenticação
router.use(authenticate);

// POST /api/relatorios/upload - Upload de PDF (ADMIN only)
router.post('/upload', adminOnly, upload.single('arquivo'), async (req: Request, res: Response) => {
  try {
    const { titulo, mes, ano, descricao } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Arquivo não enviado' });
    }

    if (!titulo || !mes || !ano) {
      // Remover arquivo se dados inválidos
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, error: 'Título, mês e ano são obrigatórios' });
    }

    // Verificar se já existe relatório para este mês/ano
    const existente = await RelatorioModel.findByMesAno(parseInt(mes), parseInt(ano));

    if (existente) {
      // Deletar arquivo antigo
      if (fs.existsSync(existente.arquivo_path)) {
        fs.unlinkSync(existente.arquivo_path);
      }
      await RelatorioModel.delete(existente.id);
      console.log(`📄 Relatório ${mes}/${ano} substituído`);
    }

    // Salvar novo relatório
    const relatorio = await RelatorioModel.create({
      titulo,
      arquivo_nome: file.originalname,
      arquivo_path: file.path,
      mes: parseInt(mes),
      ano: parseInt(ano),
      descricao,
      tamanho_kb: Math.round(file.size / 1024),
      uploaded_por: (req as any).user.id
    });

    console.log(`✅ Relatório ${titulo} enviado com sucesso`);

    res.json({
      success: true,
      message: 'Relatório enviado com sucesso',
      data: {
        id: relatorio.id,
        titulo: relatorio.titulo,
        mes: relatorio.mes,
        ano: relatorio.ano,
        tamanho_kb: relatorio.tamanho_kb
      }
    });
  } catch (error: any) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/relatorios - Listar todos (ADMIN + CLIENTE)
router.get('/', async (req: Request, res: Response) => {
  try {
    const relatorios = await RelatorioModel.findAll();

    const data = relatorios.map(r => ({
      id: r.id,
      titulo: r.titulo,
      mes: r.mes,
      ano: r.ano,
      tamanho_kb: r.tamanho_kb,
      criado_em: r.criado_em
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/relatorios/:id/download - Download de PDF (ADMIN + CLIENTE)
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const relatorio = await RelatorioModel.findById(parseInt(req.params.id));

    if (!relatorio) {
      return res.status(404).json({ success: false, error: 'Relatório não encontrado' });
    }

    if (!fs.existsSync(relatorio.arquivo_path)) {
      return res.status(404).json({ success: false, error: 'Arquivo não encontrado no servidor' });
    }

    res.download(relatorio.arquivo_path, relatorio.arquivo_nome);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/relatorios/:id - Deletar (ADMIN only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const relatorio = await RelatorioModel.findById(parseInt(req.params.id));

    if (!relatorio) {
      return res.status(404).json({ success: false, error: 'Relatório não encontrado' });
    }

    // Deletar arquivo físico
    if (fs.existsSync(relatorio.arquivo_path)) {
      fs.unlinkSync(relatorio.arquivo_path);
    }

    await RelatorioModel.delete(relatorio.id);

    console.log(`🗑️  Relatório ${relatorio.titulo} deletado`);

    res.json({ success: true, message: 'Relatório deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;


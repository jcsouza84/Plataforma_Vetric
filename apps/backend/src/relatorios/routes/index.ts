/**
 * 📊 VETRIC Reports - Rotas principais
 * Módulo integrado ao sistema Síndico
 */

import { Router } from 'express';
import { autenticarJWT } from '../../middleware/auth';
import { EmpreendimentoRelatorioController } from '../controllers/EmpreendimentoRelatorioController';
import { UsuarioRelatorioController } from '../controllers/UsuarioRelatorioController';
import { ConfiguracaoTarifariaController } from '../controllers/ConfiguracaoTarifariaController';
import { RelatorioController, uploadMiddleware } from '../controllers/RelatorioController';

const router = Router();

// 🔒 Todas as rotas exigem autenticação
router.use(autenticarJWT);

// =====================================
// 🏢 EMPREENDIMENTOS
// =====================================
router.get('/empreendimentos', EmpreendimentoRelatorioController.listar);
router.get('/empreendimentos/:id', EmpreendimentoRelatorioController.buscarPorId);
router.post('/empreendimentos', EmpreendimentoRelatorioController.criar);
router.put('/empreendimentos/:id', EmpreendimentoRelatorioController.atualizar);
router.delete('/empreendimentos/:id', EmpreendimentoRelatorioController.deletar);

// =====================================
// 👤 USUÁRIOS/MORADORES
// =====================================
router.get('/empreendimentos/:empreendimentoId/usuarios', UsuarioRelatorioController.listar);
router.get('/usuarios/:id', UsuarioRelatorioController.buscarPorId);
router.post('/empreendimentos/:empreendimentoId/usuarios', UsuarioRelatorioController.criar);
router.put('/usuarios/:id', UsuarioRelatorioController.atualizar);
router.delete('/usuarios/:id', UsuarioRelatorioController.deletar);

// =====================================
// ⚙️ CONFIGURAÇÃO TARIFÁRIA
// =====================================
router.get('/empreendimentos/:empreendimentoId/configuracao', ConfiguracaoTarifariaController.buscar);
router.put('/empreendimentos/:empreendimentoId/configuracao', ConfiguracaoTarifariaController.atualizar);

// =====================================
// 📊 RELATÓRIOS
// =====================================
// Preview XLSX (validação antes de gerar)
router.post('/preview-xlsx', uploadMiddleware.single('file'), RelatorioController.previewXLSX);

// Gerar relatório (COM CORREÇÃO DO BUG!)
router.post('/gerar-relatorio', uploadMiddleware.single('file'), RelatorioController.gerarRelatorio);

// Buscar relatório do BD (NÃO do localStorage!)
router.get('/relatorios/:id', RelatorioController.buscarRelatorio);

// Listar relatórios de um empreendimento
router.get('/empreendimentos/:empreendimentoId/relatorios', RelatorioController.listarRelatorios);

// Deletar relatório
router.delete('/relatorios/:id', RelatorioController.deletarRelatorio);

export default router;


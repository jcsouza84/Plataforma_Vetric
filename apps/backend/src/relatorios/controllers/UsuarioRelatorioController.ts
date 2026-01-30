/**
 * 👤 VETRIC Reports - Controller: Usuários/Moradores
 */

import { Request, Response } from 'express';
import { UsuarioRelatorioModel } from '../models/UsuarioRelatorio';

export class UsuarioRelatorioController {
  static async listar(req: Request, res: Response) {
    try {
      const { empreendimentoId } = req.params;

      const usuarios = await UsuarioRelatorioModel.findByEmpreendimento(empreendimentoId);

      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  static async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await UsuarioRelatorioModel.findById(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  static async criar(req: Request, res: Response) {
    try {
      const { empreendimentoId } = req.params;
      const { nome, unidade, torre, telefone, tags } = req.body;

      if (!nome || !unidade || !torre || !tags || !Array.isArray(tags)) {
        return res.status(400).json({
          error: 'Nome, unidade, torre e tags (array) são obrigatórios',
        });
      }

      const usuario = await UsuarioRelatorioModel.create({
        empreendimento_id: empreendimentoId,
        nome,
        unidade,
        torre,
        telefone,
        tags,
      });

      res.status(201).json(usuario);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  static async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, unidade, torre, telefone, tags } = req.body;

      const usuario = await UsuarioRelatorioModel.update(id, {
        nome,
        unidade,
        torre,
        telefone,
        tags,
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  static async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await UsuarioRelatorioModel.delete(id);

      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}


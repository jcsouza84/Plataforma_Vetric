/**
 * 🏢 VETRIC Reports - Controller: Empreendimentos
 */

import { Request, Response } from 'express';
import { EmpreendimentoRelatorioModel } from '../models/EmpreendimentoRelatorio';
import { ConfiguracaoTarifariaModel } from '../models/ConfiguracaoTarifaria';

export class EmpreendimentoRelatorioController {
  static async listar(req: Request, res: Response) {
    try {
      const empreendimentos = await EmpreendimentoRelatorioModel.findAll();
      res.json(empreendimentos);
    } catch (error) {
      console.error('Erro ao listar empreendimentos:', error);
      res.status(500).json({ error: 'Erro ao listar empreendimentos' });
    }
  }

  static async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empreendimento = await EmpreendimentoRelatorioModel.getWithCounts(id);

      if (!empreendimento) {
        return res.status(404).json({ error: 'Empreendimento não encontrado' });
      }

      // Buscar configuração tarifária
      const config = await ConfiguracaoTarifariaModel.findByEmpreendimento(id);

      res.json({
        ...empreendimento,
        configuracaoTarifaria: config,
      });
    } catch (error) {
      console.error('Erro ao buscar empreendimento:', error);
      res.status(500).json({ error: 'Erro ao buscar empreendimento' });
    }
  }

  static async criar(req: Request, res: Response) {
    try {
      const { nome, logo_url, sistema_carregamento } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const empreendimento = await EmpreendimentoRelatorioModel.create({
        nome,
        logo_url,
        sistema_carregamento,
      });

      // Criar configuração padrão
      await ConfiguracaoTarifariaModel.create({
        empreendimento_id: empreendimento.id,
      });

      res.status(201).json(empreendimento);
    } catch (error) {
      console.error('Erro ao criar empreendimento:', error);
      res.status(500).json({ error: 'Erro ao criar empreendimento' });
    }
  }

  static async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, logo_url, sistema_carregamento } = req.body;

      const empreendimento = await EmpreendimentoRelatorioModel.update(id, {
        nome,
        logo_url,
        sistema_carregamento,
      });

      if (!empreendimento) {
        return res.status(404).json({ error: 'Empreendimento não encontrado' });
      }

      res.json(empreendimento);
    } catch (error) {
      console.error('Erro ao atualizar empreendimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar empreendimento' });
    }
  }

  static async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await EmpreendimentoRelatorioModel.delete(id);

      res.json({ message: 'Empreendimento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar empreendimento:', error);
      res.status(500).json({ error: 'Erro ao deletar empreendimento' });
    }
  }
}


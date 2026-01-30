/**
 * ⚙️ VETRIC Reports - Controller: Configuração Tarifária
 */

import { Request, Response } from 'express';
import { ConfiguracaoTarifariaModel } from '../models/ConfiguracaoTarifaria';

export class ConfiguracaoTarifariaController {
  static async buscar(req: Request, res: Response) {
    try {
      const { empreendimentoId } = req.params;

      const config = await ConfiguracaoTarifariaModel.findByEmpreendimento(empreendimentoId);

      if (!config) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }

      res.json(config);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      res.status(500).json({ error: 'Erro ao buscar configuração' });
    }
  }

  static async atualizar(req: Request, res: Response) {
    try {
      const { empreendimentoId } = req.params;
      const {
        tarifa_ponta,
        tarifa_fora_ponta,
        ponta_inicio_hora,
        ponta_inicio_minuto,
        ponta_fim_hora,
        ponta_fim_minuto,
        ponta_segunda,
        ponta_terca,
        ponta_quarta,
        ponta_quinta,
        ponta_sexta,
        ponta_sabado,
        ponta_domingo,
        limite_energia_max_kwh,
        limite_ociosidade_min,
      } = req.body;

      const config = await ConfiguracaoTarifariaModel.update(empreendimentoId, {
        tarifa_ponta,
        tarifa_fora_ponta,
        ponta_inicio_hora,
        ponta_inicio_minuto,
        ponta_fim_hora,
        ponta_fim_minuto,
        ponta_segunda,
        ponta_terca,
        ponta_quarta,
        ponta_quinta,
        ponta_sexta,
        ponta_sabado,
        ponta_domingo,
        limite_energia_max_kwh,
        limite_ociosidade_min,
      });

      if (!config) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }

      res.json(config);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      res.status(500).json({ error: 'Erro ao atualizar configuração' });
    }
  }
}


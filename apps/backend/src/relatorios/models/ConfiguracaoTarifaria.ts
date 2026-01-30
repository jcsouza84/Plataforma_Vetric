/**
 * ⚙️ VETRIC Reports - Model: Configuração Tarifária
 */

import { query } from '../../config/database';

export interface ConfiguracaoTarifaria {
  id: string;
  empreendimento_id: string;
  tarifa_ponta: number;
  tarifa_fora_ponta: number;
  ponta_inicio_hora: number;
  ponta_inicio_minuto: number;
  ponta_fim_hora: number;
  ponta_fim_minuto: number;
  ponta_segunda: boolean;
  ponta_terca: boolean;
  ponta_quarta: boolean;
  ponta_quinta: boolean;
  ponta_sexta: boolean;
  ponta_sabado: boolean;
  ponta_domingo: boolean;
  limite_energia_max_kwh: number;
  limite_ociosidade_min: number;
  criado_em: Date;
  atualizado_em: Date;
}

export interface CreateConfiguracaoTarifariaDTO {
  empreendimento_id: string;
  tarifa_ponta?: number;
  tarifa_fora_ponta?: number;
  ponta_inicio_hora?: number;
  ponta_inicio_minuto?: number;
  ponta_fim_hora?: number;
  ponta_fim_minuto?: number;
  ponta_segunda?: boolean;
  ponta_terca?: boolean;
  ponta_quarta?: boolean;
  ponta_quinta?: boolean;
  ponta_sexta?: boolean;
  ponta_sabado?: boolean;
  ponta_domingo?: boolean;
  limite_energia_max_kwh?: number;
  limite_ociosidade_min?: number;
}

export interface UpdateConfiguracaoTarifariaDTO {
  tarifa_ponta?: number;
  tarifa_fora_ponta?: number;
  ponta_inicio_hora?: number;
  ponta_inicio_minuto?: number;
  ponta_fim_hora?: number;
  ponta_fim_minuto?: number;
  ponta_segunda?: boolean;
  ponta_terca?: boolean;
  ponta_quarta?: boolean;
  ponta_quinta?: boolean;
  ponta_sexta?: boolean;
  ponta_sabado?: boolean;
  ponta_domingo?: boolean;
  limite_energia_max_kwh?: number;
  limite_ociosidade_min?: number;
}

export class ConfiguracaoTarifariaModel {
  static async findByEmpreendimento(empreendimentoId: string): Promise<ConfiguracaoTarifaria | null> {
    const sql = 'SELECT * FROM configuracoes_tarifarias WHERE empreendimento_id = $1';
    const result = await query<ConfiguracaoTarifaria>(sql, [empreendimentoId]);
    return result[0] || null;
  }

  static async create(data: CreateConfiguracaoTarifariaDTO): Promise<ConfiguracaoTarifaria> {
    const sql = `
      INSERT INTO configuracoes_tarifarias (
        empreendimento_id, tarifa_ponta, tarifa_fora_ponta,
        ponta_inicio_hora, ponta_inicio_minuto, ponta_fim_hora, ponta_fim_minuto,
        ponta_segunda, ponta_terca, ponta_quarta, ponta_quinta, ponta_sexta, ponta_sabado, ponta_domingo,
        limite_energia_max_kwh, limite_ociosidade_min
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const result = await query<ConfiguracaoTarifaria>(sql, [
      data.empreendimento_id,
      data.tarifa_ponta ?? 3.08,
      data.tarifa_fora_ponta ?? 0.53,
      data.ponta_inicio_hora ?? 17,
      data.ponta_inicio_minuto ?? 30,
      data.ponta_fim_hora ?? 20,
      data.ponta_fim_minuto ?? 29,
      data.ponta_segunda ?? true,
      data.ponta_terca ?? true,
      data.ponta_quarta ?? true,
      data.ponta_quinta ?? true,
      data.ponta_sexta ?? true,
      data.ponta_sabado ?? false,
      data.ponta_domingo ?? false,
      data.limite_energia_max_kwh ?? 50.0,
      data.limite_ociosidade_min ?? 15,
    ]);
    return result[0];
  }

  static async update(empreendimentoId: string, data: UpdateConfiguracaoTarifariaDTO): Promise<ConfiguracaoTarifaria | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap = {
      tarifa_ponta: data.tarifa_ponta,
      tarifa_fora_ponta: data.tarifa_fora_ponta,
      ponta_inicio_hora: data.ponta_inicio_hora,
      ponta_inicio_minuto: data.ponta_inicio_minuto,
      ponta_fim_hora: data.ponta_fim_hora,
      ponta_fim_minuto: data.ponta_fim_minuto,
      ponta_segunda: data.ponta_segunda,
      ponta_terca: data.ponta_terca,
      ponta_quarta: data.ponta_quarta,
      ponta_quinta: data.ponta_quinta,
      ponta_sexta: data.ponta_sexta,
      ponta_sabado: data.ponta_sabado,
      ponta_domingo: data.ponta_domingo,
      limite_energia_max_kwh: data.limite_energia_max_kwh,
      limite_ociosidade_min: data.limite_ociosidade_min,
    };

    Object.entries(fieldMap).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findByEmpreendimento(empreendimentoId);
    }

    fields.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(empreendimentoId);

    const sql = `
      UPDATE configuracoes_tarifarias 
      SET ${fields.join(', ')}
      WHERE empreendimento_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query<ConfiguracaoTarifaria>(sql, values);
    return result[0] || null;
  }

  static async delete(empreendimentoId: string): Promise<boolean> {
    const sql = 'DELETE FROM configuracoes_tarifarias WHERE empreendimento_id = $1';
    await query(sql, [empreendimentoId]);
    return true;
  }
}


/**
 * 🏢 VETRIC Reports - Model: Empreendimento
 */

import { query } from '../../config/database';

export interface EmpreendimentoRelatorio {
  id: string;
  nome: string;
  logo_url: string | null;
  sistema_carregamento: string;
  criado_em: Date;
  atualizado_em: Date;
}

export interface CreateEmpreendimentoDTO {
  nome: string;
  logo_url?: string;
  sistema_carregamento?: string;
}

export interface UpdateEmpreendimentoDTO {
  nome?: string;
  logo_url?: string;
  sistema_carregamento?: string;
}

export class EmpreendimentoRelatorioModel {
  static async findAll(): Promise<EmpreendimentoRelatorio[]> {
    const sql = `
      SELECT * FROM empreendimentos_relatorio 
      ORDER BY nome ASC
    `;
    return await query<EmpreendimentoRelatorio>(sql);
  }

  static async findById(id: string): Promise<EmpreendimentoRelatorio | null> {
    const sql = 'SELECT * FROM empreendimentos_relatorio WHERE id = $1';
    const result = await query<EmpreendimentoRelatorio>(sql, [id]);
    return result[0] || null;
  }

  static async create(data: CreateEmpreendimentoDTO): Promise<EmpreendimentoRelatorio> {
    const sql = `
      INSERT INTO empreendimentos_relatorio (nome, logo_url, sistema_carregamento)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query<EmpreendimentoRelatorio>(sql, [
      data.nome,
      data.logo_url || null,
      data.sistema_carregamento || 'CVE_PRO',
    ]);
    return result[0];
  }

  static async update(id: string, data: UpdateEmpreendimentoDTO): Promise<EmpreendimentoRelatorio | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`);
      values.push(data.nome);
    }
    if (data.logo_url !== undefined) {
      fields.push(`logo_url = $${paramIndex++}`);
      values.push(data.logo_url);
    }
    if (data.sistema_carregamento !== undefined) {
      fields.push(`sistema_carregamento = $${paramIndex++}`);
      values.push(data.sistema_carregamento);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE empreendimentos_relatorio 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query<EmpreendimentoRelatorio>(sql, values);
    return result[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM empreendimentos_relatorio WHERE id = $1';
    await query(sql, [id]);
    return true;
  }

  static async getWithCounts(id: string) {
    const sql = `
      SELECT 
        e.*,
        COUNT(DISTINCT u.id) as total_usuarios,
        COUNT(DISTINCT r.id) as total_relatorios
      FROM empreendimentos_relatorio e
      LEFT JOIN usuarios_relatorio u ON u.empreendimento_id = e.id
      LEFT JOIN relatorios_gerados r ON r.empreendimento_id = e.id
      WHERE e.id = $1
      GROUP BY e.id
    `;
    const result = await query(sql, [id]);
    return result[0] || null;
  }
}


/**
 * 👤 VETRIC Reports - Model: Usuário/Morador
 */

import { query } from '../../config/database';

export interface UsuarioRelatorio {
  id: string;
  empreendimento_id: string;
  nome: string;
  unidade: string;
  torre: string;
  telefone: string | null;
  tags: string[]; // Array de TAGs
  criado_em: Date;
  atualizado_em: Date;
}

export interface CreateUsuarioRelatorioDTO {
  empreendimento_id: string;
  nome: string;
  unidade: string;
  torre: string;
  telefone?: string;
  tags: string[];
}

export interface UpdateUsuarioRelatorioDTO {
  nome?: string;
  unidade?: string;
  torre?: string;
  telefone?: string;
  tags?: string[];
}

export class UsuarioRelatorioModel {
  static async findAll(): Promise<UsuarioRelatorio[]> {
    const sql = `
      SELECT * FROM usuarios_relatorio 
      ORDER BY nome ASC
    `;
    const result = await query(sql);
    return result.map(this.parseJsonFields);
  }

  static async findByEmpreendimento(empreendimentoId: string): Promise<UsuarioRelatorio[]> {
    const sql = `
      SELECT * FROM usuarios_relatorio 
      WHERE empreendimento_id = $1
      ORDER BY nome ASC
    `;
    const result = await query(sql, [empreendimentoId]);
    return result.map(this.parseJsonFields);
  }

  static async findById(id: string): Promise<UsuarioRelatorio | null> {
    const sql = 'SELECT * FROM usuarios_relatorio WHERE id = $1';
    const result = await query(sql, [id]);
    return result[0] ? this.parseJsonFields(result[0]) : null;
  }

  static async findByTag(tag: string, empreendimentoId: string): Promise<UsuarioRelatorio | null> {
    const sql = `
      SELECT * FROM usuarios_relatorio 
      WHERE empreendimento_id = $1 
      AND tags @> $2::jsonb
    `;
    const result = await query(sql, [empreendimentoId, JSON.stringify([tag])]);
    return result[0] ? this.parseJsonFields(result[0]) : null;
  }

  static async create(data: CreateUsuarioRelatorioDTO): Promise<UsuarioRelatorio> {
    const sql = `
      INSERT INTO usuarios_relatorio (empreendimento_id, nome, unidade, torre, telefone, tags)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      RETURNING *
    `;
    const result = await query(sql, [
      data.empreendimento_id,
      data.nome,
      data.unidade,
      data.torre,
      data.telefone || null,
      JSON.stringify(data.tags),
    ]);
    return this.parseJsonFields(result[0]);
  }

  static async update(id: string, data: UpdateUsuarioRelatorioDTO): Promise<UsuarioRelatorio | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`);
      values.push(data.nome);
    }
    if (data.unidade !== undefined) {
      fields.push(`unidade = $${paramIndex++}`);
      values.push(data.unidade);
    }
    if (data.torre !== undefined) {
      fields.push(`torre = $${paramIndex++}`);
      values.push(data.torre);
    }
    if (data.telefone !== undefined) {
      fields.push(`telefone = $${paramIndex++}`);
      values.push(data.telefone);
    }
    if (data.tags !== undefined) {
      fields.push(`tags = $${paramIndex++}::jsonb`);
      values.push(JSON.stringify(data.tags));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE usuarios_relatorio 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result[0] ? this.parseJsonFields(result[0]) : null;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM usuarios_relatorio WHERE id = $1';
    await query(sql, [id]);
    return true;
  }

  // Helper para parsear campo JSONB
  private static parseJsonFields(row: any): UsuarioRelatorio {
    return {
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    };
  }
}


/**
 * 👤 VETRIC - Model: Morador
 */

import { query } from '../config/database';
import { Morador, CreateMoradorDTO, UpdateMoradorDTO } from '../types';

export class MoradorModel {
  // Buscar todos
  static async findAll(): Promise<Morador[]> {
    const sql = `
      SELECT * FROM moradores 
      ORDER BY nome ASC
    `;
    return await query<Morador>(sql);
  }

  // Buscar por ID
  static async findById(id: number): Promise<Morador | null> {
    const sql = 'SELECT * FROM moradores WHERE id = $1';
    const result = await query<Morador>(sql, [id]);
    return result[0] || null;
  }

  // Buscar por Tag RFID (case-insensitive para suportar diferentes equipamentos)
  static async findByTag(tag: string): Promise<Morador | null> {
    const sql = 'SELECT * FROM moradores WHERE UPPER(tag_rfid) = UPPER($1)';
    const result = await query<Morador>(sql, [tag]);
    return result[0] || null;
  }

  // Criar novo
  static async create(data: CreateMoradorDTO): Promise<Morador> {
    const sql = `
      INSERT INTO moradores (nome, apartamento, telefone, tag_rfid, notificacoes_ativas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query<Morador>(sql, [
      data.nome,
      data.apartamento,
      data.telefone,
      data.tag_rfid,
      data.notificacoes_ativas ?? true,
    ]);
    return result[0];
  }

  // Atualizar
  static async update(id: number, data: UpdateMoradorDTO): Promise<Morador | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`);
      values.push(data.nome);
    }
    if (data.apartamento !== undefined) {
      fields.push(`apartamento = $${paramIndex++}`);
      values.push(data.apartamento);
    }
    if (data.telefone !== undefined) {
      fields.push(`telefone = $${paramIndex++}`);
      values.push(data.telefone);
    }
    if (data.tag_rfid !== undefined) {
      fields.push(`tag_rfid = $${paramIndex++}`);
      values.push(data.tag_rfid);
    }
    if (data.notificacoes_ativas !== undefined) {
      fields.push(`notificacoes_ativas = $${paramIndex++}`);
      values.push(data.notificacoes_ativas);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE moradores 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query<Morador>(sql, values);
    return result[0] || null;
  }

  // Deletar
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM moradores WHERE id = $1';
    await query(sql, [id]);
    return true;
  }

  // Buscar com notificações ativas
  static async findWithNotificationsEnabled(): Promise<Morador[]> {
    const sql = `
      SELECT * FROM moradores 
      WHERE notificacoes_ativas = true
      ORDER BY nome ASC
    `;
    return await query<Morador>(sql);
  }

  // Estatísticas
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE notificacoes_ativas = true) as com_notificacoes
      FROM moradores
    `;
    const result = await query(sql);
    return result[0];
  }
}


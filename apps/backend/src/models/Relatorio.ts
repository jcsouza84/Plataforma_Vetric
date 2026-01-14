/**
 * 📄 VETRIC - Model: Relatório
 */

import { query } from '../config/database';

export interface Relatorio {
  id: number;
  titulo: string;
  arquivo_nome: string;
  arquivo_path: string;
  mes: number;
  ano: number;
  descricao?: string;
  tamanho_kb: number;
  uploaded_por: number;
  criado_em: Date;
}

export interface CreateRelatorioDTO {
  titulo: string;
  arquivo_nome: string;
  arquivo_path: string;
  mes: number;
  ano: number;
  descricao?: string;
  tamanho_kb: number;
  uploaded_por: number;
}

export class RelatorioModel {
  // Buscar todos
  static async findAll(): Promise<Relatorio[]> {
    const sql = `
      SELECT * FROM relatorios 
      ORDER BY ano DESC, mes DESC
    `;
    return await query<Relatorio>(sql);
  }

  // Buscar por ID
  static async findById(id: number): Promise<Relatorio | null> {
    const sql = 'SELECT * FROM relatorios WHERE id = $1';
    const result = await query<Relatorio>(sql, [id]);
    return result[0] || null;
  }

  // Buscar por mês/ano
  static async findByMesAno(mes: number, ano: number): Promise<Relatorio | null> {
    const sql = 'SELECT * FROM relatorios WHERE mes = $1 AND ano = $2';
    const result = await query<Relatorio>(sql, [mes, ano]);
    return result[0] || null;
  }

  // Criar
  static async create(data: CreateRelatorioDTO): Promise<Relatorio> {
    const sql = `
      INSERT INTO relatorios (
        titulo, arquivo_nome, arquivo_path, mes, ano,
        descricao, tamanho_kb, uploaded_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await query<Relatorio>(sql, [
      data.titulo,
      data.arquivo_nome,
      data.arquivo_path,
      data.mes,
      data.ano,
      data.descricao || null,
      data.tamanho_kb,
      data.uploaded_por
    ]);
    return result[0];
  }

  // Deletar
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM relatorios WHERE id = $1';
    await query(sql, [id]);
    return true;
  }
}


/**
 * 📊 VETRIC Reports - Model: Relatório Gerado
 * 🆕 COM CORREÇÃO DO BUG: dados salvos no BD, não no localStorage!
 */

import { query } from '../../config/database';

export interface RelatorioGerado {
  id: string;
  empreendimento_id: string;
  mes_ano: string;
  pdf_url: string;
  total_recargas: number;
  total_consumo: number;
  total_valor: number;
  dados_completos: any; // JSON com TODOS os dados
  criado_em: Date;
}

export interface CreateRelatorioGeradoDTO {
  empreendimento_id: string;
  mes_ano: string;
  total_recargas: number;
  total_consumo: number;
  total_valor: number;
  dados_completos: any; // Objeto JS que será convertido para JSON
}

export class RelatorioGeradoModel {
  static async findAll(): Promise<RelatorioGerado[]> {
    const sql = `
      SELECT 
        id, 
        empreendimento_id, 
        mes_ano, 
        pdf_url, 
        total_recargas, 
        total_consumo, 
        total_valor, 
        criado_em
      FROM relatorios_gerados 
      ORDER BY criado_em DESC
    `;
    const result = await query(sql);
    // Converter DECIMAL para número
    return result.map(row => ({
      ...row,
      total_consumo: parseFloat(row.total_consumo),
      total_valor: parseFloat(row.total_valor),
    }));
  }

  static async findByEmpreendimento(empreendimentoId: string): Promise<RelatorioGerado[]> {
    const sql = `
      SELECT 
        id, 
        empreendimento_id, 
        mes_ano, 
        pdf_url, 
        total_recargas, 
        total_consumo, 
        total_valor, 
        criado_em
      FROM relatorios_gerados 
      WHERE empreendimento_id = $1
      ORDER BY criado_em DESC
    `;
    const result = await query(sql, [empreendimentoId]);
    // Converter DECIMAL para número
    return result.map(row => ({
      ...row,
      total_consumo: parseFloat(row.total_consumo),
      total_valor: parseFloat(row.total_valor),
    }));
  }

  static async findById(id: string): Promise<RelatorioGerado | null> {
    const sql = 'SELECT * FROM relatorios_gerados WHERE id = $1';
    const result = await query(sql, [id]);
    return result[0] ? this.parseJsonFields(result[0]) : null;
  }

  static async findByMesAno(empreendimentoId: string, mesAno: string): Promise<RelatorioGerado | null> {
    const sql = `
      SELECT * FROM relatorios_gerados 
      WHERE empreendimento_id = $1 AND mes_ano = $2
    `;
    const result = await query(sql, [empreendimentoId, mesAno]);
    return result[0] ? this.parseJsonFields(result[0]) : null;
  }

  /**
   * 🆕 CORREÇÃO DO BUG: Salva TODOS os dados no campo dados_completos
   * Não usa mais localStorage!
   */
  static async create(data: CreateRelatorioGeradoDTO): Promise<RelatorioGerado> {
    const sql = `
      INSERT INTO relatorios_gerados (
        empreendimento_id, mes_ano, pdf_url,
        total_recargas, total_consumo, total_valor, dados_completos
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      RETURNING *
    `;
    const result = await query(sql, [
      data.empreendimento_id,
      data.mes_ano,
      '',
      data.total_recargas,
      data.total_consumo,
      data.total_valor,
      JSON.stringify(data.dados_completos), // 🔥 CORREÇÃO: Salva no BD!
    ]);
    return this.parseJsonFields(result[0]);
  }

  static async updatePdfUrl(id: string, pdfUrl: string): Promise<RelatorioGerado | null> {
    const sql = `
      UPDATE relatorios_gerados 
      SET pdf_url = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [pdfUrl, id]);
    return result[0] ? this.parseJsonFields(result[0]) : null;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM relatorios_gerados WHERE id = $1';
    await query(sql, [id]);
    return true;
  }

  // Helper para parsear campo JSONB
  private static parseJsonFields(row: any): RelatorioGerado {
    return {
      ...row,
      dados_completos: typeof row.dados_completos === 'string' 
        ? JSON.parse(row.dados_completos) 
        : row.dados_completos,
    };
  }
}


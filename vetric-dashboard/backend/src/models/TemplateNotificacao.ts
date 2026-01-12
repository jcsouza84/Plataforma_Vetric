/**
 * 💬 VETRIC - Model: Template de Notificação
 */

import { query } from '../config/database';
import { TemplateNotificacao, UpdateTemplateDTO } from '../types';

export class TemplateNotificacaoModel {
  // Buscar todos
  static async findAll(): Promise<TemplateNotificacao[]> {
    const sql = 'SELECT * FROM templates_notificacao ORDER BY tipo';
    return await query<TemplateNotificacao>(sql);
  }

  // Buscar por tipo
  static async findByTipo(tipo: string): Promise<TemplateNotificacao | null> {
    const sql = 'SELECT * FROM templates_notificacao WHERE tipo = $1';
    const result = await query<TemplateNotificacao>(sql, [tipo]);
    return result[0] || null;
  }

  // Buscar templates ativos
  static async findActive(): Promise<TemplateNotificacao[]> {
    const sql = 'SELECT * FROM templates_notificacao WHERE ativo = true ORDER BY tipo';
    return await query<TemplateNotificacao>(sql);
  }

  // Atualizar template
  static async update(tipo: string, data: UpdateTemplateDTO): Promise<TemplateNotificacao | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.mensagem !== undefined) {
      fields.push(`mensagem = $${paramIndex++}`);
      values.push(data.mensagem);
    }

    if (data.ativo !== undefined) {
      fields.push(`ativo = $${paramIndex++}`);
      values.push(data.ativo);
    }

    if (fields.length === 0) {
      return this.findByTipo(tipo);
    }

    fields.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(tipo);

    const sql = `
      UPDATE templates_notificacao 
      SET ${fields.join(', ')}
      WHERE tipo = $${paramIndex}
      RETURNING *
    `;

    const result = await query<TemplateNotificacao>(sql, values);
    return result[0] || null;
  }

  // Renderizar template com variáveis
  static renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return rendered;
  }
}


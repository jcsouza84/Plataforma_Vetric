/**
 * 🔋 VETRIC - Model: Carregamento
 */

import { query } from '../config/database';
import { Carregamento } from '../types';

export class CarregamentoModel {
  // Buscar todos
  static async findAll(limit: number = 100): Promise<Carregamento[]> {
    const sql = `
      SELECT * FROM carregamentos 
      ORDER BY inicio DESC 
      LIMIT $1
    `;
    return await query<Carregamento>(sql, [limit]);
  }

  // Buscar por ID
  static async findById(id: number): Promise<Carregamento | null> {
    const sql = 'SELECT * FROM carregamentos WHERE id = $1';
    const result = await query<Carregamento>(sql, [id]);
    return result[0] || null;
  }

  // Buscar por morador
  static async findByMorador(moradorId: number, limit: number = 50): Promise<Carregamento[]> {
    const sql = `
      SELECT * FROM carregamentos 
      WHERE morador_id = $1 
      ORDER BY inicio DESC 
      LIMIT $2
    `;
    return await query<Carregamento>(sql, [moradorId, limit]);
  }

  // Buscar carregamentos ativos
  static async findActive(): Promise<Carregamento[]> {
    const sql = `
      SELECT * FROM carregamentos 
      WHERE status IN ('iniciado', 'carregando')
      ORDER BY inicio DESC
    `;
    return await query<Carregamento>(sql);
  }

  // Buscar carregamento ativo por charger
  static async findActiveByCharger(chargerUuid: string, connectorId: number): Promise<Carregamento | null> {
    const sql = `
      SELECT * FROM carregamentos 
      WHERE charger_uuid = $1 
        AND connector_id = $2
        AND status IN ('iniciado', 'carregando')
      ORDER BY inicio DESC
      LIMIT 1
    `;
    const result = await query<Carregamento>(sql, [chargerUuid, connectorId]);
    return result[0] || null;
  }

  // Criar novo carregamento
  static async create(data: {
    moradorId: number | null;
    chargerUuid: string;
    chargerName: string;
    connectorId: number;
    status: string;
  }): Promise<Carregamento> {
    const sql = `
      INSERT INTO carregamentos (
        morador_id, charger_uuid, charger_name, connector_id, status, inicio
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await query<Carregamento>(sql, [
      data.moradorId,
      data.chargerUuid,
      data.chargerName,
      data.connectorId,
      data.status,
    ]);
    return result[0];
  }

  // Atualizar status
  static async updateStatus(
    id: number,
    status: string,
    energiaKwh?: number,
    duracaoMinutos?: number
  ): Promise<Carregamento | null> {
    const sql = `
      UPDATE carregamentos 
      SET 
        status = $1,
        fim = CASE WHEN $2 IN ('finalizado', 'erro') THEN CURRENT_TIMESTAMP ELSE fim END,
        energia_kwh = COALESCE($3, energia_kwh),
        duracao_minutos = COALESCE($4, duracao_minutos)
      WHERE id = $5
      RETURNING *
    `;
    const result = await query<Carregamento>(sql, [
      status,
      status,
      energiaKwh,
      duracaoMinutos,
      id,
    ]);
    return result[0] || null;
  }

  // Marcar notificação como enviada
  static async markNotificationSent(id: number, tipo: 'inicio' | 'fim'): Promise<void> {
    const field = tipo === 'inicio' ? 'notificacao_inicio_enviada' : 'notificacao_fim_enviada';
    const sql = `UPDATE carregamentos SET ${field} = true WHERE id = $1`;
    await query(sql, [id]);
  }

  // Estatísticas do dia
  static async getStatsToday() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'finalizado') as finalizados,
        COUNT(*) FILTER (WHERE status IN ('iniciado', 'carregando')) as em_andamento,
        COALESCE(SUM(energia_kwh), 0) as energia_total
      FROM carregamentos
      WHERE DATE(inicio) = CURRENT_DATE
    `;
    const result = await query(sql);
    return result[0];
  }

  // Estatísticas por período
  static async getStatsByPeriod(startDate: Date, endDate: Date) {
    const sql = `
      SELECT 
        DATE(inicio) as data,
        COUNT(*) as total_carregamentos,
        COALESCE(SUM(energia_kwh), 0) as energia_total,
        COALESCE(AVG(duracao_minutos), 0) as duracao_media
      FROM carregamentos
      WHERE inicio BETWEEN $1 AND $2
      GROUP BY DATE(inicio)
      ORDER BY data DESC
    `;
    return await query(sql, [startDate, endDate]);
  }
}


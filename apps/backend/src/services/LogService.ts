/**
 * LogService
 * 
 * Serviço centralizado para registro de logs do sistema
 * Logs são mantidos por 24 horas para monitoramento visual
 */

import { query } from '../config/database';

export type LogTipo = 'CVE_API' | 'POLLING' | 'NOTIFICACAO' | 'IDENTIFICACAO' | 'ERRO' | 'SISTEMA';
export type LogNivel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG';

export interface LogEntry {
  id?: number;
  timestamp?: Date;
  tipo: LogTipo;
  nivel: LogNivel;
  carregador_uuid?: string;
  carregador_nome?: string;
  morador_id?: number;
  morador_nome?: string;
  evento: string;
  mensagem: string;
  dados_json?: any;
  duracao_ms?: number;
  sucesso?: boolean;
  erro_detalhes?: string;
}

export interface LogFiltros {
  tipo?: LogTipo[];
  nivel?: LogNivel[];
  carregador_uuid?: string;
  morador_id?: number;
  evento?: string;
  sucesso?: boolean;
  inicio?: Date;
  fim?: Date;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  carregador_uuid: string;
  carregador_nome: string;
  total_eventos: number;
  total_erros: number;
  total_avisos: number;
  identificacoes_sucesso: number;
  identificacoes_falha: number;
  notificacoes_enviadas: number;
  ultimo_evento: Date;
}

class LogService {
  /**
   * Registra um log no sistema
   */
  async log(entry: LogEntry): Promise<number | null> {
    try {
      const sql = `
        INSERT INTO logs_sistema (
          tipo, nivel, evento, mensagem,
          carregador_uuid, carregador_nome,
          morador_id, morador_nome,
          dados_json, duracao_ms, sucesso, erro_detalhes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `;

      const result = await query<{ id: number }>(sql, [
        entry.tipo,
        entry.nivel,
        entry.evento,
        entry.mensagem,
        entry.carregador_uuid || null,
        entry.carregador_nome || null,
        entry.morador_id || null,
        entry.morador_nome || null,
        entry.dados_json ? JSON.stringify(entry.dados_json) : null,
        entry.duracao_ms || null,
        entry.sucesso !== undefined ? entry.sucesso : true,
        entry.erro_detalhes || null
      ]);

      return result[0]?.id || null;
    } catch (error) {
      console.error('[LogService] Erro ao inserir log:', error);
      return null;
    }
  }

  /**
   * Logs específicos para API CVE
   */
  async logCveApi(
    evento: string,
    mensagem: string,
    carregador_uuid?: string,
    carregador_nome?: string,
    dados?: any,
    duracao_ms?: number
  ): Promise<void> {
    await this.log({
      tipo: 'CVE_API',
      nivel: 'INFO',
      evento,
      mensagem,
      carregador_uuid,
      carregador_nome,
      dados_json: dados,
      duracao_ms,
      sucesso: true
    });
  }

  /**
   * Log de polling
   */
  async logPolling(
    evento: string,
    mensagem: string,
    nivel: LogNivel = 'INFO',
    carregador_uuid?: string,
    dados?: any
  ): Promise<void> {
    await this.log({
      tipo: 'POLLING',
      nivel,
      evento,
      mensagem,
      carregador_uuid,
      dados_json: dados,
      sucesso: nivel !== 'ERROR'
    });
  }

  /**
   * Log de identificação de morador
   */
  async logIdentificacao(
    sucesso: boolean,
    carregador_uuid: string,
    carregador_nome: string,
    idTag: string,
    morador_id?: number,
    morador_nome?: string,
    mensagem?: string
  ): Promise<void> {
    await this.log({
      tipo: 'IDENTIFICACAO',
      nivel: sucesso ? 'SUCCESS' : 'WARN',
      evento: sucesso ? 'MORADOR_IDENTIFICADO' : 'MORADOR_NAO_IDENTIFICADO',
      mensagem: mensagem || (sucesso 
        ? `Morador ${morador_nome} identificado com tag ${idTag}`
        : `Tag ${idTag} não identificada`),
      carregador_uuid,
      carregador_nome,
      morador_id,
      morador_nome,
      dados_json: { idTag },
      sucesso
    });
  }

  /**
   * Log de notificação
   */
  async logNotificacao(
    sucesso: boolean,
    evento: string,
    morador_id: number,
    morador_nome: string,
    carregador_uuid?: string,
    mensagem?: string,
    erro_detalhes?: string
  ): Promise<void> {
    await this.log({
      tipo: 'NOTIFICACAO',
      nivel: sucesso ? 'SUCCESS' : 'ERROR',
      evento,
      mensagem: mensagem || `Notificação de ${evento}`,
      carregador_uuid,
      morador_id,
      morador_nome,
      sucesso,
      erro_detalhes
    });
  }

  /**
   * Log de erro
   */
  async logErro(
    evento: string,
    mensagem: string,
    erro: any,
    carregador_uuid?: string,
    dados?: any
  ): Promise<void> {
    await this.log({
      tipo: 'ERRO',
      nivel: 'ERROR',
      evento,
      mensagem,
      carregador_uuid,
      dados_json: dados,
      sucesso: false,
      erro_detalhes: erro instanceof Error ? erro.stack : JSON.stringify(erro)
    });
  }

  /**
   * Buscar logs com filtros
   */
  async buscar(filtros: LogFiltros = {}): Promise<LogEntry[]> {
    try {
      const conditions: string[] = ['1=1'];
      const params: any[] = [];
      let paramCount = 1;

      // Filtro por tipo
      if (filtros.tipo && filtros.tipo.length > 0) {
        conditions.push(`tipo = ANY($${paramCount})`);
        params.push(filtros.tipo);
        paramCount++;
      }

      // Filtro por nível
      if (filtros.nivel && filtros.nivel.length > 0) {
        conditions.push(`nivel = ANY($${paramCount})`);
        params.push(filtros.nivel);
        paramCount++;
      }

      // Filtro por carregador
      if (filtros.carregador_uuid) {
        conditions.push(`carregador_uuid = $${paramCount}`);
        params.push(filtros.carregador_uuid);
        paramCount++;
      }

      // Filtro por morador
      if (filtros.morador_id) {
        conditions.push(`morador_id = $${paramCount}`);
        params.push(filtros.morador_id);
        paramCount++;
      }

      // Filtro por evento
      if (filtros.evento) {
        conditions.push(`evento ILIKE $${paramCount}`);
        params.push(`%${filtros.evento}%`);
        paramCount++;
      }

      // Filtro por sucesso
      if (filtros.sucesso !== undefined) {
        conditions.push(`sucesso = $${paramCount}`);
        params.push(filtros.sucesso);
        paramCount++;
      }

      // Filtro por data
      if (filtros.inicio) {
        conditions.push(`timestamp >= $${paramCount}`);
        params.push(filtros.inicio);
        paramCount++;
      }

      if (filtros.fim) {
        conditions.push(`timestamp <= $${paramCount}`);
        params.push(filtros.fim);
        paramCount++;
      }

      const limit = filtros.limit || 100;
      const offset = filtros.offset || 0;

      const sql = `
        SELECT 
          id,
          timestamp,
          tipo,
          nivel,
          carregador_uuid,
          carregador_nome,
          morador_id,
          morador_nome,
          evento,
          mensagem,
          dados_json,
          duracao_ms,
          sucesso,
          erro_detalhes
        FROM logs_sistema
        WHERE ${conditions.join(' AND ')}
        ORDER BY timestamp DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(limit, offset);

      const result = await query<LogEntry>(sql, params);
      return result;
    } catch (error) {
      console.error('[LogService] Erro ao buscar logs:', error);
      return [];
    }
  }

  /**
   * Estatísticas por carregador
   */
  async estatisticasPorCarregador(): Promise<LogStats[]> {
    try {
      const sql = `
        SELECT * FROM v_logs_stats_carregador
        ORDER BY ultimo_evento DESC
      `;

      const result = await query<LogStats>(sql);
      return result;
    } catch (error) {
      console.error('[LogService] Erro ao buscar estatísticas:', error);
      return [];
    }
  }

  /**
   * Logs recentes (últimos 100)
   */
  async recentes(limit: number = 100): Promise<LogEntry[]> {
    return this.buscar({ limit });
  }

  /**
   * Limpar logs antigos (> 24 horas)
   */
  async limparAntigos(): Promise<number> {
    try {
      const sql = 'SELECT limpar_logs_antigos()';
      const result = await query<{ limpar_logs_antigos: number }>(sql);
      const linhas = result[0]?.limpar_logs_antigos || 0;
      
      if (linhas > 0) {
        await this.log({
          tipo: 'SISTEMA',
          nivel: 'INFO',
          evento: 'LIMPEZA_LOGS',
          mensagem: `${linhas} logs antigos removidos`,
          sucesso: true
        });
      }

      return linhas;
    } catch (error) {
      console.error('[LogService] Erro ao limpar logs antigos:', error);
      return 0;
    }
  }

  /**
   * Logs em tempo real (últimos N minutos)
   */
  async tempoReal(minutos: number = 5, limit: number = 50): Promise<LogEntry[]> {
    const inicio = new Date();
    inicio.setMinutes(inicio.getMinutes() - minutos);

    return this.buscar({
      inicio,
      limit
    });
  }
}

// Exportar instância singleton
export const logService = new LogService();
export default logService;

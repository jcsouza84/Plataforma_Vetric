/**
 * Monitor Terminal - Interface Visual de Logs
 * 
 * Interface tipo terminal para monitorar em tempo real
 * todas as interações do sistema com CVE API
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MonitorTerminal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface LogEntry {
  id: number;
  timestamp: string;
  tipo: string;
  nivel: string;
  carregador_uuid?: string;
  carregador_nome?: string;
  morador_id?: number;
  morador_nome?: string;
  evento: string;
  mensagem: string;
  dados_json?: any;
  duracao_ms?: number;
  sucesso: boolean;
  erro_detalhes?: string;
}

interface LogStats {
  carregador_uuid: string;
  carregador_nome: string;
  total_eventos: number;
  total_erros: number;
  total_avisos: number;
  identificacoes_sucesso: number;
  identificacoes_falha: number;
  notificacoes_enviadas: number;
  ultimo_evento: string;
}

const MonitorTerminal: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroNivel, setFiltroNivel] = useState<string>('');
  const [filtroCarregador, setFiltroCarregador] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Buscar logs a cada 2 segundos (se não pausado)
  useEffect(() => {
    if (paused) return;

    const fetchLogs = async () => {
      try {
        const params: any = { limit: 100 };
        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroNivel) params.nivel = filtroNivel;
        if (filtroCarregador) params.carregador_uuid = filtroCarregador;

        const response = await axios.get(`${API_URL}/api/logs`, { params });
        setLogs(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, [filtroTipo, filtroNivel, filtroCarregador, paused]);

  // Buscar estatísticas a cada 10 segundos
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/logs/stats`);
        setStats(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Formatação de cor por nível
  const getNivelColor = (nivel: string): string => {
    switch (nivel) {
      case 'ERROR':
        return 'text-red';
      case 'WARN':
        return 'text-yellow';
      case 'SUCCESS':
        return 'text-green';
      case 'INFO':
        return 'text-blue';
      case 'DEBUG':
        return 'text-gray';
      default:
        return 'text-white';
    }
  };

  // Formatação de cor por tipo
  const getTipoColor = (tipo: string): string => {
    switch (tipo) {
      case 'CVE_API':
        return 'text-cyan';
      case 'POLLING':
        return 'text-purple';
      case 'NOTIFICACAO':
        return 'text-green';
      case 'IDENTIFICACAO':
        return 'text-yellow';
      case 'ERRO':
        return 'text-red';
      case 'SISTEMA':
        return 'text-blue';
      default:
        return 'text-white';
    }
  };

  // Formatação de timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  // Limpar logs
  const handleLimpar = async () => {
    try {
      await axios.post(`${API_URL}/api/logs/limpar`);
      setLogs([]);
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
    }
  };

  return (
    <div className="monitor-terminal">
      {/* Header */}
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">▶</span>
          <h1>VETRIC Monitor - Terminal de Logs</h1>
          <span className={`status-indicator ${paused ? 'paused' : 'active'}`}>
            {paused ? '⏸ PAUSADO' : '⚡ AO VIVO'}
          </span>
        </div>

        {/* Filtros */}
        <div className="terminal-filters">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Tipos</option>
            <option value="CVE_API">CVE API</option>
            <option value="POLLING">Polling</option>
            <option value="NOTIFICACAO">Notificação</option>
            <option value="IDENTIFICACAO">Identificação</option>
            <option value="ERRO">Erro</option>
            <option value="SISTEMA">Sistema</option>
          </select>

          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Níveis</option>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
            <option value="DEBUG">Debug</option>
          </select>

          <select
            value={filtroCarregador}
            onChange={(e) => setFiltroCarregador(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Carregadores</option>
            {stats.map((stat) => (
              <option key={stat.carregador_uuid} value={stat.carregador_uuid}>
                {stat.carregador_nome}
              </option>
            ))}
          </select>

          <button
            className="btn-control"
            onClick={() => setPaused(!paused)}
          >
            {paused ? '▶ Retomar' : '⏸ Pausar'}
          </button>

          <button
            className="btn-control"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            {autoScroll ? '📜 Scroll Manual' : '📜 Auto-Scroll'}
          </button>

          <button
            className="btn-control btn-danger"
            onClick={handleLimpar}
          >
            🗑 Limpar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="terminal-stats">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.carregador_uuid} className="stat-card">
              <div className="stat-header">{stat.carregador_nome}</div>
              <div className="stat-body">
                <div className="stat-item">
                  <span>Total:</span>
                  <span className="text-white">{stat.total_eventos}</span>
                </div>
                <div className="stat-item">
                  <span>Erros:</span>
                  <span className="text-red">{stat.total_erros}</span>
                </div>
                <div className="stat-item">
                  <span>Identificações:</span>
                  <span className="text-green">
                    {stat.identificacoes_sucesso}
                    <span className="text-red">/{stat.identificacoes_falha}</span>
                  </span>
                </div>
                <div className="stat-item">
                  <span>Notificações:</span>
                  <span className="text-blue">{stat.notificacoes_enviadas}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal de Logs */}
      <div className="terminal-body" ref={terminalRef}>
        <div className="terminal-content">
          {logs.length === 0 ? (
            <div className="terminal-empty">
              <p>Aguardando logs...</p>
              <p className="text-gray">Os logs aparecerão aqui em tempo real</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-line">
                <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                <span className={`log-tipo ${getTipoColor(log.tipo)}`}>
                  [{log.tipo}]
                </span>
                <span className={`log-nivel ${getNivelColor(log.nivel)}`}>
                  {log.nivel}
                </span>
                {log.carregador_nome && (
                  <span className="log-carregador text-cyan">
                    {log.carregador_nome}
                  </span>
                )}
                {log.morador_nome && (
                  <span className="log-morador text-yellow">
                    👤 {log.morador_nome}
                  </span>
                )}
                <span className="log-evento text-purple">
                  {log.evento}
                </span>
                <span className="log-mensagem">
                  {log.mensagem}
                </span>
                {log.duracao_ms && (
                  <span className="log-duracao text-gray">
                    ({log.duracao_ms}ms)
                  </span>
                )}
                {!log.sucesso && (
                  <span className="log-falha text-red">
                    ❌ FALHOU
                  </span>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Footer */}
      <div className="terminal-footer">
        <span>{logs.length} log(s) exibidos</span>
        <span>Atualizando a cada 2 segundos</span>
        <span>Logs mantidos por 24 horas</span>
      </div>
    </div>
  );
};

export default MonitorTerminal;

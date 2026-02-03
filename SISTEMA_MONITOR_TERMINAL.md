# 📺 Sistema de Monitor Terminal - Guia Completo

**Data de Criação:** 03/02/2026  
**Versão:** 1.0

---

## 🎯 O QUE É

Um **sistema de monitoramento visual tipo terminal** que exibe em tempo real todas as interações do backend com a API CVE, incluindo:

- 📡 Chamadas à API CVE
- 🔄 Polling de carregadores
- 👤 Identificação de moradores
- 📱 Envio de notificações
- ❌ Erros e avisos
- ⚙️ Eventos do sistema

---

## 🏗️ ARQUITETURA

```
┌─────────────────────────────────────────────────────────────┐
│                     VETRIC DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PollingService ──┐                                          │
│                   │                                          │
│  NotificationService ──┐                                     │
│                        │                                     │
│  CVEService ──────────┼───► LogService ──► logs_sistema (DB)│
│                        │                         │           │
│  Outros... ───────────┘                          │           │
│                                                  │           │
│                                   API /api/logs ─┘           │
│                                          │                   │
└──────────────────────────────────────────│───────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────┐
                              │  MonitorTerminal.tsx │
                              │   (Interface React)   │
                              └──────────────────────┘
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### Backend

```
apps/backend/src/
├── migrations/
│   └── 010_criar_logs_sistema.sql       # Tabela + Views + Functions
├── services/
│   └── LogService.ts                     # Serviço centralizado de logs
└── routes/
    └── logs.ts                           # API endpoints
```

### Frontend

```
apps/interface/src/pages/
├── MonitorTerminal.tsx                   # Interface visual
└── MonitorTerminal.css                   # Estilos tipo terminal
```

---

## 🗄️ BANCO DE DADOS

### Tabela: `logs_sistema`

| Campo            | Tipo       | Descrição                              |
|------------------|------------|----------------------------------------|
| `id`             | BIGSERIAL  | ID único                               |
| `timestamp`      | TIMESTAMPTZ| Data/hora do evento                    |
| `tipo`           | VARCHAR(50)| CVE_API, POLLING, NOTIFICACAO, etc     |
| `nivel`          | VARCHAR(20)| INFO, WARN, ERROR, SUCCESS, DEBUG      |
| `carregador_uuid`| VARCHAR(50)| UUID do carregador                     |
| `carregador_nome`| VARCHAR(100)| Nome do carregador                    |
| `morador_id`     | INTEGER    | ID do morador                          |
| `morador_nome`   | VARCHAR(200)| Nome do morador                       |
| `evento`         | VARCHAR(100)| Tipo do evento                        |
| `mensagem`       | TEXT       | Mensagem descritiva                    |
| `dados_json`     | JSONB      | Dados adicionais                       |
| `duracao_ms`     | INTEGER    | Duração da operação                    |
| `sucesso`        | BOOLEAN    | Se teve sucesso                        |
| `erro_detalhes`  | TEXT       | Detalhes do erro                       |

**TTL:** Logs são automaticamente removidos após 24 horas

### Views

- `v_logs_stats_carregador`: Estatísticas por carregador
- `v_logs_recentes`: Últimas 100 entradas

---

## 🔌 API ENDPOINTS

### 1. Buscar Logs
```http
GET /api/logs?tipo=CVE_API&nivel=ERROR&limit=100
```

**Parâmetros:**
- `tipo`: CVE_API, POLLING, NOTIFICACAO, IDENTIFICACAO, ERRO, SISTEMA
- `nivel`: INFO, WARN, ERROR, SUCCESS, DEBUG
- `carregador_uuid`: UUID do carregador
- `morador_id`: ID do morador
- `evento`: Nome do evento
- `sucesso`: true/false
- `limit`: Número máximo de resultados (padrão: 100)
- `offset`: Paginação

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "timestamp": "2026-02-03T01:45:00.000Z",
      "tipo": "IDENTIFICACAO",
      "nivel": "SUCCESS",
      "carregador_nome": "Gran Marine 3",
      "morador_nome": "Claudevania Pereira Martins",
      "evento": "MORADOR_IDENTIFICADO",
      "mensagem": "Morador identificado com sucesso",
      "sucesso": true
    }
  ],
  "count": 1
}
```

### 2. Logs Recentes
```http
GET /api/logs/recentes?limit=50
```

### 3. Tempo Real
```http
GET /api/logs/tempo-real?minutos=5&limit=50
```

### 4. Estatísticas
```http
GET /api/logs/stats
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "carregador_uuid": "1122905050",
      "carregador_nome": "Gran Marine 4",
      "total_eventos": 245,
      "total_erros": 5,
      "total_avisos": 12,
      "identificacoes_sucesso": 18,
      "identificacoes_falha": 2,
      "notificacoes_enviadas": 32,
      "ultimo_evento": "2026-02-03T01:45:00.000Z"
    }
  ]
}
```

### 5. Por Carregador
```http
GET /api/logs/carregador/1122905050
```

### 6. Por Morador
```http
GET /api/logs/morador/20
```

### 7. Limpar Antigos
```http
POST /api/logs/limpar
```

### 8. Stream (Server-Sent Events)
```http
GET /api/logs/stream
```

---

## 💻 USO NO CÓDIGO

### Exemplo: PollingService

```typescript
import { logService } from '../services/LogService';

class PollingService {
  async buscarCarregadores() {
    const inicio = Date.now();
    
    try {
      const chargers = await cveService.getChargers();
      const duracao = Date.now() - inicio;
      
      // Log de sucesso
      await logService.logCveApi(
        'GET_CHARGERS',
        `${chargers.length} carregadores encontrados`,
        undefined,
        undefined,
        { count: chargers.length },
        duracao
      );
      
      return chargers;
    } catch (error) {
      // Log de erro
      await logService.logErro(
        'GET_CHARGERS_FAILED',
        'Erro ao buscar carregadores',
        error
      );
      throw error;
    }
  }

  async identificarMorador(idTag: string, charger: Charger) {
    const morador = await MoradorModel.findByTag(idTag);
    
    if (morador) {
      // Morador identificado
      await logService.logIdentificacao(
        true,
        charger.uuid,
        charger.name,
        idTag,
        morador.id,
        morador.nome,
        `Morador ${morador.nome} identificado com tag ${idTag}`
      );
    } else {
      // Não identificado
      await logService.logIdentificacao(
        false,
        charger.uuid,
        charger.name,
        idTag,
        undefined,
        undefined,
        `Tag ${idTag} não cadastrada no sistema`
      );
    }
  }
}
```

### Exemplo: NotificationService

```typescript
import { logService } from '../services/LogService';

class NotificationService {
  async enviarNotificacao(morador: Morador, mensagem: string, evento: string) {
    try {
      await evolutionApi.sendMessage(morador.telefone, mensagem);
      
      // Log de sucesso
      await logService.logNotificacao(
        true,
        evento,
        morador.id,
        morador.nome,
        undefined,
        `Notificação enviada para ${morador.nome}`
      );
      
    } catch (error) {
      // Log de erro
      await logService.logNotificacao(
        false,
        evento,
        morador.id,
        morador.nome,
        undefined,
        `Falha ao enviar notificação`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}
```

---

## 🎨 INTERFACE VISUAL

### Características:

1. **Design tipo Terminal**
   - Fundo escuro (#0a0e27)
   - Texto verde neon (#00ff00)
   - Fonte monoespaçada (Courier New)
   - Animações sutis

2. **Cores por Nível:**
   - 🔴 ERROR - Vermelho
   - 🟡 WARN - Amarelo
   - 🟢 SUCCESS - Verde
   - 🔵 INFO - Azul
   - ⚪ DEBUG - Cinza

3. **Cores por Tipo:**
   - 🔵 CVE_API - Ciano
   - 🟣 POLLING - Roxo
   - 🟢 NOTIFICACAO - Verde
   - 🟡 IDENTIFICACAO - Amarelo
   - 🔴 ERRO - Vermelho
   - 🔵 SISTEMA - Azul

4. **Funcionalidades:**
   - ⏸ Pausar/Retomar atualização
   - 📜 Auto-scroll / Manual scroll
   - 🔍 Filtros (tipo, nível, carregador)
   - 🗑 Limpar logs
   - 📊 Estatísticas por carregador
   - 🔄 Atualização a cada 2 segundos

### Acesso:

```
http://localhost:3000/monitor
```

---

## 🚀 COMO EXECUTAR

### 1. Aplicar Migration

```bash
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE

# Executar migration
npm run migrate

# Ou manualmente via Supabase:
# Cole o conteúdo de 010_criar_logs_sistema.sql no SQL Editor
```

### 2. Iniciar Backend

```bash
cd apps/backend
npm run dev
```

O LogService já estará disponível.

### 3. Iniciar Frontend

```bash
cd apps/interface
npm run dev
```

Acesse: `http://localhost:3000/monitor`

---

## 📊 TIPOS DE EVENTOS

### CVE_API
- `GET_CHARGERS` - Buscar carregadores
- `GET_CHARGER_STATUS` - Status de um carregador
- `GET_TRANSACTION` - Buscar transação
- `GET_TRANSACTIONS_LIST` - Listar transações

### POLLING
- `POLLING_START` - Início do ciclo de polling
- `POLLING_CYCLE` - Ciclo executado
- `POLLING_ERROR` - Erro no polling
- `TRANSACTION_PROCESSED` - Transação processada

### IDENTIFICACAO
- `MORADOR_IDENTIFICADO` - Morador encontrado
- `MORADOR_NAO_IDENTIFICADO` - Tag não cadastrada
- `IDENTIFICACAO_ERRO` - Erro na identificação

### NOTIFICACAO
- `NOTIFICACAO_INICIO` - Notificação de início de carga
- `NOTIFICACAO_OCIOSIDADE` - Notificação de ociosidade
- `NOTIFICACAO_BATERIA_CHEIA` - Notificação de bateria cheia
- `NOTIFICACAO_INTERRUPCAO` - Notificação de interrupção
- `NOTIFICACAO_ERRO` - Erro ao enviar notificação

### ERRO
- `API_ERROR` - Erro na API CVE
- `DATABASE_ERROR` - Erro no banco
- `SYSTEM_ERROR` - Erro do sistema

### SISTEMA
- `SYSTEM_START` - Sistema iniciado
- `MIGRATION` - Migration executada
- `LIMPEZA_LOGS` - Logs antigos removidos

---

## 🔧 MANUTENÇÃO

### Limpar Logs Manualmente

```sql
SELECT limpar_logs_antigos();
```

### Ver Estatísticas

```sql
SELECT * FROM v_logs_stats_carregador;
```

### Logs das Últimas 24h

```sql
SELECT 
  COUNT(*) as total,
  tipo,
  nivel,
  COUNT(*) FILTER (WHERE sucesso = false) as falhas
FROM logs_sistema
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY tipo, nivel
ORDER BY total DESC;
```

### Performance

```sql
-- Tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('logs_sistema')) as tamanho_total,
  COUNT(*) as total_registros
FROM logs_sistema;

-- Logs por hora
SELECT 
  DATE_TRUNC('hour', timestamp) as hora,
  COUNT(*) as total
FROM logs_sistema
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hora
ORDER BY hora DESC;
```

---

## 🐛 TROUBLESHOOTING

### Problema: Logs não aparecem

1. Verificar se migration foi aplicada:
```sql
SELECT * FROM schema_migrations WHERE version = '010';
```

2. Verificar se tabela existe:
```sql
\dt logs_sistema
```

3. Verificar se LogService está sendo usado:
```typescript
// No código, verificar se há chamadas como:
await logService.log({ ... });
```

### Problema: Interface não atualiza

1. Verificar console do navegador (F12)
2. Verificar se API está respondendo:
```bash
curl http://localhost:5000/api/logs/recentes
```

3. Verificar se backend está rodando

### Problema: Muitos logs / Performance ruim

1. Ajustar filtros na interface
2. Reduzir limite de registros
3. Limpar logs antigos:
```sql
SELECT limpar_logs_antigos();
```

---

## 📈 PRÓXIMAS MELHORIAS

- [ ] WebSocket real-time ao invés de polling
- [ ] Exportar logs para CSV/JSON
- [ ] Busca por texto livre
- [ ] Gráficos de eventos ao longo do tempo
- [ ] Alertas sonoros para erros críticos
- [ ] Modo escuro / claro
- [ ] Salvar filtros favoritos
- [ ] Histórico de eventos por morador

---

## 📝 CONCLUSÃO

O Sistema de Monitor Terminal oferece **visibilidade total** de todas as operações do sistema em tempo real, facilitando:

- ✅ **Debug** - Ver exatamente o que está acontecendo
- ✅ **Monitoramento** - Acompanhar operação em produção
- ✅ **Troubleshooting** - Identificar problemas rapidamente
- ✅ **Auditoria** - Histórico de 24h de eventos
- ✅ **Performance** - Ver duração de operações

---

**Desenvolvido para VETRIC Dashboard**  
**Data:** 03/02/2026

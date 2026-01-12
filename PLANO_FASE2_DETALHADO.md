# 🚀 VETRIC - Plano Detalhado da Fase 2

## 📅 Estimativa: 3-5 dias
## 🎯 Objetivo: Tornar o sistema operacional para o cliente Gran Marine

---

## 📊 VISÃO GERAL DA FASE 2

A Fase 2 adiciona as **funcionalidades essenciais** que transformam o dashboard de "monitoramento" em um **sistema completo de gestão**.

### O que já temos (Fase 1) ✅
- Login VETRIC (admin/cliente)
- Dashboard com 5 carregadores em tempo real
- Integração automática com CVE-Pro API
- Autenticação JWT robusta
- Sistema pronto para produção

### O que vamos adicionar (Fase 2) 🚀
1. **Relatórios de Carregamento** - Histórico e análises
2. **CRUD Completo de Moradores** - Gestão de usuários do condomínio
3. **Configuração de Templates WhatsApp** - Mensagens personalizadas
4. **Importação de Tags RFID** - Upload CSV/Excel em massa
5. **Notificações WhatsApp Automáticas** - Alertas em tempo real

---

## 🎯 FEATURE #1: RELATÓRIOS DE CARREGAMENTO

### Objetivo
Permitir que administradores e moradores visualizem o histórico de carregamentos com filtros, gráficos e exportação de dados.

### Funcionalidades

#### 1.1. Página de Relatórios
```
URL: /relatorios
Acesso: ADMIN + CLIENTE
```

**Componentes:**
- Filtros avançados:
  - Por período (hoje, semana, mês, personalizado)
  - Por morador (dropdown)
  - Por carregador (dropdown)
  - Por status (concluído, em andamento, falha)

- Tabela de carregamentos:
  - Data/hora de início
  - Duração
  - Energia consumida (kWh)
  - Custo estimado (R$)
  - Carregador utilizado
  - Morador
  - Status

- Gráficos:
  - Consumo por dia (gráfico de linha)
  - Carregadores mais utilizados (gráfico de pizza)
  - Horários de pico (gráfico de barras)
  - Consumo mensal (gráfico de barras)

- Ações:
  - Exportar para PDF
  - Exportar para Excel
  - Imprimir relatório

#### 1.2. Relatório Individual
```
URL: /relatorios/:id
Acesso: ADMIN + CLIENTE (apenas seus próprios)
```

**Detalhes:**
- Informações completas do carregamento
- Timeline visual (início → carregando → fim)
- Gráfico de potência ao longo do tempo
- Cálculo de custo detalhado
- Opção de contestar/reportar problema

#### 1.3. Backend Endpoints

```typescript
// Já existem, mas vamos melhorar:
GET /api/carregamentos
  ?limit=100
  &offset=0
  &morador_id=123
  &charger_uuid=xxx
  &data_inicio=2026-01-01
  &data_fim=2026-01-31
  &status=concluido

GET /api/carregamentos/:id

GET /api/carregamentos/stats/summary
  ?periodo=mes_atual

GET /api/carregamentos/stats/grafico-consumo
  ?tipo=diario|mensal
  &inicio=2026-01-01
  &fim=2026-01-31

// Novos endpoints:
GET /api/carregamentos/export/pdf
  ?filtros=...
  
GET /api/carregamentos/export/excel
  ?filtros=...

POST /api/carregamentos/:id/reportar-problema
  Body: { descricao: string, tipo: string }
```

### Tempo Estimado: 1 dia
- Backend: 3-4h
- Frontend: 4-5h

---

## 👥 FEATURE #2: CRUD COMPLETO DE MORADORES

### Objetivo
Sistema completo de gestão de moradores do condomínio, incluindo cadastro, edição, vinculação de tags RFID e histórico.

### Funcionalidades

#### 2.1. Página de Moradores (já existe, vamos melhorar)
```
URL: /usuarios
Acesso: ADMIN only
```

**Melhorias:**
- Tabela com paginação e busca
- Filtros:
  - Por apartamento
  - Notificações ativas/inativas
  - Com/sem tag vinculada
  - Ordenação por nome/apartamento/data

- Ações em massa:
  - Ativar/desativar notificações de vários moradores
  - Exportar lista para Excel
  - Enviar mensagem em massa (WhatsApp)

- Cards visuais:
  - Total de moradores
  - Moradores ativos
  - Tags vinculadas
  - Notificações ativas

#### 2.2. Modal de Criação/Edição
```
Campos:
- Nome completo *
- Apartamento/Unidade *
- Telefone (WhatsApp) * (formato: +55 82 99999-9999)
- E-mail (opcional)
- Tag RFID * (leitura automática ou manual)
- Notificações WhatsApp ativadas (toggle)
- Foto (upload opcional)

Validações:
- Nome: mínimo 3 caracteres
- Apartamento: formato XXX (ex: 101, 102)
- Telefone: formato brasileiro com DDD
- Tag RFID: única no sistema
- E-mail: formato válido
```

#### 2.3. Página de Detalhes do Morador
```
URL: /usuarios/:id
Acesso: ADMIN only
```

**Seções:**
- Informações Pessoais (editar inline)
- Histórico de Carregamentos (últimos 30 dias)
- Gráficos de Consumo (mensal)
- Logs de Notificações Enviadas
- Ações:
  - Editar morador
  - Desvincular tag
  - Enviar mensagem teste
  - Desativar morador
  - Ver relatório completo

#### 2.4. Backend Endpoints

```typescript
// Já existem:
GET    /api/moradores
POST   /api/moradores (ADMIN)
PUT    /api/moradores/:id (ADMIN)
DELETE /api/moradores/:id (ADMIN)
GET    /api/moradores/:id
GET    /api/moradores/tag/:tag

// Novos endpoints:
GET /api/moradores/:id/historico-carregamentos
  ?limit=30
  
GET /api/moradores/:id/stats-consumo
  ?periodo=mes_atual

GET /api/moradores/:id/logs-notificacoes
  ?limit=50

POST /api/moradores/:id/enviar-mensagem-teste
  Body: { mensagem: string }

PUT /api/moradores/:id/desvincular-tag

PATCH /api/moradores/batch-update
  Body: { ids: number[], updates: {...} }

GET /api/moradores/export/excel
```

### Tempo Estimado: 1 dia
- Backend: 3-4h
- Frontend: 4-5h

---

## 💬 FEATURE #3: CONFIGURAÇÃO DE TEMPLATES WHATSAPP

### Objetivo
Permitir que administradores personalizem as mensagens automáticas enviadas aos moradores.

### Funcionalidades

#### 3.1. Página de Configurações
```
URL: /configuracoes
Acesso: ADMIN only
```

**Seções:**

##### 3.1.1. Templates de Notificação

**Template 1: Início de Carregamento**
```
Variáveis disponíveis:
{{nome}}          - Nome do morador
{{apartamento}}   - Número do apartamento
{{charger}}       - Nome do carregador
{{data}}          - Data/hora de início
{{localizacao}}   - Localização do carregador

Exemplo padrão:
🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}

Acompanhe pelo app VETRIC!
```

**Template 2: Fim de Carregamento**
```
Variáveis disponíveis:
{{nome}}          - Nome do morador
{{apartamento}}   - Número do apartamento
{{charger}}       - Nome do carregador
{{duracao}}       - Duração total
{{energia}}       - Energia total (kWh)
{{custo}}         - Custo estimado (R$)
{{data}}          - Data/hora de fim

Exemplo padrão:
✅ Olá {{nome}}!

Seu carregamento foi concluído!

⚡ Energia: {{energia}} kWh
⏱️ Duração: {{duracao}}
💰 Custo estimado: R$ {{custo}}

Carregador {{charger}} está disponível.
```

**Template 3: Erro/Problema**
```
Variáveis disponíveis:
{{nome}}          - Nome do morador
{{charger}}       - Nome do carregador
{{erro}}          - Descrição do erro
{{data}}          - Data/hora do erro

Exemplo padrão:
⚠️ Olá {{nome}}!

Detectamos um problema no seu carregamento:

🔌 Carregador: {{charger}}
❌ Erro: {{erro}}
🕐 Horário: {{data}}

Entre em contato com a administração.
```

**Template 4: Carregador Disponível** (novo)
```
Variáveis disponíveis:
{{nome}}          - Nome do morador
{{charger}}       - Nome do carregador
{{localizacao}}   - Localização

Exemplo:
✨ Olá {{nome}}!

O carregador {{charger}} está disponível!

📍 Local: {{localizacao}}

Aproveite para carregar seu veículo.
```

##### 3.1.2. Preview em Tempo Real
- Ao editar o template, mostrar preview com dados de exemplo
- Validar variáveis ({{xxx}})
- Contador de caracteres
- Teste: Enviar para meu número

##### 3.1.3. Configurações Gerais
```
- Ativar/desativar notificações globalmente
- Horário de envio (ex: não enviar entre 22h-7h)
- Intervalo mínimo entre mensagens (ex: 5 min)
- Número de tentativas em caso de falha
- Telefone de suporte (para mensagens de erro)
```

#### 3.2. Backend Endpoints

```typescript
// Já existem:
GET /api/templates
GET /api/templates/:tipo
PUT /api/templates/:tipo (ADMIN)

// Novos endpoints:
POST /api/templates/:tipo/preview
  Body: { morador_id: number }
  // Retorna mensagem renderizada com dados reais

POST /api/templates/:tipo/test
  Body: { telefone: string, morador_id: number }
  // Envia mensagem de teste

GET /api/templates/variaveis/:tipo
  // Lista variáveis disponíveis para cada tipo

PUT /api/config/notificacoes (ADMIN)
  Body: {
    ativas: boolean,
    horario_inicio: string,
    horario_fim: string,
    intervalo_minimo: number,
    max_tentativas: number,
    telefone_suporte: string
  }
```

### Tempo Estimado: 0.5 dia (4h)
- Backend: 1-2h
- Frontend: 2-3h

---

## 📤 FEATURE #4: IMPORTAÇÃO DE TAGS RFID EM MASSA

### Objetivo
Facilitar o cadastro inicial de moradores através de upload de arquivo CSV/Excel.

### Funcionalidades

#### 4.1. Modal de Importação
```
Botão na página /usuarios: "Importar em Massa"
Acesso: ADMIN only
```

**Passo 1: Download do Template**
```
Botão: "Baixar Template Excel"

Colunas do template:
| Nome          | Apartamento | Telefone       | Tag RFID         | Email (opcional) | Notificações |
|---------------|-------------|----------------|------------------|------------------|--------------|
| João Silva    | 101         | +5582999999999 | 04E2A3B1C5D6F8   | joao@email.com   | SIM          |
| Maria Santos  | 102         | +5582988888888 | 05F3B4C2D7E9A1   |                  | NÃO          |
```

**Passo 2: Upload do Arquivo**
```
- Drag & drop ou clique para selecionar
- Formatos aceitos: .xlsx, .xls, .csv
- Tamanho máximo: 5MB
- Validação automática ao fazer upload
```

**Passo 3: Validação e Preview**
```
Tabela mostrando:
✅ Linhas válidas (serão importadas)
❌ Linhas com erro (com descrição do problema)

Erros comuns:
- Tag RFID já cadastrada
- Telefone inválido
- Nome muito curto
- Apartamento duplicado
- Formato incorreto
```

**Passo 4: Confirmação**
```
Resumo:
- X moradores serão importados
- Y linhas com erro (serão ignoradas)
- Opção de enviar mensagem de boas-vindas para todos

Botão: "Confirmar Importação"
```

**Passo 5: Progresso e Resultado**
```
Barra de progresso
"Importando 150 moradores..."

Ao concluir:
✅ 145 moradores importados com sucesso
❌ 5 linhas ignoradas (download do relatório de erros)

Ações:
- Ver moradores importados
- Baixar relatório de erros (.txt)
- Fazer nova importação
```

#### 4.2. Backend Endpoints

```typescript
// Novos endpoints:
GET /api/moradores/template/download
  // Retorna arquivo Excel template

POST /api/moradores/import/validate
  // Upload multipart/form-data
  // Valida arquivo sem salvar
  // Retorna preview com erros

POST /api/moradores/import/execute (ADMIN)
  // Upload multipart/form-data
  Body: {
    enviar_boas_vindas: boolean,
    sobrescrever_duplicados: boolean
  }
  // Executa importação
  // Retorna relatório de sucesso/erros

GET /api/moradores/import/historico (ADMIN)
  // Histórico de importações realizadas
```

### Bibliotecas Necessárias

**Backend:**
```bash
npm install xlsx csv-parser multer
npm install @types/multer --save-dev
```

**Frontend:**
```bash
npm install react-dropzone
```

### Tempo Estimado: 1 dia
- Backend: 4-5h
- Frontend: 3-4h

---

## 🔔 FEATURE #5: NOTIFICAÇÕES WHATSAPP AUTOMÁTICAS

### Objetivo
Enviar notificações automáticas via WhatsApp para moradores quando eventos ocorrerem nos carregadores.

### Funcionalidades

#### 5.1. Eventos que Disparam Notificações

**Evento 1: Início de Carregamento**
```
Quando: Carregador muda para status "Charging"
Para quem: Morador vinculado à tag RFID
Template: inicio_carregamento
Prioridade: Normal
```

**Evento 2: Fim de Carregamento**
```
Quando: Carregador volta para "Available" após "Charging"
Para quem: Morador que estava carregando
Template: fim_carregamento
Prioridade: Normal
Dados extras: duração, energia, custo
```

**Evento 3: Erro/Falha**
```
Quando: Carregador muda para status "Faulted"
Para quem: Morador que estava usando + Administração
Template: erro_carregamento
Prioridade: Alta
```

**Evento 4: Carregador Ocioso** (novo)
```
Quando: Carregador está em "SuspendedEV" por mais de 30 min
Para quem: Morador que está ocupando
Template: carregador_ocioso
Mensagem: Avisar para liberar a vaga se já terminou
Prioridade: Baixa
```

**Evento 5: Carregador Disponível** (opcional)
```
Quando: Carregador volta para "Available" após estar ocupado
Para quem: Lista de espera (se implementado na Fase 3)
Template: carregador_disponivel
Prioridade: Normal
```

#### 5.2. Sistema de Filas (Background Jobs)

**Arquitetura:**
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  WebSocket      │         │  Fila de        │         │  Worker         │
│  (CVE-Pro API)  │         │  Notificações   │         │  (Processador)  │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │ 1. Evento recebido        │                           │
         │ (status mudou)            │                           │
         ├──────────────────────────>│                           │
         │                           │ 2. Adicionar job         │
         │                           ├──────────────────────────>│
         │                           │                           │
         │                           │                           │ 3. Buscar template
         │                           │                           │ 4. Buscar morador
         │                           │                           │ 5. Renderizar msg
         │                           │                           │ 6. Enviar WhatsApp
         │                           │                           │
         │                           │<──────────────────────────┤
         │                           │ 7. Marcar como enviado    │
         │                           │                           │
```

**Implementação:**
```typescript
// Novo arquivo: src/services/NotificationQueueService.ts

interface NotificationJob {
  id: string;
  tipo: 'inicio' | 'fim' | 'erro' | 'ocioso' | 'disponivel';
  prioridade: 'alta' | 'normal' | 'baixa';
  morador_id: number;
  charger_uuid: string;
  dados_extras: any;
  tentativas: number;
  criado_em: Date;
  status: 'pendente' | 'enviado' | 'falha';
}

class NotificationQueueService {
  private queue: NotificationJob[] = [];
  private processing: boolean = false;
  
  async addToQueue(job: NotificationJob) {
    // Adicionar à fila com prioridade
  }
  
  async processQueue() {
    // Processar fila em background
    // Enviar via Evolution API
    // Atualizar status
    // Retry em caso de falha
  }
  
  async sendNotification(job: NotificationJob) {
    // Buscar template
    // Buscar morador
    // Renderizar mensagem
    // Enviar via Evolution API
    // Salvar log
  }
}
```

#### 5.3. Logs de Notificações

**Tabela no Banco:**
```sql
CREATE TABLE logs_notificacoes (
  id SERIAL PRIMARY KEY,
  morador_id INTEGER REFERENCES moradores(id),
  tipo VARCHAR(50) NOT NULL,
  template_id INTEGER REFERENCES templates_notificacao(id),
  mensagem_enviada TEXT NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL, -- enviado, falha, pendente
  tentativas INTEGER DEFAULT 0,
  erro TEXT,
  evolution_response JSON,
  enviado_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_morador ON logs_notificacoes(morador_id);
CREATE INDEX idx_logs_status ON logs_notificacoes(status);
CREATE INDEX idx_logs_data ON logs_notificacoes(enviado_em);
```

#### 5.4. Dashboard de Notificações (Admin)

```
URL: /notificacoes
Acesso: ADMIN only

Widgets:
- Total de notificações enviadas (hoje/semana/mês)
- Taxa de sucesso
- Tempo médio de envio
- Erros recentes

Tabela de Logs:
- Data/hora
- Morador
- Tipo de notificação
- Status (✅ enviado / ❌ falha / ⏳ pendente)
- Tentativas
- Ver detalhes (modal com mensagem completa)

Filtros:
- Por período
- Por morador
- Por tipo
- Por status
```

#### 5.5. Backend Endpoints

```typescript
// Novos endpoints:
GET /api/notificacoes/stats (ADMIN)
  ?periodo=hoje|semana|mes
  
GET /api/notificacoes/logs (ADMIN)
  ?limit=100
  &offset=0
  &morador_id=123
  &tipo=inicio
  &status=enviado
  &data_inicio=2026-01-01
  &data_fim=2026-01-31

GET /api/notificacoes/logs/:id (ADMIN)

POST /api/notificacoes/reenviar/:id (ADMIN)
  // Reenviar notificação que falhou

GET /api/notificacoes/fila (ADMIN)
  // Ver fila de notificações pendentes
  
DELETE /api/notificacoes/fila/:id (ADMIN)
  // Remover notificação da fila
```

### Bibliotecas Necessárias

**Backend:**
```bash
# Já temos:
# - axios (para Evolution API)
# - @stomp/stompjs (para WebSocket CVE-Pro)

# Novo (opcional, para filas robustas):
npm install bull redis
npm install @types/bull --save-dev
```

### Tempo Estimado: 1.5 dias
- Backend: 6-7h
- Frontend: 2-3h
- Testes de integração: 2-3h

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### Dia 1: Relatórios
- Manhã (4h): Backend - Endpoints de relatórios + filtros + export
- Tarde (4h): Frontend - Página de relatórios + gráficos

### Dia 2: CRUD Moradores
- Manhã (4h): Backend - Endpoints completos + validações
- Tarde (4h): Frontend - Modals + detalhes + ações em massa

### Dia 3: Templates + Import
- Manhã (2h): Templates WhatsApp (backend + frontend)
- Tarde (4h): Import CSV/Excel (backend + frontend)
- Noite (2h): Testes de integração

### Dia 4: Notificações Automáticas
- Manhã (4h): Sistema de filas + WebSocket listeners
- Tarde (3h): Integration com Evolution API
- Noite (1h): Dashboard de notificações

### Dia 5: Testes e Ajustes
- Manhã (3h): Testes end-to-end
- Tarde (3h): Ajustes finais + correção de bugs
- Noite (2h): Documentação das novas features

**TOTAL: ~40 horas (5 dias úteis)**

---

## 🎯 CRITÉRIOS DE CONCLUSÃO DA FASE 2

- [ ] Administrador consegue ver relatórios de carregamentos
- [ ] Possível exportar relatórios para PDF/Excel
- [ ] Gráficos de consumo funcionando
- [ ] CRUD completo de moradores funcionando
- [ ] Importação em massa via CSV/Excel operacional
- [ ] Templates de WhatsApp editáveis e com preview
- [ ] Notificações automáticas enviando corretamente
- [ ] Dashboard de notificações mostrando logs
- [ ] Sistema robusto com retry em caso de falha
- [ ] Testes realizados com dados reais Gran Marine
- [ ] Documentação atualizada

---

## 🔄 DEPENDÊNCIAS EXTERNAS

### Evolution API (WhatsApp)
- **Status:** ✅ Testado na Fase 1
- **Endpoint:** http://habbora-evolutionapi...
- **Instância:** Spresso Bot
- **Pronto para uso**

### CVE-Pro API WebSocket
- **Status:** ⏸️ Configurado mas não conectado
- **Precisa:** Implementar listeners de eventos
- **Tempo:** 2-3h

---

## 💰 VALOR ENTREGUE

### Para o Cliente (Gran Marine)
- ✅ Histórico completo de uso dos carregadores
- ✅ Gestão fácil de moradores
- ✅ Comunicação automática via WhatsApp
- ✅ Relatórios para cobrança/rateio
- ✅ Redução de suporte manual

### Para o Negócio (VETRIC)
- ✅ Sistema completo vendável
- ✅ Diferencial competitivo (notificações)
- ✅ Base para multi-tenant (Fase 4)
- ✅ Produto escalável

---

## 🚀 PRÓXIMOS PASSOS

Após a Fase 2, o sistema estará **100% operacional** para o cliente Gran Marine.

**Fase 3:** Segurança e Deploy (VPS/Cloud)
**Fase 4:** Escalabilidade (Multi-tenant)

---

**Criado por:** Sistema VETRIC  
**Data:** 12/01/2026  
**Versão:** 1.0.0


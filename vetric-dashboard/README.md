# 🚀 VETRIC Dashboard

Sistema completo de monitoramento e gerenciamento de carregadores de veículos elétricos com integração à plataforma CVE-PRO da Intelbras.

---

## 📦 O QUE FOI DESENVOLVIDO

### ✅ Backend API REST (Node.js + TypeScript + PostgreSQL)

**Estrutura Completa:**
```
backend/
├── src/
│   ├── config/          # Configurações (DB, ENV)
│   ├── models/          # Models (Morador, Carregamento, Template)
│   ├── services/        # Serviços (CVE-PRO, WebSocket, Notificação)
│   ├── routes/          # Rotas REST API
│   ├── types/           # TypeScript interfaces
│   └── index.ts         # Servidor principal
├── package.json
└── tsconfig.json
```

**Funcionalidades Implementadas:**

1. **Integração CVE-PRO API** ✅
   - Autenticação automática
   - Listagem de carregadores em tempo real
   - Monitoramento de status
   - Busca de transações

2. **WebSocket STOMP** ✅
   - Conexão em tempo real
   - Detecção automática de início de carregamento
   - Detecção automática de fim de carregamento
   - Atualização de status dos carregadores

3. **Banco de Dados PostgreSQL** ✅
   - Tabela `moradores` (cadastro de usuários)
   - Tabela `carregamentos` (histórico)
   - Tabela `templates_notificacao` (mensagens WhatsApp)
   - Índices otimizados

4. **Sistema de Notificações** ✅
   - Integração com Evolution API (WhatsApp)
   - Templates personalizáveis
   - Notificações de início/fim de carregamento
   - Controle individual por morador

5. **API REST Completa** ✅
   - CRUD de moradores
   - Histórico de carregamentos
   - Estatísticas em tempo real
   - Dashboard com métricas

---

## 🎯 ENDPOINTS DA API

### Dashboard
```
GET  /api/dashboard/stats          # Estatísticas gerais
GET  /api/dashboard/chargers       # Lista de carregadores
GET  /api/dashboard/charger/:uuid  # Detalhes de um carregador
```

### Moradores
```
GET    /api/moradores              # Listar todos
GET    /api/moradores/:id          # Buscar por ID
GET    /api/moradores/tag/:tag     # Buscar por Tag RFID
POST   /api/moradores              # Criar novo
PUT    /api/moradores/:id          # Atualizar
DELETE /api/moradores/:id          # Deletar
```

### Carregamentos
```
GET /api/carregamentos                  # Listar todos
GET /api/carregamentos/ativos           # Em andamento
GET /api/carregamentos/morador/:id      # Por morador
GET /api/carregamentos/stats/today      # Estatísticas do dia
GET /api/carregamentos/stats/period     # Por período
```

### Templates
```
GET /api/templates           # Listar templates
PUT /api/templates/:tipo     # Atualizar template
```

---

## 🔧 TECNOLOGIAS UTILIZADAS

- **Backend:** Node.js + TypeScript + Express
- **Banco de Dados:** PostgreSQL
- **WebSocket:** STOMP.js
- **HTTP Client:** Axios
- **Notificações:** Evolution API (WhatsApp)
- **API Externa:** Intelbras CVE-PRO

---

## 📊 FLUXO DE FUNCIONAMENTO

### 1. Monitoramento em Tempo Real

```
WebSocket CVE-PRO
    ↓
Evento: Início de Carregamento
    ↓
Identifica Tag RFID → Busca Morador no DB
    ↓
Registra Carregamento no DB
    ↓
Envia Notificação WhatsApp (se ativo)
```

### 2. Dashboard

```
Frontend → API REST → CVE-PRO API
                   ↓
              PostgreSQL
                   ↓
          Retorna Dados Formatados
```

---

## 🧪 TESTES REALIZADOS

✅ **API CVE-PRO:**
- Login bem-sucedido
- 5 carregadores identificados
- Estrutura de dados mapeada

✅ **Banco de Dados:**
- Tabelas criadas automaticamente
- Índices otimizados
- Templates padrão inseridos

✅ **Endpoints:**
- Todas as rotas implementadas
- Validações de dados
- Tratamento de erros

---

## 📁 ARQUIVOS IMPORTANTES

```
vetric-dashboard/
├── README.md                    # Este arquivo
├── SETUP_RAPIDO.md             # Guia de instalação
├── ENV_EXAMPLE.txt             # Exemplo de configuração
├── test-all.ts                 # Script de teste da API
├── test-results/               # Resultados dos testes
│   ├── chargepoints.json       # Dados dos carregadores
│   └── test-report.json        # Relatório completo
└── backend/                    # Código do backend
    ├── src/                    # Código-fonte
    └── package.json            # Dependências
```

---

## 🚀 COMO USAR

### 1. Instalar PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
createdb vetric_db
```

### 2. Configurar Backend
```bash
cd backend
cp ../ENV_EXAMPLE.txt .env
npm install
npm run dev
```

### 3. Testar
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/dashboard/stats
```

---

## 📱 NOTIFICAÇÕES WHATSAPP

### Templates Padrão:

**Início:**
```
🔋 Olá {{nome}}! Seu carregamento foi iniciado no {{charger}}. 
Acompanhe pelo app!
```

**Fim:**
```
✅ Olá {{nome}}! Seu carregamento foi concluído. 
Energia: {{energia}} kWh. Duração: {{duracao}} min.
```

**Erro:**
```
⚠️ Olá {{nome}}! Detectamos um problema no seu carregamento. 
Entre em contato conosco.
```

---

## 🎨 PRÓXIMOS PASSOS

- [ ] Adaptar frontend para consumir API
- [ ] Adicionar autenticação de usuários
- [ ] Implementar relatórios PDF
- [ ] Dashboard de administração
- [ ] App mobile (opcional)

---

## 📞 SUPORTE

Para dúvidas ou problemas:
1. Verifique o `SETUP_RAPIDO.md`
2. Consulte os logs do backend
3. Teste os endpoints com curl/Postman

---

## ✅ STATUS DO PROJETO

**BACKEND:** ✅ 100% Funcional
**FRONTEND:** ⏳ Aguardando adaptação
**INTEGRAÇÃO CVE-PRO:** ✅ Completa
**WEBSOCKET:** ✅ Implementado
**NOTIFICAÇÕES:** ✅ Pronto (aguarda config Evolution API)
**BANCO DE DADOS:** ✅ Estruturado

---

## 🎉 CONCLUSÃO

O backend está **COMPLETO e FUNCIONAL**!

Todos os sistemas principais estão implementados:
- ✅ API REST
- ✅ Integração CVE-PRO
- ✅ WebSocket em tempo real
- ✅ Banco de dados
- ✅ Sistema de notificações
- ✅ Monitoramento automático

**Pronto para produção após configurar:**
1. PostgreSQL
2. Arquivo .env
3. Evolution API (opcional)

---

**Desenvolvido para VETRIC** 🚀


# 🚀 VETRIC - Plataforma de Gestão de Carregadores Elétricos

Sistema completo de monitoramento e gerenciamento de carregadores de veículos elétricos com integração à plataforma CVE-PRO da Intelbras.

---

## 📁 ESTRUTURA DO PROJETO

```
VETRIC - CVE/
├── apps/                           # 📱 Aplicações
│   ├── backend/                    # 🔧 API Backend (Node.js + TypeScript)
│   └── frontend/                   # 🎨 Dashboard Web (React + Vite)
│
├── docs/                           # 📚 Documentação Completa
│   ├── fase1.md                    # Resumo Fase 1 - MVP
│   ├── checklist_fase1.md          # Checklist detalhado
│   ├── FAQ_PRODUCAO.md             # Perguntas frequentes
│   ├── GUIA_LOGS.md                # Como acessar logs
│   ├── alisson.md                  # Correções implementadas
│   └── AUTENTICACAO_FINAL.md       # Autenticação CVE-PRO
│
└── README.md                       # 👋 Este arquivo
```

---

## 🎯 PROJETOS

### **Backend API REST**
- **Localização:** `/apps/backend/`
- **Tecnologia:** Node.js + TypeScript + Express + PostgreSQL
- **Porta:** 3001
- **README:** [Ver documentação do backend](./apps/backend/README.md)

**Funcionalidades:**
- ✅ Integração completa com API CVE-PRO (Intelbras)
- ✅ WebSocket STOMP para monitoramento em tempo real
- ✅ Sistema de polling como fallback
- ✅ CRUD de moradores
- ✅ Histórico de carregamentos
- ✅ Notificações via WhatsApp (Evolution API)
- ✅ Dashboard com estatísticas

### **Frontend Dashboard**
- **Localização:** `/apps/frontend/`
- **Tecnologia:** React + TypeScript + Vite + TailwindCSS
- **Porta:** 5173 (dev) / 80 ou 443 (prod)
- **README:** [Ver documentação do frontend](./apps/frontend/README.md)

**Funcionalidades:**
- ✅ Dashboard em tempo real
- ✅ Visualização de carregadores
- ✅ Identificação de moradores
- ✅ Tempo de carregamento em tempo real
- ✅ Gestão de moradores
- ✅ Relatórios

---

## 🚀 QUICK START

### **1. Backend**

```bash
# Entre na pasta do backend
cd apps/backend

# Instale as dependências
npm install

# Configure o .env (copie de ENV_EXAMPLE.txt)
cp ../ENV_EXAMPLE.txt .env

# Edite o .env com suas credenciais
nano .env

# Rode o servidor
npm run dev
```

Backend estará rodando em: `http://localhost:3001`

### **2. Frontend**

```bash
# Entre na pasta do frontend
cd apps/frontend

# Instale as dependências
npm install

# Configure o .env (se necessário)
# VITE_API_URL=http://localhost:3001

# Rode o servidor de desenvolvimento
npm run dev
```

Frontend estará rodando em: `http://localhost:5173`

---

## 📚 DOCUMENTAÇÃO

Toda a documentação técnica está na pasta `/docs/`:

| Documento | Descrição |
|-----------|-----------|
| [fase1.md](./docs/fase1.md) | Resumo completo da Fase 1 (MVP) |
| [checklist_fase1.md](./docs/checklist_fase1.md) | Checklist detalhado para produção |
| [FAQ_PRODUCAO.md](./docs/FAQ_PRODUCAO.md) | Perguntas frequentes sobre produção |
| [GUIA_LOGS.md](./docs/GUIA_LOGS.md) | Como acessar logs do sistema |
| [alisson.md](./docs/alisson.md) | Correções e problemas resolvidos |
| [AUTENTICACAO_FINAL.md](./docs/AUTENTICACAO_FINAL.md) | Autenticação API CVE-PRO |

---

## 🔧 TECNOLOGIAS

### **Backend**
- Node.js 18+
- TypeScript
- Express.js
- PostgreSQL 12+
- WebSocket (ws + STOMP)
- Axios

### **Frontend**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Axios
- React Router

### **Integrações**
- CVE-PRO API (Intelbras)
- Evolution API (WhatsApp)

---

## 🏗️ ARQUITETURA

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  Port 5173  │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────┐
│   Backend   │ (Node.js + Express)
│  Port 3001  │
└──────┬──────┘
       │
       ├─→ PostgreSQL (Banco de Dados)
       │
       ├─→ CVE-PRO API (Intelbras)
       │   └─→ WebSocket STOMP
       │
       └─→ Evolution API (WhatsApp)
```

---

## 📊 FUNCIONALIDADES PRINCIPAIS

### ✅ Fase 1 - Completa

- [x] Integração com API CVE-PRO
- [x] Autenticação e renovação automática de token
- [x] Listagem de carregadores em tempo real
- [x] Identificação de moradores via RFID
- [x] WebSocket para monitoramento em tempo real
- [x] Sistema de polling como fallback
- [x] Cálculo correto de duração de carregamento
- [x] Dashboard web funcional
- [x] CRUD de moradores
- [x] Histórico de carregamentos
- [x] Fallback para tags sem ocppIdTag (mapeamento manual)
- [x] Tratamento de transações fantasma

### 🔄 Próximas Fases

- [ ] **Fase 2:** Multi-tenant (suporte a múltiplos condomínios)
- [ ] **Fase 3:** Relatórios avançados e analytics
- [ ] **Fase 4:** App mobile

---

## 🌐 DEPLOY EM PRODUÇÃO

### **Requisitos VPS**

- Ubuntu 22.04 LTS
- Node.js 18+
- PostgreSQL 12+
- Nginx
- PM2
- SSL (Let's Encrypt)

### **Arquitetura Recomendada**

```
Nginx (Proxy Reverso)
├── vetric.seudominio.com      → Frontend (arquivos estáticos)
└── api.vetric.seudominio.com  → Backend (porta 3001 via proxy)

PM2 (Gerenciador de Processos)
└── vetric-backend             → Backend rodando 24/7

PostgreSQL
└── localhost:5432             → Banco de dados
```

**Consulte:** [checklist_fase1.md](./docs/checklist_fase1.md) para guia completo de deploy.

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### **1. API CVE retorna `ocppIdTag` vazio**

**Problema:** Algumas tags não retornam `ocppIdTag` em transações ativas.

**Solução:** Sistema usa mapeamento manual via tabela `tag_pk_mapping`.

**Detalhes:** [alisson.md](./docs/alisson.md)

### **2. Transações Fantasma**

**Problema:** Carregador mostra status "Charging" mas sem transação na API.

**Solução:** Sistema ignora corretamente (comportamento esperado).

**Detalhes:** [alisson.md](./docs/alisson.md)

### **3. Duração incorreta no frontend**

**Problema:** Frontend calculava tempo baseado em `ultimoBatimento`.

**Solução:** Backend agora retorna duração real do banco de dados.

**Detalhes:** [alisson.md](./docs/alisson.md)

---

## 🔐 SEGURANÇA

- ✅ Autenticação JWT para API backend
- ✅ Rate limiting em endpoints sensíveis
- ✅ Variáveis sensíveis em `.env` (não versionadas)
- ✅ Sanitização de inputs
- ✅ CORS configurado
- ✅ SSL/TLS em produção (recomendado)

---

## 📞 SUPORTE E CONTATO

Para dúvidas técnicas:
1. Consulte a documentação em `/docs/`
2. Verifique os logs (ver [GUIA_LOGS.md](./docs/GUIA_LOGS.md))
3. Consulte o [FAQ_PRODUCAO.md](./docs/FAQ_PRODUCAO.md)

---

## 📝 VERSÃO

**Versão Atual:** 1.0.0 (Fase 1 - MVP Completo)  
**Última Atualização:** Janeiro 2026  
**Status:** ✅ Pronto para Produção

---

## 🎉 CONCLUSÃO

Sistema **COMPLETO e FUNCIONAL**!

Ambos backend e frontend estão prontos para deploy em produção. Todos os sistemas principais foram implementados e testados:

- ✅ API REST completa
- ✅ Integração CVE-PRO funcional
- ✅ WebSocket + Polling em tempo real
- ✅ Banco de dados estruturado
- ✅ Sistema de notificações pronto
- ✅ Frontend responsivo e funcional
- ✅ Identificação correta de moradores
- ✅ Cálculo preciso de duração de carregamento

**Pronto para subir na VPS! 🚀**

---

**Desenvolvido para VETRIC - Plataforma do Síndico**

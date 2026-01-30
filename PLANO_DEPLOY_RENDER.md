# 🚀 PLANO COMPLETO - Deploy VETRIC no Render

**Data:** 16 de Janeiro de 2026  
**Status:** ⏳ Aguardando sua aprovação

---

## ✅ SITUAÇÃO ATUAL

- ✅ Você criou conta no Render
- ✅ MCP do Render configurado no Cursor
- ⏳ Aguardando configuração e deploy

---

## 📋 O QUE VOU FAZER (PASSO A PASSO)

### **FASE 1: VERIFICAÇÃO E PREPARAÇÃO** (5 minutos)

#### **Passo 1.1: Verificar estrutura do seu código**
```
□ Ler apps/backend/package.json
□ Ler apps/frontend/package.json
□ Verificar scripts de build
□ Confirmar estrutura de pastas
□ Verificar .gitignore
```

#### **Passo 1.2: Verificar seu repositório GitHub**
```
□ Confirmar se código está no GitHub
□ Verificar branch principal (main/master)
□ Confirmar acesso público/privado
```

**❓ Pergunta para você:**
- Seu código já está no GitHub? Qual o repositório?

---

### **FASE 2: CRIAR BANCO DE DADOS POSTGRESQL** (2 minutos)

#### **Passo 2.1: Criar PostgreSQL no Render**
```
Vou criar:
Nome: vetric-database
Plano: Starter (256MB RAM, 1GB storage)
Região: Oregon (mais próxima)
Versão: PostgreSQL 15

Render vai fornecer automaticamente:
✅ DATABASE_URL (conexão completa)
✅ PGHOST
✅ PGPORT
✅ PGDATABASE
✅ PGUSER
✅ PGPASSWORD
```

#### **Passo 2.2: Configurar backup automático**
```
✅ Backup diário automático
✅ Retenção: 7 dias
✅ Recovery point: 1 hora
```

**❓ Confirmação necessária:**
- OK criar banco PostgreSQL Starter (US$ 7/mês incluído no backend)?

---

### **FASE 3: CRIAR BACKEND (Web Service)** (5 minutos)

#### **Passo 3.1: Configurar serviço backend**
```
Vou criar:
Nome: vetric-backend
Tipo: Web Service
Repositório: [SEU_REPOSITORIO_GITHUB]
Branch: main
Root Directory: apps/backend

Build Command: npm install && npm run build
Start Command: npm start
Runtime: Node
```

#### **Passo 3.2: Adicionar variáveis de ambiente**
```
Vou configurar automaticamente:

# Banco de dados (Render fornece)
DATABASE_URL=${DATABASE_URL}

# CVE-Pro API (suas credenciais)
CVE_API_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_API_KEY=808c0fb3-dc7f-40f5-b294-807f21fc8947
CVE_USERNAME=julio@mundologic.com.br
CVE_PASSWORD=1a2b3c4d

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me
EVOLUTION_API_KEY=t1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==
EVOLUTION_INSTANCE=Vetric Bot

# JWT
JWT_SECRET=vetric-production-secret-2026-render
JWT_EXPIRES_IN=24h

# Ambiente
NODE_ENV=production
PORT=3001
```

#### **Passo 3.3: Configurar health check**
```
Health Check Path: /health
Timeout: 30 segundos
```

**❓ Confirmação necessária:**
- As credenciais CVE-Pro e Evolution API estão corretas?
- Quer que eu gere um JWT_SECRET aleatório mais seguro?

---

### **FASE 4: CRIAR FRONTEND (Static Site)** (3 minutos)

#### **Passo 4.1: Configurar serviço frontend**
```
Vou criar:
Nome: vetric-frontend
Tipo: Static Site
Repositório: [SEU_REPOSITORIO_GITHUB]
Branch: main
Root Directory: apps/frontend

Build Command: npm install && npm run build
Publish Directory: dist
```

#### **Passo 4.2: Adicionar variável de ambiente**
```
VITE_API_URL=https://vetric-backend.onrender.com

(Vou ajustar após backend estar no ar)
```

---

### **FASE 5: MIGRAÇÃO DO BANCO DE DADOS** (10 minutos)

#### **Passo 5.1: Exportar dados do PostgreSQL local**
```
Vou criar script que:
□ Exporta estrutura das tabelas
□ Exporta dados de:
  - usuarios (2 usuários)
  - moradores (59 moradores)
  - templates_notificacao (5 templates)
  - configuracoes_sistema
  - relatorios (se houver)
```

#### **Passo 5.2: Importar para Render**
```
□ Criar tabelas no banco Render
□ Importar dados
□ Verificar integridade
```

**❓ Pergunta para você:**
- Seu PostgreSQL local está rodando agora?
- Posso executar comandos para exportar os dados?

---

### **FASE 6: TESTES COMPLETOS** (15 minutos)

#### **Passo 6.1: Testar backend**
```
□ Backend está online?
□ Health check respondendo?
□ Banco de dados conectado?
□ API CVE-Pro funcionando?
□ Evolution API funcionando?
```

#### **Passo 6.2: Testar frontend**
```
□ Frontend carregando?
□ Conectando com backend?
□ Login funcionando?
```

#### **Passo 6.3: Testes funcionais completos**
```
□ Login com admin@vetric.com.br
□ Dashboard carregando
□ Carregadores aparecendo
□ Status em tempo real
□ Listar moradores
□ Criar/editar morador
□ Templates WhatsApp
□ Configurações Evolution API
□ Upload de relatório (teste)
```

---

### **FASE 7: DOCUMENTAÇÃO** (5 minutos)

#### **Passo 7.1: Criar guia de manutenção**
```
Vou criar documentos:
□ DEPLOY_RENDER_COMPLETO.md (como foi feito)
□ MANUTENCAO_RENDER.md (como atualizar)
□ TROUBLESHOOTING_RENDER.md (resolver problemas)
□ URLs_PRODUCAO.md (links e acessos)
```

#### **Passo 7.2: Configurar deploy automático**
```
Render vai automaticamente:
✅ Monitorar branch main no GitHub
✅ Fazer build e deploy a cada push
✅ Notificar você por email
```

---

## 🔧 MODIFICAÇÕES NO CÓDIGO (SE NECESSÁRIO)

### **Provavelmente NÃO precisaremos modificar nada!**

Mas se for necessário, pode ser:

#### **apps/backend/src/config/database.ts**
```typescript
// Se seu código não suporta DATABASE_URL ainda:

// ANTES (apenas):
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
});

// DEPOIS (com suporte a DATABASE_URL):
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dialect: 'postgres',
    });
```

**Vou verificar seu código antes de modificar!**

---

## 📊 RESULTADO FINAL

Após completar todos os passos, você terá:

```
┌──────────────────────────────────────────────┐
│  SISTEMA VETRIC NO AR                        │
│                                               │
│  Frontend:                                   │
│  https://vetric-frontend.onrender.com        │
│  ✅ Interface completa                       │
│  ✅ Login funcionando                        │
│  ✅ Dashboard em tempo real                  │
│                                               │
│  Backend:                                    │
│  https://vetric-backend.onrender.com         │
│  ✅ API REST completa                        │
│  ✅ WebSocket ativo                          │
│  ✅ Polling CVE-Pro                          │
│  ✅ Notificações WhatsApp                    │
│                                               │
│  Banco de Dados:                             │
│  PostgreSQL no Render                        │
│  ✅ Dados migrados                           │
│  ✅ Backup automático                        │
│                                               │
│  Deploy Automático:                          │
│  ✅ Git push → Deploy automático             │
│  ✅ Rollback com 1 clique                    │
└──────────────────────────────────────────────┘
```

---

## 💰 CUSTO MENSAL

```
Backend Web Service:    US$ 7/mês
PostgreSQL Starter:     Incluído ↑
Frontend Static Site:   GRÁTIS

TOTAL: US$ 7/mês
```

---

## ⏱️ TEMPO ESTIMADO

```
Fase 1 (Verificação):      5 minutos
Fase 2 (PostgreSQL):       2 minutos
Fase 3 (Backend):          5 minutos
Fase 4 (Frontend):         3 minutos
Fase 5 (Migração dados):   10 minutos
Fase 6 (Testes):          15 minutos
Fase 7 (Documentação):     5 minutos

TOTAL: ~45 minutos
(Você só acompanha e aprova)
```

---

## ❓ INFORMAÇÕES QUE PRECISO DE VOCÊ

Antes de começar, preciso confirmar:

### **1. Repositório GitHub:**
```
□ Seu código está no GitHub?
□ Qual a URL do repositório?
□ Repositório é público ou privado?
□ Branch principal: main ou master?
```

### **2. Banco de Dados Local:**
```
□ PostgreSQL local está rodando?
□ Posso executar comandos para exportar?
□ Credenciais do banco local:
  - Host: localhost
  - Port: 5432
  - Database: vetric_db
  - User: postgres
  - Password: postgres
  (Estão corretas?)
```

### **3. Credenciais (confirmar):**
```
CVE-Pro API:
□ URL: https://cs.intelbras-cve-pro.com.br
□ API Key: 808c0fb3-dc7f-40f5-b294-807f21fc8947
□ Email: julio@mundologic.com.br
□ Senha: 1a2b3c4d

Evolution API:
□ URL: http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me
□ API Key: t1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==
□ Instância: Vetric Bot

(Estão corretas?)
```

### **4. Acesso ao Render:**
```
□ Você está logado na conta Render?
□ Posso usar o MCP para criar recursos?
□ Pode autorizar cobranças (US$ 7/mês)?
```

---

## ✅ CHECKLIST ANTES DE COMEÇAR

Marque o que já está pronto:

```
□ Conta Render criada
□ MCP Render configurado no Cursor
□ Código no GitHub
□ PostgreSQL local rodando
□ Credenciais confirmadas
□ Aprovação para criar recursos
□ Aprovação para cobranças (US$ 7/mês)
```

---

## 🚦 APROVAÇÃO NECESSÁRIA

### **Você aprova que eu:**

```
□ Crie banco PostgreSQL no Render (US$ 7/mês incluído)
□ Crie serviço backend no Render
□ Crie serviço frontend no Render
□ Conecte ao seu repositório GitHub
□ Configure variáveis de ambiente
□ Migre dados do PostgreSQL local
□ Faça deploy automático
□ Crie documentação completa
```

---

## 📞 PRÓXIMOS PASSOS

### **Me responda:**

1. ✅ **Repositório GitHub:** Qual a URL?
2. ✅ **Banco local:** Posso exportar dados?
3. ✅ **Credenciais:** Confirmadas acima?
4. ✅ **Aprovação:** Pode criar recursos no Render?

### **Quando você confirmar:**

```
1. Verifico estrutura do código
2. Crio PostgreSQL no Render
3. Crio backend no Render
4. Crio frontend no Render
5. Migro dados
6. Testo tudo
7. Documento
8. Ensino você a manter

RESULTADO: Sistema no ar! 🚀
```

---

## 🛡️ SEGURANÇA

```
✅ Credenciais só em variáveis de ambiente
✅ Não vou commitar nada no GitHub
✅ Banco de dados com SSL
✅ HTTPS automático
✅ Backup automático diário
```

---

## 🔄 ROLLBACK

Se algo der errado:

```
✅ 1 clique para voltar versão anterior
✅ Backup do banco disponível
✅ Código local intacto
✅ Zero risco de perda de dados
```

---

## 💡 OBSERVAÇÕES

1. **NÃO vou mexer** no seu código local
2. **NÃO vou commitar** nada sem sua aprovação
3. **NÃO vou deletar** nada
4. **VOU documentar** cada passo
5. **VOU testar** tudo antes de finalizar

---

**Aguardando suas respostas para começar! 🚀**

**VETRIC - Pronto para Deploy no Render**

---

**Preparado por:** AI Assistant  
**Para:** Julio Cesar Souza  
**Data:** 16/01/2026


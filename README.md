# 🚗⚡ VETRIC - Plataforma de Gestão de Carregadores EV

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

Sistema completo de gerenciamento de carregadores de veículos elétricos com integração WhatsApp, dashboards administrativos e monitoramento em tempo real.

---

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Deploy em VPS](#deploy-em-vps)
- [Uso](#uso)
- [Atualizações](#atualizações)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

**VETRIC** é uma plataforma completa para gestão de carregadores de veículos elétricos, desenvolvida especialmente para condomínios residenciais. O sistema integra-se com a API CVE-Pro (Intelbras) e oferece notificações automáticas via WhatsApp através da Evolution API.

### Caso de Uso Atual: Gran Marine Residence

O sistema está configurado para gerenciar **5 carregadores EV** do condomínio Gran Marine, com:

- ✅ **2 usuários fixos**: Admin VETRIC e Cliente Gran Marine
- ✅ **Gestão de moradores** com tags RFID
- ✅ **Notificações WhatsApp** automáticas
- ✅ **Upload de relatórios** PDF/Excel
- ✅ **Dashboard em tempo real** com WebSocket
- ✅ **Controle de acesso** baseado em roles (ADMIN/CLIENTE)

---

## ⚡ Funcionalidades

### 👨‍💼 Admin VETRIC

- ✅ CRUD completo de moradores
- ✅ Upload e gestão de relatórios mensais
- ✅ Configuração e teste de WhatsApp
- ✅ Importação em lote de tags RFID (CSV/Excel)
- ✅ Edição de templates de mensagens
- ✅ Dashboard com métricas e carregamentos ativos
- ✅ Monitoramento em tempo real (WebSocket)

### 🏢 Cliente (Gran Marine)

- ✅ Dashboard read-only com status dos carregadores
- ✅ Lista de moradores (visualização apenas)
- ✅ Download de relatórios mensais
- ✅ Acesso via login próprio

---

## 🛠️ Tecnologias

### Backend

- **Node.js** 18+ com TypeScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **Sequelize** - ORM
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **WebSocket (STOMP)** - Monitoramento em tempo real
- **PM2** - Process manager para produção
- **Helmet** - Headers de segurança
- **Rate Limiting** - Proteção contra DDoS

### Integrações

- **CVE-Pro API** (Intelbras) - Gestão de carregadores
- **Evolution API** - Envio de WhatsApp

### DevOps

- **Git/GitHub** - Versionamento
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL/HTTPS
- **PM2** - Gerenciamento de processos
- **UFW** - Firewall

---

## 📁 Estrutura do Projeto

```
Plataforma_Vetric/
├── vetric-dashboard/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/          # Configurações (DB, Env)
│   │   │   ├── middleware/      # Auth, validações
│   │   │   ├── models/          # Models Sequelize
│   │   │   ├── routes/          # Rotas da API
│   │   │   ├── services/        # Lógica de negócio
│   │   │   ├── seeds/           # Dados iniciais
│   │   │   └── index.ts         # Entry point
│   │   ├── uploads/             # Arquivos uploadados
│   │   ├── logs/                # Logs da aplicação
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/                # Frontend (TODO)
│   └── ecosystem.config.js      # Configuração PM2
├── scripts/
│   ├── deploy.sh                # Deploy automático
│   ├── backup.sh                # Backup banco e uploads
│   └── rollback.sh              # Reverter deploy
├── backups/                     # Backups automáticos
├── .gitignore
├── .env.example
├── DEPLOY.md                    # Guia de deploy VPS
└── README.md                    # Este arquivo
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 12+ ([Download](https://www.postgresql.org/download/))
- Git ([Download](https://git-scm.com/))

### 1. Clonar repositório

```bash
git clone https://github.com/jcsouza84/Plataforma_Vetric.git
cd Plataforma_Vetric
```

### 2. Instalar dependências

```bash
cd vetric-dashboard/backend
npm install
```

### 3. Configurar banco de dados

```bash
# Entrar no PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE vetric_db;
CREATE USER vetric_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE vetric_db TO vetric_user;
```

### 4. Configurar variáveis de ambiente

```bash
# Copiar .env.example
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

### 5. Inicializar banco e seeds

```bash
npm run db:init
```

### 6. Build do TypeScript

```bash
npm run build
```

### 7. Iniciar servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

Acesse: `http://localhost:3001`

---

## ⚙️ Configuração

### Arquivo `.env`

Copie o `.env.example` e preencha os valores:

```bash
# Ambiente
NODE_ENV=development
PORT=3001

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vetric_db
DB_USER=vetric_user
DB_PASSWORD=sua_senha_aqui

# JWT (Gerar: openssl rand -base64 32)
JWT_SECRET=sua_chave_secreta_min_32_chars
JWT_EXPIRES_IN=24h

# CVE-Pro API
CVE_API_KEY=sua_api_key
CVE_USERNAME=seu_usuario
CVE_PASSWORD=sua_senha

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://evolution.seudominio.com.br
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_INSTANCE=vetric-granmarine
```

### Usuários Padrão

O sistema cria 2 usuários automaticamente:

| Email | Senha | Role | Acesso |
|-------|-------|------|--------|
| `admin@vetric.com.br` | `Vetric@2026` | ADMIN | Acesso total (CRUD) |
| `granmarine@vetric.com.br` | `GranMarine@2026` | CLIENTE | Read-only |

---

## 🌐 Deploy em VPS

Para fazer o deploy em produção, siga o guia completo:

📖 **[DEPLOY.md](./DEPLOY.md)** - Guia completo de deploy em VPS

### Quick Start (Deploy)

```bash
# Na VPS (Ubuntu 20.04+)
# 1. Instalar dependências
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# 2. Clonar projeto
git clone https://github.com/jcsouza84/Plataforma_Vetric.git
cd Plataforma_Vetric/vetric-dashboard/backend

# 3. Configurar .env (seguir DEPLOY.md)
cp .env.example .env
nano .env

# 4. Build e iniciar
npm install --production
npm run build
pm2 start ../../ecosystem.config.js --env production

# 5. Configurar SSL e Nginx (seguir DEPLOY.md)
```

---

## 📖 Uso

### API Endpoints

#### Autenticação

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@vetric.com.br",
  "senha": "Vetric@2026"
}

# Obter usuário atual
GET /api/auth/me
Authorization: Bearer {token}
```

#### Moradores

```bash
# Listar moradores (ADMIN + CLIENTE)
GET /api/moradores
Authorization: Bearer {token}

# Criar morador (ADMIN only)
POST /api/moradores
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva",
  "apartamento": "101",
  "telefone": "11999999999",
  "tag_rfid": "ABC123",
  "notificacoes_ativas": true
}
```

#### Relatórios

```bash
# Upload de relatório (ADMIN only)
POST /api/relatorios/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

titulo: Relatório Janeiro 2026
mes: 1
ano: 2026
arquivo: [PDF file]

# Listar relatórios (ADMIN + CLIENTE)
GET /api/relatorios
Authorization: Bearer {token}

# Download (ADMIN + CLIENTE)
GET /api/relatorios/:id/download
Authorization: Bearer {token}
```

#### Dashboard

```bash
# Estatísticas gerais
GET /api/dashboard/stats
Authorization: Bearer {token}

# Status dos carregadores
GET /api/dashboard/chargers
Authorization: Bearer {token}
```

---

## 🔄 Atualizações

### No Desenvolvimento (Local - Cursor)

```bash
# 1. Fazer mudanças no código

# 2. Commit e push
git add .
git commit -m "feat: adiciona funcionalidade X"
git push origin main
```

### Na Produção (VPS)

```bash
# OPÇÃO 1: Script automático (recomendado)
cd /home/deploy/Plataforma_Vetric
./scripts/deploy.sh

# OPÇÃO 2: Manual
git pull origin main
cd vetric-dashboard/backend
npm install --production
npm run build
pm2 reload vetric-api
```

### Rollback (em caso de erro)

```bash
# Voltar para versão anterior
./scripts/rollback.sh

# Voltar 3 commits
./scripts/rollback.sh 3
```

---

## 📊 Monitoramento

### PM2

```bash
# Status
pm2 status

# Logs em tempo real
pm2 logs vetric-api

# Monitoramento
pm2 monit
```

### Logs

```bash
# Backend
tail -f vetric-dashboard/backend/logs/combined.log

# Nginx
sudo tail -f /var/log/nginx/vetric-api-access.log
```

---

## 🔐 Segurança

O sistema implementa múltiplas camadas de segurança:

- ✅ **Helmet.js** - Headers HTTP seguros
- ✅ **Rate Limiting** - Proteção contra DDoS
- ✅ **CORS** configurado - Controle de origem
- ✅ **JWT** com expiração - Autenticação segura
- ✅ **bcrypt** - Hash de senhas
- ✅ **express-validator** - Validação de inputs
- ✅ **HTTPS/SSL** - Criptografia em produção
- ✅ **Firewall (UFW)** - Apenas portas necessárias

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato

**VETRIC** - Sistema de Gestão de Carregadores EV

- GitHub: [@jcsouza84](https://github.com/jcsouza84)
- Repositório: [Plataforma_Vetric](https://github.com/jcsouza84/Plataforma_Vetric)

---

## 🎯 Roadmap

### ✅ Fase 1 - Concluída
- [x] Autenticação JWT com roles
- [x] CRUD de moradores
- [x] Upload de relatórios
- [x] Integração CVE-Pro
- [x] WebSocket para monitoramento

### ✅ Fase 2 - Concluída
- [x] Integração Evolution API (WhatsApp)
- [x] Notificações automáticas
- [x] Templates de mensagens

### 🚧 Fase 3 - Em Andamento
- [ ] Frontend Admin (React + Vite)
- [ ] Frontend Cliente (React + Vite)
- [ ] Deploy em VPS
- [ ] SSL/HTTPS

### 📅 Fase 4 - Planejada
- [ ] Importação de tags em lote (CSV/Excel)
- [ ] Relatórios automatizados
- [ ] Dashboard avançado com gráficos
- [ ] App mobile (React Native)

---

**Desenvolvido com ❤️ pela equipe VETRIC**

🚗⚡ *Facilitando a transição para veículos elétricos!*

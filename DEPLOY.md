# 🚀 VETRIC - Guia de Deploy em VPS

Este documento contém **todas as instruções** para fazer o deploy da aplicação VETRIC em uma VPS (Virtual Private Server).

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação da VPS](#preparação-da-vps)
3. [Instalação de Dependências](#instalação-de-dependências)
4. [Configuração do PostgreSQL](#configuração-do-postgresql)
5. [Clone e Configuração do Projeto](#clone-e-configuração-do-projeto)
6. [Configuração do PM2](#configuração-do-pm2)
7. [Configuração do Nginx (Reverse Proxy)](#configuração-do-nginx)
8. [Configuração de SSL (Let's Encrypt)](#configuração-de-ssl)
9. [Deploy e Testes](#deploy-e-testes)
10. [Atualizações Futuras](#atualizações-futuras)
11. [Monitoramento e Logs](#monitoramento-e-logs)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### O que você precisa:

- ✅ VPS com Ubuntu 20.04+ ou Debian 11+
- ✅ Acesso SSH root (ou sudo)
- ✅ Domínio configurado (DNS apontando para o IP da VPS)
- ✅ Mínimo de recursos:
  - 2 GB RAM
  - 2 vCPUs
  - 25 GB SSD

### Domínios necessários (apontar DNS para IP da VPS):

```
api.vetric.com.br          → Backend API
admin.vetric.com.br        → Frontend Admin
granmarine.vetric.com.br   → Frontend Cliente
```

---

## 🔧 Preparação da VPS

### 1. Conectar na VPS

```bash
ssh root@SEU_IP_VPS
```

### 2. Atualizar sistema

```bash
apt update && apt upgrade -y
```

### 3. Criar usuário deploy (BOA PRÁTICA)

```bash
# Criar usuário
adduser deploy

# Adicionar ao grupo sudo
usermod -aG sudo deploy

# Permitir sudo sem senha (opcional)
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Logar como usuário deploy
su - deploy
```

### 4. Configurar Firewall (UFW)

```bash
# Instalar UFW
sudo apt install ufw -y

# Permitir SSH
sudo ufw allow OpenSSH

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

---

## 📦 Instalação de Dependências

### 1. Node.js (v18+)

```bash
# Adicionar repositório Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js e npm
sudo apt install -y nodejs

# Verificar versões
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 2. PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar status
sudo systemctl status postgresql

# Iniciar (se não estiver rodando)
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

### 4. Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### 5. Certbot (SSL)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 6. Git

```bash
# Instalar Git
sudo apt install git -y

# Configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## 🗄️ Configuração do PostgreSQL

### 1. Criar banco de dados e usuário

```bash
# Entrar no PostgreSQL como usuário postgres
sudo -u postgres psql

# Executar comandos SQL:
```

```sql
-- Criar usuário
CREATE USER vetric_user WITH PASSWORD 'SENHA_FORTE_AQUI';

-- Criar banco de dados
CREATE DATABASE vetric_db OWNER vetric_user;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE vetric_db TO vetric_user;

-- Sair
\q
```

### 2. Configurar acesso remoto (se necessário)

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Encontrar e alterar:
# listen_addresses = 'localhost'  →  listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Adicionar ao final:
# host    vetric_db    vetric_user    0.0.0.0/0    md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 3. Testar conexão

```bash
psql -U vetric_user -d vetric_db -h localhost
# Digitar senha quando solicitado
```

---

## 📥 Clone e Configuração do Projeto

### 1. Clonar repositório

```bash
# Navegar para home do usuário deploy
cd /home/deploy

# Clonar repositório
git clone https://github.com/jcsouza84/Plataforma_Vetric.git

# Entrar na pasta
cd Plataforma_Vetric
```

### 2. Configurar Backend

```bash
# Navegar para o backend
cd vetric-dashboard/backend

# Instalar dependências
npm install --production

# Criar arquivo .env (copiar do .env.example)
cp .env.example .env
nano .env
```

### 3. Preencher arquivo `.env`:

```bash
# ═══════════════════════════════════════════════════════════
# VETRIC - Configuração de Produção
# ═══════════════════════════════════════════════════════════

NODE_ENV=production
PORT=5000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vetric_db
DB_USER=vetric_user
DB_PASSWORD=SENHA_FORTE_AQUI

# JWT (Gerar: openssl rand -base64 32)
JWT_SECRET=SUA_CHAVE_SECRETA_AQUI_MIN_32_CHARS
JWT_EXPIRES_IN=24h

# CVE-Pro API
CVE_API_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_API_KEY=SUA_API_KEY_CVE
CVE_USERNAME=SEU_USUARIO_CVE
CVE_PASSWORD=SUA_SENHA_CVE

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://evolution.seudominio.com.br
EVOLUTION_API_KEY=SUA_API_KEY_EVOLUTION
EVOLUTION_INSTANCE=vetric-granmarine

# Frontend URLs (para CORS)
FRONTEND_URL=https://admin.vetric.com.br
ADMIN_URL=https://admin.vetric.com.br
CLIENT_URL=https://granmarine.vetric.com.br

# Segurança
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE_MB=10
LOG_LEVEL=info
```

### 4. Gerar chave JWT forte

```bash
# Gerar chave aleatória
openssl rand -base64 32

# Copiar e colar no .env em JWT_SECRET
```

### 5. Build do TypeScript

```bash
# Compilar TypeScript
npm run build

# Verificar se foi criado a pasta dist/
ls -la dist/
```

### 6. Inicializar banco de dados

```bash
# Rodar migrations/seeds
npm run db:init
```

---

## ⚙️ Configuração do PM2

### 1. Configurar PM2

```bash
# Voltar para raiz do projeto
cd /home/deploy/Plataforma_Vetric

# Editar ecosystem.config.js (se necessário)
nano vetric-dashboard/ecosystem.config.js

# Alterar IP da VPS na seção 'deploy'
```

### 2. Iniciar aplicação

```bash
# Iniciar com PM2
pm2 start vetric-dashboard/ecosystem.config.js --env production

# Verificar status
pm2 status

# Ver logs
pm2 logs vetric-api
```

### 3. Configurar PM2 para iniciar no boot

```bash
# Gerar script de startup
pm2 startup systemd

# Copiar e executar o comando que aparecer
# Exemplo: sudo env PATH=$PATH:/usr/bin...

# Salvar lista de processos
pm2 save
```

### 4. Comandos úteis PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs vetric-api

# Monitoramento
pm2 monit

# Restart
pm2 restart vetric-api

# Reload (zero downtime)
pm2 reload vetric-api

# Stop
pm2 stop vetric-api

# Delete
pm2 delete vetric-api
```

---

## 🌐 Configuração do Nginx

### 1. Criar configuração do Backend API

```bash
sudo nano /etc/nginx/sites-available/vetric-api
```

```nginx
# Backend API - api.vetric.com.br
server {
    listen 80;
    server_name api.vetric.com.br;

    # Logs
    access_log /var/log/nginx/vetric-api-access.log;
    error_log /var/log/nginx/vetric-api-error.log;

    # Proxy para backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Upload de arquivos grandes
    client_max_body_size 10M;
}
```

### 2. Ativar configuração

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/vetric-api /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 3. Testar API

```bash
# Testar localmente
curl http://localhost:5000/health

# Testar pelo domínio
curl http://api.vetric.com.br/health
```

---

## 🔒 Configuração de SSL (Let's Encrypt)

### 1. Obter certificado SSL

```bash
# Backend API
sudo certbot --nginx -d api.vetric.com.br

# Seguir instruções:
# - Informar email
# - Aceitar termos
# - Escolher opção 2 (redirect HTTP -> HTTPS)
```

### 2. Renovação automática

```bash
# Testar renovação
sudo certbot renew --dry-run

# Certbot cria um cron automático em /etc/cron.d/certbot
```

### 3. Verificar SSL

Acesse no navegador:
```
https://api.vetric.com.br/health
```

Deve mostrar o cadeado verde 🔒

---

## ✅ Deploy e Testes

### 1. Verificar se tudo está rodando

```bash
# Backend (PM2)
pm2 status

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql
```

### 2. Testar endpoints

```bash
# Health check
curl https://api.vetric.com.br/health

# Login
curl -X POST https://api.vetric.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vetric.com.br","senha":"Vetric@2026"}'
```

### 3. Ver logs

```bash
# Logs PM2
pm2 logs vetric-api

# Logs Nginx
sudo tail -f /var/log/nginx/vetric-api-access.log
sudo tail -f /var/log/nginx/vetric-api-error.log

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 🔄 Atualizações Futuras

### MÉTODO 1: Script Automático (Recomendado)

```bash
# Na VPS
cd /home/deploy/Plataforma_Vetric
./scripts/deploy.sh
```

O script faz automaticamente:
1. ✅ Backup do banco
2. ✅ Git pull
3. ✅ npm install
4. ✅ npm run build
5. ✅ PM2 reload (zero downtime)

### MÉTODO 2: Manual

```bash
# 1. Fazer backup
./scripts/backup.sh

# 2. Baixar atualizações
git pull origin main

# 3. Instalar dependências
cd vetric-dashboard/backend
npm install --production

# 4. Build
npm run build

# 5. Restart PM2
pm2 reload vetric-api
```

### Rollback (se algo der errado)

```bash
# Voltar para versão anterior
./scripts/rollback.sh

# Voltar 3 commits
./scripts/rollback.sh 3
```

---

## 📊 Monitoramento e Logs

### PM2 Monitoring

```bash
# Monitoramento em tempo real
pm2 monit

# Status detalhado
pm2 show vetric-api

# Logs
pm2 logs vetric-api --lines 100
```

### Logs do Sistema

```bash
# Backend
tail -f /home/deploy/Plataforma_Vetric/vetric-dashboard/backend/logs/combined.log

# Nginx
tail -f /var/log/nginx/vetric-api-access.log
tail -f /var/log/nginx/vetric-api-error.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Monitorar recursos

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Processos Node
ps aux | grep node
```

---

## 🔧 Troubleshooting

### Problema 1: Backend não inicia

```bash
# Ver logs de erro
pm2 logs vetric-api --err

# Verificar .env
cat vetric-dashboard/backend/.env

# Testar conexão banco
psql -U vetric_user -d vetric_db -h localhost
```

### Problema 2: Nginx retorna 502 Bad Gateway

```bash
# Verificar se backend está rodando
pm2 status

# Verificar porta
netstat -tlnp | grep 5000

# Reiniciar backend
pm2 restart vetric-api

# Ver logs Nginx
sudo tail -f /var/log/nginx/vetric-api-error.log
```

### Problema 3: SSL não funciona

```bash
# Renovar certificado
sudo certbot renew

# Verificar configuração Nginx
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### Problema 4: Banco de dados desconectado

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Ver logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Problema 5: Sem espaço em disco

```bash
# Verificar espaço
df -h

# Limpar logs antigos
sudo journalctl --vacuum-time=7d

# Limpar backups antigos (mantém últimos 7 dias)
./scripts/backup.sh

# Limpar node_modules e rebuild
cd vetric-dashboard/backend
rm -rf node_modules
npm install --production
```

---

## 📱 Configuração Frontend (Próxima Etapa)

Quando o frontend estiver pronto:

1. Build do frontend
2. Configurar Nginx para servir arquivos estáticos
3. Configurar SSL para admin.vetric.com.br e granmarine.vetric.com.br

---

## 🔐 Segurança Adicional

### 1. Fail2ban (Prevenir ataques SSH)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Desabilitar login root via SSH

```bash
sudo nano /etc/ssh/sshd_config

# Alterar:
# PermitRootLogin no

sudo systemctl restart sshd
```

### 3. Backup automático (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar backup diário às 3h
0 3 * * * /home/deploy/Plataforma_Vetric/scripts/backup.sh
```

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verificar logs: `pm2 logs vetric-api`
2. Consultar este documento
3. Verificar issues no GitHub

---

**✅ Deploy Concluído!**

Sua aplicação VETRIC está rodando em produção com segurança e alta disponibilidade! 🚀


# 🐳 VETRIC - Guia Completo Docker

**Objetivo:** Rodar todo o sistema VETRIC com Docker/Docker Compose.

---

## 📦 O QUE FOI CRIADO

### **Dockerfiles:**
- ✅ `apps/backend/Dockerfile` - Backend API (Node.js)
- ✅ `apps/frontend/Dockerfile` - Frontend Dashboard (React + Nginx)

### **Configurações:**
- ✅ `docker-compose.yml` - Orquestração completa
- ✅ `apps/backend/.dockerignore` - Otimização backend
- ✅ `apps/frontend/.dockerignore` - Otimização frontend
- ✅ `apps/frontend/nginx.conf` - Configuração Nginx
- ✅ `docker.env.example` - Template de variáveis

---

## 🚀 QUICK START

### **1. Configurar Variáveis de Ambiente (1 min)**

```bash
# Copiar template
cp docker.env.example .env

# Editar com suas credenciais
nano .env
```

**Variáveis obrigatórias:**
```bash
DB_PASSWORD=sua-senha-postgres
JWT_SECRET=seu-secret-minimo-32-caracteres
CVE_EMAIL=seu-email@exemplo.com
CVE_PASSWORD=sua-senha-cve
```

### **2. Rodar Todo o Sistema (1 comando)**

```bash
# Build e start de todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f
```

**Pronto! Sistema rodando:**
- 🔧 Backend: http://localhost:3001
- 🎨 Frontend: http://localhost:3000
- 💾 PostgreSQL: localhost:5432

### **3. Verificar Status**

```bash
# Ver status dos containers
docker-compose ps

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

## 🏗️ ARQUITETURA DOCKER

```
┌─────────────────────────────────────┐
│     Docker Compose Network          │
│  (vetric-network)                   │
│                                     │
│  ┌─────────────┐                   │
│  │  Frontend   │ (Nginx:Alpine)    │
│  │  Port 3000  │                   │
│  └──────┬──────┘                   │
│         │ HTTP                      │
│         ↓                           │
│  ┌─────────────┐                   │
│  │   Backend   │ (Node:18-Alpine)  │
│  │  Port 3001  │                   │
│  └──────┬──────┘                   │
│         │ SQL                       │
│         ↓                           │
│  ┌─────────────┐                   │
│  │  PostgreSQL │ (Postgres:15)     │
│  │  Port 5432  │                   │
│  └─────────────┘                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📝 COMANDOS ÚTEIS

### **Gerenciamento:**

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga banco de dados)
docker-compose down -v

# Restart de um serviço específico
docker-compose restart backend
docker-compose restart frontend

# Rebuild de um serviço (após mudanças no código)
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### **Logs:**

```bash
# Todos os logs
docker-compose logs -f

# Logs de um serviço
docker-compose logs -f backend

# Últimas 100 linhas
docker-compose logs --tail=100 backend

# Logs desde um tempo específico
docker-compose logs --since 10m backend
```

### **Execução de Comandos:**

```bash
# Executar comando no backend
docker-compose exec backend npm run migrate

# Executar comando no PostgreSQL
docker-compose exec postgres psql -U postgres -d vetric_cve

# Abrir shell no backend
docker-compose exec backend sh

# Abrir shell no frontend
docker-compose exec frontend sh
```

---

## 🔧 DESENVOLVIMENTO COM DOCKER

### **Opção 1: Hot Reload com Volumes (Recomendado para Dev)**

Edite `docker-compose.yml` e adicione volumes:

```yaml
backend:
  volumes:
    - ./apps/backend/src:/app/src:ro
    - backend-uploads:/app/uploads
  command: npm run dev
```

### **Opção 2: Rebuild Após Mudanças**

```bash
# Após fazer mudanças no código
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### **Opção 3: Rodar Apenas Banco com Docker**

```bash
# Subir apenas o PostgreSQL
docker-compose up -d postgres

# Backend e Frontend rodam localmente
cd apps/backend && npm run dev
cd apps/frontend && npm run dev
```

---

## 🗄️ GERENCIAMENTO DO BANCO DE DADOS

### **Backup:**

```bash
# Criar backup
docker-compose exec postgres pg_dump -U postgres vetric_cve > backup_$(date +%Y%m%d_%H%M%S).sql

# Ou com docker diretamente
docker exec vetric-postgres pg_dump -U postgres vetric_cve > backup.sql
```

### **Restore:**

```bash
# Restaurar backup
cat backup.sql | docker-compose exec -T postgres psql -U postgres vetric_cve

# Ou
docker exec -i vetric-postgres psql -U postgres vetric_cve < backup.sql
```

### **Acessar PostgreSQL:**

```bash
# Via docker-compose
docker-compose exec postgres psql -U postgres -d vetric_cve

# Comandos úteis no psql:
# \dt          - Listar tabelas
# \d tabela    - Descrever tabela
# \q           - Sair
```

### **Migrations:**

```bash
# Executar migrations
docker-compose exec backend npm run migrate

# Ou criar script no backend package.json:
# "migrate": "node dist/database/migrate.js"
```

---

## 🚢 DEPLOY EM PRODUÇÃO

### **Opção 1: Docker Compose na VPS**

```bash
# 1. Na VPS, clonar repositório
git clone https://github.com/SEU-USUARIO/vetric-cve.git
cd vetric-cve

# 2. Configurar .env
cp docker.env.example .env
nano .env

# 3. Configurar variáveis de produção
# NODE_ENV=production
# CORS_ORIGIN=https://seu-dominio.com
# VITE_API_URL=https://api.seu-dominio.com

# 4. Subir sistema
docker-compose up -d

# 5. Ver logs
docker-compose logs -f
```

### **Opção 2: Docker com Nginx Reverse Proxy**

```nginx
# /etc/nginx/sites-available/vetric

# Frontend
server {
    listen 80;
    server_name vetric.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.vetric.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Opção 3: Docker Swarm (Alta Disponibilidade)**

```bash
# Inicializar Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml vetric

# Ver serviços
docker stack services vetric

# Ver logs
docker service logs vetric_backend
```

---

## 🔐 SEGURANÇA

### **Boas Práticas Implementadas:**

✅ **Multi-stage builds** - Imagens otimizadas  
✅ **Usuário não-root** - Containers rodam como usuário comum  
✅ **Alpine Linux** - Imagens base mínimas  
✅ **Healthchecks** - Monitoramento automático  
✅ **Secrets via .env** - Credenciais não no código  
✅ **Network isolada** - Comunicação interna segura  

### **Recomendações Adicionais:**

```bash
# 1. Usar Docker Secrets (Swarm)
echo "senha-secreta" | docker secret create db_password -

# 2. Scan de vulnerabilidades
docker scan vetric-backend
docker scan vetric-frontend

# 3. Limitar recursos
# Adicionar no docker-compose.yml:
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

## 📊 MONITORAMENTO

### **Healthchecks:**

```bash
# Verificar health dos containers
docker ps

# Detalhes do healthcheck
docker inspect --format='{{json .State.Health}}' vetric-backend
```

### **Recursos:**

```bash
# Ver uso de recursos
docker stats

# Ver uso de disco
docker system df

# Ver logs de um container
docker logs -f vetric-backend
```

### **Integração com Portainer (Opcional):**

```bash
# Instalar Portainer para UI de gerenciamento
docker volume create portainer_data

docker run -d \
  -p 9000:9000 \
  --name portainer \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Acessar: http://localhost:9000
```

---

## 🧹 LIMPEZA

### **Remover Containers Parados:**

```bash
docker container prune
```

### **Remover Imagens Não Usadas:**

```bash
docker image prune -a
```

### **Remover Volumes Não Usados:**

```bash
docker volume prune
```

### **Limpeza Completa (CUIDADO!):**

```bash
docker system prune -a --volumes
```

---

## 🐛 TROUBLESHOOTING

### **Problema: Container não inicia**

```bash
# Ver logs detalhados
docker-compose logs backend

# Ver eventos
docker events --filter container=vetric-backend

# Inspecionar container
docker inspect vetric-backend
```

### **Problema: Erro de conexão com banco**

```bash
# Verificar se postgres está rodando
docker-compose ps postgres

# Verificar logs do postgres
docker-compose logs postgres

# Testar conexão
docker-compose exec backend nc -zv postgres 5432
```

### **Problema: Frontend não conecta no backend**

```bash
# Verificar se backend está rodando
docker-compose ps backend

# Verificar CORS no backend
docker-compose logs backend | grep CORS

# Verificar variável VITE_API_URL
docker-compose exec frontend env | grep VITE
```

### **Problema: Porta já em uso**

```bash
# Ver o que está usando a porta
lsof -i :3001
lsof -i :3000
lsof -i :5432

# Matar processo
kill -9 PID

# Ou mudar porta no docker-compose.yml
ports:
  - "3002:3001"  # Mapear porta 3001 interna para 3002 externa
```

---

## 📦 IMAGENS DOCKER

### **Tamanhos Aproximados:**

- **Backend:** ~200-250 MB (Alpine + Node + App)
- **Frontend:** ~40-60 MB (Alpine + Nginx + Build)
- **PostgreSQL:** ~200 MB (Postgres 15 Alpine)

### **Build Manual:**

```bash
# Backend
cd apps/backend
docker build -t vetric-backend:latest .

# Frontend
cd apps/frontend
docker build -t vetric-frontend:latest .
```

### **Push para Registry (Opcional):**

```bash
# Docker Hub
docker tag vetric-backend:latest seuusuario/vetric-backend:latest
docker push seuusuario/vetric-backend:latest

# Registry privado
docker tag vetric-backend:latest registry.seudominio.com/vetric-backend:latest
docker push registry.seudominio.com/vetric-backend:latest
```

---

## ✅ CHECKLIST DOCKER

### **Desenvolvimento:**
- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `.env` configurado
- [ ] `docker-compose up -d` executado
- [ ] Backend acessível em http://localhost:3001
- [ ] Frontend acessível em http://localhost:3000
- [ ] Banco de dados funcionando

### **Produção:**
- [ ] Variáveis de ambiente de produção configuradas
- [ ] `NODE_ENV=production`
- [ ] SSL configurado (se exposto)
- [ ] Reverse proxy configurado (Nginx)
- [ ] Backups automáticos configurados
- [ ] Monitoramento configurado
- [ ] Logs sendo coletados

---

## 🎯 RESUMO DOS COMANDOS

```bash
# SETUP INICIAL
cp docker.env.example .env
nano .env
docker-compose up -d

# DIA A DIA
docker-compose ps                    # Ver status
docker-compose logs -f backend       # Ver logs
docker-compose restart backend       # Reiniciar serviço
docker-compose down                  # Parar tudo

# DESENVOLVIMENTO
docker-compose up -d --build backend  # Rebuild após mudanças
docker-compose exec backend sh        # Shell no container

# BANCO DE DADOS
docker-compose exec postgres psql -U postgres -d vetric_cve  # Acessar banco
docker exec vetric-postgres pg_dump -U postgres vetric_cve > backup.sql  # Backup

# LIMPEZA
docker-compose down -v               # Parar e remover volumes
docker system prune -a               # Limpeza completa
```

---

## 📚 RECURSOS

- **Docker Docs:** https://docs.docker.com
- **Docker Compose Docs:** https://docs.docker.com/compose
- **Best Practices:** https://docs.docker.com/develop/dev-best-practices

---

**Sistema VETRIC totalmente Dockerizado! 🐳🚀**

**Próximo:** Testar localmente e depois fazer deploy na VPS!




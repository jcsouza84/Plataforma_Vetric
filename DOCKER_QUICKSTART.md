# 🐳 VETRIC - Docker Quick Start (5 minutos)

**Rodar todo o sistema com 3 comandos!**

---

## ✅ PRÉ-REQUISITOS

- Docker instalado
- Docker Compose instalado

**Verificar:**
```bash
docker --version
docker-compose --version
```

**Instalar (se necessário):**
- **Mac:** https://docs.docker.com/desktop/install/mac-install/
- **Windows:** https://docs.docker.com/desktop/install/windows-install/
- **Linux:** https://docs.docker.com/engine/install/

---

## 🚀 3 COMANDOS PARA RODAR TUDO

### **1. Configurar Variáveis (1 min)**

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"

# Copiar template
cp docker.env.example .env

# Editar (adicionar suas credenciais)
nano .env
```

**Mínimo necessário:**
```bash
DB_PASSWORD=sua-senha-aqui
JWT_SECRET=seu-secret-com-mais-de-32-caracteres-aqui
CVE_EMAIL=seu-email@exemplo.com
CVE_PASSWORD=sua-senha-cve-aqui
```

### **2. Subir Todo o Sistema (1 comando)**

```bash
docker-compose up -d
```

**Aguarde 1-2 minutos enquanto:**
- 🔧 Backend compila e inicia
- 🎨 Frontend compila e inicia
- 💾 PostgreSQL inicializa banco

### **3. Verificar Status**

```bash
docker-compose ps
```

**Deve mostrar:**
```
NAME                 STATUS         PORTS
vetric-backend       Up (healthy)   0.0.0.0:3001->3001/tcp
vetric-frontend      Up (healthy)   0.0.0.0:3000->80/tcp
vetric-postgres      Up (healthy)   0.0.0.0:5432->5432/tcp
```

---

## ✅ PRONTO! SISTEMA RODANDO

Acesse:
- **🎨 Frontend:** http://localhost:3000
- **🔧 Backend API:** http://localhost:3001
- **💾 PostgreSQL:** localhost:5432

**Login padrão:**
- Email: `admin@vetric.com.br`
- Senha: `Vetric@2026`

---

## 📊 VER LOGS

```bash
# Todos os logs
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

---

## ⏹️ PARAR SISTEMA

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover banco (CUIDADO!)
docker-compose down -v
```

---

## 🔄 REINICIAR APÓS MUDANÇAS NO CÓDIGO

```bash
# Rebuild e restart backend
docker-compose up -d --build backend

# Rebuild e restart frontend
docker-compose up -d --build frontend
```

---

## 🐛 PROBLEMAS?

### **"Port already in use"**

```bash
# Ver o que está usando a porta
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL

# Parar processo ou mudar porta no docker-compose.yml
```

### **"Cannot connect to database"**

```bash
# Ver logs do postgres
docker-compose logs postgres

# Verificar se está rodando
docker-compose ps postgres

# Restart
docker-compose restart postgres
```

### **"Backend not responding"**

```bash
# Ver logs
docker-compose logs backend

# Restart
docker-compose restart backend

# Rebuild
docker-compose up -d --build backend
```

---

## 📚 GUIA COMPLETO

Para mais detalhes, veja [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

## 🎯 COMANDOS ESSENCIAIS

```bash
# Subir tudo
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build

# Limpar tudo (CUIDADO!)
docker-compose down -v
docker system prune -a
```

---

## 🚢 PRONTO PARA PRODUÇÃO

O sistema Docker está pronto para deploy em VPS!

**Próximo passo:** Ver [checklist_fase1.md](./checklist_fase1.md) para deploy em produção.

---

**Sistema VETRIC rodando com Docker! 🐳🎉**




# 🚀 VETRIC - Primeiro Commit no GitHub

Este documento explica como fazer o **primeiro push** do projeto para o GitHub.

---

## 📋 Resumo do que foi implementado

✅ Todos os itens de segurança e deploy foram adicionados **SEM alterar a lógica do código**:

### 1. **Estrutura Git**
- ✅ `.gitignore` completo (protege senhas, tokens, uploads)
- ✅ `.env.example` (template para configuração)

### 2. **Segurança Backend**
- ✅ Helmet.js (headers seguros)
- ✅ Rate Limiting (proteção DDoS)
- ✅ CORS configurado
- ✅ Validação de inputs (express-validator)
- ✅ Login rate limit (5 tentativas/15min)

### 3. **Deploy e DevOps**
- ✅ `ecosystem.config.js` (configuração PM2)
- ✅ `scripts/deploy.sh` (deploy automático)
- ✅ `scripts/backup.sh` (backup banco e uploads)
- ✅ `scripts/rollback.sh` (reverter deploy)

### 4. **Documentação**
- ✅ `DEPLOY.md` (guia completo VPS)
- ✅ `README.md` (documentação completa)
- ✅ Este arquivo (instruções de commit)

---

## 🎯 Passo a Passo - Primeiro Commit

### **1. Verificar status atual**

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"

# Ver arquivos modificados
git status
```

### **2. Inicializar Git (se ainda não foi feito)**

```bash
# Inicializar repositório
git init

# Adicionar repositório remoto
git remote add origin https://github.com/jcsouza84/Plataforma_Vetric.git

# Verificar remote
git remote -v
```

### **3. Adicionar arquivos ao commit**

```bash
# Adicionar TODOS os arquivos (respeitando .gitignore)
git add .

# Verificar o que será commitado
git status
```

### **4. Fazer o primeiro commit**

```bash
git commit -m "feat: estrutura inicial do projeto VETRIC

- Backend API com autenticação JWT e roles
- Integração CVE-Pro e Evolution API
- CRUD de moradores e relatórios
- Middlewares de segurança (Helmet, Rate Limiting, CORS)
- Scripts de deploy automático
- Configuração PM2 para produção
- Documentação completa de deploy
"
```

### **5. Criar branch main (se necessário)**

```bash
# Renomear branch atual para main
git branch -M main
```

### **6. Push para GitHub**

```bash
# Primeira vez - configurar upstream
git push -u origin main

# Será solicitado suas credenciais GitHub
```

### **7. Verificar no GitHub**

Acesse: https://github.com/jcsouza84/Plataforma_Vetric.git

Deve ver todos os arquivos (exceto os do .gitignore)!

---

## 🔒 Arquivos que NÃO foram para o GitHub

Por segurança, o `.gitignore` bloqueia:

- ❌ `.env` (senhas, tokens)
- ❌ `node_modules/` (dependências)
- ❌ `logs/` (logs do sistema)
- ❌ `uploads/` (arquivos de usuários)
- ❌ `backups/` (backups do banco)
- ❌ `dist/` (build do TypeScript)

**IMPORTANTE:** Na VPS, você criará um novo arquivo `.env` com as credenciais de produção!

---

## 🔄 Workflow Completo (Cursor → GitHub → VPS)

### **1. Desenvolvimento (Cursor - Local)**

```bash
# Fazer modificações no código
# ...

# Commit
git add .
git commit -m "feat: adiciona funcionalidade X"

# Push
git push origin main
```

### **2. Deploy na VPS**

```bash
# Conectar na VPS
ssh deploy@SEU_IP_VPS

# Navegar para o projeto
cd /home/deploy/Plataforma_Vetric

# Rodar script de deploy automático
./scripts/deploy.sh
```

**O script faz:**
1. ✅ Backup do banco
2. ✅ Git pull origin main
3. ✅ npm install
4. ✅ npm run build
5. ✅ PM2 reload (zero downtime)

### **3. Verificar Deploy**

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs vetric-api

# Testar API
curl https://api.vetric.com.br/health
```

---

## 🚨 IMPORTANTE - Antes do Deploy

### **1. Configurar DNS**

Aponte seus domínios para o IP da VPS:

```
api.vetric.com.br          → SEU_IP_VPS
admin.vetric.com.br        → SEU_IP_VPS
granmarine.vetric.com.br   → SEU_IP_VPS
```

### **2. Preparar .env de Produção**

Na VPS, crie `.env` com valores REAIS:

```bash
# Na VPS
cd /home/deploy/Plataforma_Vetric/vetric-dashboard/backend
cp .env.example .env
nano .env

# Preencher:
# - Senha do banco de produção
# - JWT_SECRET forte (openssl rand -base64 32)
# - Credenciais CVE-Pro
# - Credenciais Evolution API
```

### **3. Criar usuário deploy na VPS**

```bash
# Conectar como root
ssh root@SEU_IP_VPS

# Criar usuário
adduser deploy
usermod -aG sudo deploy

# Trocar para usuário deploy
su - deploy
```

---

## 📚 Próximos Passos

Após o primeiro commit:

1. ✅ Código está no GitHub
2. ✅ Seguir o guia `DEPLOY.md` para configurar VPS
3. ✅ Fazer deploy inicial
4. ✅ Configurar SSL (Let's Encrypt)
5. ✅ Testar endpoints
6. ✅ Desenvolver frontend (Fase 3)

---

## 🆘 Problemas Comuns

### **Erro: "remote origin already exists"**

```bash
# Remover remote antigo
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/jcsouza84/Plataforma_Vetric.git
```

### **Erro: "Permission denied (publickey)"**

```bash
# Usar HTTPS ao invés de SSH
git remote set-url origin https://github.com/jcsouza84/Plataforma_Vetric.git
```

### **Erro: "Repository not found"**

Verifique se o repositório existe:
https://github.com/jcsouza84/Plataforma_Vetric

---

## ✅ Checklist Final

Antes de fazer o push, verifique:

- [ ] `.gitignore` está funcionando (arquivos sensíveis não aparecem no `git status`)
- [ ] `.env` NÃO está sendo commitado
- [ ] `node_modules/` NÃO está sendo commitado
- [ ] Scripts têm permissão de execução (`chmod +x scripts/*.sh`)
- [ ] Documentação está completa

---

**Pronto para o primeiro commit!** 🚀

Execute os comandos acima e seu código estará seguro no GitHub, pronto para ser deployado na VPS!


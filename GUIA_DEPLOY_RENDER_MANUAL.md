# 🚀 GUIA COMPLETO - Deploy VETRIC no Render (Passo a Passo Manual)

**Data:** 16 de Janeiro de 2026  
**Tempo estimado:** 30-40 minutos

---

## ⚠️ SITUAÇÃO ATUAL

O MCP do Render está com problema de autenticação. **Não tem problema!** Vou te guiar para fazer manualmente pelo painel web, que é até mais simples e visual.

---

## ✅ JÁ CONCLUÍDO (40%):

- ✅ Backup completo do código local (81MB)
- ✅ Código modificado para suportar Render
- ✅ Branch `render-deploy` no GitHub
- ✅ Credenciais verificadas

---

## 🎯 VAMOS FAZER AGORA (60%):

---

## 📦 PASSO 1: CRIAR POSTGRESQL (5 minutos)

### **1.1 Acessar Render Dashboard:**

1. Abra: https://dashboard.render.com
2. Clique em **"New +"** (botão azul no topo direito)
3. Selecione **"PostgreSQL"**

### **1.2 Configurar Database:**

```
Name: vetric-database
Region: Oregon (US West)
PostgreSQL Version: 15
Datadog API Key: (deixe vazio)
```

### **1.3 Selecionar Plano:**

⚠️ **ATENÇÃO:** Render **NÃO tem PostgreSQL grátis** para produção!

**Opções de plano:**

| Plano | Custo | RAM | Storage | Recomendação |
|-------|-------|-----|---------|--------------|
| **Starter** | US$ 7/mês | 256MB | 1GB | ✅ **RECOMENDADO** |
| **Standard** | US$ 20/mês | 1GB | 10GB | Para futuro |
| **Pro** | US$ 65/mês | 4GB | 50GB | Empresas |

**Escolha:** `Starter` (US$ 7/mês)

### **1.4 Criar:**

1. Clique em **"Create Database"**
2. Aguarde 2-3 minutos (Render vai provisionar)
3. ✅ Quando ficar verde: **Database criado!**

### **1.5 Copiar Credenciais:**

Após criação, você verá:

```
Internal Database URL: postgresql://...
External Database URL: postgresql://...
```

**⚠️ IMPORTANTE:** Copie a **Internal Database URL** completa!

Ela será algo como:
```
postgresql://vetric_database_user:senha123@dpg-xxxxx-a.oregon-postgres.render.com/vetric_database_xxxx
```

**Salve em um arquivo temporário! Vamos usar daqui a pouco.**

---

## 🖥️ PASSO 2: CRIAR BACKEND WEB SERVICE (10 minutos)

### **2.1 Criar Novo Web Service:**

1. Clique em **"New +"** novamente
2. Selecione **"Web Service"**

### **2.2 Conectar GitHub:**

1. Se aparecer "Connect a repository", clique em **"Connect account"**
2. Autorize Render no GitHub
3. Selecione o repositório: **`Plataforma_Vetric`**
4. Clique em **"Connect"**

### **2.3 Configurar Web Service:**

```
Name: vetric-backend
Region: Oregon (US West)
Branch: render-deploy  ← IMPORTANTE! Usar essa branch
Root Directory: apps/backend
Runtime: Node
```

### **2.4 Build & Start Command:**

```
Build Command: npm install && npm run build
Start Command: npm start
```

### **2.5 Selecionar Plano:**

| Plano | Custo | RAM | CPU | Recomendação |
|-------|-------|-----|-----|--------------|
| **Free** | Grátis | 512MB | Compartilhado | ❌ Dorme após 15min |
| **Starter** | US$ 7/mês | 512MB | Compartilhado | ✅ **RECOMENDADO** |
| **Standard** | US$ 25/mês | 2GB | Dedicado | Para escala |

**Escolha:** `Starter` (US$ 7/mês)

⚠️ **NÃO use Free!** Ele dorme após 15min sem uso (seu polling vai parar).

### **2.6 Adicionar Variáveis de Ambiente:**

**⚠️ MUITO IMPORTANTE!** Clique em **"Advanced"** e adicione:

```env
NODE_ENV=production
PORT=10000

# DATABASE (copie a URL que salvou no Passo 1)
DATABASE_URL=postgresql://vetric_database_user:senha123@dpg-xxxxx-a.oregon-postgres.render.com/vetric_database_xxxx

# CVE-PRO API
CVE_API_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_API_KEY=808c0fb3-dc7f-40f5-b294-807f21fc8947
CVE_USERNAME=julio@mundologic.com.br
CVE_PASSWORD=1a2b3c4d

# EVOLUTION API (WhatsApp)
EVOLUTION_API_URL=http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me
EVOLUTION_API_KEY=t1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==
EVOLUTION_INSTANCE=Vetric Bot

# JWT
JWT_SECRET=vetric-production-render-2026-secure-key
JWT_EXPIRES_IN=24h
```

### **2.7 Criar Web Service:**

1. Clique em **"Create Web Service"**
2. Aguarde 5-10 minutos (Render vai fazer build)
3. ✅ Quando ficar verde com "Live": **Backend no ar!**

### **2.8 Copiar URL do Backend:**

Após deploy, você verá:
```
https://vetric-backend-xxxx.onrender.com
```

**Salve essa URL! Vamos usar no frontend.**

---

## 🎨 PASSO 3: CRIAR FRONTEND STATIC SITE (5 minutos)

### **3.1 Criar Static Site:**

1. Clique em **"New +"**
2. Selecione **"Static Site"**

### **3.2 Conectar GitHub:**

1. Selecione repositório: **`Plataforma_Vetric`**
2. Clique em **"Connect"**

### **3.3 Configurar Static Site:**

```
Name: vetric-frontend
Region: Oregon (US West)
Branch: render-deploy
Root Directory: apps/frontend
```

### **3.4 Build Settings:**

```
Build Command: npm install && npm run build
Publish Directory: dist
```

### **3.5 Adicionar Variável de Ambiente:**

Clique em **"Advanced"** e adicione:

```env
VITE_API_URL=https://vetric-backend-xxxx.onrender.com
```

⚠️ **Substituir** `vetric-backend-xxxx.onrender.com` pela URL que você copiou no Passo 2.8!

### **3.6 Auto-Deploy:**

```
Auto-Deploy: Yes
```

### **3.7 Criar Static Site:**

1. Clique em **"Create Static Site"**
2. Aguarde 3-5 minutos (build do React)
3. ✅ Quando ficar verde: **Frontend no ar!**

### **3.8 Copiar URL do Frontend:**

```
https://vetric-frontend.onrender.com
```

**🎉 PARABÉNS! Sistema está no ar!**

---

## 🗄️ PASSO 4: MIGRAR DADOS DO POSTGRESQL LOCAL (10 minutos)

Agora vamos migrar seus dados (usuários, moradores, etc) para o Render.

### **4.1 Exportar Dados Local:**

Abra o terminal e execute:

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE/apps/backend"

# Exportar estrutura e dados
pg_dump -U postgres -d vetric_db \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -f backup_vetric_$(date +%Y%m%d).sql

echo "✅ Backup criado: backup_vetric_$(date +%Y%m%d).sql"
```

**Resultado:** Arquivo `backup_vetric_20260116.sql` criado.

### **4.2 Importar para Render:**

**Opção A: Via terminal (mais rápido):**

```bash
# Usar a External Database URL do Render
psql "postgresql://vetric_database_user:senha123@dpg-xxxxx-a.oregon-postgres.render.com/vetric_database_xxxx" \
  -f backup_vetric_20260116.sql

echo "✅ Dados importados para Render!"
```

**Opção B: Via Render Dashboard (visual):**

1. Acesse: https://dashboard.render.com
2. Clique em **"vetric-database"**
3. Aba **"Shell"**
4. Cole o conteúdo do arquivo `.sql`
5. Execute

### **4.3 Verificar Migração:**

No Render Dashboard → vetric-database → Shell:

```sql
-- Ver usuários
SELECT email, nome, role FROM usuarios;

-- Ver moradores
SELECT COUNT(*) as total FROM moradores;

-- Deve retornar 59 moradores
```

✅ Se mostrar seus dados: **Migração concluída!**

---

## 🧪 PASSO 5: TESTAR SISTEMA COMPLETO (15 minutos)

### **5.1 Acessar Frontend:**

Abra: `https://vetric-frontend.onrender.com`

**Deve mostrar:** Tela de login VETRIC

### **5.2 Fazer Login:**

```
Email: admin@vetric.com.br
Senha: Vetric@2026
```

**Deve:** Redirecionar para dashboard

### **5.3 Verificar Dashboard:**

✅ **Checklist:**
```
□ Logo VETRIC aparece
□ Menu lateral funcionando
□ Status dos 5 carregadores aparecendo
□ Sem erros no console (F12)
```

### **5.4 Testar Funcionalidades:**

#### **A) Moradores:**
1. Clicar em "Moradores" no menu
2. Deve listar 59 moradores
3. Tentar criar novo morador
4. Tentar editar um existente

#### **B) Configurações:**
1. Clicar em "Configurações"
2. Verificar Evolution API conectada
3. Testar envio de mensagem

#### **C) Relatórios:**
1. Clicar em "Relatórios"
2. Tentar upload de PDF teste

### **5.5 Verificar Backend Logs:**

No Render Dashboard:

1. Clique em **"vetric-backend"**
2. Aba **"Logs"**
3. Deve mostrar:
   ```
   ✅ Conectado ao banco de dados PostgreSQL
   ✅ Login CVE-PRO realizado
   ✅ 5 carregador(es) encontrado(s)
   ✅ VETRIC DASHBOARD ONLINE!
   ```

**Se tudo passou:** ✅ **Sistema 100% funcional!**

---

## 🎉 PASSO 6: CONFIGURAR DEPLOY AUTOMÁTICO

### **6.1 Como Funciona:**

```
Você: git push origin render-deploy
       ↓
GitHub: Detecta novo commit
       ↓
Render: Faz build automático
       ↓
Sistema: Atualizado em ~5 minutos!
```

### **6.2 Testar Deploy Automático:**

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"

# Fazer pequena mudança
echo "# Deploy teste" >> README.md

# Commit e push
git add .
git commit -m "test: deploy automático"
git push origin render-deploy

# Acompanhar no Render Dashboard → Logs
```

**Render vai:** Build → Deploy → Sistema atualizado!

---

## 📊 RESUMO FINAL

### **URLs do Sistema:**

```
Frontend: https://vetric-frontend.onrender.com
Backend:  https://vetric-backend-xxxx.onrender.com
Database: (interno, não acessível diretamente)
```

### **Credenciais:**

```
Admin:
Email: admin@vetric.com.br
Senha: Vetric@2026

Cliente:
Email: granmarine@vetric.com.br
Senha: GranMarine@2026
```

### **Custo Mensal:**

```
PostgreSQL Starter:     US$ 7/mês
Backend Web Service:    US$ 7/mês
Frontend Static Site:   GRÁTIS

TOTAL: US$ 14/mês
```

### **Backup Local:**

```
Código: /Users/juliocesarsouza/Desktop/BACKUP_VETRIC_20260116_023058.tar.gz
Banco:  apps/backend/backup_vetric_20260116.sql
```

---

## 🔄 MANUTENÇÃO FUTURA

### **Atualizações:**

```bash
# 1. Desenvolver localmente
npm run dev

# 2. Testar
# ...

# 3. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin render-deploy

# 4. Render faz deploy automático!
```

### **Rollback (se algo der errado):**

No Render Dashboard:

1. Ir em **"vetric-backend"**
2. Aba **"Events"**
3. Clicar no deploy anterior
4. **"Redeploy"**

**Sistema volta para versão anterior em ~5 minutos!**

### **Logs em Tempo Real:**

```
Render Dashboard → vetric-backend → Logs
Render Dashboard → vetric-frontend → Logs
```

---

## ⚠️ TROUBLESHOOTING

### **Problema: Backend não inicia**

**Solução:**
1. Verificar logs: Render Dashboard → vetric-backend → Logs
2. Verificar variáveis de ambiente estão corretas
3. Verificar DATABASE_URL está conectando

### **Problema: Frontend carrega mas não conecta API**

**Solução:**
1. Verificar `VITE_API_URL` no frontend
2. Deve ser: `https://vetric-backend-xxxx.onrender.com` (sem barra no final!)
3. Rebuild frontend

### **Problema: CORS error**

**Solução:**
1. Verificar CORS no backend permite origem do frontend
2. Adicionar variável: `FRONTEND_URL=https://vetric-frontend.onrender.com`

### **Problema: Database connection timeout**

**Solução:**
1. Verificar DATABASE_URL está correto
2. Verificar SSL está habilitado (já está no código)
3. Restart backend

---

## 📞 SUPORTE

### **Render Docs:**
- https://render.com/docs

### **Render Status:**
- https://status.render.com

### **Community:**
- https://community.render.com

---

## ✅ CHECKLIST FINAL

Marque quando concluir cada passo:

```
□ PostgreSQL criado
□ Backend Web Service criado
□ Frontend Static Site criado
□ Variáveis de ambiente configuradas
□ Dados migrados
□ Login testado
□ Dashboard funcionando
□ CRUD moradores testado
□ Notificações WhatsApp testadas
□ Deploy automático testado
□ Backup local criado
□ URLs salvas
□ Documentação lida
```

---

**🎉 PARABÉNS! Sistema VETRIC no ar no Render!**

**Desenvolvido com ❤️ para facilitar sua vida!**

---

**Data:** 16/01/2026  
**Backup Local:** `/Users/juliocesarsouza/Desktop/BACKUP_VETRIC_20260116_023058.tar.gz`  
**Branch GitHub:** `render-deploy`  
**Tempo Total:** ~40 minutos


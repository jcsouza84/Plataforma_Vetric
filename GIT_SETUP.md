# 🔧 VETRIC - Guia de Setup Git e GitHub

**Objetivo:** Versionar o projeto VETRIC (backend + frontend) no GitHub como projetos independentes.

---

## 📋 OPÇÕES DE ORGANIZAÇÃO

Você tem **3 opções** de como organizar no GitHub:

### **OPÇÃO 1: 1 Repositório com 2 Projetos (RECOMENDADO) ✅**

```
GitHub:
└── vetric-cve (1 repositório)
    ├── apps/
    │   ├── backend/
    │   └── frontend/
    ├── docs/
    └── README.md
```

**Vantagens:**
- ✅ Tudo em um lugar
- ✅ Documentação centralizada
- ✅ Commits podem afetar front + back juntos
- ✅ Mais fácil de gerenciar

**Desvantagens:**
- ⚠️ Repositório maior
- ⚠️ Deploy precisa separar os projetos

---

### **OPÇÃO 2: 2 Repositórios Separados**

```
GitHub:
├── vetric-backend (repositório 1)
│   ├── src/
│   ├── package.json
│   └── README.md
│
└── vetric-frontend (repositório 2)
    ├── src/
    ├── package.json
    └── README.md
```

**Vantagens:**
- ✅ Deploy totalmente independente
- ✅ Repos pequenos e focados
- ✅ CI/CD mais simples

**Desvantagens:**
- ⚠️ Documentação duplicada
- ⚠️ Precisa clonar 2 repos
- ⚠️ Commits separados para mudanças front+back

---

### **OPÇÃO 3: 3 Repositórios (Backend + Frontend + Docs)**

```
GitHub:
├── vetric-backend
├── vetric-frontend
└── vetric-docs
```

**Vantagens:**
- ✅ Máxima separação
- ✅ Docs independentes

**Desvantagens:**
- ⚠️ Complexidade de gerenciamento
- ⚠️ Overkill para projeto atual

---

## 🎯 RECOMENDAÇÃO: OPÇÃO 1

Para o seu caso, **recomendo a Opção 1** (1 repo com 2 projetos).

---

## 🚀 PASSO A PASSO - OPÇÃO 1 (RECOMENDADO)

### **Passo 1: Criar Repositório no GitHub**

1. Acesse: https://github.com/new
2. Preencha:
   - **Nome:** `vetric-cve`
   - **Descrição:** `Plataforma de Gestão de Carregadores Elétricos - Integração CVE-PRO`
   - **Visibilidade:** Private (recomendado)
   - **NÃO** marque "Initialize with README" (você já tem)
3. Clique em "Create repository"

### **Passo 2: Preparar Projeto Local**

```bash
# Entre na pasta do projeto
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"

# Inicializar Git (se ainda não tiver)
git init

# Adicionar arquivos
git add .

# Criar primeiro commit
git commit -m "chore: initial commit - backend + frontend + docs"

# Renomear branch para main
git branch -M main
```

### **Passo 3: Conectar com GitHub**

```bash
# Adicionar remote (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/vetric-cve.git

# Enviar para GitHub
git push -u origin main
```

---

## 🚀 PASSO A PASSO - OPÇÃO 2 (2 REPOS SEPARADOS)

### **Backend:**

```bash
# 1. Criar repo no GitHub: vetric-backend

# 2. Preparar backend
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE/apps/backend"
git init
git add .
git commit -m "chore: initial backend setup"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/vetric-backend.git
git push -u origin main
```

### **Frontend:**

```bash
# 1. Criar repo no GitHub: vetric-frontend

# 2. Preparar frontend
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE/apps/frontend"
git init
git add .
git commit -m "chore: initial frontend setup"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/vetric-frontend.git
git push -u origin main
```

---

## 📝 ESTRUTURA FINAL (OPÇÃO 1)

```
vetric-cve/                         # Repositório GitHub
├── .gitignore                      # Arquivos ignorados
├── README.md                       # Documentação principal
├── GIT_SETUP.md                    # Este arquivo
│
├── apps/                           # Aplicações
│   ├── backend/                    # Backend Node.js
│   │   ├── .gitignore             # (específico do backend)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   └── README.md
│   │
│   └── frontend/                   # Frontend React
│       ├── .gitignore             # (específico do frontend)
│       ├── package.json
│       ├── vite.config.ts
│       ├── src/
│       └── README.md
│
├── docs/                           # Documentação
│   └── 00-INDICE.md               # Índice completo
│
├── fase1.md                        # Docs importantes na raiz
├── checklist_fase1.md
├── FAQ_PRODUCAO.md
├── GUIA_LOGS.md
├── alisson.md
└── AUTENTICACAO_FINAL.md
```

---

## ✅ CHECKLIST PRÉ-COMMIT

Antes de fazer o primeiro commit, verifique:

- [ ] `.gitignore` criado na raiz
- [ ] `.env` NÃO está sendo versionado (deve estar no .gitignore)
- [ ] `node_modules/` NÃO está sendo versionado
- [ ] README.md está atualizado
- [ ] Credenciais sensíveis NÃO estão no código

**Verificar arquivos que serão commitados:**

```bash
git status
```

**Visualizar diferenças:**

```bash
git diff
```

---

## 🔐 SEGURANÇA

### **NUNCA VERSIONE:**

- ❌ `.env` (credenciais)
- ❌ `node_modules/` (dependências)
- ❌ Senhas ou tokens
- ❌ Chaves SSH/SSL
- ❌ Dados de produção

### **SEMPRE VERSIONE:**

- ✅ `.env.example` (template sem credenciais)
- ✅ Código-fonte
- ✅ Documentação
- ✅ Scripts de setup
- ✅ Migrations

---

## 📦 ESTRUTURA `.env.example`

Já existe em `apps/ENV_EXAMPLE.txt`. Garanta que ele está sem credenciais:

```bash
# Verificar se .env está no .gitignore
cat .gitignore | grep ".env"

# Deve mostrar:
# .env
# .env.local
# .env.production
```

---

## 🔄 WORKFLOW DE DESENVOLVIMENTO

### **Comandos Diários:**

```bash
# 1. Ver status
git status

# 2. Adicionar mudanças
git add .

# 3. Commit com mensagem descritiva
git commit -m "feat: adiciona funcionalidade X"

# 4. Enviar para GitHub
git push origin main
```

### **Tipos de Commit (Conventional Commits):**

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudança na documentação
- `chore:` - Tarefas de manutenção
- `refactor:` - Refatoração de código
- `test:` - Adicionar/modificar testes
- `style:` - Formatação de código

**Exemplos:**

```bash
git commit -m "feat: adiciona endpoint de relatórios"
git commit -m "fix: corrige identificação de morador Gran Marine 2"
git commit -m "docs: atualiza FAQ de produção"
git commit -m "chore: atualiza dependências"
```

---

## 🌿 BRANCHES (OPCIONAL)

Para desenvolvimento mais organizado:

```bash
# Criar branch para nova feature
git checkout -b feature/multi-tenant

# Trabalhar na branch...
git add .
git commit -m "feat: adiciona suporte multi-tenant"

# Voltar para main e fazer merge
git checkout main
git merge feature/multi-tenant

# Deletar branch após merge
git branch -d feature/multi-tenant
```

---

## 🚀 DEPLOY A PARTIR DO GIT

### **VPS com Git:**

```bash
# Na VPS
git clone https://github.com/SEU-USUARIO/vetric-cve.git
cd vetric-cve

# Backend
cd apps/backend
npm install
cp ../ENV_EXAMPLE.txt .env
# Editar .env com credenciais de produção
npm run build
pm2 start dist/index.js --name vetric-backend

# Frontend
cd ../frontend
npm install
npm run build
# Servir com Nginx
```

---

## 📊 VERIFICAR TAMANHO DO REPO

```bash
# Ver tamanho dos arquivos
du -sh *

# Ver histórico de commits
git log --oneline

# Ver branches
git branch -a
```

---

## 🆘 PROBLEMAS COMUNS

### **Problema 1: "remote origin already exists"**

```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/vetric-cve.git
```

### **Problema 2: Arquivo muito grande**

```bash
# Ver arquivos grandes
git ls-files | xargs ls -lh | sort -k5 -hr | head -20

# Remover do histórico (cuidado!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch CAMINHO/DO/ARQUIVO' \
  --prune-empty --tag-name-filter cat -- --all
```

### **Problema 3: Esqueci de adicionar ao .gitignore**

```bash
# Remover do Git mas manter localmente
git rm --cached arquivo_ou_pasta
git commit -m "chore: remove arquivo do git"
```

---

## ✅ PRÓXIMOS PASSOS

Após configurar o Git:

1. **Configurar CI/CD** (GitHub Actions)
2. **Adicionar badges** no README (status, cobertura)
3. **Configurar branch protection** (main protegida)
4. **Adicionar colaboradores** (se houver)

---

## 🎯 RESUMO

**Opção Recomendada:** 1 repositório com 2 projetos

**Comandos Essenciais:**

```bash
# Setup inicial
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/vetric-cve.git
git push -u origin main

# Dia a dia
git status
git add .
git commit -m "feat: descrição"
git push
```

---

**Pronto para versionar! 🚀**

Qualquer dúvida, consulte: https://git-scm.com/doc


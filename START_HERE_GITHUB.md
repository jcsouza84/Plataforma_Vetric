# 🚀 VETRIC - COMECE AQUI PARA GITHUB

**Objetivo:** Colocar seu projeto no GitHub em 5 minutos.

---

## ✅ PROJETO JÁ ESTÁ ORGANIZADO!

```
✅ Backend e Frontend em apps/
✅ Documentação organizada
✅ .gitignore configurado
✅ README criado
✅ Pronto para Git!
```

---

## 🎯 3 PASSOS PARA COLOCAR NO GITHUB

### **PASSO 1: Criar Repositório no GitHub (2 min)**

1. Acesse: https://github.com/new
2. Preencha:
   - **Nome:** `vetric-cve`
   - **Descrição:** `Plataforma de Gestão de Carregadores Elétricos`
   - **Visibilidade:** Private ✅
   - **NÃO** marque nenhuma opção (README, .gitignore, etc)
3. Clique em **"Create repository"**

### **PASSO 2: Abrir Terminal (10 seg)**

Abra o Terminal e entre na pasta do projeto:

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
```

### **PASSO 3: Enviar para GitHub (2 min)**

Cole estes comandos no Terminal (um de cada vez ou todos juntos):

```bash
# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "chore: initial commit - backend + frontend + docs organizados"

# Renomear branch para main
git branch -M main

# Adicionar remote do GitHub (SUBSTITUIR SEU-USUARIO!)
git remote add origin https://github.com/SEU-USUARIO/vetric-cve.git

# Enviar para GitHub
git push -u origin main
```

**⚠️ IMPORTANTE:** Substitua `SEU-USUARIO` pelo seu username do GitHub!

---

## 🎉 PRONTO!

Seu projeto está no GitHub!

Acesse: `https://github.com/SEU-USUARIO/vetric-cve`

---

## 📝 COMANDOS DO DIA A DIA

Sempre que fizer mudanças no código:

```bash
# 1. Ver o que mudou
git status

# 2. Adicionar mudanças
git add .

# 3. Commit com mensagem
git commit -m "feat: adiciona nova funcionalidade"

# 4. Enviar para GitHub
git push
```

---

## 🔐 IMPORTANTE - SEGURANÇA

### ✅ O QUE ESTÁ SENDO VERSIONADO:

- Código-fonte (backend e frontend)
- Documentação
- Configurações (package.json, tsconfig, etc)
- README e guias

### ❌ O QUE **NÃO** ESTÁ SENDO VERSIONADO:

- `.env` (credenciais) ← NUNCA VAI PRO GIT
- `node_modules/` (dependências)
- `dist/` e `build/` (arquivos compilados)
- Logs e arquivos temporários

**Verificar antes de commitar:**

```bash
git status

# Se aparecer .env na lista, PARE!
# Verifique se ele está no .gitignore
```

---

## 🆘 PROBLEMAS?

### **Erro: "remote origin already exists"**

```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/vetric-cve.git
git push -u origin main
```

### **Erro: "Permission denied"**

Configure suas credenciais do GitHub:

```bash
# Configurar nome
git config --global user.name "Seu Nome"

# Configurar email
git config --global user.email "seu-email@exemplo.com"
```

### **Erro: "Authentication failed"**

Use um Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Use o token como senha ao fazer push

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Setup completo:** [GIT_SETUP.md](./GIT_SETUP.md)
- **Organização:** [ORGANIZACAO_FINAL.md](./ORGANIZACAO_FINAL.md)
- **Projeto:** [README.md](./README.md)

---

## 🎯 PRÓXIMO PASSO: DEPLOY EM VPS

Depois que o projeto estiver no GitHub:

1. Ver [checklist_fase1.md](./checklist_fase1.md)
2. Configurar VPS
3. Clonar do GitHub
4. Deploy com Nginx + PM2

---

## 💡 DICA IMPORTANTE

Sempre que fizer mudanças:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

Tipos de commit:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Atualização de documentação
- `chore:` - Manutenção

Exemplos:
```bash
git commit -m "feat: adiciona relatório de consumo"
git commit -m "fix: corrige identificação de morador"
git commit -m "docs: atualiza FAQ de produção"
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Criei repositório no GitHub
- [ ] Abri o Terminal na pasta do projeto
- [ ] Executei os comandos do PASSO 3
- [ ] Verifiquei no GitHub que os arquivos estão lá
- [ ] `.env` NÃO aparece no GitHub (segurança!)
- [ ] Configurei git config (nome e email)

---

**Tudo certo? Seu projeto está no GitHub! 🎉**

**Próximo:** Deploy em VPS ([checklist_fase1.md](./checklist_fase1.md))

---

**Dúvidas? Consulte [GIT_SETUP.md](./GIT_SETUP.md) para guia completo.**




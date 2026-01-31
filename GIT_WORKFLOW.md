# 🌿 VETRIC - Guia Completo de Git e Branches

Este documento explica **como trabalhar com branches** para nunca perder código funcional.

---

## 🎯 ESTRUTURA DE BRANCHES DO PROJETO

```
main            ← PRODUÇÃO (VPS)
  │             ← Código 100% ESTÁVEL
  │             ← Sempre funcionando
  │
  ├─────────── (merge quando tudo OK)
  │
develop         ← DESENVOLVIMENTO (Cursor)
  │             ← Você trabalha AQUI
  │             ← Testa antes de mandar pra main
  │
  ├─── feature/login-page       (opcional)
  ├─── feature/dashboard        (opcional)
  └─── feature/import-csv       (opcional)
```

---

## 📚 CONCEITOS BÁSICOS

### **1. O que é Branch?**

Branch = **Linha do tempo paralela** do seu código

**Analogia:**
```
Imagine que seu código é um livro:

main     → Versão PUBLICADA (na livraria)
develop  → Rascunho que você está escrevendo
feature  → Capítulo novo que está testando
```

### **2. Por que usar Branches?**

✅ **Protege o código que funciona**
- Se você quebrar algo em `develop`, `main` continua OK

✅ **Permite experimentar**
- Quer testar uma ideia? Crie uma branch!

✅ **Facilita colaboração**
- Cada dev trabalha na sua branch

✅ **Organização**
- Histórico limpo e rastreável

---

## 🔄 WORKFLOW DIÁRIO (Passo a Passo)

### **🌅 Início do Dia (ou nova funcionalidade)**

```bash
# 1. Certificar que está na branch develop
git checkout develop

# 2. Baixar últimas atualizações (se trabalhar em múltiplos lugares)
git pull origin develop

# 3. Criar nova branch para feature (OPCIONAL)
git checkout -b feature/nome-da-funcionalidade
```

---

### **💻 Durante o Desenvolvimento**

```bash
# 1. Fazer modificações no código
# ... editar arquivos no Cursor ...

# 2. Ver o que foi modificado
git status

# 3. Adicionar arquivos ao commit
git add .
# ou específicos:
# git add src/arquivo1.ts src/arquivo2.ts

# 4. Fazer commit com mensagem descritiva
git commit -m "feat: adiciona funcionalidade X"

# 5. Enviar para GitHub (backup automático!)
git push origin develop
```

**💡 Dica:** Faça commits pequenos e frequentes!

```bash
# BOM:
git commit -m "feat: adiciona validação de email"
git commit -m "feat: adiciona máscara de telefone"
git commit -m "fix: corrige bug no formulário"

# RUIM:
git commit -m "mudanças diversas"
```

---

### **✅ Finalizou e está funcionando?**

#### **OPÇÃO A: Desenvolvia em `develop` (mais simples)**

```bash
# 1. Testar tudo localmente
npm run dev

# 2. Mudar para main
git checkout main

# 3. Atualizar main
git pull origin main

# 4. Fazer merge de develop para main
git merge develop

# 5. Enviar para GitHub
git push origin main

# 6. Voltar para develop
git checkout develop
```

#### **OPÇÃO B: Desenvolvia em `feature/X` (mais organizado)**

```bash
# 1. Testar funcionalidade
npm run dev

# 2. Voltar para develop
git checkout develop

# 3. Fazer merge da feature
git merge feature/nome-da-funcionalidade

# 4. Enviar para GitHub
git push origin develop

# 5. Quando develop estiver estável, merge para main
git checkout main
git merge develop
git push origin main

# 6. Deletar feature branch (opcional)
git branch -d feature/nome-da-funcionalidade
```

---

## 🚨 CENÁRIOS COMUNS

### **1. "Fiz uma mudança errada, quero voltar!"**

#### **Antes de commit:**
```bash
# Descartar mudanças de um arquivo
git checkout -- arquivo.ts

# Descartar TODAS as mudanças
git reset --hard
```

#### **Depois de commit (mas antes de push):**
```bash
# Voltar 1 commit (mantém mudanças)
git reset --soft HEAD~1

# Voltar 1 commit (DESCARTA mudanças)
git reset --hard HEAD~1
```

#### **Depois de push:**
```bash
# Reverter commit específico
git revert <hash-do-commit>
git push origin develop
```

---

### **2. "Quero testar algo mas não quero perder meu código atual"**

```bash
# Criar branch experimental
git checkout -b experimento

# Fazer mudanças...
# ... editar código ...

# Se deu certo:
git checkout develop
git merge experimento

# Se não deu certo:
git checkout develop
git branch -D experimento  # Deleta e descarta mudanças
```

---

### **3. "Trabalhei em duas funcionalidades ao mesmo tempo e commitei tudo junto"**

**Como evitar:**
```bash
# Adicionar arquivos específicos
git add src/funcionalidade1.ts
git commit -m "feat: funcionalidade 1"

git add src/funcionalidade2.ts
git commit -m "feat: funcionalidade 2"
```

---

### **4. "Preciso pausar o que estou fazendo para corrigir bug urgente"**

```bash
# Guardar mudanças atuais (stash)
git stash

# Criar branch para fix
git checkout -b hotfix/bug-urgente

# Corrigir bug...
git add .
git commit -m "fix: corrige bug urgente"

# Merge para main
git checkout main
git merge hotfix/bug-urgente
git push origin main

# Voltar para desenvolvimento
git checkout develop

# Recuperar mudanças guardadas
git stash pop
```

---

## 📊 CONVENÇÕES DE COMMIT

Use mensagens padronizadas:

```bash
# Features (novas funcionalidades)
git commit -m "feat: adiciona página de login"

# Fixes (correção de bugs)
git commit -m "fix: corrige erro no formulário"

# Docs (documentação)
git commit -m "docs: atualiza README"

# Style (formatação, sem mudança de lógica)
git commit -m "style: formata código com prettier"

# Refactor (refatoração de código)
git commit -m "refactor: simplifica lógica de autenticação"

# Test (adiciona ou corrige testes)
git commit -m "test: adiciona testes para login"

# Chore (tarefas de manutenção)
git commit -m "chore: atualiza dependências"
```

---

## 🏗️ ESTRATÉGIAS POR TIPO DE PROJETO

### **Para VETRIC (nosso caso):**

#### **Fase 3 (Desenvolvimento Frontend - ATUAL):**

```bash
# Trabalhar em develop
git checkout develop

# Desenvolver login, dashboard, etc
# ... codificar ...

# Commits frequentes
git add .
git commit -m "feat: adiciona página de login"
git push origin develop

# Quando TUDO funcionar → merge para main
git checkout main
git merge develop
git push origin main
```

#### **Futuro (Múltiplas features simultâneas):**

```bash
# Branch para cada funcionalidade
git checkout -b feature/login-page
git checkout -b feature/dashboard-admin
git checkout -b feature/import-csv

# Cada uma desenvolve independente
# Quando pronta → merge para develop
# Quando develop estável → merge para main
```

---

## 🎯 COMANDOS ESSENCIAIS - RESUMO

### **Navegação:**
```bash
git branch                    # Listar branches
git branch -a                 # Listar todas (incluindo remotas)
git checkout develop          # Mudar para develop
git checkout -b nova-branch   # Criar e mudar
```

### **Atualização:**
```bash
git pull origin develop       # Baixar mudanças
git fetch origin              # Buscar mudanças (sem merge)
```

### **Commit:**
```bash
git status                    # Ver mudanças
git add .                     # Adicionar todos
git add arquivo.ts            # Adicionar específico
git commit -m "mensagem"      # Commitar
git push origin develop       # Enviar
```

### **Merge:**
```bash
git merge outra-branch        # Trazer mudanças de outra branch
git merge --no-ff develop     # Merge com commit (recomendado)
```

### **Desfazer:**
```bash
git reset --hard              # Descartar TODAS as mudanças
git reset --soft HEAD~1       # Voltar 1 commit (mantém mudanças)
git stash                     # Guardar mudanças temporariamente
git stash pop                 # Recuperar mudanças guardadas
```

### **Informação:**
```bash
git log                       # Ver histórico
git log --oneline             # Histórico resumido
git diff                      # Ver diferenças não commitadas
git show <hash>               # Ver commit específico
```

---

## 🔥 REGRAS DE OURO

### **✅ SEMPRE:**

1. **Trabalhe em `develop`**, não em `main`
2. **Commit frequentemente** (pequenos commits)
3. **Mensagens descritivas** nos commits
4. **Teste antes de merge** para main
5. **Pull antes de push** (evita conflitos)

### **❌ NUNCA:**

1. **Nunca commite** `.env` (senhas!)
2. **Nunca faça** `git push --force` em main
3. **Nunca commite** código quebrado em main
4. **Nunca delete** `.git/` (perde todo histórico)
5. **Nunca trabalhe** direto em main

---

## 🎓 DICAS AVANÇADAS

### **1. Alias (atalhos):**

```bash
# Configurar atalhos
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# Usar:
git st     # = git status
git co develop   # = git checkout develop
```

### **2. Ver histórico visual:**

```bash
git log --graph --oneline --all
```

### **3. Buscar em commits:**

```bash
# Buscar por mensagem
git log --grep="login"

# Buscar por código
git log -S "função_especifica"
```

---

## 📖 WORKFLOW VETRIC - EXEMPLO PRÁTICO

### **Cenário: Você vai desenvolver a página de login**

```bash
# 1. Certificar que está em develop
git checkout develop

# 2. Criar branch para feature (OPCIONAL)
git checkout -b feature/login-page

# 3. Criar arquivo de login
# Cursor: criar src/pages/Login.tsx

# 4. Commitar
git add src/pages/Login.tsx
git commit -m "feat: cria estrutura da página de login"

# 5. Implementar formulário
# Cursor: adicionar form, validação, etc

# 6. Commitar novamente
git add .
git commit -m "feat: adiciona formulário de login com validação"

# 7. Conectar com API
# Cursor: integrar com /api/auth/login

# 8. Commitar
git add .
git commit -m "feat: integra login com API backend"

# 9. Testar tudo
npm run dev
# ... testar ...

# 10. Se funcionou: merge para develop
git checkout develop
git merge feature/login-page

# 11. Push para GitHub (backup!)
git push origin develop

# 12. Quando develop estiver 100%: merge para main
git checkout main
git merge develop
git push origin main

# 13. Deploy na VPS
# ssh deploy@VPS
# cd Plataforma_Vetric
# ./scripts/deploy.sh
```

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### **"ERRO: Your branch is behind 'origin/develop'"**

```bash
git pull origin develop
```

### **"ERRO: Merge conflict"**

```bash
# 1. Ver arquivos em conflito
git status

# 2. Editar arquivos (Cursor mostra os conflitos)
# Escolher qual código manter

# 3. Adicionar resolvidos
git add arquivo-resolvido.ts

# 4. Continuar merge
git commit
```

### **"ERRO: Permission denied (publickey)"**

```bash
# Usar HTTPS ao invés de SSH
git remote set-url origin https://github.com/jcsouza84/Plataforma_Vetric.git
```

---

## ✅ CHECKLIST DIÁRIO

Antes de começar a trabalhar:
- [ ] `git checkout develop`
- [ ] `git pull origin develop`

Durante o desenvolvimento:
- [ ] Commits pequenos e frequentes
- [ ] Mensagens descritivas
- [ ] Testar antes de commitar

Fim do dia:
- [ ] `git push origin develop` (backup!)
- [ ] Se algo funcional estiver pronto → merge para main

---

**🎯 Com essa estrutura, você NUNCA perderá código funcional!**

Dúvidas? Consulte este documento ou os comandos acima! 🚀






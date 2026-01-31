# 🔍 COMO VERIFICAR DEPLOY NO RENDER

## Data: 31/01/2026
## Status: Guia Passo a Passo

---

## 📋 PASSO A PASSO VISUAL

### 1️⃣ ACESSAR RENDER DASHBOARD

```
1. Abrir navegador
2. Ir para: https://dashboard.render.com
3. Fazer login (se necessário)
```

---

### 2️⃣ LOCALIZAR SEU SERVIÇO

```
Na página inicial do Render:
  ├── Lista de serviços à esquerda
  ├── Procurar: "vetric" ou nome do seu serviço
  └── Clicar no serviço
```

**Visual esperado:**
```
┌─────────────────────────────────────────┐
│ RENDER DASHBOARD                        │
├─────────────────────────────────────────┤
│                                         │
│ Services                                │
│  ├── 🟢 vetric-backend   (Web Service) │ ← Clicar aqui
│  ├── 🟢 vetric-frontend  (Static Site) │
│  └── 🟢 vetric-db        (PostgreSQL)  │
│                                         │
└─────────────────────────────────────────┘
```

---

### 3️⃣ VERIFICAR STATUS DO DEPLOY

Ao clicar no serviço, você verá:

```
┌─────────────────────────────────────────────────────┐
│ vetric-backend                           [Settings]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ Status: 🟢 Live                                     │
│                                                     │
│ Latest Deploy:                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔄 In Progress - Building...         2m ago │   │ ← Deploy atual
│  │ main • 1acf2f8 • feat: adiciona sistema... │   │
│  │                                             │   │
│  │ [View Logs]                                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│ Previous Deploys:                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✅ Live                             1h ago  │   │
│  │ main • 1b44b0e • Previous version          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Status possíveis:**
- 🔄 **Building** = Compilando código
- 🔄 **In Progress** = Deploy em andamento
- ✅ **Live** = Deploy concluído com sucesso
- ❌ **Failed** = Deploy falhou (erro)

---

### 4️⃣ VERIFICAR O COMMIT/BRANCH

```
Na seção "Latest Deploy", confirme:

✅ Branch: main
✅ Commit: 1acf2f8
✅ Mensagem: "feat: adiciona sistema de notificações..."

Se aparecer estes dados = CORRETO!
```

---

### 5️⃣ VER LOGS DO BUILD/DEPLOY

```
1. Clicar em [View Logs] no deploy atual
2. Vai abrir página de logs em tempo real
```

**O que você vai ver nos logs:**

```
==> Cloning from https://github.com/jcsouza84/Plataforma_Vetric...
==> Checked out commit 1acf2f8 on branch main
==> Installing dependencies...
==> Building...
==> Running migrations...  ⚠️ IMPORTANTE!
    Running migration: 20260131_criar_mensagens_notificacoes.sql
    Running migration: 20260131_adicionar_campos_carregamentos.sql
    ✅ Migrations completed successfully
==> Deploy successful
==> Your service is live at https://vetric-xyz.onrender.com
```

**🎯 Procure por:**
- ✅ "Running migration: 20260131_criar_mensagens_notificacoes.sql"
- ✅ "Running migration: 20260131_adicionar_campos_carregamentos.sql"
- ✅ "Migrations completed successfully"
- ✅ "Deploy successful"

---

### 6️⃣ VERIFICAR SE ESTÁ LIVE

```
Quando deploy concluir:

┌─────────────────────────────────────────┐
│ Latest Deploy:                          │
│  ┌─────────────────────────────────────┐│
│  │ ✅ Live                     5m ago  ││
│  │ main • 1acf2f8                      ││
│  │ feat: adiciona sistema...           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

Status mudou de:
  🔄 In Progress → ✅ Live
```

---

## 🔍 CHECKLIST DE VERIFICAÇÃO

### No Render Dashboard:

```
□ Serviço aparece como 🟢 Live
□ Latest Deploy mostra commit 1acf2f8
□ Latest Deploy mostra branch "main"
□ Mensagem do commit aparece correta
□ Logs mostram "Migrations completed successfully"
□ Logs mostram "Deploy successful"
□ Não há erros vermelhos nos logs
```

---

## 🗂️ ABAS IMPORTANTES NO RENDER

### Após clicar no serviço:

```
┌─────────────────────────────────────────┐
│ [Events] [Logs] [Shell] [Settings]     │
└─────────────────────────────────────────┘
```

### 1. **Events** (Aba principal)
```
Mostra:
  - Status atual (Live, Building, etc.)
  - Histórico de deploys
  - Commit de cada deploy
  - Tempo de cada deploy
```

### 2. **Logs**
```
Mostra:
  - Logs da aplicação rodando
  - Console.log do seu código
  - Erros em tempo real
  - Migrations sendo executadas
```

### 3. **Shell**
```
Permite:
  - Acessar terminal do container
  - Rodar comandos manualmente
  - Verificar arquivos
  - ⚠️ Use com cuidado!
```

### 4. **Settings**
```
Configurações:
  - Environment variables
  - Auto-deploy settings
  - Branch para deploy
  - Health check path
```

---

## 🔍 COMO VERIFICAR AS MIGRATIONS

### Opção 1: Via Logs do Render

```
1. Render Dashboard → Seu serviço
2. Clicar no deploy atual
3. Ver logs
4. Procurar por:

   "Running migrations..."
   "Running migration: 20260131_criar_mensagens_notificacoes.sql"
   "Running migration: 20260131_adicionar_campos_carregamentos.sql"
   "✅ Migrations completed successfully"
```

### Opção 2: Via Banco de Dados

```bash
# Conectar ao banco de produção
psql postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db

# Verificar tabela criada
\dt mensagens_notificacoes

# Ver dados
SELECT * FROM mensagens_notificacoes;

# Verificar campos em carregamentos
\d carregamentos
```

---

## 🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema 1: Deploy em "Building" há muito tempo (>15 min)

**Causa:** Build travou ou erro

**Solução:**
```
1. Ver logs (botão [View Logs])
2. Procurar linha com "Error" ou "Failed"
3. Se travou, cancelar deploy:
   - Settings → Manual Deploy → Cancel
```

---

### Problema 2: Deploy Failed (❌)

**Causa:** Erro na migration ou compilação

**Solução:**
```
1. Ver logs para identificar erro
2. Se for migration:
   - Verificar sintaxe SQL
   - Verificar se tabela já existe
   - Rodar migration manualmente no banco

3. Se for compilação:
   - Verificar erros TypeScript
   - Verificar dependências

4. Fazer rollback:
   - Render → Previous Deploys → escolher anterior
   - Clicar [Rollback to this deploy]
```

---

### Problema 3: Deploy OK mas site não funciona

**Causa:** Aplicação com erro em runtime

**Solução:**
```
1. Ver logs da aplicação (aba Logs)
2. Procurar por erros
3. Verificar environment variables
4. Testar endpoints específicos
```

---

## 📊 COMO SABER SE DEU TUDO CERTO

### ✅ Checklist Final:

```
1. Render Dashboard mostra:
   □ Status: 🟢 Live
   □ Commit: 1acf2f8
   □ Branch: main
   □ Logs: "Deploy successful"
   □ Logs: "Migrations completed"

2. Site acessível:
   □ https://vetric.onrender.com abre
   □ Páginas carregam normalmente
   □ Não há erros no console

3. Banco de dados:
   □ Tabela mensagens_notificacoes existe
   □ 4 mensagens inseridas
   □ Campos em carregamentos adicionados

4. Funcionalidade:
   □ Sistema antigo funciona
   □ Moradores podem carregar
   □ Dashboard funciona
   □ Notificações antigas funcionam
```

---

## 🎯 RESUMO VISUAL

```
RENDER DASHBOARD
    ↓
Clicar em "vetric-backend"
    ↓
Ver "Latest Deploy"
    ↓
Confirmar:
  ✅ Status: Live
  ✅ Branch: main
  ✅ Commit: 1acf2f8
    ↓
Clicar "View Logs"
    ↓
Procurar:
  ✅ "Running migrations..."
  ✅ "Migrations completed"
  ✅ "Deploy successful"
    ↓
✅ TUDO CERTO!
```

---

## 📱 COMO MONITORAR EM TEMPO REAL

### Deixe aberto no navegador:

```
Tab 1: Render Dashboard (página do serviço)
  → Atualiza status automaticamente

Tab 2: Logs do deploy
  → Ver progresso em tempo real
  
Tab 3: Site ao vivo
  → Testar após deploy
  
Tab 4: Banco de dados (cliente SQL)
  → Validar migrations
```

---

## ⏱️ TEMPO ESTIMADO DE CADA FASE

```
🔄 Cloning:        30s
🔄 Installing:     2-3 min
🔄 Building:       3-5 min
🔄 Migrations:     10-30s  ⚠️ CRÍTICO
🔄 Deploying:      1-2 min
✅ Live:           Total ~10-15 min
```

---

## 🆘 LINKS ÚTEIS

```
Render Dashboard:
https://dashboard.render.com

Seu serviço específico:
https://dashboard.render.com/web/[SEU_SERVICE_ID]

Documentação Render:
https://render.com/docs/deploys

Status Render (se tiver problemas):
https://status.render.com
```

---

## ✅ CONFIRMAÇÃO FINAL

**Quando ver isso no Render:**

```
┌─────────────────────────────────────────┐
│ vetric-backend               🟢 Live    │
├─────────────────────────────────────────┤
│ Latest Deploy:                          │
│  ✅ Live - 3 minutes ago                │
│  main • 1acf2f8                         │
│  feat: adiciona sistema de notificações│
│                                         │
│  Logs:                                  │
│    ✅ Build successful                  │
│    ✅ Migrations completed              │
│    ✅ Deploy successful                 │
│    ✅ Service is live                   │
└─────────────────────────────────────────┘
```

**= TUDO CERTO! PODE TESTAR! 🚀**

---

**Data:** 31/01/2026  
**Status:** 📋 Guia Completo de Verificação  
**Próximo:** Validar e começar testes


# 🗃️ COMO EXECUTAR AS MIGRATIONS NO RENDER

## 📍 ONDE EXECUTAR OS SQLs

Você tem **2 opções** para executar as migrations:

---

### **OPÇÃO 1: Via Render Dashboard (Recomendado)** ✅

1. Acesse: https://dashboard.render.com
2. Clique em **"vetric-db"** (seu PostgreSQL)
3. Clique em **"Connect"** (botão azul no canto superior direito)
4. Escolha **"External Connection"**
5. Copie a **CONNECTION STRING** que aparece
6. Use um cliente SQL como:
   - **pgAdmin** (https://www.pgadmin.org/)
   - **DBeaver** (https://dbeaver.io/)
   - **psql** (linha de comando)

---

### **OPÇÃO 2: Via Terminal com psql** 🖥️

Se você tem `psql` instalado:

```bash
# Conectar ao banco
psql "postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.render.com/vetric_db"

# Depois de conectado, copie e cole cada SQL
```

---

## 📝 PASSO A PASSO

### **1️⃣ Executar Migration 1**

**Arquivo:** `migration-1-criar-mensagens.sql`

Copie TODO o conteúdo e execute no console SQL.

**✅ Resultado esperado:** 4 linhas mostrando as mensagens criadas.

---

### **2️⃣ Executar Migration 2**

**Arquivo:** `migration-2-adicionar-campos.sql`

Copie TODO o conteúdo e execute no console SQL.

**✅ Resultado esperado:** 8 linhas mostrando os novos campos.

---

## 🎯 DEPOIS DAS MIGRATIONS

Quando você executar as migrations, me avise! 

Eu vou criar a **INTERFACE** para você editar as mensagens diretamente no admin! 🎨

---

## 💡 DICA RÁPIDA

**Se tiver dúvida de qual opção usar:**

- ✅ Use **pgAdmin** ou **DBeaver** (interfaces visuais fáceis)
- Conecte com a CONNECTION STRING do Render
- Copie e cole os SQLs dos arquivos
- Execute!

---

**Arquivos criados:**
- ✅ `migration-1-criar-mensagens.sql` (copie e cole este primeiro)
- ✅ `migration-2-adicionar-campos.sql` (depois copie e cole este)

**Precisa de ajuda para instalar um cliente SQL?** Me avise! 😊


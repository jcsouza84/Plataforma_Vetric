# 🔐 ONDE PEGAR A DATABASE_URL

## 📍 PASSO A PASSO COM IMAGENS

---

### **1️⃣ Acessar o Render Dashboard**

Abra no navegador:
```
https://dashboard.render.com
```

---

### **2️⃣ Clicar no banco de dados**

Na lista de recursos, procure por:
- **"vetric-db"** (PostgreSQL)

Clique nele!

---

### **3️⃣ Copiar a URL de conexão**

Você vai ver uma página com várias informações. Procure por:

**"Internal Database URL"** 
ou
**"External Database URL"**

Tem um ícone de **"Copy"** (📋) do lado.

**Clique em "Copy"** para copiar a URL!

---

## 🔍 A URL VAI SER ASSIM:

```
postgresql://vetric_user:SENHA_AQUI@dpg-XXXXX.render.com/vetric_db
```

**IMPORTANTE:** 
- ✅ Use a **"Internal Database URL"** se tiver
- ✅ Ou a **"External Database URL"** (ambas funcionam)

---

## 📸 ONDE ESTÁ NA TELA:

A URL fica na seção **"Connections"** ou **"Info"** da página do banco de dados.

Geralmente aparece assim:

```
┌─────────────────────────────────────────┐
│ Internal Database URL                   │
│ postgresql://vetric_user:xxx@dpg...    │
│ [Copy] 📋                               │
└─────────────────────────────────────────┘
```

---

## ✅ DEPOIS DE COPIAR:

**Cole a URL aqui no chat** e eu executo as migrations pra você!

Ou execute você mesmo:
```bash
node executar-migrations-simples.js
```

E cole quando o script pedir!

---

**Está vendo a tela do Render? Me diz o que você está vendo!** 😊


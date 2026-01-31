# 🚀 EXECUTAR MIGRATIONS - SUPER FÁCIL!

## 📋 VOCÊ SÓ PRECISA FAZER 3 COISAS:

---

### **1️⃣ Pegar a DATABASE_URL do Render**

1. Abra: https://dashboard.render.com
2. Clique em **"vetric-db"**
3. Procure por **"Internal Database URL"**
4. Clique em **"Copy"** (copiar)

**Vai ser algo assim:**
```
postgresql://vetric_user:senha@dpg-xxxxx.render.com/vetric_db
```

---

### **2️⃣ Executar o script no Terminal**

Abra o Terminal e digite:

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
node executar-migrations-simples.js
```

---

### **3️⃣ Colar a DATABASE_URL**

Quando o script pedir, **cole a URL** que você copiou no passo 1.

**Pronto! O script vai fazer TUDO automaticamente! ✨**

---

## ✅ O QUE VAI ACONTECER

O script vai:
- ✅ Conectar no banco de dados
- ✅ Criar a tabela de mensagens
- ✅ Inserir 4 mensagens padrão (DESLIGADAS)
- ✅ Adicionar 8 campos em "carregamentos"
- ✅ Criar todos os índices

---

## 🎯 DEPOIS DISSO

Quando terminar, **me avise aqui** e eu crio a interface para você editar as mensagens no admin! 🎨

---

**É só isso! 3 passos simples! 😊**


# 🔧 VARIÁVEL DE AMBIENTE FALTANDO NO FRONTEND!

## ❌ PROBLEMA IDENTIFICADO:

O frontend **NÃO SABE** qual é a URL do backend!

### **Código atual (`api.ts`):**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Se `VITE_API_URL` não estiver configurada, o frontend tenta acessar `localhost:3001` (que não existe)!

Por isso o erro 404 - o frontend está fazendo request para o lugar errado!

---

## ✅ SOLUÇÃO: Configurar no Render

### **PASSO A PASSO:**

1. **Acesse:** https://dashboard.render.com

2. **Clique em "Plataforma_Vetric"** (o frontend/static site)

3. **Vá em "Environment"** (menu lateral esquerdo)

4. **Adicione a variável:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://vetric-backend.onrender.com`

5. **Clique em "Save Changes"**

6. **O Render vai fazer rebuild automaticamente** (2-3 min)

7. **Aguarde o deploy** ficar "Live" (verde)

8. **Teste novamente** na aba anônima

---

## 📊 RESULTADO ESPERADO:

Depois do rebuild com a variável configurada:

**ANTES:**
```
❌ Frontend → http://localhost:3001/api/mensagens-notificacoes (404)
```

**DEPOIS:**
```
✅ Frontend → https://vetric-backend.onrender.com/api/mensagens-notificacoes (200)
```

---

## 🎯 AÇÃO IMEDIATA:

**Você precisa:**
1. Entrar no Render Dashboard
2. Configurar "Plataforma_Vetric" → Environment
3. Adicionar `VITE_API_URL=https://vetric-backend.onrender.com`
4. Aguardar rebuild
5. Testar novamente

---

**Essa é a causa raiz do problema! Configure a variável e vai funcionar! 🚀**


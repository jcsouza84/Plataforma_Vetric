# ⚠️ PROBLEMA: Render não está buildando o Frontend corretamente (MONOREPO)

## 🐛 SINTOMA:

Console mostra **centenas de erros** `net::ERR_FILE_NOT_FOUND` para arquivos JS/CSS.

Isso significa que o **build está falhando** ou os arquivos estão no **lugar errado**.

---

## 🎯 CAUSA RAIZ:

O projeto é um **MONOREPO**:
```
/
├── apps/
│   ├── frontend/  ← O Render precisa buildar AQUI
│   └── backend/
```

Mas o Render está tentando buildar na **RAIZ** do repositório!

---

## ✅ CONFIGURAÇÕES CORRETAS DO RENDER (Frontend):

### **1. Root Directory** ⚠️ CRÍTICO
```
apps/frontend
```

### **2. Build Command**
```bash
npm install && npm run build
```

### **3. Publish Directory**
```
dist
```
(relativo ao Root Directory, então será `apps/frontend/dist`)

### **4. Environment Variables**
```
VITE_API_URL=https://vetric-backend.onrender.com
```

---

## 📋 COMO CONFIGURAR NO RENDER:

1. **Render Dashboard** → **Plataforma_Vetric**
2. **Settings** (menu lateral)
3. Procure por **"Root Directory"**
4. **MUDE PARA:** `apps/frontend`
5. Verifique **"Build Command":** `npm install && npm run build`
6. Verifique **"Publish Directory":** `dist`
7. **Save Changes**
8. Aguarde rebuild automático

---

## 🎯 ISSO VAI RESOLVER:

Ao configurar o **Root Directory**, o Render vai:
1. ✅ Entrar em `apps/frontend/`
2. ✅ Rodar `npm install` (instala dependências do frontend)
3. ✅ Rodar `npm run build` (compila o Vite)
4. ✅ Publicar a pasta `dist` gerada

**SEM** o Root Directory, o Render está:
1. ❌ Na raiz do projeto
2. ❌ Tentando buildar sem as dependências corretas
3. ❌ Gerando arquivos no lugar errado
4. ❌ Resultando em 404 para todos os assets

---

## 📸 ONDE ENCONTRAR:

**Render Dashboard:**
```
Plataforma_Vetric → Settings → Build & Deploy → Root Directory
```

Deve estar **VAZIO** ou **/** (errado)

**Mude para:** `apps/frontend`

---

## ⏱️ DEPOIS DE CONFIGURAR:

1. Save Changes
2. Aguarde rebuild (2-3 min)
3. Limpe o cache do navegador
4. **VAI FUNCIONAR!** 🎉

---

**ESSA É A CAUSA RAIZ! Configure o Root Directory AGORA!** 🎯


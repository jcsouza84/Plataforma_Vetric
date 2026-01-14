# 🎨 Como Mudar Favicon e Título do VETRIC

**Data:** 14 de Janeiro de 2026  
**Objetivo:** Trocar o ícone e título da aba do navegador

---

## 📋 O QUE VOCÊ QUER FAZER:

### **Situação Atual:**
- ❤️ Ícone: Coração vermelho
- 📝 Título: "VETRIC Síndico - Plataforma de Gestão de Consumo"

### **Situação Desejada:**
- ⚡ Ícone: Logo VETRIC (verde/azul)
- 📝 Título: "VETRIC - Plataforma do Síndico"

---

## 🎯 PASSO A PASSO

### **1️⃣ Preparar o Favicon (Ícone)**

#### **O que é o favicon?**
É o pequeno ícone que aparece na aba do navegador (normalmente 16x16 ou 32x32 pixels).

#### **Formato recomendado:**
- ✅ `.ico` (melhor compatibilidade)
- ✅ `.png` (funciona também)
- ✅ `.svg` (funciona, mais moderno)

---

#### **Opção A: Usar Conversor Online (Recomendado)**

1. **Salvar a logo anexada** como arquivo (ex: `vetric-logo.png`)

2. **Acessar conversor online:**
   - https://favicon.io/favicon-converter/
   - https://realfavicongenerator.net/
   - https://convertio.co/png-ico/

3. **Upload da logo VETRIC**

4. **Configurações recomendadas:**
   - Tamanho: 32x32 (favicon básico)
   - Tamanho: 180x180 (Apple touch icon)
   - Tamanho: 192x192 (Android)
   - Formato: ICO ou PNG

5. **Download dos arquivos gerados:**
   ```
   favicon.ico          (32x32)
   favicon-16x16.png    (opcional)
   favicon-32x32.png    (opcional)
   apple-touch-icon.png (180x180)
   android-chrome-192x192.png
   android-chrome-512x512.png
   ```

---

#### **Opção B: Criar Manualmente (Photoshop/Figma)**

**No Photoshop:**

1. Abrir logo VETRIC
2. Image → Image Size → 32x32 pixels
3. File → Save As → Escolher formato:
   - `.png` (mais fácil)
   - `.ico` (precisa de plugin)
4. Salvar como `favicon.png` ou `favicon.ico`

**No Figma:**

1. Criar frame 32x32
2. Importar/desenhar logo VETRIC
3. Export → PNG ou SVG
4. Renomear para `favicon.png`

---

### **2️⃣ Substituir o Favicon no Projeto**

#### **Localização atual:**
```
/Users/juliocesarsouza/Desktop/vetric-interface/public/favicon.ico
```

#### **Substituir o arquivo:**

**Via Finder (Mac):**

```bash
1. Abrir Finder
2. Ir até: /Users/juliocesarsouza/Desktop/vetric-interface/public/
3. Arrastar novo favicon.ico para a pasta (substituir o antigo)
```

**Via Terminal:**

```bash
# Navegar até a pasta
cd /Users/juliocesarsouza/Desktop/vetric-interface/public/

# Fazer backup do antigo (opcional)
mv favicon.ico favicon-old.ico

# Copiar novo favicon
# (Assumindo que você salvou o novo favicon em ~/Downloads/)
cp ~/Downloads/favicon.ico ./favicon.ico

# Ou se for PNG:
cp ~/Downloads/vetric-logo.png ./favicon.png
```

---

### **3️⃣ Adicionar Referência no HTML (Se necessário)**

Editar o arquivo:
```
/Users/juliocesarsouza/Desktop/vetric-interface/index.html
```

**Adicionar antes do `</head>`:**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- 📝 MUDAR TÍTULO AQUI -->
    <title>VETRIC - Plataforma do Síndico</title>
    
    <!-- 🎨 ADICIONAR REFERÊNCIAS DOS FAVICONS -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    
    <meta name="description" content="Plataforma para síndicos acompanharem o consumo de energia das estações de carregamento de veículos elétricos." />
    <meta name="author" content="VETRIC" />
    
    <!-- Open Graph (Facebook, WhatsApp) -->
    <meta property="og:title" content="VETRIC - Plataforma do Síndico" />
    <meta property="og:description" content="Acompanhe o consumo de energia das estações de carregamento do seu empreendimento." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/vetric-logo.png" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="VETRIC - Plataforma do Síndico" />
    <meta name="twitter:image" content="/vetric-logo.png" />
    
    <meta name="theme-color" content="#0d3a5c" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### **4️⃣ Mudar o Título da Página**

#### **Título Estático (Sempre o mesmo):**

No arquivo `index.html` (linha 6), mudar de:

```html
<title>VETRIC Síndico - Plataforma de Gestão de Consumo</title>
```

Para:

```html
<title>VETRIC - Plataforma do Síndico</title>
```

---

#### **Título Dinâmico (Muda por página):**

Se quiser que cada página tenha título diferente:

**Exemplo:**
- Login: "VETRIC - Login"
- Dashboard: "VETRIC - Dashboard"
- Relatórios: "VETRIC - Relatórios"

**Criar arquivo utilitário:**

```typescript
// src/lib/document-title.ts

export function setDocumentTitle(pageTitle?: string) {
  const baseTitle = 'VETRIC - Plataforma do Síndico';
  
  if (pageTitle) {
    document.title = `${pageTitle} | ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
}
```

**Usar nas páginas:**

```typescript
// src/pages/Dashboard.tsx

import { useEffect } from 'react';
import { setDocumentTitle } from '@/lib/document-title';

export function Dashboard() {
  useEffect(() => {
    setDocumentTitle('Dashboard');
    // Título ficará: "Dashboard | VETRIC - Plataforma do Síndico"
  }, []);
  
  return (
    <div>
      {/* Conteúdo do dashboard */}
    </div>
  );
}
```

**Ou usar React Helmet:**

```bash
# Instalar
npm install react-helmet-async
```

```typescript
// src/pages/Dashboard.tsx

import { Helmet } from 'react-helmet-async';

export function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | VETRIC - Plataforma do Síndico</title>
      </Helmet>
      
      <div>
        {/* Conteúdo do dashboard */}
      </div>
    </>
  );
}
```

---

### **5️⃣ Limpar Cache do Navegador**

Após fazer as mudanças, o navegador pode estar usando o favicon antigo em cache.

#### **Forçar atualização (Hard Refresh):**

**Chrome/Edge (Mac):**
```
Cmd + Shift + R
```

**Chrome/Edge (Windows):**
```
Ctrl + Shift + R
```

**Firefox:**
```
Ctrl + F5  (Windows)
Cmd + Shift + R  (Mac)
```

**Safari:**
```
Cmd + Option + R
```

---

#### **Limpar cache manualmente:**

**Chrome:**

```
1. DevTools (F12)
2. Right-click no botão Reload
3. Escolher "Empty Cache and Hard Reload"
```

Ou:

```
1. Chrome → Settings
2. Privacy and security
3. Clear browsing data
4. Cached images and files → Clear data
```

---

### **6️⃣ Verificar se Funcionou**

#### **Checklist:**

- [ ] Favicon mudou para logo VETRIC?
- [ ] Título mudou para "VETRIC - Plataforma do Síndico"?
- [ ] Favicon aparece em todas as abas?
- [ ] Quando compartilha no WhatsApp/Facebook, aparece logo correta?

---

## 🎨 ARQUIVOS NECESSÁRIOS (Completo)

Para uma implementação profissional, tenha estes arquivos na pasta `public/`:

```
public/
├── favicon.ico                    # 32x32 (navegadores antigos)
├── favicon-16x16.png              # 16x16
├── favicon-32x32.png              # 32x32
├── apple-touch-icon.png           # 180x180 (iOS)
├── android-chrome-192x192.png     # 192x192 (Android)
├── android-chrome-512x512.png     # 512x512 (Android)
├── site.webmanifest               # Manifest para PWA
└── robots.txt
```

---

### **Criar site.webmanifest:**

```json
{
  "name": "VETRIC - Plataforma do Síndico",
  "short_name": "VETRIC",
  "description": "Plataforma para gestão de carregadores de veículos elétricos",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0d3a5c",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

Salvar como: `public/site.webmanifest`

---

## 🚀 PASSO A PASSO RESUMIDO (Quick Start)

### **Jeito Mais Rápido:**

```bash
# 1. Converter logo para favicon
# Ir em: https://favicon.io/favicon-converter/
# Upload da logo anexada
# Download do favicon.ico

# 2. Substituir favicon
cd /Users/juliocesarsouza/Desktop/vetric-interface/public/
# Arrastar novo favicon.ico (substituir o antigo)

# 3. Mudar título
nano /Users/juliocesarsouza/Desktop/vetric-interface/index.html
# Linha 6: Mudar para "VETRIC - Plataforma do Síndico"
# Ctrl+O (salvar), Ctrl+X (sair)

# 4. Reiniciar frontend
# No terminal onde roda o frontend:
# Ctrl+C (parar)
npm run dev  # Iniciar novamente

# 5. Hard refresh no navegador
# Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
```

---

## 🎯 COMANDOS PRÁTICOS

### **Editar index.html:**

```bash
# Via VS Code/Cursor
code /Users/juliocesarsouza/Desktop/vetric-interface/index.html

# Ou via nano
nano /Users/juliocesarsouza/Desktop/vetric-interface/index.html
```

### **Substituir favicon via terminal:**

```bash
cd /Users/juliocesarsouza/Desktop/vetric-interface/public/

# Backup do antigo
cp favicon.ico favicon-old.ico

# Copiar novo (assumindo que está em Downloads)
cp ~/Downloads/favicon.ico ./
```

### **Verificar se arquivo existe:**

```bash
ls -la /Users/juliocesarsouza/Desktop/vetric-interface/public/ | grep favicon
```

---

## 🐛 TROUBLESHOOTING

### **Problema 1: Favicon não muda**

**Solução:**

1. Hard refresh: `Cmd+Shift+R`
2. Limpar cache do navegador
3. Fechar todas as abas do site
4. Abrir em aba privada/anônima
5. Verificar se nome do arquivo está correto: `favicon.ico`

---

### **Problema 2: Título não muda**

**Solução:**

1. Verificar se editou `index.html` corretamente
2. Salvar o arquivo (Ctrl+S)
3. Reiniciar o servidor de desenvolvimento (Ctrl+C → npm run dev)
4. Hard refresh no navegador

---

### **Problema 3: Logo fica distorcida**

**Solução:**

1. Usar logo quadrada (1:1)
2. Tamanho recomendado: 512x512 → converter para 32x32
3. Manter proporção ao redimensionar
4. Usar ferramenta de conversão online

---

### **Problema 4: Favicon funciona local mas não em produção**

**Solução:**

1. Fazer build: `npm run build`
2. Verificar se favicon está em `dist/`
3. Fazer upload do `dist/` completo para servidor
4. Limpar cache do CDN (se usar)
5. Hard refresh no navegador

---

## 📝 EXEMPLO COMPLETO - index.html

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- TÍTULO -->
    <title>VETRIC - Plataforma do Síndico</title>
    
    <!-- FAVICONS -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    
    <!-- META TAGS -->
    <meta name="description" content="Plataforma para síndicos gerenciarem carregadores de veículos elétricos." />
    <meta name="author" content="VETRIC" />
    
    <!-- OPEN GRAPH -->
    <meta property="og:title" content="VETRIC - Plataforma do Síndico" />
    <meta property="og:description" content="Gestão inteligente de carregadores de veículos elétricos." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/vetric-logo.png" />
    
    <!-- TWITTER -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="VETRIC - Plataforma do Síndico" />
    <meta name="twitter:image" content="/vetric-logo.png" />
    
    <!-- THEME COLOR -->
    <meta name="theme-color" content="#0d3a5c" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## ✅ CHECKLIST FINAL

- [ ] **Logo VETRIC convertida para favicon.ico**
- [ ] **favicon.ico copiado para `/public/`**
- [ ] **Título mudado no `index.html`**
- [ ] **Tags `<link rel="icon">` adicionadas**
- [ ] **Servidor de dev reiniciado**
- [ ] **Hard refresh no navegador**
- [ ] **Favicon aparecendo corretamente**
- [ ] **Título correto na aba**
- [ ] **Testado em aba privada**
- [ ] **Build funcionando (`npm run build`)**

---

## 🎉 RESULTADO ESPERADO

Após seguir os passos:

**Na aba do navegador:**
```
[Logo VETRIC verde/azul] VETRIC - Plataforma do Síndico
```

Ao invés de:

```
❤️ VETRIC Síndico - Plataforma de Gestão de Consumo
```

---

**Data:** 14 de Janeiro de 2026  
**Versão:** 1.0  
**Documento:** Guia para Trocar Favicon e Título


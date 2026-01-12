# 🔧 Guia: Capturar Cookies Manualmente

## 📋 Por que fazer isso?

O CVE-PRO usa reCAPTCHA v3, que impede login automático via API. A solução é fazer login manual no navegador e capturar os cookies de sessão.

---

## 🎯 PASSO A PASSO COMPLETO

### **PASSO 1: Fazer Login Manual**

1. Abra o **Chrome**
2. Acesse: https://mundologic.intelbras-cve-pro.com.br/auth/login
3. Faça login normalmente com seu usuário e senha
4. Aguarde até o dashboard carregar completamente

---

### **PASSO 2: Abrir DevTools**

1. Pressione **CMD + Option + I** (Mac)
2. Ou clique com botão direito → **Inspecionar**

---

### **PASSO 3: Ir na Aba Application**

1. No DevTools, clique na aba **Application** (pode estar escondida em » More tools)
2. Na sidebar esquerda, expanda **Storage**
3. Clique em **Cookies**
4. Clique em **`https://mundologic.intelbras-cve-pro.com.br`**

---

### **PASSO 4: Identificar e Copiar Cookies Importantes**

Você verá uma lista de cookies. Procure por:

#### Cookies Essenciais (procure por estes nomes):
- `JSESSIONID` - Cookie de sessão Java
- `session` - Cookie de sessão genérico
- `auth_token` ou `token` - Token de autenticação
- `connect.sid` - Session ID
- Qualquer cookie com domínio `.intelbras-cve-pro.com.br`

#### Como copiar:

Para cada cookie importante:
1. Clique na linha do cookie
2. **Name** (Nome): copie o nome
3. **Value** (Valor): copie o valor
4. Anote no formato: `Nome=Valor`

**Exemplo:**
```
JSESSIONID=71F8B5E4A1234567890ABCDEF
```

---

### **PASSO 5: Verificar se há Token JWT**

Ainda no DevTools:

1. Vá na aba **Application**
2. Expanda **Local Storage** → `https://mundologic.intelbras-cve-pro.com.br`
3. Procure por chaves como: `token`, `auth_token`, `jwt`
4. Se encontrar, copie o valor

OU

1. Vá na aba **Network**
2. Procure pela requisição de login que você fez (status 200)
3. Clique nela
4. Vá em **Response**
5. Procure por um campo `token` no JSON
6. Copie o valor

---

### **PASSO 6: Configurar no Discovery Tool**

1. Abra o arquivo `src/manual-session.ts` no Cursor

2. Cole seus cookies:

```typescript
export const manualSession: ManualSession = {
  // Mude para TRUE
  enabled: true,
  
  // Cole seus cookies aqui
  cookies: [
    "JSESSIONID=71F8B5E4A1234567890ABCDEF",
    "session=s%3A1a2b3c4d5e6f",
    // Adicione todos os cookies que encontrou
  ],
  
  // Se encontrou um token JWT, cole aqui
  token: "hHVJuoITM-_BQPi8Qd4Q1rudu0WR6RBx...",
};
```

3. **Salve o arquivo** (CMD + S)

---

### **PASSO 7: Executar o Discovery Tool**

```bash
npm run dev
```

Agora o sistema vai usar os cookies que você capturou ao invés de tentar fazer login!

---

## ✅ O QUE ESPERAR

Você deve ver:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AUTENTICAÇÃO CVE-PRO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Usando sessão manual (cookies pré-capturados)
✓ 2 cookie(s) carregado(s)
✓ Token JWT carregado
✓ Sessão manual estabelecida com sucesso! ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CONEXÃO WEBSOCKET STOMP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Conectando ao WebSocket STOMP...
✓ Conectado ao STOMP! ✓
```

---

## 🔄 Quando Renovar os Cookies?

Os cookies de sessão expiram após algum tempo (geralmente 24 horas). Se o sistema parar de funcionar:

1. Faça login novamente no navegador
2. Capture novos cookies
3. Atualize `src/manual-session.ts`
4. Execute novamente

---

## 📸 EXEMPLO VISUAL

Quando você abrir Application → Cookies, verá algo assim:

```
Name                Value
─────────────────── ──────────────────────────────────
JSESSIONID          71F8B5E4A1234567890ABCDEF
session             s%3A1a2b3c4d5e6f.abcd1234
_ga                 GA1.2.123456789.1234567890
```

Copie os importantes (JSESSIONID, session, etc.)

---

## ❓ Troubleshooting

### "Nenhum cookie encontrado"
- Certifique-se de que fez login primeiro
- Verifique se está na URL correta no DevTools

### "Sessão manual habilitada mas nenhum cookie configurado"
- Você esqueceu de colar os cookies em `src/manual-session.ts`
- Ou esqueceu de mudar `enabled: true`

### "WebSocket desconecta imediatamente"
- Os cookies podem estar incorretos
- Os cookies podem ter expirado
- Capture novos cookies

---

## 🎯 RESUMO RÁPIDO

```bash
1. Login no Chrome: https://mundologic.intelbras-cve-pro.com.br/auth/login
2. DevTools → Application → Cookies
3. Copiar: JSESSIONID, session, etc.
4. Editar: src/manual-session.ts
5. enabled: true
6. cookies: ["NOME=VALOR", ...]
7. Salvar
8. npm run dev
```

---

**Siga estes passos e me avise quando terminar!** 🚀



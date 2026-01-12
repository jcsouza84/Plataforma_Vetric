# 🔍 Como Capturar Cookies para WebSocket

O WebSocket precisa dos **cookies de sessão**, não apenas do token JWT!

## 📋 PASSO A PASSO

### 1. No Chrome DevTools (já logado no CVE-PRO)

Vá em **Application** → **Cookies** → `https://mundologic.intelbras-cve-pro.com.br`

### 2. Procure e copie TODOS os cookies que não são do Google

Especialmente estes (se existirem):
- Qualquer cookie com domínio `.intelbras-cve-pro.com.br`
- `JSESSIONID`
- `session`
- `connect.sid`
- Qualquer cookie que NÃO seja `__Secure-` do Google

### 3. **OU** Capture do Request Headers do WebSocket

No DevTools → Network → WS → websocket → **Request Headers**

Procure por:
```
Cookie: nome1=valor1; nome2=valor2; nome3=valor3
```

Copie TODOS os pares `nome=valor`

### 4. Adicione em `src/manual-session.ts`

```typescript
export const manualSession: ManualSession = {
  enabled: true,
  
  // ADICIONE OS COOKIES AQUI!
  cookies: [
    "nome1=valor1",
    "nome2=valor2",
    // etc...
  ],
  
  token: "COE51Wx4_wKB7HVPgSmrXciaQBlewjQ_...",
};
```

---

## 🎯 POR QUE ISSO É NECESSÁRIO?

O WebSocket usa **cookies** para autenticação, não o token JWT no header Authorization.

O token JWT serve para requisições HTTP/REST, mas o WebSocket precisa dos cookies de sessão!



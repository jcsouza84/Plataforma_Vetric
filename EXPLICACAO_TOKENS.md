# 🔑 EXPLICAÇÃO: Tokens e Autenticação CVE

## ❓ SUA PERGUNTA:

> "Se eu usar API-KEY + email + senha para fazer login, qual token retorna? Vai funcionar no `/api/v1/transaction`?"

---

## ✅ RESPOSTA COMPLETA:

### **O QUE DESCOBRIMOS:**

#### **1. Token do Postman:** ✅ FUNCIONA
```
Authorization: W5tMmxBXON94kpglbfWlzIVURoqGUMsBm4eaVqhRrU...
Status: 200 OK
Transações: 11 encontradas
Transações ativas: 1 (Wemison Silva - Gran Marine 5)
```

#### **2. Token do nosso login:** ❌ NÃO FUNCIONA
```
Email: admin@vetric.com.br
Senha: Vetric@2026
Resposta: E000 - Senha incorreta ou usuário não encontrado
```

---

## 🔍 ANÁLISE DO PROBLEMA:

### **Por que não funciona?**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  CREDENCIAIS DO NOSSO SISTEMA (backend):                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Email: admin@vetric.com.br                           │
│  • Senha: Vetric@2026                                   │
│  • Onde: Tabela `usuarios` do nosso banco de dados     │
│  • Uso: Autenticar no DASHBOARD do Vetric              │
│                                                         │
│  ❌ NÃO SÃO credenciais válidas na API da Intelbras!   │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  CREDENCIAIS DA INTELBRAS (Postman):                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Email: ??? (usado no Postman)                        │
│  • Senha: ??? (usada no Postman)                        │
│  • Onde: Conta registrada na Intelbras CVE-Pro         │
│  • Uso: Autenticar na API da Intelbras                  │
│                                                         │
│  ✅ Essas SIM funcionam no /api/v1/transaction!        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 COMO FUNCIONA A AUTENTICAÇÃO:

### **Fluxo Correto:**

```
1️⃣  FAZER LOGIN NA API INTELBRAS
   ↓
   POST /api/v1/login
   {
     "email": "seu_email@intelbras.com.br",  ← EMAIL DA CONTA INTELBRAS
     "password": "sua_senha_real"             ← SENHA DA CONTA INTELBRAS
   }
   Headers: { "Api-Key": "808c0fb3-dc7f-40f5-..." }

2️⃣  RECEBER TOKEN VÁLIDO
   ↓
   {
     "token": "W5tMmxBXON94kpglbfWlzIVURoqGUMsBm4...",
     "user": { ... }
   }

3️⃣  USAR TOKEN NO ENDPOINT DE TRANSAÇÕES
   ↓
   GET /api/v1/transaction?fromDate=...&toDate=...
   Headers: {
     "Api-Key": "808c0fb3-dc7f-40f5-...",
     "Authorization": "W5tMmxBXON94kpglbfWlzIVURoqGUMsBm4...",  ← TOKEN
     "Platform": "DASHBOARD"
   }

4️⃣  SUCESSO! ✅
   ↓
   {
     "error": null,
     "list": [ ... transações ... ],
     "count": 11
   }
```

---

## 🎯 SOLUÇÃO:

### **OPÇÃO 1: Token Manual (Temporário - 24-48h)**

#### ✅ Vantagens:
- Funciona IMEDIATAMENTE
- Já testamos e validamos
- Zero configuração adicional

#### ❌ Desvantagens:
- Expira em 24-48 horas
- Precisa atualizar manualmente
- Interrupção no serviço quando expirar

#### 📝 Como fazer:
```bash
# 1. Adicionar no .env
CVE_TRANSACTION_TOKEN=W5tMmxBXON94kpglbfWlzIVURoqGUMsBm4eaVqhRrUvrNCYP5ZyViqjMabxZyQbrrJvowSsHBlScu5Vovx-5hwxQNtPAiuFFp6ez3fBdTIA3cAy0ww0WouHqby3nhCB00QAeeM7qD8XCU3MKZ6Bt3d3Ij3d4tWnlW0GPBRHTAf14vMC8kmQnK-Le4rgwly-d368CmimFTqa15Ilw4nk4jvIKqOdsvO5VrTNSl8aRrq696gEq1uO8KT4R8FMB-TP1OaXTLeYToCnbSpEPiq1qWVLbBqNTvfstKdxKJTVX3hMdY-5ACXsneurfMG5uUGIjG6gq4QxgwzpnSnLd-4tKmpQkbTPLx4Hg68pRe_v98jUy0hR2jdE6WyJ3RKGCL6vbZoDPQ-O9HFXDRuz8jQOnQklN7YdbF3QEJPwFTNTip4ry9c-3l8mv7t80bw

# 2. Reiniciar backend
npm start
```

---

### **OPÇÃO 2: Login Automático (Permanente - RECOMENDADO) 🌟**

#### ✅ Vantagens:
- Funciona PARA SEMPRE
- Token renova automaticamente
- Sistema 100% autônomo
- Sem interrupções

#### ❌ Desvantagens:
- Precisa fornecer credenciais reais da Intelbras
- (Mas serão armazenadas com segurança no .env)

#### 📝 Como fazer:
```bash
# 1. Me fornecer (pode ser por mensagem privada):
#    - Email usado no Postman
#    - Senha usada no Postman

# 2. Adicionar no .env:
CVE_EMAIL=seu_email_intelbras@exemplo.com
CVE_PASSWORD=sua_senha_real_intelbras

# 3. Sistema fará login automaticamente:
#    - Na inicialização
#    - Quando o token expirar
#    - A cada X horas (preventivo)

# 4. Identificação de moradores funcionará 24/7 ✅
```

---

## 📊 COMPARAÇÃO:

| Item | Token Manual | Login Automático |
|------|--------------|------------------|
| **Funcionamento** | ✅ Imediato | ✅ Imediato |
| **Duração** | ⚠️ 24-48h | ✅ Permanente |
| **Manutenção** | ❌ Manual | ✅ Automática |
| **Segurança** | ⚠️ Token exposto | ✅ Credenciais no .env |
| **Confiabilidade** | ⚠️ Expira | ✅ Auto-renova |
| **Recomendado** | Para teste | **Para produção** |

---

## 🎯 MINHA RECOMENDAÇÃO:

### **Para TESTE AGORA (hoje):**
→ Use o Token Manual (Opção 1)

### **Para PRODUÇÃO (definitivo):**
→ Implemente Login Automático (Opção 2)

---

## 📝 RESUMO DA RESPOSTA:

### **Sua pergunta:**
> "Se eu usar API-KEY + login + senha, qual token retorna?"

### **Resposta:**
✅ **SIM**, retorna um token.  
✅ **SIM**, esse token funciona no `/api/v1/transaction`.  
❌ **MAS** as credenciais `admin@vetric.com.br / Vetric@2026` **NÃO** existem na Intelbras.  

### **Solução:**
🔑 Usar as credenciais **REAIS** da sua conta Intelbras (as mesmas que você usa no Postman).  
✅ Assim o sistema fará login automaticamente e renovará o token quando necessário.

---

**Qual opção você prefere implementar?**

1. **Token Manual** (funciona agora, expira em 1-2 dias)
2. **Login Automático** (funciona para sempre, requer email/senha da Intelbras)

---

**Data:** 13/01/2026 01:03 BRT


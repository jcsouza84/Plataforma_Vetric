# 🔑 INSTRUÇÕES: Configurar Token de Transações

## 📋 PASSO A PASSO:

### **1. Abra o arquivo `.env` do backend:**
```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE/vetric-dashboard/backend"
nano .env
# ou
code .env
```

### **2. Adicione esta linha ao final do arquivo:**
```env
CVE_TRANSACTION_TOKEN=W5tMmxBXON94kpglbfWlzIVURoqGUMsBm4eaVqhRrUvrNCYP5ZyViqjMabxZyQbrrJvowSsHBlScu5Vovx-5hwxQNtPAiuFFp6ez3fBdTIA3cAy0ww0WouHqby3nhCB00QAeeM7qD8XCU3MKZ6Bt3d3Ij3d4tWnlW0GPBRHTAf14vMC8kmQnK-Le4rgwly-d368CmimFTqa15Ilw4nk4jvIKqOdsvO5VrTNSl8aRrq696gEq1uO8KT4R8FMB-TP1OaXTLeYToCnbSpEPiq1qWVLbBqNTvfstKdxKJTVX3hMdY-5ACXsneurfMG5uUGIjG6gq4QxgwzpnSnLd-4tKmpQkbTPLx4Hg68pRe_v98jUy0hR2jdE6WyJ3RKGCL6vbZoDPQ-O9HFXDRuz8jQOnQklN7YdbF3QEJPwFTNTip4ry9c-3l8mv7t80bw
```

### **3. Salve o arquivo e reinicie o backend:**
```bash
# Parar o backend (se estiver rodando)
lsof -ti:3001 | xargs kill -9

# Iniciar novamente
npm start
```

---

## ✅ O QUE VAI ACONTECER:

Quando o backend reiniciar, ele vai:

1. ✅ Usar o token especial para buscar transações
2. ✅ Identificar moradores automaticamente pelo `ocppIdTag`
3. ✅ Exibir no dashboard:
   - Nome do morador
   - Apartamento
   - Duração do carregamento
   - Energia consumida
   - Indicadores ambientais

---

## 📊 LOGS ESPERADOS:

Você verá logs assim:

```
🔍 [CVE] Buscando transações...
   📅 fromDate: 2026-01-12 00:00:00
   📅 toDate: 2026-01-13 00:00:00
   🔑 Token: W5tMmxBXON94kpglbfWlzIVURoqGU...
✅ [CVE] 15 transação(ões) encontrada(s)
⚡ [CVE] 1 transação(ões) ATIVA(S):
   🔌 Gran Marine 5
      👤 Wemison Silva
      🏠 Edf. Gran Marine Apto906-B
      🎯 ocppIdTag: BF77DA9CD83C4B919BD
✅ [Polling] Morador identificado no nosso BD: João Silva (Apto 101)
```

---

## ⚠️ IMPORTANTE:

- Este token é válido por um período limitado (geralmente 24-48h)
- Quando expirar, você precisará:
  1. Fazer login novamente no Postman
  2. Copiar o novo token do header `Authorization`
  3. Atualizar o `.env` com o novo token
  4. Reiniciar o backend

---

## 🔄 ALTERNATIVA (MAIS PERMANENTE):

Se você quiser uma solução mais permanente, me forneça:
- **Email** usado para fazer login no Postman
- **Senha** usada para fazer login no Postman

Assim posso configurar o sistema para fazer login automaticamente e renovar o token quando necessário.

---

**Data:** 13/01/2026 00:52 BRT


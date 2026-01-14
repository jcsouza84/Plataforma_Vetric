# 🎯 SOLUÇÃO: Identificação de Morador via Heartbeat/Status

**Data:** 12/01/2026  
**Status:** ✅ IMPLEMENTADO

---

## 📌 PROBLEMA IDENTIFICADO

Você estava correto! **O `idTag` VEM nas mensagens de status/heartbeat!**

Segundo a documentação da API CVE (`API_DOCUMENTATION.md`), quando um carregador está nos estados:
- **Charging** (Carregando)
- **Occupied** (Cabo conectado)
- **Preparing** (Preparando)
- **Finishing** (Finalizando)

A mensagem de status **INCLUI o `idTag`** do morador que está usando o carregador!

### Exemplo da Documentação:
```json
{
  "connectorId": 1,
  "status": "Charging",
  "transactionId": 12345,
  "idTag": "TAG_RFID_123",  ← AQUI! ✅
  "meterValue": { ... }
}
```

---

## 🔧 SOLUÇÃO IMPLEMENTADA

### 1. **Novo Método `extractIdTagFromCharger`** (CVEService)

Criamos um método inteligente que tenta **3 fontes** para buscar o `idTag`:

```typescript
async extractIdTagFromCharger(charger: CVECharger): Promise<string | null> {
  // 1️⃣ Tentar do lastStatus (mensagem de status mais recente)
  if (lastStatus?.idTag) return lastStatus.idTag;
  
  // 2️⃣ Tentar de transações ativas
  const matchingTx = await this.getActiveTransactions().find(...);
  if (matchingTx?.idTag) return matchingTx.idTag;
  
  // 3️⃣ Tentar endpoint específico do conector
  const response = await this.api.get(`/api/v1/chargeBoxes/${id}/connectors/${connectorId}`);
  if (response.data.idTag) return response.data.idTag;
  
  return null;
}
```

### 2. **Verificação Alternativa** (PollingService)

Adicionamos um método de **fallback** que verifica diretamente o status dos carregadores:

```typescript
private async verificarStatusCarregadores(): Promise<void> {
  const chargers = await cveService.getChargers();
  
  for (const charger of chargers) {
    const status = connector.lastStatus?.status;
    
    // Se está carregando...
    if (status === 'Charging' || status === 'Occupied' || status === 'Preparing') {
      // Tentar extrair idTag
      const idTag = await cveService.extractIdTagFromCharger(charger);
      
      if (idTag) {
        // Buscar morador e registrar carregamento
        const morador = await MoradorModel.findByTag(idTag);
        // ...
      }
    }
  }
}
```

### 3. **Estratégia Híbrida**

O polling agora usa **2 métodos** em sequência:

1. **Método Principal:** Buscar transações ativas (`/api/v1/transactions?status=Active`)
2. **Método Fallback:** Se não houver transações ou der erro, verificar status dos carregadores diretamente

---

## 🎯 COMO FUNCIONA

### Fluxo Normal (Com Transações):
```
1. Polling busca /api/v1/transactions?status=Active
2. Para cada transação, pega o idTag
3. Busca morador pela tag RFID
4. Registra/atualiza carregamento
```

### Fluxo Alternativo (Heartbeat/Status):
```
1. Se não houver transações ativas OU der erro
2. Busca lista de carregadores (/api/v1/chargepoints)
3. Para cada carregador com status "Charging/Occupied/Preparing":
   a. Verifica se lastStatus tem idTag
   b. Se não, tenta outras fontes
4. Identifica morador
5. Registra/atualiza carregamento
```

---

## ✅ VANTAGENS DESTA SOLUÇÃO

1. **✅ Redundância:** Se uma fonte falhar, usa outra
2. **✅ Confiável:** Múltiplas tentativas para obter o idTag
3. **✅ Automático:** Funciona sem WebSocket
4. **✅ Completo:** Usa TODOS os dados disponíveis da API
5. **✅ Inteligente:** Adapta-se ao que a API retorna

---

## 📊 ONDE O IDTAG PODE ESTAR

| Fonte | Localização | Status |
|-------|-------------|--------|
| 1️⃣ Status/Heartbeat | `connector.lastStatus.idTag` | ✅ IMPLEMENTADO |
| 2️⃣ Transações Ativas | `/api/v1/transactions?status=Active` | ✅ IMPLEMENTADO |
| 3️⃣ Conector Específico | `/api/v1/chargeBoxes/{id}/connectors/{id}` | ✅ IMPLEMENTADO |
| 4️⃣ WebSocket STOMP | Mensagens em tempo real | ⚠️ Problema de conexão |

---

## 🧪 PRÓXIMOS PASSOS

1. **Compilar backend** com as mudanças
2. **Reiniciar backend** para aplicar
3. **Testar** com carregador real ativo
4. **Verificar logs** para ver de onde vem o idTag

---

## 🎯 EXPECTATIVA

Agora, quando um carregador estiver ativo (mesmo sem transação explícita), o sistema deve:

1. ✅ Detectar que está carregando
2. ✅ Extrair o idTag do status/heartbeat
3. ✅ Identificar o morador
4. ✅ Exibir nome e apartamento no dashboard

---

## 📝 ARQUIVOS MODIFICADOS

1. ✅ `/backend/src/services/CVEService.ts`
   - Adicionado método `extractIdTagFromCharger()`
   
2. ✅ `/backend/src/services/PollingService.ts`
   - Adicionado método `verificarStatusCarregadores()`
   - Melhorado método `poll()` com fallback

---

## 🔍 LOGS IMPORTANTES

Quando funcionar, você verá logs como:

```
✅ [Gran Marine 01] idTag encontrado no lastStatus: TAG123
👤 [Polling] Morador identificado: João Silva (Apto 101)
✅ [Polling] Novo carregamento registrado via status: ID 45
```

---

**🚀 PRONTO PARA TESTAR!**


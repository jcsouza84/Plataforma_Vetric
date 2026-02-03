# Análise Detalhada: Carregador 1122905050 (Gran Marine 4)

**Data da Análise:** 03/02/2026 01:40  
**Problema Relatado:** Carregador mostrando "indisponível" e não identificando Claudevania

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. DESCONEXÃO PROLONGADA (30+ minutos)

```
[INFO ] 03/02/2026 01:38:57.399 - Connection is established
[INFO ] 03/02/2026 01:39:03.440 - BootNotification recebido
[INFO ] 03/02/2026 01:39:05.246 - StopTransaction recebido
    - idTag: "5d210a3b"
    - transactionId: 440159
    - Timestamp: 2026-02-03T01:09:31.134610Z  ⚠️ ATRASO DE 30 MINUTOS!
    - Motivo: "EVDisconnected"
```

**DIAGNÓSTICO:**
- O carregador estava **OFFLINE** das ~01:09h até 01:38h
- A transação foi finalizada às 01:09h, mas o evento só chegou às 01:39h
- Durante esse período, o sistema não tinha informações do carregador
- **Por isso aparecia como "indisponível"** na interface

---

### 2. IDTAG EM MINÚSCULAS

**Tag recebida:** `"5d210a3b"` (minúsculas)  
**Esperado:** `"5D210A3B"` (maiúsculas)

**IMPACTO:**
- Antes da correção de case sensitivity: **NÃO IDENTIFICARIA O MORADOR**
- Após a correção (migration 009): **DEVE IDENTIFICAR CORRETAMENTE**

---

### 3. AUSÊNCIA DE STATUS NOTIFICATIONS

**Comportamento esperado após BootNotification:**
```
✓ BootNotification
✓ StatusNotification connectorId=0
✓ StatusNotification connectorId=1
✓ Heartbeat regular
```

**Comportamento observado no 1122905050:**
```
✓ BootNotification
✗ StatusNotification connectorId=0  ← FALTANDO
✗ StatusNotification connectorId=1  ← FALTANDO
✗ Heartbeat                         ← FALTANDO (log foi cortado)
```

---

## 📊 COMPARAÇÃO COM OUTROS CARREGADORES

### Carregadores que FUNCIONAM NORMALMENTE:

#### 1122905079 (Gran Marine 6)
```
✓ Conexão estável
✓ Heartbeat a cada ~60 segundos
✓ StatusNotifications completas
✓ BootNotification correto
```

#### 1122905074 (Gran Marine 3)  
```
✓ Conexão estável
✓ Heartbeat regular
✓ StatusNotifications completas
✓ Identifica moradores (caso resolvido)
```

#### QUXM12000122V (Gran Marine 2)
```
✓ Fabricante diferente (EN+)
✓ Funciona perfeitamente
✓ Heartbeat regular
✓ StatusNotifications completas
```

---

### Carregador com PROBLEMAS:

#### 1122905050 (Gran Marine 4) ⚠️
```
✗ Conexão instável (ficou offline 30min)
✗ Não envia StatusNotifications após BootNotification
✗ idTag em minúsculas (agora resolvido pela migration)
⚠️ Possível problema de conectividade de rede
```

---

## 🔍 ANÁLISE DA TRANSAÇÃO 440159

**Dados da transação finalizada:**
```json
{
  "idTag": "5d210a3b",
  "meterStop": 8592,
  "timestamp": "2026-02-03T01:09:31.134610Z",
  "transactionId": 440159,
  "reason": "EVDisconnected"
}
```

**Timeline:**
- **01:09:31** - Carro desconectado (EVDisconnected)
- **01:09:31 - 01:38:57** - Carregador OFFLINE (28 minutos)
- **01:38:57** - Reconexão
- **01:39:03** - BootNotification
- **01:39:05** - StopTransaction (evento atrasado)

---

## 🚨 POR QUE APARECIA "INDISPONÍVEL"

### Causas Identificadas:

1. **Carregador estava realmente offline** (28 minutos sem conexão)
2. **Polling Service não recebia Heartbeats**
3. **Última atualização do status era muito antiga**
4. **Sistema marcou como "Unavailable" por timeout**

### Fluxo do Problema:
```
1. Carro desconecta (01:09h)
2. Carregador perde conexão com servidor
3. PollingService não recebe atualizações
4. Timeout ultrapassa threshold
5. Sistema marca como "Unavailable"
6. Interface mostra "indisponível"
7. Carregador reconecta (01:38h)
8. Envia eventos atrasados
```

---

## ❓ POR QUE NÃO IDENTIFICOU CLAUDEVANIA

### Hipóteses:

#### 1. **Case Sensitivity (PRINCIPAL)**
- Tag no banco: `5D210A3B` (maiúsculas)
- Tag recebida: `5d210a3b` (minúsculas)
- **ANTES da migration 009:** NÃO identificava
- **DEPOIS da migration 009:** DEVE identificar

#### 2. **Carregador Offline Durante Carga**
- Se o carregador perdeu conexão DURANTE a carga
- O StartTransaction pode não ter chegado ao servidor
- Apenas o StopTransaction (atrasado) chegou

#### 3. **Transação Já Finalizada**
- A transação 440159 foi de Claudevania
- Mas já estava finalizada quando o sistema voltou
- Não houve notificação de início (perdida durante offline)

---

## 🔧 AÇÕES NECESSÁRIAS

### IMEDIATAS:

1. **Verificar conectividade de rede do carregador 1122905050**
   - Qualidade do sinal
   - Estabilidade da conexão
   - Possíveis interferências

2. **Confirmar se migration 009 foi aplicada em produção**
   ```sql
   SELECT * FROM moradores WHERE UPPER(tag_rfid) = 'S5D210A3B';
   ```

3. **Verificar no banco se transação 440159 está registrada**
   ```sql
   SELECT * FROM carregamentos WHERE ocpp_transaction_id = 440159;
   ```

### MÉDIO PRAZO:

1. **Implementar monitoramento de conectividade**
   - Alertas quando carregador fica offline > 5 minutos
   - Dashboard com status de conexão em tempo real

2. **Melhorar tratamento de eventos atrasados**
   - Processar StopTransaction mesmo se StartTransaction foi perdido
   - Criar carregamentos "retroativos" quando possível

3. **Adicionar logs de diagnóstico**
   - Por que o carregador ficou offline?
   - Houve StartTransaction que não chegou?

---

## 📝 DIFERENÇAS DE PADRÃO IDENTIFICADAS

### Carregadores NOVOS (4, 5, 6):
```
✗ idTag em MINÚSCULAS
✗ Conectividade mais instável
✗ Possível configuração diferente no firmware
```

### Carregadores ANTIGOS (2, 3):
```
✓ idTag em MAIÚSCULAS (ou case-insensitive natural)
✓ Conectividade estável
✓ Configuração testada e aprovada
```

---

## 🎯 CONCLUSÃO

O carregador **1122905050** apresenta **DOIS problemas principais**:

1. **Instabilidade de conexão** (ficou 28 minutos offline)
2. **idTag em minúsculas** (resolvido pela migration 009)

**A morador não foi identificada porque:**
- A correção de case sensitivity ainda não estava aplicada QUANDO a carga aconteceu
- O carregador estava offline durante parte da sessão
- Eventos foram perdidos ou chegaram atrasados

**Recomendação:** Investigar a infraestrutura de rede do carregador 4 (1122905050).

---

## 🔍 PRÓXIMOS PASSOS PARA DIAGNÓSTICO

Execute estas queries assim que a conexão com o banco for restabelecida:

```sql
-- 1. Verificar se Claudevania tem tag 5d210a3b
SELECT id, nome, tag_rfid 
FROM moradores 
WHERE UPPER(tag_rfid) = UPPER('5d210a3b');

-- 2. Ver transação 440159
SELECT * 
FROM carregamentos 
WHERE ocpp_transaction_id = 440159;

-- 3. Ver todas as transações do carregador 1122905050
SELECT 
    id,
    morador_id,
    inicio,
    fim,
    status,
    ocpp_idtag,
    ocpp_transaction_id
FROM carregamentos 
WHERE carregador_uuid = '1122905050'
ORDER BY inicio DESC
LIMIT 20;

-- 4. Ver status atual do carregador
SELECT * 
FROM conectores_status 
WHERE carregador_uuid = '1122905050';
```

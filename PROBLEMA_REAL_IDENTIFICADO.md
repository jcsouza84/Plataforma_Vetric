# 🎯 PROBLEMA REAL IDENTIFICADO!

**Data:** 03/02/2026 01:00  
**Status:** 🔴 **CAUSA RAIZ ENCONTRADA**

---

## 🔍 DESCOBERTA CRUCIAL

### **O `idTag` EXISTE nos logs OCPP do CVE, mas NÃO chega no nosso backend via API REST!**

---

## 📊 ANÁLISE DOS LOGS CVE vs NOSSO BANCO

### Logs OCPP do CVE (que você me enviou):

| Transaction ID CVE | Charger | Horário | idTag | Status CVE |
|--------------------|---------|---------|-------|------------|
| **440058** | GM 6 (1122905050) | 20:14:32 | `87ba5c4e` | ✅ TEM idTag |
| **440059** | GM 6 (1122905050) | 20:14:45 | `87ba5c4e` | ✅ TEM idTag |
| **440060** | GM 3 (QUXM12000122V) | 20:15:12 | `87BA5C4E` | ✅ TEM idTag |
| **440061** | GM 5 (1122905079) | 20:15:22 | `87ba5c4e` | ✅ TEM idTag |

---

### Nosso Banco de Dados:

| ID Nosso | Charger | Horário | morador_id | Morador | Status |
|----------|---------|---------|------------|---------|--------|
| **186** | GM 5 | 20:14:14 | NULL | - | ❌ NÃO identificou |
| **187** | GM 6 | 20:14:34 | NULL | - | ❌ NÃO identificou |
| **188** | GM 6 | 20:14:54 | NULL | - | ❌ NÃO identificou |
| **189** | GM 3 | 20:15:14 | 1 | VETRIC | ✅ IDENTIFICOU! |
| **190** | GM 5 | 20:15:24 | NULL | - | ❌ NÃO identificou |
| **192** | GM 5 | 21:07:15 | NULL | - | ❌ NÃO identificou |
| **193** | GM 5 | 21:19:45 | NULL | - | ❌ NÃO identificou |
| **195** | GM 6 | 23:38:36 | NULL | - | ❌ NÃO identificou |

---

## 🎯 CONCLUSÃO

### **TODOS os chargers estão enviando `idTag` corretamente via protocolo OCPP 1.6**

Mas apenas o **Gran Marine 3** foi identificado no nosso sistema.

---

## 🚨 POSSÍVEIS CAUSAS

### HIPÓTESE 1: API REST do CVE não retorna `ocppIdTag` para chargers novos (90%)

**Explicação:**

O protocolo OCPP 1.6 JSON (logs que você mostrou) é a comunicação **direta** do charger com o servidor CVE:

```
Charger → OCPP WebSocket → Servidor CVE
✅ idTag está presente aqui
```

Mas nosso backend busca dados via **API REST** do CVE:

```
Nosso Backend → GET /transactions → API REST CVE → Banco CVE
❓ ocppIdTag pode não estar presente aqui
```

**Por que isso acontece?**

A API REST do CVE pode ter um bug onde:
- Chargers antigos (2, 3): Campo `ocppIdTag` é populado corretamente na resposta da API
- Chargers novos (4, 5, 6): Campo `ocppIdTag` retorna `null` ou `""` mesmo existindo no banco

---

### HIPÓTESE 2: Case sensitivity no idTag (5%)

**Observação dos logs:**

| Charger | idTag no OCPP | Resultado |
|---------|---------------|-----------|
| GM 5 | `87ba5c4e` (minúsculo) | ❌ Não identificou |
| GM 6 | `87ba5c4e` (minúsculo) | ❌ Não identificou |
| **GM 3** | `87BA5C4E` (MAIÚSCULO) | ✅ **IDENTIFICOU!** |
| GM 5 | `87ba5c4e` (minúsculo) | ❌ Não identificou |

**No banco VETRIC:**
```sql
tag_rfid = '87BA5C4E'  (MAIÚSCULO)
```

**Possível problema no código:**

```typescript
// Se a busca for case-sensitive:
const morador = await MoradorModel.findByTag(ocppIdTag);

// Compara:
"87ba5c4e" !== "87BA5C4E"  ❌ Não encontra!
"87BA5C4E" === "87BA5C4E"  ✅ Encontra!
```

**MAS:** Isso não explica por que GM 3 funcionou e GM 5 às 20:15:22 não funcionou (ambos com maiúsculo nos logs).

---

### HIPÓTESE 3: Mapeamento chargeBoxId ↔ UUID incorreto (5%)

**ChargeBoxId vs UUID:**

| ChargeBoxId OCPP | Nome | UUID no Banco |
|------------------|------|---------------|
| `1122905050` | GM 6 | `0af3b86f-df47-4a14-91e3-47e822452e58` |
| `QUXM12000122V` | GM 3 | `8bae9258-5aaa-49c4-be23-da39ff3f610b` |
| `1122905079` | GM 5 | `4018bf0a-b1bf-439a-96bf-c8b9a73ddd26` |

Nosso backend busca transações pelo **UUID**, mas os logs mostram **chargeBoxId**.

Se o mapeamento estiver errado, o backend pode estar buscando a transação errada.

---

## 🔬 TESTE DEFINITIVO

### Para confirmar a causa, precisamos ver **EXATAMENTE** o que o backend está recebendo:

```typescript
// Em CVEService.ts, adicionar log temporário:
async getActiveTransactions(): Promise<CVETransaction[]> {
  const response = await this.api.get('/transactions?active=true');
  
  // 🔍 LOG TEMPORÁRIO:
  console.log('🔍 [DEBUG] Transações recebidas da API CVE:');
  response.data.forEach(tx => {
    console.log(`  - ID ${tx.id}: charger=${tx.chargeBoxDescription}, ocppIdTag="${tx.ocppIdTag}", ocppTagPk=${tx.ocppTagPk}`);
  });
  
  return response.data;
}
```

**O que esperar:**

#### Se HIPÓTESE 1 está correta:
```
🔍 [DEBUG] Transações recebidas da API CVE:
  - ID 186: charger=Gran Marine 5, ocppIdTag="", ocppTagPk=12345  ← VAZIO!
  - ID 187: charger=Gran Marine 6, ocppIdTag="", ocppTagPk=12346  ← VAZIO!
  - ID 189: charger=Gran Marine 3, ocppIdTag="87BA5C4E", ocppTagPk=12347  ← PRESENTE!
```

#### Se HIPÓTESE 2 está correta:
```
🔍 [DEBUG] Transações recebidas da API CVE:
  - ID 186: charger=Gran Marine 5, ocppIdTag="87ba5c4e", ocppTagPk=12345  ← minúsculo
  - ID 189: charger=Gran Marine 3, ocppIdTag="87BA5C4E", ocppTagPk=12347  ← MAIÚSCULO
```

---

## 🚀 SOLUÇÕES POR HIPÓTESE

### SOLUÇÃO HIPÓTESE 1: API não retorna ocppIdTag

**Usar `ocppTagPk` como fallback:**

```typescript
// Código já implementado no PollingService.ts linha 241-270
if (!morador && transacao.ocppTagPk) {
  const result = await pool.query(
    `SELECT m.* FROM moradores m
     INNER JOIN tag_pk_mapping tpm ON tpm.morador_id = m.id
     WHERE tpm.ocpp_tag_pk = $1`,
    [transacao.ocppTagPk]
  );
  
  if (result.rows.length > 0) {
    morador = result.rows[0];
  }
}
```

**Ação necessária:**
1. Ver logs do backend para capturar `ocppTagPk`
2. Adicionar mapeamentos na tabela `tag_pk_mapping`

---

### SOLUÇÃO HIPÓTESE 2: Case sensitivity

**Forçar comparação case-insensitive:**

```typescript
// Em MoradorModel.findByTag():
SELECT * FROM moradores 
WHERE UPPER(tag_rfid) = UPPER($1)  -- ← Adicionar UPPER()
```

**OU atualizar tags no banco para maiúsculo:**

```sql
-- Padronizar todas as tags para MAIÚSCULO
UPDATE moradores 
SET tag_rfid = UPPER(tag_rfid)
WHERE tag_rfid IS NOT NULL;
```

---

### SOLUÇÃO HIPÓTESE 3: Mapeamento incorreto

**Verificar se UUID está correto:**

1. Listar chargers no CVE
2. Confirmar UUID de cada charger
3. Atualizar banco se necessário

---

## 📋 PRÓXIMOS PASSOS (EM ORDEM)

### PASSO 1: Reiniciar Backend (2 min) ⚡ URGENTE

```
1. Acesse: https://dashboard.render.com
2. Clique em "vetric-backend"
3. Manual Deploy > Deploy latest commit
4. Aguarde 3 minutos
```

**Objetivo:** Sistema voltar a funcionar e logs ficarem disponíveis

---

### PASSO 2: Adicionar Logs Temporários no Código (10 min)

```typescript
// apps/backend/src/services/PollingService.ts

private async processarTransacao(transacao: CVETransaction): Promise<void> {
  // ADICIONAR ESTES LOGS:
  console.log(`🔍 [DEBUG] Transação ${transacao.id}:`);
  console.log(`   📦 Charger: ${transacao.chargeBoxDescription}`);
  console.log(`   🏷️  ocppIdTag: "${transacao.ocppIdTag}" (length: ${transacao.ocppIdTag?.length || 0})`);
  console.log(`   🔢 ocppTagPk: ${transacao.ocppTagPk}`);
  console.log(`   👤 userName: ${transacao.userName}`);
  
  // Código existente continua...
}
```

**Fazer commit e push:**
```bash
git add apps/backend/src/services/PollingService.ts
git commit -m "debug: adicionar logs temporários para diagnóstico de idTag"
git push origin main
```

**Aguardar deploy automático (3-5 min)**

---

### PASSO 3: Fazer Novo Teste com VETRIC (5 min)

**Sequência:**

1. 🔌 **Carregar em Gran Marine 5 ou 6** com RFID físico
2. ⏱️ **Aguardar 30 segundos**
3. 📊 **Ver logs do Render** e procurar:

```
🔍 [DEBUG] Transação 196:
   📦 Charger: Gran Marine 5
   🏷️  ocppIdTag: "<VALOR AQUI>" 
   🔢 ocppTagPk: <NÚMERO AQUI>
```

4. ✅ **Anotar os valores** de `ocppIdTag` e `ocppTagPk`

---

### PASSO 4: Aplicar Correção Adequada

**Se `ocppIdTag` estiver vazio:**
```sql
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (<NÚMERO>, 1, 'VETRIC - Chargers 5 e 6');
```

**Se `ocppIdTag` estiver em minúsculo:**
```sql
UPDATE moradores 
SET tag_rfid = UPPER(tag_rfid)
WHERE id = 1;
```

**Se `ocppIdTag` estiver presente e correto:**
- Problema está em outro lugar (investigar mais)

---

## 📊 RESUMO EXECUTIVO

### ✅ O QUE SABEMOS:

1. **Logs OCPP do CVE:** idTag está presente em TODOS os chargers ✅
2. **Nosso banco:** Apenas Gran Marine 3 identificou o morador ✅
3. **Chargers novos (5, 6):** 0% de sucesso (8 tentativas) ❌
4. **Chargers antigos (2, 3):** Funcionam ✅

### ❓ O QUE PRECISAMOS DESCOBRIR:

1. **A API REST do CVE retorna `ocppIdTag` para chargers novos?**
2. **Se sim, está em maiúsculo ou minúsculo?**
3. **Se não, qual é o `ocppTagPk` correspondente?**

### ⏱️ TEMPO ESTIMADO:

- Reiniciar backend: 2 min
- Adicionar logs: 10 min
- Fazer teste: 5 min
- Aplicar correção: 2 min
- **TOTAL:** ~20 minutos

---

**Criado em:** 03/02/2026 01:00  
**Próxima ação:** Reiniciar backend e adicionar logs de debug

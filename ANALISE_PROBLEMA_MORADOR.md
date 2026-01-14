# 🔍 ANÁLISE: Por que o "Morador" não aparece no Dashboard

**Data:** 12/01/2026  
**Status:** ✅ PROBLEMA IDENTIFICADO  
**Complexidade:** 🟡 MÉDIA

---

## 📋 SUMÁRIO EXECUTIVO

O campo **"Morador: —"** está vazio no dashboard mesmo com carregadores em uso porque:

1. ✅ **O backend TEM a lógica de correlação** (IdTag → Morador)
2. ❌ **A API CVE não está retornando o `idTag` nos dados do conector**
3. ❌ **Faltam métodos no `CVEService` para buscar dados completos**
4. ❌ **O frontend não existe** (pasta vazia)

---

## 🔍 ANÁLISE DETALHADA

### 1. **MODELO DE DADOS - ✅ CORRETO**

```typescript
// Morador.ts - LINHA 26-30
static async findByTag(tag: string): Promise<Morador | null> {
  const sql = 'SELECT * FROM moradores WHERE tag_rfid = $1';
  const result = await query<Morador>(sql, [tag]);
  return result[0] || null;
}
```

**Status:** ✅ Perfeito!
- Campo `tag_rfid` existe
- Método `findByTag()` implementado
- Retorna `nome` + `apartamento`

---

### 2. **PROCESSAMENTO WEBSOCKET - ✅ CORRETO**

```typescript
// WebSocketService.ts - LINHA 159-188
private async handleTransactionStart(data: any): Promise<void> {
  const idTag = data.idTag; // ← Extrai o IdTag da mensagem
  
  let morador = null;
  if (idTag) {
    morador = await MoradorModel.findByTag(idTag); // ← Busca morador
    if (morador) {
      console.log(`👤 Morador identificado: ${morador.nome} (Apto ${morador.apartamento})`);
    } else {
      console.warn(`⚠️  Tag RFID ${idTag} não cadastrada`);
    }
  }
}
```

**Status:** ✅ Lógica correta!
- Extrai `idTag` da mensagem WebSocket
- Busca morador no banco
- Registra no carregamento

---

### 3. **API REST - ⚠️ PROBLEMA PARCIAL**

#### 3.1. Método `getChargersWithMoradores()` - ✅ EXISTE

```typescript
// CVEService.ts - LINHA 127-169
async getChargersWithMoradores(): Promise<any[]> {
  const chargers = await this.getChargers();
  
  return Promise.all(
    chargers.map(async (charger) => {
      const connectors = charger.connectors || [];
      
      const connectorsWithMoradores = await Promise.all(
        connectors.map(async (connector: CVEConnector) => {
          let moradorNome = null;
          
          // ❌ PROBLEMA: connector.idTag pode não existir!
          if (connector.idTag) {
            const moradores = await query<{ nome: string }>(
              'SELECT nome FROM moradores WHERE tag_rfid = $1 LIMIT 1',
              [connector.idTag]
            );
            
            if (moradores.length > 0) {
              moradorNome = moradores[0].nome;
            }
          }
          
          return {
            ...connector,
            moradorNome, // ← Adiciona nome do morador
          };
        })
      );
      
      return {
        ...charger,
        connectors: connectorsWithMoradores,
      };
    })
  );
}
```

**Status:** ⚠️ Lógica correta, MAS...

**PROBLEMA:** O tipo `CVEConnector` não tem campo `idTag`!

```typescript
// types/index.ts - LINHA 31-41
export interface CVEConnector {
  connectorPk: number;
  connectorId: number;
  powerMax: number | null;
  connectorUuid: string | null;
  lastStatus: CVEConnectorStatus;
  connectorType: string;
  currentType: string;
  speed: 'SLOW' | 'FAST';
  chargeBoxUuid: string;
  // ❌ FALTA: idTag: string | null;
}
```

---

### 4. **ROTA DO DASHBOARD - ⚠️ PROBLEMA**

```typescript
// dashboard.ts - LINHA 51-94
router.get('/chargers', async (req: Request, res: Response) => {
  const chargers = await cveService.getChargersWithMoradores();
  
  const formattedChargers = chargers.map((charger: any) => {
    const connector = charger.connectors?.[0];
    
    return {
      uuid: charger.uuid,
      nome: charger.description || charger.chargeBoxId,
      status: lastStatus?.status || 'Unavailable',
      usuarioAtual: connector?.moradorNome || null, // ← Aqui!
      // ...
    };
  });
  
  res.json({ success: true, data: formattedChargers });
});
```

**Status:** ⚠️ Lógica correta, MAS...

**PROBLEMA:** `connector.moradorNome` só retorna o **NOME**, falta o **APARTAMENTO**!

---

### 5. **MÉTODOS FALTANTES NO CVEService**

❌ **Não existem:**
- `getChargerStats()` - usado em `dashboard.ts:22`
- `getChargePointByUuid()` - usado em `dashboard.ts:101`
- `formatChargerInfo()` - usado em `dashboard.ts:110`

**Impacto:** Rotas do dashboard vão quebrar!

---

### 6. **FRONTEND - ❌ NÃO EXISTE**

```bash
/vetric-dashboard/frontend/
... no children found ...
```

**Status:** ❌ Pasta vazia!

Você está visualizando o frontend de **outro projeto** (`vetric-interface`)?

---

## 🎯 CAUSAS RAIZ DO PROBLEMA

### Causa #1: **API CVE não retorna `idTag` no status do conector**

A API CVE-PRO retorna:

```json
{
  "connectors": [
    {
      "connectorId": 1,
      "lastStatus": {
        "status": "Charging",
        "currentChargingUserName": "João Silva" // ← Às vezes vem isso
      }
      // ❌ NÃO TEM: "idTag": "ABC123"
    }
  ]
}
```

**Solução:** Buscar o `idTag` de outra fonte:
1. **Transações ativas** (`/api/v1/transactions/active`)
2. **WebSocket** (já funciona!)

---

### Causa #2: **Falta correlação entre transação ativa e status do dashboard**

O WebSocket captura o `idTag` e salva no banco:

```sql
-- Tabela: carregamentos
morador_id | charger_uuid | status
    15     | ABC-123-XYZ  | carregando
```

Mas a rota `/api/dashboard/chargers` **não consulta essa tabela**!

---

### Causa #3: **Retorna só o nome, falta o apartamento**

```typescript
// CVEService.ts - LINHA 143-145
const moradores = await query<{ nome: string }>(
  'SELECT nome FROM moradores WHERE tag_rfid = $1 LIMIT 1',
  [connector.idTag]
);
```

Deveria ser:

```typescript
const moradores = await query<{ nome: string; apartamento: string }>(
  'SELECT nome, apartamento FROM moradores WHERE tag_rfid = $1 LIMIT 1',
  [connector.idTag]
);
```

---

## 🛠️ SOLUÇÕES PROPOSTAS

### ✅ **SOLUÇÃO 1: Buscar IdTag das transações ativas** (RECOMENDADO)

**Lógica:**
1. Buscar carregadores da API CVE
2. Buscar transações ativas (`/api/v1/transactions/active`)
3. Cruzar `chargerUuid` + `connectorId` → `idTag`
4. Buscar morador no banco com `idTag`
5. Retornar `nome` + `apartamento`

**Vantagens:**
- ✅ Dados em tempo real da API CVE
- ✅ Não depende do WebSocket
- ✅ Funciona mesmo se o servidor reiniciar

**Desvantagens:**
- ⚠️ Mais requisições HTTP (pode ser lento)

---

### ✅ **SOLUÇÃO 2: Usar tabela `carregamentos` do banco** (MAIS RÁPIDO)

**Lógica:**
1. Buscar carregadores da API CVE
2. Para cada carregador, buscar carregamento ativo no banco:
   ```sql
   SELECT c.*, m.nome, m.apartamento
   FROM carregamentos c
   INNER JOIN moradores m ON c.morador_id = m.id
   WHERE c.charger_uuid = $1 
     AND c.connector_id = $2
     AND c.status IN ('iniciado', 'carregando')
   ```
3. Retornar dados do morador

**Vantagens:**
- ✅ MUITO mais rápido (1 query SQL)
- ✅ Já tem nome + apartamento
- ✅ Dados consistentes com o WebSocket

**Desvantagens:**
- ⚠️ Depende do WebSocket estar funcionando
- ⚠️ Se o servidor reiniciar, perde dados

---

### ✅ **SOLUÇÃO 3: Híbrida** (MELHOR DE AMBOS)

**Lógica:**
1. Tentar buscar do banco (`carregamentos`)
2. Se não encontrar, buscar da API CVE (`/transactions/active`)
3. Fallback: mostrar "—"

**Vantagens:**
- ✅ Rápido (banco)
- ✅ Confiável (API CVE como backup)
- ✅ Resiliente a falhas

---

## 📊 IMPLEMENTAÇÃO DETALHADA

### Passo 1: **Adicionar `idTag` ao tipo `CVEConnector`**

```typescript
// types/index.ts
export interface CVEConnector {
  connectorPk: number;
  connectorId: number;
  powerMax: number | null;
  connectorUuid: string | null;
  lastStatus: CVEConnectorStatus;
  connectorType: string;
  currentType: string;
  speed: 'SLOW' | 'FAST';
  chargeBoxUuid: string;
  idTag?: string | null; // ← ADICIONAR
}
```

---

### Passo 2: **Adicionar tipo `CVETransaction`**

```typescript
// types/index.ts
export interface CVETransaction {
  transactionPk: number;
  transactionId: number;
  chargeBoxUuid: string;
  chargeBoxId: string;
  connectorId: number;
  idTag: string; // ← Tag RFID do usuário
  startTimestamp: string;
  startValue: number;
  stopTimestamp?: string;
  stopValue?: number;
  stopReason?: string;
}
```

---

### Passo 3: **Criar método `getChargerWithMoradorInfo()`**

```typescript
// CVEService.ts
async getChargerWithMoradorInfo(chargerUuid: string, connectorId: number): Promise<{
  morador: { nome: string; apartamento: string } | null;
  fonte: 'banco' | 'api' | 'nenhuma';
}> {
  // 1. Tentar buscar do banco (carregamentos ativos)
  const carregamento = await query<{
    nome: string;
    apartamento: string;
  }>(
    `SELECT m.nome, m.apartamento
     FROM carregamentos c
     INNER JOIN moradores m ON c.morador_id = m.id
     WHERE c.charger_uuid = $1 
       AND c.connector_id = $2
       AND c.status IN ('iniciado', 'carregando')
     LIMIT 1`,
    [chargerUuid, connectorId]
  );
  
  if (carregamento.length > 0) {
    return {
      morador: carregamento[0],
      fonte: 'banco',
    };
  }
  
  // 2. Fallback: Buscar da API CVE (transações ativas)
  try {
    const transactions = await this.getActiveTransactions();
    const transaction = transactions.find(
      (t) => t.chargeBoxUuid === chargerUuid && t.connectorId === connectorId
    );
    
    if (transaction && transaction.idTag) {
      const morador = await MoradorModel.findByTag(transaction.idTag);
      if (morador) {
        return {
          morador: {
            nome: morador.nome,
            apartamento: morador.apartamento,
          },
          fonte: 'api',
        };
      }
    }
  } catch (error) {
    console.error('Erro ao buscar transações ativas:', error);
  }
  
  // 3. Não encontrado
  return {
    morador: null,
    fonte: 'nenhuma',
  };
}
```

---

### Passo 4: **Atualizar `getChargersWithMoradores()`**

```typescript
// CVEService.ts
async getChargersWithMoradores(): Promise<any[]> {
  const chargers = await this.getChargers();
  
  return Promise.all(
    chargers.map(async (charger) => {
      const connectors = charger.connectors || [];
      
      const connectorsWithMoradores = await Promise.all(
        connectors.map(async (connector: CVEConnector) => {
          const { morador, fonte } = await this.getChargerWithMoradorInfo(
            charger.uuid,
            connector.connectorId
          );
          
          return {
            ...connector,
            morador, // ← { nome, apartamento } ou null
            moradorFonte: fonte, // ← Para debug
          };
        })
      );
      
      return {
        ...charger,
        connectors: connectorsWithMoradores,
      };
    })
  );
}
```

---

### Passo 5: **Atualizar rota do dashboard**

```typescript
// dashboard.ts
router.get('/chargers', async (req: Request, res: Response) => {
  const chargers = await cveService.getChargersWithMoradores();
  
  const formattedChargers = chargers.map((charger: any) => {
    const connector = charger.connectors?.[0];
    const morador = connector?.morador;
    
    // Formatar "Nome (Apto 101)" ou null
    const usuarioAtual = morador
      ? `${morador.nome} (Apto ${morador.apartamento})`
      : null;
    
    return {
      uuid: charger.uuid,
      chargeBoxId: charger.chargeBoxId,
      nome: charger.description || charger.chargeBoxId,
      status: connector?.lastStatus?.status || 'Unavailable',
      usuarioAtual, // ← "João Silva (Apto 101)"
      moradorNome: morador?.nome || null,
      moradorApartamento: morador?.apartamento || null,
      ultimoBatimento: charger.lastHeartbeatTimestamp,
      // ...
    };
  });
  
  res.json({ success: true, data: formattedChargers });
});
```

---

### Passo 6: **Adicionar métodos faltantes**

```typescript
// CVEService.ts

/**
 * Buscar carregador por UUID
 */
async getChargePointByUuid(uuid: string): Promise<CVEChargePoint | null> {
  const chargers = await this.getChargers();
  return chargers.find((c) => c.uuid === uuid) || null;
}

/**
 * Estatísticas dos carregadores
 */
async getChargerStats(): Promise<{
  total: number;
  disponiveis: number;
  ocupados: number;
  indisponiveis: number;
}> {
  const chargers = await this.getChargers();
  
  const stats = {
    total: chargers.length,
    disponiveis: 0,
    ocupados: 0,
    indisponiveis: 0,
  };
  
  chargers.forEach((charger) => {
    const connector = charger.connectors?.[0];
    const status = connector?.lastStatus?.status;
    
    if (status === 'Available') {
      stats.disponiveis++;
    } else if (status === 'Charging' || status === 'Occupied') {
      stats.ocupados++;
    } else {
      stats.indisponiveis++;
    }
  });
  
  return stats;
}

/**
 * Formatar informações do carregador
 */
formatChargerInfo(charger: CVEChargePoint): any {
  const connector = charger.connectors?.[0];
  
  return {
    uuid: charger.uuid,
    chargeBoxId: charger.chargeBoxId,
    nome: charger.description,
    modelo: `${charger.chargePointVendor} ${charger.chargePointModel}`,
    firmware: charger.fwVersion,
    status: connector?.lastStatus?.status || 'Unavailable',
    potencia: connector?.powerMax || null,
    tipoConector: connector?.connectorType || 'Type 2',
    velocidade: connector?.speed || 'SLOW',
    localizacao: {
      latitude: charger.locationLatitude,
      longitude: charger.locationLongitude,
      endereco: charger.address
        ? `${charger.address.street}, ${charger.address.houseNumber} - ${charger.address.city}/${charger.address.state}`
        : '',
    },
    ultimoBatimento: charger.lastHeartbeatTimestamp,
    consumoMensal: charger.monthConsumption,
    ativo: charger.active,
  };
}
```

---

## 🧪 COMO TESTAR

### 1. **Verificar se há carregamentos ativos no banco**

```sql
SELECT 
  c.id,
  c.charger_uuid,
  c.connector_id,
  c.status,
  m.nome,
  m.apartamento,
  m.tag_rfid
FROM carregamentos c
LEFT JOIN moradores m ON c.morador_id = m.id
WHERE c.status IN ('iniciado', 'carregando')
ORDER BY c.inicio DESC;
```

### 2. **Verificar se moradores têm `tag_rfid` cadastrado**

```sql
SELECT id, nome, apartamento, tag_rfid
FROM moradores
WHERE tag_rfid IS NOT NULL AND tag_rfid != '';
```

### 3. **Testar rota do dashboard**

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3001/api/dashboard/chargers | jq
```

Deve retornar:

```json
{
  "success": true,
  "data": [
    {
      "uuid": "...",
      "nome": "Gran Marine 5",
      "status": "Charging",
      "usuarioAtual": "João Silva (Apto 101)", // ← AQUI!
      "moradorNome": "João Silva",
      "moradorApartamento": "101"
    }
  ]
}
```

---

## 📈 PRÓXIMOS PASSOS

1. ✅ **Implementar Solução 3 (Híbrida)** - Mais confiável
2. ✅ **Adicionar métodos faltantes no CVEService**
3. ✅ **Atualizar tipos TypeScript**
4. ✅ **Testar com carregador real em uso**
5. ✅ **Criar frontend** (se não existir em outro lugar)
6. 🔄 **Implementar "Console de Transações"** (próxima fase)

---

## 💡 RECOMENDAÇÃO FINAL

**Implementar a SOLUÇÃO 3 (Híbrida)** porque:

1. ✅ Rápida (usa banco local)
2. ✅ Confiável (fallback na API CVE)
3. ✅ Resiliente (funciona mesmo com falhas)
4. ✅ Retorna nome + apartamento
5. ✅ Fácil de debugar (campo `moradorFonte`)

**Tempo estimado:** 2-3 horas de implementação + testes

---

**VETRIC - CVE** | Análise técnica completa 🎯


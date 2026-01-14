# ✅ SOLUÇÃO: Exibir Morador no Dashboard

**Data:** 12/01/2026  
**Status:** 📋 PLANO DE AÇÃO DEFINIDO  
**Tempo Estimado:** 2-3 horas

---

## 🎯 RESUMO EXECUTIVO

### Problema
O campo **"Morador: —"** está vazio no dashboard mesmo com carregadores em uso.

### Causa Raiz
O backend **NÃO está retornando** o objeto `morador` na rota `/api/dashboard/chargers`.

### Solução
Implementar correlação **IdTag → Morador** usando dados do banco de dados (tabela `carregamentos`).

---

## 🔍 DIAGNÓSTICO COMPLETO

### ✅ O que JÁ FUNCIONA

1. **Modelo de Dados** ✅
   - Tabela `moradores` com campos `nome`, `apartamento`, `tag_rfid`
   - Método `MoradorModel.findByTag()` implementado

2. **WebSocket** ✅
   - Captura `idTag` das mensagens
   - Salva `morador_id` na tabela `carregamentos`
   - Logs mostram: `"👤 Morador identificado: João Silva (Apto 101)"`

3. **Frontend** ✅
   - Componente `ChargerCard` preparado para receber morador
   - Exibe: `"João Silva"` + `"Unidade 101"`
   - Código em `Dashboard.tsx` linha 48-54

### ❌ O que NÃO FUNCIONA

1. **Rota `/api/dashboard/chargers`** ❌
   - Retorna: `usuarioAtual: null`
   - Deveria retornar: `morador: { nome: "João Silva", apartamento: "101" }`

2. **Método `getChargersWithMoradores()`** ❌
   - Tenta buscar `connector.idTag` (não existe na API CVE)
   - Não consulta tabela `carregamentos` do banco

3. **Métodos faltantes no `CVEService`** ❌
   - `getChargerStats()` - usado em dashboard
   - `getChargePointByUuid()` - usado em dashboard
   - `formatChargerInfo()` - usado em dashboard

---

## 🛠️ SOLUÇÃO DETALHADA

### Estratégia: **Buscar do Banco de Dados** (Mais Rápido)

**Por quê?**
- ✅ WebSocket já salva `morador_id` na tabela `carregamentos`
- ✅ 1 query SQL vs múltiplas requisições HTTP
- ✅ Dados consistentes e em tempo real

**Fluxo:**
```
1. GET /api/dashboard/chargers
2. Para cada carregador:
   2.1. Buscar carregamento ativo no banco:
        SELECT m.nome, m.apartamento
        FROM carregamentos c
        INNER JOIN moradores m ON c.morador_id = m.id
        WHERE c.charger_uuid = $1 
          AND c.connector_id = $2
          AND c.status IN ('iniciado', 'carregando')
   2.2. Se encontrar: retornar { nome, apartamento }
   2.3. Se não: retornar null
3. Retornar JSON com campo "morador"
```

---

## 📝 IMPLEMENTAÇÃO PASSO A PASSO

### **PASSO 1:** Adicionar método no `CVEService.ts`

**Arquivo:** `vetric-dashboard/backend/src/services/CVEService.ts`

**Adicionar após linha 236:**

```typescript
/**
 * Buscar informações do morador usando carregamento ativo
 */
async getChargerWithMoradorInfo(
  chargerUuid: string,
  connectorId: number
): Promise<{ nome: string; apartamento: string } | null> {
  try {
    const result = await query<{ nome: string; apartamento: string }>(
      `SELECT m.nome, m.apartamento
       FROM carregamentos c
       INNER JOIN moradores m ON c.morador_id = m.id
       WHERE c.charger_uuid = $1 
         AND c.connector_id = $2
         AND c.status IN ('iniciado', 'carregando')
       LIMIT 1`,
      [chargerUuid, connectorId]
    );
    
    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar morador do carregador:', error);
    return null;
  }
}

/**
 * Buscar carregadores com informações de moradores
 */
async getChargersWithMoradores(): Promise<any[]> {
  const chargers = await this.getChargers();
  
  return Promise.all(
    chargers.map(async (charger) => {
      const connector = charger.connectors?.[0]; // Primeiro conector
      
      if (!connector) {
        return { ...charger, morador: null };
      }
      
      // Buscar morador do carregamento ativo
      const morador = await this.getChargerWithMoradorInfo(
        charger.uuid,
        connector.connectorId
      );
      
      return {
        ...charger,
        morador, // { nome: "João", apartamento: "101" } ou null
      };
    })
  );
}

/**
 * Buscar carregador por UUID
 */
async getChargePointByUuid(uuid: string): Promise<CVECharger | null> {
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
formatChargerInfo(charger: CVECharger): any {
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

**Importante:** Remover o método antigo `getChargersWithMoradores()` (linhas 127-169) e substituir pelo novo acima.

---

### **PASSO 2:** Atualizar tipos TypeScript

**Arquivo:** `vetric-dashboard/backend/src/types/index.ts`

**Adicionar após linha 29:**

```typescript
export interface CVECharger {
  chargeBoxPk: number;
  chargeBoxId: string;
  uuid: string;
  description: string;
  lastHeartbeatTimestamp: string;
  locationLatitude: number;
  locationLongitude: number;
  connectors: CVEConnector[];
  address: CVEAddress;
  usage: number;
  monthConsumption: number;
  active: boolean;
  chargePointVendor: string;
  chargePointModel: string;
  fwVersion: string;
  speedCount: {
    nrSlowTotal: number;
    nrSlowAvailable: number;
    nrFastTotal: number;
    nrFastAvailable: number;
  };
}
```

**Adicionar após linha 60:**

```typescript
export interface CVETransaction {
  transactionPk: number;
  transactionId: number;
  chargeBoxUuid: string;
  chargeBoxId: string;
  connectorId: number;
  idTag: string;
  startTimestamp: string;
  startValue: number;
  stopTimestamp?: string;
  stopValue?: number;
  stopReason?: string;
}
```

---

### **PASSO 3:** Atualizar rota do dashboard

**Arquivo:** `vetric-dashboard/backend/src/routes/dashboard.ts`

**Substituir linhas 51-94 por:**

```typescript
// GET /api/dashboard/chargers - Listar carregadores formatados COM moradores
router.get('/chargers', async (req: Request, res: Response) => {
  try {
    const chargers = await cveService.getChargersWithMoradores();
    
    // Formatar dados para o formato esperado pelo frontend
    const formattedChargers = chargers.map((charger: any) => {
      const connector = charger.connectors?.[0]; // Primeiro conector
      const lastStatus = connector?.lastStatus;
      const morador = charger.morador; // { nome, apartamento } ou null
      
      return {
        uuid: charger.uuid,
        chargeBoxId: charger.chargeBoxId,
        chargeBoxPk: charger.chargeBoxPk,
        nome: charger.description || charger.chargeBoxId,
        status: lastStatus?.status || 'Unavailable',
        statusConector: lastStatus?.status || 'Unavailable',
        usuarioAtual: morador ? `${morador.nome} (Apto ${morador.apartamento})` : null,
        morador: morador, // ← NOVO: Objeto completo para o frontend
        ultimoBatimento: charger.lastHeartbeatTimestamp,
        localizacao: {
          latitude: charger.locationLatitude,
          longitude: charger.locationLongitude,
          endereco: charger.address ? 
            `${charger.address.street}, ${charger.address.houseNumber} - ${charger.address.city}/${charger.address.state}` 
            : '',
        },
        potenciaMaxima: connector?.powerMax || null,
        tipoConector: connector?.connectorType || 'Type 2',
        velocidade: connector?.speed || 'SLOW',
        connectors: charger.connectors,
      };
    });
    
    res.json({
      success: true,
      data: formattedChargers,
    });
  } catch (error: any) {
    console.error('Erro ao buscar carregadores:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

---

## 🧪 COMO TESTAR

### 1. **Verificar carregamentos ativos no banco**

```bash
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE/vetric-dashboard/backend
```

```sql
psql -U seu_usuario -d vetric_dashboard -c "
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
"
```

**Resultado esperado:**
```
 id | charger_uuid  | connector_id | status     | nome         | apartamento | tag_rfid
----+---------------+--------------+------------+--------------+-------------+----------
  5 | ABC-123-XYZ   |            1 | carregando | João Silva   | 101         | RFID001
```

Se não houver resultados, significa que:
- ❌ Nenhum carregamento ativo no momento
- ❌ WebSocket não está salvando dados

---

### 2. **Testar rota da API**

```bash
# Obter token de autenticação
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vetric.com.br","password":"admin123"}' \
  | jq -r '.data.token')

# Buscar carregadores
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/dashboard/chargers | jq
```

**Resultado esperado:**

```json
{
  "success": true,
  "data": [
    {
      "uuid": "abc-123-xyz",
      "nome": "Gran Marine 5",
      "status": "Charging",
      "statusConector": "Charging",
      "usuarioAtual": "João Silva (Apto 101)",
      "morador": {
        "nome": "João Silva",
        "apartamento": "101"
      },
      "ultimoBatimento": "2026-01-12T22:25:15Z"
    }
  ]
}
```

**Se `morador` vier `null`:**
- ✅ Backend funcionando
- ❌ Não há carregamento ativo OU
- ❌ `morador_id` não foi salvo no carregamento

---

### 3. **Verificar frontend**

```bash
# Abrir navegador
open http://localhost:3000/dashboard
```

**Resultado esperado:**
- Card do carregador mostra: **"João Silva"** + **"Unidade 101"**
- Não mostra mais: **"Morador: —"**

---

## 🐛 TROUBLESHOOTING

### Problema 1: `morador` sempre retorna `null`

**Causa:** Não há carregamentos ativos no banco.

**Solução:**
1. Verificar se WebSocket está conectado:
   ```bash
   curl http://localhost:3001/health | jq
   # Deve retornar: "websocket": true
   ```

2. Iniciar um carregamento real ou simular:
   ```sql
   INSERT INTO carregamentos (
     morador_id, charger_uuid, charger_name, connector_id, status, inicio
   ) VALUES (
     1, 'uuid-do-carregador', 'Gran Marine 5', 1, 'carregando', NOW()
   );
   ```

---

### Problema 2: Erro `getChargerStats is not a function`

**Causa:** Métodos faltantes não foram adicionados.

**Solução:** Adicionar todos os métodos do **PASSO 1**.

---

### Problema 3: Frontend não atualiza

**Causa:** Cache do React Query.

**Solução:**
1. Limpar cache do navegador (Cmd+Shift+R no Mac)
2. Ou reiniciar o frontend:
   ```bash
   cd /Users/juliocesarsouza/Desktop/vetric-interface
   npm run dev
   ```

---

## 📊 RESULTADO FINAL

### Antes (Atual)
```
┌─────────────────────────┐
│  Gran Marine 5          │
│  JDBM1200040BB          │
│                         │
│       🔌                │
│                         │
│    ● DISPONÍVEL         │
│                         │
│  Disponível há 00:00:12 │
│                         │
│  Morador: —             │  ← VAZIO
└─────────────────────────┘
```

### Depois (Esperado)
```
┌─────────────────────────┐
│  Gran Marine 5          │
│  JDBM1200040BB          │
│                         │
│       🚗🔌             │
│                         │
│    ● EM USO             │
│                         │
│  Em carga há 00:00:28   │
│                         │
│  João Silva             │  ← NOME
│  Unidade 101            │  ← APARTAMENTO
└─────────────────────────┘
```

---

## ⏱️ ESTIMATIVA DE TEMPO

| Tarefa | Tempo |
|--------|-------|
| Adicionar métodos no `CVEService.ts` | 30 min |
| Atualizar tipos TypeScript | 10 min |
| Atualizar rota do dashboard | 15 min |
| Testar com dados reais | 30 min |
| Ajustes e correções | 30 min |
| **TOTAL** | **~2 horas** |

---

## 🚀 PRÓXIMOS PASSOS (Após Implementação)

1. ✅ **Validar em produção** com carregadores reais
2. ✅ **Adicionar logs** para debug
3. ✅ **Implementar fallback** para API CVE (transações ativas)
4. 🔄 **Criar "Console de Transações"** (próxima fase)
5. 🔄 **Adicionar métricas** (tempo médio de identificação)

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- [ANALISE_PROBLEMA_MORADOR.md](./ANALISE_PROBLEMA_MORADOR.md) - Análise técnica completa
- [TESTE_PRATICO_SUCESSO.md](./TESTE_PRATICO_SUCESSO.md) - Testes da Evolution API
- [EVOLUTION_API_ANALYSIS.md](./EVOLUTION_API_ANALYSIS.md) - Análise da API

---

**VETRIC - CVE** | Solução pronta para implementação! 🎯


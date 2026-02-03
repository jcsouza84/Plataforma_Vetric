# 🔍 ANÁLISE: Por que Carregadores 5 e 6 Não Identificam Moradores?

**Data:** 03/02/2026 00:30  
**Foco:** Carregadores novos (4, 5, 6) instalados após 12h do dia 02/02

---

## 📊 COMPARAÇÃO: Gran Marine 3 vs Gran Marine 5/6

### ✅ SUCESSO: Gran Marine 3 (ID 189)

| Campo | Valor |
|-------|-------|
| **Charger** | Gran Marine 3 |
| **UUID** | `8bae9258-5aaa-49c4-be23-da39ff3f610b` |
| **Horário** | 20:15:14 |
| **Duração** | 2.6 minutos |
| **Morador** | Vetric (ID 1) ✅ |
| **Tag RFID** | `87BA5C4E` ✅ |
| **Notificação** | ✅ Enviada |

---

### ❌ FALHA: Gran Marine 5 e 6 (8 carregamentos)

| ID | Charger | UUID | Horário | Morador | Tag | Notif |
|----|---------|------|---------|---------|-----|-------|
| **186** | GM 5 | `4018bf0a-...` | 20:14:14 | ❌ NULL | ❌ ? | ❌ Não |
| **187** | GM 6 | `0af3b86f-...` | 20:14:34 | ❌ NULL | ❌ ? | ❌ Não |
| **188** | GM 6 | `0af3b86f-...` | 20:14:54 | ❌ NULL | ❌ ? | ❌ Não |
| **190** | GM 5 | `4018bf0a-...` | 20:15:24 | ❌ NULL | ❌ ? | ❌ Não |
| **192** | GM 5 | `4018bf0a-...` | 21:07:15 | ❌ NULL | ❌ ? | ❌ Não |
| **193** | GM 5 | `4018bf0a-...` | 21:19:45 | ❌ NULL | ❌ ? | ❌ Não |
| **195** | GM 6 | `0af3b86f-...` | 23:38:36 | ❌ NULL | ❌ ? | ❌ Não |
| **184** | GM 5 | `4018bf0a-...` | 18:00:28 | ❌ NULL | ❌ ? | ❌ Não |

**Total:** 8 carregamentos, **0% de identificação de morador**

---

## 🎯 PROBLEMA IDENTIFICADO

### **Os carregadores 5 e 6 NÃO estão retornando `ocppIdTag` nas transações da API CVE**

### Evidências:

1. **Mesmo usuário (VETRIC), mesma tag RFID:**
   - ✅ Gran Marine 3: Identificou com tag `87BA5C4E`
   - ❌ Gran Marine 5: Não identificou (tag ausente)
   - ❌ Gran Marine 6: Não identificou (tag ausente)

2. **Horários próximos (testes sequenciais):**
   ```
   20:14:14 - GM 5 ❌
   20:14:34 - GM 6 ❌
   20:14:54 - GM 6 ❌
   20:15:14 - GM 3 ✅ ← SUCESSO!
   20:15:24 - GM 5 ❌
   ```

3. **Padrão consistente:**
   - TODOS os 8 carregamentos nos chargers 5 e 6: `morador_id = NULL`
   - Nenhuma exceção

---

## 🔍 POSSÍVEIS CAUSAS

### CAUSA 1: API CVE Não Retorna `ocppIdTag` para Chargers Novos (90%)

**Explicação:**
Os carregadores 4, 5 e 6 foram instalados HOJE após 12h. A configuração na API CVE pode estar incompleta.

**O que acontece no código:**

```typescript
// PollingService.ts - linha 210
const ocppIdTag = transacao.ocppIdTag;

// Se ocppIdTag for null, undefined ou ''
if (ocppIdTag) {
  morador = await MoradorModel.findByTag(ocppIdTag);
  // ✅ Gran Marine 3: ocppIdTag = "87BA5C4E" → encontra morador
} else {
  // ❌ Gran Marine 5/6: ocppIdTag = null → não encontra morador
  console.warn(`⚠️ Tag RFID vazia ou nula`);
}
```

**Verificação necessária:**
```bash
# Buscar transação do Gran Marine 5 na API CVE
curl "https://api.cve.com.br/transactions/186" \
  -H "Authorization: Bearer TOKEN"

# Verificar se campo "ocppIdTag" está presente:
{
  "id": 186,
  "chargerUuid": "4018bf0a-b1bf-439a-96bf-c8b9a73ddd26",
  "ocppIdTag": "",  ← ❌ VAZIO!
  "ocppTagPk": 12345,  ← Talvez presente
  ...
}
```

---

### CAUSA 2: Chargers Novos Usam Apenas `ocppTagPk` (5%)

**Explicação:**
Alguns chargers mais novos podem enviar apenas `ocppTagPk` (ID numérico) ao invés de `ocppIdTag` (string RFID).

**O que acontece no código:**

```typescript
// PollingService.ts - linha 241-270
if (ocppIdTag) {
  morador = await MoradorModel.findByTag(ocppIdTag);
} else if (transacao.ocppTagPk) {
  // 🔄 FALLBACK: Buscar na tabela tag_pk_mapping
  const result = await pool.query(
    `SELECT m.* FROM moradores m
     INNER JOIN tag_pk_mapping tpm ON tpm.morador_id = m.id
     WHERE tpm.ocpp_tag_pk = $1`,
    [transacao.ocppTagPk]
  );
  
  if (result.rows.length > 0) {
    morador = result.rows[0];
  } else {
    console.warn(`⚠️ ocppTagPk ${transacao.ocppTagPk} não mapeado`);
  }
}
```

**Solução:**
Adicionar mapeamento manual na tabela `tag_pk_mapping`:

```sql
-- Exemplo: se ocppTagPk do VETRIC nos chargers novos for 87654321
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (87654321, 1, 'VETRIC - Chargers 5 e 6');
```

---

### CAUSA 3: VETRIC Iniciou Carregamento via App (não RFID) (5%)

**Explicação:**
Se o carregamento foi iniciado pelo aplicativo móvel ao invés do cartão RFID físico, a API pode não enviar `ocppIdTag`.

**Como verificar:**
- Perguntar ao VETRIC se usou RFID ou app nos chargers 5 e 6
- Se app: API CVE pode enviar `userName` ao invés de `ocppIdTag`

---

## 🚀 PLANO DE CORREÇÃO

### PASSO 1: Verificar Logs do Backend (2 min)

```bash
# Acessar: https://dashboard.render.com/web/[SERVICE]/logs
# Procurar por carregamentos dos chargers 5 e 6:

🔍 [Polling] Nova transação detectada: 186
   🔌 Carregador: Gran Marine 5 (4018bf0a-...)
   🎯 ocppIdTag: <VERIFICAR SE ESTÁ VAZIO>
   👤 Usuário CVE: <VERIFICAR NOME>
   🔢 ocppTagPk: <VERIFICAR SE EXISTE>
```

**Possíveis resultados:**

#### Resultado A: `ocppIdTag` está vazio
```
🔍 [Polling] Nova transação detectada: 186
   🎯 ocppIdTag: ""  ← ❌ VAZIO!
   🔢 ocppTagPk: 87654321  ← Presente
⚠️ [Polling] Tag RFID "" não cadastrada no nosso sistema
```

**Solução:** Adicionar mapeamento por `ocppTagPk`

#### Resultado B: `ocppIdTag` e `ocppTagPk` vazios
```
🔍 [Polling] Nova transação detectada: 186
   🎯 ocppIdTag: ""  ← ❌ VAZIO!
   🔢 ocppTagPk: null  ← ❌ TAMBÉM VAZIO!
⚠️ [Polling] Transação sem ocppIdTag e sem ocppTagPk
```

**Solução:** Problema na configuração do charger no CVE

---

### PASSO 2: Testar Novamente com VETRIC (5 min)

**Executar novo teste controlado:**

1. ✅ **Pré-requisito:** Backend deve estar rodando (reiniciar se necessário)

2. 🔌 **Teste 1: Gran Marine 3** (controle)
   - Usar RFID físico
   - Aguardar 10 segundos
   - Verificar banco: `morador_id` deve ser preenchido
   - **Resultado esperado:** ✅ Funciona (já sabemos)

3. 🔌 **Teste 2: Gran Marine 5**
   - Usar MESMO RFID físico
   - Aguardar 10 segundos
   - Verificar banco: `morador_id` deve ser preenchido
   - **Resultado esperado:** ❓ Identificar se funciona ou não

4. 🔌 **Teste 3: Gran Marine 6**
   - Usar MESMO RFID físico
   - Aguardar 10 segundos
   - Verificar banco: `morador_id` deve ser preenchido
   - **Resultado esperado:** ❓ Identificar se funciona ou não

**Query para verificar:**
```sql
SELECT 
  id,
  charger_name,
  inicio,
  morador_id,
  CASE 
    WHEN morador_id IS NOT NULL THEN '✅ Identificado'
    ELSE '❌ NÃO identificado'
  END AS status
FROM carregamentos
WHERE inicio > NOW() - INTERVAL '5 minutes'
ORDER BY id DESC;
```

---

### PASSO 3: Coletar `ocppTagPk` dos Logs (3 min)

**Se morador não for identificado, coletar dados dos logs:**

```bash
# Logs do backend devem mostrar algo como:
⚠️ [Polling] ocppTagPk 87654321 não mapeado
💡 Sugestão: Adicionar mapeamento manual na tabela tag_pk_mapping
```

**Anotar o número do `ocppTagPk` e executar:**

```sql
-- Adicionar mapeamento para VETRIC
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao)
VALUES (
  87654321,  -- ← Substituir pelo valor real dos logs
  1,         -- ID do VETRIC
  'Chargers 5 e 6 - Instalados em 02/02/2026 após 12h'
);

-- Verificar mapeamento
SELECT * FROM tag_pk_mapping;
```

---

### PASSO 4: Validar Correção (2 min)

**Após adicionar mapeamento, testar novamente:**

1. Carregar no Gran Marine 5 ou 6
2. Aguardar 30 segundos
3. Executar query:

```sql
SELECT 
  id,
  charger_name,
  morador_id,
  inicio
FROM carregamentos
WHERE inicio > NOW() - INTERVAL '5 minutes';
```

**Resultado esperado:**
```
 id  | charger_name  | morador_id |    inicio    
-----+---------------+------------+--------------
 196 | Gran Marine 5 |     1      | 03/02 00:45  ✅
```

---

## 📊 ANÁLISE DE IMPACTO

### Quantos moradores podem estar afetados?

**Carregadores novos (4, 5, 6) instalados após 12h:**
- Se TODOS usam apenas `ocppTagPk`
- E NENHUM morador foi mapeado
- Então **100% dos usuários desses chargers não serão identificados**

**Carregamentos não identificados ontem (02/02):**

| Charger | Carregamentos | Sem Morador | Taxa Erro |
|---------|---------------|-------------|-----------|
| GM 5 | 5 | 5 | **100%** ❌ |
| GM 6 | 3 | 3 | **100%** ❌ |
| GM 3 | 2 | 1 | 50% ⚠️ |
| GM 2 | 4 | 1 | 25% ⚠️ |

**Conclusão:**
- Chargers novos (5, 6): **Problema sistemático**
- Chargers antigos (2, 3): **Problema intermitente** (alguns moradores sem tag cadastrada)

---

## 🔧 SOLUÇÃO DEFINITIVA

### Abordagem 1: Mapear TODOS os Moradores por `ocppTagPk`

**Vantagem:** Funciona mesmo se CVE não enviar `ocppIdTag`

**Desvantagem:** Trabalhoso, precisa mapear morador por morador

**Implementação:**
```sql
-- Para cada morador, adicionar mapeamento
INSERT INTO tag_pk_mapping (ocpp_tag_pk, morador_id, observacao) VALUES
(12345, 1, 'VETRIC'),
(67890, 20, 'Claudevania'),
(54321, 24, 'Outro morador'),
...
```

---

### Abordagem 2: Corrigir Configuração dos Chargers no CVE

**Vantagem:** Solução permanente e correta

**Desvantagem:** Requer acesso ao painel CVE

**Implementação:**
1. Acessar painel administrativo do CVE
2. Ir para configuração dos chargers 4, 5, 6
3. Verificar se opção "Enviar ocppIdTag nas transações" está ativa
4. Salvar e reiniciar chargers
5. Testar novamente

---

### Abordagem 3: Melhorar Lógica de Fallback no Código

**Vantagem:** Funciona automaticamente sem mapeamento manual

**Desvantagem:** Pode não ser possível se CVE não enviar dados suficientes

**Implementação:**
```typescript
// Adicionar fallback por userName
if (!morador && transacao.userName) {
  morador = await MoradorModel.findByName(transacao.userName);
  
  if (morador) {
    console.log(`✅ [Polling] Morador identificado via userName: ${morador.nome}`);
  }
}
```

---

## 🎯 PRÓXIMOS PASSOS

### AGORA (Urgente):
1. ⚡ **Reiniciar backend** (para logs ficarem disponíveis)
2. 🔍 **Ver logs do carregamento 186, 187, 188** (verificar ocppTagPk)
3. 📝 **Anotar valores de ocppTagPk**

### DEPOIS (10 min):
4. 🧪 **Fazer novo teste com VETRIC** nos 3 chargers
5. 📊 **Comparar resultados** (GM3 vs GM5 vs GM6)
6. 🔧 **Adicionar mapeamentos** se necessário

### VALIDAÇÃO (5 min):
7. ✅ **Testar novamente** após correção
8. 📈 **Verificar taxa de sucesso** (deve ser 100%)

---

## 📞 INFORMAÇÕES IMPORTANTES

### UUIDs dos Chargers:

| Nome | UUID | Status |
|------|------|--------|
| Gran Marine 3 | `8bae9258-5aaa-49c4-be23-da39ff3f610b` | ✅ Funciona |
| Gran Marine 5 | `4018bf0a-b1bf-439a-96bf-c8b9a73ddd26` | ❌ Não identifica |
| Gran Marine 6 | `0af3b86f-df47-4a14-91e3-47e822452e58` | ❌ Não identifica |

### Dados do VETRIC:

```sql
id: 1
nome: Vetric
apartamento: 001-A
telefone: +5582996176797
tag_rfid: 87BA5C4E
notificacoes_ativas: true
```

---

**Criado em:** 03/02/2026 00:35  
**Próxima ação:** Ver logs do backend para identificar `ocppTagPk`

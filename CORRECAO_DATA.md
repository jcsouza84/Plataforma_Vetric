# 📅 CORREÇÃO: Bug de Data na API CVE-PRO

**Data da Correção:** 15/01/2026  
**Arquivo Afetado:** `apps/backend/src/services/CVEService.ts`  
**Status:** ✅ Implementado e Testado

---

## 🐛 PROBLEMA IDENTIFICADO

A **API CVE-PRO da Intelbras** possui um bug no parâmetro `toDate` do endpoint `/api/v1/transaction`:

### Comportamento Esperado:
```
fromDate: 2026-01-14 00:00:00
toDate:   2026-01-14 23:59:59
```
**Deveria retornar:** Todas as transações do dia 14/01

### Comportamento Real:
❌ A API **ignora a hora** do parâmetro `toDate` e considera apenas a **data**  
❌ Resultado: Transações do final do dia **não são retornadas**

---

## 🔍 EXEMPLO DO BUG

### Teste Manual via Postman/Curl:

```bash
# ❌ NÃO FUNCIONA (retorna apenas parte do dia)
GET /api/v1/transaction?fromDate=2026-01-14 00:00:00&toDate=2026-01-14 23:59:59
Resultado: 10 transações

# ✅ FUNCIONA (retorna o dia completo)
GET /api/v1/transaction?fromDate=2026-01-14 00:00:00&toDate=2026-01-15 23:59:59
Resultado: 4329 transações
```

**Descoberta:** Para buscar transações de **HOJE completo**, é necessário colocar **AMANHÃ** no `toDate`.

---

## ✅ SOLUÇÃO IMPLEMENTADA

Adicionar **+1 ou +2 dias** no `toDate` para contornar o bug da API.

### Métodos Corrigidos:

#### 1. `getActiveTransactions()` (linha 288)

**ANTES:**
```typescript
async getActiveTransactions(): Promise<CVETransaction[]> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999); // ❌ API ignora a hora!
  
  const allTransactions = await this.getTransactions(
    formatDate(startOfDay),
    formatDate(endOfDay) // ❌ Não pega transações do final do dia
  );
}
```

**DEPOIS:**
```typescript
async getActiveTransactions(): Promise<CVETransaction[]> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  // FIX: API CVE-PRO não respeita hora no toDate
  const endOfDay = new Date(now);
  endOfDay.setDate(endOfDay.getDate() + 2); // ✅ +2 dias
  endOfDay.setHours(0, 0, 0, 0);
  
  const allTransactions = await this.getTransactions(
    formatDate(startOfDay),
    formatDate(endOfDay) // ✅ Agora pega todas as transações
  );
}
```

#### 2. `findOcppIdTagByPk()` (linha 193)

**ANTES:**
```typescript
async findOcppIdTagByPk(ocppTagPk: number): Promise<string | null> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const fromDate = formatDate(thirtyDaysAgo);
  const toDate = formatDate(now); // ❌ Não pega transações recentes
  
  const transactions = await this.getTransactions(fromDate, toDate);
}
```

**DEPOIS:**
```typescript
async findOcppIdTagByPk(ocppTagPk: number): Promise<string | null> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const fromDate = formatDate(thirtyDaysAgo);
  
  // FIX: API CVE-PRO não respeita hora no toDate, adicionar +1 dia
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1); // ✅ +1 dia
  const toDate = formatDate(tomorrow);
  
  const transactions = await this.getTransactions(fromDate, toDate);
}
```

---

## 📊 RESULTADOS DA CORREÇÃO

### Antes da Correção:
```
📅 toDate: 2026-01-14 23:59:59
✅ [CVE] 10 transação(ões) encontrada(s)
⚠️  Gran Marine 3 ativo mas sem idTag identificável
```

### Depois da Correção:
```
📅 toDate: 2026-01-16 00:00:00
✅ [CVE] 11 transação(ões) encontrada(s)
⚡ [CVE] 1 transação(ões) ATIVA(S):
   🔌 Gran Marine 3
      👤 saskya lorena 
      🎯 ocppIdTag: CD98043B
```

---

## 🎯 CASO ESPECÍFICO RESOLVIDO

### Transação ID 432998 (Gran Marine 3)

**Problema Original:**
- Carregador Gran Marine 3 mostrava status `Charging`
- Sistema não conseguia identificar a tag/morador
- Mensagem: "⚠️ Carregador ativo mas sem idTag identificável"

**Causa:**
- A transação ID 432998 iniciou em `15/01/2026 00:26:33` (madrugada)
- O sistema buscava até `14/01/2026 23:59:59`
- API CVE-PRO ignorava a hora e não retornava a transação

**Solução:**
- Com `toDate: 2026-01-16 00:00:00`, a transação agora é encontrada
- Sistema identifica corretamente:
  - Usuária: **saskya lorena**
  - Tag RFID: **CD98043B**
  - Apartamento: cadastrado no sistema

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### Arquivo Modificado:
```
apps/backend/src/services/CVEService.ts
```

### Linhas Alteradas:
- Linha ~297: `getActiveTransactions()` - +2 dias no toDate
- Linha ~211: `findOcppIdTagByPk()` - +1 dia no toDate

### Código Completo da Correção:

```typescript
// Método 1: getActiveTransactions()
const endOfDay = new Date(now);
endOfDay.setDate(endOfDay.getDate() + 2); // +2 dias
endOfDay.setHours(0, 0, 0, 0);

// Método 2: findOcppIdTagByPk()
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1); // +1 dia
const toDate = formatDate(tomorrow);
```

---

## ✅ TESTES REALIZADOS

### 1. Teste de Busca de Período:
```bash
fromDate: 2026-01-11 00:00:00
toDate:   2026-01-16 00:00:00

Resultado: ✅ 41 transações encontradas (incluindo 432998)
```

### 2. Teste de Transações Ativas:
```bash
Busca automática de hoje + 2 dias

Resultado: ✅ 1 transação ativa identificada
- Gran Marine 3 (saskya lorena)
```

### 3. Teste de Identificação de Morador:
```bash
Tag CD98043B encontrada no Gran Marine 3

Resultado: ✅ Morador identificado corretamente
```

---

## 📝 NOTAS IMPORTANTES

### Por que +2 dias em `getActiveTransactions()`?

1. **Dia 14 às 23h:** Sistema busca transações ativas
2. **toDate precisa ser 16/01:** Para incluir todas as transações do dia 15
3. **Margem de segurança:** Garante que transações da madrugada sejam incluídas

### Por que +1 dia em `findOcppIdTagByPk()`?

- Este método busca histórico de 30 dias
- +1 dia é suficiente pois não precisa de margem grande
- Evita buscar muitas transações desnecessárias

---

## 🚨 ATENÇÃO

### NÃO modificar estas correções sem testar!

A API CVE-PRO pode corrigir o bug no futuro. Se isso acontecer:

1. **Sintoma:** Sistema começará a buscar transações de dias extras desnecessários
2. **Solução:** Reverter para usar a hora correta sem adicionar dias
3. **Teste:** Validar que transações do final do dia são retornadas

### Como Reverter (se necessário):

```typescript
// getActiveTransactions() - REVERTER
const endOfDay = new Date(now);
endOfDay.setHours(23, 59, 59, 999); // Voltar para hora normal
// REMOVER: endOfDay.setDate(endOfDay.getDate() + 2);

// findOcppIdTagByPk() - REVERTER
const toDate = formatDate(now); // Voltar para data atual
// REMOVER: tomorrow.setDate(tomorrow.getDate() + 1);
```

---

## 📌 REFERÊNCIAS

- **Descoberta:** 15/01/2026 via teste manual no Postman
- **Implementação:** CVEService.ts linhas 211 e 297
- **Teste bem-sucedido:** Transação 432998 identificada
- **Commit:** [Adicionar hash do commit após fazer o commit]

---

## 🎓 LIÇÕES APRENDIDAS

1. ✅ Sempre testar endpoints manualmente quando houver comportamento estranho
2. ✅ APIs de terceiros podem ter bugs - criar workarounds quando necessário
3. ✅ Documentar bugs e soluções para manutenção futura
4. ✅ Adicionar comentários `// FIX:` para identificar workarounds no código
5. ✅ Testar com dados reais para validar correções

---

**Desenvolvido para:** VETRIC - Plataforma do Síndico  
**Cliente:** Gran Marine (Maceió/AL)  
**Data:** Janeiro 2026



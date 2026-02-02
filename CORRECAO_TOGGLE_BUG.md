# 🐛 CORREÇÃO: Erro ao Clicar no Toggle

**Data:** 02/02/2026  
**Commit:** `5b9b2a2`  
**Branch:** `feature/eventos-notificacoes-limpa`

---

## 🔴 PROBLEMA

Ao clicar no toggle (switch ON/OFF) de qualquer template **SEM** ter clicado em "Editar Template" antes, a API retornava:

```json
{
  "success": false,
  "error": "Nenhum campo para atualizar"
}
```

**Erro no console:**
```
[API Error] {success: false, error: 'Nenhum campo para atualizar'}
PUT http://localhost:3001/api/templates/bateria_cheia 400 (Bad Request)
```

---

## 🔍 CAUSA RAIZ

### **1. Frontend - Lógica do Toggle Incorreta**

**Arquivo:** `apps/frontend/src/pages/Configuracoes.tsx`

**Antes (bugado):**
```typescript
<Switch
  checked={isEditing ? currentData.ativo : template.ativo}
  onCheckedChange={(checked) => {
    if (isEditing) {
      // OK: atualiza estado local
    } else {
      handleEditTemplate(template.tipo, { ...template, ativo: checked });
      handleSaveTemplate(template.tipo);  // ← PROBLEMA!
    }
  }}
/>
```

**O que acontecia:**
1. Usuário clica no toggle (NÃO está editando)
2. `handleEditTemplate` é chamado, mas não atualiza o estado `templateData[tipo]`
3. `handleSaveTemplate` tenta buscar `templateData[tipo]`, que está **vazio** ou **undefined**
4. API recebe objeto vazio: `{}`
5. Backend rejeita: "Nenhum campo para atualizar"

---

### **2. Backend - Validação Muito Restrita**

**Arquivo:** `apps/backend/src/routes/templates.ts`

**Antes (bugado):**
```typescript
// Validações básicas
if (!data.mensagem && data.ativo === undefined) {
  return res.status(400).json({
    success: false,
    error: 'Nenhum campo para atualizar',
  });
}
```

**Problema:**
- Exigia `mensagem` OU `ativo`
- Ignorava os novos campos `tempo_minutos` e `power_threshold_w`
- Se o objeto viesse vazio, retornava erro 400

---

### **3. Backend - Model Incompleto**

**Arquivo:** `apps/backend/src/models/TemplateNotificacao.ts`

**Antes (incompleto):**
```typescript
static async update(tipo: string, data: UpdateTemplateDTO) {
  if (data.mensagem !== undefined) {
    fields.push(`mensagem = $${paramIndex++}`);
    values.push(data.mensagem);
  }

  if (data.ativo !== undefined) {
    fields.push(`ativo = $${paramIndex++}`);
    values.push(data.ativo);
  }

  // ❌ Faltavam tempo_minutos e power_threshold_w!
}
```

---

### **4. Backend - Tipos Incompletos**

**Arquivo:** `apps/backend/src/types/index.ts`

**Antes (incompleto):**
```typescript
export interface UpdateTemplateDTO {
  mensagem?: string;
  ativo?: boolean;
  // ❌ Faltavam tempo_minutos e power_threshold_w!
}

export interface TemplateNotificacao {
  tipo: 'inicio_carregamento' | 'fim_carregamento' | 'erro_carregamento';  // ❌ Tipos fixos!
  mensagem: string;
  ativo: boolean;
  // ❌ Faltavam tempo_minutos e power_threshold_w!
}
```

---

## ✅ SOLUÇÃO IMPLEMENTADA

### **1. Frontend - Toggle Independente**

**Arquivo:** `apps/frontend/src/pages/Configuracoes.tsx`

**Depois (corrigido):**
```typescript
<Switch
  checked={isEditing ? currentData.ativo : template.ativo}
  onCheckedChange={async (checked) => {
    if (isEditing) {
      // Apenas atualizar estado local se estiver editando
      setTemplateData({
        ...templateData,
        [template.tipo]: { ...currentData, ativo: checked },
      });
    } else {
      // ✅ FAZER CHAMADA DIRETA DA API
      try {
        await updateMutation.mutateAsync({
          tipo: template.tipo,
          updates: { ativo: checked },  // ← Enviar apenas o campo ativo
        });

        toast({
          title: checked ? 'Notificação ativada!' : 'Notificação desativada!',
          description: `Template "${info?.title}" foi ${checked ? 'ativado' : 'desativado'}`,
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao atualizar',
          description: error.response?.data?.error || error.message,
          variant: 'destructive',
        });
      }
    }
  }}
/>
```

**Benefícios:**
- ✅ Toggle funciona **independente** de estar editando
- ✅ Envia apenas o campo `ativo`, sem precisar carregar todos os outros campos
- ✅ Feedback visual imediato (toast)
- ✅ Tratamento de erro específico

---

### **2. Backend - Validação Flexível**

**Arquivo:** `apps/backend/src/routes/templates.ts`

**Depois (corrigido):**
```typescript
// Validações básicas - verificar se pelo menos um campo foi enviado
const hasUpdates = 
  data.mensagem !== undefined || 
  data.ativo !== undefined ||
  data.tempo_minutos !== undefined ||
  data.power_threshold_w !== undefined;

if (!hasUpdates) {
  return res.status(400).json({
    success: false,
    error: 'Nenhum campo para atualizar',
  });
}
```

**Benefícios:**
- ✅ Aceita **qualquer combinação** de campos
- ✅ Suporta os novos campos `tempo_minutos` e `power_threshold_w`
- ✅ Mais flexível para futuras expansões

---

### **3. Backend - Model Completo**

**Arquivo:** `apps/backend/src/models/TemplateNotificacao.ts`

**Depois (corrigido):**
```typescript
static async update(tipo: string, data: UpdateTemplateDTO) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.mensagem !== undefined) {
    fields.push(`mensagem = $${paramIndex++}`);
    values.push(data.mensagem);
  }

  if (data.ativo !== undefined) {
    fields.push(`ativo = $${paramIndex++}`);
    values.push(data.ativo);
  }

  // ✅ NOVOS CAMPOS ADICIONADOS
  if (data.tempo_minutos !== undefined) {
    fields.push(`tempo_minutos = $${paramIndex++}`);
    values.push(data.tempo_minutos);
  }

  if (data.power_threshold_w !== undefined) {
    fields.push(`power_threshold_w = $${paramIndex++}`);
    values.push(data.power_threshold_w);
  }

  // ... resto do código
}
```

---

### **4. Backend - Tipos Completos**

**Arquivo:** `apps/backend/src/types/index.ts`

**Depois (corrigido):**
```typescript
export interface UpdateTemplateDTO {
  mensagem?: string;
  ativo?: boolean;
  tempo_minutos?: number;        // ✅ NOVO
  power_threshold_w?: number;    // ✅ NOVO
}

export interface TemplateNotificacao {
  id?: number;
  tipo: string;                  // ✅ Tipo flexível (não mais fixo)
  mensagem: string;
  ativo: boolean;
  tempo_minutos?: number;        // ✅ NOVO
  power_threshold_w?: number;    // ✅ NOVO
  criado_em?: Date;
  atualizado_em?: Date;
}
```

---

## 📊 ANTES vs DEPOIS

### **Fluxo ANTES (bugado):**

```
Usuário clica no toggle
      ↓
handleEditTemplate (NÃO atualiza estado)
      ↓
handleSaveTemplate (busca templateData[tipo])
      ↓
templateData[tipo] = undefined ou {}
      ↓
API recebe: PUT /templates/bateria_cheia {}
      ↓
Backend: "Nenhum campo para atualizar" ❌
```

### **Fluxo DEPOIS (corrigido):**

```
Usuário clica no toggle
      ↓
updateMutation.mutateAsync (chamada direta)
      ↓
API recebe: PUT /templates/bateria_cheia { ativo: true }
      ↓
Backend valida: hasUpdates = true ✅
      ↓
Model.update: atualiza apenas campo ativo
      ↓
Banco: UPDATE templates_notificacao SET ativo = true ✅
      ↓
Frontend: Toast "Notificação ativada!" ✅
```

---

## 🧪 TESTE

### **Como testar:**

1. **Recarregue o frontend:** `http://localhost:8080/configuracoes`
2. **Clique em qualquer toggle** (SEM clicar em "Editar Template")
3. **Resultado esperado:**
   - ✅ Toggle muda de OFF para ON (ou vice-versa)
   - ✅ Toast aparece: "Notificação ativada!" ou "Notificação desativada!"
   - ✅ **SEM** erros no console
   - ✅ Atualização persiste ao recarregar a página

### **Validação no banco:**

```sql
SELECT tipo, ativo, tempo_minutos, power_threshold_w 
FROM templates_notificacao 
ORDER BY tipo;
```

**Resultado esperado:**
```
         tipo          | ativo | tempo_minutos | power_threshold_w 
-----------------------+-------+---------------+-------------------
 bateria_cheia         | true  |             3 |                10
 inicio                | true  |             0 |              null
 inicio_ociosidade     | true  |             0 |                10
 interrupcao           | false |             0 |              null
```

---

## 📝 ARQUIVOS MODIFICADOS

| Arquivo | Mudança |
|---------|---------|
| `apps/frontend/src/pages/Configuracoes.tsx` | Toggle com chamada direta da API |
| `apps/backend/src/routes/templates.ts` | Validação flexível (4 campos) |
| `apps/backend/src/models/TemplateNotificacao.ts` | Update suporta novos campos |
| `apps/backend/src/types/index.ts` | Interfaces atualizadas |

---

## ✅ CHECKLIST

- [x] Frontend: Toggle funciona sem editar primeiro
- [x] Backend: Aceita apenas `ativo` no body
- [x] Backend: Aceita `tempo_minutos` e `power_threshold_w`
- [x] Tipos: Interfaces atualizadas
- [x] Sem erros de linter
- [x] Commit realizado
- [x] Documentação criada

---

## 🎯 PRÓXIMOS PASSOS

1. **Teste localmente:**
   - Recarregue a página de configurações
   - Teste todos os toggles
   - Edite templates e salve
   - Teste campos `tempo_minutos` e `power_threshold_w`

2. **Validação:**
   - Confirme que não há mais erros 400
   - Verifique que os dados persistem no banco
   - Teste com diferentes valores

3. **Deploy:**
   - Quando tudo estiver validado localmente
   - Fazer merge para `main`
   - Deploy para produção

---

**VETRIC - Sistema de Notificações Inteligentes**  
**Versão:** 1.0  
**Data:** 02/02/2026  
**Status:** ✅ **BUG CORRIGIDO**

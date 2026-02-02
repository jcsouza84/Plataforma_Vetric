# 🧹 APLICAR LIMPEZA DE TEMPLATES (URGENTE)

## 📋 Problema Identificado
O banco de produção tem **templates antigos + templates novos** misturados, causando exibição incorreta na interface.

## 🎯 Solução
Aplicar migration que:
1. ❌ Remove templates antigos (`inicio`, `fim`, `erro`, `ocioso`, `disponivel`)
2. ✅ Mantém apenas os 4 principais (`inicio_recarga`, `inicio_ociosidade`, `bateria_cheia`, `interrupcao`)
3. ✅ Garante dados corretos com campos `tempo_minutos` e `power_threshold_w`

---

## 🚀 PASSOS PARA APLICAR

### 1️⃣ Acesse o Render Dashboard
```
https://dashboard.render.com
```

### 2️⃣ Navegue até o Banco de Dados
- Clique em **"vetric-db"** (seu PostgreSQL)
- No menu superior, clique em **"Connect"**
- Clique em **"PSQL Command"**

### 3️⃣ Abra o Arquivo da Migration
Abra o arquivo: `migrations/20260202_limpar_templates_antigos.sql`

### 4️⃣ Copie e Cole no Terminal do Render
- Cole **TODO o conteúdo** do arquivo SQL no terminal PSQL do Render
- Pressione **Enter**

### 5️⃣ Aguarde a Execução
Você verá:
```sql
DELETE 5  -- Remove 5 templates antigos
INSERT 0 1  -- Insere/atualiza templates principais (x4)
```

E no final, uma tabela mostrando apenas os 4 templates:

```
 id |        tipo        | mensagem_preview | tempo_minutos | power_threshold_w | ativo
----+--------------------+------------------+---------------+-------------------+-------
  X | inicio_recarga     | 🔌 Olá {{nome}}! |       0       |      NULL         | t
  X | inicio_ociosidade  | ⚠️ Olá {{nome}}! |       0       |        10         | f
  X | bateria_cheia      | 🔋 Olá {{nome}}! |       3       |        10         | f
  X | interrupcao        | ⚠️ Olá {{nome}}! |       0       |      NULL         | f
```

### 6️⃣ Recarregue a Página de Configurações
```
https://plataforma-vetric.onrender.com/configuracoes
```

**Resultado esperado:** Apenas 4 templates visíveis com títulos corretos! ✅

---

## ⚠️ IMPORTANTE

- Esta migration é **SEGURA** e **REVERSÍVEL**
- Remove apenas templates antigos que não são mais usados
- **NÃO afeta** os 60 moradores cadastrados
- **NÃO altera** configurações do Evolution API
- **NÃO afeta** carregamentos em andamento

---

## 🆘 Se Der Erro

Se aparecer qualquer erro, **copie e cole aqui** que eu analiso imediatamente.

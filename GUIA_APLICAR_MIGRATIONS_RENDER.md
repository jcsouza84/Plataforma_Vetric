# 📋 GUIA: APLICAR MIGRATIONS NO RENDER (Produção)

**Data:** 02/02/2026  
**Sistema:** VETRIC Gran Marine  
**Objetivo:** Adicionar campos para Notificações Inteligentes

---

## 🎯 PASSO A PASSO

### **PASSO 1: Acessar Render Dashboard**

1. Abra seu navegador
2. Acesse: https://dashboard.render.com
3. Faça login na sua conta

---

### **PASSO 2: Localizar seu Banco de Dados**

1. No menu lateral, clique em **"PostgreSQL"**
2. Procure pelo banco: **"vetric-gran-marine-db"** (ou nome similar)
3. Clique no nome do banco

---

### **PASSO 3: Abrir o Shell do Banco**

1. No topo da página, procure a aba **"Shell"** ou **"PSQL Console"**
2. Clique nela
3. Aguarde o terminal carregar (pode demorar 5-10 segundos)
4. Você verá algo como:
   ```
   psql (15.x)
   Type "help" for help.
   
   your_database_name=>
   ```

---

### **PASSO 4: Copiar o Arquivo SQL**

1. Abra o arquivo: **`APLICAR_MIGRATIONS_PRODUCAO.sql`**
2. **Selecione TODO o conteúdo** (Ctrl+A ou Cmd+A)
3. **Copie** (Ctrl+C ou Cmd+C)

---

### **PASSO 5: Colar e Executar no Shell**

1. Volte para o Shell do Render
2. **Cole** o conteúdo copiado (Ctrl+V ou Cmd+V)
3. Pressione **ENTER**
4. Aguarde a execução (pode demorar 10-30 segundos)

---

### **PASSO 6: Verificar Resultados**

Você deve ver saídas como:

#### **1. ALTER TABLE (2x)**
```
ALTER TABLE
ALTER TABLE
```
✅ Significa que os campos foram adicionados com sucesso

#### **2. INSERT INTO (3 linhas)**
```
INSERT 0 1
INSERT 0 1
INSERT 0 1
```
✅ Significa que os 3 novos templates foram inseridos

#### **3. SELECT templates_notificacao**
Deve retornar algo como:
```
         tipo          | ativo | tempo_minutos | power_threshold_w | campo_tempo | campo_threshold 
-----------------------+-------+---------------+-------------------+-------------+-----------------
 inicio                | t     |             0 |              null | ✅          | ✅
 inicio_ociosidade     | f     |             0 |                10 | ✅          | ✅
 bateria_cheia         | f     |             3 |                10 | ✅          | ✅
 interrupcao           | f     |             0 |              null | ✅          | ✅
(4 rows)
```
✅ **DEVE TER 4 TEMPLATES PRINCIPAIS!**

#### **4. SELECT information_schema.columns**
Deve retornar 8 linhas:
```
           column_name            |   data_type   | is_nullable | column_default 
----------------------------------+---------------+-------------+----------------
 contador_minutos_ocioso          | integer       | YES         | 0
 notificacao_bateria_cheia_enviada| boolean       | YES         | false
 notificacao_inicio_enviada       | boolean       | YES         | false
 notificacao_interrupcao_enviada  | boolean       | YES         | false
 notificacao_ociosidade_enviada   | boolean       | YES         | false
 primeiro_ocioso_em               | timestamp     | YES         | NULL
 ultimo_check_ociosidade          | timestamp     | YES         | NULL
 ultimo_power_w                   | integer       | YES         | NULL
(8 rows)
```
✅ **DEVE TER 8 CAMPOS NOVOS!**

#### **5. SELECT moradores**
Deve retornar algo como:
```
 total_moradores | com_notificacoes_ativas | com_telefone 
-----------------+-------------------------+--------------
              60 |                      45 |           60
(1 row)
```
✅ **DEVE TER 60 MORADORES INTACTOS!**

---

## ✅ CHECKLIST DE VALIDAÇÃO

Marque conforme aparecer na tela:

- [ ] `ALTER TABLE` apareceu **2 vezes** sem erro
- [ ] `INSERT 0 1` apareceu **3 vezes**
- [ ] Query de templates retornou **4 linhas**
- [ ] Query de columns retornou **8 linhas**
- [ ] Query de moradores retornou **60** (ou número atual)
- [ ] **NENHUM ERRO** apareceu (linhas começando com `ERROR:`)

---

## ⚠️ SE ALGO DER ERRADO

### **Erro: "column already exists"**
```
ERROR: column "tempo_minutos" of relation "templates_notificacao" already exists
```
✅ **NÃO É PROBLEMA!** Significa que o campo já existe.  
→ Continue normalmente, a migration tem `IF NOT EXISTS`

### **Erro: "duplicate key value"**
```
ERROR: duplicate key value violates unique constraint "templates_notificacao_tipo_key"
```
✅ **NÃO É PROBLEMA!** Significa que o template já existe.  
→ Continue normalmente, a migration tem `ON CONFLICT DO NOTHING`

### **Erro: "permission denied"**
```
ERROR: permission denied for table templates_notificacao
```
❌ **PROBLEMA CRÍTICO!**  
→ Você não está usando a conta certa no Render  
→ **PARE AQUI** e me avise imediatamente

### **Erro: "relation does not exist"**
```
ERROR: relation "templates_notificacao" does not exist
```
❌ **PROBLEMA CRÍTICO!**  
→ Você está no banco errado  
→ **PARE AQUI** e me avise imediatamente

---

## 📸 TIRAR PRINTS (OPCIONAL MAS RECOMENDADO)

1. Print da query de templates (4 linhas)
2. Print da query de columns (8 linhas)
3. Print da query de moradores (60 linhas)

---

## 🎉 SUCESSO!

Se todos os checkboxes acima estiverem marcados:

✅ **MIGRATIONS APLICADAS COM SUCESSO!**

**Próximo passo:**
1. Sair do Shell (digitar `\q` ou fechar a aba)
2. Me avisar: **"Migrations aplicadas com sucesso!"**
3. Vou validar remotamente via API
4. Depois fazer o deploy do código

---

## 📞 PRECISA DE AJUDA?

**Se travou em algum passo:**
1. Tire um print da tela
2. Me envie
3. Não tente mais nada sozinho

**Tempo estimado:** 5-10 minutos

---

**VETRIC - Sistema de Notificações Inteligentes**  
**Versão:** 1.0  
**Autor:** Cursor AI Assistant

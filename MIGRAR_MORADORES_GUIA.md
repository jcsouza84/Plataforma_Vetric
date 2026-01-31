# 🚀 GUIA: MIGRAR MORADORES PARA PRODUÇÃO

**Data:** 16 de Janeiro de 2026  
**Script:** `migrar-moradores-producao.ts`

---

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Pegar a DATABASE_URL do Render**

1. Acesse: https://dashboard.render.com
2. Clique em **"vetric-db"** (PostgreSQL)
3. Aba **"Info"**
4. **Copie** a **"Internal Database URL"** completa

Exemplo:
```
postgresql://vetric_user:7yzTWHDOuam8SY5LSFMbDD1jgM5exfhuxudpg-d5ktuvggjchc73bpjp30-a@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db
```

---

### **PASSO 2: Abrir Terminal**

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
```

---

### **PASSO 3: Configurar variáveis**

```bash
# Cole a DATABASE_URL do Render aqui:
export DATABASE_URL="postgresql://vetric_user:senha@host.render.com/vetric_db"

# Configurar banco local (ajuste se necessário):
export LOCAL_DB_HOST="localhost"
export LOCAL_DB_PORT="5432"
export LOCAL_DB_NAME="vetric_db"
export LOCAL_DB_USER="postgres"
export LOCAL_DB_PASSWORD="postgres"
```

---

### **PASSO 4: TESTAR PRIMEIRO (Simulação)**

```bash
# Executa em modo DRY-RUN (apenas mostra o que faria, não altera nada)
DRY_RUN=true npx ts-node migrar-moradores-producao.ts
```

**O que vai mostrar:**
```
✅ Conectado ao banco LOCAL
✅ Conectado ao banco PRODUÇÃO
✅ Encontrados: 52 moradores
✅ Todos os dados são válidos!

SIMULAÇÃO - Criar: João Silva - Apt 101 - Tag: ABC123
SIMULAÇÃO - Criar: Maria Santos - Apt 102 - Tag: DEF456
...

📊 RELATÓRIO FINAL
✅ Criados: 52
🔄 Atualizados: 0
❌ Erros: 0

⚠️  MODO DRY-RUN: Nenhuma alteração foi aplicada!
```

**Se tudo OK, continue para o próximo passo!**

---

### **PASSO 5: EXECUTAR DE VERDADE**

```bash
# Executa a migração real
npx ts-node migrar-moradores-producao.ts
```

**O que vai acontecer:**
```
🔄 Iniciando cópia de moradores...

✅ [1/52] Criado: João Silva - Apt 101 - Tag: ABC123
✅ [2/52] Criado: Maria Santos - Apt 102 - Tag: DEF456
✅ [3/52] Criado: Pedro Costa - Apt 103 - Tag: GHI789
...
✅ [52/52] Criado: Ana Oliveira - Apt 501 - Tag: XYZ999

📊 RELATÓRIO FINAL
✅ Criados: 52
🔄 Atualizados: 0
❌ Erros: 0

🎉 MIGRAÇÃO COMPLETA COM SUCESSO!
```

---

### **PASSO 6: VERIFICAR NA PRODUÇÃO**

1. Acesse: https://plataforma-vetric.onrender.com
2. Login: `admin@vetric.com.br` / `Vetric@2026`
3. Menu → **"Usuários"** (se tiver link para moradores) ou verifique no dashboard
4. **Deve ver todos os 52 moradores!**

---

## ⚠️ SOLUÇÃO DE PROBLEMAS

### **Erro: "Cannot find module 'pg'"**
```bash
npm install pg @types/pg
```

### **Erro: "Connection refused" (banco local)**
```bash
# Verificar se PostgreSQL local está rodando:
psql -U postgres -d vetric_db -c "SELECT COUNT(*) FROM moradores;"

# Se não conectar, ajuste as variáveis:
export LOCAL_DB_HOST="localhost"
export LOCAL_DB_USER="seu_usuario"
export LOCAL_DB_PASSWORD="sua_senha"
```

### **Erro: "Connection refused" (Render)**
```bash
# Verificar se a DATABASE_URL está correta:
echo $DATABASE_URL

# Deve começar com: postgresql://vetric_user:...
```

### **Erro: "database does not exist"**
```bash
# Verificar nome do banco local:
psql -U postgres -l

# Ajustar variável:
export LOCAL_DB_NAME="nome_correto"
```

---

## 🔄 SE PRECISAR EXECUTAR NOVAMENTE

O script é **idempotente**, ou seja, pode executar várias vezes sem problemas:

- Se morador **não existe** na produção → **Cria**
- Se morador **já existe** (mesma tag_rfid) → **Atualiza**
- Nunca duplica moradores

```bash
# Pode executar quantas vezes quiser:
npx ts-node migrar-moradores-producao.ts
```

---

## 📊 ENTENDENDO O RELATÓRIO

### **Criados:**
```
Moradores que não existiam na produção e foram criados
```

### **Atualizados:**
```
Moradores que já existiam (mesma tag_rfid) e tiveram dados atualizados
```

### **Ignorados:**
```
Moradores duplicados no banco local (mesma tag_rfid aparece 2x)
Apenas a primeira ocorrência é processada
```

### **Erros:**
```
Moradores que deram erro ao copiar
(geralmente por dados inválidos ou problema de conexão)
```

---

## 🎯 CHECKLIST DE VERIFICAÇÃO

Antes de executar:
- [ ] PostgreSQL local está rodando?
- [ ] Consegue conectar ao banco local? (`psql -U postgres -d vetric_db`)
- [ ] Copiou a DATABASE_URL do Render?
- [ ] Executou o DRY-RUN primeiro?
- [ ] DRY-RUN mostrou os moradores corretos?

Após executar:
- [ ] Script terminou sem erros?
- [ ] Relatório mostra "X criados, 0 erros"?
- [ ] Consegue fazer login na produção?
- [ ] Moradores aparecem na interface?

---

## 💾 BACKUP (OPCIONAL MAS RECOMENDADO)

### **Fazer backup da produção antes:**

```bash
# Salvar estado atual da produção:
export DATABASE_URL="postgresql://..."
pg_dump $DATABASE_URL --table=moradores > backup_moradores_antes.sql
```

### **Se precisar reverter:**

```bash
# Limpar tabela:
psql $DATABASE_URL -c "DELETE FROM moradores;"

# Restaurar backup:
psql $DATABASE_URL < backup_moradores_antes.sql
```

---

## ✅ RESUMO RÁPIDO

```bash
# 1. Configurar
export DATABASE_URL="postgresql://..."

# 2. Testar
DRY_RUN=true npx ts-node migrar-moradores-producao.ts

# 3. Executar
npx ts-node migrar-moradores-producao.ts

# 4. Verificar
# Acessar: https://plataforma-vetric.onrender.com
```

---

## 🎉 SUCESSO!

Após executar com sucesso:
- ✅ Todos os moradores estarão na produção
- ✅ Com suas tags RFID corretas
- ✅ Prontos para identificação nos carregadores
- ✅ Sistema pode associar carregamentos aos moradores

---

## 📞 PRÓXIMOS PASSOS

Depois da migração:
1. ✅ Testar identificação de moradores no dashboard
2. ✅ Verificar se tags RFID estão funcionando
3. ✅ Configurar notificações WhatsApp (se necessário)
4. ✅ Começar a usar o sistema em produção!

---

**VETRIC - Migração de Moradores**  
**Tempo estimado:** 2-3 minutos  
**Dificuldade:** Fácil  
**Segurança:** Alta (pode reverter)





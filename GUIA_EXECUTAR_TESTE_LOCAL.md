# 🚀 EXECUTAR TESTE LOCAL - Passo a Passo

## 📋 INSTRUÇÕES SIMPLES

Siga estes passos exatamente:

---

## 1️⃣ OBTER DATABASE_URL

### Passo 1.1: Acesse o Render
- Abra: https://dashboard.render.com
- Faça login

### Passo 1.2: Encontre a DATABASE_URL
- Clique no serviço **Backend**
- Vá em **Environment**
- Localize a variável `DATABASE_URL`
- Clique no ícone de "👁️ Revelar" (se estiver oculta)
- **COPIE** o valor completo

Exemplo do formato:
```
postgresql://usuario:senha@dpg-xxxxx.oregon-postgres.render.com/database
```

---

## 2️⃣ EXECUTAR O TESTE

Abra o terminal e execute:

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"

# Cole a DATABASE_URL (substitua pelo valor real)
export DATABASE_URL="postgresql://usuario:senha@host/database"

# Execute o teste
npx ts-node buscar-producao-saskya.ts
```

### ⚠️ IMPORTANTE:
- **Substitua** `postgresql://usuario:senha@host/database` pela URL real que você copiou
- A URL **deve começar** com `postgresql://`
- A URL **deve ter** usuário, senha, host e nome do banco

---

## 3️⃣ ALTERNATIVA: Usar Script Interativo

```bash
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"

# Execute o script
./executar-teste-local.sh

# Quando pedir, cole a DATABASE_URL e pressione ENTER
```

---

## 4️⃣ O QUE VAI ACONTECER

O script vai:

1. ✅ Conectar ao banco de produção
2. ✅ Buscar a transação 439071
3. ✅ Verificar se tem data de FIM
4. ✅ Buscar notificações enviadas
5. ✅ Mostrar todos os carregamentos da Saskya
6. ✅ Gerar relatório completo

---

## 5️⃣ EXEMPLO DE EXECUÇÃO

```bash
# No terminal:
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"

export DATABASE_URL="postgresql://vetric_user:abc123@dpg-xyz.oregon-postgres.render.com/vetric_db"

npx ts-node buscar-producao-saskya.ts
```

**Resultado esperado:**
```
================================================
🔍 BUSCANDO TRANSAÇÃO 439071 NO BANCO DE PRODUÇÃO
================================================

🔌 Conectando ao banco...

1️⃣ Buscando transação 439071...

✅ ENCONTRADA!

═══════════════════════════════════════════════
Transaction PK: 439071
Carregador: Gran Marine 6 (JDBM1200040BB)
Morador: Saskya Lorena
Tag RFID: 56AB0CC103094E32983
Telefone: 5511999999999

INÍCIO: 2026-01-30 20:45:00
FIM: 2026-01-30 22:35:00  ✅ OU NULL ❌
Energia: 11.4 kWh
Status: Completed
═══════════════════════════════════════════════
```

---

## 📊 INTERPRETANDO OS RESULTADOS

### ✅ CENÁRIO 1: TEM DATA DE FIM
```
FIM: 2026-01-30 22:35:00 ✅
```
**Diagnóstico:** Backend RECEBEU a finalização  
**Problema:** Está na camada de notificação (não enviou WhatsApp)

---

### ❌ CENÁRIO 2: SEM DATA DE FIM
```
FIM: NULL ❌
```
**Diagnóstico:** Backend NÃO RECEBEU a finalização  
**Problema:** WebSocket/Polling não está capturando as mensagens

---

### ❌ CENÁRIO 3: NÃO ENCONTRADA
```
❌ Transação 439071 NÃO encontrada no banco!
```
**Diagnóstico:** Backend nem registrou a transação

---

## 🆘 PROBLEMAS COMUNS

### Erro: "database does not exist"
- ✅ Verifique se a DATABASE_URL está correta
- ✅ Confira se copiou a URL completa

### Erro: "connection refused"
- ✅ Verifique se a URL tem `postgresql://` no início
- ✅ Verifique se tem acesso à internet

### Erro: "authentication failed"
- ✅ A senha pode ter caracteres especiais que precisam ser encoded
- ✅ Pegue a URL exatamente como está no Render

### Erro: "pg module not found"
- Execute: `npm install pg`

---

## 🎯 COMANDOS PRONTOS

Copie e cole (substitua a URL pela real):

```bash
# Comando completo em uma linha
cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE" && export DATABASE_URL="COLE_A_URL_AQUI" && npx ts-node buscar-producao-saskya.ts
```

---

## 📞 DEPOIS DE EXECUTAR

**Me envie:**
1. ✅ A saída completa do terminal
2. ✅ Principalmente a parte que mostra se tem FIM ou NULL
3. ✅ Quantas notificações foram encontradas

Com isso eu vou te dizer **exatamente** onde corrigir o código! 🎯

---

**Desenvolvido para VETRIC** 🚀


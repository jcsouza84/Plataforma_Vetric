# 🔍 Como Ver Todas as Mensagens do Gran Marine 6

**Carregador:** Gran Marine 6  
**ID:** `JDBM1200040BB`  
**Conector:** 1

---

## 📋 3 Formas de Visualizar

### 🟢 Opção 1: Histórico Completo via API (RECOMENDADO)

Busca TODAS as informações direto da API CVE-Pro:
- ✅ Status atual do conector
- ✅ Informações gerais do carregador
- ✅ Transações dos últimos 7 dias (completas e ativas)

```bash
# Executar
npx ts-node ver-historico-gran-marine-6.ts

# Resultado será salvo em:
# gran_marine_6_historico_2026-01-30.json
```

**O que você verá:**
- Se está carregando agora (e quem é)
- Quando foi a última recarga
- Quanto tempo durou
- Quanto consumiu
- Se teve erros

---

### 🟡 Opção 2: Monitorar em Tempo Real

Acompanha TUDO que acontece com o Gran Marine 6 em tempo real:

```bash
# Terminal 1: Iniciar monitor
./monitor-gran-marine-6.sh

# Terminal 2: Rodar o Discovery Tool (para capturar mensagens)
cd /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE
npm start
```

**O que verá:**
- ✅ Cada mudança de status
- ✅ Início de recarga
- ✅ Finalização
- ✅ Ociosidade
- ✅ Erros

Arquivo salvo: `gran_marine_6_monitoring_YYYYMMDD_HHMMSS.log`

---

### 🔵 Opção 3: Ver Logs Históricos do Discovery Tool

Buscar nos logs já capturados anteriormente:

```bash
# Ver todas as mensagens já capturadas do Gran Marine 6
grep "JDBM1200040BB" logs/combined.log

# Contar quantas vezes apareceu
grep -c "JDBM1200040BB" logs/combined.log

# Ver apenas mensagens de status
grep "JDBM1200040BB" logs/combined.log | grep -i "status"

# Salvar em arquivo
grep "JDBM1200040BB" logs/combined.log > gran_marine_6_historico_logs.txt
```

---

## 🎯 Qual Usar?

### Para Diagnóstico do Problema Atual:
**Use Opção 1** (ver-historico-gran-marine-6.ts)
- Mostra status atual
- Mostra transações recentes
- Identifica se há transação ativa
- **Responde:** "O que está acontecendo AGORA?"

### Para Capturar Próxima Recarga Completa:
**Use Opção 2** (monitor em tempo real)
- Deixe rodando durante uma recarga
- Capture TODAS as mudanças de status
- **Responde:** "Quais mensagens chegam em cada fase?"

### Para Análise de Logs Antigos:
**Use Opção 3** (grep nos logs)
- Analisa o que já foi capturado
- **Responde:** "O que foi capturado antes?"

---

## 🔍 O Que Procurar

### ✅ Recarga Completa Normal:

```
[10:00:00] status: "Available"         ← Livre
[10:05:00] status: "Occupied"          ← Cabo conectado
[10:05:30] status: "Preparing"         ← Autorizando
[10:06:00] status: "Charging"          ← CARREGANDO ✅
[12:00:00] status: "SuspendedEV"       ← Pausado (bateria cheia)
[12:00:30] status: "Finishing"         ← Finalizando ✅
[12:01:00] status: "Available"         ← Livre novamente ✅
```

### ⚠️ O Que Você Deveria Ver Mas Não Está Vendo:

Se você **só recebe notificação no "Charging"**, está perdendo:

1. **"Finishing"** ← Quando carga finaliza
2. **"SuspendedEV"** ← Quando entra em ociosidade
3. **"Available"** ← Quando volta a ficar livre
4. **"Faulted"** ← Quando dá erro

---

## 💡 Teste Recomendado

Para descobrir o problema:

```bash
# Terminal 1: Monitor Gran Marine 6
./monitor-gran-marine-6.sh

# Terminal 2: Sua plataforma do síndico (WhatsApp)
# (deixe rodando)

# Terminal 3: Iniciar uma recarga de teste
# (vá fisicamente até o Gran Marine 6 e faça uma recarga)
```

**Compare:**
1. O que o monitor capturou (Terminal 1)
2. O que sua plataforma enviou pro WhatsApp (Terminal 2)

**Diagnóstico:**
- Se monitor viu "Finishing" MAS WhatsApp não enviou → Problema no código da plataforma
- Se monitor NÃO viu "Finishing" → Problema na subscrição WebSocket

---

## 📊 Formato das Mensagens

### Durante Carregamento:
```json
{
  "status": "Charging",
  "connectorId": 1,
  "transactionId": 12345,
  "idTag": "TAG_RFID_123",
  "meterValue": {
    "sampledValue": [
      { "measurand": "Power.Active.Import", "value": "7400", "unit": "W" }
    ]
  }
}
```

### Ao Finalizar:
```json
{
  "status": "Finishing",
  "connectorId": 1,
  "transactionId": 12345,
  "meterStop": 1234590,
  "energyConsumed": 23.5
}
```

### Em Ociosidade:
```json
{
  "status": "SuspendedEV",
  "connectorId": 1,
  "transactionId": 12345
}
```

---

## 🚀 Começar Agora

**Passo 1:** Ver status atual
```bash
npx ts-node ver-historico-gran-marine-6.ts
```

**Passo 2:** Se tiver recarga ativa, monitore em tempo real
```bash
./monitor-gran-marine-6.sh
```

**Passo 3:** Aguarde até que a recarga finalize completamente

**Passo 4:** Compare o que foi capturado vs o que foi enviado pro WhatsApp

---

## 📞 Diagnóstico Rápido

Execute isso AGORA para ver se há recarga ativa:

```bash
npx ts-node ver-historico-gran-marine-6.ts
```

Procure no resultado:
- **"status": "Charging"** → Recarga ativa AGORA
- **"transactionId": xxx** → Anote esse número
- **Aguarde** até que finalize
- **Compare** se recebeu notificação de finalização no WhatsApp

---

**Desenvolvido para VETRIC** 🚀


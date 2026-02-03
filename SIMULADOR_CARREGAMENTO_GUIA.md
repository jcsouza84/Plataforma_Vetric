# 🎮 SIMULADOR DE CARREGAMENTO CVE-PRO

**Sistema completo para simular carregamentos reais em ambiente LOCAL**

---

## ✅ O QUE FOI IMPLEMENTADO

### 🎯 **Simulação Sequencial nos 5 Carregadores**

Simula carregamentos **reais** usando a tag RFID da VETRIC nos carregadores:

1. **Gran Marine 2** (`1122905020`)
2. **Gran Marine 3** (`1122905030`)
3. **Gran Marine 4** (`1122905050`)
4. **Gran Marine 5** (`1122905060`)
5. **Gran Marine 6** (`1122905070`)

**Tag RFID da VETRIC:** `87BA5C4E`

---

## 🔒 SEGURANÇA

### ⚠️  **APENAS EM AMBIENTE LOCAL!**

O simulador é **BLOQUEADO** automaticamente em produção:

```typescript
// Verificação automática
if (process.env.NODE_ENV === 'production') {
  throw new Error('❌ SIMULADOR NÃO PERMITIDO EM PRODUÇÃO!');
}
```

**Motivos:**
- ❌ Dados falsos no banco de produção
- ❌ Notificações reais enviadas (incomoda moradores!)
- ❌ Logs poluídos
- ❌ Confusão entre dados reais e simulados

---

## 📊 CICLO DE SIMULAÇÃO

### **Para Cada Carregador (Sequencial):**

```
⏰ T+0s    → INÍCIO DE CARGA
             - Status: Available → Charging
             - idTag: 87BA5C4E
             - Power: 7200W
             - ✅ Notificação: INICIO_RECARGA enviada!

⏰ T+5min  → CARREGANDO NORMALMENTE
             - Power: 7200W → 7150W (gradual)
             - Status: Charging

⏰ T+6min  → INÍCIO DE OCIOSIDADE
             - Power: 7150W → 5W
             - ✅ Notificação: INICIO_OCIOSIDADE enviada!

⏰ T+9min  → BATERIA CHEIA
             - Power: 5W (mantido)
             - 3 minutos em ociosidade
             - ✅ Notificação: BATERIA_CHEIA enviada!

⏰ T+9min  → INTERRUPÇÃO
             - Status: Charging → Available
             - Power: 0W
             - ✅ Notificação: INTERRUPCAO enviada!
```

**Duração por carregador:** ~9 minutos  
**Intervalo entre carregadores:** 10 segundos  
**Duração total:** ~50 minutos (5 carregadores)

---

## 🚀 COMO USAR

### **1. Preparar Ambiente LOCAL**

#### **a) Configurar .env**

Arquivo: `apps/backend/.env`

```bash
# ⚠️  IMPORTANTE: Apenas para ambiente LOCAL!
ENABLE_SIMULATOR=true
NODE_ENV=development

# Banco de dados local (ou de desenvolvimento)
DATABASE_URL=postgresql://user:pass@localhost:5432/vetric_db

# Evolution API (pode usar de teste ou mock)
EVOLUTION_API_URL=https://sua-evolution-teste.com
EVOLUTION_API_KEY=sua-api-key-teste
EVOLUTION_INSTANCE=sua-instancia-teste
```

#### **b) Verificar Morador VETRIC no Banco**

O morador da VETRIC deve existir no banco LOCAL:

```sql
SELECT * FROM moradores WHERE tag_rfid = '87BA5C4E';
```

**Se não existir, criar:**

```sql
INSERT INTO moradores (nome, apartamento, telefone, tag_rfid, notificacoes_ativas)
VALUES ('Vetric', '001-A', '+5582996176797', '87BA5C4E', true);
```

---

### **2. Iniciar Backend LOCAL**

```bash
cd apps/backend
npm run dev
```

**Aguarde ver:**
```
🎮 Simulador habilitado!
✅ Servidor rodando na porta 3001
✅ PollingService iniciado
```

---

### **3. Iniciar Frontend LOCAL (Opcional)**

```bash
cd apps/frontend
npm run dev
```

Acessar: `http://localhost:3000/logs`

---

### **4. Executar Simulação**

#### **Opção A: Via Script (Recomendado)**

```bash
cd apps/backend
npm run simulate
```

**Você verá:**
```
🎮 ========================================
🎮 INICIADOR DE SIMULAÇÃO DE CARREGAMENTO
🎮 ========================================

🔍 Verificando status do simulador...
✅ Simulador disponível!

🚀 Iniciando simulação sequencial...
✅ Simulação iniciada com sucesso!

📋 Informações:
   Carregadores: 5
   Tag RFID: 87BA5C4E
   Duração: ~50 minutos

🎯 ACOMPANHE EM TEMPO REAL:
   Monitor Terminal: http://localhost:3000/logs
```

#### **Opção B: Via API**

```bash
# Iniciar simulação
curl -X POST http://localhost:3001/api/simulator/start

# Ver status
curl http://localhost:3001/api/simulator/status

# Parar simulação
curl -X POST http://localhost:3001/api/simulator/stop
```

---

## 📺 O QUE VOCÊ VERÁ

### **1. Console do Backend**

```
🎮 ========================================
🎮 INICIANDO SIMULAÇÃO SEQUENCIAL
🎮 ========================================
📋 Tag RFID: 87BA5C4E
🔌 Carregadores: 5 (Gran Marine 2, 3, 4, 5, 6)
⏱️  Duração total: ~50 minutos
🎮 ========================================

🔌 ========== Gran Marine 2 (1/5) ==========

⚡ INÍCIO DE CARGA
   Status: Available → Charging
   idTag: 87BA5C4E
   Power: 7200W
   ✅ Carregamento iniciado!

🔋 CARREGANDO NORMALMENTE (5 min)
   Power: 7200W → 7150W
   ⏱️  100s - Power: 7180W
   ⏱️  200s - Power: 7160W
   ⏱️  300s - Power: 7150W
   ✅ Fase de carregamento completa!

⚠️  INÍCIO DE OCIOSIDADE
   Power: 7150W → 5W
   ✅ Ociosidade detectada!

🔋 BATERIA CHEIA (3 min em ociosidade)
   Power: 5W (mantido)
   ✅ Bateria cheia confirmada!

⛔ INTERRUPÇÃO
   Status: Charging → Available
   ✅ Carregamento interrompido!

✅ Gran Marine 2 - Simulação completa!

⏳ Aguardando 10 segundos antes do próximo carregador...

🔌 ========== Gran Marine 3 (2/5) ==========
...
```

---

### **2. Monitor Terminal (http://localhost:3000/logs)**

```
⚡ AO VIVO

14:00:00 [CVE_API] SUCCESS STATUS_CHANGE
         Gran Marine 2: Available → Charging
         { idTag: "87BA5C4E", power: 7200 }

14:00:01 [IDENTIFICACAO] SUCCESS 👤 Vetric
         Tag: 87BA5C4E via heartbeat

14:00:02 [NOTIFICACAO] SUCCESS INICIO_RECARGA
         📱 Notificação enviada para Vetric

14:05:00 [CVE_API] DEBUG HEARTBEAT
         Gran Marine 2 está ativo - Status: Charging

14:06:00 [CVE_API] SUCCESS STATUS_CHANGE
         Gran Marine 2: Charging (7150W → 5W)

14:06:01 [NOTIFICACAO] SUCCESS INICIO_OCIOSIDADE
         📱 Notificação enviada para Vetric

14:09:00 [NOTIFICACAO] SUCCESS BATERIA_CHEIA
         📱 Notificação enviada para Vetric

14:09:01 [CVE_API] SUCCESS STATUS_CHANGE
         Gran Marine 2: Charging → Available

14:09:02 [NOTIFICACAO] SUCCESS INTERRUPCAO
         📱 Notificação enviada para Vetric

14:09:12 [CVE_API] SUCCESS STATUS_CHANGE
         Gran Marine 3: Available → Charging
...
```

---

### **3. WhatsApp (Evolution API)**

Se configurado, o telefone da VETRIC (`+5582996176797`) vai receber:

```
📱 Mensagem 1 (INÍCIO):
Olá Vetric! Seu carregamento foi iniciado no Gran Marine 2...

📱 Mensagem 2 (OCIOSIDADE):
Olá Vetric! Detectamos que seu veículo está ocioso...

📱 Mensagem 3 (BATERIA CHEIA):
Olá Vetric! Sua bateria está cheia...

📱 Mensagem 4 (INTERRUPÇÃO):
Olá Vetric! Seu carregamento foi interrompido...
```

**×4 mensagens por carregador = 20 mensagens no total!**

---

## 🛑 PARAR SIMULAÇÃO

### **Opção 1: Via Script**

```bash
curl -X POST http://localhost:3001/api/simulator/stop
```

### **Opção 2: Ctrl+C no terminal do backend**

O simulador para automaticamente quando o backend é encerrado.

---

## 🔍 API DO SIMULADOR

### **POST /api/simulator/start**

Iniciar simulação sequencial

**Resposta:**
```json
{
  "success": true,
  "message": "Simulação sequencial iniciada!",
  "info": {
    "carregadores": 5,
    "tag_rfid": "87BA5C4E",
    "duracao_estimada": "~50 minutos",
    "fases": [
      "1. Início de carga",
      "2. Carregando (5 min)",
      "3. Ociosidade (1 min)",
      "4. Bateria cheia (3 min)",
      "5. Interrupção"
    ]
  }
}
```

---

### **POST /api/simulator/stop**

Parar simulação

**Resposta:**
```json
{
  "success": true,
  "message": "Simulação parada com sucesso!"
}
```

---

### **GET /api/simulator/status**

Obter status da simulação

**Resposta:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "currentChargerIndex": 2,
    "currentPhase": "charging",
    "currentCharger": {
      "uuid": "1122905050",
      "name": "Gran Marine 4",
      "status": "Charging",
      "power": 7150,
      "idTag": "87BA5C4E",
      "transactionId": 1738619234567,
      "startTime": 1738619234567
    },
    "elapsedTime": 123456
  }
}
```

---

### **GET /api/simulator/chargers**

Obter carregadores simulados (formato CVE)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "1122905020",
      "description": "Gran Marine 2",
      "connectors": [
        {
          "connectorId": 1,
          "lastStatus": {
            "status": "Charging",
            "idTag": "87BA5C4E",
            "power": 7200
          }
        }
      ]
    }
  ]
}
```

---

### **GET /api/simulator/transactions**

Obter transações simuladas (formato CVE)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1738619234567,
      "chargeBoxUuid": "1122905020",
      "chargeBoxDescription": "Gran Marine 2",
      "ocppIdTag": "87BA5C4E",
      "startTimestamp": "03/02/2026 14:00:00",
      "stopTimestamp": null,
      "energy": 12000,
      "energyHumanReadable": "12.0000 kWh"
    }
  ]
}
```

---

## 🧪 TESTAR APENAS NOTIFICAÇÕES (SEM SIMULADOR)

Se você quiser testar **apenas o envio de notificações** sem simular carregamento:

```bash
curl -X POST http://localhost:3001/api/test-evolution/test \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "+5582996176797",
    "mensagem": "Teste de notificação!"
  }'
```

---

## 📋 CHECKLIST ANTES DE USAR

- [ ] Backend rodando LOCAL (`npm run dev`)
- [ ] `ENABLE_SIMULATOR=true` no `.env`
- [ ] `NODE_ENV=development` no `.env`
- [ ] Morador VETRIC cadastrado com tag `87BA5C4E`
- [ ] Evolution API configurada (ou mock)
- [ ] Frontend rodando (opcional, para ver logs)
- [ ] PollingService ativo e funcionando

---

## ⚠️  TROUBLESHOOTING

### **Erro: "Simulador desabilitado"**

**Solução:** Adicionar no `.env`:
```bash
ENABLE_SIMULATOR=true
```

---

### **Erro: "Simulador não permitido em produção"**

**Solução:** Verificar `NODE_ENV`:
```bash
NODE_ENV=development
```

---

### **Simulação não aparece no Monitor Terminal**

**Solução:**
1. Verificar se o frontend está rodando
2. Acessar `http://localhost:3000/logs`
3. Verificar se a migration 010 foi aplicada
4. Verificar logs no console do backend

---

### **Notificações não são enviadas**

**Causas possíveis:**
1. Evolution API não configurada
2. Telefone da VETRIC incorreto
3. Template de notificação inativo no banco

**Solução:**
```sql
-- Verificar templates
SELECT * FROM templates_notificacao WHERE ativo = true;

-- Verificar morador
SELECT * FROM moradores WHERE tag_rfid = '87BA5C4E';
```

---

## 📊 DADOS GERADOS

### **Banco de Dados:**

A simulação vai criar registros **REAIS** no banco LOCAL:

```sql
-- Carregamentos criados
SELECT * FROM carregamentos 
WHERE morador_id = (SELECT id FROM moradores WHERE tag_rfid = '87BA5C4E')
ORDER BY inicio DESC;

-- Logs de notificações
SELECT * FROM logs_notificacoes
WHERE morador_id = (SELECT id FROM moradores WHERE tag_rfid = '87BA5C4E')
ORDER BY enviado_em DESC;

-- Logs do sistema
SELECT * FROM logs_sistema
WHERE morador_nome = 'Vetric'
ORDER BY timestamp DESC;
```

---

## 🎯 RESUMO

| Item | Valor |
|------|-------|
| **Carregadores** | 5 (Gran Marine 2, 3, 4, 5, 6) |
| **Tag RFID** | 87BA5C4E (VETRIC) |
| **Duração por carregador** | ~9 minutos |
| **Duração total** | ~50 minutos |
| **Notificações enviadas** | 4 por carregador = 20 total |
| **Fases** | Início, Carregando, Ociosidade, Bateria Cheia, Interrupção |
| **Ambiente** | LOCAL apenas (bloqueado em produção) |

---

## ✅ PRÓXIMOS PASSOS

Depois de testar a simulação LOCAL:

1. ✅ Verificar se todas as notificações foram enviadas
2. ✅ Verificar logs no Monitor Terminal
3. ✅ Verificar dados no banco (carregamentos, logs)
4. ✅ Confirmar que o PollingService detectou tudo corretamente
5. ✅ Limpar dados de teste se necessário

---

**TUDO PRONTO PARA SIMULAR! 🎮🚀**

Execute: `npm run simulate`

E acompanhe em: `http://localhost:3000/logs`

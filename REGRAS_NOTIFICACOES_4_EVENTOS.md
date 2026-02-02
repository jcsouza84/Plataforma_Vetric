# 📋 REGRAS DAS 4 NOTIFICAÇÕES PRINCIPAIS
## Sistema VETRIC - Notificações Inteligentes

**Data:** 02/02/2026  
**Baseado em:** Análise do caso Saskya (transação 439071)

---

## 🎯 OS 4 EVENTOS PRINCIPAIS

```
1. 🔋 Início de Recarga
2. ⚠️ Início de Ociosidade  
3. 🔋 Bateria Cheia
4. ⚠️ Interrupção
```

---

## 📊 CASO REAL - LINHA DO TEMPO DA SASKYA

### **Transação 439071 - Gran Marine 6**

```
30/01/2026 23:45:44 → 🔋 INÍCIO
├─ Saskya conecta o carro
├─ Power: 6297W (carregando)
└─ Notificação enviada ✅

31/01/2026 01:34:45 → ⚡ CARREGANDO NORMAL
├─ Power: 6271W
├─ Duração: 1h49min
└─ Tudo normal

31/01/2026 01:35:07 → ⚠️ OCIOSIDADE DETECTADA
├─ Power: 0W (caiu abruptamente!)
├─ Bateria provavelmente cheia
└─ Deveria notificar IMEDIATAMENTE

31/01/2026 01:38:07 → 🔋 BATERIA CHEIA (confirmação)
├─ 3 minutos em 0W
├─ Confirma que bateria está cheia
└─ Deveria notificar novamente

31/01/2026 01:35:50 → 🛑 PARADA REMOTA
├─ RemoteStopTransaction enviado
└─ Finalização normal
```

---

## 1️⃣ 🔋 **INÍCIO DE RECARGA**

### **Quando Envia:**
Assim que o carregamento é detectado pelo sistema (StartTransaction do OCPP).

### **Regras de Ativação:**

```typescript
// PollingService detecta nova transação ativa
if (transacaoNova && moradorIdentificado && moradorComNotificacoesAtivas) {
  // Enviar notificação de início
  await notificationService.notificarInicio(
    moradorId,
    nomeCarregador,
    localizacao
  );
}
```

### **Condições:**
- ✅ Transação ativa detectada via API CVE
- ✅ Morador identificado pelo idTag (RFID)
- ✅ Morador tem `notificacoes_ativas = TRUE`
- ✅ Morador tem telefone cadastrado
- ✅ Template `inicio` está `ativo = TRUE`

### **Timing:**
- ⏱️ **IMEDIATO** (máximo 10s de atraso do polling)
- ⏱️ Configurável: `tempo_minutos = 0` (sem espera)

### **Exemplo Real - Saskya:**
```
30/01/2026 23:45:44 → StartTransaction recebido
30/01/2026 23:45:45 → Notificação enviada (1 segundo!)

Mensagem enviada:
"🔋 Olá Saskya Lorena Ramos Lacerda!

Seu carregamento foi iniciado no Gran Marine 6.

📍 Local: General Luiz de França Albuquerque, Maceió
🕐 Início: 30/01/2026, 23:45:44
🏢 Apartamento: 704-B

Acompanhe pelo dashboard VETRIC Gran Marine!"
```

### **Variáveis Disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{localizacao}}` - Endereço do carregador
- `{{data}}` - Data/hora do início
- `{{apartamento}}` - Apartamento do morador

---

## 2️⃣ ⚠️ **INÍCIO DE OCIOSIDADE**

### **Quando Envia:**
IMEDIATAMENTE quando a potência cai abaixo do threshold (bateria pode estar cheia).

### **Regras de Ativação:**

```typescript
// Monitoramento a cada ciclo de polling (10s)
if (
  powerAtual <= threshold &&           // Ex: 0W <= 10W
  carregamento.ultimo_power_w > threshold &&  // Antes estava > 10W (ex: 6271W)
  !carregamento.notificacao_ociosidade_enviada &&
  templateAtivo
) {
  // ENVIA IMEDIATAMENTE!
  await notificationService.enviarNotificacao('inicio_ociosidade', ...);
}
```

### **Condições:**
- ✅ Potência **ATUAL** ≤ `power_threshold_w` (padrão: **10W**)
- ✅ Potência **ANTERIOR** > threshold (estava carregando)
- ✅ Notificação ainda não foi enviada
- ✅ Template `inicio_ociosidade` está `ativo = TRUE`
- ✅ Morador tem notificações ativas

### **Timing:**
- ⏱️ **IMEDIATO** ao detectar queda de potência
- ⏱️ Configurável: `tempo_minutos = 0`
- ⏱️ Threshold: `power_threshold_w = 10` (Watts)

### **Exemplo Real - Saskya:**
```
31/01/2026 01:34:45 → Power: 6271W (carregando)
31/01/2026 01:35:07 → Power: 0W (QUEDA ABRUPTA!)

Sistema detecta:
- ultimo_power_w = 6271W (> 10W) ✅
- power_atual = 0W (≤ 10W) ✅
- Condições atendidas!

DEVERIA ENVIAR:
"⚠️ Olá Saskya Lorena Ramos Lacerda!

Seu carregamento no Gran Marine 6 entrou em OCIOSIDADE.

⚡ Consumo até agora: 16.5 kWh
🕐 31/01/2026, 01:35:07

Sua bateria pode estar cheia. Por favor, remova o cabo 
para liberar o carregador.

Obrigado pela compreensão! 🙏"
```

### **Variáveis Disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia consumida até agora (kWh)
- `{{data}}` - Data/hora da detecção

### **Por que IMEDIATO?**
- 💡 Avisa logo que a bateria pode estar cheia
- 💡 Morador pode liberar o carregador rapidamente
- 💡 Evita ocupação desnecessária

---

## 3️⃣ 🔋 **BATERIA CHEIA**

### **Quando Envia:**
Após X minutos com potência baixa (confirmação de bateria carregada).

### **Regras de Ativação:**

```typescript
// Monitoramento contínuo enquanto está ocioso
if (
  powerAtual <= threshold &&           // Ex: 0W <= 10W
  carregamento.primeiro_ocioso_em &&   // Já registrou quando ficou ocioso
  minutosOcioso >= tempoEspera &&      // Ex: 3 minutos já passaram
  !carregamento.notificacao_bateria_cheia_enviada &&
  templateAtivo
) {
  // ENVIA CONFIRMAÇÃO!
  await notificationService.enviarNotificacao('bateria_cheia', ...);
}
```

### **Condições:**
- ✅ Potência ≤ `power_threshold_w` (padrão: **10W**)
- ✅ Timestamp `primeiro_ocioso_em` já registrado
- ✅ Tempo em ociosidade ≥ `tempo_minutos` (padrão: **3 min**)
- ✅ Notificação ainda não foi enviada
- ✅ Template `bateria_cheia` está `ativo = TRUE`

### **Timing:**
- ⏱️ **APÓS X MINUTOS** em baixa potência
- ⏱️ Configurável: `tempo_minutos = 3` (padrão)
- ⏱️ Threshold: `power_threshold_w = 10` (Watts)

### **Exemplo Real - Saskya:**
```
31/01/2026 01:35:07 → Power: 0W (primeiro_ocioso_em registrado)
31/01/2026 01:36:07 → Power: 0W (1 minuto) ⏳
31/01/2026 01:37:07 → Power: 0W (2 minutos) ⏳
31/01/2026 01:38:07 → Power: 0W (3 minutos) ✅ ENVIA!

Sistema detecta:
- Tempo ocioso = 3 minutos
- tempo_minutos configurado = 3
- Condições atendidas!

DEVERIA ENVIAR:
"🔋 Olá Saskya Lorena Ramos Lacerda!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: 16.5 kWh
⏱️ Duração: 1h49min
📍 Gran Marine 6

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏"
```

### **Variáveis Disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia total consumida (kWh)
- `{{duracao}}` - Tempo total de carregamento

### **Por que AGUARDAR 3 minutos?**
- 💡 Evita falsos positivos (pausa temporária)
- 💡 Confirma que bateria realmente está cheia
- 💡 Dá certeza ao morador

---

## 4️⃣ ⚠️ **INTERRUPÇÃO**

### **Quando Envia:**
Quando o carregamento para inesperadamente (não foi finalização normal).

### **Regras de Ativação:**

```typescript
// Detectado ao receber StopTransaction inesperado
// OU quando carregador volta para Available sem ser fim normal
if (
  carregamentoAtivo &&
  statusMudouParaAvailable &&
  !foiFinalizacaoNormal &&
  powerAnterior > thresholdMinimo &&  // Estava carregando com potência
  templateAtivo
) {
  // ENVIA ALERTA!
  await notificationService.enviarNotificacao('interrupcao', ...);
}
```

### **Condições:**
- ✅ Carregamento estava ativo
- ✅ Status mudou para "Available" ou StopTransaction recebido
- ✅ Não foi finalização esperada (power não caiu gradualmente)
- ✅ Potência anterior era alta (estava realmente carregando)
- ✅ Template `interrupcao` está `ativo = TRUE`

### **Timing:**
- ⏱️ **IMEDIATO** ao detectar interrupção
- ⏱️ Configurável: `tempo_minutos = 0`
- ⏱️ Não usa threshold (detecta pela mudança de status)

### **Exemplo Hipotético:**
```
31/01/2026 14:30:00 → Power: 6500W (carregando normal)
31/01/2026 14:30:15 → StopTransaction recebido (inesperado!)
                    → OU Carregador mudou para Available
                    → Cabo foi desconectado

Sistema detecta:
- Estava carregando (power > 1000W)
- Parou abruptamente
- Não passou por fase de ociosidade

ENVIA:
"⚠️ Olá Saskya Lorena Ramos Lacerda!

Seu carregamento no Gran Marine 6 foi INTERROMPIDO.

⚡ Consumo parcial: 8.5 kWh
⏱️ Duração: 45 minutos
📍 Gran Marine 6

Se não foi você, verifique seu veículo ou entre em 
contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999"
```

### **Variáveis Disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia consumida até a interrupção (kWh)
- `{{duracao}}` - Tempo até a interrupção

### **Cenários de Interrupção:**
1. 🔌 Cabo desconectado fisicamente
2. ⚡ Queda de energia
3. 🚗 Veículo parou de carregar por erro
4. 🛑 Comando remoto de parada
5. 🔒 Proteção do carregador ativada

---

## 📊 FLUXO COMPLETO (Caso Típico)

### **Cenário: Morador carrega até bateria cheia**

```
TEMPO          POWER    EVENTO                    NOTIFICAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
00:00          0W       Conecta cabo              
00:00:10       6500W    StartTransaction          🔋 Início de Recarga ✅
               ↓
00:15          6400W    Carregando...             
00:30          6300W    Carregando...             
00:45          6200W    Carregando...             
01:00          5800W    Carregando...             
               ↓
01:35:00       5500W    Ainda carregando          
01:35:07       0W       🚨 POWER ZEROU!           ⚠️ Início de Ociosidade ✅
01:36:07       0W       1 minuto ocioso           
01:37:07       0W       2 minutos ocioso          
01:38:07       0W       3 minutos ocioso          🔋 Bateria Cheia ✅
               ↓
01:40:00       0W       Ainda conectado           
01:42:00       0W       Ainda conectado           
02:00:00       -        Morador desconecta        (Fim normal, sem notificação)
```

---

## ⚙️ CONFIGURAÇÕES (Padrão)

| Evento | Tempo | Threshold | Status Inicial |
|--------|-------|-----------|----------------|
| 🔋 Início de Recarga | 0 min (imediato) | - | ✅ LIGADO |
| ⚠️ Início de Ociosidade | 0 min (imediato) | 10W | 🔴 DESLIGADO |
| 🔋 Bateria Cheia | 3 min | 10W | 🔴 DESLIGADO |
| ⚠️ Interrupção | 0 min (imediato) | - | 🔴 DESLIGADO |

### **Admin pode ajustar:**
- ✏️ **Tempo:** 0 a 1440 minutos (24h)
- ✏️ **Threshold:** 0 a 50.000 Watts
- 🔘 **Toggle:** ON/OFF para cada tipo

---

## 🎯 RESUMO DAS REGRAS

### **Quando CADA notificação é enviada:**

1. **🔋 Início de Recarga**
   - Conectou o cabo e começou a carregar
   - Envia em ~1 segundo

2. **⚠️ Início de Ociosidade**  
   - Power caiu de ~6000W para < 10W
   - Bateria PODE estar cheia
   - Envia IMEDIATAMENTE

3. **🔋 Bateria Cheia**
   - Já está 3+ minutos em < 10W
   - CONFIRMA que bateria está cheia
   - Envia após aguardar tempo configurado

4. **⚠️ Interrupção**
   - Estava carregando e parou sem avisar
   - Pode ser problema/erro
   - Envia IMEDIATAMENTE

---

## 💡 LÓGICA INTELIGENTE

### **Por que 3 notificações para "fim"?**

**Início de Ociosidade (ALERTA RÁPIDO):**
- "Ei, sua bateria pode estar cheia!"
- Morador pode ir buscar o carro logo

**Bateria Cheia (CONFIRMAÇÃO):**
- "Sim, confirmado, bateria está cheia!"
- Insiste para liberar o carregador

**Interrupção (PROBLEMA):**
- "Algo errado aconteceu!"
- Morador deve verificar o veículo

---

## ✅ CHECKLIST DE ATIVAÇÃO

Para cada notificação ser enviada, TODAS essas condições devem ser TRUE:

- [ ] Morador identificado pelo idTag
- [ ] Morador tem `notificacoes_ativas = TRUE`
- [ ] Morador tem telefone cadastrado
- [ ] Template específico está `ativo = TRUE` no banco
- [ ] Condições técnicas do evento atendidas
- [ ] Notificação ainda não foi enviada (evita duplicação)
- [ ] Evolution API configurada

---

**VETRIC - Sistema de Notificações Inteligentes**  
**Versão:** 1.0  
**Data:** 02/02/2026  
**Branch:** feature/eventos-notificacoes-limpa

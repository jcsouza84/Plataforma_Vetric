# 📱 EXPLICAÇÃO DOS 4 EVENTOS DE NOTIFICAÇÃO

## ✅ IMPLEMENTADO NO BANCO LOCAL

Os templates foram ajustados com sucesso! Agora temos apenas **4 eventos principais** baseados na análise real da transação da Saskya.

---

## 🔋 **EVENTO 1: INÍCIO DE RECARGA**

### **Quando é enviado:**
- **Após 3 minutos** do `StartTransaction` (início do carregamento)

### **Por que aguardar 3 minutos:**
- Evita notificações falsas se o morador conectar e desconectar rapidamente
- Garante que o carregamento realmente começou
- Baseado no caso da Saskya que funcionou perfeitamente

### **Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador (ex: Gran Marine 6)
- `{{localizacao}}` - Endereço do carregador
- `{{data}}` - Data e hora do início
- `{{apartamento}}` - Apartamento do morador

### **Configurações:**
- ⏱️ **Tempo:** 3 minutos (configurável)
- ⚡ **Threshold:** Não usa
- 🔘 **Status:** ATIVO ✅ (já funciona em produção)

### **Exemplo real (Saskya):**
```
🔋 Olá Saskya Lorena Ramos Lacerda!

Seu carregamento foi iniciado no Gran Marine 6.

📍 Local: General Luiz de França Albuquerque, Maceió
🕐 Início: 30/01/2026, 23:45:44
🏢 Apartamento: 704-B

Acompanhe pelo dashboard VETRIC Gran Marine!
```

**✅ Enviado em:** 30/01/2026 às 23:45:45 (1 segundo após início)

---

## ⚠️ **EVENTO 2: INÍCIO DE OCIOSIDADE**

### **Quando é enviado:**
- **IMEDIATAMENTE** quando o sistema detecta que a potência caiu abaixo de 10W
- Primeiro `MeterValues` que mostra Power < 10W

### **Por que é importante:**
- Avisa o morador que a bateria pode estar cheia
- Permite que ele libere o carregador para outros
- Evita ocupação desnecessária

### **Como funciona:**
1. Sistema monitora `MeterValues` a cada ~1 minuto
2. Quando `Power.Active.Import` cai de >10W para <10W
3. Envia notificação IMEDIATAMENTE (tempo = 0)

### **Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia consumida até agora (kWh)
- `{{data}}` - Data e hora da detecção

### **Configurações:**
- ⏱️ **Tempo:** 0 minutos (IMEDIATO)
- ⚡ **Threshold:** 10W (configurável)
- 🔘 **Status:** DESLIGADO ❌ (precisa ativar)

### **Exemplo baseado na Saskya:**
```
⚠️ Olá Saskya Lorena Ramos Lacerda!

Seu carregamento no Gran Marine 6 entrou em OCIOSIDADE.

⚡ Consumo até agora: 9.74 kWh
🕐 31/01/2026, 01:35:07

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏
```

**📊 Caso real:** Saskya ficou em ociosidade às 01:35:07 mas NÃO recebeu notificação (evento não implementado ainda)

---

## 🔋 **EVENTO 3: BATERIA CHEIA**

### **Quando é enviado:**
- **Após 3 minutos** de potência abaixo de 10W (em ociosidade)
- Confirma que a bateria realmente está cheia

### **Por que aguardar 3 minutos:**
- Evita notificações se for apenas uma pausa temporária
- Confirma que o veículo realmente parou de carregar
- Dá tempo para o sistema estabilizar

### **Como funciona:**
1. Detecta início de ociosidade (Power < 10W)
2. Marca timestamp `primeiro_ocioso_em`
3. Aguarda 3 minutos
4. Se ainda estiver em ociosidade, envia notificação

### **Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia total consumida (kWh)
- `{{duracao}}` - Duração total do carregamento

### **Configurações:**
- ⏱️ **Tempo:** 3 minutos (configurável)
- ⚡ **Threshold:** 10W (mesmo do início de ociosidade)
- 🔘 **Status:** DESLIGADO ❌ (precisa ativar)

### **Exemplo baseado na Saskya:**
```
🔋 Olá Saskya Lorena Ramos Lacerda!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: 9.74 kWh
⏱️ Duração: 1h 49min
📍 Gran Marine 6

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏
```

**📊 Caso real:** Saskya ficou 3+ minutos em ociosidade mas NÃO recebeu (evento não implementado)

---

## ⚠️ **EVENTO 4: INTERRUPÇÃO**

### **Quando é enviado:**
- **IMEDIATAMENTE** quando detecta `StopTransaction` inesperado
- OU quando detecta queda brusca de potência (de >5000W para <500W)

### **Por que é importante:**
- Avisa sobre possível problema no carregamento
- Permite que o morador verifique o veículo
- Útil para detectar desconexões acidentais

### **Como funciona:**
1. Sistema monitora se carregamento estava ativo (Power > 5000W)
2. Detecta `StopTransaction` SEM ter passado por ociosidade
3. OU detecta queda brusca de potência
4. Envia notificação IMEDIATAMENTE

### **Variáveis disponíveis:**
- `{{nome}}` - Nome do morador
- `{{charger}}` - Nome do carregador
- `{{energia}}` - Energia consumida até a interrupção (kWh)
- `{{duracao}}` - Duração até a interrupção

### **Configurações:**
- ⏱️ **Tempo:** 0 minutos (IMEDIATO)
- ⚡ **Threshold:** Não usa (detecta por evento)
- 🔘 **Status:** DESLIGADO ❌ (precisa ativar)

### **Exemplo baseado na Saskya:**
```
⚠️ Olá Saskya Lorena Ramos Lacerda!

Seu carregamento no Gran Marine 6 foi INTERROMPIDO.

⚡ Consumo parcial: 9.74 kWh
⏱️ Duração: 1h 49min
📍 Gran Marine 6

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999
```

**📊 Caso real:** Saskya teve StopTransaction às 01:35:50 mas NÃO recebeu (evento não implementado)

---

## 📊 RESUMO COMPARATIVO

| Evento | Quando Envia | Tempo | Threshold | Status Atual |
|--------|--------------|-------|-----------|--------------|
| **Início de Recarga** | Após detectar StartTransaction | 3 min | - | ✅ ATIVO |
| **Início de Ociosidade** | Quando Power cai < 10W | 0 min (imediato) | 10W | ❌ DESLIGADO |
| **Bateria Cheia** | Após 3 min em ociosidade | 3 min | 10W | ❌ DESLIGADO |
| **Interrupção** | Quando detecta StopTransaction inesperado | 0 min (imediato) | - | ❌ DESLIGADO |

---

## 🎯 PRÓXIMOS PASSOS

### **1. Ajustar Frontend (Em andamento)**
- Mostrar apenas os 4 cards
- Adicionar campos de configuração:
  - Input para `tempo_minutos`
  - Input para `power_threshold_w` (quando aplicável)
  - Toggle ON/OFF
- Melhorar UI com explicações

### **2. Implementar Lógica de Detecção (Pendente)**
- Adicionar monitoramento de `MeterValues` no `PollingService`
- Implementar detecção de ociosidade
- Implementar detecção de bateria cheia
- Implementar detecção de interrupção

### **3. Testar com Dados Reais (Pendente)**
- Ativar eventos um por um
- Monitorar logs
- Validar com moradores reais
- Ajustar thresholds se necessário

---

## ✅ O QUE JÁ ESTÁ PRONTO

1. ✅ **Banco de dados ajustado**
   - Tabela `templates_notificacao` com novos campos
   - 4 templates criados e configurados
   - Campos `tempo_minutos` e `power_threshold_w` adicionados

2. ✅ **Evento 1 funcionando**
   - Início de Recarga já envia notificações
   - Testado e validado com Saskya
   - Em produção e estável

3. ✅ **Sistema base robusto**
   - Polling a cada 10 segundos
   - Identificação automática de moradores
   - Integration com Evolution API
   - Logs completos

---

**Sistema pronto para receber a implementação dos 3 novos eventos! 🚀**

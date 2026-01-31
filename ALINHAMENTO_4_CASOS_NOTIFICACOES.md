# 🎯 ALINHAMENTO - 4 Casos de Notificações

## Data: 31/01/2026
## Status: Aguardando Confirmação

---

## 📋 OS 4 CASOS DE NOTIFICAÇÃO

### CASO 1️⃣: INÍCIO DE RECARGA
**Quando:** Após X minutos de carregamento confirmado  
**Objetivo:** Confirmar ao morador que o carregamento realmente iniciou  
**Exemplo:** "🔋 Carregamento iniciado há 3 minutos"

---

### CASO 2️⃣: INÍCIO DE OCIOSIDADE ⚠️
**Quando:** Detecta 0W por X minutos consecutivos (DURANTE o carregamento)  
**Objetivo:** Alertar que o carregamento parou de consumir energia  
**Exemplo:** "⚠️ Carregamento está ocioso há 3 minutos"  
**IMPORTANTE:** Esta mensagem é enviada ANTES do StopTransaction

---

### CASO 3️⃣: BATERIA CHEIA / FIM DE RECARGA 🔋
**Quando:** StopTransaction APÓS ter ficado ocioso  
**Objetivo:** Confirmar que a bateria foi carregada completamente  
**Exemplo:** "🔋 Carga completa! Bateria carregada"  
**IMPORTANTE:** Esta mensagem é enviada NO StopTransaction, mas só se teve ociosidade antes

---

### CASO 4️⃣: INTERRUPÇÃO DE CARREGAMENTO ⚠️
**Quando:** Detecta queda abrupta de potência (>5000W → <500W) OU StopTransaction sem ter ficado ocioso  
**Objetivo:** Informar que o carregamento foi interrompido inesperadamente  
**Exemplo:** "⚠️ Carregamento interrompido antes do esperado"  
**IMPORTANTE:** Pode indicar falha, desconexão manual, ou fim normal sem ociosidade

---

## 🤔 DÚVIDA: Desconexão Normal vs Interrupção

Você quer separar estes 2 cenários em mensagens diferentes?

### Cenário A: DESCONEXÃO NORMAL (Sem ociosidade)
```
Exemplo: Transação 439082 (Saulo)
  02:32:05 → 6575W [CARREGANDO]
  02:33:05 → 6611W [CARREGANDO]
  02:34:05 → 6627W [CARREGANDO] ← Alto até o fim
  02:35:02 → StopTransaction

Características:
  ✅ Carregou com alta potência até o fim
  ❌ NÃO ficou ocioso
  ❌ NÃO teve queda abrupta
  
Possível interpretação:
  → Morador removeu o cabo enquanto ainda carregava
  → OU bateria chegou ao limite configurado no carro
```

**Mensagem sugerida:**  
"✅ Carregamento finalizado! Consumo: 5.2 kWh"

### Cenário B: INTERRUPÇÃO (Com queda abrupta)
```
Exemplo: Transação 439071 (Saskya)
  01:34:51 → 6317W [CARREGANDO PLENO]
  01:35:06 → 181W [QUEDA ABRUPTA!]
  01:36:00 → StopTransaction (Remote)

Características:
  ❌ Queda de 6317W para 181W em 15 segundos
  ⚠️ Reason: Remote (parada remota)
  
Possível interpretação:
  → Morador interrompeu via app/RFID
  → OU falha no carregador
```

**Mensagem sugerida:**  
"⚠️ Carregamento interrompido. Consumo parcial: 1.8 kWh"

---

## 🎯 PROPOSTA: 4 ou 5 Casos?

### OPÇÃO A: 4 CASOS (Agrupados)
```
1. Início de Recarga
2. Início de Ociosidade
3. Bateria Cheia (após ociosidade)
4. Interrupção/Fim (qualquer outro término)
```

### OPÇÃO B: 5 CASOS (Separados)
```
1. Início de Recarga
2. Início de Ociosidade
3. Bateria Cheia (após ociosidade)
4. Desconexão Normal (sem ociosidade, sem queda abrupta)
5. Interrupção (com queda abrupta ou Remote)
```

**❓ Qual opção você prefere?**

---

## ⚙️ THRESHOLDS - TODOS EDITÁVEIS

Confirmo que TODOS os valores serão configuráveis no sistema:

```
┌────────────────────────────────────────────────┐
│ ⚙️ CONFIGURAÇÕES DE NOTIFICAÇÕES              │
├────────────────────────────────────────────────┤
│                                                │
│ 📍 INÍCIO DE RECARGA:                         │
│    Aguardar [3] minutos antes de notificar    │
│                                                │
│ 📍 OCIOSIDADE:                                │
│    Detectar após [3] minutos em 0W            │
│    Potência máxima considerada ociosa: [100]W │
│                                                │
│ 📍 INTERRUPÇÃO:                               │
│    Potência mínima carregamento: [5000]W      │
│    Potência após queda: [500]W                │
│    (Queda maior que 4500W = interrupção)      │
│                                                │
│ [Salvar Configurações]                         │
└────────────────────────────────────────────────┘
```

**✅ Confirmado:** Todos editáveis via interface admin.

---

## 💬 ESTRUTURA DE MENSAGENS - CAMPO ATRASO

Você mencionou:
> "só deve conter um campo de minutos para aplicação do tempo em minutos após a identificação por parte do sistema"

### Interpretação:

Você quer um **ATRASO ADICIONAL** entre a detecção e o envio da notificação?

#### Exemplo Prático:

```
CENÁRIO: INÍCIO DE OCIOSIDADE

Configuração:
  • Tempo para detectar ociosidade: 3 minutos
  • Atraso antes de notificar: 5 minutos (NOVO CAMPO)

Timeline:
  17:21 → Power = 0W (início da contagem)
  17:22 → Power = 0W (1 minuto)
  17:23 → Power = 0W (2 minutos)
  17:24 → Power = 0W (3 minutos) ← DETECTADO! ✅
  
  [MAS NÃO ENVIA AINDA!]
  
  17:25 → Power = 0W (4 minutos total, 1 min após detecção)
  17:26 → Power = 0W (5 minutos total, 2 min após detecção)
  17:27 → Power = 0W (6 minutos total, 3 min após detecção)
  17:28 → Power = 0W (7 minutos total, 4 min após detecção)
  17:29 → Power = 0W (8 minutos total, 5 min após detecção)
  
  17:29 → 🚀 ENVIA NOTIFICAÇÃO! ✅
  
Total: 3 min para detectar + 5 min de atraso = 8 minutos
```

### Interface Proposta:

```
┌─────────────────────────────────────────────────┐
│ 💬 MENSAGEM: INÍCIO DE OCIOSIDADE              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Título:                                         │
│ [⚠️ Carregamento ocioso                    ]   │
│                                                 │
│ Corpo:                                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ Seu carregamento está sem consumo há      │ │
│ │ {{tempo_ocioso}} minutos.                 │ │
│ │                                           │ │
│ │ Sua bateria pode estar cheia.             │ │
│ │ Remova o cabo para liberar o carregador.  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ⏱️ Atraso antes de enviar:                     │
│    [5] minutos após detecção                   │
│    ℹ️ Tempo adicional para confirmar ociosidade│
│                                                 │
│ [✓] Ativo    [Salvar]                          │
└─────────────────────────────────────────────────┘
```

### Lógica no Código:

```typescript
// Detecção
if (contadorOciosidade >= CONFIG.tempo_ociosidade_min) {
  // Detectou ociosidade
  if (!transacao.ociosidadeDetectadaEm) {
    transacao.ociosidadeDetectadaEm = new Date();
    await db.query(
      'UPDATE carregamentos SET ociosidade_detectada_em = NOW() WHERE id = $1',
      [transacao.id]
    );
  }
  
  // Verifica se já passou o tempo de atraso
  const minutosAposDeteccao = 
    (Date.now() - transacao.ociosidadeDetectadaEm.getTime()) / 60000;
  
  const atrasoConfig = await getConfigMensagem(
    'inicio_ociosidade',
    'atraso_minutos'
  );
  
  if (minutosAposDeteccao >= atrasoConfig && !transacao.notificacaoOciosidadeEnviada) {
    // Agora sim, envia!
    await enviarNotificacao(transacao.id, 'inicio_ociosidade');
    transacao.notificacaoOciosidadeEnviada = true;
  }
}
```

### Aplicação em Cada Caso:

| Caso | Atraso Configurável? | Razão |
|------|---------------------|-------|
| **1. Início de Recarga** | ✅ SIM | Já existe: aguarda X min antes de confirmar |
| **2. Início de Ociosidade** | ✅ SIM | Aguarda X min APÓS detectar para confirmar |
| **3. Bateria Cheia** | ❌ NÃO | Envia imediatamente no StopTransaction |
| **4. Interrupção** | ❌ NÃO | Envia imediatamente no StopTransaction |

**❓ Está correto este entendimento?**

---

## 🗄️ MUDANÇAS NO BANCO DE DADOS

### Tabela `mensagens_notificacoes`:

```sql
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  
  -- NOVO CAMPO: Atraso em minutos
  atraso_minutos INTEGER DEFAULT 0,
  
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Inserção Inicial:

```sql
INSERT INTO mensagens_notificacoes (tipo, titulo, corpo, atraso_minutos) VALUES
  (
    'inicio_recarga',
    '🔋 Carregamento iniciado!',
    'Seu carregamento foi iniciado no {{carregador}}...',
    3  -- Aguarda 3 minutos APÓS detecção
  ),
  (
    'inicio_ociosidade',
    '⚠️ Carregamento ocioso',
    'Seu carregamento está sem consumo há {{tempo_ocioso}} minutos...',
    5  -- Aguarda 5 minutos APÓS detecção de 3 min de 0W
  ),
  (
    'bateria_cheia',
    '🔋 Carga completa!',
    'Seu veículo está com a bateria carregada...',
    0  -- Envia imediatamente
  ),
  (
    'interrupcao',
    '⚠️ Carregamento interrompido',
    'Seu carregamento foi finalizado antes do esperado...',
    0  -- Envia imediatamente
  );
```

---

## 🎯 RESUMO DOS 4 CASOS

### FLUXO COMPLETO:

```
TRANSAÇÃO INICIA
    ↓
    ↓ MeterValues > 1000W por X minutos
    ↓
[1] NOTIFICA INÍCIO ✅
    ↓
    ↓ Continua carregando...
    ↓
    ↓ MeterValues < 100W por 3+ minutos
    ↓
[2] NOTIFICA OCIOSIDADE ⚠️
    ↓
    ↓ Continua ocioso...
    ↓
    ↓ StopTransaction
    ↓
[3] NOTIFICA BATERIA CHEIA 🔋
```

**OU**

```
TRANSAÇÃO INICIA
    ↓
    ↓ MeterValues > 1000W por X minutos
    ↓
[1] NOTIFICA INÍCIO ✅
    ↓
    ↓ Continua carregando...
    ↓
    ↓ Queda abrupta 6317W → 181W
    ↓
    ↓ StopTransaction
    ↓
[4] NOTIFICA INTERRUPÇÃO ⚠️
```

---

## ❓ PERGUNTAS PARA CONFIRMAÇÃO

### 1. Quantidade de Casos:
- [ ] 4 casos (agrupando desconexão normal + interrupção)
- [ ] 5 casos (separando desconexão normal e interrupção)

### 2. Campo de Atraso:
- [ ] Todas as mensagens têm campo "atraso_minutos"?
- [ ] Ou só "Início de Recarga" e "Início de Ociosidade"?

### 3. Nomenclatura:
Os nomes dos 4 casos estão corretos?
1. **Início de Recarga**
2. **Início de Ociosidade** (ou "Alerta de Ociosidade"?)
3. **Bateria Cheia** (ou "Carga Completa"?)
4. **Interrupção de Carregamento** (ou outro nome?)

### 4. Lógica de Ociosidade:
Confirmo entendimento:
- Detecta 0W por 3 minutos → marca no banco
- Aguarda mais 5 minutos (atraso configurável)
- Envia notificação "Início de Ociosidade"
- Se continuar ocioso até StopTransaction → envia "Bateria Cheia"
- Se voltar a carregar → cancela alerta, reset contador

**✅ Está correto?**

### 5. Interrupção:
Quando enviar "Interrupção"?
- [ ] Apenas quando houver queda abrupta (>5000W → <500W)
- [ ] Também quando StopTransaction sem ter ficado ocioso
- [ ] Outro critério?

---

## 📊 ESTRUTURA FINAL DAS TABELAS

### Tabela `carregamentos`:
```sql
-- Novos campos necessários:
ultimo_power_w INTEGER DEFAULT NULL,
contador_ociosidade INTEGER DEFAULT 0,
ociosidade_detectada_em TIMESTAMP DEFAULT NULL,
ultimo_alerta_ociosidade TIMESTAMP DEFAULT NULL,
interrupcao_detectada BOOLEAN DEFAULT FALSE,
tipo_finalizacao VARCHAR(50) DEFAULT NULL,
notificacao_inicio_enviada BOOLEAN DEFAULT FALSE,
notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
notificacao_fim_enviada BOOLEAN DEFAULT FALSE
```

### Tabela `mensagens_notificacoes`:
```sql
id SERIAL PRIMARY KEY,
tipo VARCHAR(50) UNIQUE NOT NULL,
titulo TEXT NOT NULL,
corpo TEXT NOT NULL,
atraso_minutos INTEGER DEFAULT 0, -- NOVO!
ativo BOOLEAN DEFAULT TRUE,
criado_em TIMESTAMP DEFAULT NOW(),
atualizado_em TIMESTAMP DEFAULT NOW()
```

### Tabela `configuracoes_notificacoes`:
```sql
id SERIAL PRIMARY KEY,
chave VARCHAR(100) UNIQUE NOT NULL,
valor_numerico INTEGER,
descricao TEXT,
criado_em TIMESTAMP DEFAULT NOW(),
atualizado_em TIMESTAMP DEFAULT NOW()

-- Valores:
'tempo_minimo_inicio_min' = 3
'tempo_ociosidade_deteccao_min' = 3
'power_threshold_ocioso_w' = 100
'power_threshold_ativo_w' = 5000
'power_threshold_interrupcao_w' = 500
```

---

## ✅ AGUARDANDO CONFIRMAÇÃO

Por favor, confirme:

1. ✅ São 4 casos mesmo? Quais?
2. ✅ Todas as mensagens têm campo "atraso_minutos"?
3. ✅ A lógica de ociosidade está clara?
4. ✅ Os thresholds todos editáveis OK?
5. ✅ A nomenclatura dos casos está adequada?

**Após confirmar, posso prosseguir com a implementação! 🚀**

---

**Data:** 31/01/2026  
**Status:** ⏸️ Aguardando Alinhamento  
**Prioridade:** 🚨 Crítica


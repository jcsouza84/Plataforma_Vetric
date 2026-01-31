# 🎯 ESTRUTURA FINAL - 4 Casos de Notificações

## Data: 31/01/2026
## Status: Estrutura Confirmada ✅

---

## 📱 OS 4 CASOS DEFINITIVOS

### CASO 1️⃣: INÍCIO DE RECARGA
**Trigger:** Carregamento iniciado (MeterValues > 0)  
**Aguardar:** X minutos (configurável no próprio card da mensagem)  
**Lógica:**
```
StartTransaction recebido
  ↓
MeterValues começa a subir (> 0W)
  ↓
Aguarda X minutos (ex: 3 minutos)
  ↓
Envia notificação "Início de Recarga" ✅
```

**Exemplo Real:**
```
14:54:33 → StartTransaction
14:55:34 → 6820W (carregando confirmado)
14:57:34 → Passaram 3 minutos → ENVIA NOTIFICAÇÃO ✅
```

**Configuração:** Campo "Tempo (minutos)" no card da mensagem = `3`

---

### CASO 2️⃣: INÍCIO DE OCIOSIDADE ⚠️
**Trigger:** PRIMEIRO MeterValues que vai para 0W (ou abaixo do threshold)  
**Aguardar:** NENHUM - Envia IMEDIATAMENTE  
**Lógica:**
```
Estava carregando (MeterValues > threshold)
  ↓
Recebe MeterValues <= threshold (ex: <= 10W)
  ↓
Envia IMEDIATAMENTE "Início de Ociosidade" ⚠️
```

**Exemplo Real (Transação 435770):**
```
17:12:40 → 6041W [CARREGANDO]
17:21:41 → 0W [PRIMEIRO 0W!] → ENVIA IMEDIATAMENTE ✅
```

**Configuração:** 
- Threshold global: "Menor que 10W identifica ociosidade"
- Tempo no card: `0` (imediato) ou não ter campo de tempo?

---

### CASO 3️⃣: BATERIA CHEIA 🔋
**Trigger:** MeterValues <= threshold por X minutos consecutivos  
**Aguardar:** X minutos (configurável no card da mensagem)  
**Lógica:**
```
MeterValues <= threshold (ex: <= 10W)
  ↓
Conta X minutos consecutivos
  ↓
Se completar X minutos (ex: 3 minutos)
  ↓
Envia notificação "Bateria Cheia" ✅
```

**Exemplo Real (Transação 435770):**
```
17:21:41 → 0W [1º minuto]
17:22:41 → 0W [2º minuto]
17:23:41 → 0W [3º minuto] → ENVIA "BATERIA CHEIA" ✅
```

**Diferença para Caso 2:**
- **Caso 2:** Primeiro 0W → alerta IMEDIATO
- **Caso 3:** 3+ minutos em 0W → bateria cheia confirmada

**Configuração:** Campo "Tempo (minutos)" no card da mensagem = `3`

---

### CASO 4️⃣: INTERRUPÇÃO ⚠️
**Trigger:** MeterValues vai para 0W + logo recebe SuspendedEV/StopTransaction  
**Lógica:**
```
MeterValues vai para 0W
  ↓
Logo em seguida (segundos/minutos):
  - Recebe SuspendedEV
  OU
  - Recebe StopTransaction
  ↓
Envia notificação "Interrupção" ⚠️
```

**Exemplo Real (Transação 439071 - Saskya):**
```
01:34:51 → 6317W [CARREGANDO]
01:35:06 → 181W [QUEDA!]
01:35:07 → SuspendedEV [15 segundos depois!]
01:36:00 → StopTransaction

LÓGICA:
  01:35:06 → Power caiu para ~0W
  01:35:07 → SuspendedEV recebido logo após
  → MARCA: Interrupção detectada ✅
  01:36:00 → StopTransaction
  → ENVIA: Notificação "Interrupção" ✅
```

**Critério:** Potência vai para 0W (ou <= threshold) E recebe evento de suspensão/parada logo em seguida.

**Agrupa TODOS os casos:**
- ✅ Queda abrupta de 6000W para 0W
- ✅ Queda gradual até 0W
- ✅ Desconexão manual
- ✅ Falha no carregador
- ✅ SuspendedEV
- ✅ Remote Stop

**Configuração:** Campo "Tempo (minutos)" no card = `0` (imediato)?

---

## ⚙️ CONFIGURAÇÕES DO SISTEMA

### 1. Configuração Global (Página de Configurações)

```
┌──────────────────────────────────────────────┐
│ ⚙️ CONFIGURAÇÕES DE CARREGAMENTO            │
├──────────────────────────────────────────────┤
│                                              │
│ ⚡ DETECÇÃO DE OCIOSIDADE:                  │
│                                              │
│    Menor que [10] W identifica ociosidade   │
│    ℹ️ Potência abaixo deste valor = ocioso  │
│                                              │
│ [Salvar]                                     │
└──────────────────────────────────────────────┘
```

**Única configuração global:** Threshold de potência ociosa

**NÃO existe mais:**
- ❌ Potência mínima carregamento ativo (5000W)
- ❌ Potência após queda (500W)
- ❌ Tempo de detecção separado

---

### 2. Configuração nas Mensagens (Exemplo do Print)

```
┌────────────────────────────────────────────────┐
│ 🔋 Início de Carregamento              [toggle]│
│ Enviado quando o carregamento é iniciado      │
├────────────────────────────────────────────────┤
│ Variáveis disponíveis:                        │
│ {{nome}} {{charger}} {{localizacao}}          │
│ {{data}} {{apartamento}}                       │
├────────────────────────────────────────────────┤
│ Mensagem                                       │
│ ┌────────────────────────────────────────────┐ │
│ │ 🔋 Olá {{nome}}!                          │ │
│ │                                           │ │
│ │ Seu carregamento foi iniciado no          │ │
│ │ {{charger}}.                              │ │
│ │                                           │ │
│ │ 📍 Local: {{localizacao}}                 │ │
│ │ 🕐 Início: {{data}}                       │ │
│ │ 🏢 Apartamento: {{apartamento}}           │ │
│ │                                           │ │
│ │ Acompanhe pelo dashboard VETRIC!          │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│                     Tempo: [3] minutos   ⏱️   │
│                                                │
│ [Editar Template]                              │
└────────────────────────────────────────────────┘
```

**Campo "Tempo (minutos)":**
- Localizado no canto inferior direito
- Editável diretamente no card
- Cada mensagem tem seu próprio tempo

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela `configuracoes_sistema`:

```sql
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor_numerico INTEGER,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Única configuração global
INSERT INTO configuracoes_sistema (chave, valor_numerico, descricao) VALUES
  ('power_threshold_ocioso_w', 10, 'Potência máxima considerada ociosa (Watts)');
```

---

### Tabela `mensagens_notificacoes`:

```sql
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  
  -- Campo de tempo em minutos (canto inferior direito)
  tempo_minutos INTEGER DEFAULT 0,
  
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

---

### Inserção Inicial:

```sql
INSERT INTO mensagens_notificacoes (tipo, titulo, corpo, tempo_minutos, ativo) VALUES
  (
    'inicio_recarga',
    '🔋 Início de Carregamento',
    'Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n🕐 Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!',
    3,  -- Aguarda 3 minutos após detecção
    TRUE
  ),
  (
    'inicio_ociosidade',
    '⚠️ Carregamento ocioso',
    'Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{consumo}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.',
    0,  -- Envia IMEDIATAMENTE
    TRUE
  ),
  (
    'bateria_cheia',
    '🔋 Carga completa!',
    'Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nObrigado por liberar o carregador!',
    3,  -- Após 3 minutos consecutivos em 0W
    TRUE
  ),
  (
    'interrupcao',
    '⚠️ Carregamento interrompido',
    'Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo.',
    0,  -- Envia ao detectar
    TRUE
  );
```

---

### Tabela `carregamentos` - Novos Campos:

```sql
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  -- Para rastreamento de potência
  ultimo_power_w INTEGER DEFAULT NULL,
  
  -- Para contagem de ociosidade
  contador_minutos_ocioso INTEGER DEFAULT 0,
  primeiro_ocioso_em TIMESTAMP DEFAULT NULL,
  
  -- Para detecção de interrupção
  power_zerou_em TIMESTAMP DEFAULT NULL,
  interrupcao_detectada BOOLEAN DEFAULT FALSE,
  
  -- Para controle de notificações
  notificacao_inicio_enviada BOOLEAN DEFAULT FALSE,
  notificacao_inicio_enviada_em TIMESTAMP DEFAULT NULL,
  
  notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
  notificacao_ociosidade_enviada_em TIMESTAMP DEFAULT NULL,
  
  notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE,
  notificacao_bateria_cheia_enviada_em TIMESTAMP DEFAULT NULL,
  
  notificacao_interrupcao_enviada BOOLEAN DEFAULT FALSE,
  notificacao_interrupcao_enviada_em TIMESTAMP DEFAULT NULL,
  
  -- Tipo de finalização
  tipo_finalizacao VARCHAR(50) DEFAULT NULL;
  -- Valores: 'bateria_cheia', 'interrupcao', 'normal'
```

---

## 💻 LÓGICA NO CÓDIGO

### 1. Processar MeterValues

```typescript
async function onMeterValues(data: any) {
  const transactionId = data.transactionId;
  const power = extractPower(data); // Extrai "Power.Active.Import"
  
  // Buscar carregamento
  const result = await db.query(
    'SELECT * FROM carregamentos WHERE transaction_pk = $1 AND fim IS NULL',
    [transactionId]
  );
  
  if (!result.rows[0]) return;
  const carregamento = result.rows[0];
  
  // Buscar threshold de ociosidade
  const thresholdOcioso = await getConfig('power_threshold_ocioso_w'); // ex: 10W
  
  // =========================================
  // CASO 1: INÍCIO DE RECARGA
  // =========================================
  if (!carregamento.notificacao_inicio_enviada && power > thresholdOcioso) {
    const tempoConfig = await getMensagemTempo('inicio_recarga'); // ex: 3 min
    const minutosDecorridos = (Date.now() - carregamento.inicio.getTime()) / 60000;
    
    if (minutosDecorridos >= tempoConfig) {
      await enviarNotificacao(carregamento.id, 'inicio_recarga');
      await db.query(
        'UPDATE carregamentos SET notificacao_inicio_enviada = TRUE, notificacao_inicio_enviada_em = NOW() WHERE id = $1',
        [carregamento.id]
      );
    }
  }
  
  // =========================================
  // CASO 2: INÍCIO DE OCIOSIDADE (IMEDIATO)
  // =========================================
  if (
    power <= thresholdOcioso &&
    carregamento.ultimo_power_w > thresholdOcioso &&
    !carregamento.notificacao_ociosidade_enviada
  ) {
    // PRIMEIRO MeterValues em 0W - ENVIA IMEDIATAMENTE!
    await enviarNotificacao(carregamento.id, 'inicio_ociosidade');
    await db.query(
      `UPDATE carregamentos 
       SET notificacao_ociosidade_enviada = TRUE,
           notificacao_ociosidade_enviada_em = NOW(),
           primeiro_ocioso_em = NOW()
       WHERE id = $1`,
      [carregamento.id]
    );
  }
  
  // =========================================
  // CASO 3: BATERIA CHEIA (após X minutos em 0W)
  // =========================================
  if (power <= thresholdOcioso) {
    // Incrementa contador
    const novoContador = (carregamento.contador_minutos_ocioso || 0) + 1;
    await db.query(
      'UPDATE carregamentos SET contador_minutos_ocioso = $1 WHERE id = $2',
      [novoContador, carregamento.id]
    );
    
    // Verifica se completou X minutos
    const tempoConfig = await getMensagemTempo('bateria_cheia'); // ex: 3 min
    
    if (novoContador >= tempoConfig && !carregamento.notificacao_bateria_cheia_enviada) {
      await enviarNotificacao(carregamento.id, 'bateria_cheia');
      await db.query(
        'UPDATE carregamentos SET notificacao_bateria_cheia_enviada = TRUE, notificacao_bateria_cheia_enviada_em = NOW() WHERE id = $1',
        [carregamento.id]
      );
    }
  } else {
    // Voltou a carregar - reset contador
    await db.query(
      'UPDATE carregamentos SET contador_minutos_ocioso = 0 WHERE id = $1',
      [carregamento.id]
    );
  }
  
  // =========================================
  // CASO 4: DETECTAR QUEDA PARA 0W (parte 1)
  // =========================================
  if (power <= thresholdOcioso && carregamento.ultimo_power_w > thresholdOcioso) {
    // Power acabou de zerar - marca timestamp
    await db.query(
      'UPDATE carregamentos SET power_zerou_em = NOW() WHERE id = $1',
      [carregamento.id]
    );
  }
  
  // Atualizar último power
  await db.query(
    'UPDATE carregamentos SET ultimo_power_w = $1 WHERE id = $2',
    [power, carregamento.id]
  );
}
```

---

### 2. Processar SuspendedEV

```typescript
async function onStatusNotification(data: any) {
  if (data.status !== 'SuspendedEV') return;
  
  // Buscar carregamento ativo neste conector
  const result = await db.query(
    `SELECT * FROM carregamentos 
     WHERE charger_uuid = $1 
     AND fim IS NULL 
     ORDER BY inicio DESC 
     LIMIT 1`,
    [data.chargeBoxId]
  );
  
  if (!result.rows[0]) return;
  const carregamento = result.rows[0];
  
  // =========================================
  // CASO 4: INTERRUPÇÃO (parte 2)
  // =========================================
  // Verifica se power zerou recentemente (últimos 2 minutos)
  if (carregamento.power_zerou_em) {
    const segundosDesdeZero = (Date.now() - carregamento.power_zerou_em.getTime()) / 1000;
    
    if (segundosDesdeZero <= 120) { // 2 minutos
      // Power zerou + SuspendedEV logo após = INTERRUPÇÃO!
      await db.query(
        'UPDATE carregamentos SET interrupcao_detectada = TRUE WHERE id = $1',
        [carregamento.id]
      );
      
      console.log(`[INTERRUPÇÃO DETECTADA] Carregamento ${carregamento.id}: Power zerou ${segundosDesdeZero}s atrás`);
    }
  }
}
```

---

### 3. Processar StopTransaction

```typescript
async function onStopTransaction(data: any) {
  const transactionId = data.transactionId;
  
  // Buscar carregamento
  const result = await db.query(
    'SELECT * FROM carregamentos WHERE transaction_pk = $1',
    [transactionId]
  );
  
  if (!result.rows[0]) return;
  const carregamento = result.rows[0];
  
  // =========================================
  // CASO 4: INTERRUPÇÃO (parte 3 - ao finalizar)
  // =========================================
  if (carregamento.power_zerou_em) {
    const segundosDesdeZero = (Date.now() - carregamento.power_zerou_em.getTime()) / 1000;
    
    if (segundosDesdeZero <= 120) { // 2 minutos
      // Power zerou + StopTransaction logo após = INTERRUPÇÃO!
      await db.query(
        'UPDATE carregamentos SET interrupcao_detectada = TRUE WHERE id = $1',
        [carregamento.id]
      );
    }
  }
  
  // Decidir tipo de finalização e notificação
  let tipoFinalizacao: string;
  let enviarNotificacao = false;
  
  if (carregamento.interrupcao_detectada && !carregamento.notificacao_interrupcao_enviada) {
    // CASO 4: Interrupção
    tipoFinalizacao = 'interrupcao';
    await enviarNotificacaoFim(carregamento.id, 'interrupcao', data);
    enviarNotificacao = true;
    
  } else if (carregamento.notificacao_bateria_cheia_enviada) {
    // CASO 3: Bateria cheia (já enviou a notificação durante MeterValues)
    tipoFinalizacao = 'bateria_cheia';
    // Não envia novamente
    
  } else {
    // Finalização normal (sem notificação específica)
    tipoFinalizacao = 'normal';
  }
  
  // Atualizar banco
  await db.query(
    `UPDATE carregamentos 
     SET fim = $1, 
         tipo_finalizacao = $2
     WHERE id = $3`,
    [new Date(data.timestamp), tipoFinalizacao, carregamento.id]
  );
  
  console.log(`[FINALIZADO] Carregamento ${carregamento.id}: ${tipoFinalizacao}`);
}
```

---

### 4. Funções Auxiliares

```typescript
// Buscar configuração do sistema
async function getConfig(chave: string): Promise<number> {
  const result = await db.query(
    'SELECT valor_numerico FROM configuracoes_sistema WHERE chave = $1',
    [chave]
  );
  return result.rows[0]?.valor_numerico || 10; // padrão: 10W
}

// Buscar tempo configurado na mensagem
async function getMensagemTempo(tipo: string): Promise<number> {
  const result = await db.query(
    'SELECT tempo_minutos FROM mensagens_notificacoes WHERE tipo = $1',
    [tipo]
  );
  return result.rows[0]?.tempo_minutos || 0;
}

// Enviar notificação
async function enviarNotificacao(carregamentoId: number, tipo: string) {
  // Buscar dados
  const result = await db.query(`
    SELECT c.*, m.nome, m.telefone, m.apartamento
    FROM carregamentos c
    JOIN moradores m ON c.morador_id = m.id
    WHERE c.id = $1
  `, [carregamentoId]);
  
  const carregamento = result.rows[0];
  if (!carregamento?.telefone) return;
  
  // Buscar mensagem
  const msgResult = await db.query(
    'SELECT * FROM mensagens_notificacoes WHERE tipo = $1 AND ativo = TRUE',
    [tipo]
  );
  
  if (!msgResult.rows[0]) return;
  const mensagem = msgResult.rows[0];
  
  // Substituir variáveis
  const vars = {
    nome: carregamento.nome,
    charger: carregamento.charger_name,
    localizacao: 'General Luiz de França Albuquerque, Maceió',
    data: formatarDataHora(carregamento.inicio),
    apartamento: carregamento.apartamento,
    consumo: calcularConsumo(carregamento),
    duracao: calcularDuracao(carregamento),
  };
  
  let mensagemFinal = mensagem.corpo;
  Object.keys(vars).forEach(key => {
    mensagemFinal = mensagemFinal.replace(
      new RegExp(`{{${key}}}`, 'g'),
      vars[key]
    );
  });
  
  // Enviar
  await WhatsAppService.enviar({
    telefone: carregamento.telefone,
    mensagem: mensagemFinal,
  });
  
  console.log(`[NOTIFICAÇÃO ENVIADA] ${tipo} para ${carregamento.nome}`);
}
```

---

## 🔄 FLUXOS COMPLETOS

### FLUXO A: Bateria Cheia (Transação 435770)

```
14:54:33 → StartTransaction
14:55:34 → 6820W (carregando)
14:57:34 → 3 min → [1] NOTIFICA "INÍCIO" ✅

... carrega por 2h 27min ...

17:21:41 → 0W (primeiro 0W)
17:21:41 → [2] NOTIFICA "OCIOSIDADE" IMEDIATO ⚠️

17:22:41 → 0W (contador = 1)
17:23:41 → 0W (contador = 2)
17:24:41 → 0W (contador = 3)
17:24:41 → [3] NOTIFICA "BATERIA CHEIA" ✅

... fica ocioso por 3h+ ...

20:53:59 → StopTransaction
20:53:59 → Finaliza (tipo: bateria_cheia)
```

**Notificações enviadas:**
1. ✅ Início de Recarga (14:57)
2. ⚠️ Início de Ociosidade (17:21 - IMEDIATO)
3. 🔋 Bateria Cheia (17:24 - após 3 min)

---

### FLUXO B: Interrupção (Transação 439071 - Saskya)

```
00:00:00 → StartTransaction
00:01:00 → 6300W (carregando)
00:03:00 → 3 min → [1] NOTIFICA "INÍCIO" ✅

... carrega por 1h 32min ...

01:34:51 → 6317W (carregando pleno)
01:35:06 → 181W (power zerou!) ← marca timestamp
01:35:07 → SuspendedEV (1 seg depois!)
01:35:07 → DETECTA: Interrupção ⚠️
01:36:00 → StopTransaction
01:36:00 → [4] NOTIFICA "INTERRUPÇÃO" ⚠️
```

**Notificações enviadas:**
1. ✅ Início de Recarga (00:03)
2. ⚠️ Interrupção (01:36)

**NÃO envia:**
- ❌ Ociosidade (power zerou mas SuspendedEV veio logo, é interrupção)
- ❌ Bateria Cheia (não completou 3 min em 0W)

---

## 📊 RESUMO COMPARATIVO

### Diferença entre os Casos 2, 3 e 4:

| Situação | Caso | Notificação | Quando |
|----------|------|-------------|--------|
| Primeiro 0W | CASO 2 | Ociosidade ⚠️ | IMEDIATO |
| 3+ min em 0W | CASO 3 | Bateria Cheia 🔋 | Após X min |
| 0W + SuspendedEV/Stop | CASO 4 | Interrupção ⚠️ | Ao detectar |

### Timeline Exemplo:

```
17:21:41 → 0W → CASO 2: "Ociosidade" (imediato) ⚠️
17:24:41 → 3 min em 0W → CASO 3: "Bateria Cheia" 🔋
OU
17:21:41 → 0W
17:21:42 → SuspendedEV → CASO 4: "Interrupção" ⚠️
```

---

## ⚙️ CONFIGURAÇÕES FINAIS

### 1. Sistema (Global):
```sql
-- Única configuração global
power_threshold_ocioso_w = 10 (Watts)
```

### 2. Mensagens (Individual):
```sql
-- Cada mensagem tem seu tempo
inicio_recarga.tempo_minutos = 3
inicio_ociosidade.tempo_minutos = 0 (imediato)
bateria_cheia.tempo_minutos = 3
interrupcao.tempo_minutos = 0 (ao detectar)
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Banco de Dados:
- [ ] Criar tabela `configuracoes_sistema`
- [ ] Criar tabela `mensagens_notificacoes` (com campo `tempo_minutos`)
- [ ] Adicionar 10 campos na tabela `carregamentos`
- [ ] Inserir 4 mensagens padrão
- [ ] Inserir 1 configuração global (threshold)

### Backend:
- [ ] Modificar `onMeterValues()` - lógica dos casos 1, 2, 3
- [ ] Modificar `onStatusNotification()` - detectar interrupção (caso 4)
- [ ] Modificar `onStopTransaction()` - finalizar e notificar caso 4
- [ ] Criar `getConfig()` - buscar threshold
- [ ] Criar `getMensagemTempo()` - buscar tempo da mensagem
- [ ] Criar `enviarNotificacao()` - processar e enviar

### Frontend:
- [ ] Página de Configurações - threshold de potência ociosa
- [ ] Página de Mensagens - 4 cards com campo "Tempo (minutos)"
- [ ] Botão "Editar Template" em cada card
- [ ] Campo de toggle (ativo/inativo) em cada card

---

## 🎯 ESTÁ CORRETO AGORA?

Por favor confirme se entendi corretamente:

1. ✅ São 4 casos (início, ociosidade, bateria cheia, interrupção)
2. ✅ Campo "tempo_minutos" no próprio card da mensagem
3. ✅ Única config global: threshold de potência ociosa
4. ✅ Ociosidade envia IMEDIATO no primeiro 0W
5. ✅ Bateria cheia envia após X minutos em 0W
6. ✅ Interrupção detecta por 0W + evento de suspensão/parada

**Se estiver tudo OK, posso prosseguir com a implementação! 🚀**

---

**Data:** 31/01/2026  
**Status:** ✅ Estrutura Final Confirmada  
**Próximo:** Implementação


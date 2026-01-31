# 📋 PROPOSTA FUNCIONAL - Sistema de Notificações Inteligentes

## 🎯 OBJETIVO

Implementar **3 casos específicos** de notificação baseados em análise real dos logs CVE-PRO, mantendo todas as mensagens editáveis e configuráveis.

---

## 📊 REVISÃO: Padrões Identificados nos Logs Reais

### Dados Analisados:
- **Log mundo_logic-20260131-025549.txt** (31/01/2026)
- **Log mundo_logic-23.txt** (22/01/2026)
- **Banco de Produção** (30-31/01/2026)

### Padrões Encontrados:

| Padrão | Transação | Característica | Ocorrências |
|--------|-----------|----------------|-------------|
| **Bateria Cheia** | 435770 | Declínio gradual + 212min ocioso | Raro (~5%) |
| **Interrupção Manual** | 439071 (Saskya) | Queda abrupta 6317W→181W | Comum (~30%) |
| **Desconexão Normal** | 439082 (Saulo) | Finaliza com potência alta | Comum (~65%) |

---

## 🎯 OS 3 CASOS A IMPLEMENTAR

### CASO 1️⃣: INÍCIO DE RECARGA
**Trigger:** MeterValues sai de 0W e começa a carregar  
**Aguardar:** X minutos (configurável) antes de notificar  
**Objetivo:** Evitar notificações para carregamentos muito curtos/testes

### CASO 2️⃣: BATERIA CHEIA / INÍCIO DE OCIOSIDADE
**Trigger:** MeterValues fica em 0W por X minutos consecutivos  
**Objetivo:** Alertar morador que bateria pode estar cheia e liberar vaga

### CASO 3️⃣: INTERRUPÇÃO DE CARREGAMENTO
**Trigger:** Queda abrupta de potência (>5000W para <500W)  
**Objetivo:** Informar interrupção que pode indicar falha ou suspensão

---

## 🔍 LÓGICA DETALHADA DE CADA CASO

### CASO 1️⃣: INÍCIO DE RECARGA

#### Lógica:

```
QUANDO: Recebe StartTransaction
  1. Cria registro no banco (já implementado ✅)
  2. Aguarda X minutos (padrão: 3 minutos)
  3. SOMENTE APÓS X minutos, SE ainda está carregando:
     → Envia notificação de início
     → Marca notificacao_inicio_enviada = TRUE
```

#### Exemplo Real (Transação 435770):

```
14:54:33 → StartTransaction recebido
14:54:33 → 0W (preparação)
14:54:34 → 13W (iniciando)
14:55:34 → 6820W (carregando pleno) ✅ 1 minuto depois

LÓGICA PROPOSTA:
  14:54:33 → StartTransaction
  14:54:33 → Cria registro no banco
  14:57:33 → Verifica: ainda está carregando? SIM (6820W)
  14:57:33 → Envia notificação de início ✅
```

#### Por que aguardar X minutos?

- Evita notificar carregamentos de teste (moradores testando o sistema)
- Evita notificar carregamentos que falham logo no início
- Reduz spam de notificações

#### Configuração:

```typescript
const CONFIG = {
  TEMPO_MINIMO_INICIO: 3, // minutos (configurável)
};
```

---

### CASO 2️⃣: BATERIA CHEIA / INÍCIO DE OCIOSIDADE

#### Lógica:

```
QUANDO: Recebe MeterValues
  1. Extrai Power (potência em W)
  
  SE Power < 100W:
    2. Incrementa contador_ociosidade
    
    SE contador_ociosidade >= X minutos (padrão: 3):
      3. Envia alerta de ociosidade (APENAS UMA VEZ)
      4. Marca ultimo_alerta_ociosidade = NOW()
  
  SENÃO (Power >= 100W):
    5. Reset contador_ociosidade = 0
    6. (Morador voltou a carregar, cancela alerta)

QUANDO: Recebe StopTransaction
  SE contador_ociosidade >= X minutos:
    7. Envia notificação "Bateria Cheia" (fim com ociosidade)
  SENÃO:
    8. Envia notificação "Carregamento Finalizado" (fim normal)
```

#### Exemplo Real (Transação 435770 - Bateria Cheia):

```
17:12:40 → 6041W [CARREGANDO]
17:21:41 → 0W [PRIMEIRA MEDIÇÃO OCIOSA] ← contador = 1
17:31:41 → 0W ← contador = 2
17:41:42 → 0W ← contador = 3 ✅ ENVIA ALERTA
18:00:00 → 0W (continua ocioso)
19:00:00 → 0W (continua ocioso)
20:53:59 → StopTransaction ✅ ENVIA "BATERIA CHEIA"

NOTIFICAÇÕES ENVIADAS:
  17:41:42 → "⚠️ Carregamento ocioso há 3 minutos"
  20:53:59 → "🔋 Carga completa! Bateria carregada"
```

#### Exemplo Real (Transação 439082 - Saulo - Desconexão Normal):

```
02:32:05 → 6575W [CARREGANDO]
02:33:05 → 6611W [CARREGANDO]
02:34:05 → 6627W [CARREGANDO] ← último MeterValues
02:35:02 → StopTransaction (reason: EVDisconnected)

LÓGICA:
  contador_ociosidade = 0 (nunca ficou ocioso)
  → Envia "Carregamento Finalizado" (normal)
```

#### Configuração:

```typescript
const CONFIG = {
  TEMPO_OCIOSIDADE_ALERTA: 3, // minutos (configurável)
  POWER_THRESHOLD_OCIOSO: 100, // Watts (configurável)
};
```

---

### CASO 3️⃣: INTERRUPÇÃO DE CARREGAMENTO

#### Lógica:

```
QUANDO: Recebe MeterValues
  1. Extrai Power atual
  2. Compara com ultimo_power_w armazenado
  
  SE (ultimo_power_w > 5000W) E (Power < 500W):
    3. Detecta QUEDA ABRUPTA
    4. Marca flag: interrupcao_detectada = TRUE
  
  5. Atualiza ultimo_power_w = Power

QUANDO: Recebe StopTransaction
  SE interrupcao_detectada = TRUE:
    6. Envia notificação "Interrupção de Carregamento"
  SENÃO:
    7. (Fluxo normal - casos 2)
```

#### Exemplo Real (Transação 439071 - Saskya - Interrupção Manual):

```
01:32:51 → 6315W [CARREGANDO PLENO]
01:33:51 → 5493W [CARREGANDO]
01:34:51 → 6317W [CARREGANDO PLENO] ← ultimo_power_w = 6317
01:35:06 → 181W [QUEDA ABRUPTA!] ✅ DETECTA INTERRUPÇÃO
01:35:07 → SuspendedEV
01:36:00 → StopTransaction (reason: Remote)

LÓGICA:
  01:34:51 → ultimo_power_w = 6317W
  01:35:06 → Power = 181W
  01:35:06 → Detecta: 6317W > 5000 E 181W < 500
  01:35:06 → Marca: interrupcao_detectada = TRUE
  01:36:00 → StopTransaction
  01:36:00 → Envia "⚠️ Carregamento interrompido"
```

#### Por que 5000W → 500W?

- **5000W:** Indica carregamento ativo/pleno (veículo realmente carregando)
- **500W:** Margem de segurança (permite pequenas oscilações normais)
- **Queda > 4500W:** Indica interrupção anormal, não natural

#### Configuração:

```typescript
const CONFIG = {
  POWER_THRESHOLD_ATIVO: 5000, // Watts (configurável)
  POWER_THRESHOLD_INTERRUPCAO: 500, // Watts (configurável)
  QUEDA_MINIMA: 4500, // Watts (5000 - 500)
};
```

---

## 🗄️ MUDANÇAS NECESSÁRIAS NO BANCO DE DADOS

### Tabela `carregamentos` - Adicionar Campos:

```sql
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  -- Para rastreamento de potência
  ultimo_power_w INTEGER DEFAULT NULL,
  
  -- Para detecção de ociosidade
  contador_ociosidade INTEGER DEFAULT 0,
  ultimo_alerta_ociosidade TIMESTAMP DEFAULT NULL,
  
  -- Para detecção de interrupção
  interrupcao_detectada BOOLEAN DEFAULT FALSE,
  
  -- Para contexto da notificação
  tipo_finalizacao VARCHAR(50) DEFAULT NULL;
  -- Valores: 'bateria_cheia', 'desconexao_normal', 'interrupcao', 'erro'
```

### Tabela `configuracoes` - Criar (ou adicionar campos):

```sql
CREATE TABLE IF NOT EXISTS configuracoes_notificacoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor_numerico INTEGER,
  valor_texto TEXT,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir valores padrão
INSERT INTO configuracoes_notificacoes (chave, valor_numerico, descricao) VALUES
  ('tempo_minimo_inicio_min', 3, 'Minutos a aguardar antes de notificar início'),
  ('tempo_ociosidade_alerta_min', 3, 'Minutos de ociosidade para enviar alerta'),
  ('power_threshold_ocioso_w', 100, 'Potência máxima considerada ociosa (Watts)'),
  ('power_threshold_ativo_w', 5000, 'Potência mínima considerada carregamento ativo'),
  ('power_threshold_interrupcao_w', 500, 'Potência máxima após queda abrupta');
```

### Tabela `mensagens_notificacoes` - Criar:

```sql
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir mensagens padrão (EDITÁVEIS)
INSERT INTO mensagens_notificacoes (tipo, titulo, corpo) VALUES
  (
    'inicio',
    '🔋 Carregamento iniciado!',
    'Seu carregamento foi iniciado no {{carregador}}.\n\n📍 Local: {{endereco}}\n🕐 Início: {{data_hora}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC!'
  ),
  (
    'ociosidade_alerta',
    '⚠️ Carregamento ocioso',
    'Seu carregamento está sem consumo há {{tempo_ocioso}} minutos.\nSua bateria pode estar cheia.\n\n⚡ Consumo até agora: {{consumo}} kWh\n📍 {{carregador}}\n\nPor favor, remova o cabo para liberar o carregador.'
  ),
  (
    'bateria_cheia',
    '🔋 Carga completa!',
    'Seu veículo está com a bateria carregada.\n\n⚡ Consumo: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{carregador}}\n\nObrigado por liberar o carregador!'
  ),
  (
    'desconexao_normal',
    '✅ Carregamento finalizado!',
    '⚡ Consumo: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{carregador}}\n\nObrigado por liberar o carregador!'
  ),
  (
    'interrupcao',
    '⚠️ Carregamento interrompido',
    'Seu carregamento foi finalizado antes do esperado.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{carregador}}\n\nSe não foi você, verifique seu veículo.'
  );
```

---

## 💻 MUDANÇAS NECESSÁRIAS NO CÓDIGO

### 1. WebSocket Handler - Processar MeterValues

**Arquivo:** `src/services/websocket/CVEWebSocketService.ts` (ou similar)

```typescript
// ESTADO LOCAL (por transação ativa)
interface TransacaoAtiva {
  id: number;
  chargeBoxId: string;
  ultimoPowerW: number;
  contadorOciosidade: number;
  alertaOciosidadeEnviado: boolean;
  interrupcaoDetectada: boolean;
  inicioNotificado: boolean;
  tempoInicio: Date;
}

const transakoesAtivas: Map<number, TransacaoAtiva> = new Map();

// Buscar configurações do banco
async function getConfig(chave: string): Promise<number> {
  const result = await db.query(
    'SELECT valor_numerico FROM configuracoes_notificacoes WHERE chave = $1',
    [chave]
  );
  return result.rows[0]?.valor_numerico || 3; // valor padrão
}

// PROCESSAR METERVALUES
async function onMeterValues(data: any) {
  const transactionId = data.transactionId;
  const power = extractPower(data); // Extrai "Power.Active.Import"
  
  // Buscar transação no banco
  const carregamento = await db.query(
    'SELECT * FROM carregamentos WHERE transaction_pk = $1 AND fim IS NULL',
    [transactionId]
  );
  
  if (!carregamento.rows[0]) return;
  
  const transacao = transakoesAtivas.get(carregamento.rows[0].id) || {
    id: carregamento.rows[0].id,
    chargeBoxId: data.chargeBoxId,
    ultimoPowerW: 0,
    contadorOciosidade: 0,
    alertaOciosidadeEnviado: false,
    interrupcaoDetectada: false,
    inicioNotificado: carregamento.rows[0].notificacao_inicio_enviada,
    tempoInicio: carregamento.rows[0].inicio,
  };
  
  // =========================================
  // CASO 1: NOTIFICAR INÍCIO (após X minutos)
  // =========================================
  if (!transacao.inicioNotificado) {
    const tempoMinimo = await getConfig('tempo_minimo_inicio_min');
    const minutosDecorridos = (Date.now() - transacao.tempoInicio.getTime()) / 60000;
    
    if (minutosDecorridos >= tempoMinimo && power > 1000) {
      // Carregamento confirmado após X minutos
      await enviarNotificacao(transacao.id, 'inicio');
      await db.query(
        'UPDATE carregamentos SET notificacao_inicio_enviada = TRUE WHERE id = $1',
        [transacao.id]
      );
      transacao.inicioNotificado = true;
    }
  }
  
  // =========================================
  // CASO 3: DETECTAR INTERRUPÇÃO
  // =========================================
  const powerThresholdAtivo = await getConfig('power_threshold_ativo_w');
  const powerThresholdInterrupcao = await getConfig('power_threshold_interrupcao_w');
  
  if (transacao.ultimoPowerW > powerThresholdAtivo && power < powerThresholdInterrupcao) {
    // QUEDA ABRUPTA DETECTADA!
    console.log(`[ALERTA] Interrupção detectada: ${transacao.ultimoPowerW}W → ${power}W`);
    transacao.interrupcaoDetectada = true;
    
    await db.query(
      'UPDATE carregamentos SET interrupcao_detectada = TRUE, ultimo_power_w = $1 WHERE id = $2',
      [power, transacao.id]
    );
  }
  
  // =========================================
  // CASO 2: DETECTAR OCIOSIDADE
  // =========================================
  const powerThresholdOcioso = await getConfig('power_threshold_ocioso_w');
  const tempoOciosidadeAlerta = await getConfig('tempo_ociosidade_alerta_min');
  
  if (power < powerThresholdOcioso) {
    // Está ocioso
    transacao.contadorOciosidade++;
    
    // Enviar alerta após X minutos (apenas uma vez)
    if (
      transacao.contadorOciosidade >= tempoOciosidadeAlerta &&
      !transacao.alertaOciosidadeEnviado
    ) {
      await enviarNotificacao(transacao.id, 'ociosidade_alerta', {
        tempo_ocioso: transacao.contadorOciosidade,
      });
      
      await db.query(
        'UPDATE carregamentos SET ultimo_alerta_ociosidade = NOW() WHERE id = $1',
        [transacao.id]
      );
      
      transacao.alertaOciosidadeEnviado = true;
    }
  } else {
    // Voltou a carregar - reset contador
    transacao.contadorOciosidade = 0;
    transacao.alertaOciosidadeEnviado = false;
  }
  
  // Atualizar último power
  transacao.ultimoPowerW = power;
  await db.query(
    'UPDATE carregamentos SET ultimo_power_w = $1, contador_ociosidade = $2 WHERE id = $3',
    [power, transacao.contadorOciosidade, transacao.id]
  );
  
  // Salvar estado
  transakoesAtivas.set(transacao.id, transacao);
}
```

### 2. WebSocket Handler - Processar StopTransaction

```typescript
async function onStopTransaction(data: any) {
  const transactionId = data.transactionId;
  
  // Buscar transação
  const result = await db.query(
    'SELECT * FROM carregamentos WHERE transaction_pk = $1',
    [transactionId]
  );
  
  if (!result.rows[0]) return;
  
  const carregamento = result.rows[0];
  const transacao = transakoesAtivas.get(carregamento.id);
  
  // Determinar tipo de finalização
  let tipoFinalizacao: string;
  let tipoNotificacao: string;
  
  if (transacao?.interrupcaoDetectada) {
    // CASO 3: Interrupção detectada
    tipoFinalizacao = 'interrupcao';
    tipoNotificacao = 'interrupcao';
    
  } else if (transacao?.contadorOciosidade >= 3) {
    // CASO 2: Bateria cheia (ficou ocioso)
    tipoFinalizacao = 'bateria_cheia';
    tipoNotificacao = 'bateria_cheia';
    
  } else {
    // Desconexão normal
    tipoFinalizacao = 'desconexao_normal';
    tipoNotificacao = 'desconexao_normal';
  }
  
  // Atualizar banco
  await db.query(
    `UPDATE carregamentos 
     SET fim = $1, 
         tipo_finalizacao = $2,
         notificacao_fim_enviada = TRUE
     WHERE id = $3`,
    [new Date(data.timestamp), tipoFinalizacao, carregamento.id]
  );
  
  // Enviar notificação
  await enviarNotificacao(carregamento.id, tipoNotificacao, {
    consumo: calcularConsumo(data),
    duracao: calcularDuracao(carregamento.inicio, data.timestamp),
  });
  
  // Limpar estado
  transakoesAtivas.delete(carregamento.id);
}
```

### 3. Serviço de Notificações

```typescript
async function enviarNotificacao(
  carregamentoId: number,
  tipo: string,
  variaveis?: Record<string, any>
) {
  // Buscar carregamento + morador
  const result = await db.query(`
    SELECT c.*, m.nome, m.telefone, m.apartamento
    FROM carregamentos c
    JOIN moradores m ON c.morador_id = m.id
    WHERE c.id = $1
  `, [carregamentoId]);
  
  const carregamento = result.rows[0];
  if (!carregamento.telefone) return; // Sem telefone, não envia
  
  // Buscar mensagem do banco (editável)
  const msgResult = await db.query(
    'SELECT * FROM mensagens_notificacoes WHERE tipo = $1 AND ativo = TRUE',
    [tipo]
  );
  
  if (!msgResult.rows[0]) {
    console.warn(`Mensagem tipo '${tipo}' não encontrada ou inativa`);
    return;
  }
  
  const mensagem = msgResult.rows[0];
  
  // Substituir variáveis
  const variavelMap = {
    carregador: carregamento.charger_name,
    endereco: 'General Luiz de França Albuquerque, Maceió',
    data_hora: formatarDataHora(carregamento.inicio),
    apartamento: carregamento.apartamento,
    consumo: variaveis?.consumo || '0.00',
    duracao: variaveis?.duracao || 'N/A',
    tempo_ocioso: variaveis?.tempo_ocioso || '3',
  };
  
  let corpoFinal = mensagem.corpo;
  Object.keys(variavelMap).forEach(key => {
    corpoFinal = corpoFinal.replace(
      new RegExp(`{{${key}}}`, 'g'),
      variavelMap[key]
    );
  });
  
  // Enviar via WhatsApp
  await WhatsAppService.enviar({
    telefone: carregamento.telefone,
    mensagem: `${mensagem.titulo}\n\n${corpoFinal}`,
  });
  
  // Log
  await db.query(`
    INSERT INTO logs_notificacoes (
      morador_id, tipo, mensagem_enviada, telefone, status, enviado_em
    ) VALUES ($1, $2, $3, $4, $5, NOW())
  `, [
    carregamento.morador_id,
    tipo,
    corpoFinal,
    carregamento.telefone,
    'enviado',
  ]);
}
```

---

## 📱 INTERFACE PARA CONFIGURAÇÃO

### Tela de Configurações (Admin):

```
┌─────────────────────────────────────────────┐
│ ⚙️ Configurações de Notificações           │
├─────────────────────────────────────────────┤
│                                             │
│ ⏱️ Tempo Mínimo para Notificar Início:     │
│    [3] minutos                              │
│    ℹ️ Aguardar antes de enviar notificação │
│                                             │
│ ⏱️ Tempo para Alerta de Ociosidade:        │
│    [3] minutos                              │
│    ℹ️ Tempo em 0W para alertar morador     │
│                                             │
│ ⚡ Potência Considerada Ociosa:            │
│    [100] Watts                              │
│    ℹ️ Abaixo deste valor = ocioso          │
│                                             │
│ ⚡ Potência Mínima Carregamento Ativo:     │
│    [5000] Watts                             │
│    ℹ️ Para detectar interrupção            │
│                                             │
│ ⚡ Potência Máxima Após Interrupção:       │
│    [500] Watts                              │
│    ℹ️ Queda maior que isso = interrupção   │
│                                             │
│ [Salvar Configurações]                      │
└─────────────────────────────────────────────┘
```

### Tela de Mensagens (Admin):

```
┌─────────────────────────────────────────────┐
│ 💬 Mensagens de Notificação                │
├─────────────────────────────────────────────┤
│                                             │
│ ▼ Início de Carregamento                   │
│   Título: 🔋 Carregamento iniciado!        │
│   Corpo: [Área de texto editável]          │
│   Variáveis disponíveis:                   │
│   {{carregador}}, {{data_hora}}, etc.      │
│   [ ] Ativo                                 │
│                                             │
│ ▼ Alerta de Ociosidade                     │
│   Título: ⚠️ Carregamento ocioso           │
│   Corpo: [Área de texto editável]          │
│   [✓] Ativo                                 │
│                                             │
│ ▼ Bateria Cheia                            │
│ ▼ Desconexão Normal                        │
│ ▼ Interrupção de Carregamento              │
│                                             │
│ [Salvar Mensagens]                          │
└─────────────────────────────────────────────┘
```

---

## 🧪 TESTES NECESSÁRIOS

### Cenário 1: Bateria Cheia (Transação 435770)

```
ENTRADA SIMULADA:
  T+0min  → StartTransaction
  T+1min  → MeterValues: 6820W
  T+3min  → MeterValues: 6900W → ✅ NOTIFICA INÍCIO
  T+150min → MeterValues: 6041W
  T+159min → MeterValues: 0W (contador = 1)
  T+160min → MeterValues: 0W (contador = 2)
  T+161min → MeterValues: 0W (contador = 3) → ✅ ALERTA OCIOSIDADE
  T+200min → MeterValues: 0W
  T+250min → StopTransaction → ✅ NOTIFICA "BATERIA CHEIA"

RESULTADO ESPERADO:
  ✅ Notificação de início em T+3min
  ✅ Alerta de ociosidade em T+161min
  ✅ Notificação "Bateria Cheia" em T+250min
```

### Cenário 2: Interrupção Manual (Transação 439071 - Saskya)

```
ENTRADA SIMULADA:
  T+0min  → StartTransaction
  T+1min  → MeterValues: 6300W
  T+3min  → MeterValues: 6315W → ✅ NOTIFICA INÍCIO
  T+50min → MeterValues: 6317W
  T+51min → MeterValues: 181W → ⚠️ DETECTA INTERRUPÇÃO
  T+52min → StopTransaction → ✅ NOTIFICA "INTERRUPÇÃO"

RESULTADO ESPERADO:
  ✅ Notificação de início em T+3min
  ✅ Notificação "Interrupção" em T+52min
  ❌ NÃO envia alerta de ociosidade (só 1 min em 0W)
```

### Cenário 3: Desconexão Normal (Transação 439082 - Saulo)

```
ENTRADA SIMULADA:
  T+0min  → StartTransaction
  T+1min  → MeterValues: 6500W
  T+3min  → MeterValues: 6584W → ✅ NOTIFICA INÍCIO
  T+100min → MeterValues: 6627W
  T+101min → StopTransaction → ✅ NOTIFICA "FINALIZADO"

RESULTADO ESPERADO:
  ✅ Notificação de início em T+3min
  ✅ Notificação "Finalizado" em T+101min
  ❌ NÃO envia alerta de ociosidade (nunca ficou em 0W)
  ❌ NÃO detecta interrupção (finalizou em alta potência)
```

---

## ⚠️ CONSIDERAÇÕES IMPORTANTES

### 1. Estado em Memória vs Banco de Dados

**Problema:** Se o servidor reiniciar, perde o estado das transações ativas.

**Solução:** Sempre buscar estado do banco ao processar MeterValues:
```typescript
// Ao invés de só Map em memória:
const transacao = transakoesAtivas.get(id) || await recuperarEstadoDoBanco(id);
```

### 2. Timezone

**Problema:** Diferença de 3h entre horário CVE-PRO (UTC?) e local (Brasil).

**Solução:** Sempre usar `timestamp` da mensagem CVE-PRO, converter para local:
```typescript
const fim = new Date(data.timestamp); // Não usar new Date()
```

### 3. Transações Sem Morador

**Problema:** Algumas transações não têm morador identificado.

**Solução:** Não enviar notificação, mas marcar como NULL (não FALSE):
```typescript
if (!morador?.telefone) {
  await db.query(
    'UPDATE carregamentos SET notificacao_inicio_enviada = NULL WHERE id = $1',
    [id]
  );
  return;
}
```

### 4. Mensagens Editáveis

**Solução Implementada:** Todas as mensagens no banco com variáveis `{{nome}}`.

**Benefício:** Cliente pode editar sem mexer no código.

### 5. Valores Configuráveis

**Solução Implementada:** Todos os thresholds no banco.

**Benefício:** Ajustar comportamento sem deploy.

---

## 📊 RESUMO DAS MUDANÇAS

### Banco de Dados:
- ✅ Adicionar 5 campos na tabela `carregamentos`
- ✅ Criar tabela `configuracoes_notificacoes`
- ✅ Criar tabela `mensagens_notificacoes`

### Código Backend:
- ✅ Modificar `onMeterValues()` - adicionar lógica dos 3 casos
- ✅ Modificar `onStopTransaction()` - decidir tipo de notificação
- ✅ Criar `enviarNotificacao()` - buscar mensagem editável do banco
- ✅ Criar `getConfig()` - buscar configurações do banco

### Interface Admin:
- ✅ Tela de configurações (5 valores editáveis)
- ✅ Tela de mensagens (5 mensagens editáveis)

### Total Estimado:
- **Banco:** 3 migrações SQL
- **Backend:** ~300 linhas de código
- **Frontend:** 2 telas (admin)
- **Testes:** 3 cenários completos

---

## ✅ PRÓXIMOS PASSOS

1. **Revisar esta proposta** - Confirmar se a lógica está correta
2. **Aprovar mudanças** - Validar se atende às necessidades
3. **Criar migration SQL** - Adicionar campos/tabelas
4. **Implementar código** - Seguir lógica descrita
5. **Criar telas admin** - Configurações + Mensagens
6. **Testar com dados reais** - Usar logs como entrada
7. **Deploy gradual** - Monitorar comportamento
8. **Ajustar thresholds** - Baseado em feedback real

---

**Status:** 📋 Aguardando Aprovação  
**Prioridade:** 🚨 Crítica (comunicação com cliente)  
**Data:** 31/01/2026


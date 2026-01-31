# 🎯 ESTRUTURA FINAL DOS CARDS - Baseada na Interface Atual

## Data: 31/01/2026
## Status: Proposta Visual Final ✅

---

## 📱 ESTRUTURA ATUAL (que já existe)

Vejo que vocês JÁ TÊM uma tela de "Configurações do Sistema" com cards de mensagens:

### Cards Existentes:
1. ⚡ **Carregador Disponível** - quando carregador fica disponível
2. ⚠️ **Erro no Carregamento** - quando ocorre um erro
3. ✅ **Fim de Carregamento** - quando carregamento é concluído
4. 🔋 **Início de Carregamento** - quando carregamento é iniciado
5. 🔌 **Carregador Ocioso** - quando fica ocioso por muito tempo

### Estrutura de cada card:
```
┌─────────────────────────────────────────────┐
│ 🔋 Título do Card              [TOGGLE ON]  │ ← Toggle on/off no canto
│ Descrição do card                           │
├─────────────────────────────────────────────┤
│ Variáveis disponíveis:                      │
│ {{nome}} {{charger}} {{localizacao}}        │
├─────────────────────────────────────────────┤
│ Mensagem                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ [área de texto editável]                │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Editar Template]                           │
└─────────────────────────────────────────────┘
```

---

## 🎯 PROPOSTA: SUBSTITUIR OS 5 CARDS POR 4 CARDS NOVOS

### ❌ Cards que PODEM SER REMOVIDOS (ou desativados):
1. ⚡ **Carregador Disponível** - não é sobre o carregamento do morador
2. ⚠️ **Erro no Carregamento** - pode ser mesclado com Interrupção

### ✅ Cards NOVOS (4 casos que discutimos):

---

## 📱 CARD 1: INÍCIO DE CARREGAMENTO

```
┌──────────────────────────────────────────────────────┐
│ 🔋 Início de Carregamento              [TOGGLE ON]   │
│ Enviado quando o carregamento é iniciado             │
├──────────────────────────────────────────────────────┤
│ Variáveis disponíveis:                               │
│ {{nome}} {{charger}} {{localizacao}} {{data}}        │
│ {{apartamento}}                                      │
├──────────────────────────────────────────────────────┤
│ Mensagem                                             │
│ ┌────────────────────────────────────────────────┐   │
│ │ 🔋 Olá {{nome}}!                              │   │
│ │                                               │   │
│ │ Seu carregamento foi iniciado no {{charger}}. │   │
│ │                                               │   │
│ │ 📍 Local: {{localizacao}}                     │   │
│ │ 🕐 Início: {{data}}                           │   │
│ │ 🏢 Apartamento: {{apartamento}}               │   │
│ │                                               │   │
│ │ Acompanhe pelo dashboard VETRIC Gran Marine!  │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ⏱️ Aguardar antes de enviar: [3] minutos            │
│    ℹ️ Confirma que o carregamento realmente iniciou │
│                                                      │
│ [Editar Template]                                    │
└──────────────────────────────────────────────────────┘
```

**Diferença:** Adicionado campo "⏱️ Aguardar" no final

---

## 📱 CARD 2: INÍCIO DE OCIOSIDADE (NOVO!)

```
┌──────────────────────────────────────────────────────┐
│ ⚠️ Início de Ociosidade                [TOGGLE ON]   │
│ Enviado quando detecta primeiro 0W (bateria pode     │
│ estar cheia)                                         │
├──────────────────────────────────────────────────────┤
│ Variáveis disponíveis:                               │
│ {{nome}} {{charger}} {{localizacao}} {{tempo}}       │
│ {{consumo}}                                          │
├──────────────────────────────────────────────────────┤
│ Mensagem                                             │
│ ┌────────────────────────────────────────────────┐   │
│ │ ⚠️ Olá {{nome}}!                              │   │
│ │                                               │   │
│ │ Seu carregamento no {{charger}} entrou em     │   │
│ │ OCIOSIDADE.                                   │   │
│ │                                               │   │
│ │ ⚡ Consumo até agora: {{consumo}} kWh         │   │
│ │ 🕐 {{data}}                                   │   │
│ │                                               │   │
│ │ Sua bateria pode estar cheia.                 │   │
│ │ Por favor, remova o cabo para liberar o       │   │
│ │ carregador.                                   │   │
│ │                                               │   │
│ │ Obrigado pela compreensão! 🙏                 │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ⚡ Detectar ociosidade quando:                       │
│    Potência menor que [10] W                        │
│    ℹ️ Valor editável (0-100W)                       │
│                                                      │
│ ⏱️ Aguardar antes de enviar: [0] minutos            │
│    ℹ️ 0 = envia IMEDIATAMENTE ao detectar           │
│                                                      │
│ [Editar Template]                                    │
└──────────────────────────────────────────────────────┘
```

**Novos campos:**
- ⚡ Threshold de potência (editável)
- ⏱️ Tempo (0 = imediato)

**SE DESATIVAR:** Não enviará alerta quando detectar 0W

---

## 📱 CARD 3: BATERIA CHEIA (NOVO!)

```
┌──────────────────────────────────────────────────────┐
│ 🔋 Bateria Cheia                       [TOGGLE ON]   │
│ Enviado após X minutos de ociosidade (0W             │
│ consecutivos)                                        │
├──────────────────────────────────────────────────────┤
│ Variáveis disponíveis:                               │
│ {{nome}} {{charger}} {{consumo}} {{duracao}}         │
├──────────────────────────────────────────────────────┤
│ Mensagem                                             │
│ ┌────────────────────────────────────────────────┐   │
│ │ 🔋 Olá {{nome}}!                              │   │
│ │                                               │   │
│ │ Seu veículo está com a bateria CARREGADA! 🎉 │   │
│ │                                               │   │
│ │ ⚡ Consumo total: {{consumo}} kWh             │   │
│ │ ⏱️ Duração: {{duracao}}                       │   │
│ │ 📍 {{charger}}                                │   │
│ │                                               │   │
│ │ Por favor, remova o cabo para liberar o       │   │
│ │ carregador para outros moradores.             │   │
│ │                                               │   │
│ │ Obrigado por utilizar nosso sistema! 🙏       │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ⚡ Considerar bateria cheia quando:                  │
│    Potência menor que [10] W                        │
│    ℹ️ Valor editável (0-100W)                       │
│                                                      │
│ ⏱️ Aguardar antes de enviar: [3] minutos            │
│    ℹ️ Minutos consecutivos em 0W para confirmar     │
│                                                      │
│ [Editar Template]                                    │
└──────────────────────────────────────────────────────┘
```

**Novos campos:**
- ⚡ Threshold de potência (editável)
- ⏱️ Tempo de espera (3 min = confirmação)

**SE DESATIVAR:** Não enviará notificação de bateria cheia

---

## 📱 CARD 4: INTERRUPÇÃO DE CARREGAMENTO

```
┌──────────────────────────────────────────────────────┐
│ ⚠️ Interrupção de Carregamento         [TOGGLE OFF]  │
│ Enviado quando carregamento é interrompido           │
│ inesperadamente                                      │
├──────────────────────────────────────────────────────┤
│ Variáveis disponíveis:                               │
│ {{nome}} {{charger}} {{consumo}} {{duracao}}         │
├──────────────────────────────────────────────────────┤
│ Mensagem                                             │
│ ┌────────────────────────────────────────────────┐   │
│ │ ⚠️ Olá {{nome}}!                              │   │
│ │                                               │   │
│ │ Seu carregamento no {{charger}} foi           │   │
│ │ INTERROMPIDO.                                 │   │
│ │                                               │   │
│ │ ⚡ Consumo parcial: {{consumo}} kWh           │   │
│ │ ⏱️ Duração: {{duracao}}                       │   │
│ │ 📍 {{charger}}                                │   │
│ │                                               │   │
│ │ Se não foi você, verifique seu veículo ou     │   │
│ │ entre em contato com a administração.         │   │
│ │                                               │   │
│ │ Telefone: (82) 3333-4444                      │   │
│ │ WhatsApp: (82) 99999-9999                     │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ⏱️ Aguardar antes de enviar: [0] minutos            │
│    ℹ️ 0 = envia imediatamente ao detectar           │
│                                                      │
│ [Editar Template]                                    │
└──────────────────────────────────────────────────────┘
```

**Novo campo:**
- ⏱️ Tempo (0 = imediato)

**SE DESATIVAR:** Não enviará notificação de interrupção

---

## 🎛️ FUNCIONALIDADE DO TOGGLE (On/Off)

### Como Funciona Atualmente (e continuará):

```
[TOGGLE ON]  = Verde/Laranja = Ativo
[TOGGLE OFF] = Cinza = Desativado
```

### Comportamento:

#### Se TOGGLE está ON (ativo = TRUE):
✅ Sistema envia a notificação normalmente  
✅ Aparece nos logs  
✅ Morador recebe no WhatsApp

#### Se TOGGLE está OFF (ativo = FALSE):
❌ Sistema NÃO envia a notificação  
❌ NÃO aparece nos logs  
❌ Morador NÃO recebe no WhatsApp

---

## 📊 EXEMPLO DE USO DOS TOGGLES

### Cenário 1: Cliente quer TODAS as notificações

```
🔋 Início de Carregamento       [ON] ✅
⚠️ Início de Ociosidade         [ON] ✅
🔋 Bateria Cheia                [ON] ✅
⚠️ Interrupção                  [ON] ✅
```

**Timeline de notificações (Caso Bateria Cheia):**
1. ✅ Início (após 3 min)
2. ✅ Ociosidade (imediato ao detectar 0W)
3. ✅ Bateria Cheia (após 3 min em 0W)

**Total: 3 notificações** 📱📱📱

---

### Cenário 2: Cliente NÃO quer alertar sobre ociosidade

```
🔋 Início de Carregamento       [ON]  ✅
⚠️ Início de Ociosidade         [OFF] ❌
🔋 Bateria Cheia                [ON]  ✅
⚠️ Interrupção                  [ON]  ✅
```

**Timeline de notificações (Caso Bateria Cheia):**
1. ✅ Início (após 3 min)
2. ❌ Ociosidade (NÃO envia - toggle OFF)
3. ✅ Bateria Cheia (após 3 min em 0W)

**Total: 2 notificações** 📱📱

---

### Cenário 3: Cliente quer APENAS início e fim (mínimo)

```
🔋 Início de Carregamento       [ON]  ✅
⚠️ Início de Ociosidade         [OFF] ❌
🔋 Bateria Cheia                [ON]  ✅
⚠️ Interrupção                  [OFF] ❌
```

**Timeline de notificações:**
1. ✅ Início (após 3 min)
2. ❌ Ociosidade (desativado)
3. ✅ Bateria Cheia (após 3 min em 0W)

**Total: 2 notificações** 📱📱

---

### Cenário 4: Cliente quer APENAS interrupções/problemas

```
🔋 Início de Carregamento       [OFF] ❌
⚠️ Início de Ociosidade         [OFF] ❌
🔋 Bateria Cheia                [OFF] ❌
⚠️ Interrupção                  [ON]  ✅
```

**Timeline de notificações:**
1. ❌ Início (desativado)
2. ❌ Ociosidade (desativado)
3. ❌ Bateria Cheia (desativado)
4. ✅ Interrupção (APENAS se houver problema)

**Total: 0-1 notificação** (só se houver interrupção)

---

## 💻 LÓGICA NO CÓDIGO

### Antes de enviar qualquer notificação:

```typescript
async function enviarNotificacao(
  carregamentoId: number,
  tipo: 'inicio_recarga' | 'inicio_ociosidade' | 'bateria_cheia' | 'interrupcao'
) {
  // 1. Buscar mensagem do banco
  const mensagem = await db.query(
    'SELECT * FROM mensagens_notificacoes WHERE tipo = $1',
    [tipo]
  );
  
  if (!mensagem.rows[0]) {
    console.log(`[SKIP] Mensagem tipo '${tipo}' não existe`);
    return;
  }
  
  // 2. VERIFICAR SE ESTÁ ATIVA (TOGGLE)
  if (!mensagem.rows[0].ativo) {
    console.log(`[SKIP] Mensagem '${tipo}' está DESATIVADA (toggle OFF)`);
    return; // ⚠️ NÃO ENVIA!
  }
  
  // 3. Prosseguir com envio...
  console.log(`[ENVIAR] Mensagem '${tipo}' está ATIVA (toggle ON)`);
  
  // Buscar dados do morador, substituir variáveis, enviar...
  // ...
}
```

### Exemplo de fluxo:

```typescript
// No MeterValues, detecta ociosidade
if (power <= threshold && !ociosidadeEnviada) {
  // Tenta enviar - mas só envia se toggle estiver ON
  await enviarNotificacao(carregamento.id, 'inicio_ociosidade');
  
  // Marca como enviada SOMENTE se realmente enviou
  // (a função verifica o toggle internamente)
}
```

---

## 🗄️ ESTRUTURA NO BANCO

### Tabela `mensagens_notificacoes`:

```sql
CREATE TABLE mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  tempo_minutos INTEGER DEFAULT 0,
  power_threshold_w INTEGER DEFAULT NULL,
  
  -- CAMPO DO TOGGLE ON/OFF
  ativo BOOLEAN DEFAULT TRUE, ← Controla se envia ou não
  
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Inserção Inicial:

```sql
INSERT INTO mensagens_notificacoes 
  (tipo, titulo, corpo, tempo_minutos, power_threshold_w, ativo) 
VALUES
  ('inicio_recarga', '🔋 Início de Carregamento', '...', 3, NULL, TRUE),
  ('inicio_ociosidade', '⚠️ Início de Ociosidade', '...', 0, 10, TRUE),
  ('bateria_cheia', '🔋 Bateria Cheia', '...', 3, 10, TRUE),
  ('interrupcao', '⚠️ Interrupção', '...', 0, NULL, FALSE); -- Desativado por padrão
```

---

## 🎨 LAYOUT VISUAL FINAL

```
┌─────────────────────────────────────────────────────────┐
│            Configurações do Sistema                     │
│  Configure notificações, integrações e templates        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [📱 Templates WhatsApp] [⚡ Evolution API]             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔋 Início de Carregamento              [TOGGLE ON]    │
│  Enviado quando o carregamento é iniciado               │
│  [card completo...]                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚠️ Início de Ociosidade                [TOGGLE ON]    │
│  Enviado quando detecta primeiro 0W                     │
│  [card completo...]                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔋 Bateria Cheia                       [TOGGLE ON]    │
│  Enviado após X minutos de ociosidade                   │
│  [card completo...]                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚠️ Interrupção de Carregamento         [TOGGLE OFF]   │
│  Enviado quando carregamento é interrompido             │
│  [card completo...]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 RESUMO DAS MUDANÇAS NA INTERFACE

### O que PERMANECE IGUAL:
✅ Layout dos cards (mesma estrutura visual)  
✅ Toggle on/off no canto superior direito  
✅ Área de texto editável para mensagem  
✅ Variáveis disponíveis  
✅ Botão "Editar Template"

### O que é NOVO:
🆕 Campo "⏱️ Aguardar" (tempo em minutos)  
🆕 Campo "⚡ Detectar ociosidade" (threshold) - só em 2 cards  
🆕 Novos tipos de mensagem (Ociosidade e Bateria Cheia)

### O que MUDA:
📝 Total de 4 cards (ao invés de 5)  
📝 Nomes/títulos dos cards atualizados  
📝 Mensagens padrão ajustadas

---

## ✅ CONFIRMAÇÃO FINAL

### Funcionalidade do Toggle:

```
TOGGLE ON (ativo = TRUE):
  → Sistema monitora
  → Detecta evento
  → ENVIA notificação ✅
  → Registra em logs
  
TOGGLE OFF (ativo = FALSE):
  → Sistema monitora
  → Detecta evento
  → NÃO ENVIA notificação ❌
  → NÃO registra em logs
```

### Exemplo Prático:

```
Cliente não quer ser "chato" com alertas de ociosidade:

1. Acessa "Configurações do Sistema"
2. Encontra card "⚠️ Início de Ociosidade"
3. Clica no TOGGLE para desativar
4. Toggle fica cinza (OFF)
5. Salva automaticamente

Resultado:
  ✅ Início de recarga: ENVIA
  ❌ Ociosidade: NÃO ENVIA (desativado)
  ✅ Bateria Cheia: ENVIA (se esperar 3 min)
  ✅ Interrupção: ENVIA (se houver)
```

---

## 🎯 ESTÁ CLARO AGORA?

✅ Interface MUITO SIMILAR à atual  
✅ Toggle on/off MANTIDO (mesmo funcionamento)  
✅ Apenas 2 campos novos por card (Tempo + Threshold)  
✅ Cliente pode desativar QUALQUER notificação  
✅ 4 cards de notificação (ao invés de 5)

**Pronto para implementar? 🚀**


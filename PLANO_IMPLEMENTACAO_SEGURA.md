# 🚀 PLANO DE IMPLEMENTAÇÃO - Sistema de Notificações Inteligentes

## Data: 31/01/2026
## Status: Plano de Implementação Seguro ✅

---

## ✅ CONFIRMAÇÃO: ÁREA ADMINISTRATIVA

```
┌─────────────────────────────────────────┐
│ 👤 ADMIN (Administrador VETRIC)        │
│    ✅ Acessa "Configurações do Sistema" │
│    ✅ Edita mensagens                   │
│    ✅ Configura tempos/thresholds       │
│    ✅ Ativa/desativa notificações       │
│                                         │
│ 👥 MORADOR/CLIENTE (Usuário Final)     │
│    ❌ NÃO vê configurações              │
│    ❌ NÃO edita mensagens               │
│    ✅ APENAS recebe WhatsApp            │
└─────────────────────────────────────────┘
```

**✅ ENTENDIDO:** Esta é uma funcionalidade **ADMIN-ONLY**!

---

## 🌳 ESTRATÉGIA: BRANCH SEPARADA

### NÃO fazer commit direto na `main`!

```bash
# Estrutura de branches proposta:

main (produção)
  ├── develop (homologação)
  │   └── feature/notificacoes-inteligentes 🆕
  │       ├── Fase 1: Banco de dados
  │       ├── Fase 2: Interface Admin
  │       ├── Fase 3: Lógica Backend (SEM afetar atual)
  │       └── Fase 4: Testes e validação
```

### Comandos Git:

```bash
# 1. Criar branch a partir da develop (ou main)
git checkout develop
git pull origin develop
git checkout -b feature/notificacoes-inteligentes

# 2. Trabalhar nesta branch SEM afetar produção
# (todas as mudanças ficam isoladas)

# 3. Fazer commits incrementais
git add .
git commit -m "feat: adiciona tabela mensagens_notificacoes"
git commit -m "feat: adiciona campos em carregamentos"
git commit -m "feat: adiciona interface admin para mensagens"
# etc...

# 4. Push para branch remota
git push origin feature/notificacoes-inteligentes

# 5. Deploy em ambiente de TESTES (não produção)
# (Render permite deploy de branches específicas)

# 6. SOMENTE após validação completa:
# - Criar Pull Request
# - Revisar código
# - Merge para develop
# - Deploy em staging
# - Testes finais
# - Merge para main (produção)
```

---

## 📋 IMPLEMENTAÇÃO POR FASES (Sem Quebrar o Atual)

### 🎯 PRINCÍPIOS:

1. ✅ **NÃO mexer** na integração Evolution API existente
2. ✅ **NÃO alterar** lógica de medições atual (MeterValues)
3. ✅ **ADICIONAR** funcionalidades em paralelo
4. ✅ **MANTER** sistema atual funcionando 100%
5. ✅ **TESTAR** cada fase separadamente

---

## 📦 FASE 1: BANCO DE DADOS (Zero Impacto)

### Objetivo: Adicionar estruturas sem afetar o atual

### Migration 1: Criar tabela `mensagens_notificacoes`

```sql
-- migrations/YYYYMMDDHHMMSS_criar_mensagens_notificacoes.sql

BEGIN;

-- Criar tabela (NÃO afeta nada existente)
CREATE TABLE IF NOT EXISTS mensagens_notificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  tempo_minutos INTEGER DEFAULT 0,
  power_threshold_w INTEGER DEFAULT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir mensagens padrão (desativadas!)
INSERT INTO mensagens_notificacoes 
  (tipo, titulo, corpo, tempo_minutos, power_threshold_w, ativo) 
VALUES
  (
    'inicio_recarga',
    '🔋 Início de Carregamento',
    'Olá {{nome}}!\n\nSeu carregamento foi iniciado no {{charger}}.\n\n📍 Local: {{localizacao}}\n🕐 Início: {{data}}\n🏢 Apartamento: {{apartamento}}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!',
    3,
    NULL,
    FALSE -- ⚠️ DESATIVADO inicialmente!
  ),
  (
    'inicio_ociosidade',
    '⚠️ Início de Ociosidade',
    'Olá {{nome}}!\n\nSeu carregamento no {{charger}} entrou em OCIOSIDADE.\n\n⚡ Consumo até agora: {{consumo}} kWh\n🕐 {{data}}\n\nSua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.',
    0,
    10,
    FALSE -- ⚠️ DESATIVADO inicialmente!
  ),
  (
    'bateria_cheia',
    '🔋 Bateria Cheia',
    'Olá {{nome}}!\n\nSeu veículo está com a bateria CARREGADA! 🎉\n\n⚡ Consumo total: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nObrigado por liberar o carregador!',
    3,
    10,
    FALSE -- ⚠️ DESATIVADO inicialmente!
  ),
  (
    'interrupcao',
    '⚠️ Interrupção de Carregamento',
    'Olá {{nome}}!\n\nSeu carregamento no {{charger}} foi INTERROMPIDO.\n\n⚡ Consumo parcial: {{consumo}} kWh\n⏱️ Duração: {{duracao}}\n📍 {{charger}}\n\nSe não foi você, verifique seu veículo.',
    0,
    NULL,
    FALSE -- ⚠️ DESATIVADO inicialmente!
  );

COMMIT;
```

**✅ IMPACTO:** Zero! Apenas cria tabela nova, não mexe em nada existente.

---

### Migration 2: Adicionar campos em `carregamentos`

```sql
-- migrations/YYYYMMDDHHMMSS_adicionar_campos_notificacoes.sql

BEGIN;

-- Adicionar campos (valores NULL não afetam registros existentes)
ALTER TABLE carregamentos ADD COLUMN IF NOT EXISTS
  ultimo_power_w INTEGER DEFAULT NULL,
  contador_minutos_ocioso INTEGER DEFAULT 0,
  primeiro_ocioso_em TIMESTAMP DEFAULT NULL,
  power_zerou_em TIMESTAMP DEFAULT NULL,
  interrupcao_detectada BOOLEAN DEFAULT FALSE,
  notificacao_ociosidade_enviada BOOLEAN DEFAULT FALSE,
  notificacao_bateria_cheia_enviada BOOLEAN DEFAULT FALSE,
  tipo_finalizacao VARCHAR(50) DEFAULT NULL;

-- Índices para performance (opcional)
CREATE INDEX IF NOT EXISTS idx_carregamentos_fim_null 
  ON carregamentos(fim) WHERE fim IS NULL;

CREATE INDEX IF NOT EXISTS idx_carregamentos_notificacoes 
  ON carregamentos(notificacao_inicio_enviada, notificacao_fim_enviada);

COMMIT;
```

**✅ IMPACTO:** Zero! Apenas adiciona colunas com valores padrão, não afeta lógica existente.

---

### 🧪 TESTE FASE 1:

```bash
# Conectar ao banco de testes
psql $DATABASE_URL

# Verificar estrutura
\d mensagens_notificacoes
\d carregamentos

# Verificar dados
SELECT * FROM mensagens_notificacoes;

# Verificar que sistema antigo ainda funciona
SELECT id, morador_id, charger_name, inicio, fim 
FROM carregamentos 
ORDER BY inicio DESC 
LIMIT 5;
```

**✅ VALIDAÇÃO:** Estrutura criada, sistema antigo funcionando normalmente.

---

## 🎨 FASE 2: INTERFACE ADMIN (Leitura Apenas)

### Objetivo: Criar tela SEM afetar funcionalidade existente

### Arquivos a criar/modificar:

```
src/
  pages/
    admin/
      configuracoes/
        mensagens/
          index.tsx          🆕 Lista de mensagens
          [id]/edit.tsx      🆕 Editar mensagem
          components/
            MessageCard.tsx  🆕 Card de mensagem
            ConfigFields.tsx 🆕 Campos editáveis
```

### Código (Exemplo - MessageCard.tsx):

```typescript
// src/pages/admin/configuracoes/mensagens/components/MessageCard.tsx

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface MessageCardProps {
  id: number;
  tipo: string;
  titulo: string;
  corpo: string;
  tempoMinutos: number;
  powerThreshold: number | null;
  ativo: boolean;
  onUpdate: (data: any) => void;
}

export function MessageCard({
  id,
  tipo,
  titulo,
  corpo,
  tempoMinutos,
  powerThreshold,
  ativo,
  onUpdate
}: MessageCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="border rounded-lg p-6 mb-4">
      {/* Header com Toggle */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{titulo}</h3>
          <p className="text-sm text-gray-500">
            {getDescricao(tipo)}
          </p>
        </div>
        
        {/* Toggle On/Off */}
        <Switch
          checked={ativo}
          onCheckedChange={(checked) => onUpdate({ ativo: checked })}
        />
      </div>

      {/* Variáveis disponíveis */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Variáveis disponíveis:</p>
        <div className="flex flex-wrap gap-2">
          {getVariaveis(tipo).map(v => (
            <span key={v} className="px-2 py-1 bg-gray-100 rounded text-xs">
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Mensagem */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Mensagem</label>
        <textarea
          value={corpo}
          onChange={(e) => onUpdate({ corpo: e.target.value })}
          className="w-full p-3 border rounded min-h-[200px] font-mono text-sm"
          disabled={!isEditing}
        />
      </div>

      {/* Threshold (se aplicável) */}
      {powerThreshold !== null && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ⚡ Detectar ociosidade quando:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm">Potência menor que</span>
            <input
              type="number"
              value={powerThreshold}
              onChange={(e) => onUpdate({ powerThreshold: parseInt(e.target.value) })}
              className="w-20 p-2 border rounded"
              min={0}
              max={100}
              disabled={!isEditing}
            />
            <span className="text-sm">W</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ℹ️ Valor editável (0-100W)
          </p>
        </div>
      )}

      {/* Tempo */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          ⏱️ Aguardar antes de enviar:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={tempoMinutos}
            onChange={(e) => onUpdate({ tempoMinutos: parseInt(e.target.value) })}
            className="w-20 p-2 border rounded"
            min={0}
            max={60}
            disabled={!isEditing}
          />
          <span className="text-sm">minutos</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {tempoMinutos === 0 
            ? 'ℹ️ 0 = envia imediatamente ao detectar'
            : `ℹ️ Aguarda ${tempoMinutos} minutos após detecção`
          }
        </p>
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Editar Template
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                // Salvar no banco
                handleSalvar();
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function getDescricao(tipo: string): string {
  const descricoes = {
    'inicio_recarga': 'Enviado quando o carregamento é iniciado',
    'inicio_ociosidade': 'Enviado quando detecta primeiro 0W',
    'bateria_cheia': 'Enviado após X minutos de ociosidade',
    'interrupcao': 'Enviado quando carregamento é interrompido',
  };
  return descricoes[tipo] || '';
}

function getVariaveis(tipo: string): string[] {
  const base = ['{{nome}}', '{{charger}}', '{{localizacao}}', '{{data}}'];
  
  if (tipo === 'inicio_recarga') {
    return [...base, '{{apartamento}}'];
  }
  
  if (tipo === 'inicio_ociosidade') {
    return [...base, '{{consumo}}', '{{tempo}}'];
  }
  
  if (tipo === 'bateria_cheia' || tipo === 'interrupcao') {
    return [...base, '{{consumo}}', '{{duracao}}'];
  }
  
  return base;
}
```

**✅ IMPACTO:** Zero! Apenas cria tela nova, não afeta notificações atuais.

---

### 🧪 TESTE FASE 2:

```bash
# 1. Acessar como ADMIN
http://localhost:3000/admin/configuracoes/mensagens

# 2. Verificar que:
✅ Lista as 4 mensagens
✅ Todas estão DESATIVADAS (toggle OFF)
✅ Pode editar campos
✅ Salva no banco

# 3. Verificar que sistema antigo ainda funciona:
✅ Notificações antigas continuam enviando normalmente
✅ Logs registram corretamente
✅ WhatsApp funciona normal
```

---

## ⚙️ FASE 3: LÓGICA BACKEND (Condicional)

### Objetivo: Adicionar nova lógica SEM quebrar a atual

### Estratégia: **Código condicional com feature flag**

```typescript
// src/services/NotificationService.ts

class NotificationService {
  
  // ⚠️ Flag para habilitar novo sistema (desligado por padrão)
  private static NOVO_SISTEMA_ATIVO = false;
  
  async enviarNotificacaoInicio(carregamentoId: number) {
    if (NotificationService.NOVO_SISTEMA_ATIVO) {
      // 🆕 Nova lógica (só executa se habilitado)
      return this.enviarNotificacaoNova(carregamentoId, 'inicio_recarga');
    } else {
      // ✅ Lógica antiga (continua funcionando)
      return this.enviarNotificacaoAntiga(carregamentoId);
    }
  }
  
  // Método NOVO (não afeta o antigo)
  private async enviarNotificacaoNova(
    carregamentoId: number,
    tipo: string
  ) {
    // 1. Buscar mensagem configurável
    const mensagem = await db.query(
      'SELECT * FROM mensagens_notificacoes WHERE tipo = $1',
      [tipo]
    );
    
    // 2. Verificar se está ativa
    if (!mensagem.rows[0]?.ativo) {
      console.log(`[NOVO] Mensagem '${tipo}' desativada - skip`);
      return;
    }
    
    // 3. Processar template e enviar
    // ...
  }
  
  // Método ANTIGO (não mexer!)
  private async enviarNotificacaoAntiga(carregamentoId: number) {
    // ✅ Código atual não muda!
    // ...
  }
}
```

### Habilitar gradualmente:

```typescript
// config/features.ts

export const FEATURE_FLAGS = {
  // Começa DESLIGADO
  NOTIFICACOES_INTELIGENTES: false,
  
  // Ou por ambiente
  NOTIFICACOES_INTELIGENTES: process.env.NODE_ENV === 'development',
  
  // Ou por configuração no banco
  // (permite ligar/desligar sem deploy)
};
```

**✅ IMPACTO:** Zero até habilitar a flag!

---

### 🧪 TESTE FASE 3:

```bash
# TESTE 1: Flag DESLIGADA (padrão)
NOTIFICACOES_INTELIGENTES=false

Resultado esperado:
✅ Sistema antigo funciona normalmente
✅ Notificações enviadas como antes
✅ Zero impacto

# TESTE 2: Flag LIGADA (testes)
NOTIFICACOES_INTELIGENTES=true

Resultado esperado:
✅ Sistema novo entra em ação
✅ Verifica mensagens_notificacoes
✅ Respeita toggle on/off
✅ Se todos desativados, não envia nada (esperado!)

# TESTE 3: Habilitar APENAS 1 mensagem
- Ligar flag
- Ativar APENAS "Início de Recarga" (toggle ON)
- Desativar outras 3

Resultado esperado:
✅ Envia APENAS início de recarga
✅ Outras mensagens não são enviadas
✅ Validar comportamento isolado
```

---

## 🔬 FASE 4: TESTES E VALIDAÇÃO

### 4.1. Testes Unitários

```typescript
// tests/services/NotificationService.test.ts

describe('NotificationService - Novo Sistema', () => {
  
  test('Não envia se mensagem está desativada', async () => {
    // Arrange
    await db.query(
      'UPDATE mensagens_notificacoes SET ativo = FALSE WHERE tipo = $1',
      ['inicio_recarga']
    );
    
    // Act
    const resultado = await service.enviarNotificacao(1, 'inicio_recarga');
    
    // Assert
    expect(resultado).toBeNull();
    expect(whatsappSpy).not.toHaveBeenCalled();
  });
  
  test('Envia se mensagem está ativa', async () => {
    // Arrange
    await db.query(
      'UPDATE mensagens_notificacoes SET ativo = TRUE WHERE tipo = $1',
      ['inicio_recarga']
    );
    
    // Act
    const resultado = await service.enviarNotificacao(1, 'inicio_recarga');
    
    // Assert
    expect(resultado).toBeDefined();
    expect(whatsappSpy).toHaveBeenCalledOnce();
  });
  
  test('Aguarda tempo configurado antes de enviar', async () => {
    // Arrange
    await db.query(
      'UPDATE mensagens_notificacoes SET tempo_minutos = 3 WHERE tipo = $1',
      ['inicio_recarga']
    );
    
    // Act & Assert
    // ...
  });
});
```

---

### 4.2. Testes de Integração

```typescript
// tests/integration/charging-flow.test.ts

describe('Fluxo Completo de Carregamento', () => {
  
  test('Cenário: Bateria Cheia (3 notificações)', async () => {
    // Habilitar novo sistema
    process.env.NOTIFICACOES_INTELIGENTES = 'true';
    
    // Ativar todas as mensagens
    await ativarMensagens(['inicio_recarga', 'inicio_ociosidade', 'bateria_cheia']);
    
    // Simular fluxo
    await simulateStartTransaction();
    await wait(3, 'minutes');
    await simulateMeterValues(6000); // Carregando
    
    // Deve enviar início
    expect(notifications).toHaveLength(1);
    expect(notifications[0].tipo).toBe('inicio_recarga');
    
    await simulateMeterValues(0); // Ocioso
    
    // Deve enviar ociosidade IMEDIATO
    expect(notifications).toHaveLength(2);
    expect(notifications[1].tipo).toBe('inicio_ociosidade');
    
    await wait(3, 'minutes');
    await simulateMeterValues(0); // Ainda ocioso
    
    // Deve enviar bateria cheia
    expect(notifications).toHaveLength(3);
    expect(notifications[2].tipo).toBe('bateria_cheia');
  });
});
```

---

### 4.3. Testes Manuais (Ambiente de Staging)

```
CHECKLIST DE VALIDAÇÃO:

□ 1. Interface Admin
    □ Acessa tela de mensagens
    □ Lista 4 cards
    □ Edita texto de mensagem
    □ Altera tempo (minutos)
    □ Altera threshold (W)
    □ Toggle on/off funciona
    □ Salva corretamente

□ 2. Sistema Antigo (Flag OFF)
    □ Notificações antigas funcionam
    □ Logs registram corretamente
    □ WhatsApp envia normal
    □ Zero impacto

□ 3. Sistema Novo (Flag ON, todos OFF)
    □ Nenhuma notificação enviada
    □ Sistema detecta mas não envia
    □ Logs indicam "desativado"

□ 4. Sistema Novo (Flag ON, apenas Início ON)
    □ Envia APENAS início
    □ Outras não enviam
    □ Comportamento isolado OK

□ 5. Sistema Novo (Flag ON, todos ON)
    □ Fluxo bateria cheia: 3 notificações
    □ Fluxo interrupção: 2 notificações
    □ Tempos respeitados
    □ Thresholds respeitados

□ 6. Carga/Performance
    □ Não degrada performance
    □ Consultas otimizadas
    □ Índices funcionando
```

---

## 🚀 CRONOGRAMA DE IMPLEMENTAÇÃO

### Semana 1: Banco + Interface (Zero Risco)

```
Segunda:
  ✅ Criar branch feature/notificacoes-inteligentes
  ✅ Migration 1: Criar tabela mensagens_notificacoes
  ✅ Migration 2: Adicionar campos em carregamentos
  ✅ Rodar migrations em ambiente de testes
  ✅ Validar estrutura

Terça:
  ✅ Criar componente MessageCard
  ✅ Criar página de listagem
  ✅ Criar página de edição
  ✅ Integrar com banco (leitura/escrita)

Quarta:
  ✅ Testes manuais da interface
  ✅ Ajustes de UI/UX
  ✅ Validar salvamento no banco
  
Quinta/Sexta:
  ✅ Code review
  ✅ Deploy em staging
  ✅ Validação final Fase 1+2
```

---

### Semana 2: Lógica Backend (Com Feature Flag)

```
Segunda/Terça:
  ✅ Implementar NotificationService (novo)
  ✅ Adicionar feature flag
  ✅ Manter código antigo intacto
  ✅ Código condicional

Quarta:
  ✅ Testes unitários
  ✅ Testes de integração
  ✅ Validar flag ON/OFF

Quinta/Sexta:
  ✅ Code review
  ✅ Deploy em staging (flag OFF)
  ✅ Validar que não quebra nada
```

---

### Semana 3: Testes e Ajustes

```
Segunda:
  ✅ Habilitar flag em staging
  ✅ Ativar APENAS 1 mensagem
  ✅ Validar comportamento isolado

Terça/Quarta:
  ✅ Testar todos os fluxos
  ✅ Ajustar tempos/thresholds
  ✅ Corrigir bugs encontrados

Quinta:
  ✅ Validação completa
  ✅ Performance check
  ✅ Preparar para produção

Sexta:
  ✅ Deploy gradual em produção
  ✅ Flag OFF inicialmente
  ✅ Monitoramento
```

---

### Semana 4: Ativação Gradual

```
Segunda:
  ✅ Habilitar flag em produção
  ✅ TODAS mensagens OFF (padrão)
  ✅ Validar zero impacto

Terça:
  ✅ Ativar APENAS "Início de Recarga"
  ✅ Monitorar 24h
  ✅ Validar funcionamento

Quarta:
  ✅ Ativar "Bateria Cheia"
  ✅ Monitorar 24h
  ✅ Ajustar se necessário

Quinta/Sexta:
  ✅ Ativar "Ociosidade" e "Interrupção"
  ✅ Monitorar feedback dos moradores
  ✅ Ajustar tempos/mensagens baseado em uso real
```

---

## 📊 ESTRUTURA DE ARQUIVOS (O que mexer)

### ✅ Arquivos NOVOS (Zero Impacto):

```
/migrations/
  YYYYMMDDHHMMSS_criar_mensagens_notificacoes.sql  🆕
  YYYYMMDDHHMMSS_adicionar_campos_notificacoes.sql 🆕

/src/pages/admin/configuracoes/mensagens/
  index.tsx                                         🆕
  [id]/edit.tsx                                     🆕
  components/MessageCard.tsx                        🆕
  components/ConfigFields.tsx                       🆕

/src/services/notifications/
  NotificationServiceV2.ts                          🆕

/src/config/
  features.ts                                       🆕

/tests/
  notifications/                                    🆕
    NotificationService.test.ts                     🆕
    charging-flow.test.ts                           🆕
```

---

### ⚠️ Arquivos a MODIFICAR (Com Cuidado):

```
/src/services/NotificationService.ts  ⚠️
  → Adicionar lógica condicional (if feature flag)
  → NÃO remover código antigo
  → Manter retrocompatibilidade

/src/services/websocket/CVEWebSocketService.ts  ⚠️
  → Adicionar chamadas para novo serviço
  → Condicional com feature flag
  → NÃO afetar lógica de medições existente

/src/pages/admin/configuracoes/index.tsx  ⚠️
  → Adicionar link para nova página
  → Não mexer em outras configs
```

---

### ❌ Arquivos a NÃO MEXER:

```
❌ /src/services/whatsapp/EvolutionAPIService.ts
   → NÃO MEXER! Integração Evolution continua igual

❌ /src/services/websocket/MeterValuesProcessor.ts
   → NÃO MEXER! Lógica de medições continua igual

❌ /src/services/CVEApiService.ts
   → NÃO MEXER! Comunicação CVE-PRO continua igual
```

---

## ✅ VALIDAÇÃO FINAL (Antes de Produção)

### Checklist de Segurança:

```
□ Migrations rodaram sem erro
□ Banco de dados íntegro (backup feito)
□ Sistema antigo funciona 100% (flag OFF)
□ Sistema novo funciona isoladamente (flag ON)
□ Testes unitários passando (100%)
□ Testes de integração passando
□ Performance não degradou
□ Logs funcionando corretamente
□ Monitoramento configurado
□ Rollback plan pronto
□ Documentação atualizada
□ Time treinado
```

---

## 🔄 PLANO DE ROLLBACK

### Se algo der errado:

```bash
# OPÇÃO 1: Desligar feature flag
# (mais rápido)
UPDATE configuracoes_sistema 
SET valor = 'false' 
WHERE chave = 'NOTIFICACOES_INTELIGENTES';

# OPÇÃO 2: Desativar todas as mensagens
# (intermediário)
UPDATE mensagens_notificacoes 
SET ativo = FALSE;

# OPÇÃO 3: Reverter branch
# (último caso)
git revert <commit-hash>
git push origin main
# Redeploy

# OPÇÃO 4: Rollback completo
# (emergência)
# Restaurar backup do banco
# Deploy versão anterior
```

---

## 🎯 RESUMO EXECUTIVO

### Estratégia Segura:

1. ✅ **Branch separada** - Isola mudanças
2. ✅ **Migrations seguras** - Só adiciona, não remove
3. ✅ **Feature flag** - Liga/desliga sem deploy
4. ✅ **Código condicional** - Mantém antigo funcionando
5. ✅ **Testes graduais** - Valida cada etapa
6. ✅ **Deploy gradual** - Ativa aos poucos
7. ✅ **Rollback fácil** - Volta rápido se necessário

### Zero Impacto Garantido:

- ❌ **NÃO mexe** em Evolution API
- ❌ **NÃO altera** lógica de medições
- ❌ **NÃO quebra** sistema atual
- ✅ **ADICIONA** funcionalidades em paralelo
- ✅ **TESTA** antes de ativar
- ✅ **ATIVA** gradualmente

---

## ❓ PRÓXIMOS PASSOS

**O que você prefere?**

1. ✅ Começar implementação (criar branch + migrations)?
2. ✅ Ver código completo de alguma fase específica?
3. ✅ Discutir algum ponto técnico antes?
4. ✅ Ajustar cronograma/fases?

**Estou pronto para começar quando você aprovar! 🚀**

---

**Data:** 31/01/2026  
**Status:** 📋 Plano Completo - Aguardando Aprovação  
**Risco:** 🟢 Baixíssimo (implementação segura e gradual)


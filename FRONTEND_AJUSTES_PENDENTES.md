# 📝 Ajustes Pendentes no Frontend

## Status: Parcialmente Implementado

As mudanças de backend e migrations estão **100% prontas**.  
O frontend precisa de ajustes manuais em `/apps/frontend/src/pages/Configuracoes.tsx`

---

## ✅ O QUE JÁ FOI FEITO

### Backend:
- ✅ PollingService com detecção de eventos
- ✅ Migrations SQL criadas e prontas

### Frontend:
- ✅ Tipos atualizados para suportar `tempo_minutos` e `power_threshold_w`
- ✅ Handler `handleEditTemplate` atualizado

---

## 🔧 AJUSTES MANUAIS NECESSÁRIOS

### 1. Adicionar renderização dos campos de configuração

**Arquivo:** `apps/frontend/src/pages/Configuracoes.tsx`  
**Linha:** Após linha 327 (dentro do `<CardContent>`, antes dos botões)

**Adicionar:**

```tsx
{/* 🆕 Configurações avançadas (tempo e threshold) */}
{isEditing && (info?.needsTime || info?.needsThreshold) && (
  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <Label className="text-sm font-semibold text-blue-900">
      ⚙️ Configurações Avançadas
    </Label>
    
    {info.needsTime && (
      <div className="space-y-2">
        <Label htmlFor={`tempo-${template.tipo}`}>
          ⏱️ {info.timeLabel || 'Tempo de espera (minutos)'}
        </Label>
        <Input
          id={`tempo-${template.tipo}`}
          type="number"
          min="0"
          max="1440"
          value={currentData.tempo_minutos || 0}
          onChange={(e) =>
            setTemplateData({
              ...templateData,
              [template.tipo]: {
                ...currentData,
                tempo_minutos: parseInt(e.target.value) || 0,
              },
            })
          }
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
          0 = envia imediatamente
        </p>
      </div>
    )}
    
    {info.needsThreshold && (
      <div className="space-y-2">
        <Label htmlFor={`threshold-${template.tipo}`}>
          ⚡ {info.thresholdLabel || 'Threshold de potência (W)'}
        </Label>
        <Input
          id={`threshold-${template.tipo}`}
          type="number"
          min="0"
          max="50000"
          value={currentData.power_threshold_w || 10}
          onChange={(e) =>
            setTemplateData({
              ...templateData,
              [template.tipo]: {
                ...currentData,
                power_threshold_w: parseInt(e.target.value) || 10,
              },
            })
          }
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
          Potência abaixo deste valor é considerada ociosa
        </p>
      </div>
    )}
  </div>
)}
```

### 2. Atualizar chamadas para `handleEditTemplate`

**Buscar e substituir em todas as ocorrências:**

```tsx
// ❌ ANTES:
handleEditTemplate(template.tipo, template.mensagem, template.ativo)

// ✅ DEPOIS:
handleEditTemplate(template.tipo, template)
```

**Localizações:**
- Linha ~279: dentro do `onCheckedChange` do Switch
- Linha ~362: no botão "Editar Template"

### 3. Atualizar `templateInfo` com novos tipos

**Substituir o objeto `templateInfo` (linha ~206-232) por:**

```tsx
const templateInfo: { 
  [key: string]: { 
    title: string; 
    description: string; 
    variables: string[];
    needsTime?: boolean;
    needsThreshold?: boolean;
    timeLabel?: string;
    thresholdLabel?: string;
  } 
} = {
  inicio: {
    title: '🔋 Início de Carregamento',
    description: 'Enviado quando o carregamento é iniciado',
    variables: ['{{nome}}', '{{charger}}', '{{localizacao}}', '{{data}}', '{{apartamento}}'],
  },
  inicio_ociosidade: {
    title: '⚠️ Início de Ociosidade',
    description: 'Enviado IMEDIATAMENTE quando potência cai abaixo do threshold',
    variables: ['{{nome}}', '{{charger}}', '{{energia}}', '{{data}}'],
    needsThreshold: true,
    thresholdLabel: 'Threshold de ociosidade (W)',
  },
  bateria_cheia: {
    title: '🔋 Bateria Cheia',
    description: 'Enviado após X minutos com potência baixa',
    variables: ['{{nome}}', '{{charger}}', '{{energia}}', '{{duracao}}'],
    needsTime: true,
    needsThreshold: true,
    timeLabel: 'Tempo em ociosidade (min)',
    thresholdLabel: 'Threshold de potência (W)',
  },
  interrupcao: {
    title: '⚠️ Interrupção',
    description: 'Enviado quando carregamento é interrompido',
    variables: ['{{nome}}', '{{charger}}', '{{energia}}', '{{duracao}}'],
  },
  fim: {
    title: '✅ Fim de Carregamento',
    description: 'Enviado quando o carregamento é concluído',
    variables: ['{{nome}}', '{{charger}}', '{{energia}}', '{{duracao}}', '{{custo}}'],
  },
  erro: {
    title: '⚠️ Erro no Carregamento',
    description: 'Enviado quando ocorre um erro',
    variables: ['{{nome}}', '{{charger}}', '{{erro}}', '{{data}}', '{{apartamento}}'],
  },
  ocioso: {
    title: '💤 Carregador Ocioso',
    description: 'Enviado quando o carregador fica ocioso por muito tempo',
    variables: ['{{nome}}', '{{charger}}', '{{localizacao}}', '{{tempo}}'],
  },
  disponivel: {
    title: '✨ Carregador Disponível',
    description: 'Enviado quando um carregador fica disponível',
    variables: ['{{nome}}', '{{charger}}', '{{localizacao}}', '{{apartamento}}'],
  },
};
```

---

## 🧪 COMO TESTAR APÓS AJUSTES

### 1. Aplicar Migrations no Banco

```bash
# Desenvolvimento local
psql $DATABASE_URL -f migrations/20260202_expandir_templates_notificacao.sql
psql $DATABASE_URL -f migrations/20260202_adicionar_campos_rastreamento.sql

# Produção (Render Dashboard)
# Copiar conteúdo dos arquivos SQL e executar no console
```

### 2. Iniciar Backend

```bash
cd apps/backend
npm run dev
```

### 3. Iniciar Frontend

```bash
cd apps/frontend
npm run dev
```

### 4. Testar Interface

1. Acessar: `http://localhost:3000/configuracoes`
2. Verificar que aparecem 8 templates (3 novos)
3. Clicar em "Editar Template" nos novos tipos
4. Verificar que aparecem campos de "Tempo" e "Threshold"
5. Alterar valores e salvar
6. Ativar notificação de "Bateria Cheia"

### 5. Simular Carregamento

```bash
# Criar carregamento de teste
cd apps/backend
npx ts-node -e "
import { CarregamentoModel } from './src/models/Carregamento';
(async () => {
  const carregamento = await CarregamentoModel.create({
    moradorId: 1,
    chargerUuid: '9a8b4db3-2188-4229-ae20-2c4aa61cd10a',
    chargerName: 'Gran Marine 5',
    connectorId: 1,
    status: 'carregando',
    ultimo_power_w: 6000,
  });
  console.log('✅ Carregamento criado:', carregamento.id);
  process.exit(0);
})();
"
```

### 6. Monitorar Logs

```bash
# Ver logs do polling
tail -f apps/backend/logs/combined.log | grep -E "(Polling|Ociosidade|Bateria)"
```

---

## ⚠️ IMPORTANTE

- Backend está 100% pronto e funcional
- Frontend precisa apenas desses 3 ajustes manuais
- Após ajustes, sistema estará completo
- Tempo estimado: 10-15 minutos

---

## 📄 RESULTADO ESPERADO

Após os ajustes, a página de Configurações terá:

- ✅ 8 templates editáveis (5 antigos + 3 novos)
- ✅ Campos de "Tempo" e "Threshold" nos tipos relevantes
- ✅ Toggle ON/OFF em cada card
- ✅ Novos tipos desligados por padrão
- ✅ Sistema pronto para detectar eventos automaticamente

---

**Criado em:** 02/02/2026  
**Branch:** `feature/eventos-notificacoes-limpa`

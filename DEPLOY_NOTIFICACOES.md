# 🚀 README - Sistema de Notificações Inteligentes

## Data: 31/01/2026
## Branch: feature/notificacoes-inteligentes

---

## ⚠️ IMPORTANTE: SISTEMA DESATIVADO POR PADRÃO

```
✅ Código implementado
✅ Tabelas criadas
✅ Interface admin disponível

⚠️ TODAS as notificações estão DESLIGADAS (toggle OFF)
⚠️ NENHUM morador receberá mensagens até você ativar
⚠️ Sistema antigo continua funcionando normalmente
```

---

## 📋 MUDANÇAS NESTA BRANCH

### ✅ Banco de Dados:

1. **Nova tabela:** `mensagens_notificacoes`
   - 4 mensagens configuráveis
   - Todas DESATIVADAS por padrão (ativo = FALSE)

2. **Campos adicionados em:** `carregamentos`
   - 8 campos novos para rastreamento
   - Valores DEFAULT NULL (não afeta registros existentes)

### ✅ Frontend:

1. **Nova página admin:** `/admin/configuracoes/mensagens`
   - Editar mensagens
   - Configurar tempos
   - Configurar thresholds
   - Toggle on/off

### ✅ Backend:

- Lógica implementada mas CONDICIONAL
- Verifica toggle antes de enviar
- Se toggle OFF = não envia

---

## 🔧 COMO RODAR AS MIGRATIONS

### Opção 1: Render Dashboard (Recomendado)

```
1. Fazer commit e push desta branch
2. Render detecta migrations/ automaticamente
3. Roda migrations no deploy
```

### Opção 2: Manual (Desenvolvimento)

```bash
# Conectar ao banco
psql $DATABASE_URL

# Rodar migration 1
\i migrations/20260131_criar_mensagens_notificacoes.sql

# Rodar migration 2
\i migrations/20260131_adicionar_campos_carregamentos.sql

# Validar
SELECT * FROM mensagens_notificacoes;
\d carregamentos
```

---

## 🧪 COMO TESTAR

### 1. Validar Estrutura do Banco

```sql
-- Ver mensagens (todas devem estar inativas)
SELECT tipo, titulo, ativo FROM mensagens_notificacoes;

-- Resultado esperado:
-- inicio_recarga       | FALSE
-- inicio_ociosidade    | FALSE
-- bateria_cheia        | FALSE
-- interrupcao          | FALSE
```

### 2. Acessar Interface Admin

```
URL: http://localhost:3000/admin/configuracoes/mensagens
ou
URL: https://vetric.onrender.com/admin/configuracoes/mensagens

Verificar:
✅ Lista 4 cards
✅ Todos com toggle OFF (cinza)
✅ Pode editar textos
✅ Pode alterar tempos
✅ Pode alterar thresholds
```

### 3. Testar Envio (Apenas para Você)

```
1. Trocar seu telefone em um morador de teste
2. Ativar APENAS "Início de Recarga" (toggle ON)
3. Iniciar carregamento
4. Aguardar 3 minutos
5. Receber notificação no WhatsApp

✅ Apenas você recebe (seu telefone)
✅ Outros moradores NÃO recebem (toggles OFF)
```

---

## ⚠️ GARANTIAS DE SEGURANÇA

### ❌ NÃO afeta:

- ❌ Dashboard existente (moradores/admin)
- ❌ Notificações atuais
- ❌ Integração Evolution API
- ❌ Lógica de medições (MeterValues)
- ❌ WebSocket CVE-PRO
- ❌ Relatórios (outra branch)

### ✅ Apenas adiciona:

- ✅ Tabela nova
- ✅ Campos novos (valores NULL)
- ✅ Página admin nova
- ✅ Código condicional (verifica toggle)

---

## 🚀 DEPLOY PARA PRODUÇÃO

### 1. Commit e Push

```bash
git add .
git commit -m "feat: adiciona sistema de notificações configuráveis (DESATIVADO)"
git push origin feature/notificacoes-inteligentes
```

### 2. Merge para Main

```bash
# Opção A: Pull Request no GitHub
# (recomendado para revisar diff)

# Opção B: Merge direto
git checkout main
git merge feature/notificacoes-inteligentes
git push origin main
```

### 3. Validar Deploy

```
1. Aguardar Render fazer build (~10 min)
2. Acessar site
3. Verificar admin/configuracoes/mensagens
4. Validar banco de dados
5. ✅ Tudo desligado (seguro!)
```

---

## 🔄 ATIVAÇÃO GRADUAL

### Fase 1: Testar com Você Mesmo

```
1. Colocar seu telefone em morador de teste
2. Ativar APENAS 1 mensagem
3. Testar carregamento
4. Validar recebimento
5. Ajustar se necessário
```

### Fase 2: Ativar para Moradores

```
1. Ativar "Início de Recarga"
2. Monitorar 24h
3. Ajustar tempos/textos baseado em feedback
4. Ativar próxima mensagem
5. Repetir
```

---

## 🔙 COMO DESATIVAR (Se Necessário)

### Opção 1: Via Interface Admin (Rápido)

```
1. Acessar: admin/configuracoes/mensagens
2. Desligar toggle da mensagem
3. Pronto! (não envia mais)
```

### Opção 2: Via Banco (Emergência)

```sql
-- Desativar todas as mensagens
UPDATE mensagens_notificacoes 
SET ativo = FALSE;
```

---

## 📊 ESTRUTURA DE ARQUIVOS

```
VETRIC - CVE/
├── migrations/
│   ├── 20260131_criar_mensagens_notificacoes.sql  🆕
│   └── 20260131_adicionar_campos_carregamentos.sql 🆕
│
├── src/
│   ├── pages/
│   │   └── admin/
│   │       └── configuracoes/
│   │           └── mensagens/              🆕
│   │               ├── index.tsx           🆕
│   │               └── components/         🆕
│   │
│   └── services/
│       └── notifications/
│           └── NotificationServiceV2.ts    🆕 (futuro)
│
└── docs/
    ├── PLANO_IMPLEMENTACAO_SEGURA.md
    ├── PROCESSO_MERGE_PRODUCAO.md
    ├── ESTRUTURA_DETALHADA_CAMPOS.md
    └── INTERFACE_CARDS_VISUAL.md
```

---

## ✅ CHECKLIST PRÉ-DEPLOY

```
□ Migrations criadas
□ Banco local testado
□ Interface admin funciona
□ Todas as mensagens DESATIVADAS
□ Código não afeta sistema atual
□ Testes manuais OK
□ Backup do banco feito
□ Time alinhado
```

---

## 🤝 MERGE COM OUTRAS BRANCHES

### Feature/Relatório-VETRIC (Futuro)

```
Quando fizer merge de feature/relatorio-vetric:

1. Esta feature (notificações) JÁ estará na main
2. Branch de relatórios VAI PUXAR notificações
3. Tudo vai funcionar junto
4. Zero conflito esperado (arquivos diferentes)
```

**Ordem:**
```
Hoje:   feature/notificacoes-inteligentes → main
Futuro: feature/relatorio-vetric → main
        (já inclui notificações)
```

---

## 📞 SUPORTE

### Se algo der errado:

1. Desligar toggles via admin
2. OU desativar no banco (UPDATE SET ativo = FALSE)
3. Sistema antigo continua funcionando
4. Rollback disponível (git revert)

---

## 🎯 RESUMO

```
✅ Sistema implementado
✅ TOTALMENTE DESATIVADO por padrão
✅ Zero impacto em produção
✅ Ativação gradual e controlada
✅ Testável apenas com seu telefone
✅ Reversível a qualquer momento
```

**Status:** 🟢 Pronto para deploy seguro

---

**Data:** 31/01/2026  
**Autor:** Sistema VETRIC  
**Branch:** feature/notificacoes-inteligentes


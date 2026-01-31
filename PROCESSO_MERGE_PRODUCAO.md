# 🔀 PROCESSO DE MERGE - Branch para Produção

## Data: 31/01/2026
## Status: Guia Completo de Merge ✅

---

## ✅ CONFIRMAÇÃO: BRANCHES SEPARADAS!

```
main (produção)
  │
  ├── feature/relatorio-vetric        📊 (OUTRO CHAT!)
  │   └── Relatórios, dashboards, análises
  │       ❌ NÃO tem relação com notificações
  │       ❌ NÃO vai misturar
  │
  └── feature/notificacoes-inteligentes 📱 (ESTE CHAT!)
      └── Notificações WhatsApp, mensagens configuráveis
          ✅ COMPLETAMENTE SEPARADO
          ✅ SEM relação com relatórios
```

### **SÃO FEATURES TOTALMENTE DIFERENTES!**

---

## 📋 FEATURE 1: Relatório VETRIC (Outro Chat)

```
Branch: feature/relatorio-vetric
Objetivo: Dashboard e relatórios
Arquivos:
  - pages/relatorios/
  - components/Dashboard/
  - services/ReportService.ts
  - etc.

❌ NADA de notificações
❌ NADA de mensagens WhatsApp
❌ NADA de configurações de mensagens
```

---

## 📋 FEATURE 2: Notificações Inteligentes (Este Chat)

```
Branch: feature/notificacoes-inteligentes
Objetivo: Sistema de notificações configuráveis
Arquivos:
  - migrations/mensagens_notificacoes.sql
  - pages/admin/configuracoes/mensagens/
  - services/NotificationServiceV2.ts
  - etc.

❌ NADA de relatórios
❌ NADA de dashboards
❌ NADA de análises
```

---

## 🔀 FLUXO COMPLETO: Branch → Produção

### 📅 LINHA DO TEMPO DETALHADA

```
┌─────────────────────────────────────────────────────────┐
│ DIA 0: INÍCIO (Hoje - 31/01/2026)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ git checkout main                                       │
│ git pull origin main                                    │
│ git checkout -b feature/notificacoes-inteligentes       │
│                                                         │
│ Status: Branch criada, trabalhando localmente          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DIAS 1-7: DESENVOLVIMENTO (Semana 1)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ • Criar migrations                                      │
│ • Criar interface admin                                 │
│ • Testar localmente                                     │
│                                                         │
│ git add .                                               │
│ git commit -m "feat: adiciona tabela mensagens"        │
│ git commit -m "feat: interface admin mensagens"        │
│ git push origin feature/notificacoes-inteligentes       │
│                                                         │
│ Status: Branch no GitHub, mas NÃO em produção          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DIAS 8-14: TESTES EM STAGING (Semana 2)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Deploy da branch em ambiente de testes:                │
│                                                         │
│ Render Dashboard:                                       │
│   → Settings → Branch Deploys                          │
│   → Enable branch deploys                              │
│   → Deploy: feature/notificacoes-inteligentes          │
│                                                         │
│ URL de staging:                                         │
│ https://vetric-staging-abc123.onrender.com             │
│                                                         │
│ • Testar tudo em staging                               │
│ • Validar banco de dados                               │
│ • Verificar interface admin                            │
│ • Corrigir bugs encontrados                            │
│                                                         │
│ git commit -m "fix: ajusta threshold de potência"      │
│ git push origin feature/notificacoes-inteligentes       │
│                                                         │
│ Status: Testando em staging, produção intacta          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DIAS 15-21: REVISÃO E AJUSTES (Semana 3)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ • Code review                                           │
│ • Testes finais                                         │
│ • Documentação                                          │
│ • Última rodada de ajustes                             │
│                                                         │
│ Status: Pronto para produção, aguardando merge         │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DIA 22: MERGE PARA PRODUÇÃO ⚠️ (MOMENTO CRÍTICO!)      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ OPÇÃO 1: Pull Request (Recomendado)                    │
│ ════════════════════════════════════                    │
│                                                         │
│ 1. Abrir Pull Request no GitHub:                       │
│    → Compare: feature/notificacoes-inteligentes → main │
│    → Criar PR com descrição detalhada                  │
│    → Revisar diff (o que vai mudar)                    │
│                                                         │
│ 2. Revisar mudanças:                                    │
│    ✅ Arquivos adicionados (novos)                     │
│    ⚠️ Arquivos modificados (revisar)                   │
│    ❌ Arquivos deletados (nenhum!)                     │
│                                                         │
│ 3. Aprovar e fazer merge:                              │
│    → Merge pull request                                │
│    → Delete branch (opcional)                          │
│                                                         │
│ OU                                                      │
│                                                         │
│ OPÇÃO 2: Merge Manual                                  │
│ ══════════════════════                                  │
│                                                         │
│ git checkout main                                       │
│ git pull origin main                                    │
│ git merge feature/notificacoes-inteligentes             │
│                                                         │
│ # Se houver conflitos (improvável):                    │
│ git status  # ver conflitos                            │
│ # resolver manualmente                                 │
│ git add .                                               │
│ git commit -m "merge: notificacoes-inteligentes"       │
│                                                         │
│ git push origin main                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DIA 22: APÓS O MERGE                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Render detecta push na main:                           │
│   → Build automático                                    │
│   → Deploy automático                                   │
│   → Produção atualizada em ~5-10 minutos              │
│                                                         │
│ ⚠️ MAS: Feature flag está OFF!                         │
│   → Código existe mas não executa                      │
│   → Mensagens todas desativadas (toggle OFF)           │
│   → Sistema antigo continua funcionando                │
│                                                         │
│ Status: EM PRODUÇÃO mas INATIVO (seguro!)              │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DIAS 23-30: ATIVAÇÃO GRADUAL (Semana 4)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Dia 23: Habilitar feature flag                         │
│   UPDATE configuracoes_sistema                         │
│   SET valor = 'true'                                    │
│   WHERE chave = 'NOTIFICACOES_INTELIGENTES';           │
│                                                         │
│ Dia 24: Ativar "Início de Recarga"                     │
│   → Admin acessa: Configurações → Mensagens            │
│   → Liga toggle de "Início de Recarga"                │
│   → Monitorar 24h                                       │
│                                                         │
│ Dia 25: Ativar "Bateria Cheia"                         │
│   → Liga toggle                                         │
│   → Monitorar 24h                                       │
│                                                         │
│ Dia 26: Ativar "Ociosidade"                            │
│   → Liga toggle                                         │
│   → Monitorar 24h                                       │
│                                                         │
│ Dia 27: Ativar "Interrupção"                           │
│   → Liga toggle                                         │
│   → Monitorar 24h                                       │
│                                                         │
│ Dias 28-30: Ajustes finais                             │
│   → Ajustar tempos baseado em feedback                 │
│   → Ajustar thresholds                                  │
│   → Ajustar textos das mensagens                       │
│                                                         │
│ Status: TOTALMENTE ATIVO E OPERACIONAL                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 MOMENTO EXATO DO MERGE

### **QUANDO fazer o merge para produção?**

```
✅ SOMENTE quando:

□ Todos os testes em staging passaram
□ Interface admin funcionando 100%
□ Migrations validadas
□ Code review aprovado
□ Backup do banco feito
□ Plano de rollback pronto
□ Time alinhado
□ Horário adequado (não em pico de uso)
```

### **MELHOR MOMENTO:**

```
📅 Sexta-feira, final do dia
   ou
📅 Sábado/Domingo (baixo movimento)

⏰ Horário: 18h-22h (após pico)

Razão: Se algo der errado, tem tempo 
       para resolver antes do próximo dia útil
```

---

## 🔀 PASSO A PASSO DO MERGE (Detalhado)

### **OPÇÃO 1: Pull Request (Recomendado)**

```bash
# 1. Garantir que branch está atualizada
git checkout feature/notificacoes-inteligentes
git pull origin feature/notificacoes-inteligentes

# 2. Atualizar com main (evita conflitos)
git checkout main
git pull origin main
git checkout feature/notificacoes-inteligentes
git merge main

# Se houver conflitos, resolver agora!
# Testar novamente após resolver

# 3. Push final
git push origin feature/notificacoes-inteligentes

# 4. Abrir Pull Request no GitHub
# Ir para: https://github.com/seu-usuario/vetric/pulls
# Clicar: "New Pull Request"
# Base: main
# Compare: feature/notificacoes-inteligentes
# Criar PR

# 5. Revisar diff no GitHub
# Verificar todos os arquivos que serão alterados
# Comentar se necessário
# Aprovar

# 6. Fazer merge
# Clicar: "Merge pull request"
# Confirmar: "Confirm merge"
# Opcionalmente: "Delete branch"

# 7. Aguardar deploy automático no Render
# Monitorar logs do Render
# Verificar que subiu sem erros
```

---

### **OPÇÃO 2: Merge Manual (Mais Rápido)**

```bash
# 1. Backup do banco primeiro!
pg_dump $DATABASE_URL > backup_antes_merge_$(date +%Y%m%d).sql

# 2. Garantir que main está atualizado
git checkout main
git pull origin main

# 3. Fazer merge
git merge feature/notificacoes-inteligentes

# 4. Se houver conflitos:
git status  # ver arquivos com conflito

# Abrir cada arquivo com conflito e resolver:
# <<<<<<< HEAD (código da main)
# =======
# >>>>>>> feature/notificacoes-inteligentes (código da branch)

# Escolher qual manter ou mesclar manualmente

git add arquivo-resolvido.ts
# Repetir para cada conflito

git commit -m "merge: resolve conflicts"

# 5. Push para main (⚠️ VAI PARA PRODUÇÃO!)
git push origin main

# 6. Monitorar Render
# Ver build e deploy automático
# Verificar logs
```

---

## ⚠️ E SE HOUVER CONFLITO COM feature/relatorio-vetric?

```
CENÁRIO: Ambas as branches modificaram o mesmo arquivo

main
  ├── feature/relatorio-vetric (mexeu em Dashboard.tsx)
  │
  └── feature/notificacoes-inteligentes (mexeu em Dashboard.tsx)
```

### **SOLUÇÃO:**

```bash
# 1. Merge feature/relatorio-vetric PRIMEIRO
git checkout main
git merge feature/relatorio-vetric
git push origin main

# 2. DEPOIS, merge feature/notificacoes-inteligentes
git checkout feature/notificacoes-inteligentes
git pull origin main  # Pega mudanças do relatório
# Resolver conflitos AQUI (antes do merge)
git add .
git commit -m "fix: resolve conflitos com relatorio-vetric"
git push origin feature/notificacoes-inteligentes

# 3. Agora sim, merge para main
git checkout main
git merge feature/notificacoes-inteligentes
git push origin main
```

### **MAS provavelmente NÃO haverá conflito porque:**

```
Relatório VETRIC mexe em:
  ✅ pages/relatorios/
  ✅ components/Dashboard/
  ✅ services/ReportService.ts

Notificações mexe em:
  ✅ pages/admin/configuracoes/mensagens/
  ✅ migrations/mensagens_notificacoes.sql
  ✅ services/NotificationServiceV2.ts

❌ NÃO HÁ SOBREPOSIÇÃO!
```

---

## 📊 CHECKLIST PRÉ-MERGE

```
ANTES de fazer o merge para produção:

□ Branch staging funcionando 100%
□ Testes manuais completos
□ Testes automatizados passando
□ Code review aprovado por 2+ pessoas
□ Documentação atualizada
□ Migrations testadas em banco de staging
□ Backup do banco de produção feito
□ Plano de rollback pronto
□ Feature flag configurada (OFF)
□ Mensagens desativadas (toggles OFF)
□ Time alinhado e disponível
□ Horário de baixo movimento
□ Monitoramento configurado
□ Render Dashboard acessível
□ Logs do Render monitorados
```

---

## 🚨 MOMENTO CRÍTICO: Durante o Deploy

```
┌─────────────────────────────────────────┐
│ FAZER O MERGE                           │
│ git push origin main                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ RENDER DETECTA PUSH                     │
│ (~30 segundos)                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ BUILD INICIA                            │
│ • Instala dependências                  │
│ • Compila TypeScript                    │
│ • Roda migrations (⚠️ CRÍTICO!)        │
│ (~5-8 minutos)                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ DEPLOY INICIA                           │
│ • Nova versão sobe                      │
│ • Versão antiga fica disponível         │
│ • Troca gradual de tráfego             │
│ (~2-3 minutos)                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ VALIDAÇÃO IMEDIATA                      │
│ • Acessar site                          │
│ • Verificar logs                        │
│ • Testar funcionalidades críticas      │
│ • Verificar banco de dados             │
└─────────────────────────────────────────┘
```

### **O que fazer DURANTE o deploy:**

```
1. Abrir Render Dashboard
   → Ver build logs em tempo real
   → Identificar erros imediatamente

2. Ter backup e rollback prontos
   → Se algo falhar, reverter rápido

3. Comunicar ao time
   → "Deploy em progresso, aguardem"
   → "Deploy concluído, validem por favor"

4. Monitorar logs de produção
   → Ver se aplicação subiu OK
   → Ver se migrations rodaram OK
```

---

## ✅ APÓS O MERGE (Validação)

```bash
# 1. Verificar que site está no ar
curl https://vetric.com.br

# 2. Acessar admin
https://vetric.com.br/admin/configuracoes/mensagens

# 3. Verificar banco de dados
psql $DATABASE_URL_PROD

SELECT * FROM mensagens_notificacoes;
-- Deve retornar 4 linhas

SELECT * FROM carregamentos LIMIT 1;
-- Deve ter os novos campos (NULL por enquanto)

# 4. Verificar logs do Render
# Ver se não há erros

# 5. Testar 1 carregamento
# Iniciar carregamento de teste
# Verificar que sistema antigo funciona
# (novo sistema está OFF ainda)

# 6. Comunicar ao time
✅ Deploy concluído com sucesso!
✅ Sistema antigo funcionando
✅ Novo sistema pronto para ativar (quando quiser)
```

---

## 🔙 ROLLBACK (Se necessário)

### **Se algo der MUITO errado durante/após merge:**

```bash
# OPÇÃO 1: Reverter commit (mais rápido)
git checkout main
git revert HEAD  # reverte último commit (o merge)
git push origin main

# Render vai detectar e fazer deploy da versão anterior
# ~10 minutos para voltar

# OPÇÃO 2: Rollback no Render Dashboard
# Render → seu-servico → Rollback
# Escolher versão anterior
# ~2 minutos para voltar

# OPÇÃO 3: Restaurar banco (se migrations deram problema)
psql $DATABASE_URL_PROD < backup_antes_merge.sql
```

---

## 📋 RESUMO EXECUTIVO

### **Quando fazer merge?**

```
✅ Quando: Semana 3-4 após início
✅ Horário: Final de semana ou após 18h
✅ Requisito: Todos os testes OK
```

### **Como fazer merge?**

```
1. Pull Request no GitHub (recomendado)
   OU
2. git merge manual

Depois:
3. Push para main
4. Render faz deploy automático
5. Validar que subiu OK
6. Ativar gradualmente (toggles)
```

### **E o relatório VETRIC?**

```
❌ NÃO está nesta branch
❌ NÃO vai junto
❌ NÃO vai interferir

✅ São branches SEPARADAS
✅ Podem fazer merge independentes
✅ Provavelmente não terão conflitos
```

---

## 🎯 CONFIRMAÇÃO FINAL

```
Branch 1: feature/relatorio-vetric
  → Dashboard, relatórios, análises
  → OUTRO CHAT
  → OUTRA FUNCIONALIDADE
  → Merge independente

Branch 2: feature/notificacoes-inteligentes
  → Notificações WhatsApp configuráveis
  → ESTE CHAT
  → ESTA FUNCIONALIDADE
  → Merge independente

✅ NÃO VÃO MISTURAR
✅ PODEM SUBIR SEPARADOS
✅ SEM INTERFERÊNCIA
```

---

## ❓ DÚVIDAS RESPONDIDAS

### **1. Quando fazer o merge?**
→ Semana 3-4, após testes completos em staging

### **2. Como fazer o merge?**
→ Pull Request (GitHub) ou git merge manual

### **3. Vai afetar o relatório VETRIC?**
→ NÃO! São branches totalmente separadas

### **4. E se houver conflito?**
→ Improvável, mas resolver antes do merge

### **5. Posso voltar atrás?**
→ SIM! Rollback leva ~2-10 minutos

### **6. Vai quebrar produção?**
→ NÃO! Sistema novo fica desligado (flag OFF)

---

## ✅ ESTÁ CLARO AGORA?

Pronto para começar a implementação? 🚀

---

**Data:** 31/01/2026  
**Status:** 📋 Processo de Merge Explicado  
**Próximo:** Começar desenvolvimento na branch


#!/bin/bash

echo "🔍 DIAGNÓSTICO RÁPIDO - SISTEMA DE NOTIFICAÇÕES"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 CHECKLIST DE VERIFICAÇÃO:"
echo ""

echo "[ ] 1. PollingService está rodando?"
echo "[ ] 2. Templates estão ativos?"
echo "[ ] 3. Claudevania está identificada?"
echo "[ ] 4. Eventos 2,3,4 estão sendo processados?"
echo ""

echo "================================================"
echo "🔍 VERIFICAÇÃO 1: PollingService Rodando?"
echo "================================================"
echo ""
echo "Executando: render logs --service vetric-backend --tail 50"
echo ""
echo "${YELLOW}Procure por estas mensagens (devem aparecer a cada 10 seg):${NC}"
echo "  - 📊 [Polling] X transação(ões) ativa(s) no CVE"
echo "  - 🔍 [Polling] Verificando status de todos os carregadores..."
echo "  - 🔍 [Eventos] Processando X carregamento(s) ativo(s)..."
echo ""
echo "${YELLOW}Pressione CTRL+C quando tiver visto o suficiente${NC}"
echo ""
read -p "Pressione ENTER para continuar..."

# Aqui você pode adicionar comando render se CLI estiver instalada
# render logs --service vetric-backend --tail 50

echo ""
echo "================================================"
echo "📋 PRÓXIMOS PASSOS MANUAIS:"
echo "================================================"
echo ""
echo "1️⃣ VERIFICAR TEMPLATES NO BANCO:"
echo "   psql PRODUCTION_DATABASE_URL"
echo "   SELECT tipo, ativo FROM templates_notificacao;"
echo ""
echo "2️⃣ VERIFICAR CLAUDEVANIA:"
echo "   SELECT id, nome, tag_rfid, telefone, notificacoes_ativas"
echo "   FROM moradores"
echo "   WHERE nome ILIKE '%claudevania%';"
echo ""
echo "3️⃣ VER CARREGAMENTO ATIVO DELA:"
echo "   SELECT * FROM carregamentos WHERE id = 440159;"
echo ""
echo "4️⃣ VER LOGS DE NOTIFICAÇÃO:"
echo "   SELECT * FROM logs_notificacoes"
echo "   ORDER BY criado_em DESC LIMIT 10;"
echo ""

echo "${GREEN}✅ Abra o arquivo ANALISE_PROBLEMAS_NOTIFICACOES_02FEV2026.md${NC}"
echo "${GREEN}   para ver análise completa e plano de ação detalhado.${NC}"
echo ""

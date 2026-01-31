#!/bin/bash

# 🔍 Script para Buscar Transação 439071 no Banco de Produção

echo "=================================================="
echo "🔍 TESTE: TRANSAÇÃO 439071 - SASKYA LORENA"
echo "=================================================="
echo ""
echo "Este script vai buscar no banco de PRODUÇÃO:"
echo "  1️⃣  Transação 439071"
echo "  2️⃣  Notificações enviadas"
echo "  3️⃣  Todos os carregamentos da Saskya"
echo ""
echo "=================================================="
echo ""

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL não está definida!"
    echo ""
    echo "Opção 1: Definir e executar"
    echo "  export DATABASE_URL='postgresql://user:pass@host/db'"
    echo "  ./testar-transacao-saskya.sh"
    echo ""
    echo "Opção 2: Executar direto"
    echo "  DATABASE_URL='postgresql://...' ./testar-transacao-saskya.sh"
    echo ""
    echo "Opção 3: Carregar do .env do backend"
    echo "  source apps/backend/.env"
    echo "  ./testar-transacao-saskya.sh"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL encontrada!"
echo ""
echo "🔌 Conectando ao banco de produção..."
echo ""

# Executar script TypeScript
npx ts-node buscar-producao-saskya.ts

echo ""
echo "=================================================="
echo "📋 ANÁLISE"
echo "=================================================="
echo ""
echo "Com base nos resultados acima, identifique:"
echo ""
echo "1️⃣  A transação 439071 está no banco?"
echo "    [ ] SIM - Ir para 2️⃣"
echo "    [ ] NÃO - Backend não registrou a transação"
echo ""
echo "2️⃣  A transação tem data de FIM?"
echo "    [ ] SIM - Backend recebeu finalização"
echo "    [ ] NÃO - Backend NÃO recebeu finalização"
echo ""
echo "3️⃣  Quantas notificações foram enviadas?"
echo "    [ ] 0 - Nenhuma notificação enviada"
echo "    [ ] 1 - Só notificação de início"
echo "    [ ] 2+ - Notificações de início E fim"
echo ""
echo "=================================================="
echo ""


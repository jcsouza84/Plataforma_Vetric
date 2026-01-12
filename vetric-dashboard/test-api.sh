#!/bin/bash

# ========================================
# VETRIC - Teste Rápido da API
# ========================================

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         🧪 VETRIC - Teste Rápido da API                   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:3001"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint")
    fi
    
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL (Status: $response)${NC}"
        return 1
    fi
}

# Verificar se servidor está rodando
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verificando servidor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Servidor não está rodando em $BASE_URL${NC}"
    echo ""
    echo "Inicie o servidor primeiro:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Servidor está online${NC}"
echo ""

# Testes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Executando testes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS=0
FAIL=0

# Health Check
test_endpoint "Health Check" "/health" && ((SUCCESS++)) || ((FAIL++))

# Dashboard
test_endpoint "Dashboard Stats" "/api/dashboard/stats" && ((SUCCESS++)) || ((FAIL++))
test_endpoint "Dashboard Chargers" "/api/dashboard/chargers" && ((SUCCESS++)) || ((FAIL++))

# Moradores
test_endpoint "List Moradores" "/api/moradores" && ((SUCCESS++)) || ((FAIL++))

# Carregamentos
test_endpoint "List Carregamentos" "/api/carregamentos" && ((SUCCESS++)) || ((FAIL++))
test_endpoint "Active Carregamentos" "/api/carregamentos/ativos" && ((SUCCESS++)) || ((FAIL++))
test_endpoint "Today Stats" "/api/carregamentos/stats/today" && ((SUCCESS++)) || ((FAIL++))

# Templates
test_endpoint "List Templates" "/api/templates" && ((SUCCESS++)) || ((FAIL++))

# Resultado
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Resultado:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Sucesso: $SUCCESS${NC}"
echo -e "${RED}❌ Falhas:  $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         ✅ TODOS OS TESTES PASSARAM! ✅                   ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         ⚠️  ALGUNS TESTES FALHARAM  ⚠️                    ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi


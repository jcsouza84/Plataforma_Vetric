#!/bin/bash

# ========================================
# VETRIC - Adicionar Moradores de Teste
# ========================================

BASE_URL="http://localhost:3001"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║      👥 VETRIC - Cadastrar Moradores de Teste            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

add_morador() {
    local nome=$1
    local apto=$2
    local telefone=$3
    local tag=$4
    
    echo -n "Cadastrando $nome (Apto $apto)... "
    
    response=$(curl -s -X POST "$BASE_URL/api/moradores" \
      -H "Content-Type: application/json" \
      -d "{
        \"nome\": \"$nome\",
        \"apartamento\": \"$apto\",
        \"telefone\": \"$telefone\",
        \"tag_rfid\": \"$tag\",
        \"notificacoes_ativas\": true
      }")
    
    if echo "$response" | grep -q "\"success\":true"; then
        echo -e "${GREEN}✅${NC}"
        return 0
    else
        echo -e "${RED}❌${NC}"
        echo "   Erro: $response"
        return 1
    fi
}

echo "Cadastrando 5 moradores de teste..."
echo ""

add_morador "João Silva" "101" "48999999999" "TAG001"
add_morador "Maria Santos" "102" "48988888888" "TAG002"
add_morador "Pedro Oliveira" "103" "48977777777" "TAG003"
add_morador "Ana Costa" "104" "48966666666" "TAG004"
add_morador "Carlos Souza" "105" "48955555555" "TAG005"

echo ""
echo -e "${GREEN}✅ Moradores cadastrados!${NC}"
echo ""
echo "Para listar:"
echo "  curl http://localhost:3001/api/moradores"
echo ""


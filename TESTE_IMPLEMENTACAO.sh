#!/bin/bash

###############################################################################
# 🧪 Script de Teste - Identificação de Morador
# 
# Este script executa todos os testes necessários para validar
# a implementação da identificação de moradores nos carregadores.
###############################################################################

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║      🧪 TESTE: Identificação de Morador                  ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório base
BACKEND_DIR="/Users/juliocesarsouza/Desktop/VETRIC - CVE/vetric-dashboard/backend"
FRONTEND_DIR="/Users/juliocesarsouza/Desktop/vetric-interface"

# Função para verificar se um comando foi bem sucedido
check_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
  else
    echo -e "${RED}❌ $1${NC}"
    exit 1
  fi
}

# 1. Verificar se o backend está rodando
echo "📡 1. Verificando se o backend está rodando..."
HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)

if [ -z "$HEALTH" ]; then
  echo -e "${RED}❌ Backend não está rodando!${NC}"
  echo ""
  echo "Para iniciar o backend:"
  echo "  cd $BACKEND_DIR"
  echo "  npm run dev"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ Backend está online${NC}"
  echo ""
fi

# 2. Verificar WebSocket
echo "🔄 2. Verificando WebSocket..."
WS_STATUS=$(echo "$HEALTH" | jq -r '.websocket' 2>/dev/null)

if [ "$WS_STATUS" = "true" ]; then
  echo -e "${GREEN}✅ WebSocket conectado${NC}"
else
  echo -e "${YELLOW}⚠️  WebSocket desconectado${NC}"
  echo "   (Identificação de morador pode não funcionar para novos carregamentos)"
fi
echo ""

# 3. Executar script de teste automatizado
echo "🧪 3. Executando testes automatizados..."
echo ""

cd "$BACKEND_DIR"
npx ts-node test-morador-identification.ts

check_result "Testes automatizados concluídos"
echo ""

# 4. Testar API REST
echo "🌐 4. Testando API REST..."

# Fazer login
echo "   Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vetric.com.br","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Falha no login${NC}"
  echo "   Resposta: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido${NC}"

# Buscar carregadores
echo "   Buscando carregadores..."
CHARGERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/dashboard/chargers)

CHARGERS_COUNT=$(echo "$CHARGERS_RESPONSE" | jq '.data | length' 2>/dev/null)

if [ -z "$CHARGERS_COUNT" ]; then
  echo -e "${RED}❌ Falha ao buscar carregadores${NC}"
  echo "   Resposta: $CHARGERS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ ${CHARGERS_COUNT} carregador(es) encontrado(s)${NC}"

# Verificar se algum tem morador
CHARGERS_COM_MORADOR=$(echo "$CHARGERS_RESPONSE" | jq '[.data[] | select(.morador != null)] | length' 2>/dev/null)

echo "   Com morador identificado: $CHARGERS_COM_MORADOR"
echo ""

# 5. Exibir exemplo de carregador
echo "📊 5. Exemplo de resposta da API:"
echo ""
echo "$CHARGERS_RESPONSE" | jq '.data[0]' 2>/dev/null | head -20
echo ""

# 6. Resumo Final
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                     RESUMO DOS TESTES                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "   Backend: ${GREEN}✅ Online${NC}"
echo "   WebSocket: $([ "$WS_STATUS" = "true" ] && echo -e "${GREEN}✅ Conectado${NC}" || echo -e "${YELLOW}⚠️ Desconectado${NC}")"
echo "   API REST: ${GREEN}✅ Funcionando${NC}"
echo "   Carregadores encontrados: $CHARGERS_COUNT"
echo "   Com morador identificado: $CHARGERS_COM_MORADOR"
echo ""

if [ "$CHARGERS_COM_MORADOR" -gt 0 ]; then
  echo -e "${GREEN}✅ TESTE PASSOU: Sistema identificando moradores!${NC}"
else
  echo -e "${YELLOW}⚠️ ATENÇÃO: Nenhum morador identificado${NC}"
  echo ""
  echo "   Possíveis causas:"
  echo "   1. Não há carregamentos ativos no momento"
  echo "   2. WebSocket não está salvando dados"
  echo "   3. Moradores não têm tag_rfid cadastrada"
  echo ""
  echo "   Para testar, insira um carregamento de teste:"
  echo "   cd $BACKEND_DIR"
  echo "   npm run seed:test-carregamento"
fi

echo ""
echo "🏁 Teste finalizado!"
echo ""


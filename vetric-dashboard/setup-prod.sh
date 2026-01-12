#!/bin/bash

# ========================================
# VETRIC Dashboard - Setup PRODUÇÃO
# ========================================

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🚀 VETRIC Dashboard - Setup PRODUÇÃO                  ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se .env existe
if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ Erro: Arquivo backend/.env não encontrado!${NC}"
    echo ""
    echo "Crie o arquivo com as credenciais de PRODUÇÃO:"
    echo ""
    echo "  cd backend"
    echo "  nano .env"
    echo ""
    echo "Variáveis obrigatórias:"
    echo "  - CVE_BASE_URL=https://cs.intelbras-cve-pro.com.br"
    echo "  - CVE_API_KEY=<sua-chave-de-producao>"
    echo "  - CVE_USERNAME=<seu-usuario>"
    echo "  - CVE_PASSWORD=<sua-senha>"
    echo "  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Validando configurações de PRODUÇÃO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ler .env e verificar variáveis críticas
source backend/.env

if [[ "$CVE_BASE_URL" == *"test"* ]]; then
    echo -e "${RED}❌ ATENÇÃO: CVE_BASE_URL aponta para ambiente de TESTE!${NC}"
    echo "   Esperado: https://cs.intelbras-cve-pro.com.br"
    echo "   Atual: $CVE_BASE_URL"
    exit 1
fi

echo -e "${GREEN}✅ URL de produção configurada${NC}"

if [ -z "$CVE_API_KEY" ] || [ "$CVE_API_KEY" == "fc961d23-0ebe-41df-b044-72fa60b3d89a" ]; then
    echo -e "${RED}❌ CVE_API_KEY não configurada ou usando chave de teste!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API Key de produção configurada${NC}"

# 2. Verificar PostgreSQL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Verificando banco de dados..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Testar conexão
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
    echo -e "${GREEN}✅ Conexão com banco de dados OK${NC}"
else
    echo -e "${RED}❌ Erro ao conectar no banco de dados${NC}"
    echo "   Verifique as credenciais no .env"
    exit 1
fi

# 3. Build de produção
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Gerando build de produção..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend
npm run build

echo -e "${GREEN}✅ Build gerado em backend/dist/${NC}"

# 4. Testar inicialização
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Testando inicialização..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${YELLOW}⚠️  Iniciando servidor de teste (10 segundos)...${NC}"

timeout 10s npm run start &
PID=$!
sleep 8

if ps -p $PID > /dev/null; then
    echo -e "${GREEN}✅ Servidor iniciou com sucesso${NC}"
    kill $PID 2>/dev/null
else
    echo -e "${RED}❌ Erro ao iniciar servidor${NC}"
    exit 1
fi

# Resultado
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        ✅ SETUP DE PRODUÇÃO CONCLUÍDO!                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Para iniciar em PRODUÇÃO:${NC}"
echo ""
echo "  cd backend"
echo "  npm run start"
echo ""
echo -e "${GREEN}Para rodar como serviço (PM2):${NC}"
echo ""
echo "  npm install -g pm2"
echo "  cd backend"
echo "  pm2 start dist/index.js --name vetric-dashboard"
echo "  pm2 save"
echo "  pm2 startup"
echo ""


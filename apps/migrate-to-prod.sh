#!/bin/bash

# ========================================
# VETRIC - Migração de TESTE para PRODUÇÃO
# ========================================

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🔄 VETRIC - Migração TESTE → PRODUÇÃO                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Solicitar credenciais de produção
echo -e "${BLUE}Por favor, forneça as credenciais de PRODUÇÃO:${NC}"
echo ""

read -p "CVE_API_KEY (produção): " PROD_API_KEY
read -p "CVE_USERNAME: " PROD_USER
read -sp "CVE_PASSWORD: " PROD_PASS
echo ""
echo ""

read -p "Evolution API URL (ou Enter para pular): " EVOLUTION_URL
if [ ! -z "$EVOLUTION_URL" ]; then
    read -p "Evolution API Key: " EVOLUTION_KEY
    read -p "Evolution Instance: " EVOLUTION_INSTANCE
fi

# Criar novo .env.production
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Criando .env.production..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > backend/.env.production << EOF
# ========================================
# VETRIC Dashboard - PRODUÇÃO
# Gerado automaticamente em $(date)
# ========================================

# Servidor
PORT=3001

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vetric_db_prod
DB_USER=postgres
DB_PASSWORD=postgres

# API CVE-PRO (PRODUÇÃO)
CVE_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVE_API_KEY=$PROD_API_KEY
CVE_USERNAME=$PROD_USER
CVE_PASSWORD=$PROD_PASS

# Token CVE-PRO (será gerado automaticamente)
CVE_TOKEN=

# Evolution API (WhatsApp)
EVOLUTION_API_URL=$EVOLUTION_URL
EVOLUTION_API_KEY=$EVOLUTION_KEY
EVOLUTION_INSTANCE=$EVOLUTION_INSTANCE

# Debug
DEBUG_WS=false
EOF

echo -e "${GREEN}✅ Arquivo .env.production criado${NC}"

# Criar banco de produção
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Criando banco de dados de produção..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if psql -lqt | cut -d \| -f 1 | grep -qw vetric_db_prod; then
    echo -e "${YELLOW}⚠️  Banco 'vetric_db_prod' já existe${NC}"
    read -p "Deseja recriar? (s/N): " RECREATE
    if [ "$RECREATE" == "s" ] || [ "$RECREATE" == "S" ]; then
        dropdb vetric_db_prod
        createdb vetric_db_prod
        echo -e "${GREEN}✅ Banco recriado${NC}"
    fi
else
    createdb vetric_db_prod
    echo -e "${GREEN}✅ Banco 'vetric_db_prod' criado${NC}"
fi

# Backup dos dados de teste (opcional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backup (opcional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Deseja fazer backup dos dados de teste? (s/N): " BACKUP
if [ "$BACKUP" == "s" ] || [ "$BACKUP" == "S" ]; then
    BACKUP_FILE="backup_vetric_$(date +%Y%m%d_%H%M%S).sql"
    pg_dump vetric_db > $BACKUP_FILE
    echo -e "${GREEN}✅ Backup salvo em: $BACKUP_FILE${NC}"
fi

# Resultado
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        ✅ MIGRAÇÃO PREPARADA COM SUCESSO!                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Próximos passos:${NC}"
echo ""
echo "1. Ativar ambiente de produção:"
echo "   cd backend"
echo "   cp .env.production .env"
echo ""
echo "2. Iniciar servidor:"
echo "   npm run dev"
echo ""
echo "3. Validar login e carregadores"
echo ""
echo "4. Cadastrar moradores reais"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Teste TUDO antes de colocar em produção!${NC}"
echo ""


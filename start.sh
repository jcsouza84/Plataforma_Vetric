#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║     🚀 VETRIC CVE Discovery Tool - Quick Start            ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
    echo ""
    echo "Criando .env a partir do template..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Arquivo .env criado${NC}"
        echo ""
        echo -e "${YELLOW}📝 IMPORTANTE: Edite o arquivo .env e configure:${NC}"
        echo "   - CVEPRO_USERNAME (seu usuário do CVE-PRO)"
        echo "   - CVEPRO_PASSWORD (sua senha do CVE-PRO)"
        echo ""
        echo "Execute: nano .env"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}Arquivo .env.example não encontrado. Criando manualmente...${NC}"
        cat > .env << 'EOF'
# CVE-PRO Intelbras - Credenciais
CVEPRO_BASE_URL=https://cs.intelbras-cve-pro.com.br
CVEPRO_USERNAME=seu_usuario_aqui
CVEPRO_PASSWORD=sua_senha_aqui

# Configurações de Log
LOG_LEVEL=info
DEBUG_MODE=true

# Configurações do Discovery
SAVE_RAW_MESSAGES=true
AUTO_RECONNECT=true
EOF
        echo -e "${GREEN}✓ Arquivo .env criado${NC}"
        echo ""
        echo -e "${YELLOW}📝 IMPORTANTE: Edite o arquivo .env e configure suas credenciais!${NC}"
        echo ""
        exit 0
    fi
fi

# Verificar se credenciais estão configuradas
if grep -q "seu_usuario_aqui" .env || grep -q "sua_senha_aqui" .env; then
    echo -e "${YELLOW}⚠️  Credenciais não configuradas no .env${NC}"
    echo ""
    echo -e "${YELLOW}Por favor, edite o arquivo .env e configure:${NC}"
    echo "   - CVEPRO_USERNAME"
    echo "   - CVEPRO_PASSWORD"
    echo ""
    echo "Execute: nano .env"
    echo ""
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências...${NC}"
    npm install
    echo ""
fi

# Executar Discovery Tool
echo -e "${GREEN}✓ Configurações OK!${NC}"
echo ""
echo -e "${BLUE}🚀 Iniciando Discovery Tool...${NC}"
echo ""
echo -e "${YELLOW}Dicas:${NC}"
echo "  • Deixe rodando enquanto testa os carregadores"
echo "  • Pressione CTRL+C para finalizar e gerar relatório"
echo "  • Após finalizar, execute: npm run analyze"
echo ""
echo "Aguarde..."
sleep 2
echo ""

npm run dev







#!/bin/bash

# ═══════════════════════════════════════════════════════════
# 🚀 VETRIC - Script de Deploy Automático
# ═══════════════════════════════════════════════════════════
# 
# Este script automatiza o processo de deploy na VPS:
# 1. Backup do banco de dados
# 2. Git pull da branch main
# 3. Instalação de dependências
# 4. Build do TypeScript
# 5. Reload do PM2 (sem downtime)
# 
# USO:
#   ./scripts/deploy.sh
# 
# ═══════════════════════════════════════════════════════════

set -e  # Parar se qualquer comando falhar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              🚀 VETRIC - DEPLOY AUTOMÁTICO                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# ┌─────────────────────────────────────────────────────────┐
# │ PASSO 1: Verificações Iniciais                          │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}📋 Passo 1/6: Verificações iniciais...${NC}"

# Verificar se está na pasta correta
if [ ! -f "package.json" ] && [ ! -d "vetric-dashboard" ]; then
    echo -e "${RED}❌ Erro: Execute este script da raiz do projeto!${NC}"
    exit 1
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ Erro: PM2 não está instalado!${NC}"
    echo -e "${YELLOW}   Instale com: npm install -g pm2${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Verificações OK${NC}\n"

# ┌─────────────────────────────────────────────────────────┐
# │ PASSO 2: Backup do Banco de Dados                       │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}💾 Passo 2/6: Criando backup...${NC}"

if [ -f "./scripts/backup.sh" ]; then
    bash ./scripts/backup.sh
else
    echo -e "${YELLOW}⚠️  Script de backup não encontrado, pulando...${NC}"
fi

echo ""

# ┌─────────────────────────────────────────────────────────┐
# │ PASSO 3: Git Pull                                        │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}📥 Passo 3/6: Baixando atualizações do GitHub...${NC}"

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "   Branch atual: ${YELLOW}${CURRENT_BRANCH}${NC}"

# Pull da branch main
git fetch origin
git pull origin main

LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%cr)")
echo -e "${GREEN}✅ Código atualizado:${NC}"
echo -e "   ${LAST_COMMIT}\n"

# ┌─────────────────────────────────────────────────────────┐
# │ PASSO 4: Instalar Dependências                          │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}📦 Passo 4/6: Instalando dependências...${NC}"

cd vetric-dashboard/backend

# Verificar se houve mudanças no package.json
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo -e "   ${YELLOW}package.json modificado, instalando...${NC}"
    npm install --production
else
    echo -e "   ${GREEN}Nenhuma mudança em package.json${NC}"
fi

echo -e "${GREEN}✅ Dependências OK${NC}\n"

# ┌─────────────────────────────────────────────────────────┐
# │ PASSO 5: Build do TypeScript                            │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}🔨 Passo 5/6: Compilando TypeScript...${NC}"

# Limpar build anterior
rm -rf dist

# Build
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Build falhou!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído${NC}\n"

# ┌─────────────────────────────────────────────────────────┐
# │ PASSO 6: Reload do PM2 (Zero Downtime)                  │
# └─────────────────────────────────────────────────────────┘

echo -e "${BLUE}🔄 Passo 6/6: Reiniciando aplicação (PM2)...${NC}"

# Voltar para raiz
cd ../..

# Verificar se app está rodando
if pm2 list | grep -q "vetric-api"; then
    # Reload (zero downtime)
    pm2 reload vetric-api --update-env
    echo -e "${GREEN}✅ Aplicação recarregada (zero downtime)${NC}"
else
    # Primeira vez - start
    pm2 start vetric-dashboard/ecosystem.config.js --env production
    echo -e "${GREEN}✅ Aplicação iniciada${NC}"
fi

# Salvar configuração PM2
pm2 save

echo ""

# ┌─────────────────────────────────────────────────────────┐
# │ FINALIZAÇÃO                                              │
# └─────────────────────────────────────────────────────────┘

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              ✅ DEPLOY CONCLUÍDO COM SUCESSO!             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}🎉 Aplicação atualizada e rodando!${NC}"
echo ""
echo -e "${BLUE}📊 Status da aplicação:${NC}"
pm2 status vetric-api
echo ""
echo -e "${BLUE}📝 Logs em tempo real:${NC}"
echo -e "   ${YELLOW}pm2 logs vetric-api${NC}"
echo ""
echo -e "${BLUE}🔍 Monitoramento:${NC}"
echo -e "   ${YELLOW}pm2 monit${NC}"
echo ""


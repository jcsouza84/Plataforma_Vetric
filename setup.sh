#!/bin/bash

# Script de setup do VETRIC CVE Discovery Tool

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🔧 VETRIC CVE Discovery Tool - Setup                  ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

echo "✓ npm encontrado: $(npm --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""
echo "✓ Dependências instaladas com sucesso!"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚙️  Arquivo .env não encontrado. Criando..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Arquivo .env criado a partir de .env.example"
        echo ""
        echo "⚠️  IMPORTANTE: Edite o arquivo .env e configure suas credenciais:"
        echo "   - CVEPRO_USERNAME"
        echo "   - CVEPRO_PASSWORD"
        echo ""
    else
        echo "❌ Arquivo .env.example não encontrado"
    fi
else
    echo "✓ Arquivo .env já existe"
    echo ""
fi

# Criar diretórios necessários
mkdir -p logs/raw-messages

echo "✓ Estrutura de diretórios criada"
echo ""

# Resumo
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     ✅ Setup Completo!                                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Edite o arquivo .env com suas credenciais:"
echo "   nano .env"
echo ""
echo "2. Execute o Discovery Tool:"
echo "   npm run dev"
echo ""
echo "3. Após coletar dados, analise os logs:"
echo "   npm run analyze"
echo ""
echo "📖 Documentação completa: README.md"
echo ""







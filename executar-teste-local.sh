#!/bin/bash

# 🔍 Teste Transação 439071 - Saskya Lorena
# Execução local com input da DATABASE_URL

echo "=================================================="
echo "🔍 TESTE: TRANSAÇÃO 439071 - SASKYA LORENA"
echo "=================================================="
echo ""

# Verificar se DATABASE_URL já está definida
if [ -z "$DATABASE_URL" ]; then
    echo "📋 Para executar este teste, precisamos da DATABASE_URL"
    echo ""
    echo "Como obter a DATABASE_URL:"
    echo "  1. Acesse: https://dashboard.render.com"
    echo "  2. Vá em: Backend → Environment"
    echo "  3. Copie o valor de DATABASE_URL"
    echo ""
    echo "A URL tem este formato:"
    echo "  postgresql://usuario:senha@dpg-xxxx.oregon-postgres.render.com/database"
    echo ""
    read -p "Cole a DATABASE_URL aqui: " DATABASE_URL
    echo ""
    
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL não fornecida. Abortando."
        exit 1
    fi
    
    export DATABASE_URL
fi

echo "✅ DATABASE_URL configurada!"
echo ""
echo "🔌 Conectando ao banco de produção..."
echo ""
echo "=================================================="
echo ""

# Executar script TypeScript
npx ts-node buscar-producao-saskya.ts

EXIT_CODE=$?

echo ""
echo "=================================================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ TESTE CONCLUÍDO COM SUCESSO"
else
    echo "❌ TESTE FALHOU - Código de saída: $EXIT_CODE"
fi

echo "=================================================="
echo ""


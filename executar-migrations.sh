#!/bin/bash

echo "🗃️  EXECUTAR MIGRATIONS - Banco de Dados VETRIC"
echo "================================================"
echo ""
echo "📌 Cole a DATABASE_URL do Render abaixo:"
read DATABASE_URL

export DATABASE_URL

echo ""
echo "🚀 Executando migrations..."
echo ""

cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
npx tsx executar-migrations.ts

echo ""
echo "✅ Concluído!"


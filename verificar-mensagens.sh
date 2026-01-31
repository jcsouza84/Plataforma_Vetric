#!/bin/bash

echo "🔍 Verificando mensagens de notificação no banco de dados..."
echo ""
echo "📌 Cole a DATABASE_URL abaixo:"
read DATABASE_URL

export DATABASE_URL

cd "/Users/juliocesarsouza/Desktop/VETRIC - CVE"
npx tsx verificar-mensagens-banco.ts


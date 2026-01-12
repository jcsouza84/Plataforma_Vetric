#!/bin/bash

# Script para atualizar .env com credenciais de produção CVE-Pro

ENV_FILE="/Users/juliocesarsouza/Desktop/VETRIC - CVE/vetric-dashboard/backend/.env"

echo "🔧 Atualizando configurações de produção CVE-Pro..."

# Fazer backup
cp "$ENV_FILE" "$ENV_FILE.backup-$(date +%Y%m%d-%H%M%S)"

# Atualizar variáveis CVE-Pro
sed -i '' 's|CVE_API_BASE_URL=.*|CVE_API_BASE_URL=https://cs.intelbras-cve-pro.com.br|g' "$ENV_FILE"
sed -i '' 's|CVE_API_KEY=.*|CVE_API_KEY=808c0fb3-dc7f-40f5-b294-807f21fc8947|g' "$ENV_FILE"
sed -i '' 's|CVE_USERNAME=.*|CVE_USERNAME=julio@mundologic.com.br|g' "$ENV_FILE"
sed -i '' 's|CVE_PASSWORD=.*|CVE_PASSWORD=1a2b3c4d|g' "$ENV_FILE"

# Adicionar token se não existir (comentado por padrão)
if ! grep -q "CVE_TOKEN=" "$ENV_FILE"; then
  echo "# CVE_TOKEN=cole_aqui_o_token_do_browser" >> "$ENV_FILE"
fi

echo "✅ Configurações atualizadas!"
echo ""
echo "📋 Configurações CVE-Pro:"
echo "   Base URL: https://cs.intelbras-cve-pro.com.br"
echo "   API Key: 808c0fb3-***"
echo "   Username: julio@mundologic.com.br"
echo ""
echo "⚠️  IMPORTANTE: A API de produção requer token do browser!"
echo "    Siga os passos para extrair o token..."


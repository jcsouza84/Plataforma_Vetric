#!/bin/bash

echo "🧪 TESTE RÁPIDO: Verificar se rota /api/mensagens-notificacoes existe"
echo ""
echo "Testando backend em produção..."
echo ""

# Tentar acessar a rota
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://vetric-backend.onrender.com/api/mensagens-notificacoes)

if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
  echo "✅ ROTA EXISTE! (Status: $RESPONSE - Requer autenticação)"
  echo "✅ Backend está com o código atualizado!"
  echo ""
  echo "🎯 Agora faça hard refresh no navegador:"
  echo "   ⌘ + Shift + R (Mac)"
  echo "   Ctrl + Shift + R (Windows)"
  exit 0
elif [ "$RESPONSE" = "404" ]; then
  echo "❌ ROTA NÃO EXISTE! (Status: 404)"
  echo "❌ Backend ainda está com código antigo"
  echo ""
  echo "🔧 AÇÃO:"
  echo "   1. Faça Manual Deploy no Render"
  echo "   2. Aguarde 2-3 minutos"
  echo "   3. Execute este script novamente"
  exit 1
else
  echo "⚠️  Status inesperado: $RESPONSE"
  echo "   Verifique manualmente"
  exit 1
fi


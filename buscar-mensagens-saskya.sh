#!/bin/bash

# 🔍 Buscar Mensagens da Transação 439071 - Saskya Lorena
# Gran Marine 6 | 30/01/2026 20:45 - 22:35

echo "=================================================="
echo "🔍 BUSCANDO MENSAGENS - TRANSAÇÃO 439071"
echo "=================================================="
echo ""
echo "Usuário: saskya lorena"
echo "Carregador: Gran Marine 6 (JDBM1200040BB)"
echo "Data: 30/01/2026 20:45 - 22:35"
echo "Transaction ID: 439071"
echo ""
echo "=================================================="
echo ""

OUTPUT_FILE="mensagens_saskya_439071.txt"

echo "📝 Salvando em: $OUTPUT_FILE"
echo ""

# Criar arquivo de saída
cat > "$OUTPUT_FILE" << 'EOF'
====================================================
🔍 MENSAGENS DA TRANSAÇÃO 439071 - SASKYA LORENA
====================================================
Carregador: Gran Marine 6 (JDBM1200040BB)
Data: 30/01/2026 20:45 - 22:35
Duração: 1h50min
Energia: 11,4 kWh
====================================================

EOF

echo "🔍 Buscando nos logs..."
echo ""

# 1. Buscar por Transaction ID
echo "1️⃣ Procurando por Transaction ID: 439071"
echo "" >> "$OUTPUT_FILE"
echo "=== MENSAGENS COM TRANSACTION ID 439071 ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
grep -r "439071" logs/ >> "$OUTPUT_FILE" 2>/dev/null
COUNT1=$(grep -r "439071" logs/ 2>/dev/null | wc -l)
echo "   Encontradas: $COUNT1 mensagens"
echo ""

# 2. Buscar por saskya
echo "2️⃣ Procurando por 'saskya'"
echo "" >> "$OUTPUT_FILE"
echo "=== MENSAGENS COM 'SASKYA' ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
grep -ir "saskya" logs/ >> "$OUTPUT_FILE" 2>/dev/null
COUNT2=$(grep -ir "saskya" logs/ 2>/dev/null | wc -l)
echo "   Encontradas: $COUNT2 mensagens"
echo ""

# 3. Buscar por Gran Marine 6 na data
echo "3️⃣ Procurando Gran Marine 6 no dia 30/01/2026"
echo "" >> "$OUTPUT_FILE"
echo "=== MENSAGENS DO GRAN MARINE 6 EM 30/01/2026 ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
grep "JDBM1200040BB" logs/combined.log | grep "2026-01-30" >> "$OUTPUT_FILE" 2>/dev/null
COUNT3=$(grep "JDBM1200040BB" logs/combined.log 2>/dev/null | grep "2026-01-30" | wc -l)
echo "   Encontradas: $COUNT3 mensagens"
echo ""

# 4. Buscar no horário específico (20:00 - 23:00)
echo "4️⃣ Procurando entre 20:00 e 23:00"
echo "" >> "$OUTPUT_FILE"
echo "=== MENSAGENS ENTRE 20:00 E 23:00 ===" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
grep "JDBM1200040BB" logs/combined.log | grep "2026-01-30" | grep -E "(20:|21:|22:|23:)" >> "$OUTPUT_FILE" 2>/dev/null
COUNT4=$(grep "JDBM1200040BB" logs/combined.log 2>/dev/null | grep "2026-01-30" | grep -E "(20:|21:|22:|23:)" | wc -l)
echo "   Encontradas: $COUNT4 mensagens"
echo ""

# 5. Verificar se há logs da plataforma do síndico
echo "5️⃣ Procurando logs da plataforma do síndico"
if [ -d "apps/backend/logs" ]; then
    echo "" >> "$OUTPUT_FILE"
    echo "=== LOGS DO BACKEND (PLATAFORMA) ===" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    grep -r "saskya" apps/backend/logs/ >> "$OUTPUT_FILE" 2>/dev/null
    grep -r "439071" apps/backend/logs/ >> "$OUTPUT_FILE" 2>/dev/null
    COUNT5=$(grep -r "saskya\|439071" apps/backend/logs/ 2>/dev/null | wc -l)
    echo "   Encontradas: $COUNT5 mensagens"
else
    echo "   ⚠️  Diretório apps/backend/logs não encontrado"
fi
echo ""

# Resumo final
echo "" >> "$OUTPUT_FILE"
echo "=====================================================" >> "$OUTPUT_FILE"
echo "RESUMO" >> "$OUTPUT_FILE"
echo "=====================================================" >> "$OUTPUT_FILE"
echo "Total de mensagens encontradas:" >> "$OUTPUT_FILE"
echo "  - Por Transaction ID (439071): $COUNT1" >> "$OUTPUT_FILE"
echo "  - Por nome (saskya): $COUNT2" >> "$OUTPUT_FILE"
echo "  - Gran Marine 6 em 30/01: $COUNT3" >> "$OUTPUT_FILE"
echo "  - Horário 20:00-23:00: $COUNT4" >> "$OUTPUT_FILE"
echo "=====================================================" >> "$OUTPUT_FILE"

echo "=================================================="
echo "✅ BUSCA CONCLUÍDA!"
echo "=================================================="
echo ""
echo "📊 Resumo:"
echo "  - Transaction ID (439071): $COUNT1 mensagens"
echo "  - Nome (saskya): $COUNT2 mensagens"
echo "  - Gran Marine 6 em 30/01: $COUNT3 mensagens"
echo "  - Horário 20:00-23:00: $COUNT4 mensagens"
echo ""
echo "📄 Resultado salvo em: $OUTPUT_FILE"
echo ""
echo "Para ver o conteúdo:"
echo "  cat $OUTPUT_FILE"
echo ""
echo "=================================================="


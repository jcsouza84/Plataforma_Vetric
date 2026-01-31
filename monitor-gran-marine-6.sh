#!/bin/bash

# 🔍 Monitor Gran Marine 6 - Todas as Mensagens
# Carregador: Gran Marine 6
# ID: JDBM1200040BB

echo "=================================================="
echo "🔍 MONITOR GRAN MARINE 6"
echo "=================================================="
echo ""
echo "Carregador: Gran Marine 6"
echo "ID: JDBM1200040BB"
echo ""
echo "Este script mostrará:"
echo "  ✅ Status atual"
echo "  ✅ Todas as mudanças de status"
echo "  ✅ Início de recarga"
echo "  ✅ Finalização de recarga"
echo "  ✅ Ociosidade (SuspendedEV)"
echo "  ✅ Erros (Faulted)"
echo ""
echo "=================================================="
echo ""

# Arquivo de saída
OUTPUT_FILE="gran_marine_6_monitoring_$(date +%Y%m%d_%H%M%S).log"

echo "📝 Salvando logs em: $OUTPUT_FILE"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""
echo "=================================================="
echo ""

# Monitorar logs em tempo real
tail -f logs/combined.log | grep --line-buffered "JDBM1200040BB" | while read line; do
    timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] $line" | tee -a "$OUTPUT_FILE"
done


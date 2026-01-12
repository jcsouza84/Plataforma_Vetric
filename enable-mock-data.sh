#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║             🧪 HABILITANDO DADOS MOCKADOS PARA TESTE                          ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Criar dados mockados no backend
cat << 'MOCK_DATA' > /Users/juliocesarsouza/Desktop/VETRIC\ -\ CVE/vetric-dashboard/backend/src/services/MockCVEService.ts
/**
 * 🧪 MOCK CVE Service - Dados Fictícios para Teste
 */

export const mockChargers = [
  {
    uuid: 'mock-charger-1',
    nome: 'Gran Marine 1',
    chargeBoxId: 'GM-001',
    statusConector: 'Charging',
    ultimoBatimento: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min atrás
  },
  {
    uuid: 'mock-charger-2',
    nome: 'Gran Marine 2',
    chargeBoxId: 'GM-002',
    statusConector: 'Available',
    ultimoBatimento: new Date(Date.now() - 2 * 60000).toISOString(), // 2 min atrás
  },
  {
    uuid: 'mock-charger-3',
    nome: 'Gran Marine 3',
    chargeBoxId: 'GM-003',
    statusConector: 'SuspendedEV',
    ultimoBatimento: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min atrás
  },
  {
    uuid: 'mock-charger-4',
    nome: 'Gran Marine 4',
    chargeBoxId: 'GM-004',
    statusConector: 'Charging',
    ultimoBatimento: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min atrás
  },
  {
    uuid: 'mock-charger-5',
    nome: 'Gran Marine 5',
    chargeBoxId: 'GM-005',
    statusConector: 'Occupied',
    ultimoBatimento: new Date(Date.now() - 3 * 60000).toISOString(), // 3 min atrás
  },
  {
    uuid: 'mock-charger-6',
    nome: 'Gran Marine 6',
    chargeBoxId: 'GM-006',
    statusConector: 'Faulted',
    ultimoBatimento: new Date(Date.now() - 120 * 60000).toISOString(), // 2h atrás
  },
];
MOCK_DATA

# Atualizar dashboard.ts para usar mock
cat << 'DASHBOARD_MOCK' > /tmp/dashboard-route-patch.txt
// MOCK DATA ENABLED - Remove this when CVE API is connected
import { mockChargers } from '../services/MockCVEService';

router.get('/chargers', async (req: Request, res: Response) => {
  try {
    // Usar dados mockados temporariamente
    console.log('⚠️  Usando dados MOCKADOS (6 carregadores fictícios)');
    
    const response: ApiResponse = {
      success: true,
      data: mockChargers,
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('Erro ao buscar carregadores:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
DASHBOARD_MOCK

echo "✅ Arquivos de mock criados!"
echo ""
echo "📝 Para aplicar o mock, você precisa editar manualmente:"
echo ""
echo "   Arquivo: /Users/juliocesarsouza/Desktop/VETRIC - CVE/vetric-dashboard/backend/src/routes/dashboard.ts"
echo ""
echo "   Adicione no topo:"
echo "   import { mockChargers } from '../services/MockCVEService';"
echo ""
echo "   E na rota GET /chargers, retorne:"
echo "   data: mockChargers"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "💡 OU MELHOR: Vamos pegar o token CVE real! Siga o guia:"
echo "   /Users/juliocesarsouza/Desktop/VETRIC - CVE/PEGAR_TOKEN_CVE.md"
echo ""


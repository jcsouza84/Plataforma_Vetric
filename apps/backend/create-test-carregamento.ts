/**
 * 🧪 Script para criar um carregamento de teste
 */

import { query } from './src/config/database';
import { MoradorModel } from './src/models/Morador';
import { CarregamentoModel } from './src/models/Carregamento';

async function createTestCarregamento() {
  console.log('\n🧪 Criando carregamento de teste...\n');

  try {
    // 1. Buscar um morador
    const moradores = await MoradorModel.findAll();
    
    if (moradores.length === 0) {
      console.log('❌ Nenhum morador cadastrado!');
      console.log('   Execute primeiro: npm run seed:moradores\n');
      process.exit(1);
    }

    const morador = moradores[0];
    console.log(`✅ Morador selecionado: ${morador.nome} (Apto ${morador.apartamento})`);

    // 2. UUID real do Gran Marine 5 (que está com status Charging)
    const chargerUuid = '9a8b4db3-2188-4229-ae20-2c4aa61cd10a';
    const chargerName = 'Gran Marine 5';
    const connectorId = 1;

    // 3. Verificar se já existe carregamento ativo
    const existente = await CarregamentoModel.findActiveByCharger(chargerUuid, connectorId);
    
    if (existente) {
      console.log(`⚠️  Já existe um carregamento ativo para ${chargerName}`);
      console.log(`   ID: ${existente.id}`);
      console.log(`   Morador: ${existente.morador_id || 'Não identificado'}\n`);
      
      // Atualizar morador_id se estiver null
      if (!existente.morador_id && morador.id) {
        await query(
          'UPDATE carregamentos SET morador_id = $1 WHERE id = $2',
          [morador.id, existente.id]
        );
        console.log(`✅ Carregamento atualizado com morador!`);
      }
    } else {
      // 4. Criar novo carregamento de teste
      const carregamento = await CarregamentoModel.create({
        moradorId: morador.id!,
        chargerUuid,
        chargerName,
        connectorId,
        status: 'carregando',
      });

      console.log(`✅ Carregamento de teste criado!`);
      console.log(`   ID: ${carregamento.id}`);
      console.log(`   Carregador: ${chargerName}`);
      console.log(`   Morador: ${morador.nome} (Apto ${morador.apartamento})`);
    }

    // 5. Verificar resultado
    console.log('\n📊 Carregamentos ativos agora:');
    const ativos = await query<{
      id: number;
      charger_name: string;
      status: string;
      morador_nome: string;
      morador_apto: string;
    }>(
      `SELECT 
        c.id,
        c.charger_name,
        c.status,
        m.nome as morador_nome,
        m.apartamento as morador_apto
      FROM carregamentos c
      LEFT JOIN moradores m ON c.morador_id = m.id
      WHERE c.status IN ('iniciado', 'carregando')
      ORDER BY c.inicio DESC`
    );

    ativos.forEach((c) => {
      console.log(`   - ${c.charger_name}: ${c.morador_nome} (Apto ${c.morador_apto})`);
    });

    console.log('\n✅ Pronto! Execute novamente o teste:');
    console.log('   cd /Users/juliocesarsouza/Desktop/VETRIC\\ -\\ CVE');
    console.log('   ./TESTE_IMPLEMENTACAO.sh\n');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
createTestCarregamento()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });


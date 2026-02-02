/**
 * 🧪 SIMULADOR DE CARREGAMENTO - TESTE COMPLETO
 * 
 * Simula um morador iniciando carregamento e testa todo o fluxo:
 * 1. Cria carregamento no banco (como se viesse do CVE)
 * 2. Dispara lógica de notificação
 * 3. Mostra logs do que aconteceu
 * 4. Opção de enviar WhatsApp REAL ou MOCK
 */

import { config } from 'dotenv';
import { query } from './apps/backend/src/config/database';
import { CarregamentoModel } from './apps/backend/src/models/Carregamento';
import { MoradorModel } from './apps/backend/src/models/Morador';
import { notificationService } from './apps/backend/src/services/NotificationService';
import * as readline from 'readline';

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pergunta(questao: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(questao, (resposta) => {
      resolve(resposta);
    });
  });
}

interface MoradorTeste {
  id: number;
  nome: string;
  telefone: string;
  apartamento: string;
  notificacoes_ativas: boolean;
}

interface CarregadorDisponivel {
  uuid: string;
  nome: string;
}

async function listarMoradores(): Promise<MoradorTeste[]> {
  const moradores = await query<MoradorTeste>(`
    SELECT id, nome, telefone, apartamento, notificacoes_ativas
    FROM moradores
    WHERE telefone IS NOT NULL
    ORDER BY nome
    LIMIT 10
  `);
  return moradores;
}

async function listarCarregadores(): Promise<CarregadorDisponivel[]> {
  // UUIDs reais dos carregadores Gran Marine
  return [
    { uuid: 'c51a3fd6-3dde-47dc-9c72-aba6c7e26a97', nome: 'Gran Marine 1' },
    { uuid: '30afa190-0101-4f1e-ac9c-ca71ab88dd4e', nome: 'Gran Marine 2' },
    { uuid: '0uxm1200012v', nome: 'Gran Marine 3' },
    { uuid: '00001240B0002216', nome: 'Gran Marine 5' },
    { uuid: 'jdbm1200040b8', nome: 'Gran Marine 6' },
  ];
}

async function criarCarregamentoTeste(
  moradorId: number,
  chargerUuid: string,
  chargerName: string,
  mockEvolution: boolean
): Promise<number> {
  console.log('\n🔄 Criando carregamento de teste...');
  
  // Criar carregamento no banco
  const carregamento = await CarregamentoModel.create({
    moradorId,
    chargerUuid,
    chargerName,
    connectorId: 1,
    status: 'carregando'
  });

  console.log(`✅ Carregamento criado com ID: ${carregamento.id}`);
  console.log(`   📍 Charger: ${chargerName}`);
  console.log(`   👤 Morador ID: ${moradorId}`);
  console.log(`   🕐 Início: ${carregamento.inicio}`);

  return carregamento.id!;
}

async function aguardarTempoMinimo(segundos: number) {
  console.log(`\n⏳ Aguardando ${segundos} segundos (tempo mínimo para notificação)...`);
  for (let i = segundos; i > 0; i--) {
    process.stdout.write(`\r   ${i}s restante(s)...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\r   ✅ Tempo decorrido!                ');
}

async function enviarNotificacao(
  moradorId: number,
  chargerName: string,
  mockEvolution: boolean
): Promise<boolean> {
  console.log('\n📱 Disparando notificação...');

  const morador = await MoradorModel.findById(moradorId);
  if (!morador) {
    console.error('❌ Morador não encontrado!');
    return false;
  }

  console.log(`   👤 Para: ${morador.nome}`);
  console.log(`   📞 Telefone: ${morador.telefone}`);
  console.log(`   🏢 Apartamento: ${morador.apartamento}`);
  
  if (mockEvolution) {
    console.log(`   🧪 Modo: MOCK (não envia WhatsApp real)`);
    
    // Simular envio sem chamar Evolution API
    const mensagem = `🔋 Olá ${morador.nome}!\n\nSeu carregamento foi iniciado no ${chargerName}.\n\n📍 Local: General Luiz de França Albuquerque, Maceió\n🕐 Início: ${new Date().toLocaleString('pt-BR')}\n🏢 Apartamento: ${morador.apartamento}\n\nAcompanhe pelo dashboard VETRIC Gran Marine!`;
    
    console.log('\n📄 MENSAGEM QUE SERIA ENVIADA:');
    console.log('─'.repeat(60));
    console.log(mensagem);
    console.log('─'.repeat(60));
    
    // Salvar log mesmo no mock
    await query(`
      INSERT INTO logs_notificacoes (
        morador_id, tipo, mensagem_enviada, telefone, status, enviado_em
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [morador.id, 'inicio', mensagem, morador.telefone, 'enviado']);
    
    console.log('\n✅ [MOCK] Notificação simulada com sucesso!');
    console.log('   💾 Log salvo no banco de dados');
    return true;
    
  } else {
    console.log(`   🚀 Modo: REAL (envia WhatsApp de verdade via Evolution API)`);
    
    try {
      const sucesso = await notificationService.notificarInicio(
        moradorId,
        chargerName,
        'General Luiz de França Albuquerque, Maceió'
      );
      
      if (sucesso) {
        console.log('\n✅ Notificação REAL enviada com sucesso via Evolution API!');
        console.log('   📱 WhatsApp deve chegar em segundos...');
        return true;
      } else {
        console.log('\n❌ Falha ao enviar notificação!');
        return false;
      }
    } catch (error: any) {
      console.error('\n❌ Erro ao enviar notificação:', error.message);
      return false;
    }
  }
}

async function verificarNotificacao(carregamentoId: number) {
  console.log('\n🔍 Verificando status da notificação...');
  
  const carregamento = await query(`
    SELECT 
      c.*,
      m.nome as morador_nome,
      m.telefone
    FROM carregamentos c
    LEFT JOIN moradores m ON c.morador_id = m.id
    WHERE c.id = $1
  `, [carregamentoId]);

  if (carregamento.length > 0) {
    const c = carregamento[0];
    console.log('\n📊 STATUS DO CARREGAMENTO:');
    console.log(`   ID: ${c.id}`);
    console.log(`   Morador: ${c.morador_nome}`);
    console.log(`   Charger: ${c.charger_name}`);
    console.log(`   Notificação enviada: ${c.notificacao_inicio_enviada ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Status: ${c.status}`);
    console.log(`   Início: ${new Date(c.inicio).toLocaleString('pt-BR')}`);
  }

  // Verificar logs
  const logs = await query(`
    SELECT *
    FROM logs_notificacoes
    WHERE morador_id = (
      SELECT morador_id FROM carregamentos WHERE id = $1
    )
    ORDER BY criado_em DESC
    LIMIT 1
  `, [carregamentoId]);

  if (logs.length > 0) {
    const log = logs[0];
    console.log('\n📝 ÚLTIMO LOG DE NOTIFICAÇÃO:');
    console.log(`   Tipo: ${log.tipo}`);
    console.log(`   Status: ${log.status}`);
    console.log(`   Enviado em: ${new Date(log.criado_em).toLocaleString('pt-BR')}`);
    if (log.erro) {
      console.log(`   ❌ Erro: ${log.erro}`);
    }
  } else {
    console.log('\n⚠️  Nenhum log de notificação encontrado');
  }
}

async function limparCarregamentoTeste(carregamentoId: number, manter: boolean) {
  if (manter) {
    console.log('\n💾 Mantendo carregamento de teste no banco (para inspeção)');
    return;
  }

  const resposta = await pergunta('\n🗑️  Deseja remover o carregamento de teste? (s/N): ');
  
  if (resposta.toLowerCase() === 's') {
    await query('DELETE FROM carregamentos WHERE id = $1', [carregamentoId]);
    console.log('✅ Carregamento de teste removido');
  } else {
    console.log('💾 Carregamento mantido no banco (ID: ' + carregamentoId + ')');
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        🧪 SIMULADOR DE CARREGAMENTO - TESTE COMPLETO         ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Escolher modo de teste
    console.log('🎯 ESCOLHA O MODO DE TESTE:\n');
    console.log('1️⃣  MOCK    - Simula envio (não envia WhatsApp real)');
    console.log('2️⃣  REAL    - Envia WhatsApp de verdade via Evolution API\n');
    
    const modoEscolhido = await pergunta('Digite 1 (MOCK) ou 2 (REAL): ');
    const mockEvolution = modoEscolhido !== '2';
    
    if (mockEvolution) {
      console.log('\n✅ Modo MOCK selecionado - NÃO enviará WhatsApp real');
    } else {
      console.log('\n✅ Modo REAL selecionado - ENVIARÁ WhatsApp de verdade!');
      const confirma = await pergunta('   ⚠️  Tem certeza? (s/N): ');
      if (confirma.toLowerCase() !== 's') {
        console.log('❌ Teste cancelado pelo usuário');
        rl.close();
        process.exit(0);
      }
    }

    // 2. Listar moradores disponíveis
    console.log('\n📋 MORADORES DISPONÍVEIS PARA TESTE:\n');
    const moradores = await listarMoradores();
    
    if (moradores.length === 0) {
      console.log('❌ Nenhum morador com telefone cadastrado!');
      rl.close();
      process.exit(1);
    }

    moradores.forEach((m, index) => {
      const notifIcon = m.notificacoes_ativas ? '✅' : '❌';
      console.log(`${index + 1}. ${m.nome}`);
      console.log(`   📞 ${m.telefone}`);
      console.log(`   🏢 Apto ${m.apartamento}`);
      console.log(`   🔔 Notificações: ${notifIcon}`);
      console.log('');
    });

    const moradorEscolhido = await pergunta('Digite o número do morador: ');
    const indexMorador = parseInt(moradorEscolhido) - 1;
    
    if (indexMorador < 0 || indexMorador >= moradores.length) {
      console.log('❌ Morador inválido!');
      rl.close();
      process.exit(1);
    }

    const morador = moradores[indexMorador];
    console.log(`\n✅ Morador selecionado: ${morador.nome}`);

    // 3. Escolher carregador
    console.log('\n🔌 CARREGADORES DISPONÍVEIS:\n');
    const carregadores = await listarCarregadores();
    
    carregadores.forEach((c, index) => {
      console.log(`${index + 1}. ${c.nome}`);
    });

    const chargerEscolhido = await pergunta('\nDigite o número do carregador: ');
    const indexCharger = parseInt(chargerEscolhido) - 1;
    
    if (indexCharger < 0 || indexCharger >= carregadores.length) {
      console.log('❌ Carregador inválido!');
      rl.close();
      process.exit(1);
    }

    const charger = carregadores[indexCharger];
    console.log(`\n✅ Carregador selecionado: ${charger.nome}`);

    // 4. Criar carregamento
    const carregamentoId = await criarCarregamentoTeste(
      morador.id,
      charger.uuid,
      charger.nome,
      mockEvolution
    );

    // 5. Aguardar tempo mínimo (3 minutos simulados em 5 segundos)
    console.log('\n⏰ SIMULANDO PASSAGEM DE TEMPO...');
    console.log('   (Na prática, o sistema aguarda 3 minutos)');
    console.log('   (Neste teste, aguardaremos apenas 5 segundos)');
    
    await aguardarTempoMinimo(5);

    // 6. Marcar que já passou 3 minutos (simular)
    await query(`
      UPDATE carregamentos 
      SET inicio = NOW() - INTERVAL '4 minutes'
      WHERE id = $1
    `, [carregamentoId]);

    // 7. Enviar notificação
    const sucesso = await enviarNotificacao(morador.id, charger.nome, mockEvolution);

    if (sucesso) {
      // Marcar como enviada
      await CarregamentoModel.markNotificationSent(carregamentoId, 'inicio');
    }

    // 8. Verificar resultado
    await aguardarTempoMinimo(2);
    await verificarNotificacao(carregamentoId);

    // 9. Resumo final
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                                                               ║');
    console.log('║                  📊 RESUMO DO TESTE                           ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Morador: ${morador.nome}`);
    console.log(`✅ Telefone: ${morador.telefone}`);
    console.log(`✅ Carregador: ${charger.nome}`);
    console.log(`✅ Carregamento criado: ID ${carregamentoId}`);
    console.log(`✅ Notificação: ${sucesso ? 'ENVIADA' : 'FALHOU'}`);
    console.log(`✅ Modo: ${mockEvolution ? 'MOCK (simulado)' : 'REAL (WhatsApp enviado)'}`);

    if (!mockEvolution && sucesso) {
      console.log('\n📱 VERIFIQUE O WHATSAPP:');
      console.log(`   Número: ${morador.telefone}`);
      console.log('   A mensagem deve chegar em alguns segundos!');
    }

    // 10. Limpar
    await limparCarregamentoTeste(carregamentoId, !mockEvolution);

    console.log('\n✅ Teste concluído com sucesso!\n');

  } catch (error: any) {
    console.error('\n❌ Erro durante o teste:', error.message);
    console.error(error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();

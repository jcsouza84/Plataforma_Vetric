import { EvolutionAPIService } from '../services/evolution-api.service';
import chalk from 'chalk';

/**
 * Exemplos práticos de uso do Evolution API Service
 * 
 * Execute: npx tsx src/examples/evolution-usage-example.ts
 */

async function main() {
  console.log(chalk.bold.cyan('\n🚀 EXEMPLOS DE USO - EVOLUTION API SERVICE\n'));

  // Criar instância do serviço
  const whatsapp = new EvolutionAPIService();

  // ============================================
  // EXEMPLO 1: Verificar conexão
  // ============================================
  console.log(chalk.yellow('1️⃣  Verificando conexão...\n'));
  
  const isConnected = await whatsapp.isConnected();
  console.log(chalk.white('Status:'), isConnected ? chalk.green('✅ Online') : chalk.red('❌ Offline'));

  if (!isConnected) {
    console.log(chalk.red('\n❌ Instância offline. Verifique a conexão.\n'));
    process.exit(1);
  }

  // ============================================
  // EXEMPLO 2: Listar instâncias
  // ============================================
  console.log(chalk.yellow('\n2️⃣  Listando instâncias...\n'));
  
  const instances = await whatsapp.listInstances();
  console.log(chalk.white(`Total de instâncias: ${chalk.bold(instances.length)}\n`));
  
  instances.forEach((instance, index) => {
    console.log(chalk.cyan(`[${index + 1}] ${instance.name}`));
    console.log(chalk.white(`    Número: ${instance.number}`));
    console.log(chalk.white(`    Status: ${instance.connectionStatus}`));
    console.log(chalk.white(`    Mensagens: ${instance._count.Message}`));
  });

  // ============================================
  // EXEMPLO 3: Enviar mensagem simples
  // ============================================
  console.log(chalk.yellow('\n3️⃣  Enviando mensagem de teste...\n'));
  
  const testMessage = await whatsapp.sendText(
    '558291096461', // Número do próprio bot para teste
    '🧪 Teste de envio via Evolution API Service'
  );
  
  console.log(chalk.green('✅ Mensagem enviada!'));
  console.log(chalk.gray('ID:', testMessage.key.id));

  // ============================================
  // EXEMPLO 4: Notificar início de carregamento
  // ============================================
  console.log(chalk.yellow('\n4️⃣  Simulando notificação de carregamento...\n'));
  
  await whatsapp.notifyChargingStarted({
    userPhone: '558291096461',
    chargerName: 'Carregador 01 - Shopping Center',
    userName: 'João da Silva'
  });
  
  console.log(chalk.green('✅ Notificação de início enviada!'));

  // ============================================
  // EXEMPLO 5: Notificar conclusão de carregamento
  // ============================================
  console.log(chalk.yellow('\n5️⃣  Simulando conclusão de carregamento...\n'));
  
  await whatsapp.notifyChargingCompleted({
    userPhone: '558291096461',
    chargerName: 'Carregador 01 - Shopping Center',
    energyKwh: 42.5,
    durationMinutes: 120,
    cost: 85.00
  });
  
  console.log(chalk.green('✅ Notificação de conclusão enviada!'));

  // ============================================
  // EXEMPLO 6: Confirmar reserva
  // ============================================
  console.log(chalk.yellow('\n6️⃣  Simulando confirmação de reserva...\n'));
  
  await whatsapp.confirmReservation({
    userPhone: '558291096461',
    chargerName: 'Carregador 03 - Estacionamento Sul',
    dateTime: '13/01/2026 às 14:30',
    userName: 'Maria Santos'
  });
  
  console.log(chalk.green('✅ Confirmação de reserva enviada!'));

  // ============================================
  // EXEMPLO 7: Alerta de falha (admin)
  // ============================================
  console.log(chalk.yellow('\n7️⃣  Simulando alerta de falha...\n'));
  
  await whatsapp.sendFailureAlert({
    adminPhone: '558291096461',
    chargerName: 'Carregador 02',
    errorMessage: 'Falha na comunicação OCPP - Offline há 5 minutos'
  });
  
  console.log(chalk.green('✅ Alerta de falha enviado!'));

  // ============================================
  // EXEMPLO 8: Relatório diário
  // ============================================
  console.log(chalk.yellow('\n8️⃣  Simulando relatório diário...\n'));
  
  await whatsapp.sendDailyReport({
    adminPhone: '558291096461',
    totalCharges: 47,
    totalEnergy: 325.8,
    activeUsers: 15,
    revenue: 1450.50
  });
  
  console.log(chalk.green('✅ Relatório diário enviado!'));

  // ============================================
  // EXEMPLO 9: Notificar carregador disponível
  // ============================================
  console.log(chalk.yellow('\n9️⃣  Simulando notificação de disponibilidade...\n'));
  
  await whatsapp.notifyChargerAvailable({
    userPhone: '558291096461',
    chargerName: 'Carregador 01 - Shopping Center',
    userName: 'Carlos Oliveira'
  });
  
  console.log(chalk.green('✅ Notificação de disponibilidade enviada!'));

  // ============================================
  // EXEMPLO 10: Cancelar reserva
  // ============================================
  console.log(chalk.yellow('\n🔟  Simulando cancelamento de reserva...\n'));
  
  await whatsapp.cancelReservation({
    userPhone: '558291096461',
    chargerName: 'Carregador 03',
    reason: 'Manutenção programada no carregador'
  });
  
  console.log(chalk.green('✅ Cancelamento enviado!'));

  // ============================================
  // FINALIZAÇÃO
  // ============================================
  console.log(chalk.bold.green('\n✅ TODOS OS EXEMPLOS EXECUTADOS COM SUCESSO!\n'));
  console.log(chalk.white('📱 Verifique o WhatsApp 558291096461 para ver as mensagens.\n'));
  console.log(chalk.white('💡 Dica: Personalize os exemplos de acordo com suas necessidades.\n'));
  console.log(chalk.white('📚 Veja mais em: src/services/evolution-api.service.ts\n'));
}

// Executar exemplos
main().catch(error => {
  console.error(chalk.red('\n❌ Erro:'), error.message);
  if (error.response) {
    console.error(chalk.yellow('Status:'), error.response.status);
    console.error(chalk.yellow('Detalhes:'), error.response.data);
  }
  process.exit(1);
});


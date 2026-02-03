import { Pool } from 'pg';

const DATABASE_URL = 'postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db';

const monitorarRender = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║           🔍 MONITORAMENTO TEMPO REAL - RENDER                            ║
║                                                                           ║
║   Sistema de Notificações em Produção                                    ║
║   Atualiza a cada 15 segundos                                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  const pool = new Pool({ 
    connectionString: DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });

  let contador = 0;

  const monitorar = async () => {
    try {
      contador++;
      const agora = new Date().toLocaleString('pt-BR');

      console.clear();
      console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║           🔍 MONITORAMENTO TEMPO REAL - RENDER                            ║
║                                                                           ║
║   📅 ${agora}                                     ║
║   🔄 Atualização #${contador.toString().padStart(4, '0')}                                             ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

      // 1. Carregamentos ativos
      console.log('\n⚡ CARREGAMENTOS ATIVOS AGORA:');
      console.log('═══════════════════════════════════════════════════════════════════════════');
      
      const carregamentos = await pool.query(`
        SELECT 
          c.id,
          c.charger_name,
          m.nome,
          m.telefone,
          c.notificacao_inicio_enviada,
          c.inicio,
          ROUND(EXTRACT(EPOCH FROM (NOW() - c.inicio))/60) as minutos_ativo
        FROM carregamentos c
        LEFT JOIN moradores m ON c.morador_id = m.id
        WHERE c.fim IS NULL
        ORDER BY c.inicio DESC
      `);

      if (carregamentos.rows.length === 0) {
        console.log('   ℹ️  Nenhum carregamento ativo no momento');
      } else {
        carregamentos.rows.forEach((c: any) => {
          const status = c.notificacao_inicio_enviada ? '✅ Enviada' : '⏳ Pendente';
          const tempoStatus = c.minutos_ativo >= 3 ? '✅' : '⏰';
          console.log(`   ${tempoStatus} ID ${c.id}: ${c.charger_name}`);
          console.log(`      👤 ${c.nome || 'Sem morador'}`);
          console.log(`      📞 ${c.telefone || 'Sem telefone'}`);
          console.log(`      ⏱️  ${c.minutos_ativo} min ativo | Notif: ${status}`);
          console.log('');
        });
      }

      // 2. Notificações enviadas recentemente
      console.log('\n📱 NOTIFICAÇÕES ENVIADAS (ÚLTIMA HORA):');
      console.log('═══════════════════════════════════════════════════════════════════════════');
      
      const notificacoes = await pool.query(`
        SELECT 
          l.id,
          m.nome,
          l.tipo,
          l.status,
          l.criado_em,
          ROUND(EXTRACT(EPOCH FROM (NOW() - l.criado_em))/60) as min_atras
        FROM logs_notificacoes l
        LEFT JOIN moradores m ON l.morador_id = m.id
        WHERE l.criado_em > NOW() - INTERVAL '1 hour'
        ORDER BY l.criado_em DESC
        LIMIT 10
      `);

      if (notificacoes.rows.length === 0) {
        console.log('   ℹ️  Nenhuma notificação enviada na última hora');
      } else {
        notificacoes.rows.forEach((n: any) => {
          const statusIcon = n.status === 'enviado' ? '✅' : '❌';
          console.log(`   ${statusIcon} ${n.nome || 'Desconhecido'}`);
          console.log(`      📝 Tipo: ${n.tipo} | Status: ${n.status}`);
          console.log(`      🕐 ${n.min_atras} min atrás`);
          console.log('');
        });
      }

      // 3. Estatísticas gerais
      console.log('\n📊 ESTATÍSTICAS DO SISTEMA:');
      console.log('═══════════════════════════════════════════════════════════════════════════');

      const stats = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM carregamentos WHERE fim IS NULL) as carregamentos_ativos,
          (SELECT COUNT(*) FROM carregamentos WHERE notificacao_inicio_enviada = false AND fim IS NULL) as notif_pendentes,
          (SELECT COUNT(*) FROM moradores WHERE notificacoes_ativas = true AND telefone IS NOT NULL) as moradores_ativos,
          (SELECT COUNT(*) FROM logs_notificacoes WHERE criado_em > NOW() - INTERVAL '1 hour') as notif_ultima_hora,
          (SELECT COUNT(*) FROM logs_notificacoes WHERE criado_em > NOW() - INTERVAL '24 hours') as notif_24h,
          (SELECT COUNT(*) FROM logs_notificacoes WHERE status = 'enviado') as total_enviadas,
          (SELECT COUNT(*) FROM logs_notificacoes WHERE status = 'falha') as total_falhas
      `);

      const s = stats.rows[0];
      console.log(`   ⚡ Carregamentos ativos: ${s.carregamentos_ativos}`);
      console.log(`   ⏳ Notificações pendentes: ${s.notif_pendentes}`);
      console.log(`   👥 Moradores com notif. ativas: ${s.moradores_ativos}`);
      console.log(`   📱 Notif. última hora: ${s.notif_ultima_hora}`);
      console.log(`   📅 Notif. últimas 24h: ${s.notif_24h}`);
      console.log(`   ✅ Total enviadas (sempre): ${s.total_enviadas}`);
      console.log(`   ❌ Total falhas (sempre): ${s.total_falhas}`);

      // 4. Templates ativos
      console.log('\n⚙️  TEMPLATES ATIVOS:');
      console.log('═══════════════════════════════════════════════════════════════════════════');

      const templates = await pool.query(`
        SELECT tipo, ativo, tempo_minutos, power_threshold_w
        FROM templates_notificacao
        ORDER BY 
          CASE tipo
            WHEN 'inicio_recarga' THEN 1
            WHEN 'inicio_ociosidade' THEN 2
            WHEN 'bateria_cheia' THEN 3
            WHEN 'interrupcao' THEN 4
          END
      `);

      templates.rows.forEach((t: any) => {
        const statusIcon = t.ativo ? '✅' : '❌';
        const tempoInfo = t.tempo_minutos > 0 ? `${t.tempo_minutos}min` : 'imediato';
        const powerInfo = t.power_threshold_w ? `${t.power_threshold_w}W` : 'N/A';
        console.log(`   ${statusIcon} ${t.tipo}: Tempo=${tempoInfo} | Power=${powerInfo}`);
      });

      console.log('\n═══════════════════════════════════════════════════════════════════════════');
      console.log('   🔄 Próxima atualização em 15 segundos...');
      console.log('   💡 Pressione Ctrl+C para sair');
      console.log('═══════════════════════════════════════════════════════════════════════════\n');

    } catch (error: any) {
      console.error('\n❌ Erro ao monitorar:', error.message);
    }
  };

  // Monitorar a cada 15 segundos
  await monitorar(); // Primeira execução imediata
  setInterval(monitorar, 15000);
};

// Iniciar monitoramento
monitorarRender().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});

// Tratar Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n✅ Monitoramento encerrado pelo usuário.');
  process.exit(0);
});

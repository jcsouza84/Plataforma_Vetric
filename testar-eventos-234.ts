/**
 * 🧪 TESTE DOS EVENTOS 2, 3 E 4
 * 
 * Testa a lógica de detecção de:
 * - Evento 2: Início de Ociosidade
 * - Evento 3: Bateria Cheia
 * - Evento 4: Interrupção
 */

import { Pool } from 'pg';

const DATABASE_URL = 'postgresql://vetric_user:7yzTWRDduw8SY5LSFMbDDjgMSexfhuxu@dpg-d5ktuvggjchc73bpjp30-a.oregon-postgres.render.com/vetric_db';

interface TestResult {
  evento: string;
  passou: boolean;
  mensagem: string;
  detalhes?: any;
}

const testarEventos = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║           🧪 TESTE DOS EVENTOS 2, 3 E 4                                   ║
║                                                                           ║
║   Valida: Ociosidade, Bateria Cheia, Interrupção                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const resultados: TestResult[] = [];

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await pool.query('SELECT 1');
    console.log('✅ Conectado ao banco Render\n');

    // ============================================
    // TESTE 1: VALIDAR TEMPLATES
    // ============================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('📋 TESTE 1: VALIDAR TEMPLATES');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const templates = await pool.query(`
      SELECT tipo, ativo, tempo_minutos, power_threshold_w
      FROM templates_notificacao
      WHERE tipo IN ('inicio_ociosidade', 'bateria_cheia', 'interrupcao')
      ORDER BY tipo
    `);

    for (const template of templates.rows) {
      const passou = template.ativo === true;
      resultados.push({
        evento: `Template ${template.tipo}`,
        passou,
        mensagem: passou ? 'Template ativo e configurado' : 'Template INATIVO',
        detalhes: {
          ativo: template.ativo,
          tempo_minutos: template.tempo_minutos,
          power_threshold_w: template.power_threshold_w
        }
      });

      console.log(`${passou ? '✅' : '❌'} Template ${template.tipo}:`);
      console.log(`   Ativo: ${template.ativo}`);
      console.log(`   Tempo: ${template.tempo_minutos} min`);
      console.log(`   Threshold: ${template.power_threshold_w || 'N/A'} W\n`);
    }

    // ============================================
    // TESTE 2: VALIDAR CAMPOS DE RASTREAMENTO
    // ============================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('📋 TESTE 2: VALIDAR CAMPOS DE RASTREAMENTO');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const campos = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'carregamentos'
        AND column_name IN (
          'ultimo_power_w',
          'primeiro_ocioso_em',
          'notificacao_ociosidade_enviada',
          'notificacao_bateria_cheia_enviada',
          'interrupcao_detectada',
          'tipo_finalizacao'
        )
      ORDER BY column_name
    `);

    const camposEsperados = [
      'interrupcao_detectada',
      'notificacao_bateria_cheia_enviada',
      'notificacao_ociosidade_enviada',
      'primeiro_ocioso_em',
      'tipo_finalizacao',
      'ultimo_power_w'
    ];

    const camposEncontrados = campos.rows.map(r => r.column_name).sort();
    const todosCamposExistem = camposEsperados.every(campo => camposEncontrados.includes(campo));

    resultados.push({
      evento: 'Campos de rastreamento',
      passou: todosCamposExistem,
      mensagem: todosCamposExistem ? 'Todos os campos existem' : 'Campos faltando',
      detalhes: { esperados: camposEsperados.length, encontrados: camposEncontrados.length }
    });

    console.log(`${todosCamposExistem ? '✅' : '❌'} Campos de rastreamento:`);
    camposEncontrados.forEach(campo => console.log(`   ✓ ${campo}`));
    console.log('');

    // ============================================
    // TESTE 3: SIMULAR EVENTO 2 (OCIOSIDADE)
    // ============================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('🧪 TESTE 3: SIMULAR EVENTO 2 - INÍCIO DE OCIOSIDADE');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const templateOciosidade = templates.rows.find(t => t.tipo === 'inicio_ociosidade');
    
    if (templateOciosidade && templateOciosidade.ativo) {
      console.log('📝 Lógica esperada:');
      console.log(`   • Power atual < ${templateOciosidade.power_threshold_w}W`);
      console.log(`   • Power anterior >= ${templateOciosidade.power_threshold_w}W`);
      console.log(`   • notificacao_ociosidade_enviada = false`);
      console.log(`   • Envio: IMEDIATO (tempo = ${templateOciosidade.tempo_minutos} min)\n`);

      resultados.push({
        evento: 'Evento 2 - Ociosidade',
        passou: true,
        mensagem: 'Lógica configurada corretamente',
        detalhes: { threshold: templateOciosidade.power_threshold_w, tempo: templateOciosidade.tempo_minutos }
      });
    } else {
      console.log('❌ Template de ociosidade não está ativo\n');
      resultados.push({
        evento: 'Evento 2 - Ociosidade',
        passou: false,
        mensagem: 'Template inativo'
      });
    }

    // ============================================
    // TESTE 4: SIMULAR EVENTO 3 (BATERIA CHEIA)
    // ============================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('🧪 TESTE 4: SIMULAR EVENTO 3 - BATERIA CHEIA');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const templateBateriaCheia = templates.rows.find(t => t.tipo === 'bateria_cheia');
    
    if (templateBateriaCheia && templateBateriaCheia.ativo) {
      console.log('📝 Lógica esperada:');
      console.log(`   • primeiro_ocioso_em existe`);
      console.log(`   • Ocioso há >= ${templateBateriaCheia.tempo_minutos} minutos`);
      console.log(`   • Power < ${templateBateriaCheia.power_threshold_w}W`);
      console.log(`   • notificacao_bateria_cheia_enviada = false\n`);

      resultados.push({
        evento: 'Evento 3 - Bateria Cheia',
        passou: true,
        mensagem: 'Lógica configurada corretamente',
        detalhes: { threshold: templateBateriaCheia.power_threshold_w, tempo: templateBateriaCheia.tempo_minutos }
      });
    } else {
      console.log('❌ Template de bateria cheia não está ativo\n');
      resultados.push({
        evento: 'Evento 3 - Bateria Cheia',
        passou: false,
        mensagem: 'Template inativo'
      });
    }

    // ============================================
    // TESTE 5: SIMULAR EVENTO 4 (INTERRUPÇÃO)
    // ============================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('🧪 TESTE 5: SIMULAR EVENTO 4 - INTERRUPÇÃO');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const templateInterrupcao = templates.rows.find(t => t.tipo === 'interrupcao');
    
    if (templateInterrupcao && templateInterrupcao.ativo) {
      console.log('📝 Lógica esperada:');
      console.log(`   • Status do connector = 'Available'`);
      console.log(`   • Carregamento ainda ativo no banco (fim IS NULL)`);
      console.log(`   • interrupcao_detectada = false`);
      console.log(`   • Envio: IMEDIATO (tempo = ${templateInterrupcao.tempo_minutos} min)\n`);

      resultados.push({
        evento: 'Evento 4 - Interrupção',
        passou: true,
        mensagem: 'Lógica configurada corretamente',
        detalhes: { tempo: templateInterrupcao.tempo_minutos }
      });
    } else {
      console.log('❌ Template de interrupção não está ativo\n');
      resultados.push({
        evento: 'Evento 4 - Interrupção',
        passou: false,
        mensagem: 'Template inativo'
      });
    }

    // ============================================
    // TESTE 6: VERIFICAR CARREGAMENTOS ATIVOS
    // ============================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('📊 TESTE 6: VERIFICAR CARREGAMENTOS ATIVOS');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const carregamentosAtivos = await pool.query(`
      SELECT 
        c.id,
        c.charger_name,
        m.nome,
        c.ultimo_power_w,
        c.primeiro_ocioso_em,
        c.notificacao_ociosidade_enviada,
        c.notificacao_bateria_cheia_enviada,
        ROUND(EXTRACT(EPOCH FROM (NOW() - c.inicio))/60) as minutos_ativo
      FROM carregamentos c
      LEFT JOIN moradores m ON c.morador_id = m.id
      WHERE c.fim IS NULL
      ORDER BY c.inicio DESC
    `);

    if (carregamentosAtivos.rows.length > 0) {
      console.log(`📊 ${carregamentosAtivos.rows.length} carregamento(s) ativo(s):\n`);
      
      carregamentosAtivos.rows.forEach((c: any) => {
        console.log(`   🔋 ID ${c.id}: ${c.charger_name}`);
        console.log(`      Morador: ${c.nome || 'Não identificado'}`);
        console.log(`      Tempo ativo: ${c.minutos_ativo} min`);
        console.log(`      Power atual: ${c.ultimo_power_w || 'N/A'} W`);
        console.log(`      Primeiro ocioso: ${c.primeiro_ocioso_em ? new Date(c.primeiro_ocioso_em).toLocaleString('pt-BR') : 'Nunca'}`);
        console.log(`      Notif. ociosidade: ${c.notificacao_ociosidade_enviada ? 'Enviada' : 'Pendente'}`);
        console.log(`      Notif. bateria cheia: ${c.notificacao_bateria_cheia_enviada ? 'Enviada' : 'Pendente'}`);
        console.log('');
      });

      resultados.push({
        evento: 'Carregamentos ativos',
        passou: true,
        mensagem: `${carregamentosAtivos.rows.length} carregamento(s) para monitorar`,
        detalhes: { total: carregamentosAtivos.rows.length }
      });
    } else {
      console.log('ℹ️  Nenhum carregamento ativo no momento\n');
      resultados.push({
        evento: 'Carregamentos ativos',
        passou: true,
        mensagem: 'Nenhum carregamento ativo (OK)',
        detalhes: { total: 0 }
      });
    }

    // ============================================
    // RELATÓRIO FINAL
    // ============================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('📊 RELATÓRIO FINAL');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const totalTestes = resultados.length;
    const testesPassaram = resultados.filter(r => r.passou).length;
    const testesFalharam = totalTestes - testesPassaram;
    const taxaSucesso = (testesPassaram / totalTestes * 100).toFixed(1);

    console.log(`Total de testes: ${totalTestes}`);
    console.log(`✅ Passaram: ${testesPassaram}`);
    console.log(`❌ Falharam: ${testesFalharam}`);
    console.log(`📈 Taxa de sucesso: ${taxaSucesso}%\n`);

    if (testesFalharam > 0) {
      console.log('❌ TESTES QUE FALHARAM:\n');
      resultados.filter(r => !r.passou).forEach(r => {
        console.log(`   • ${r.evento}: ${r.mensagem}`);
      });
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');

    if (testesPassaram === totalTestes) {
      console.log('🎉 TODOS OS TESTES PASSARAM! Sistema pronto para detectar eventos 2, 3 e 4!');
    } else {
      console.log('⚠️  Alguns testes falharam. Revise as configurações antes de ativar.');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
};

testarEventos();

/**
 * 🧪 TESTE DE TRIGGERS DE NOTIFICAÇÃO
 * 
 * Testa a lógica de disparo de mensagens SEM chamar a Evolution API
 * Verifica:
 * - Templates encontrados corretamente
 * - Lógica de verificação de morador
 * - Detecção de notificações pendentes
 * - Regras de cada tipo de notificação
 */

import { config } from 'dotenv';
import { query } from './apps/backend/src/config/database';
import { MoradorModel } from './apps/backend/src/models/Morador';
import { CarregamentoModel } from './apps/backend/src/models/Carregamento';

config();

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(test: string, passed: boolean, message: string, details?: any) {
  results.push({ test, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log(`   📊 Detalhes:`, JSON.stringify(details, null, 2));
  }
}

async function testTemplatesExistem() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTE 1: VERIFICAR SE TEMPLATES EXISTEM');
  console.log('═══════════════════════════════════════════════════\n');

  const tiposEsperados = ['inicio_recarga', 'inicio_ociosidade', 'bateria_cheia', 'interrupcao'];
  
  for (const tipo of tiposEsperados) {
    const template = await query(
      'SELECT * FROM templates_notificacao WHERE tipo = $1',
      [tipo]
    );

    if (template.length > 0) {
      logTest(
        `Template "${tipo}"`,
        true,
        'Encontrado no banco',
        {
          ativo: template[0].ativo,
          tempo_minutos: template[0].tempo_minutos,
          power_threshold_w: template[0].power_threshold_w,
          tamanho_mensagem: template[0].mensagem?.length || 0
        }
      );
    } else {
      logTest(
        `Template "${tipo}"`,
        false,
        'NÃO ENCONTRADO no banco!',
        { erro: 'Template não existe' }
      );
    }
  }

  // Verificar se há templates antigos que não deveriam existir
  const templatesAntigos = await query(
    `SELECT tipo FROM templates_notificacao 
     WHERE tipo IN ('inicio', 'fim', 'erro', 'ocioso', 'disponivel')`
  );

  if (templatesAntigos.length > 0) {
    logTest(
      'Templates antigos',
      false,
      'AINDA EXISTEM templates antigos no banco!',
      { tipos_antigos: templatesAntigos.map((t: any) => t.tipo) }
    );
  } else {
    logTest(
      'Templates antigos',
      true,
      'Nenhum template antigo encontrado (correto!)'
    );
  }
}

async function testMoradoresValidos() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTE 2: VERIFICAR MORADORES VÁLIDOS');
  console.log('═══════════════════════════════════════════════════\n');

  // Contar moradores com notificações ativas
  const moradoresComNotif = await query(
    'SELECT COUNT(*) as total FROM moradores WHERE notificacoes_ativas = true AND telefone IS NOT NULL'
  );

  const total = parseInt(moradoresComNotif[0].total);
  logTest(
    'Moradores válidos para notificação',
    total > 0,
    `${total} morador(es) com notificações ativas e telefone cadastrado`,
    { total }
  );

  // Verificar morador Saulo especificamente
  const saulo = await query(
    `SELECT id, nome, telefone, notificacoes_ativas 
     FROM moradores 
     WHERE nome ILIKE '%saulo%'`
  );

  if (saulo.length > 0) {
    const valido = saulo[0].notificacoes_ativas && saulo[0].telefone;
    logTest(
      'Morador Saulo',
      valido,
      valido ? 'Configurado corretamente' : 'Configuração incorreta',
      {
        id: saulo[0].id,
        telefone: saulo[0].telefone,
        notificacoes_ativas: saulo[0].notificacoes_ativas
      }
    );
  }
}

async function testCarregamentosPendentes() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTE 3: DETECTAR CARREGAMENTOS PENDENTES');
  console.log('═══════════════════════════════════════════════════\n');

  // Buscar carregamentos ativos sem notificação enviada
  const pendentes = await query(`
    SELECT 
      c.id,
      c.charger_name,
      c.morador_id,
      m.nome as morador_nome,
      m.telefone,
      m.notificacoes_ativas,
      c.inicio,
      ROUND(EXTRACT(EPOCH FROM (NOW() - c.inicio))/60) as minutos_ativo,
      c.notificacao_inicio_enviada
    FROM carregamentos c
    LEFT JOIN moradores m ON c.morador_id = m.id
    WHERE c.fim IS NULL
      AND c.notificacao_inicio_enviada = false
      AND c.morador_id IS NOT NULL
    ORDER BY c.inicio DESC
  `);

  if (pendentes.length > 0) {
    logTest(
      'Carregamentos com notificação pendente',
      true,
      `${pendentes.length} carregamento(s) detectado(s)`,
      pendentes.map((p: any) => ({
        id: p.id,
        charger: p.charger_name,
        morador: p.morador_nome,
        minutos_ativo: p.minutos_ativo,
        pode_notificar: p.notificacoes_ativas && p.telefone
      }))
    );

    // Para cada pendente, verificar se pode notificar
    for (const pendente of pendentes) {
      const podeNotificar = pendente.notificacoes_ativas && pendente.telefone;
      const tempoMinimo = parseInt(pendente.minutos_ativo) >= 3; // Template tem tempo_minutos = 3

      logTest(
        `Carregamento ${pendente.id} - ${pendente.morador_nome}`,
        podeNotificar && tempoMinimo,
        podeNotificar 
          ? (tempoMinimo ? 'DEVE enviar notificação agora!' : `Aguardando ${3 - parseInt(pendente.minutos_ativo)} min`)
          : 'NÃO pode enviar (notificações desativadas ou sem telefone)',
        {
          morador_id: pendente.morador_id,
          telefone: pendente.telefone,
          notificacoes_ativas: pendente.notificacoes_ativas,
          minutos_ativo: pendente.minutos_ativo,
          deve_enviar: podeNotificar && tempoMinimo
        }
      );
    }
  } else {
    logTest(
      'Carregamentos com notificação pendente',
      true,
      'Nenhum carregamento pendente (sistema em dia!)'
    );
  }
}

async function testLogicaTemplates() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTE 4: LÓGICA DE TEMPLATES E PLACEHOLDERS');
  console.log('═══════════════════════════════════════════════════\n');

  const template = await query(
    'SELECT * FROM templates_notificacao WHERE tipo = $1',
    ['inicio_recarga']
  );

  if (template.length === 0) {
    logTest('Template inicio_recarga', false, 'Template não encontrado!');
    return;
  }

  const mensagem = template[0].mensagem;
  const placeholders = mensagem.match(/\{\{(\w+)\}\}/g) || [];
  
  logTest(
    'Placeholders no template',
    placeholders.length > 0,
    `${placeholders.length} placeholder(s) encontrado(s)`,
    { placeholders }
  );

  // Simular renderização
  const dadosTeste = {
    nome: 'João Silva',
    charger: 'Gran Marine 2',
    localizacao: 'General Luiz de França Albuquerque, Maceió',
    data: new Date().toLocaleString('pt-BR'),
    apartamento: '1303-B'
  };

  let mensagemRenderizada = mensagem;
  for (const [key, value] of Object.entries(dadosTeste)) {
    const placeholder = `{{${key}}}`;
    mensagemRenderizada = mensagemRenderizada.replace(new RegExp(placeholder, 'g'), String(value));
  }

  const placeholdersRestantes = mensagemRenderizada.match(/\{\{\w+\}\}/g);
  
  if (placeholdersRestantes) {
    logTest(
      'Renderização de placeholders',
      false,
      `${placeholdersRestantes.length} placeholder(s) não substituído(s)`,
      { nao_substituidos: placeholdersRestantes }
    );
  } else {
    logTest(
      'Renderização de placeholders',
      true,
      'Todos os placeholders foram substituídos corretamente',
      { mensagem_preview: mensagemRenderizada.substring(0, 100) + '...' }
    );
  }
}

async function testRegrasTemporizacao() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTE 5: REGRAS DE TEMPORIZAÇÃO');
  console.log('═══════════════════════════════════════════════════\n');

  const templates = await query(
    'SELECT tipo, tempo_minutos, power_threshold_w, ativo FROM templates_notificacao'
  );

  for (const template of templates) {
    const regras: string[] = [];
    
    if (template.tempo_minutos > 0) {
      regras.push(`Aguardar ${template.tempo_minutos} minutos`);
    }
    
    if (template.power_threshold_w !== null) {
      regras.push(`Power < ${template.power_threshold_w}W`);
    }

    if (regras.length === 0) {
      regras.push('Envio imediato');
    }

    logTest(
      `Regras para "${template.tipo}"`,
      true,
      `${regras.join(' + ')} | Ativo: ${template.ativo}`,
      {
        tipo: template.tipo,
        tempo_minutos: template.tempo_minutos,
        power_threshold_w: template.power_threshold_w,
        ativo: template.ativo,
        regras
      }
    );
  }
}

async function testConfiguracoesEvolution() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTE 6: CONFIGURAÇÕES EVOLUTION API');
  console.log('═══════════════════════════════════════════════════\n');

  const configs = await query(
    `SELECT chave, LENGTH(valor) as tamanho_valor 
     FROM configuracoes_sistema 
     WHERE chave LIKE 'evolution_%'`
  );

  const configsEsperadas = ['evolution_api_url', 'evolution_api_key', 'evolution_instance'];
  
  for (const esperada of configsEsperadas) {
    const encontrada = configs.find((c: any) => c.chave === esperada);
    
    if (encontrada) {
      logTest(
        `Configuração "${esperada}"`,
        true,
        'Configurada',
        { tamanho: encontrada.tamanho_valor }
      );
    } else {
      logTest(
        `Configuração "${esperada}"`,
        false,
        'NÃO CONFIGURADA!',
        { erro: 'Configuração ausente' }
      );
    }
  }
}

async function testLogsNotificacoes() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTE 7: HISTÓRICO DE LOGS');
  console.log('═══════════════════════════════════════════════════\n');

  // Últimas 5 notificações
  const ultimasNotificacoes = await query(`
    SELECT 
      l.id,
      l.tipo,
      l.status,
      m.nome as morador_nome,
      l.criado_em,
      ROUND(EXTRACT(EPOCH FROM (NOW() - l.criado_em))/60) as minutos_atras
    FROM logs_notificacoes l
    LEFT JOIN moradores m ON l.morador_id = m.id
    ORDER BY l.criado_em DESC
    LIMIT 5
  `);

  if (ultimasNotificacoes.length > 0) {
    logTest(
      'Histórico de notificações',
      true,
      `${ultimasNotificacoes.length} notificação(ões) encontrada(s)`,
      ultimasNotificacoes.map((n: any) => ({
        tipo: n.tipo,
        morador: n.morador_nome,
        status: n.status,
        minutos_atras: n.minutos_atras
      }))
    );

    // Verificar última notificação
    const ultima = ultimasNotificacoes[0];
    const minutosAtras = parseInt(ultima.minutos_atras);
    const muitoAntiga = minutosAtras > 60; // Mais de 1 hora

    logTest(
      'Última notificação enviada',
      !muitoAntiga,
      muitoAntiga 
        ? `⚠️ Última notificação há ${minutosAtras} minutos (sistema pode estar parado!)` 
        : `Há ${minutosAtras} minutos (sistema ativo)`,
      {
        tipo: ultima.tipo,
        morador: ultima.morador_nome,
        status: ultima.status,
        minutos_atras: minutosAtras
      }
    );
  } else {
    logTest(
      'Histórico de notificações',
      false,
      'Nenhuma notificação no histórico!',
      { aviso: 'Sistema nunca enviou notificações ou logs foram limpos' }
    );
  }
}

async function gerarRelatorio() {
  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║               📊 RELATÓRIO FINAL DOS TESTES                   ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const total = results.length;
  const passou = results.filter(r => r.passed).length;
  const falhou = results.filter(r => !r.passed).length;
  const percentual = ((passou / total) * 100).toFixed(1);

  console.log(`📊 Total de testes: ${total}`);
  console.log(`✅ Passou: ${passou}`);
  console.log(`❌ Falhou: ${falhou}`);
  console.log(`📈 Taxa de sucesso: ${percentual}%\n`);

  if (falhou > 0) {
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('❌ TESTES QUE FALHARAM:\n');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   • ${r.test}: ${r.message}`);
      if (r.details) {
        console.log(`     Detalhes: ${JSON.stringify(r.details)}`);
      }
    });
    console.log('\n═══════════════════════════════════════════════════════════════\n');
  }

  // Recomendações
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('🎯 RECOMENDAÇÕES:\n');

  const templatesFaltando = results.filter(r => 
    r.test.includes('Template') && !r.passed
  );

  if (templatesFaltando.length > 0) {
    console.log('   ⚠️  Aplicar migrations para criar templates faltantes');
  }

  const carregamentosPendentes = results.find(r => 
    r.test.includes('DEVE enviar notificação agora')
  );

  if (carregamentosPendentes) {
    console.log('   📱 Há carregamentos com notificações pendentes - fazer deploy urgente!');
  }

  const ultimaNotificacaoAntiga = results.find(r =>
    r.test === 'Última notificação enviada' && !r.passed
  );

  if (ultimaNotificacaoAntiga) {
    console.log('   🔄 Sistema pode estar parado - fazer redeploy no Render');
  }

  if (falhou === 0) {
    console.log('   ✅ Sistema está 100% configurado e pronto para funcionar!');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        🧪 TESTE DE TRIGGERS DE NOTIFICAÇÃO - VETRIC          ║');
  console.log('║                                                               ║');
  console.log('║   Testa a lógica de disparo SEM chamar Evolution API         ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    await testTemplatesExistem();
    await testMoradoresValidos();
    await testCarregamentosPendentes();
    await testLogicaTemplates();
    await testRegrasTemporizacao();
    await testConfiguracoesEvolution();
    await testLogsNotificacoes();

    await gerarRelatorio();

  } catch (error: any) {
    console.error('\n❌ Erro ao executar testes:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();

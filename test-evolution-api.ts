/**
 * 🧪 TESTE EVOLUTION API - VETRIC
 * Valida integração com WhatsApp antes do desenvolvimento
 */

import axios from 'axios';

// ========================================
// 🔧 CONFIGURAÇÕES DA EVOLUTION API
// ========================================

const EVOLUTION_CONFIG = {
  baseURL: 'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me',
  apiKey: 't1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==',
  instanceName: '', // Vamos descobrir
  phoneTest: '5582996176797', // Número para teste
};

// ========================================
// 🔍 FUNÇÕES DE TESTE
// ========================================

/**
 * Teste 1: Listar todas as instâncias
 */
async function test1_ListarInstancias() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 TESTE 1: LISTAR INSTÂNCIAS');
  console.log('='.repeat(80));

  try {
    const response = await axios.get(
      `${EVOLUTION_CONFIG.baseURL}/instance/fetchInstances`,
      {
        headers: {
          'apikey': EVOLUTION_CONFIG.apiKey,
        },
      }
    );

    console.log('✅ Sucesso! Instâncias encontradas:\n');
    
    if (Array.isArray(response.data)) {
      response.data.forEach((instance: any, index: number) => {
        console.log(`${index + 1}. Nome: ${instance.instance?.instanceName || instance.instanceName || 'N/A'}`);
        console.log(`   Status: ${instance.instance?.status || instance.status || 'N/A'}`);
        console.log(`   Conectado: ${instance.instance?.state === 'open' ? '🟢 SIM' : '🔴 NÃO'}`);
        console.log('');
        
        // Salvar o nome da primeira instância conectada
        if (!EVOLUTION_CONFIG.instanceName && instance.instance?.state === 'open') {
          EVOLUTION_CONFIG.instanceName = instance.instance?.instanceName || instance.instanceName;
        }
      });
    } else if (response.data.instance) {
      console.log(`Nome: ${response.data.instance.instanceName}`);
      console.log(`Status: ${response.data.instance.status}`);
      console.log(`Conectado: ${response.data.instance.state === 'open' ? '🟢 SIM' : '🔴 NÃO'}`);
      EVOLUTION_CONFIG.instanceName = response.data.instance.instanceName;
    }

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao listar instâncias:');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Teste 2: Verificar status da instância específica
 */
async function test2_StatusInstancia() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 TESTE 2: STATUS DA INSTÂNCIA');
  console.log('='.repeat(80));

  if (!EVOLUTION_CONFIG.instanceName) {
    console.error('❌ Nome da instância não encontrado. Execute o Teste 1 primeiro.');
    return false;
  }

  console.log(`Instância: ${EVOLUTION_CONFIG.instanceName}\n`);

  try {
    const response = await axios.get(
      `${EVOLUTION_CONFIG.baseURL}/instance/connectionState/${EVOLUTION_CONFIG.instanceName}`,
      {
        headers: {
          'apikey': EVOLUTION_CONFIG.apiKey,
        },
      }
    );

    console.log('✅ Sucesso! Status da conexão:\n');
    console.log(JSON.stringify(response.data, null, 2));

    const isConnected = response.data.state === 'open' || response.data.instance?.state === 'open';
    console.log(`\n${isConnected ? '🟢 WhatsApp CONECTADO!' : '🔴 WhatsApp NÃO conectado'}`);

    return isConnected;
  } catch (error: any) {
    console.error('❌ Erro ao verificar status:');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Teste 3: Enviar mensagem de teste
 */
async function test3_EnviarMensagemTeste() {
  console.log('\n' + '='.repeat(80));
  console.log('📱 TESTE 3: ENVIAR MENSAGEM DE TESTE');
  console.log('='.repeat(80));

  if (!EVOLUTION_CONFIG.instanceName) {
    console.error('❌ Nome da instância não encontrado. Execute o Teste 1 primeiro.');
    return false;
  }

  const phoneNumber = EVOLUTION_CONFIG.phoneTest;
  const message = `🧪 *TESTE EVOLUTION API - VETRIC*

Olá! Esta é uma mensagem de teste da integração VETRIC com Evolution API.

✅ Conexão funcionando perfeitamente!

_Mensagem enviada em: ${new Date().toLocaleString('pt-BR')}_`;

  console.log(`Enviando para: +${phoneNumber}\n`);

  try {
    const response = await axios.post(
      `${EVOLUTION_CONFIG.baseURL}/message/sendText/${EVOLUTION_CONFIG.instanceName}`,
      {
        number: phoneNumber,
        text: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_CONFIG.apiKey,
        },
      }
    );

    console.log('✅ Mensagem enviada com sucesso!\n');
    console.log('Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n📱 Verifique seu WhatsApp! Você deve ter recebido a mensagem de teste.');

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Teste 4: Enviar mensagem com template (variáveis)
 */
async function test4_EnviarMensagemTemplate() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 TESTE 4: MENSAGEM COM TEMPLATE (VARIÁVEIS)');
  console.log('='.repeat(80));

  if (!EVOLUTION_CONFIG.instanceName) {
    console.error('❌ Nome da instância não encontrado. Execute o Teste 1 primeiro.');
    return false;
  }

  // Simular variáveis que virão do sistema
  const morador = {
    nome: 'João Silva',
    apartamento: '101',
  };

  const carregador = {
    nome: 'Gran Marine 2',
    status: 'Disponível',
  };

  // Template como será no sistema
  const template = `🔋 *VETRIC - Notificação de Carregamento*

Olá *{nome}* (Apto {apartamento})!

O carregador *{carregador}* está *{status}*.

Você pode iniciar o carregamento agora! ⚡

_Mensagem automática - ${new Date().toLocaleString('pt-BR')}_`;

  // Substituir variáveis
  const mensagemFinal = template
    .replace('{nome}', morador.nome)
    .replace('{apartamento}', morador.apartamento)
    .replace('{carregador}', carregador.nome)
    .replace('{status}', carregador.status);

  console.log('Template original:');
  console.log(template);
  console.log('\nMensagem final (com variáveis):');
  console.log(mensagemFinal);
  console.log(`\nEnviando para: +${EVOLUTION_CONFIG.phoneTest}\n`);

  try {
    const response = await axios.post(
      `${EVOLUTION_CONFIG.baseURL}/message/sendText/${EVOLUTION_CONFIG.instanceName}`,
      {
        number: EVOLUTION_CONFIG.phoneTest,
        text: mensagemFinal,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_CONFIG.apiKey,
        },
      }
    );

    console.log('✅ Mensagem template enviada com sucesso!\n');
    console.log('Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n📱 Verifique seu WhatsApp! Você deve ter recebido a mensagem com template.');

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem template:');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data || error.message);
    return false;
  }
}

// ========================================
// 🚀 EXECUTAR TODOS OS TESTES
// ========================================

async function executarTodosTestes() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║                   🧪 TESTE EVOLUTION API - VETRIC                             ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');

  console.log('\n📋 Configuração:');
  console.log(`   URL: ${EVOLUTION_CONFIG.baseURL}`);
  console.log(`   API Key: ${EVOLUTION_CONFIG.apiKey.substring(0, 20)}...`);
  console.log(`   Telefone Teste: +${EVOLUTION_CONFIG.phoneTest}`);

  const resultados = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
  };

  // Executar testes em sequência
  resultados.test1 = await test1_ListarInstancias();
  
  if (resultados.test1) {
    resultados.test2 = await test2_StatusInstancia();
  }

  if (resultados.test2) {
    resultados.test3 = await test3_EnviarMensagemTeste();
  }

  if (resultados.test3) {
    resultados.test4 = await test4_EnviarMensagemTemplate();
  }

  // Resumo final
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(80));
  console.log(`Teste 1 - Listar Instâncias:      ${resultados.test1 ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Teste 2 - Status da Instância:    ${resultados.test2 ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Teste 3 - Mensagem Simples:       ${resultados.test3 ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Teste 4 - Mensagem com Template:  ${resultados.test4 ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log('='.repeat(80));

  const todosPassaram = Object.values(resultados).every(r => r === true);

  if (todosPassaram) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Evolution API está funcionando perfeitamente!');
    console.log('✅ Sistema pronto para integração completa no VETRIC Dashboard.\n');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os erros acima.');
    console.log('💡 Dica: Confira se a API Key e URL estão corretas.\n');
  }
}

// Executar
executarTodosTestes().catch(console.error);


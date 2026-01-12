import axios from 'axios';
import chalk from 'chalk';

/**
 * Script para buscar detalhes completos das instâncias Evolution API
 */

const evolutionAPI = {
  baseUrl: 'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me',
  apiKey: 't1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg=='
};

function printHeader(title: string) {
  console.log('\n' + chalk.bold.cyan('═'.repeat(80)));
  console.log(chalk.bold.cyan(`  ${title}`));
  console.log(chalk.bold.cyan('═'.repeat(80)) + '\n');
}

function printSection(title: string) {
  console.log('\n' + chalk.bold.yellow('─'.repeat(80)));
  console.log(chalk.bold.yellow(`  ${title}`));
  console.log(chalk.bold.yellow('─'.repeat(80)) + '\n');
}

async function makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET') {
  try {
    const response = await axios({
      method,
      url: `${evolutionAPI.baseUrl}${endpoint}`,
      headers: {
        'apikey': evolutionAPI.apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    };
  }
}

async function main() {
  printHeader('DETALHAMENTO COMPLETO DAS INSTÂNCIAS EVOLUTION API');

  // 1. Buscar todas as instâncias
  console.log(chalk.white('📋 Buscando lista de instâncias...\n'));
  const instances = await makeRequest('/instance/fetchInstances');

  if (instances.error) {
    console.log(chalk.red('❌ Erro ao buscar instâncias:'), instances.message);
    return;
  }

  console.log(chalk.green('✓ Instâncias obtidas com sucesso!\n'));
  console.log(chalk.white('Dados brutos das instâncias:'));
  console.log(chalk.gray(JSON.stringify(instances, null, 2)));

  // Verificar se é array ou objeto
  const instanceList = Array.isArray(instances) ? instances : [instances];

  printSection(`📱 TOTAL DE INSTÂNCIAS: ${instanceList.length}`);

  // 2. Para cada instância, buscar detalhes
  for (let i = 0; i < instanceList.length; i++) {
    const instance = instanceList[i];
    
    console.log(chalk.cyan(`\n[${i + 1}] INSTÂNCIA ${i + 1}`));
    console.log(chalk.cyan('─'.repeat(60)));
    
    // Mostrar todos os campos disponíveis
    console.log(chalk.white('\n📊 Dados da instância:'));
    Object.entries(instance).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        console.log(chalk.white(`  ${key}:`));
        console.log(chalk.gray(`    ${JSON.stringify(value, null, 2)}`));
      } else {
        console.log(chalk.white(`  ${key}: ${chalk.bold(String(value))}`));
      }
    });

    // Tentar buscar detalhes adicionais
    const instanceName = instance.instance?.instanceName || 
                         instance.instanceName || 
                         instance.name ||
                         instance.id;

    if (instanceName) {
      console.log(chalk.white(`\n🔍 Buscando detalhes de: ${chalk.bold(instanceName)}`));

      // Estado da conexão
      const connectionState = await makeRequest(`/instance/connectionState/${instanceName}`);
      if (!connectionState.error) {
        console.log(chalk.white('\n📡 Estado da conexão:'));
        console.log(chalk.gray(JSON.stringify(connectionState, null, 2)));
      }

      // Informações da instância específica
      const instanceInfo = await makeRequest(`/instance/${instanceName}`);
      if (!instanceInfo.error) {
        console.log(chalk.white('\n📱 Informações adicionais:'));
        console.log(chalk.gray(JSON.stringify(instanceInfo, null, 2)));
      }
    }

    console.log('\n');
  }

  // 3. Resumo final
  printSection('📊 RESUMO EXECUTIVO');

  console.log(chalk.white('🔑 API KEY:'));
  console.log(chalk.green(`   ${evolutionAPI.apiKey}\n`));

  console.log(chalk.white('🌐 BASE URL:'));
  console.log(chalk.green(`   ${evolutionAPI.baseUrl}\n`));

  console.log(chalk.white('📱 INSTÂNCIAS:'));
  instanceList.forEach((instance, index) => {
    const instanceName = instance.instance?.instanceName || 
                         instance.instanceName || 
                         instance.name ||
                         instance.id ||
                         `instancia-${index + 1}`;
    
    const status = instance.instance?.status || 
                   instance.status || 
                   'desconhecido';
    
    const connection = instance.connection?.state || 
                       instance.connectionState ||
                       'desconhecido';

    console.log(chalk.cyan(`   [${index + 1}] ${instanceName}`));
    console.log(chalk.white(`       Status: ${status}`));
    console.log(chalk.white(`       Conexão: ${connection}`));
  });

  // 4. Tabela de endpoints úteis
  printSection('🔧 ENDPOINTS DISPONÍVEIS');

  const endpoints = [
    {
      category: 'Instâncias',
      items: [
        { method: 'GET', path: '/instance/fetchInstances', desc: 'Listar todas' },
        { method: 'POST', path: '/instance/create', desc: 'Criar nova' },
        { method: 'GET', path: '/instance/connectionState/:name', desc: 'Status conexão' },
        { method: 'GET', path: '/instance/qrcode/:name', desc: 'QR Code' },
        { method: 'DELETE', path: '/instance/delete/:name', desc: 'Deletar' },
        { method: 'POST', path: '/instance/logout/:name', desc: 'Desconectar' },
      ]
    },
    {
      category: 'Mensagens',
      items: [
        { method: 'POST', path: '/message/sendText/:name', desc: 'Enviar texto' },
        { method: 'POST', path: '/message/sendMedia/:name', desc: 'Enviar mídia' },
        { method: 'POST', path: '/message/sendAudio/:name', desc: 'Enviar áudio' },
        { method: 'POST', path: '/message/sendLocation/:name', desc: 'Enviar localização' },
      ]
    },
    {
      category: 'Grupos',
      items: [
        { method: 'GET', path: '/group/fetchAllGroups/:name', desc: 'Listar grupos' },
        { method: 'POST', path: '/group/create/:name', desc: 'Criar grupo' },
        { method: 'PUT', path: '/group/updateGroupPicture/:name', desc: 'Atualizar foto' },
      ]
    },
    {
      category: 'Contatos',
      items: [
        { method: 'GET', path: '/chat/fetchAllContacts/:name', desc: 'Listar contatos' },
        { method: 'GET', path: '/chat/findContacts/:name', desc: 'Buscar contato' },
      ]
    }
  ];

  endpoints.forEach(({ category, items }) => {
    console.log(chalk.bold.white(`\n${category}:`));
    items.forEach(({ method, path, desc }) => {
      const methodColor = method === 'GET' ? chalk.green : 
                         method === 'POST' ? chalk.yellow : 
                         method === 'PUT' ? chalk.blue : chalk.red;
      console.log(`  ${methodColor(method.padEnd(6))} ${chalk.white(path.padEnd(40))} ${chalk.gray(desc)}`);
    });
  });

  // 5. Exemplo de código para integração
  printSection('💻 CÓDIGO DE EXEMPLO PARA INTEGRAÇÃO');

  console.log(chalk.gray('```typescript'));
  console.log(`import axios from 'axios';

// Configuração
const config = {
  baseUrl: '${evolutionAPI.baseUrl}',
  apiKey: '${evolutionAPI.apiKey}'
};

// Helper para fazer requisições
const evolutionRequest = async (endpoint: string, method = 'GET', data?: any) => {
  const response = await axios({
    method,
    url: \`\${config.baseUrl}\${endpoint}\`,
    headers: {
      'apikey': config.apiKey,
      'Content-Type': 'application/json'
    },
    data
  });
  return response.data;
};

// Exemplos de uso:

// 1. Listar instâncias
const instances = await evolutionRequest('/instance/fetchInstances');
console.log('Instâncias:', instances);

// 2. Obter QR Code (para conectar ao WhatsApp)
const qrCode = await evolutionRequest('/instance/qrcode/NOME_INSTANCIA');
console.log('QR Code:', qrCode);

// 3. Enviar mensagem de texto
const result = await evolutionRequest(
  '/message/sendText/NOME_INSTANCIA',
  'POST',
  {
    number: '5511999999999',
    text: 'Olá! Mensagem via Evolution API'
  }
);
console.log('Mensagem enviada:', result);

// 4. Verificar estado da conexão
const state = await evolutionRequest('/instance/connectionState/NOME_INSTANCIA');
console.log('Estado:', state);

// 5. Buscar contatos
const contacts = await evolutionRequest('/chat/fetchAllContacts/NOME_INSTANCIA');
console.log('Contatos:', contacts);`);
  console.log(chalk.gray('```\n'));

  printHeader('✅ ANÁLISE DETALHADA CONCLUÍDA');
}

// Executar
main().catch(error => {
  console.error(chalk.red('\n❌ Erro fatal:'), error.message);
  process.exit(1);
});


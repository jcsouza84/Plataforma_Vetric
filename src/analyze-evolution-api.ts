import axios, { AxiosError } from 'axios';
import chalk from 'chalk';

/**
 * Script de análise da Evolution API
 * Identifica API Key, instâncias e informações gerais
 */

interface EvolutionInstance {
  instance: {
    instanceName: string;
    status?: string;
    serverUrl?: string;
  };
  connection?: {
    state?: string;
  };
  owner?: string;
}

interface EvolutionAPIInfo {
  baseUrl: string;
  apiKey: string;
  instances: EvolutionInstance[];
  connectionInfo: any;
}

class EvolutionAPIAnalyzer {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // Remove /manager/login da URL se existir
    this.baseUrl = baseUrl.replace('/manager/login', '');
    this.apiKey = apiKey;
  }

  private printHeader(title: string) {
    console.log('\n' + chalk.bold.cyan('═'.repeat(80)));
    console.log(chalk.bold.cyan(`  ${title}`));
    console.log(chalk.bold.cyan('═'.repeat(80)) + '\n');
  }

  private printSection(title: string) {
    console.log('\n' + chalk.bold.yellow('─'.repeat(80)));
    console.log(chalk.bold.yellow(`  ${title}`));
    console.log(chalk.bold.yellow('─'.repeat(80)) + '\n');
  }

  /**
   * Tenta diferentes formatos de autenticação
   */
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const authMethods = [
      {
        name: 'Header apikey',
        headers: { apikey: this.apiKey }
      },
      {
        name: 'Header Authorization Bearer',
        headers: { Authorization: `Bearer ${this.apiKey}` }
      },
      {
        name: 'Header X-API-Key',
        headers: { 'X-API-Key': this.apiKey }
      },
      {
        name: 'Header Api-Key',
        headers: { 'Api-Key': this.apiKey }
      }
    ];

    for (const authMethod of authMethods) {
      try {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(chalk.gray(`  Tentando ${authMethod.name}...`));

        const response = await axios({
          method,
          url,
          headers: {
            'Content-Type': 'application/json',
            ...authMethod.headers
          },
          data
        });

        console.log(chalk.green(`  ✓ Sucesso com ${authMethod.name}!\n`));
        return {
          data: response.data,
          authMethod: authMethod.name
        };
      } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        // Apenas mostrar erro se for diferente de 401/403
        if (status && ![401, 403].includes(status)) {
          console.log(chalk.yellow(`  ⚠ ${authMethod.name}: ${status} - ${message}`));
        }
        
        continue;
      }
    }

    throw new Error('Nenhum método de autenticação funcionou');
  }

  /**
   * Buscar informações da API
   */
  async analyze(): Promise<EvolutionAPIInfo> {
    this.printHeader('ANÁLISE DA EVOLUTION API');

    console.log(chalk.white('🔍 Informações Básicas:'));
    console.log(chalk.white(`  Base URL: ${chalk.bold(this.baseUrl)}`));
    console.log(chalk.white(`  API Key: ${chalk.bold(this.apiKey.substring(0, 20))}...`));

    const info: EvolutionAPIInfo = {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      instances: [],
      connectionInfo: {}
    };

    // Tentar buscar instâncias
    this.printSection('🔎 BUSCANDO INSTÂNCIAS');

    const instanceEndpoints = [
      '/instance/fetchInstances',
      '/instances',
      '/instance/list',
      '/api/instance/fetchInstances'
    ];

    let instancesFound = false;

    for (const endpoint of instanceEndpoints) {
      try {
        console.log(chalk.gray(`\n📍 Testando endpoint: ${endpoint}`));
        const result = await this.makeRequest(endpoint);
        
        if (result && result.data) {
          console.log(chalk.green(`✓ Instâncias encontradas!\n`));
          info.instances = Array.isArray(result.data) ? result.data : [result.data];
          info.connectionInfo.authMethod = result.authMethod;
          instancesFound = true;
          break;
        }
      } catch (error: any) {
        console.log(chalk.gray(`  ✗ Não disponível`));
      }
    }

    if (!instancesFound) {
      console.log(chalk.yellow('\n⚠ Não foi possível listar instâncias automaticamente'));
      console.log(chalk.gray('Pode ser necessário autenticação adicional ou endpoint diferente\n'));
    }

    return info;
  }

  /**
   * Exibir relatório completo
   */
  async displayReport() {
    try {
      const info = await this.analyze();

      // Resumo da API Key
      this.printSection('🔑 API KEY IDENTIFICADA');
      console.log(chalk.white('API Key completa:'));
      console.log(chalk.bold.green(`${info.apiKey}\n`));
      console.log(chalk.gray('Use esta chave nos headers das requisições:'));
      console.log(chalk.gray(`  apikey: ${info.apiKey}`));
      console.log(chalk.gray('ou'));
      console.log(chalk.gray(`  Authorization: Bearer ${info.apiKey}\n`));

      // Instâncias encontradas
      this.printSection('📱 INSTÂNCIAS ENCONTRADAS');

      if (info.instances.length === 0) {
        console.log(chalk.yellow('Nenhuma instância encontrada ou acesso negado'));
        console.log(chalk.white('\n💡 Possíveis razões:'));
        console.log(chalk.white('  1. API Key sem permissão para listar instâncias'));
        console.log(chalk.white('  2. Nenhuma instância criada ainda'));
        console.log(chalk.white('  3. Endpoint diferente nesta versão da Evolution API'));
        
        // Tentar buscar manualmente
        console.log(chalk.white('\n🔧 Tentando métodos alternativos...\n'));
        await this.tryAlternativeMethods();
      } else {
        console.log(chalk.green(`Total: ${info.instances.length} instância(s)\n`));
        
        info.instances.forEach((instance, index) => {
          console.log(chalk.cyan(`[${index + 1}] ${instance.instance?.instanceName || 'Sem nome'}`));
          
          if (instance.instance?.status) {
            console.log(chalk.white(`    Status: ${chalk.bold(instance.instance.status)}`));
          }
          
          if (instance.connection?.state) {
            console.log(chalk.white(`    Conexão: ${chalk.bold(instance.connection.state)}`));
          }
          
          if (instance.owner) {
            console.log(chalk.white(`    Proprietário: ${instance.owner}`));
          }
          
          console.log('');
        });
      }

      // Endpoints úteis
      this.printSection('📚 ENDPOINTS ÚTEIS DA EVOLUTION API');
      
      const endpoints = [
        { method: 'GET', path: '/instance/fetchInstances', desc: 'Listar todas as instâncias' },
        { method: 'POST', path: '/instance/create', desc: 'Criar nova instância' },
        { method: 'GET', path: '/instance/connectionState/:instance', desc: 'Estado da conexão' },
        { method: 'GET', path: '/instance/qrcode/:instance', desc: 'Obter QR Code' },
        { method: 'POST', path: '/message/sendText/:instance', desc: 'Enviar mensagem de texto' },
        { method: 'POST', path: '/message/sendMedia/:instance', desc: 'Enviar mídia' },
        { method: 'DELETE', path: '/instance/delete/:instance', desc: 'Deletar instância' },
      ];

      endpoints.forEach(({ method, path, desc }) => {
        const methodColor = method === 'GET' ? chalk.green : method === 'POST' ? chalk.yellow : chalk.red;
        console.log(`${methodColor(method.padEnd(6))} ${chalk.white(path.padEnd(45))} ${chalk.gray(desc)}`);
      });

      // Exemplo de uso
      this.printSection('💻 EXEMPLO DE USO');
      
      console.log(chalk.white('Node.js/TypeScript:\n'));
      console.log(chalk.gray('```typescript'));
      console.log(`import axios from 'axios';

const evolutionAPI = {
  baseUrl: '${info.baseUrl}',
  apiKey: '${info.apiKey}'
};

// Listar instâncias
async function listInstances() {
  const response = await axios.get(
    \`\${evolutionAPI.baseUrl}/instance/fetchInstances\`,
    {
      headers: {
        'apikey': evolutionAPI.apiKey
      }
    }
  );
  return response.data;
}

// Enviar mensagem
async function sendMessage(instanceName: string, number: string, text: string) {
  const response = await axios.post(
    \`\${evolutionAPI.baseUrl}/message/sendText/\${instanceName}\`,
    {
      number: number,
      text: text
    },
    {
      headers: {
        'apikey': evolutionAPI.apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

// Usar
listInstances().then(console.log);`);
      console.log(chalk.gray('```\n'));

      // Próximos passos
      this.printSection('🎯 PRÓXIMOS PASSOS');
      console.log(chalk.white('1. Testar os endpoints listados acima'));
      console.log(chalk.white('2. Verificar documentação oficial: https://evolution-api.com/docs'));
      console.log(chalk.white('3. Criar instâncias se necessário'));
      console.log(chalk.white('4. Conectar instâncias ao WhatsApp via QR Code'));
      console.log(chalk.white('5. Implementar envio de mensagens\n'));

      this.printHeader('✅ ANÁLISE CONCLUÍDA');

    } catch (error: any) {
      console.error(chalk.red('\n❌ Erro durante análise:'), error.message);
      
      if (error.response) {
        console.log(chalk.yellow('\nDetalhes do erro:'));
        console.log(chalk.white(`  Status: ${error.response.status}`));
        console.log(chalk.white(`  Mensagem: ${error.response.data?.message || 'Sem mensagem'}`));
      }
    }
  }

  /**
   * Tentar métodos alternativos de descoberta
   */
  private async tryAlternativeMethods() {
    const alternativeEndpoints = [
      '/instance',
      '/api/instances',
      '/v1/instance/fetchInstances',
      '/manager/instances'
    ];

    console.log(chalk.gray('Testando endpoints alternativos...\n'));

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(chalk.gray(`  Tentando: ${endpoint}`));
        const result = await this.makeRequest(endpoint);
        
        if (result?.data) {
          console.log(chalk.green(`  ✓ Encontrado em: ${endpoint}`));
          console.log(chalk.white('\nDados retornados:'));
          console.log(chalk.gray(JSON.stringify(result.data, null, 2)));
          return;
        }
      } catch (error) {
        // Ignorar erro e continuar
      }
    }

    console.log(chalk.yellow('\n  Nenhum endpoint alternativo respondeu com sucesso'));
  }
}

// Executar análise
async function main() {
  const baseUrl = 'http://habbora-evolutionapi-cf4643-46-202-146-195.traefik.me';
  const apiKey = 't1ld6RKtyZTn9xqlz5WVubfMRt8jNkPc1NAlOx1SZcmTq5lNZl+YVk308sJ+RxoDdBNCGpnAo0uhGM77K9vJHg==';

  const analyzer = new EvolutionAPIAnalyzer(baseUrl, apiKey);
  await analyzer.displayReport();
}

// Executar
main().catch(error => {
  console.error(chalk.red('\n❌ Erro fatal:'), error.message);
  process.exit(1);
});


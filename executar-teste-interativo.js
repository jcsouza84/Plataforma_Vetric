#!/usr/bin/env node

/**
 * 🚀 Executor Simples - Teste Transação 439071
 * Cole a DATABASE_URL quando solicitado
 */

const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('================================================');
console.log('🔍 TESTE AUTOMÁTICO - TRANSAÇÃO 439071');
console.log('================================================\n');
console.log('Para executar este teste, precisamos da DATABASE_URL\n');
console.log('📋 Como obter:');
console.log('  1. Acesse: https://dashboard.render.com');
console.log('  2. Clique no serviço Backend');
console.log('  3. Vá em Environment');
console.log('  4. Copie o valor de DATABASE_URL\n');
console.log('Formato esperado:');
console.log('  postgresql://usuario:senha@host/database\n');
console.log('================================================\n');

rl.question('Cole a DATABASE_URL aqui: ', (databaseUrl) => {
  rl.close();
  
  if (!databaseUrl || !databaseUrl.startsWith('postgresql://')) {
    console.error('\n❌ URL inválida! Deve começar com postgresql://\n');
    process.exit(1);
  }
  
  console.log('\n✅ URL recebida!');
  console.log('🔌 Conectando ao banco...\n');
  console.log('================================================\n');
  
  // Executar o script TypeScript com a variável de ambiente
  const child = spawn('npx', ['ts-node', 'buscar-transacao-auto.ts'], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit'
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Teste concluído com sucesso!\n');
    } else {
      console.log(`\n❌ Teste falhou com código: ${code}\n');
    }
    process.exit(code);
  });
});


/**
 * 🌱 VETRIC - Seed de Usuários Padrão
 * Cria os 2 usuários fixos do sistema
 */

import { Usuario } from '../models/Usuario';

export async function createDefaultUsers() {
  try {
    console.log('\n🌱 Criando usuários padrão...\n');

    // 1. Admin VETRIC
    const adminEmail = 'admin@vetric.com.br';
    const adminExiste = await Usuario.findOne({ where: { email: adminEmail } });

    if (!adminExiste) {
      const adminSenhaHash = await Usuario.hashSenha('Vetric@2026');
      await Usuario.create({
        email: adminEmail,
        senha_hash: adminSenhaHash,
        nome: 'Administrador VETRIC',
        role: 'ADMIN',
        ativo: true,
      });
      console.log('✅ Usuário ADMIN criado:');
      console.log(`   Email: ${adminEmail}`);
      console.log('   Senha: Vetric@2026');
      console.log('');
    } else {
      console.log('⏭️  Usuário ADMIN já existe');
    }

    // 2. Cliente Gran Marine
    const clienteEmail = 'granmarine@vetric.com.br';
    const clienteExiste = await Usuario.findOne({ where: { email: clienteEmail } });

    if (!clienteExiste) {
      const clienteSenhaHash = await Usuario.hashSenha('GranMarine@2026');
      await Usuario.create({
        email: clienteEmail,
        senha_hash: clienteSenhaHash,
        nome: 'Gran Marine Residence',
        role: 'CLIENTE',
        ativo: true,
      });
      console.log('✅ Usuário CLIENTE criado:');
      console.log(`   Email: ${clienteEmail}`);
      console.log('   Senha: GranMarine@2026');
      console.log('');
    } else {
      console.log('⏭️  Usuário CLIENTE já existe\n');
    }

    console.log('✅ Usuários padrão configurados!\n');
  } catch (error: any) {
    console.error('❌ Erro ao criar usuários padrão:', error);
    throw error;
  }
}


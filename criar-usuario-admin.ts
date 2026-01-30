/**
 * 🔧 Script para criar usuário admin no PostgreSQL Render
 * 
 * Execução:
 * npx ts-node criar-usuario-admin.ts
 */

import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Configuração do banco (você vai precisar pegar a DATABASE_URL do Render)
const DATABASE_URL = process.env.DATABASE_URL || 
  'COLE_AQUI_A_DATABASE_URL_DO_RENDER';

async function criarUsuarioAdmin() {
  console.log('\n🔧 Criando usuários padrão VETRIC...\n');

  // Conectar ao banco
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Definir usuários
    const usuarios = [
      {
        email: 'admin@vetric.com.br',
        senha: 'Vetric@2026',
        nome: 'Administrador VETRIC',
        role: 'ADMIN'
      },
      {
        email: 'granmarine@vetric.com.br',
        senha: 'GranMarine@2026',
        nome: 'Gran Marine',
        role: 'CLIENTE'
      }
    ];

    const query = `
      INSERT INTO usuarios (email, senha_hash, nome, role, ativo, criado_em, atualizado_em)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE 
      SET senha_hash = $2, atualizado_em = NOW()
      RETURNING id, email, nome, role;
    `;

    console.log('📝 Criando usuários...\n');

    for (const usuario of usuarios) {
      // Gerar hash da senha
      const senhaHash = await bcrypt.hash(usuario.senha, 10);

      const values = [
        usuario.email,
        senhaHash,
        usuario.nome,
        usuario.role,
        true
      ];

      const result = await pool.query(query, values);
      
      console.log(`✅ ${usuario.role}: ${usuario.email}`);
      console.log(`   Nome: ${result.rows[0].nome}`);
      console.log(`   ID: ${result.rows[0].id}\n`);
    }

    console.log('🎉 Todos os usuários criados/atualizados com sucesso!\n');
    console.log('🔑 Credenciais de login:\n');
    console.log('   👤 ADMIN:');
    console.log('      Email: admin@vetric.com.br');
    console.log('      Senha: Vetric@2026\n');
    console.log('   👤 CLIENTE:');
    console.log('      Email: granmarine@vetric.com.br');
    console.log('      Senha: GranMarine@2026\n');
    console.log('🌐 Acesse: https://plataforma-vetric.onrender.com/login\n');

  } catch (error: any) {
    console.error('\n❌ Erro ao criar usuários:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

criarUsuarioAdmin();


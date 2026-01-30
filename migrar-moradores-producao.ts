/**
 * 🚀 VETRIC - Migração de Moradores para Produção
 * 
 * Script seguro para copiar moradores do banco LOCAL para PRODUÇÃO
 * 
 * Uso:
 * 1. Configure as variáveis de ambiente abaixo
 * 2. Execute: npx ts-node migrar-moradores-producao.ts
 */

import { Pool } from 'pg';

// ┌─────────────────────────────────────────────────────────┐
// │ CONFIGURAÇÃO                                             │
// └─────────────────────────────────────────────────────────┘

// Banco LOCAL (seu computador)
const LOCAL_DB = {
  host: process.env.LOCAL_DB_HOST || 'localhost',
  port: parseInt(process.env.LOCAL_DB_PORT || '5432'),
  database: process.env.LOCAL_DB_NAME || 'vetric_db',
  user: process.env.LOCAL_DB_USER || 'postgres',
  password: process.env.LOCAL_DB_PASSWORD || 'postgres',
};

// Banco PRODUÇÃO (Render)
const PROD_DB_URL = process.env.DATABASE_URL || 
  'COLE_AQUI_A_DATABASE_URL_DO_RENDER';

// Modo dry-run (testar sem aplicar)
const DRY_RUN = process.env.DRY_RUN === 'true';

// ┌─────────────────────────────────────────────────────────┐
// │ INTERFACE                                                │
// └─────────────────────────────────────────────────────────┘

interface Morador {
  id: number;
  nome: string;
  apartamento: string;
  telefone: string | null;
  tag_rfid: string;
  notificacoes_ativas: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

// ┌─────────────────────────────────────────────────────────┐
// │ SCRIPT PRINCIPAL                                         │
// └─────────────────────────────────────────────────────────┘

async function migrarMoradores() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     🚀 MIGRAÇÃO DE MORADORES - LOCAL → PRODUÇÃO          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  if (DRY_RUN) {
    console.log('⚠️  MODO DRY-RUN: Apenas simulação, nada será alterado!\n');
  }

  // Conectar aos bancos
  console.log('📡 Conectando aos bancos de dados...\n');

  const poolLocal = new Pool(LOCAL_DB);
  const poolProd = new Pool({
    connectionString: PROD_DB_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Testar conexões
    await poolLocal.query('SELECT NOW()');
    console.log('✅ Conectado ao banco LOCAL');

    await poolProd.query('SELECT NOW()');
    console.log('✅ Conectado ao banco PRODUÇÃO\n');

    // ┌─────────────────────────────────────────────────────┐
    // │ PASSO 1: Buscar moradores do LOCAL                  │
    // └─────────────────────────────────────────────────────┘

    console.log('📊 Buscando moradores no banco LOCAL...');
    
    const resultLocal = await poolLocal.query<Morador>(`
      SELECT * FROM moradores 
      ORDER BY apartamento, nome
    `);

    const moradoresLocal = resultLocal.rows;
    console.log(`✅ Encontrados: ${moradoresLocal.length} moradores\n`);

    if (moradoresLocal.length === 0) {
      console.log('⚠️  Nenhum morador encontrado no banco local!');
      return;
    }

    // ┌─────────────────────────────────────────────────────┐
    // │ PASSO 2: Validar dados                              │
    // └─────────────────────────────────────────────────────┘

    console.log('🔍 Validando dados...');

    const invalidos: string[] = [];

    moradoresLocal.forEach((morador, index) => {
      if (!morador.nome || morador.nome.trim() === '') {
        invalidos.push(`Linha ${index + 1}: Nome vazio`);
      }
      if (!morador.tag_rfid || morador.tag_rfid.trim() === '') {
        invalidos.push(`Linha ${index + 1}: Tag RFID vazia (${morador.nome})`);
      }
      if (!morador.apartamento || morador.apartamento.trim() === '') {
        invalidos.push(`Linha ${index + 1}: Apartamento vazio (${morador.nome})`);
      }
    });

    if (invalidos.length > 0) {
      console.log('\n❌ Erros de validação encontrados:\n');
      invalidos.forEach(erro => console.log(`   ${erro}`));
      console.log('\n⚠️  Corrija os dados no banco local e tente novamente.');
      return;
    }

    console.log('✅ Todos os dados são válidos!\n');

    // Verificar duplicatas locais
    const tagsLocal = moradoresLocal.map(m => m.tag_rfid);
    const tagsUnicas = new Set(tagsLocal);

    if (tagsLocal.length !== tagsUnicas.size) {
      console.log('⚠️  AVISO: Existem tags RFID duplicadas no banco local!');
      console.log('   Apenas a primeira ocorrência será considerada.\n');
    }

    // ┌─────────────────────────────────────────────────────┐
    // │ PASSO 3: Verificar o que já existe na PRODUÇÃO      │
    // └─────────────────────────────────────────────────────┘

    console.log('🔍 Verificando moradores existentes na PRODUÇÃO...');

    const resultProd = await poolProd.query<Morador>(`
      SELECT tag_rfid FROM moradores
    `);

    const tagsExistentes = new Set(resultProd.rows.map(m => m.tag_rfid));
    console.log(`✅ Encontrados: ${tagsExistentes.size} moradores já cadastrados\n`);

    // ┌─────────────────────────────────────────────────────┐
    // │ PASSO 4: Copiar moradores                           │
    // └─────────────────────────────────────────────────────┘

    console.log('🔄 Iniciando cópia de moradores...\n');

    let criados = 0;
    let atualizados = 0;
    let erros = 0;
    let ignorados = 0;

    const tagsProcessadas = new Set<string>();

    for (const morador of moradoresLocal) {
      // Ignorar duplicatas locais
      if (tagsProcessadas.has(morador.tag_rfid)) {
        console.log(`⏭️  [${criados + atualizados + ignorados + 1}/${moradoresLocal.length}] Ignorado (duplicata local): ${morador.nome} - ${morador.apartamento}`);
        ignorados++;
        continue;
      }

      tagsProcessadas.add(morador.tag_rfid);

      try {
        if (DRY_RUN) {
          // Modo simulação
          if (tagsExistentes.has(morador.tag_rfid)) {
            console.log(`🔄 [${criados + atualizados + ignorados + 1}/${moradoresLocal.length}] SIMULAÇÃO - Atualizar: ${morador.nome} - Apt ${morador.apartamento} - Tag: ${morador.tag_rfid}`);
            atualizados++;
          } else {
            console.log(`✅ [${criados + atualizados + ignorados + 1}/${moradoresLocal.length}] SIMULAÇÃO - Criar: ${morador.nome} - Apt ${morador.apartamento} - Tag: ${morador.tag_rfid}`);
            criados++;
          }
        } else {
          // Modo real
          if (tagsExistentes.has(morador.tag_rfid)) {
            // ATUALIZAR existente
            await poolProd.query(`
              UPDATE moradores 
              SET nome = $1,
                  apartamento = $2,
                  telefone = $3,
                  notificacoes_ativas = $4,
                  atualizado_em = NOW()
              WHERE tag_rfid = $5
            `, [
              morador.nome,
              morador.apartamento,
              morador.telefone,
              morador.notificacoes_ativas,
              morador.tag_rfid
            ]);

            console.log(`🔄 [${criados + atualizados + ignorados + 1}/${moradoresLocal.length}] Atualizado: ${morador.nome} - Apt ${morador.apartamento} - Tag: ${morador.tag_rfid}`);
            atualizados++;
          } else {
            // CRIAR novo
            await poolProd.query(`
              INSERT INTO moradores (nome, apartamento, telefone, tag_rfid, notificacoes_ativas, criado_em, atualizado_em)
              VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            `, [
              morador.nome,
              morador.apartamento,
              morador.telefone,
              morador.tag_rfid,
              morador.notificacoes_ativas
            ]);

            console.log(`✅ [${criados + atualizados + ignorados + 1}/${moradoresLocal.length}] Criado: ${morador.nome} - Apt ${morador.apartamento} - Tag: ${morador.tag_rfid}`);
            criados++;
          }
        }

      } catch (error: any) {
        console.log(`❌ [${criados + atualizados + ignorados + 1}/${moradoresLocal.length}] Erro: ${morador.nome} - ${error.message}`);
        erros++;
      }
    }

    // ┌─────────────────────────────────────────────────────┐
    // │ RELATÓRIO FINAL                                      │
    // └─────────────────────────────────────────────────────┘

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    📊 RELATÓRIO FINAL                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Moradores processados: ${moradoresLocal.length}`);
    console.log(`✅ Criados: ${criados}`);
    console.log(`🔄 Atualizados: ${atualizados}`);
    console.log(`⏭️  Ignorados (duplicatas): ${ignorados}`);
    console.log(`❌ Erros: ${erros}\n`);

    if (DRY_RUN) {
      console.log('⚠️  MODO DRY-RUN: Nenhuma alteração foi aplicada!');
      console.log('   Para aplicar as mudanças, execute sem DRY_RUN=true\n');
    } else if (erros === 0) {
      console.log('🎉 MIGRAÇÃO COMPLETA COM SUCESSO!\n');
      console.log('✅ Todos os moradores foram copiados para PRODUÇÃO!');
      console.log('✅ Acesse: https://plataforma-vetric.onrender.com');
      console.log('✅ Login como admin e verifique a lista de moradores!\n');
    } else {
      console.log('⚠️  Migração completa com alguns erros.');
      console.log(`   ${criados + atualizados} moradores copiados com sucesso.`);
      console.log(`   ${erros} moradores com erro (verifique os logs acima).\n`);
    }

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  } finally {
    // Fechar conexões
    await poolLocal.end();
    await poolProd.end();
  }
}

// ┌─────────────────────────────────────────────────────────┐
// │ EXECUTAR                                                 │
// └─────────────────────────────────────────────────────────┘

migrarMoradores().catch(error => {
  console.error('❌ Erro ao executar migração:', error);
  process.exit(1);
});



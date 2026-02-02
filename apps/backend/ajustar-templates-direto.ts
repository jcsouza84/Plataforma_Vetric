/**
 * Script para ajustar templates diretamente no banco
 * Mantém apenas os 4 eventos principais
 */

import { query } from './src/config/database';

async function ajustarTemplates() {
  console.log('\n🔄 Ajustando templates para os 4 eventos principais...\n');

  try {
    // 1. Adicionar colunas se não existirem
    console.log('📝 Adicionando colunas tempo_minutos e power_threshold_w...');
    await query(`
      ALTER TABLE templates_notificacao 
        ADD COLUMN IF NOT EXISTS tempo_minutos INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS power_threshold_w INTEGER DEFAULT NULL
    `);
    console.log('✅ Colunas adicionadas\n');

    // 2. Remover templates antigos
    console.log('🗑️  Removendo templates antigos...');
    await query(`
      DELETE FROM templates_notificacao 
      WHERE tipo IN ('inicio', 'fim', 'erro', 'ocioso', 'disponivel')
    `);
    console.log('✅ Templates antigos removidos\n');

    // 3. Inserir os 4 novos templates
    console.log('➕ Inserindo os 4 novos templates...\n');
    
    const templates = [
      {
        tipo: 'inicio_recarga',
        mensagem: `🔋 Olá {{nome}}!

Seu carregamento foi iniciado no {{charger}}.

📍 Local: {{localizacao}}
🕐 Início: {{data}}
🏢 Apartamento: {{apartamento}}

Acompanhe pelo dashboard VETRIC Gran Marine!`,
        tempo_minutos: 3,
        power_threshold_w: null,
        ativo: true
      },
      {
        tipo: 'inicio_ociosidade',
        mensagem: `⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} entrou em OCIOSIDADE.

⚡ Consumo até agora: {{energia}} kWh
🕐 {{data}}

Sua bateria pode estar cheia. Por favor, remova o cabo para liberar o carregador.

Obrigado pela compreensão! 🙏`,
        tempo_minutos: 0,
        power_threshold_w: 10,
        ativo: false
      },
      {
        tipo: 'bateria_cheia',
        mensagem: `🔋 Olá {{nome}}!

Seu veículo está com a bateria CARREGADA! 🎉

⚡ Consumo total: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Por favor, remova o cabo para liberar o carregador.

Obrigado por utilizar nosso sistema! 🙏`,
        tempo_minutos: 3,
        power_threshold_w: 10,
        ativo: false
      },
      {
        tipo: 'interrupcao',
        mensagem: `⚠️ Olá {{nome}}!

Seu carregamento no {{charger}} foi INTERROMPIDO.

⚡ Consumo parcial: {{energia}} kWh
⏱️ Duração: {{duracao}}
📍 {{charger}}

Se não foi você, verifique seu veículo ou entre em contato com a administração.

Telefone: (82) 3333-4444
WhatsApp: (82) 99999-9999`,
        tempo_minutos: 0,
        power_threshold_w: null,
        ativo: false
      }
    ];

    for (const template of templates) {
      await query(`
        INSERT INTO templates_notificacao (tipo, mensagem, tempo_minutos, power_threshold_w, ativo)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (tipo) DO UPDATE SET
          mensagem = EXCLUDED.mensagem,
          tempo_minutos = EXCLUDED.tempo_minutos,
          power_threshold_w = EXCLUDED.power_threshold_w,
          ativo = EXCLUDED.ativo
      `, [
        template.tipo,
        template.mensagem,
        template.tempo_minutos,
        template.power_threshold_w,
        template.ativo
      ]);
      console.log(`   ✅ ${template.tipo}`);
    }

    console.log('\n📊 Verificando templates criados...\n');
    const result = await query(`
      SELECT tipo, tempo_minutos, power_threshold_w, ativo, LENGTH(mensagem) as tamanho
      FROM templates_notificacao
      ORDER BY 
        CASE tipo
          WHEN 'inicio_recarga' THEN 1
          WHEN 'inicio_ociosidade' THEN 2
          WHEN 'bateria_cheia' THEN 3
          WHEN 'interrupcao' THEN 4
        END
    `);

    console.table(result);

    console.log('\n✅ Templates ajustados com sucesso!\n');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

ajustarTemplates();

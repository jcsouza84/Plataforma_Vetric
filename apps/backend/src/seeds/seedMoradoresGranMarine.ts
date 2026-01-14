/**
 * SEED: Moradores Gran Marine
 * 
 * Popula banco de dados com 47 moradores únicos do condomínio Gran Marine.
 * 
 * Fonte: Usuários_Jan_2026_Marine.pdf
 * Data: 12/01/2026
 * 
 * Observações:
 * - 5 duplicatas removidas (mantida primeira ocorrência)
 * - 12 moradores com múltiplas tags (criados registros separados)
 * - Telefones: NULL por padrão (98% sem telefone)
 * - Notificações: DESATIVADAS por padrão
 */

import { MoradorModel } from '../models/Morador';

interface MoradorSeed {
  nome: string;
  apartamento: string;
  tag_rfid: string;
  telefone: string | null;
  notificacoes_ativas: boolean;
}

export async function seedMoradoresGranMarine() {
  console.log('\n🌱 Iniciando seed de moradores Gran Marine...\n');

  const moradores: MoradorSeed[] = [
    // 1. Alex Purger Richa
    { nome: 'Alex Purger Richa', apartamento: '804-A', tag_rfid: '57F44055344C40FAA99', telefone: null, notificacoes_ativas: false },
    
    // 2. Alexandre Cesar Feitosa
    { nome: 'Alexandre Cesar Feitosa', apartamento: '205-A', tag_rfid: '9D8B193B', telefone: null, notificacoes_ativas: false },
    
    // 3. Anne Karoline Dantas da Silva
    { nome: 'Anne Karoline Dantas da Silva', apartamento: '106-B', tag_rfid: '8E17300F', telefone: null, notificacoes_ativas: false },
    
    // 4. Antonio de Padua Gomes Dalmeida Lins
    { nome: 'Antonio de Padua Gomes Dalmeida Lins', apartamento: '1702-A', tag_rfid: '9D19D93A', telefone: null, notificacoes_ativas: false },
    
    // 5. Beatriz Nunes
    { nome: 'Beatriz Nunes', apartamento: '1506-A', tag_rfid: '1D5E0A3BADACFE3A', telefone: null, notificacoes_ativas: false },
    
    // 6. Bruno Gustavo Araujo Loureiro
    { nome: 'Bruno Gustavo Araujo Loureiro', apartamento: '1002-A', tag_rfid: '6D4F1C3B', telefone: null, notificacoes_ativas: false },
    
    // 7. Bruno Wanderley Soutinho
    { nome: 'Bruno Wanderley Soutinho', apartamento: '1005-A', tag_rfid: 'AD49EA3A47A4B93B', telefone: null, notificacoes_ativas: false },
    
    // 8. Carlos Henrique Costa Mousinho
    { nome: 'Carlos Henrique Costa Mousinho', apartamento: '1203-A', tag_rfid: 'FDAD233B', telefone: null, notificacoes_ativas: false },
    
    // 9. Cintia Vieira
    { nome: 'Cintia Vieira', apartamento: '903-B', tag_rfid: '9D4E213B', telefone: null, notificacoes_ativas: false },
    
    // 10. Claudevania Pereira Martins
    { nome: 'Claudevania Pereira Martins', apartamento: '1502-A', tag_rfid: '5D210A3B', telefone: null, notificacoes_ativas: false },
    
    // 11. Diego Melo Rocha Pinto
    { nome: 'Diego Melo Rocha Pinto', apartamento: '403-B', tag_rfid: 'CD1CF33A', telefone: null, notificacoes_ativas: false },
    
    // 12. Elder Mendes de Gusmao
    { nome: 'Elder Mendes de Gusmao', apartamento: '502-A', tag_rfid: 'ED91F53A', telefone: null, notificacoes_ativas: false },
    
    // 13. Eloisa Helena Hernandez
    { nome: 'Eloisa Helena Hernandez', apartamento: '1106-B', tag_rfid: '0DDA153B', telefone: null, notificacoes_ativas: false },
    
    // 14. Fernanda Lajes Carnauba
    { nome: 'Fernanda Lajes Carnauba', apartamento: '1604-A', tag_rfid: '5D92123B', telefone: null, notificacoes_ativas: false },
    
    // 15. Fernando Luis Tenorio Mascarenhas (2 tags)
    { nome: 'Fernando Luis Tenorio Mascarenhas', apartamento: '1906-A', tag_rfid: '9D3DFB3A', telefone: null, notificacoes_ativas: false },
    { nome: 'Fernando Luis Tenorio Mascarenhas', apartamento: '1906-A', tag_rfid: '2BD6A4BB932042A686E', telefone: null, notificacoes_ativas: false },
    
    // 16. Glaucio Mauren da Silva Geronimo
    { nome: 'Glaucio Mauren da Silva Geronimo', apartamento: '1401-B', tag_rfid: '4D150A3B', telefone: null, notificacoes_ativas: false },
    
    // 17. Graziela Cyntia Silva Santos
    { nome: 'Graziela Cyntia Silva Santos', apartamento: '205-B', tag_rfid: '2D1D003B', telefone: null, notificacoes_ativas: false },
    
    // 18. Hitamar Lacerda de Sousa (2 tags)
    { nome: 'Hitamar Lacerda de Sousa', apartamento: '505-B', tag_rfid: '003B21CFBDBDCFC213B', telefone: null, notificacoes_ativas: false },
    
    // 19. Igor de Lima Ribeiro
    { nome: 'Igor de Lima Ribeiro', apartamento: '2003-A', tag_rfid: 'ED38E13A', telefone: null, notificacoes_ativas: false },
    
    // 20. Jose Alvaro Costa Filho
    { nome: 'Jose Alvaro Costa Filho', apartamento: '401-A', tag_rfid: '4DF9073B', telefone: null, notificacoes_ativas: false },
    
    // 21. Kelly Campos Abu Hanna
    { nome: 'Kelly Campos Abu Hanna', apartamento: '1704-B', tag_rfid: '5DF3FE3A', telefone: null, notificacoes_ativas: false },
    
    // 22. Lara Reder Richa (2 tags)
    { nome: 'Lara Reder Richa', apartamento: '804-A', tag_rfid: '8DB1163B', telefone: null, notificacoes_ativas: false },
    { nome: 'Lara Reder Richa', apartamento: '804-A', tag_rfid: 'DDF3133B', telefone: null, notificacoes_ativas: false },
    
    // 23. Lincoln dos Santos Lima (2 tags)
    { nome: 'Lincoln dos Santos Lima', apartamento: '1505-B', tag_rfid: 'CD2E023B', telefone: null, notificacoes_ativas: false },
    { nome: 'Lincoln dos Santos Lima', apartamento: '1505-B', tag_rfid: '9DE3133B', telefone: null, notificacoes_ativas: false },
    
    // 24. Luciano Midlej Joaquim Patury (2 tags)
    { nome: 'Luciano Midlej Joaquim Patury', apartamento: '1006-A', tag_rfid: '8D7A223B', telefone: null, notificacoes_ativas: false },
    { nome: 'Luciano Midlej Joaquim Patury', apartamento: '1006-A', tag_rfid: '5BFB4592665A4636817', telefone: null, notificacoes_ativas: false },
    
    // 25. Lucicarla Azevedo Costa (DUPLICATA REMOVIDA)
    { nome: 'Lucicarla Azevedo Costa', apartamento: '403-B', tag_rfid: '2D9C163B', telefone: null, notificacoes_ativas: false },
    
    // 26. Marcio Antonio de Lima Silva
    { nome: 'Marcio Antonio de Lima Silva', apartamento: '202-A', tag_rfid: '8DB6053B', telefone: null, notificacoes_ativas: false },
    
    // 27. Marcos Paulo De Oliveira Silva
    { nome: 'Marcos Paulo De Oliveira Silva', apartamento: '1202-A', tag_rfid: 'FD50DF3A', telefone: null, notificacoes_ativas: false },
    
    // 28. Marcus Vinicius Silva Ferreira
    { nome: 'Marcus Vinicius Silva Ferreira', apartamento: '305-A', tag_rfid: 'AD16013B', telefone: null, notificacoes_ativas: false },
    
    // 29. Maria Caroline (DUPLICATA REMOVIDA)
    { nome: 'Maria Caroline', apartamento: '1603-A', tag_rfid: '2D62AD66', telefone: null, notificacoes_ativas: false },
    
    // 30. Miguel Oliveira Beer (2 tags)
    { nome: 'Miguel Oliveira Beer', apartamento: '804-B', tag_rfid: 'FD6EFB3A', telefone: null, notificacoes_ativas: false },
    { nome: 'Miguel Oliveira Beer', apartamento: '804-B', tag_rfid: '432D8B6727E74A67BE7', telefone: null, notificacoes_ativas: false },
    
    // 31. Milton Expedito (DUPLICATA REMOVIDA - mantido nome mais completo)
    { nome: 'Milton Expedito de Oliveira Neto', apartamento: '806-B', tag_rfid: '6D14F33A', telefone: null, notificacoes_ativas: false },
    
    // 32. Natanael Henrique da Costa Santos
    { nome: 'Natanael Henrique da Costa Santos', apartamento: '702-B', tag_rfid: 'EDF9E33A', telefone: null, notificacoes_ativas: false },
    
    // 33. Pedro Henrique Soares Avelar
    { nome: 'Pedro Henrique Soares Avelar', apartamento: '1904-B', tag_rfid: '4D9FED3A', telefone: null, notificacoes_ativas: false },
    
    // 34. Rafaella Ayres Montenegro (3 tags)
    { nome: 'Rafaella Ayres Montenegro', apartamento: '1102-B', tag_rfid: '9D96EF3A', telefone: null, notificacoes_ativas: false },
    { nome: 'Rafaella Ayres Montenegro', apartamento: '1102-B', tag_rfid: '2D06E33A', telefone: null, notificacoes_ativas: false },
    { nome: 'Rafaella Ayres Montenegro', apartamento: '1102-B', tag_rfid: 'E3B8916827AC4DFCA80', telefone: null, notificacoes_ativas: false },
    
    // 35. Raphael Ferreira Carnauba (2 tags)
    { nome: 'Raphael Ferreira Carnauba', apartamento: '1406-A', tag_rfid: '3B0B6E5D', telefone: null, notificacoes_ativas: false },
    { nome: 'Raphael Ferreira Carnauba', apartamento: '1406-A', tag_rfid: '5D6E0B3B', telefone: null, notificacoes_ativas: false },
    
    // 36. Renata Kiara Lins Valenca Carnauba (2 tags)
    { nome: 'Renata Kiara Lins Valenca Carnauba', apartamento: '1406-A', tag_rfid: '5D78DD3A', telefone: null, notificacoes_ativas: false },
    { nome: 'Renata Kiara Lins Valenca Carnauba', apartamento: '1406-A', tag_rfid: '430CAD99BA5048BDB47', telefone: null, notificacoes_ativas: false },
    
    // 37. Ricardo Freire Barros
    { nome: 'Ricardo Freire Barros', apartamento: '1902-B', tag_rfid: '8D5A233B', telefone: null, notificacoes_ativas: false },
    
    // 38. Samires Trindade de Almeida
    { nome: 'Samires Trindade de Almeida', apartamento: '1304-A', tag_rfid: 'ED80F63A', telefone: null, notificacoes_ativas: false },
    
    // 39. Saskya Lorena Ramos Lacerda (2 tags)
    { nome: 'Saskya Lorena Ramos Lacerda', apartamento: '704-B', tag_rfid: 'CD98043B', telefone: null, notificacoes_ativas: false },
    { nome: 'Saskya Lorena Ramos Lacerda', apartamento: '704-B', tag_rfid: '56AB0CC103094E32983', telefone: null, notificacoes_ativas: false },
    
    // 40. Saulo Levi Xaviei da Silva
    { nome: 'Saulo Levi Xaviei da Silva', apartamento: '1303-B', tag_rfid: 'EDC9143B', telefone: null, notificacoes_ativas: false },
    
    // 41. Sidrack Ferreira da Silva
    { nome: 'Sidrack Ferreira da Silva', apartamento: '605-B', tag_rfid: 'DDA91A3B', telefone: null, notificacoes_ativas: false },
    
    // 42. Sonia Aparecida Lourenco (DUPLICATA - mantida 1805-B)
    { nome: 'Sonia Aparecida Lourenco', apartamento: '1805-B', tag_rfid: '7D3DE03A', telefone: null, notificacoes_ativas: false },
    
    // 43. Tarcisio Alves Martins (DUPLICATA REMOVIDA)
    { nome: 'Tarcisio Alves Martins', apartamento: '803-B', tag_rfid: 'FD78053B', telefone: null, notificacoes_ativas: false },
    
    // 44. Thiago De Lima Viana Gomes (2 tags)
    { nome: 'Thiago De Lima Viana Gomes', apartamento: '405-A', tag_rfid: '7D59FC3A', telefone: null, notificacoes_ativas: false },
    { nome: 'Thiago De Lima Viana Gomes', apartamento: '405-A', tag_rfid: '77F7194E', telefone: null, notificacoes_ativas: false },
    
    // 45. Vanessa Camacho
    { nome: 'Vanessa Camacho', apartamento: '602-B', tag_rfid: '003B10DC6D', telefone: null, notificacoes_ativas: false },
    
    // 46. Vetric (conta de teste com telefone)
    { nome: 'Vetric', apartamento: '001-A', tag_rfid: '87BA5C4E', telefone: '+5582996176797', notificacoes_ativas: true },
    
    // 47. Wemison Silva Roseana Carvalho (2 tags)
    { nome: 'Wemison Silva Roseana Carvalho', apartamento: '906-B', tag_rfid: 'DDC80F3B', telefone: null, notificacoes_ativas: false },
    { nome: 'Wemison Silva Roseana Carvalho', apartamento: '906-B', tag_rfid: 'BF77DA9CD83C4B919BD', telefone: null, notificacoes_ativas: false },
  ];

  let cadastrados = 0;
  let erros = 0;

  for (const m of moradores) {
    try {
      // Verificar se tag já existe
      const existente = await MoradorModel.findByTag(m.tag_rfid);

      if (existente) {
        console.log(`⏭️  Tag ${m.tag_rfid} já cadastrada para ${existente.nome}`);
        continue;
      }

      // Criar morador
      await MoradorModel.create({
        nome: m.nome,
        apartamento: m.apartamento,
        telefone: m.telefone,
        tag_rfid: m.tag_rfid,
        notificacoes_ativas: m.notificacoes_ativas
      });

      cadastrados++;
      
      const statusNotif = m.notificacoes_ativas ? '🔔 ON' : '🔕 OFF';
      const statusTel = m.telefone ? `📱 ${m.telefone}` : '📱 -';
      console.log(`✅ ${m.nome.padEnd(40)} | ${m.apartamento.padEnd(8)} | ${statusTel.padEnd(18)} | ${statusNotif}`);

    } catch (error: any) {
      erros++;
      console.error(`❌ Erro ao cadastrar ${m.nome}:`, error.message);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\n✅ SEED CONCLUÍDO!`);
  console.log(`   📊 Total: ${moradores.length} registros`);
  console.log(`   ✅ Cadastrados: ${cadastrados}`);
  console.log(`   ⏭️  Já existentes: ${moradores.length - cadastrados - erros}`);
  console.log(`   ❌ Erros: ${erros}`);
  console.log(`\n📝 Observações:`);
  console.log(`   • ${moradores.filter(m => m.telefone).length} morador(es) com telefone`);
  console.log(`   • ${moradores.filter(m => !m.telefone).length} morador(es) sem telefone`);
  console.log(`   • ${moradores.filter(m => m.notificacoes_ativas).length} morador(es) com notificações ATIVADAS`);
  console.log(`   • ${moradores.filter(m => !m.notificacoes_ativas).length} morador(es) com notificações DESATIVADAS`);
  console.log(`\n💡 Próximos passos:`);
  console.log(`   1. Admin adiciona telefones conforme necessário`);
  console.log(`   2. Admin ativa notificações WhatsApp por morador`);
  console.log(`   3. Sistema envia notificações apenas para quem tem telefone + notif ativa`);
  console.log('\n' + '═'.repeat(80) + '\n');
}


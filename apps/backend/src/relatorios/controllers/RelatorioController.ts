/**
 * 📊 VETRIC Reports - Controller: Geração de Relatórios
 * 🆕 COM CORREÇÃO DO BUG: Salva no BD, não no localStorage!
 */

import { Request, Response } from 'express';
import multer from 'multer';
import { EmpreendimentoRelatorioModel } from '../models/EmpreendimentoRelatorio';
import { UsuarioRelatorioModel } from '../models/UsuarioRelatorio';
import { ConfiguracaoTarifariaModel } from '../models/ConfiguracaoTarifaria';
import { RelatorioGeradoModel } from '../models/RelatorioGerado';
import { processarXLSX, detectarMesAno, validarFormatoData } from '../lib/xlsx-processor';
import { calcularJanelas, calcularHorariosJanela, formatarDuracaoLegivel } from '../lib/calcular-janelas';
import { processarOciosidade } from '../lib/ociosidade-processor';

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage });

export class RelatorioController {
  /**
   * Preview da planilha XLSX (validação E preview completo antes de gerar)
   * 🆕 Inclui: gráficos, resumos, ociosidade, detalhamento por morador
   */
  static async previewXLSX(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { empreendimentoId } = req.body;

      if (!empreendimentoId) {
        return res.status(400).json({ error: 'empreendimentoId é obrigatório' });
      }

      // Buscar dados necessários
      const [empreendimento, config, usuarios] = await Promise.all([
        EmpreendimentoRelatorioModel.findById(empreendimentoId),
        ConfiguracaoTarifariaModel.findByEmpreendimento(empreendimentoId),
        UsuarioRelatorioModel.findByEmpreendimento(empreendimentoId),
      ]);

      if (!empreendimento || !config) {
        return res.status(404).json({ error: 'Empreendimento ou configuração não encontrados' });
      }

      // Processar XLSX
      const dadosNormalizados = await processarXLSX(req.file.buffer);
      const mesAno = detectarMesAno(dadosNormalizados);

      // Criar mapa de TAGs
      const tagMap = new Map<string, any>();
      usuarios.forEach((usuario) => {
        usuario.tags.forEach((tag: string) => {
          tagMap.set(tag.toUpperCase(), usuario);
        });
      });

      // Processar cargas válidas E rejeitadas (para preview completo)
      const cargasProcessadas: any[] = [];
      const cargasRejeitadas: any[] = [];

      dadosNormalizados.forEach((carga) => {
        const usuario = tagMap.get(carga.tag);
        
        // Validações
        let status: 'validada' | 'rejeitada' = 'validada';
        let motivo = '';

        if (!carga.tag || !tagMap.has(carga.tag)) {
          status = 'rejeitada';
          motivo = 'TAG não cadastrada';
        } else if (carga.energia <= 0) {
          status = 'rejeitada';
          motivo = 'Energia <= 0';
        } else if (carga.energia > config.limite_energia_max_kwh) {
          status = 'rejeitada';
          motivo = `Energia > ${config.limite_energia_max_kwh} kWh`;
        } else if (!validarFormatoData(carga.intervalo)) {
          status = 'rejeitada';
          motivo = 'Formato de data inválido';
        }

        if (status === 'rejeitada') {
          cargasRejeitadas.push({
            id: carga.id,
            estacao: carga.estacao,
            tag: carga.tag,
            usuario: usuario?.nome || 'Desconhecido',
            intervalo: carga.intervalo,
            energia: carga.energia,
            motivo,
          });
        } else {
          // Calcular tarifas
          const janelas = calcularJanelas(carga.intervalo, carga.energia, config);
          
          // Somar energia de ponta e fora ponta do array de janelas
          const energiaPonta = janelas
            .filter(j => j.janela === 'Ponta')
            .reduce((sum, j) => sum + j.energiaKWh, 0);
          
          const energiaForaPonta = janelas
            .filter(j => j.janela === 'Fora Ponta')
            .reduce((sum, j) => sum + j.energiaKWh, 0);
          
          const valorPonta = energiaPonta * config.tarifa_ponta;
          const valorForaPonta = energiaForaPonta * config.tarifa_fora_ponta;
          const valorTotal = valorPonta + valorForaPonta;

          cargasProcessadas.push({
            ...carga,
            usuario,
            energiaPonta,
            energiaForaPonta,
            valorPonta,
            valorForaPonta,
            valorTotal,
            janelas,
          });
        }
      });

      // Calcular resumo geral
      const totalRecargas = cargasProcessadas.length;
      const totalConsumo = cargasProcessadas.reduce((sum, c) => sum + c.energia, 0);
      const totalValor = cargasProcessadas.reduce((sum, c) => sum + c.valorTotal, 0);
      const totalConsumoPonta = cargasProcessadas.reduce((sum, c) => sum + c.energiaPonta, 0);
      const totalConsumoForaPonta = cargasProcessadas.reduce((sum, c) => sum + c.energiaForaPonta, 0);

      // Consumo por estação
      const consumoPorEstacao = new Map<string, { consumo: number; recargas: number }>();
      cargasProcessadas.forEach((carga) => {
        const estacao = carga.estacao;
        const current = consumoPorEstacao.get(estacao) || { consumo: 0, recargas: 0 };
        consumoPorEstacao.set(estacao, {
          consumo: current.consumo + carga.energia,
          recargas: current.recargas + 1,
        });
      });

      const dadosGrafico = Array.from(consumoPorEstacao.entries())
        .map(([estacao, data]) => ({
          estacao,
          consumo: Number(data.consumo.toFixed(2)),
          recargas: data.recargas,
        }))
        .sort((a, b) => b.consumo - a.consumo);

      // Processar ociosidade
      const dadosOciosidade = processarOciosidade(
        cargasProcessadas,
        config.limite_ociosidade_min
      );
      const totalOcorrencias = dadosOciosidade.ocorrencias || 0;
      const tempoTotalOcioso = dadosOciosidade.tempoTotalMinutos || 0;

      // Resumo por usuário
      const usuariosMap = new Map<string, any>();
      cargasProcessadas.forEach((carga) => {
        const userId = carga.usuario?.id || 'desconhecido';
        
        if (!usuariosMap.has(userId)) {
          usuariosMap.set(userId, {
            nome: carga.usuario?.nome || 'Desconhecido',
            unidade: carga.usuario?.unidade || '',
            torre: carga.usuario?.torre || '',
            recargas: 0,
            consumo: 0,
            valor: 0,
            ocorrenciasOciosidade: 0,
            tempoOcioso: 0,
          });
        }

        const userData = usuariosMap.get(userId);
        userData.recargas += 1;
        userData.consumo += carga.energia;
        userData.valor += carga.valorTotal;

        // Ociosidade
        if (carga.tempoOcioso && carga.tempoOcioso >= config.limite_ociosidade_min) {
          userData.ocorrenciasOciosidade += 1;
          userData.tempoOcioso += carga.tempoOcioso;
        }
      });

      const resumoPorUsuario = Array.from(usuariosMap.values())
        .map((u) => ({
          ...u,
          consumo: Number(u.consumo.toFixed(2)),
          valor: Number(u.valor.toFixed(2)),
        }))
        .sort((a, b) => b.consumo - a.consumo);

      // Alertas
      const alertasMap = new Map<string, number>();
      cargasRejeitadas.forEach((c) => {
        alertasMap.set(c.motivo, (alertasMap.get(c.motivo) || 0) + 1);
      });

      const alertas = Array.from(alertasMap.entries()).map(
        ([motivo, qtd]) => `${qtd} carga(s) rejeitada(s): ${motivo}`
      );

      res.json({
        mesAno,
        totalRegistros: dadosNormalizados.length,
        validos: cargasProcessadas.length,
        rejeitados: cargasRejeitadas.length,
        alertas,
        
        // 🆕 DADOS COMPLETOS PARA PREVIEW
        resumoGeral: {
          totalRecargas,
          totalConsumo: Number(totalConsumo.toFixed(2)),
          totalValor: Number(totalValor.toFixed(2)),
          totalConsumoPonta: Number(totalConsumoPonta.toFixed(2)),
          totalConsumoForaPonta: Number(totalConsumoForaPonta.toFixed(2)),
        },
        consumoPorEstacao: dadosGrafico,
        dadosGrafico,
        resumoOciosidade: {
          totalOcorrencias,
          tempoTotalOcioso,
          tempoTotalOciosoFormatado: formatarDuracaoLegivel(tempoTotalOcioso),
        },
        resumoPorUsuario,
        cargasRejeitadas,
        empreendimento: {
          nome: empreendimento.nome,
          sistema: empreendimento.sistema_carregamento,
        },
        config: {
          tarifaPonta: config.tarifa_ponta,
          tarifaForaPonta: config.tarifa_fora_ponta,
        },
      });
    } catch (error) {
      console.error('Erro no preview:', error);
      res.status(500).json({ error: 'Erro ao processar planilha' });
    }
  }

  /**
   * 🔥 GERAR RELATÓRIO COMPLETO (COM CORREÇÃO DO BUG!)
   * Salva TODOS os dados no campo dados_completos do banco
   */
  static async gerarRelatorio(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { empreendimentoId } = req.body;

      if (!empreendimentoId) {
        return res.status(400).json({ error: 'empreendimentoId é obrigatório' });
      }

      // Buscar dados necessários
      const [empreendimento, config, usuarios] = await Promise.all([
        EmpreendimentoRelatorioModel.findById(empreendimentoId),
        ConfiguracaoTarifariaModel.findByEmpreendimento(empreendimentoId),
        UsuarioRelatorioModel.findByEmpreendimento(empreendimentoId),
      ]);

      if (!empreendimento || !config) {
        return res.status(404).json({ error: 'Empreendimento ou configuração não encontrados' });
      }

      // Processar XLSX
      const dadosNormalizados = await processarXLSX(req.file.buffer);
      const mesAno = detectarMesAno(dadosNormalizados);

      // Criar mapa de TAGs
      const tagMap = new Map<string, any>();
      usuarios.forEach((usuario) => {
        usuario.tags.forEach((tag: string) => {
          tagMap.set(tag.toUpperCase(), usuario);
        });
      });

      // Processar cargas válidas
      const cargasProcessadas: any[] = [];

      dadosNormalizados.forEach((carga) => {
        // Validações
        if (
          carga.energia <= 0 ||
          carga.energia > config.limite_energia_max_kwh ||
          !carga.tag ||
          !tagMap.has(carga.tag) ||
          !validarFormatoData(carga.intervalo)
        ) {
          return; // Pular inválidas
        }

        const usuario = tagMap.get(carga.tag);
        const janelas = calcularJanelas(carga.intervalo, carga.energia, {
          tarifaPonta: parseFloat(String(config.tarifa_ponta)),
          tarifaForaPonta: parseFloat(String(config.tarifa_fora_ponta)),
          pontaInicioHora: config.ponta_inicio_hora,
          pontaInicioMinuto: config.ponta_inicio_minuto,
          pontaFimHora: config.ponta_fim_hora,
          pontaFimMinuto: config.ponta_fim_minuto,
          pontaSegunda: config.ponta_segunda,
          pontaTerca: config.ponta_terca,
          pontaQuarta: config.ponta_quarta,
          pontaQuinta: config.ponta_quinta,
          pontaSexta: config.ponta_sexta,
          pontaSabado: config.ponta_sabado,
          pontaDomingo: config.ponta_domingo,
        });

        janelas.forEach((janela, index) => {
          const horarios = calcularHorariosJanela(carga.intervalo, index, janelas, {
            tarifaPonta: parseFloat(String(config.tarifa_ponta)),
            tarifaForaPonta: parseFloat(String(config.tarifa_fora_ponta)),
            pontaInicioHora: config.ponta_inicio_hora,
            pontaInicioMinuto: config.ponta_inicio_minuto,
            pontaFimHora: config.ponta_fim_hora,
            pontaFimMinuto: config.ponta_fim_minuto,
            pontaSegunda: config.ponta_segunda,
            pontaTerca: config.ponta_terca,
            pontaQuarta: config.ponta_quarta,
            pontaQuinta: config.ponta_quinta,
            pontaSexta: config.ponta_sexta,
            pontaSabado: config.ponta_sabado,
            pontaDomingo: config.ponta_domingo,
          });

          cargasProcessadas.push({
            cargaOriginalId: carga.id,
            estacao: carga.estacao,
            usuario: usuario.nome,
            tag: carga.tag,
            unidade: usuario.unidade,
            torre: usuario.torre,
            dataUtilizacao: carga.intervalo,
            janela: janela.janela,
            horarioInicio: horarios.inicio,
            horarioFim: horarios.fim,
            duracaoHoras: janela.duracaoSegundos / 3600,
            energiaKWh: janela.energiaKWh,
            tarifa: janela.tarifa,
            valor: janela.valor,
            ociosidade: carga.ociosidade,
            isDivisao: janelas.length > 1,
            sequenciaDivisao: janelas.length > 1 ? index + 1 : undefined,
          });
        });
      });

      // Calcular totais
      const totalRecargas = new Set(cargasProcessadas.map((c) => c.cargaOriginalId)).size;
      const totalConsumo = cargasProcessadas.reduce((sum, c) => sum + c.energiaKWh, 0);
      const totalValor = cargasProcessadas.reduce((sum, c) => sum + c.valor, 0);

      // Calcular resumo por usuário
      const resumoMap = new Map<string, any>();

      cargasProcessadas.forEach((carga) => {
        const key = `${carga.usuario}|${carga.unidade}|${carga.torre}`;

        if (!resumoMap.has(key)) {
          const usuarioEncontrado = usuarios.find(
            (u) => u.nome === carga.usuario && u.unidade === carga.unidade && u.torre === carga.torre
          );

          resumoMap.set(key, {
            usuario: carga.usuario,
            unidade: carga.unidade,
            torre: carga.torre,
            tags: usuarioEncontrado?.tags || [],
            totalEnergiaKWh: 0,
            totalDuracaoHoras: 0,
            totalCargas: 0,
            valorTotal: 0,
            ocorrenciasOciosidade: 0,
            tempoOciosoTotal: 0,
            tempoOciosoFormatado: '0min',
          });
        }

        const resumo = resumoMap.get(key)!;
        resumo.totalEnergiaKWh += carga.energiaKWh;
        resumo.totalDuracaoHoras += carga.duracaoHoras;
        resumo.valorTotal += carga.valor;
      });

      // Contar cargas únicas por usuário
      const cargasOriginaisUsuario = new Map<string, Set<string>>();
      dadosNormalizados.forEach((carga) => {
        if (carga.tag && tagMap.has(carga.tag)) {
          const usuario = tagMap.get(carga.tag);
          const key = `${usuario.nome}|${usuario.unidade}|${usuario.torre}`;
          if (!cargasOriginaisUsuario.has(key)) {
            cargasOriginaisUsuario.set(key, new Set());
          }
          cargasOriginaisUsuario.get(key)!.add(carga.intervalo);
        }
      });

      cargasOriginaisUsuario.forEach((datas, key) => {
        if (resumoMap.has(key)) {
          resumoMap.get(key)!.totalCargas = datas.size;
        }
      });

      const resumoPorUsuario = Array.from(resumoMap.values()).sort((a, b) =>
        a.usuario.localeCompare(b.usuario, 'pt-BR')
      );

      // Processar ociosidade
      resumoPorUsuario.forEach((resumo) => {
        const cargasDoUsuario = cargasProcessadas.filter(
          (c) => c.usuario === resumo.usuario && c.unidade === resumo.unidade && c.torre === resumo.torre
        );

        const dadosOciosidade = processarOciosidade(cargasDoUsuario, config.limite_ociosidade_min);
        resumo.ocorrenciasOciosidade = dadosOciosidade.ocorrencias;
        resumo.tempoOciosoTotal = dadosOciosidade.tempoTotalMinutos;
        resumo.tempoOciosoFormatado = dadosOciosidade.tempoFormatado;
      });

      // 🔥 SALVAR NO BANCO (COM CORREÇÃO DO BUG!)
      const relatorio = await RelatorioGeradoModel.create({
        empreendimento_id: empreendimentoId,
        mes_ano: mesAno,
        total_recargas: totalRecargas,
        total_consumo: totalConsumo,
        total_valor: totalValor,
        dados_completos: {
          // 🔥 CORREÇÃO: Salvar TUDO no banco!
          mesAno,
          empreendimento: {
            nome: empreendimento.nome,
            logoUrl: empreendimento.logo_url,
          },
          config: {
            tarifaPonta: config.tarifa_ponta,
            tarifaForaPonta: config.tarifa_fora_ponta,
            limiteOciosidadeMin: config.limite_ociosidade_min,
          },
          resumoGeral: {
            totalRecargas,
            totalConsumo,
            totalValor,
            totalDuracao: cargasProcessadas.reduce((sum, c) => sum + c.duracaoHoras, 0),
          },
          resumoPorUsuario,
          cargasDetalhadas: cargasProcessadas,
        },
      });

      res.json({
        relatorioId: relatorio.id,
        mesAno,
        message: 'Relatório gerado com sucesso e salvo no banco de dados!',
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  /**
   * 🔥 BUSCAR RELATÓRIO DO BANCO (NÃO DO LOCALSTORAGE!)
   */
  static async buscarRelatorio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const relatorio = await RelatorioGeradoModel.findById(id);

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      res.json({
        relatorioId: relatorio.id,
        ...relatorio.dados_completos, // Retorna TODOS os dados salvos
      });
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
  }

  /**
   * Listar relatórios de um empreendimento
   */
  static async listarRelatorios(req: Request, res: Response) {
    try {
      const { empreendimentoId } = req.params;

      const relatorios = await RelatorioGeradoModel.findByEmpreendimento(empreendimentoId);

      res.json(relatorios);
    } catch (error) {
      console.error('Erro ao listar relatórios:', error);
      res.status(500).json({ error: 'Erro ao listar relatórios' });
    }
  }

  /**
   * Deletar relatório
   */
  static async deletarRelatorio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await RelatorioGeradoModel.delete(id);

      res.json({ message: 'Relatório deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      res.status(500).json({ error: 'Erro ao deletar relatório' });
    }
  }
}


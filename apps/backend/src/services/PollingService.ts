/**
 * 🔄 VETRIC - Serviço de Polling (Alternativa ao WebSocket)
 * 
 * Este serviço busca transações ativas da API CVE a cada X segundos
 * e identifica automaticamente os moradores pelo idTag (RFID).
 */

import { cveService } from './CVEService';
import { MoradorModel } from '../models/Morador';
import { CarregamentoModel } from '../models/Carregamento';
import { CVETransaction } from '../types';
import { logService } from './LogService';

export class PollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private pollingInterval: number = 10000; // 10 segundos
  private transacoesConhecidas: Map<string, number> = new Map(); // transactionId → carregamentoId
  
  // 🆕 Controle de logs de heartbeat (estratégia híbrida)
  private lastHeartbeatLogged: Map<string, number> = new Map(); // chargerUuid → timestamp
  private lastStatus: Map<string, string> = new Map(); // chargerUuid → status

  constructor(pollingInterval?: number) {
    if (pollingInterval) {
      this.pollingInterval = pollingInterval;
    }
  }

  /**
   * Iniciar polling automático
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Polling já está rodando');
      return;
    }

    console.log(`🔄 Iniciando polling (intervalo: ${this.pollingInterval / 1000}s)...`);
    this.isRunning = true;

    // Executar imediatamente
    this.poll();

    // Executar a cada X segundos
    this.intervalId = setInterval(() => {
      this.poll();
    }, this.pollingInterval);

    console.log('✅ Polling iniciado com sucesso!');
  }

  /**
   * Parar polling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Polling parado');
  }

  /**
   * Verificar se está rodando
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Executar uma verificação
   */
  private async poll(): Promise<void> {
    const inicioPolling = Date.now();
    
    try {
      // MÉTODO 1: Buscar transações ativas do CVE (mais confiável)
      const transacoesAtivas = await cveService.getActiveTransactions();

      if (transacoesAtivas.length === 0) {
        console.log(`📊 [Polling] Nenhuma transação ativa via /transactions`);
      } else {
        console.log(`📊 [Polling] ${transacoesAtivas.length} transação(ões) ativa(s) no CVE`);
        
        // Processar cada transação
        for (const transacao of transacoesAtivas) {
          await this.processarTransacao(transacao);
        }
      }

      // MÉTODO 2: SEMPRE verificar status dos carregadores diretamente
      // Isso garante que carregadores que voltaram para Available sejam finalizados
      console.log(`🔍 [Polling] Verificando status de todos os carregadores...`);
      await this.verificarStatusCarregadores();

      // 🆕 MÉTODO 3: Processar eventos de notificação (Ociosidade, Bateria Cheia, Interrupção)
      await this.processarEventosCarregamento();

      // Limpar transações conhecidas antigas
      await this.limparTransacoesFinalizadas();

      // 🆕 LOG: Ciclo de polling completado com sucesso
      const duracaoPolling = Date.now() - inicioPolling;
      await logService.logPolling(
        'POLLING_CYCLE',
        `Ciclo completado: ${transacoesAtivas.length} transações processadas`,
        'DEBUG',
        undefined,
        { 
          transacoes: transacoesAtivas.length,
          duracao_ms: duracaoPolling
        }
      );

    } catch (error: any) {
      console.error('❌ [Polling] Erro ao buscar transações:', error.message);
      
      // 🆕 LOG: Erro no polling
      await logService.logErro(
        'POLLING_ERROR',
        `Erro no ciclo de polling: ${error.message}`,
        error
      );
      
      // Fallback: verificar status dos carregadores diretamente
      try {
        console.log(`🔄 [Polling] Usando fallback: verificando carregadores...`);
        await this.verificarStatusCarregadores();
      } catch (fallbackError: any) {
        console.error('❌ [Polling] Erro no fallback:', fallbackError.message);
        await logService.logErro(
          'POLLING_FALLBACK_ERROR',
          `Erro no fallback do polling: ${fallbackError.message}`,
          fallbackError
        );
      }
    }
  }

  /**
   * NOVO: Verificar status dos carregadores diretamente (extrai idTag dos heartbeats/status)
   * Este método é usado quando o endpoint de transações falha ou não retorna dados
   */
  private async verificarStatusCarregadores(): Promise<void> {
    try {
      const chargers = await cveService.getChargers();
      let carregadoresAtivos = 0;

      for (const charger of chargers) {
        const connector = charger.connectors?.[0];
        if (!connector) continue;

        const status = connector.lastStatus?.status;
        
        // 🆕 ESTRATÉGIA HÍBRIDA: Log de Heartbeat
        // Logar SE: (1) Mudou de status OU (2) Passaram 5 minutos
        const statusAtual = status || 'Unknown';
        const statusAnterior = this.lastStatus.get(charger.uuid);
        const mudouStatus = statusAtual !== statusAnterior;
        
        const agora = Date.now();
        const ultimoLog = this.lastHeartbeatLogged.get(charger.uuid) || 0;
        const passaram5min = (agora - ultimoLog) / 60000 >= 5;
        
        if (mudouStatus || passaram5min) {
          const evento = mudouStatus ? 'STATUS_CHANGE' : 'HEARTBEAT';
          const nivel = mudouStatus ? 'SUCCESS' : 'DEBUG';
          const idTag = connector.lastStatus?.idTag;
          const power = connector.lastStatus?.power;
          
          await logService.logCveApi(
            evento,
            mudouStatus 
              ? `${charger.description}: ${statusAnterior || 'Unknown'} → ${statusAtual}`
              : `${charger.description} está ativo - Status: ${statusAtual}`,
            charger.uuid,
            charger.description,
            { 
              status: statusAtual, 
              status_anterior: statusAnterior,
              idTag: idTag || null,
              power: power || null,
              connector_id: connector.connectorId
            },
            undefined
          );
          
          this.lastHeartbeatLogged.set(charger.uuid, agora);
          this.lastStatus.set(charger.uuid, statusAtual);
        }
        
        // CASO 1: Carregador ESTÁ CARREGANDO/OCUPADO
        if (status === 'Charging' || status === 'Occupied' || status === 'Preparing') {
          carregadoresAtivos++;
          
          // Tentar extrair idTag usando o novo método híbrido
          const idTag = await cveService.extractIdTagFromCharger(charger);
          
          if (idTag) {
            console.log(`✅ [Polling] Carregador ${charger.description} com idTag: ${idTag}`);
            
            // Buscar morador
            const morador = await MoradorModel.findByTag(idTag);
            
            if (morador) {
              console.log(`👤 [Polling] Morador identificado: ${morador.nome} (Apto ${morador.apartamento})`);
              
              // 🆕 LOG: Morador identificado com sucesso
              await logService.logIdentificacao(
                true,
                charger.uuid,
                charger.description,
                idTag,
                morador.id!,
                morador.nome,
                `Morador ${morador.nome} (Apto ${morador.apartamento}) identificado via heartbeat`
              );
              
              // Verificar se já existe carregamento ativo
              const carregamentoExistente = await CarregamentoModel.findActiveByCharger(
                charger.uuid,
                connector.connectorId
              );
              
              if (!carregamentoExistente) {
                // Criar novo carregamento
                const carregamento = await CarregamentoModel.create({
                  moradorId: morador.id!,
                  chargerUuid: charger.uuid,
                  chargerName: charger.description || charger.chargeBoxId,
                  connectorId: connector.connectorId,
                  status: status === 'Charging' ? 'carregando' : 'iniciado',
                });
                
                console.log(`✅ [Polling] Novo carregamento registrado via status: ID ${carregamento.id}`);
              } else if (!carregamentoExistente.morador_id) {
                // Atualizar status e associar morador
                const newStatus = status === 'Charging' ? 'carregando' : 'iniciado';
                // Como não temos um método update genérico, vamos usar SQL direto
                const sql = 'UPDATE carregamentos SET morador_id = $1, status = $2 WHERE id = $3';
                const { query } = await import('../config/database');
                await query(sql, [morador.id!, newStatus, carregamentoExistente.id!]);
                console.log(`✅ [Polling] Carregamento ${carregamentoExistente.id} atualizado com morador`);
              }
            } else {
              console.warn(`⚠️  [Polling] Tag RFID ${idTag} não cadastrada`);
              
              // 🆕 LOG: Tag não identificada
              await logService.logIdentificacao(
                false,
                charger.uuid,
                charger.description,
                idTag,
                undefined,
                undefined,
                `Tag RFID ${idTag} não cadastrada no sistema`
              );
            }
          } else {
            console.log(`⚠️  [Polling] Carregador ${charger.description} ativo mas sem idTag identificável`);
            console.log(`   📊 Status: ${status}`);
            console.log(`   🔍 Connector lastStatus:`, JSON.stringify(connector.lastStatus, null, 2));
            console.log(`   🎯 idTag no connector:`, connector.lastStatus?.idTag || 'N/A');
          }
        } 
        // CASO 2: Carregador ESTÁ DISPONÍVEL - Finalizar carregamentos ativos
        else if (status === 'Available') {
          // Verificar se existe carregamento ativo para este carregador
          const carregamentoAtivo = await CarregamentoModel.findActiveByCharger(
            charger.uuid,
            connector.connectorId
          );
          
          if (carregamentoAtivo) {
            // Finalizar o carregamento
            await CarregamentoModel.updateStatus(carregamentoAtivo.id!, 'finalizado');
            console.log(`🏁 [Polling] Carregador ${charger.description} voltou para Available - Carregamento ${carregamentoAtivo.id} finalizado`);
          }
        }
      }
      
      if (carregadoresAtivos === 0) {
        console.log(`📊 [Polling] Nenhum carregador ativo no momento`);
      }
      
    } catch (error: any) {
      console.error('❌ [Polling] Erro ao verificar status dos carregadores:', error.message);
    }
  }

  /**
   * Processar uma transação ativa
   */
  private async processarTransacao(transacao: CVETransaction): Promise<void> {
    try {
      const transactionId = transacao.id;
      const chargerUuid = transacao.chargeBoxUuid;
      const connectorId = transacao.connectorId;
      const ocppIdTag = transacao.ocppIdTag;
      const chargerName = transacao.chargeBoxDescription;

      // Verificar se já processamos esta transação
      if (this.transacoesConhecidas.has(String(transactionId))) {
        // Já existe - apenas atualizar se necessário
        return;
      }

      console.log(`🔍 [Polling] Nova transação detectada: ${transactionId}`);
      console.log(`   🔌 Carregador: ${chargerName} (${chargerUuid})`);
      console.log(`   🎯 ocppIdTag: ${ocppIdTag}`);
      console.log(`   👤 Usuário CVE: ${transacao.userName || 'N/A'}`);
      console.log(`   🏠 Complemento: ${transacao.userAddressComplement || 'N/A'}`);

      // Buscar morador pela tag RFID (ocppIdTag)
      let morador = null;
      let moradorId = null;

      if (ocppIdTag) {
        morador = await MoradorModel.findByTag(ocppIdTag);
        if (morador) {
          moradorId = morador.id!;
          console.log(`✅ [Polling] Morador identificado no nosso BD: ${morador.nome} (Apto ${morador.apartamento})`);
          
          // 🆕 LOG: Morador identificado via transação
          await logService.logIdentificacao(
            true,
            chargerUuid,
            chargerName,
            ocppIdTag,
            morador.id!,
            morador.nome,
            `Morador ${morador.nome} identificado via transação ${transactionId}`
          );
        } else {
          console.warn(`⚠️  [Polling] Tag RFID "${ocppIdTag}" não cadastrada no nosso sistema`);
          console.log(`   💡 Sugestão: Cadastrar morador com tag_rfid = "${ocppIdTag}"`);
          if (transacao.userName) {
            console.log(`   📝 Nome no CVE: ${transacao.userName}`);
          }
          if (transacao.userAddressComplement) {
            console.log(`   🏠 Apartamento no CVE: ${transacao.userAddressComplement}`);
          }
          
          // 🆕 LOG: Tag não identificada
          await logService.logIdentificacao(
            false,
            chargerUuid,
            chargerName,
            ocppIdTag,
            undefined,
            undefined,
            `Tag RFID "${ocppIdTag}" não cadastrada. CVE User: ${transacao.userName || 'N/A'}`
          );
        }
      } else if (transacao.ocppTagPk) {
        // FALLBACK: Buscar morador pelo ocppTagPk na tabela de mapeamento manual
        console.log(`🔄 [Polling] ocppIdTag vazio, tentando mapeamento por ocppTagPk: ${transacao.ocppTagPk}`);
        
        try {
          const pool = await import('../config/database');
          const result = await pool.default.query(
            `SELECT m.* FROM moradores m
             INNER JOIN tag_pk_mapping tpm ON tpm.morador_id = m.id
             WHERE tpm.ocpp_tag_pk = $1`,
            [transacao.ocppTagPk]
          );
          
          if (result.rows.length > 0) {
            morador = result.rows[0];
            moradorId = morador.id;
            console.log(`✅ [Polling] Morador identificado via ocppTagPk: ${morador.nome} (Apto ${morador.apartamento})`);
            
            // 🆕 LOG: Morador identificado via ocppTagPk
            await logService.logIdentificacao(
              true,
              chargerUuid,
              chargerName,
              `TagPK:${transacao.ocppTagPk}`,
              morador.id,
              morador.nome,
              `Morador ${morador.nome} identificado via ocppTagPk ${transacao.ocppTagPk}`
            );
          } else {
            console.warn(`⚠️  [Polling] ocppTagPk ${transacao.ocppTagPk} não mapeado`);
            console.log(`   💡 Sugestão: Adicionar mapeamento manual na tabela tag_pk_mapping`);
            if (transacao.userName) {
              console.log(`   📝 Nome no CVE: ${transacao.userName}`);
            }
            
            // 🆕 LOG: ocppTagPk não mapeado
            await logService.logIdentificacao(
              false,
              chargerUuid,
              chargerName,
              `TagPK:${transacao.ocppTagPk}`,
              undefined,
              undefined,
              `ocppTagPk ${transacao.ocppTagPk} não mapeado. CVE User: ${transacao.userName || 'N/A'}`
            );
          }
        } catch (error) {
          console.error(`❌ [Polling] Erro ao buscar mapeamento:`, error);
        }
      } else {
        console.warn(`⚠️  [Polling] Transação sem ocppIdTag e sem ocppTagPk`);
      }

      // Verificar se já existe carregamento para este carregador/conector
      const carregamentoExistente = await CarregamentoModel.findActiveByCharger(
        chargerUuid,
        connectorId
      );

      let carregamentoId: number;

      if (carregamentoExistente) {
        // Já existe - atualizar morador_id se necessário
        carregamentoId = carregamentoExistente.id!;
        
        if (moradorId && !carregamentoExistente.morador_id) {
          // Atualizar com o morador identificado
          const { query } = await import('../config/database');
          await query('UPDATE carregamentos SET morador_id = $1 WHERE id = $2', [moradorId, carregamentoId]);
          console.log(`✅ [Polling] Carregamento ${carregamentoId} atualizado com morador`);
        }

        // 🆕 VERIFICAR SE NOTIFICAÇÃO DE INÍCIO FOI ENVIADA
        if (morador && moradorId && morador.notificacoes_ativas && morador.telefone) {
          if (!carregamentoExistente.notificacao_inicio_enviada) {
            try {
              const { notificationService } = await import('./NotificationService');
              const location = `${transacao.addressStreet}, ${transacao.addressCity}`;
              
              console.log(`📱 [Polling] Enviando notificação pendente para ${morador.nome}...`);
              await notificationService.notificarInicio(
                moradorId,
                chargerName,
                location
              );
              
              await CarregamentoModel.markNotificationSent(carregamentoId, 'inicio');
              console.log(`✅ [Polling] Notificação de início enviada para ${morador.nome}`);
            } catch (error) {
              console.error('❌ [Polling] Erro ao enviar notificação pendente:', error);
            }
          }
        }
      } else {
        // Criar novo registro de carregamento
        const carregamento = await CarregamentoModel.create({
          moradorId,
          chargerUuid,
          chargerName,
          connectorId,
          status: 'carregando',
        });

        carregamentoId = carregamento.id!;
        console.log(`✅ [Polling] Novo carregamento registrado: ID ${carregamentoId}`);
        console.log(`   📊 Duração (CVE): ${transacao.durationHumanReadable || 'N/A'}`);
        console.log(`   ⚡ Energia (CVE): ${transacao.energyHumanReadable || 'Em andamento'}`);

        // Enviar notificação (se morador tem notificações ativas)
        if (morador && morador.notificacoes_ativas && morador.telefone) {
          try {
            const { notificationService } = await import('./NotificationService');
            const location = `${transacao.addressStreet}, ${transacao.addressCity}`;
            
            await notificationService.notificarInicio(
              moradorId!,
              chargerName,
              location
            );
            
            await CarregamentoModel.markNotificationSent(carregamentoId, 'inicio');
            console.log(`📱 [Polling] Notificação de início enviada para ${morador.nome}`);
          } catch (error) {
            console.error('❌ [Polling] Erro ao enviar notificação:', error);
          }
        }
      }

      // Registrar transação como conhecida
      this.transacoesConhecidas.set(String(transactionId), carregamentoId);

    } catch (error: any) {
      console.error('❌ [Polling] Erro ao processar transação:', error.message);
    }
  }

  /**
   * 🆕 Processar eventos de notificação para carregamentos ativos
   * Detecta: Início de Ociosidade, Bateria Cheia, Interrupção
   */
  private async processarEventosCarregamento(): Promise<void> {
    try {
      const { query } = await import('../config/database');
      const { notificationService } = await import('./NotificationService');
      const { TemplateNotificacaoModel } = await import('../models/TemplateNotificacao');
      
      // Buscar todos os carregamentos ativos
      const carregamentosAtivos = await query(`
        SELECT c.*, m.nome, m.telefone, m.notificacoes_ativas, m.apartamento
        FROM carregamentos c
        LEFT JOIN moradores m ON m.id = c.morador_id
        WHERE c.fim IS NULL
        ORDER BY c.inicio ASC
      `);

      if (carregamentosAtivos.length === 0) {
        return;
      }

      console.log(`🔍 [Eventos] Processando ${carregamentosAtivos.length} carregamento(s) ativo(s) para eventos 2, 3, 4...`);

      // Buscar chargers para obter dados de potência
      const chargers = await cveService.getChargers();

      for (const carregamento of carregamentosAtivos) {
        try {
          // Encontrar o charger correspondente
          const charger = chargers.find(c => c.uuid === carregamento.charger_uuid);
          if (!charger) {
            console.log(`⚠️  [Eventos] Charger ${carregamento.charger_uuid} não encontrado na lista`);
            continue;
          }

          const connector = charger.connectors?.[0];
          if (!connector) {
            console.log(`⚠️  [Eventos] Connector não encontrado para ${carregamento.charger_name}`);
            continue;
          }

          // Obter potência atual (power_w)
          // NOTA: CVE API não retorna power no connector, apenas nos MeterValues durante transação
          // TODO: Implementar busca de power via MeterValues ou transação ativa
          const currentPower = 0; // Temporariamente desabilitado até implementar busca correta
          const status = connector.lastStatus?.status || 'Unknown';

          // Buscar templates ativos
          const templateOciosidade = await TemplateNotificacaoModel.findByTipo('inicio_ociosidade');
          const templateBateriaCheia = await TemplateNotificacaoModel.findByTipo('bateria_cheia');
          const templateInterrupcao = await TemplateNotificacaoModel.findByTipo('interrupcao');

          // Calcular tempo desde o início
          const minutosAtivo = Math.floor((Date.now() - new Date(carregamento.inicio).getTime()) / 60000);

          // ============================================
          // EVENTO 2: INÍCIO DE OCIOSIDADE
          // ============================================
          if (templateOciosidade && templateOciosidade.ativo) {
            const threshold = templateOciosidade.power_threshold_w || 10;
            const ultimoPower = carregamento.ultimo_power_w || currentPower;

            // Detecta: Power atual < threshold E power anterior >= threshold
            if (currentPower < threshold && ultimoPower >= threshold && !carregamento.notificacao_ociosidade_enviada) {
              console.log(`⚠️  [Evento 2] Ociosidade detectada! ${carregamento.charger_name} - Power: ${currentPower}W < ${threshold}W`);

              // Verificar se tem morador e notificações ativas
              if (carregamento.morador_id && carregamento.notificacoes_ativas && carregamento.telefone) {
                try {
                  // Calcular energia consumida até agora
                  const transacoes = await cveService.getActiveTransactions();
                  const transacao = transacoes.find(t => t.chargeBoxUuid === carregamento.charger_uuid);
                  const energia = transacao?.energyHumanReadable || '0.0 kWh';

                  // Enviar notificação IMEDIATAMENTE (tempo = 0)
                  await notificationService.notificarOciosidade(
                    carregamento.morador_id,
                    carregamento.charger_name,
                    energia
                  );

                  // Marcar timestamp e flag
                  await query(
                    `UPDATE carregamentos 
                     SET primeiro_ocioso_em = NOW(),
                         notificacao_ociosidade_enviada = true,
                         ultimo_power_w = $1
                     WHERE id = $2`,
                    [currentPower, carregamento.id]
                  );

                  console.log(`📱 [Evento 2] Notificação de ociosidade enviada para ${carregamento.nome}`);
                } catch (error: any) {
                  console.error(`❌ [Evento 2] Erro ao enviar notificação de ociosidade:`, error.message);
                }
              } else {
                // Sem morador ou sem notificações, apenas marcar timestamp
                await query(
                  `UPDATE carregamentos 
                   SET primeiro_ocioso_em = NOW(),
                       ultimo_power_w = $1
                   WHERE id = $2`,
                  [currentPower, carregamento.id]
                );
              }
            }
          }

          // ============================================
          // EVENTO 3: BATERIA CHEIA
          // ============================================
          if (templateBateriaCheia && templateBateriaCheia.ativo) {
            const threshold = templateBateriaCheia.power_threshold_w || 10;
            const tempoMinimo = templateBateriaCheia.tempo_minutos || 3;

            // Detecta: Está em ociosidade há X minutos E ainda não enviou notificação
            if (carregamento.primeiro_ocioso_em && !carregamento.notificacao_bateria_cheia_enviada) {
              const minutosOcioso = Math.floor((Date.now() - new Date(carregamento.primeiro_ocioso_em).getTime()) / 60000);

              if (minutosOcioso >= tempoMinimo && currentPower < threshold) {
                console.log(`🔋 [Evento 3] Bateria cheia detectada! ${carregamento.charger_name} - ${minutosOcioso} min ocioso`);

                // Verificar se tem morador e notificações ativas
                if (carregamento.morador_id && carregamento.notificacoes_ativas && carregamento.telefone) {
                  try {
                    // Calcular energia e duração totais
                    const transacoes = await cveService.getActiveTransactions();
                    const transacao = transacoes.find(t => t.chargeBoxUuid === carregamento.charger_uuid);
                    const energia = transacao?.energyHumanReadable || '0.0 kWh';

                    // Enviar notificação
                    await notificationService.notificarBateriaCheia(
                      carregamento.morador_id,
                      carregamento.charger_name,
                      energia,
                      minutosAtivo
                    );

                    // Marcar flag
                    await query(
                      `UPDATE carregamentos 
                       SET notificacao_bateria_cheia_enviada = true,
                           ultimo_power_w = $1
                       WHERE id = $2`,
                      [currentPower, carregamento.id]
                    );

                    console.log(`📱 [Evento 3] Notificação de bateria cheia enviada para ${carregamento.nome}`);
                  } catch (error: any) {
                    console.error(`❌ [Evento 3] Erro ao enviar notificação de bateria cheia:`, error.message);
                  }
                }
              }
            }
          }

          // ============================================
          // EVENTO 4: INTERRUPÇÃO
          // ============================================
          if (templateInterrupcao && templateInterrupcao.ativo) {
            // Detecta: Status mudou para Available E carregamento ainda ativo no banco
            if (status === 'Available' && !carregamento.interrupcao_detectada) {
              console.log(`⚠️  [Evento 4] Interrupção detectada! ${carregamento.charger_name} - Status: ${status}`);

              // Verificar se tem morador e notificações ativas
              if (carregamento.morador_id && carregamento.notificacoes_ativas && carregamento.telefone) {
                try {
                  // Calcular energia parcial e duração
                  const transacoes = await cveService.getActiveTransactions();
                  const transacao = transacoes.find(t => t.chargeBoxUuid === carregamento.charger_uuid);
                  const energia = transacao?.energyHumanReadable || '0.0 kWh';

                  // Enviar notificação IMEDIATAMENTE
                  await notificationService.notificarInterrupcao(
                    carregamento.morador_id,
                    carregamento.charger_name,
                    energia,
                    minutosAtivo
                  );

                  console.log(`📱 [Evento 4] Notificação de interrupção enviada para ${carregamento.nome}`);
                } catch (error: any) {
                  console.error(`❌ [Evento 4] Erro ao enviar notificação de interrupção:`, error.message);
                }
              }

              // Marcar como interrompido e finalizar carregamento
              await query(
                `UPDATE carregamentos 
                 SET interrupcao_detectada = true,
                     tipo_finalizacao = 'interrupcao',
                     fim = NOW(),
                     ultimo_power_w = $1
                 WHERE id = $2`,
                [currentPower, carregamento.id]
              );

              console.log(`✅ [Evento 4] Carregamento ${carregamento.id} finalizado por interrupção`);
            }
          }

          // ============================================
          // ATUALIZAR ultimo_power_w (sempre)
          // ============================================
          if (currentPower !== carregamento.ultimo_power_w) {
            await query(
              `UPDATE carregamentos SET ultimo_power_w = $1 WHERE id = $2`,
              [currentPower, carregamento.id]
            );
          }

        } catch (error: any) {
          console.error(`❌ [Eventos] Erro ao processar carregamento ${carregamento.id}:`, error.message);
        }
      }

    } catch (error: any) {
      console.error('❌ [Eventos] Erro ao processar eventos:', error.message);
    }
  }

  /**
   * Limpar transações que foram finalizadas
   */
  private async limparTransacoesFinalizadas(): Promise<void> {
    try {
      // Buscar todas as transações conhecidas
      if (this.transacoesConhecidas.size === 0) {
        return;
      }

      // Buscar transações ativas do CVE
      const transacoesAtivas = await cveService.getActiveTransactions();
      const idsAtivos = new Set(
        transacoesAtivas.map(t => String(t.id))
      );

      // Encontrar transações que foram finalizadas
      const transacoesFinalizadas: string[] = [];
      
      for (const [transactionId, carregamentoId] of this.transacoesConhecidas.entries()) {
        if (!idsAtivos.has(transactionId)) {
          transacoesFinalizadas.push(transactionId);
          
          // Atualizar status para finalizado
          try {
            await CarregamentoModel.updateStatus(carregamentoId, 'finalizado');
            console.log(`🏁 [Polling] Carregamento ${carregamentoId} finalizado`);
            
            // Buscar dados do carregamento para notificação
            const carregamento = await CarregamentoModel.findById(carregamentoId);
            if (carregamento && carregamento.morador_id) {
              // Enviar notificação de fim (opcional)
              // TODO: Buscar dados de energia consumida da API CVE
            }
          } catch (error) {
            console.error(`❌ [Polling] Erro ao finalizar carregamento ${carregamentoId}:`, error);
          }
        }
      }

      // Remover transações finalizadas do mapa
      transacoesFinalizadas.forEach(id => {
        this.transacoesConhecidas.delete(id);
      });

      if (transacoesFinalizadas.length > 0) {
        console.log(`🧹 [Polling] ${transacoesFinalizadas.length} transação(ões) finalizada(s) removida(s)`);
      }

    } catch (error: any) {
      console.error('❌ [Polling] Erro ao limpar transações finalizadas:', error.message);
    }
  }

  /**
   * Obter estatísticas do polling
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      pollingInterval: this.pollingInterval,
      transacoesConhecidas: this.transacoesConhecidas.size,
    };
  }
}

// Singleton
export const pollingService = new PollingService();


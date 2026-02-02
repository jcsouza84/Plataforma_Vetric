# 🔔 IMPLEMENTAÇÃO DOS EVENTOS 2, 3 E 4 - POLLING SERVICE

**Data:** 02/02/2026 02:05 AM  
**Branch:** `feature/4-eventos-notificacao`  
**Status:** 🚧 **EM IMPLEMENTAÇÃO**

---

## 📋 RESUMO

Implementação da lógica de detecção automática dos eventos:
- **Evento 2:** Início de Ociosidade
- **Evento 3:** Bateria Cheia
- **Evento 4:** Interrupção

---

## 🎯 OBJETIVO

Adicionar ao `PollingService.ts` um novo método `processarEventosCarregamento()` que:
1. Busca todos os carregamentos ativos no banco
2. Obtém dados de potência dos chargers via API CVE
3. Detecta os 3 eventos baseado em regras específicas
4. Envia notificações quando aplicável
5. Atualiza campos de rastreamento no banco

---

## 📝 MODIFICAÇÕES NECESSÁRIAS

### 1. Adicionar chamada no método `poll()` (linha ~91)

**Localização:** Após `await this.verificarStatusCarregadores();`

```typescript
// MÉTODO 2: SEMPRE verificar status dos carregadores diretamente
console.log(`🔍 [Polling] Verificando status de todos os carregadores...`);
await this.verificarStatusCarregadores();

// 🆕 MÉTODO 3: Processar eventos de notificação
await this.processarEventosCarregamento();

// Limpar transações conhecidas antigas
await this.limparTransacoesFinalizadas();
```

---

### 2. Adicionar novo método `processarEventosCarregamento()` (antes do método `limparTransacoesFinalizadas`)

**Localização:** Linha ~336 (antes de `private async limparTransacoesFinalizadas()`)

```typescript
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

    console.log(`🔍 [Eventos] Processando ${carregamentosAtivos.length} carregamento(s) ativo(s)...`);

    // Buscar chargers para obter dados de potência
    const chargers = await cveService.getChargers();

    for (const carregamento of carregamentosAtivos) {
      try {
        // Encontrar o charger correspondente
        const charger = chargers.find(c => c.uuid === carregamento.charger_uuid);
        if (!charger) continue;

        const connector = charger.connectors?.[0];
        if (!connector) continue;

        // Obter potência atual (power_w)
        const currentPower = connector.power || connector.lastStatus?.power || 0;
        const status = connector.lastStatus?.status || 'Unknown';

        // Buscar templates ativos
        const templateOciosidade = await TemplateNotificacaoModel.findByTipo('inicio_ociosidade');
        const templateBateriaCheia = await TemplateNotificacaoModel.findByTipo('bateria_cheia');
        const templateInterrupcao = await TemplateNotificacaoModel.findByTipo('interrupcao');

        // Calcular tempo desde o início
        const inicio = new Date(carregamento.inicio);
        const agora = new Date();
        const minutosDesdeInicio = Math.floor((agora.getTime() - inicio.getTime()) / 60000);

        // ========================================
        // EVENTO 2: INÍCIO DE OCIOSIDADE
        // ========================================
        if (templateOciosidade && templateOciosidade.ativo) {
          const threshold = templateOciosidade.power_threshold_w || 10;
          
          // Detectar se entrou em ociosidade (power < threshold)
          if (currentPower < threshold && currentPower >= 0) {
            
            // Se acabou de entrar em ociosidade
            if (carregamento.ultimo_power_w === null || carregamento.ultimo_power_w >= threshold) {
              console.log(`⚠️  [Evento 2] Início de Ociosidade detectado no carregamento ${carregamento.id}`);
              console.log(`   💡 Potência atual: ${currentPower}W (threshold: ${threshold}W)`);
              
              // Atualizar campos de rastreamento
              await query(`
                UPDATE carregamentos 
                SET primeiro_ocioso_em = NOW(),
                    ultimo_power_w = $1,
                    contador_minutos_ocioso = 1
                WHERE id = $2
              `, [currentPower, carregamento.id]);

              // Enviar notificação imediatamente (tempo_minutos = 0 significa imediato)
              if (carregamento.notificacoes_ativas && carregamento.telefone && !carregamento.notificacao_ociosidade_enviada) {
                try {
                  await notificationService.enviarNotificacao({
                    moradorId: carregamento.morador_id,
                    tipo: 'inicio_ociosidade',
                    chargerName: carregamento.charger_name,
                    location: 'Gran Marine - Estacionamento',
                    apartamento: carregamento.apartamento,
                    energiaKwh: carregamento.energia_kwh || 0,
                  });

                  await query(`
                    UPDATE carregamentos 
                    SET notificacao_ociosidade_enviada = true
                    WHERE id = $1
                  `, [carregamento.id]);

                  console.log(`📱 [Evento 2] Notificação de ociosidade enviada para ${carregamento.nome}`);
                } catch (error: any) {
                  console.error(`❌ [Evento 2] Erro ao enviar notificação:`, error.message);
                }
              }
            }
          } 
          // Se voltou a carregar (power >= threshold)
          else if (currentPower >= threshold) {
            // Resetar contadores se estava ocioso
            if (carregamento.primeiro_ocioso_em) {
              console.log(`🔄 [Evento 2] Carregamento ${carregamento.id} voltou a carregar (${currentPower}W)`);
              await query(`
                UPDATE carregamentos 
                SET primeiro_ocioso_em = NULL,
                    contador_minutos_ocioso = 0
                WHERE id = $1
              `, [carregamento.id]);
            }
          }

          // Atualizar último power
          await query(`
            UPDATE carregamentos 
            SET ultimo_power_w = $1
            WHERE id = $2
          `, [currentPower, carregamento.id]);
        }

        // ========================================
        // EVENTO 3: BATERIA CHEIA
        // ========================================
        if (templateBateriaCheia && templateBateriaCheia.ativo) {
          const threshold = templateBateriaCheia.power_threshold_w || 10;
          const tempoMinutos = templateBateriaCheia.tempo_minutos || 3;

          // Se está abaixo do threshold
          if (currentPower < threshold && carregamento.primeiro_ocioso_em) {
            const primeiroOcioso = new Date(carregamento.primeiro_ocioso_em);
            const minutosOcioso = Math.floor((agora.getTime() - primeiroOcioso.getTime()) / 60000);

            // Se passou o tempo necessário
            if (minutosOcioso >= tempoMinutos && !carregamento.notificacao_bateria_cheia_enviada) {
              console.log(`🔋 [Evento 3] Bateria Cheia detectada no carregamento ${carregamento.id}`);
              console.log(`   ⏱️  Ocioso há ${minutosOcioso} minutos (threshold: ${tempoMinutos} min)`);
              console.log(`   💡 Potência: ${currentPower}W (threshold: ${threshold}W)`);

              // Enviar notificação
              if (carregamento.notificacoes_ativas && carregamento.telefone) {
                try {
                  const duracaoMinutos = Math.floor((agora.getTime() - inicio.getTime()) / 60000);
                  const duracaoFormatada = `${Math.floor(duracaoMinutos / 60)}h ${duracaoMinutos % 60}min`;

                  await notificationService.enviarNotificacao({
                    moradorId: carregamento.morador_id,
                    tipo: 'bateria_cheia',
                    chargerName: carregamento.charger_name,
                    location: 'Gran Marine - Estacionamento',
                    apartamento: carregamento.apartamento,
                    energiaKwh: carregamento.energia_kwh || 0,
                    duracao: duracaoFormatada,
                  });

                  await query(`
                    UPDATE carregamentos 
                    SET notificacao_bateria_cheia_enviada = true
                    WHERE id = $1
                  `, [carregamento.id]);

                  console.log(`📱 [Evento 3] Notificação de bateria cheia enviada para ${carregamento.nome}`);
                } catch (error: any) {
                  console.error(`❌ [Evento 3] Erro ao enviar notificação:`, error.message);
                }
              }
            }
          }
        }

        // ========================================
        // EVENTO 4: INTERRUPÇÃO
        // ========================================
        if (templateInterrupcao && templateInterrupcao.ativo) {
          // Detectar interrupção: status mudou de Charging para Available abruptamente
          if (status === 'Available' && carregamento.status !== 'finalizado') {
            // Verificar se não foi uma finalização normal (bateria cheia ou ocioso)
            const foiFinalizacaoNormal = carregamento.notificacao_bateria_cheia_enviada || 
                                       (carregamento.primeiro_ocioso_em && minutosDesdeInicio > 30);

            if (!foiFinalizacaoNormal && !carregamento.interrupcao_detectada) {
              console.log(`⚠️  [Evento 4] Interrupção detectada no carregamento ${carregamento.id}`);
              console.log(`   📊 Status: ${status}`);
              console.log(`   ⏱️  Duração até interrupção: ${minutosDesdeInicio} min`);

              // Marcar como interrompido
              await query(`
                UPDATE carregamentos 
                SET interrupcao_detectada = true,
                    tipo_finalizacao = 'interrupcao'
                WHERE id = $1
              `, [carregamento.id]);

              // Enviar notificação
              if (carregamento.notificacoes_ativas && carregamento.telefone) {
                try {
                  const duracaoFormatada = `${Math.floor(minutosDesdeInicio / 60)}h ${minutosDesdeInicio % 60}min`;

                  await notificationService.enviarNotificacao({
                    moradorId: carregamento.morador_id,
                    tipo: 'interrupcao',
                    chargerName: carregamento.charger_name,
                    location: 'Gran Marine - Estacionamento',
                    apartamento: carregamento.apartamento,
                    energiaKwh: carregamento.energia_kwh || 0,
                    duracao: duracaoFormatada,
                  });

                  console.log(`📱 [Evento 4] Notificação de interrupção enviada para ${carregamento.nome}`);
                } catch (error: any) {
                  console.error(`❌ [Evento 4] Erro ao enviar notificação:`, error.message);
                }
              }

              // Finalizar carregamento
              await CarregamentoModel.updateStatus(carregamento.id, 'finalizado');
              console.log(`🏁 [Evento 4] Carregamento ${carregamento.id} finalizado por interrupção`);
            }
          }
        }

      } catch (error: any) {
        console.error(`❌ [Eventos] Erro ao processar carregamento ${carregamento.id}:`, error.message);
      }
    }

  } catch (error: any) {
    console.error('❌ [Eventos] Erro ao processar eventos de carregamento:', error.message);
  }
}
```

---

## 🔍 LÓGICA DOS EVENTOS

### **Evento 2: Início de Ociosidade**

**Condição:** `currentPower < threshold` (padrão: 10W)

**Ações:**
1. Detecta quando potência cai abaixo do threshold
2. Marca `primeiro_ocioso_em = NOW()`
3. Atualiza `ultimo_power_w`
4. Envia notificação **imediatamente** (tempo_minutos = 0)
5. Se voltar a carregar, reseta contadores

---

### **Evento 3: Bateria Cheia**

**Condição:** `currentPower < threshold` **E** `minutosOcioso >= tempo_minutos` (padrão: 3 min)

**Ações:**
1. Verifica se está ocioso há X minutos
2. Calcula duração total do carregamento
3. Envia notificação com duração formatada
4. Marca `notificacao_bateria_cheia_enviada = true`

---

### **Evento 4: Interrupção**

**Condição:** `status === 'Available'` **E** `!foiFinalizacaoNormal`

**Ações:**
1. Detecta mudança abrupta para Available
2. Verifica se não foi finalização normal
3. Marca `interrupcao_detectada = true`
4. Marca `tipo_finalizacao = 'interrupcao'`
5. Envia notificação
6. Finaliza carregamento

---

## 📊 CAMPOS UTILIZADOS

### **Leitura:**
- `carregamento.id`
- `carregamento.morador_id`
- `carregamento.charger_uuid`
- `carregamento.charger_name`
- `carregamento.inicio`
- `carregamento.status`
- `carregamento.ultimo_power_w`
- `carregamento.primeiro_ocioso_em`
- `carregamento.notificacao_ociosidade_enviada`
- `carregamento.notificacao_bateria_cheia_enviada`
- `carregamento.interrupcao_detectada`
- `morador.nome`
- `morador.telefone`
- `morador.notificacoes_ativas`
- `morador.apartamento`

### **Escrita:**
- `ultimo_power_w`
- `primeiro_ocioso_em`
- `contador_minutos_ocioso`
- `notificacao_ociosidade_enviada`
- `notificacao_bateria_cheia_enviada`
- `interrupcao_detectada`
- `tipo_finalizacao`

---

## ✅ PRÓXIMOS PASSOS

1. ⏳ Aplicar modificações manualmente no arquivo `PollingService.ts`
2. ⏳ Testar compilação TypeScript
3. ⏳ Reiniciar backend local
4. ⏳ Testar com dados reais
5. ⏳ Fazer commit
6. ⏳ Push para GitHub
7. ⏳ Deploy para produção

---

## 📝 NOTAS

- O método é chamado a cada 10 segundos (intervalo do polling)
- Processa apenas carregamentos ativos (`fim IS NULL`)
- Usa dados de potência em tempo real da API CVE
- Respeita configurações de templates (ativo/desligado)
- Envia notificações apenas se morador tem `notificacoes_ativas = true`
- Evita enviar notificações duplicadas com flags booleanas

---

**Documento criado em:** 02/02/2026 02:05 AM  
**Por:** Sistema de Implementação Automatizado

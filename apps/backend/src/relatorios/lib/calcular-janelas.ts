/**
 * VETRIC Reports V2 - Módulo de Cálculo de Tarifação
 * Copiado e adaptado para o sistema Síndico
 */

export interface ConfiguracaoTarifaria {
  tarifaPonta: number;
  tarifaForaPonta: number;
  pontaInicioHora: number;
  pontaInicioMinuto: number;
  pontaFimHora: number;
  pontaFimMinuto: number;
  pontaSegunda: boolean;
  pontaTerca: boolean;
  pontaQuarta: boolean;
  pontaQuinta: boolean;
  pontaSexta: boolean;
  pontaSabado: boolean;
  pontaDomingo: boolean;
}

export interface JanelaTarifaria {
  janela: 'Ponta' | 'Fora Ponta';
  duracaoSegundos: number;
  energiaKWh: number;
  tarifa: number;
  valor: number;
}

/**
 * Calcula a distribuição de energia entre horários de ponta e fora de ponta
 * baseado na configuração do empreendimento
 * 
 * ✅ Suporta divisão em até 3 períodos:
 *    1. Fora Ponta (antes da ponta)
 *    2. Ponta
 *    3. Fora Ponta (depois da ponta)
 */
export function calcularJanelas(
  intervaloStr: string,
  energiaTotalKWh: number,
  config: ConfiguracaoTarifaria
): JanelaTarifaria[] {
  if (!intervaloStr || !energiaTotalKWh) return [];

  const [inicioStr, fimStr] = intervaloStr.split(' - ');
  
  const parseDateTime = (str: string): Date => {
    const [data, hora] = str.split(' ');
    const [dia, mes, ano] = data.split('/').map(Number);
    const [h, m, s] = hora.split(':').map(Number);
    return new Date(ano, mes - 1, dia, h, m, s || 0);
  };

  const inicio = parseDateTime(inicioStr);
  const fim = parseDateTime(fimStr);

  // Duração total em segundos
  const totalSegundos = (fim.getTime() - inicio.getTime()) / 1000;

  // Verificar se o dia da semana tem horário de ponta
  const diaSemana = inicio.getDay(); // 0 = Domingo, 1 = Segunda, etc
  
  const diasPonta: { [key: number]: boolean } = {
    0: config.pontaDomingo,
    1: config.pontaSegunda,
    2: config.pontaTerca,
    3: config.pontaQuarta,
    4: config.pontaQuinta,
    5: config.pontaSexta,
    6: config.pontaSabado,
  };

  const temPontaNesseDia = diasPonta[diaSemana];

  // Se não tem ponta nesse dia, tudo é fora ponta
  if (!temPontaNesseDia) {
    return [
      {
        janela: 'Fora Ponta',
        duracaoSegundos: totalSegundos,
        energiaKWh: energiaTotalKWh,
        tarifa: config.tarifaForaPonta,
        valor: energiaTotalKWh * config.tarifaForaPonta,
      },
    ];
  }

  // 🎯 CRIAR TIMESTAMPS DA PONTA NO DIA DA TRANSAÇÃO
  const pontaInicioDate = new Date(inicio);
  pontaInicioDate.setHours(config.pontaInicioHora, config.pontaInicioMinuto, 0, 0);
  
  const pontaFimDate = new Date(inicio);
  pontaFimDate.setHours(config.pontaFimHora, config.pontaFimMinuto, 59, 999);

  const inicioTs = inicio.getTime();
  const fimTs = fim.getTime();
  const pontaInicioTs = pontaInicioDate.getTime();
  const pontaFimTs = pontaFimDate.getTime();

  // 🎯 DETECTAR OS 3 PERÍODOS POSSÍVEIS
  const periodos: JanelaTarifaria[] = [];

  // PERÍODO 1: Fora Ponta ANTES da ponta (se houver)
  if (inicioTs < pontaInicioTs && fimTs > inicioTs) {
    const fimPeriodo1 = Math.min(fimTs, pontaInicioTs);
    const duracaoSegundos = (fimPeriodo1 - inicioTs) / 1000;
    
    if (duracaoSegundos > 0) {
      const energiaKWh = energiaTotalKWh * (duracaoSegundos / totalSegundos);
      periodos.push({
        janela: 'Fora Ponta',
        duracaoSegundos,
        energiaKWh,
        tarifa: config.tarifaForaPonta,
        valor: energiaKWh * config.tarifaForaPonta,
      });
    }
  }

  // PERÍODO 2: Ponta (se houver overlap)
  const overlapStart = Math.max(inicioTs, pontaInicioTs);
  const overlapEnd = Math.min(fimTs, pontaFimTs);

  if (overlapStart < overlapEnd) {
    const duracaoSegundos = (overlapEnd - overlapStart) / 1000;
    const energiaKWh = energiaTotalKWh * (duracaoSegundos / totalSegundos);

    periodos.push({
      janela: 'Ponta',
      duracaoSegundos,
      energiaKWh,
      tarifa: config.tarifaPonta,
      valor: energiaKWh * config.tarifaPonta,
    });
  }

  // PERÍODO 3: Fora Ponta DEPOIS da ponta (se houver)
  if (fimTs > pontaFimTs && inicioTs < fimTs) {
    const inicioPeriodo3 = Math.max(inicioTs, pontaFimTs);
    const duracaoSegundos = (fimTs - inicioPeriodo3) / 1000;
    
    if (duracaoSegundos > 0) {
      const energiaKWh = energiaTotalKWh * (duracaoSegundos / totalSegundos);
      periodos.push({
        janela: 'Fora Ponta',
        duracaoSegundos,
        energiaKWh,
        tarifa: config.tarifaForaPonta,
        valor: energiaKWh * config.tarifaForaPonta,
      });
    }
  }

  // Se não detectou nenhum período (edge case), retornar tudo como fora ponta
  if (periodos.length === 0) {
    return [
    {
      janela: 'Fora Ponta',
        duracaoSegundos: totalSegundos,
        energiaKWh: energiaTotalKWh,
      tarifa: config.tarifaForaPonta,
        valor: energiaTotalKWh * config.tarifaForaPonta,
    },
    ];
  }

  return periodos;
}

/**
 * Valida se a energia está dentro dos limites aceitáveis
 */
export function energiaValida(valor: number, limite: number): boolean {
  return valor > 0 && valor <= limite;
}

/**
 * Converte duração em segundos para formato HH:MM:SS
 */
export function segundosParaTempo(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Converte tempo HH:MM:SS para segundos
 */
export function tempoParaSegundos(tempo: string): number {
  const [h, m, s] = tempo.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

/**
 * Formata duração em horas para formato legível (Xh Ymin)
 */
export function formatarDuracaoLegivel(horas: number): string {
  const h = Math.floor(horas);
  const minutos = Math.round((horas - h) * 60);
  
  if (h > 0 && minutos > 0) {
    return `${h}h${minutos}min`;
  } else if (h > 0) {
    return `${h}h`;
  } else {
    return `${minutos}min`;
  }
}

/**
 * Extrai horário de uma data/hora "DD/MM/YYYY HH:mm"
 */
export function extrairHorario(dataHora: string): string {
  const partes = dataHora.split(' ');
  if (partes.length >= 2) {
    return partes[1]; // "HH:mm"
  }
  return dataHora;
}

/**
 * Calcula horário específico de início/fim de cada janela
 * ✅ Suporta 3 períodos: Fora Ponta (antes) → Ponta → Fora Ponta (depois)
 * 
 * @param intervaloStr - Intervalo completo da carga: "DD/MM/YYYY HH:mm:ss - DD/MM/YYYY HH:mm:ss"
 * @param indexJanela - Índice da janela (0, 1, 2) conforme retornado por calcularJanelas
 * @param todasJanelas - Array completo de janelas calculadas
 * @param config - Configuração tarifária
 */
export function calcularHorariosJanela(
  intervaloStr: string,
  indexJanela: number,
  todasJanelas: JanelaTarifaria[],
  config: ConfiguracaoTarifaria
): { inicio: string; fim: string } {
  const [inicioStr, fimStr] = intervaloStr.split(' - ');
  
  const parseDateTime = (str: string): Date => {
    const [data, hora] = str.split(' ');
    const [dia, mes, ano] = data.split('/').map(Number);
    const [h, m, s] = hora.split(':').map(Number);
    return new Date(ano, mes - 1, dia, h, m, s || 0);
  };

  const inicio = parseDateTime(inicioStr);
  const fim = parseDateTime(fimStr);
  
  const inicioTs = inicio.getTime();
  const fimTs = fim.getTime();
  
  // Criar timestamps da ponta
  const pontaInicioDate = new Date(inicio);
  pontaInicioDate.setHours(config.pontaInicioHora, config.pontaInicioMinuto, 0, 0);
  
  const pontaFimDate = new Date(inicio);
  pontaFimDate.setHours(config.pontaFimHora, config.pontaFimMinuto, 59, 999);
  
  const pontaInicioTs = pontaInicioDate.getTime();
  const pontaFimTs = pontaFimDate.getTime();

  const janelaAtual = todasJanelas[indexJanela];
  
  // Helper para formatar timestamp em HH:MM
  const formatarHorario = (ts: number): string => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // 🎯 DETERMINAR INÍCIO E FIM DA JANELA ATUAL
  let inicioJanelaTs: number;
  let fimJanelaTs: number;

  if (janelaAtual.janela === 'Ponta') {
    // PERÍODO DE PONTA
    inicioJanelaTs = Math.max(inicioTs, pontaInicioTs);
    fimJanelaTs = Math.min(fimTs, pontaFimTs);
  } else {
    // PERÍODO FORA PONTA
    // Verificar se é o primeiro "Fora Ponta" (antes da ponta) ou segundo (depois da ponta)
    const quantidadeForaPontaAntes = todasJanelas
      .slice(0, indexJanela)
      .filter(j => j.janela === 'Fora Ponta').length;

    if (quantidadeForaPontaAntes === 0 && todasJanelas.some(j => j.janela === 'Ponta')) {
      // É o PRIMEIRO "Fora Ponta" (antes da ponta)
      inicioJanelaTs = inicioTs;
      fimJanelaTs = Math.min(fimTs, pontaInicioTs);
    } else {
      // É o SEGUNDO "Fora Ponta" (depois da ponta) OU não tem ponta
      if (todasJanelas.some(j => j.janela === 'Ponta')) {
        inicioJanelaTs = Math.max(inicioTs, pontaFimTs);
        fimJanelaTs = fimTs;
      } else {
        // Não tem ponta, é tudo fora ponta
        inicioJanelaTs = inicioTs;
        fimJanelaTs = fimTs;
      }
    }
  }
    
    return {
    inicio: formatarHorario(inicioJanelaTs),
    fim: formatarHorario(fimJanelaTs),
    };
}


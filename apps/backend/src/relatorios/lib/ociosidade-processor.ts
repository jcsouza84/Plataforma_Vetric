/**
 * VETRIC Reports V2 - Processador de Ociosidade
 * Copiado e adaptado para o sistema Síndico
 */

/**
 * Converte string de tempo "HH:mm:ss" para minutos
 */
export function tempoParaMinutos(tempoStr: string): number {
  if (!tempoStr) return 0;
  
  const partes = tempoStr.split(':');
  if (partes.length !== 3) return 0;
  
  const [horas, minutos, segundos] = partes.map(Number);
  return (horas * 60) + minutos + (segundos / 60);
}

/**
 * Formata minutos para string legível
 * Ex: 85 minutos → "1h25min"
 */
export function formatarMinutos(minutos: number): string {
  if (minutos === 0) return '0min';
  
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  
  if (horas > 0 && mins > 0) {
    return `${horas}h${mins}min`;
  } else if (horas > 0) {
    return `${horas}h`;
  } else {
    return `${mins}min`;
  }
}

/**
 * Processa dados de ociosidade de um conjunto de cargas
 * Retorna total de ocorrências e tempo total
 */
export interface DadosOciosidade {
  ocorrencias: number;
  tempoTotalMinutos: number;
  tempoFormatado: string;
}

export function processarOciosidade(
  cargas: Array<{ cargaOriginalId: string; ociosidade: string }>,
  limiteMinutos: number
): DadosOciosidade {
  // 🎯 AGRUPAR POR CARGA ORIGINAL para evitar duplicação
  // Quando uma carga é dividida entre ponta/fora ponta, ela gera múltiplas linhas (.1, .2)
  // mas a ociosidade é da CARGA ORIGINAL, não das subdivisões
  const cargasUnicasMap = new Map<string, { cargaOriginalId: string; ociosidade: string }>();
  
  cargas.forEach((carga) => {
    const idOriginal = carga.cargaOriginalId;
    
    // Pegar apenas a PRIMEIRA ocorrência de cada carga original
    // Isso evita contar 2x a mesma ociosidade quando temos .1 e .2
    if (!cargasUnicasMap.has(idOriginal)) {
      cargasUnicasMap.set(idOriginal, carga);
    }
  });

  // 🎯 PROCESSAR APENAS AS CARGAS ÚNICAS
  let ocorrencias = 0;
  let tempoTotalMinutos = 0;
  
  cargasUnicasMap.forEach((carga) => {
    const minutos = tempoParaMinutos(carga.ociosidade);
    
    // Somar tempo total (uma vez por carga original)
    tempoTotalMinutos += minutos;
    
    // Conta como ocorrência se ultrapassar o limite (uma vez por carga original)
    if (minutos > limiteMinutos) {
      ocorrencias++;
    }
  });
  
  return {
    ocorrencias,
    tempoTotalMinutos,
    tempoFormatado: formatarMinutos(tempoTotalMinutos),
  };
}

/**
 * Verifica se uma ociosidade é considerada elevada
 */
export function isOciosidadeElevada(minutos: number, limite: number): boolean {
  return minutos > limite;
}

/**
 * Calcula percentual de ociosidade em relação ao tempo total
 */
export function calcularPercentualOciosidade(
  tempoOciosoMinutos: number,
  tempoTotalMinutos: number
): number {
  if (tempoTotalMinutos === 0) return 0;
  return Math.round((tempoOciosoMinutos / tempoTotalMinutos) * 100);
}


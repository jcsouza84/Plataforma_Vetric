/**
 * VETRIC Reports V2 - Processador de Planilhas XLSX
 * Versão simplificada para sistema Síndico (suporte CVE-PRO)
 */

import * as XLSX from 'xlsx';

export interface CargaNormalizada {
  id: string;
  estacao: string;
  tag: string;
  usuario: string;
  intervalo: string;
  energia: number;
  ociosidade: string;
}

/**
 * Processa planilha XLSX do CVE-PRO e retorna dados normalizados
 */
export async function processarXLSX(fileBuffer: Buffer): Promise<CargaNormalizada[]> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Converter para JSON
  const dadosBrutos: any[] = XLSX.utils.sheet_to_json(worksheet);
  
  const dadosNormalizados: CargaNormalizada[] = [];
  
  dadosBrutos.forEach((linha) => {
    try {
      // Extrair dados (CVE-PRO format)
      const id = String(linha['Recarga(ID)'] || '').trim();
      const estacao = String(linha['Estação'] || '').trim();
      const tag = String(linha['Usuário(Tag)'] || '').trim().toUpperCase();
      const usuario = String(linha['Usuário(Nome)'] || '').trim();
      const intervalo = String(linha['Início - Fim'] || '').trim();
      const energiaStr = String(linha['Energia(kWh)'] || '0');
      const ociosidade = String(linha['Tempo de ociosidade'] || '00:00:00');
      
      // Parse energia
      const energia = parseFloat(energiaStr.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      if (id && !isNaN(energia)) {
        dadosNormalizados.push({
          id,
          estacao,
          tag,
          usuario,
          intervalo,
          energia,
          ociosidade,
        });
      }
    } catch (error) {
      console.error('Erro ao processar linha:', error);
    }
  });
  
  return dadosNormalizados;
}

/**
 * Detecta o mês/ano da planilha automaticamente
 */
export function detectarMesAno(dados: CargaNormalizada[]): string {
  if (dados.length === 0) return '';
  
  try {
    const primeiroIntervalo = dados[0].intervalo;
    const [inicioStr] = primeiroIntervalo.split(' - ');
    const [data] = inicioStr.split(' ');
    const [dia, mes, ano] = data.split('/');
    
    return `${mes.padStart(2, '0')}/${ano}`;
  } catch (error) {
    return '';
  }
}

/**
 * Valida formato de data "DD/MM/YYYY HH:mm - DD/MM/YYYY HH:mm"
 */
export function validarFormatoData(intervalo: string): boolean {
  const regex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} - \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
  return regex.test(intervalo);
}


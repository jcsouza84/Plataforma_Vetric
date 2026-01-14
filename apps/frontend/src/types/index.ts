export interface Sindico {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empreendimento: Empreendimento;
}

export interface Empreendimento {
  id: string;
  nome: string;
  logoUrl?: string;
}

export interface DashboardData {
  mesAtual: {
    mesAno: string;
    consumoTotal: number;
    gastoTotal: number;
    recargas: number;
    ociosidadeTotal: string;
    consumoPonta: number;
    gastoPonta: number;
    consumoForaPonta: number;
    gastoForaPonta: number;
    comparacao: {
      consumo: string;
      gasto: string;
      recargas: number;
    };
  };
  graficoCargasPorHora: Array<{
    hora: string;
    recargas: number;
    consumo?: number;
  }>;
  ultimosRelatorios: Relatorio[];
}

export interface Relatorio {
  id: string;
  mesAno: string;
  recargas: number;
  consumoTotal: number;
  gastoTotal: number;
  ociosidadeTotal?: string;
  consumoPonta?: number;
  gastoPonta?: number;
  consumoForaPonta?: number;
  gastoForaPonta?: number;
  pdfUrl: string;
  createdAt: string;
}

export interface ResumoUsuario {
  usuario: string;
  unidade: string;
  torre?: string;
  recargas: number;
  consumo: number;
  ociosidade: string;
  valor: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  unidade: string;
  torre?: string;
  tag?: string;
  telefone?: string;
}

export interface ConsumoRanking {
  posicao: number;
  unidade: string;
  torre?: string;
  usuario: string;
  recargas: number;
  consumo: number;
  valor: number;
}

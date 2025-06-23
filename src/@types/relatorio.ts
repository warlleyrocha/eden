// types/relatorio.types.ts
export interface Movimento {
  id: string;
  criadoEm: string;
  tipo: 'ENTRADA' | 'SAIDA';
  metodoPagamento: string;
  valor: number;
  descricao?: string;
  parcelas?: number;
  juros?: number;
}

export interface RelatorioFinanceiro {
  totalPorMetodoEntrada: Record<string, number>;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

export interface PDFProps {
  relatorio: RelatorioFinanceiro;
  periodo: string;
  entradasPeriodo: Movimento[];
  saidasPeriodo: Movimento[];
  dataGeracao: string;
  formatarMoeda: (valor: number) => string;
  formatarDataSimples: (data: string) => string;
  formatarMetodoPagamentoCompleto: (
    metodo: string,
    parcelas?: number,
    juros?: number
  ) => string;
  METODOS_PAGAMENTO_LABELS: Record<string, string>;
}

export interface FiltroRelatorio {
  dataInicial: string;
  dataFinal: string;
}

export interface GerarPDFParams {
  dataInicial: string;
  dataFinal: string;
  fetchRelatorioFinanceiroComPeriodo: (
    filtro: FiltroRelatorio
  ) => Promise<RelatorioFinanceiro>;
  movimentacoes: Movimento[];
  formatarDataSimples: (data: string) => string;
  formatarMoeda: (valor: number) => string;
  formatarMetodoPagamentoCompleto: (
    metodo: string,
    parcelas?: number,
    juros?: number
  ) => string;
  METODOS_PAGAMENTO_LABELS: Record<string, string>;
}

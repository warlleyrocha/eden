export const MetodoPagamento = {
  PIX: 'PIX',
  DINHEIRO: 'DINHEIRO',
  DEBITO: 'DEBITO',
  CREDITO_AVISTA: 'CREDITO_AVISTA',
  CREDITO_PARCELADO: 'CREDITO_PARCELADO',
} as const;

export type MetodoPagamento =
  (typeof MetodoPagamento)[keyof typeof MetodoPagamento];

export type TipoMovimento = 'ENTRADA' | 'SAIDA';

export interface SaidaFinanceiraPayload {
  metodoPagamento: MetodoPagamento;
  valor: number;
  descricao: string;
  parcelas?: number;
  juros?: number;
}

export interface EntradaFinanceiraPayload {
  metodoPagamento: MetodoPagamento;
  valor: number;
  descricao: string;
  parcelas?: number;
  juros?: number;
}

export interface MovimentoFinanceiro {
  id: string;
  lojaId: string;
  tipo: TipoMovimento;
  metodoPagamento: MetodoPagamento;
  valor: number;
  descricao: string;
  criadoEm: string;
  parcelas?: number; // Adicionado como opcional
  juros?: number; // Adicionado como opcional
}

export interface RelatorioFinanceiro {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  totalPorMetodoEntrada: Partial<Record<MetodoPagamento, number>>;
  totalPorMetodoSaida: Partial<Record<MetodoPagamento, number>>;
}

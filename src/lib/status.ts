// Regras de status compartilhadas entre páginas (estoque e orçamentos)

export type StatusVariant = 'success' | 'warning' | 'danger' | 'brand' | 'neutral';

/** Quantidade a partir da qual um produto deixa de ser considerado "estoque baixo". */
export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export const STOCK_STATUS: Record<
  StockStatus,
  { label: string; variant: StatusVariant }
> = {
  in_stock: { label: 'Em estoque', variant: 'success' },
  low_stock: { label: 'Estoque baixo', variant: 'warning' },
  out_of_stock: { label: 'Esgotado', variant: 'danger' },
};

export function getStockStatus(quantidade: number | undefined | null): StockStatus {
  const qtd = quantidade ?? 0;
  if (qtd <= 0) return 'out_of_stock';
  if (qtd <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

const ORCAMENTO_STATUS: Record<string, { label: string; variant: StatusVariant }> = {
  ABERTO: { label: 'Aberto', variant: 'warning' },
  APROVADO: { label: 'Aprovado', variant: 'success' },
  REJEITADO: { label: 'Rejeitado', variant: 'danger' },
  REPROVADO: { label: 'Reprovado', variant: 'danger' },
};

export function getOrcamentoStatus(status: string | undefined | null) {
  const key = (status ?? '').toUpperCase();
  return (
    ORCAMENTO_STATUS[key] ?? {
      label: status ? status.charAt(0) + status.slice(1).toLowerCase() : '—',
      variant: 'neutral' as StatusVariant,
    }
  );
}

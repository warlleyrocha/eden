import { Badge } from '@/components/ui/badge';
import {
  getOrcamentoStatus,
  getStockStatus,
  STOCK_STATUS,
} from '@/lib/status';

export function StockStatusBadge({ quantidade }: { quantidade: number }) {
  const { label, variant } = STOCK_STATUS[getStockStatus(quantidade)];
  return <Badge variant={variant}>{label}</Badge>;
}

export function OrcamentoStatusBadge({ status }: { status: string }) {
  const { label, variant } = getOrcamentoStatus(status);
  return <Badge variant={variant}>{label}</Badge>;
}

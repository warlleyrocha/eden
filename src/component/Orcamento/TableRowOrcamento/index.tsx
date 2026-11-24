import { memo, useMemo } from 'react';
import { Printer, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { OrcamentoStatusBadge } from '@/components/app/status-badge';
import { formatarMoeda } from '@/utils/formatters';

export interface OrcamentoRenderDetails {
  id: string;
  criadoEm: string | Date;
  total: number;
  status: string;
  cliente?: {
    nome: string;
  } | null;
}

export interface TableRowOrcamentoProps {
  orcamento: OrcamentoRenderDetails;
  numeroSequencial: number;
  onPrint: (id: string) => void;
  onDeleteOrcamento: (id: string) => void;
}

export const TableRowOrcamento = memo<TableRowOrcamentoProps>(
  ({ orcamento, numeroSequencial, onPrint, onDeleteOrcamento }) => {
    const formattedDate = useMemo(
      () => new Date(orcamento.criadoEm).toLocaleDateString('pt-BR'),
      [orcamento.criadoEm]
    );

    return (
      <TableRow onDoubleClick={() => onPrint(orcamento.id)}>
        <TableCell className="tabular pl-6 text-foreground-secondary">
          #{numeroSequencial}
        </TableCell>
        <TableCell className="max-w-[280px] truncate font-medium">
          {orcamento.cliente?.nome ?? 'Sem nome'}
        </TableCell>
        <TableCell className="tabular text-foreground-secondary">
          {formattedDate}
        </TableCell>
        <TableCell className="tabular text-right font-medium">
          {formatarMoeda(orcamento.total)}
        </TableCell>
        <TableCell>
          <OrcamentoStatusBadge status={orcamento.status} />
        </TableCell>
        <TableCell className="pr-6">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPrint(orcamento.id)}
              aria-label="Imprimir orçamento"
              title="Imprimir"
            >
              <Printer />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onDeleteOrcamento(orcamento.id)}
              aria-label="Excluir orçamento"
              title="Excluir"
              className="hover:border-danger/40 hover:bg-danger-bg hover:text-danger-foreground"
            >
              <Trash2 />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

TableRowOrcamento.displayName = 'TableRowOrcamento';

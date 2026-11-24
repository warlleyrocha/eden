import { memo, useMemo } from 'react';
import { Printer } from 'lucide-react';

import { TableCell, TableRow } from '@/components/ui/table';
import { OrcamentoStatusBadge } from '@/components/app/status-badge';
import { RowActions } from '@/components/app/row-actions';
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
          <RowActions
            label={`orçamento #${numeroSequencial}`}
            actions={[
              {
                label: 'Imprimir',
                icon: Printer,
                onSelect: () => onPrint(orcamento.id),
              },
            ]}
            onDelete={() => onDeleteOrcamento(orcamento.id)}
          />
        </TableCell>
      </TableRow>
    );
  }
);

TableRowOrcamento.displayName = 'TableRowOrcamento';

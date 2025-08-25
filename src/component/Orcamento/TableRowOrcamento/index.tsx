import { memo, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Printer, Trash } from 'lucide-react';

// Defina o tipo aqui ou importe de um arquivo de tipos compartilhado
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
  onOpenModalDetails: (id: string) => void;
  onDeleteOrcamento: (id: string) => void;
}

export const TableRowOrcamento = memo<TableRowOrcamentoProps>(
  ({ orcamento, numeroSequencial, onOpenModalDetails, onDeleteOrcamento }) => {
    const handleClick = useCallback(() => {
      onOpenModalDetails(orcamento.id);
    }, [orcamento.id, onOpenModalDetails]);

    const formattedDate = useMemo(() => {
      return new Date(orcamento.criadoEm).toLocaleDateString('pt-BR');
    }, [orcamento.criadoEm]);

    const formattedTotal = useMemo(() => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(orcamento.total);
    }, [orcamento.total]);

    return (
      <TableRow className="hover:bg-gray-50 text-center bg-white">
        <TableCell className="py-2 px-4">{numeroSequencial}</TableCell>
        <TableCell className="py-2 px-4">
          {orcamento.cliente?.nome ?? 'Sem nome'}
        </TableCell>
        <TableCell className="py-2 px-4">{formattedDate}</TableCell>
        <TableCell className="py-2 px-4">{formattedTotal}</TableCell>
        <TableCell className="py-2 px-4">{orcamento.status}</TableCell>
        <TableCell className="py-2 px-4 space-x-2">
          <Button
            variant="outline"
            className="text-blue-600 hover:bg-blue-100"
            onClick={handleClick}
          >
            <Printer />
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-100"
            onClick={() => onDeleteOrcamento(orcamento.id)}
          >
            <Trash />
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

TableRowOrcamento.displayName = 'TableRowOrcamento';

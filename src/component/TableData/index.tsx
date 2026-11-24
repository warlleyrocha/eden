import { useState } from 'react';
import { Package } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StockStatusBadge } from '@/components/app/status-badge';
import { RowActions } from '@/components/app/row-actions';
import { formatarMoeda } from '@/utils/formatters';
import { ConfirmDialog } from '../ConfirmDialog';

import type { Produto } from '@/@types/product';

type TableDataProps = {
  items: Produto[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

function ProductThumb() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-secondary text-foreground-secondary">
      <Package className="size-[18px]" strokeWidth={1.75} />
    </span>
  );
}

export function TableData({ items, onEdit, onDelete }: TableDataProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (selectedId && onDelete) await onDelete(selectedId);
    setSelectedId(null);
  };

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden sm:block">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Produto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço de custo</TableHead>
              <TableHead className="text-right">Valor total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const qtd = item.estoque ?? 0;
              const preco = item.precoCusto ?? 0;
              return (
                <TableRow
                  key={item.id}
                  onDoubleClick={() => onEdit?.(item.id)}
                >
                  <TableCell className="max-w-[320px] pl-6">
                    <div className="flex items-center gap-3">
                      <ProductThumb />
                      <span className="truncate font-medium" title={item.nome}>
                        {item.nome || 'Sem nome'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-right">{qtd}</TableCell>
                  <TableCell className="tabular text-right text-foreground-secondary">
                    {formatarMoeda(preco)}
                  </TableCell>
                  <TableCell className="tabular text-right font-medium">
                    {formatarMoeda(preco * qtd)}
                  </TableCell>
                  <TableCell>
                    <StockStatusBadge quantidade={qtd} />
                  </TableCell>
                  <TableCell className="pr-6">
                    <RowActions
                      label={item.nome}
                      onEdit={() => onEdit?.(item.id)}
                      onDelete={() => setSelectedId(item.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="divide-y divide-border border-t border-border sm:hidden">
        {items.map((item) => {
          const qtd = item.estoque ?? 0;
          const preco = item.precoCusto ?? 0;
          return (
            <li key={item.id} className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ProductThumb />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.nome}</p>
                    <StockStatusBadge quantidade={qtd} />
                  </div>
                </div>
                <RowActions
                  label={item.nome}
                  onEdit={() => onEdit?.(item.id)}
                  onDelete={() => setSelectedId(item.id)}
                />
              </div>
              <dl className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-foreground-secondary">Qtd.</dt>
                  <dd className="tabular font-medium">{qtd}</dd>
                </div>
                <div>
                  <dt className="text-xs text-foreground-secondary">Custo</dt>
                  <dd className="tabular font-medium">{formatarMoeda(preco)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-foreground-secondary">Total</dt>
                  <dd className="tabular font-semibold">
                    {formatarMoeda(preco * qtd)}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
      />
    </>
  );
}

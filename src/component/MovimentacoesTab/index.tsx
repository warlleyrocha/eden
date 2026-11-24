import { useMemo, useState } from 'react';
import {
  Banknote,
  CreditCard,
  Landmark,
  Pencil,
  Plus,
  QrCode,
  Receipt,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/app/empty-state';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '../ConfirmDialog';

import type { MovimentoFinanceiro, TipoMovimento } from '@/@types/financeiro';

interface MovimentacoesTabProps {
  // Totais por método de pagamento (do relatório do dia)
  pixValue: number;
  dinheiroValue: number;
  debitoValue: number;
  creditoValue: number;

  movimentacoes: MovimentoFinanceiro[];
  tipoMovimento: TipoMovimento;
  totalValue: string;
  emptyMessage: string;

  onAddClick: () => void;
  /** Excluir movimentação */
  onClick: (id: string) => void;
  /** Editar movimentação */
  onDoubleClick: (id: string) => void;

  formatarMoeda: (valor: number) => string;
  formatarMetodoPagamentoCompleto: (
    metodo: string,
    parcelas?: number,
    juros?: number
  ) => string;
}

const formatarHora = (data: string) =>
  new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function MovimentacoesTab({
  pixValue,
  dinheiroValue,
  debitoValue,
  creditoValue,
  movimentacoes,
  tipoMovimento,
  totalValue,
  emptyMessage,
  onAddClick,
  onClick,
  onDoubleClick,
  formatarMoeda,
  formatarMetodoPagamentoCompleto,
}: MovimentacoesTabProps) {
  const isEntrada = tipoMovimento === 'ENTRADA';
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const movimentacoesDoDia = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return movimentacoes
      .filter((m) => m.tipo === tipoMovimento)
      .filter((m) => {
        const d = new Date(m.criadoEm);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === hoje.getTime();
      })
      .sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );
  }, [movimentacoes, tipoMovimento]);

  const metodos = [
    { label: 'PIX', value: pixValue, icon: QrCode },
    { label: 'Dinheiro', value: dinheiroValue, icon: Banknote },
    { label: 'Débito', value: debitoValue, icon: Landmark },
    { label: 'Crédito', value: creditoValue, icon: CreditCard },
  ];

  return (
    <div className="flex flex-col">
      {/* Totais por método de pagamento */}
      <div className="mx-5 mb-5 grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface-secondary sm:mx-6 lg:grid-cols-4">
        {metodos.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              'flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5',
              i % 2 === 1 && 'border-l border-border',
              i >= 2 && 'border-t border-border lg:border-t-0',
              i === 2 && 'lg:border-l'
            )}
          >
            <span className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-secondary sm:flex">
              <m.icon className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-foreground-secondary">{m.label}</p>
              <p className="tabular truncate font-semibold text-foreground">
                {formatarMoeda(m.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {movimentacoesDoDia.length === 0 ? (
        <EmptyState
          className="border-t border-border"
          icon={<Receipt />}
          title={isEntrada ? 'Nenhuma entrada hoje' : 'Nenhuma saída hoje'}
          description={emptyMessage}
          action={
            <Button size="sm" variant="outline" onClick={onAddClick}>
              <Plus /> {isEntrada ? 'Registrar entrada' : 'Registrar saída'}
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Descrição</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="pr-6 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoesDoDia.map((mov) => (
              <TableRow key={mov.id} onDoubleClick={() => onDoubleClick(mov.id)}>
                <TableCell className="max-w-[320px] pl-6">
                  <p className="truncate font-medium" title={mov.descricao}>
                    {mov.descricao || (isEntrada ? 'Entrada' : 'Saída')}
                  </p>
                </TableCell>
                <TableCell className="tabular text-foreground-secondary">
                  {formatarHora(mov.criadoEm)}
                </TableCell>
                <TableCell className="text-foreground-secondary">
                  {formatarMetodoPagamentoCompleto(
                    mov.metodoPagamento,
                    mov.parcelas,
                    mov.juros
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    'tabular text-right font-semibold',
                    isEntrada ? 'text-success-foreground' : 'text-danger-foreground'
                  )}
                >
                  {isEntrada ? '+ ' : '− '}
                  {formatarMoeda(mov.valor)}
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onDoubleClick(mov.id)}
                      aria-label="Editar movimentação"
                      title="Editar"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setDeleteId(mov.id)}
                      aria-label="Excluir movimentação"
                      title="Excluir"
                      className="hover:border-danger/40 hover:bg-danger-bg hover:text-danger-foreground"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="bg-surface-secondary">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="pl-6 font-medium">
                Total de {isEntrada ? 'entradas' : 'saídas'} do dia
              </TableCell>
              <TableCell className="tabular text-right font-bold">
                {totalValue}
              </TableCell>
              <TableCell className="pr-6" />
            </TableRow>
          </TableFooter>
        </Table>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir movimentação"
        description="Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (deleteId) onClick(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}

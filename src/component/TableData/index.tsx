import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';

type TableDataProps = {
  items: {
    id: string;
    produto: string;
    quantidade: number;
    preco: string;
    valor_total: string;
  }[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function TableData({ items, onEdit, onDelete }: TableDataProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openConfirmDialog = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId && onDelete) {
      await onDelete(selectedId);
    }
    setDialogOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="w-full">
      {/* Versão Desktop/Tablet */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-2xl border border-[#081534]">
          <Table className="w-full min-w-[640px] bg-gray-20 border-collapse">
            <TableHeader>
              <TableRow className="bg-white">
                <TableCell className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A] min-w-[120px]">
                  Produto
                </TableCell>
                <TableCell className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A] min-w-[100px]">
                  Quantidade
                </TableCell>
                <TableCell className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A] min-w-[80px]">
                  Preço
                </TableCell>
                <TableCell className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A] min-w-[100px]">
                  Valor Total
                </TableCell>
                <TableCell className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A] min-w-[100px]">
                  Ações
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => onEdit?.(item.id)}
                >
                  <TableCell className="px-4 lg:px-6 py-4 text-sm text-[#1E3A8A] max-w-[200px]">
                    <div className="truncate" title={item.produto}>
                      {item.produto}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 lg:px-6 py-4 text-sm text-[#1E3A8A]">
                    {item.quantidade}
                  </TableCell>
                  <TableCell className="px-4 lg:px-6 py-4 text-sm text-[#1E3A8A]">
                    {item.preco}
                  </TableCell>
                  <TableCell className="px-4 lg:px-6 py-4 text-sm text-[#1E3A8A]">
                    {item.valor_total}
                  </TableCell>
                  <TableCell className="px-4 lg:px-6 py-4 text-sm text-[#1E3A8A]">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 text-blue-600 hover:bg-blue-100 min-w-[36px] px-2 cursor-pointer"
                        onClick={() => onEdit?.(item.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 text-red-600 hover:bg-red-100 min-w-[36px] px-2 cursor-pointer"
                        onClick={() => openConfirmDialog(item.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="block sm:hidden space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="bg-white border border-[#081534] rounded-lg p-4 shadow-sm w-full text-left cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onDoubleClick={() => onEdit?.(item.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-[#1E3A8A] text-base flex-1 mr-2">
                {item.produto}
              </h3>
              <div className="flex space-x-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-blue-600 hover:bg-blue-100 min-w-[32px] px-1.5 h-8"
                  onClick={() => onEdit?.(item.id)}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-red-600 hover:bg-red-100 min-w-[32px] px-1.5 h-8"
                  onClick={() => openConfirmDialog(item.id)}
                >
                  <Trash className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Qtd:</span>
                <span className="ml-1 text-[#1E3A8A] font-medium">
                  {item.quantidade}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Preço:</span>
                <span className="ml-1 text-[#1E3A8A] font-medium">
                  {item.preco}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Total:</span>
                <span className="ml-1 text-[#1E3A8A] font-semibold">
                  {item.valor_total}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ConfirmDialog do Radix UI */}
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Excluir Produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
      />
    </div>
  );
}

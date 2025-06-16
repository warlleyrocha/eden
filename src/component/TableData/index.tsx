import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { ConfirmDialog } from "../ConfirmDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="overflow-x-auto mt-8 rounded-2xl border border-[#081534]">
      <Table className="min-w-full bg-gray-20 border-collapse">
        <TableHeader className="">
          <TableRow className="bg-white">
            <TableCell className="px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A]">
              Produto
            </TableCell>
            <TableCell className="px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A]">
              Quantidade
            </TableCell>
            <TableCell className="px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A]">
              Preço
            </TableCell>
            <TableCell className="px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A]">
              Valor Total
            </TableCell>
            <TableCell className="px-6 py-3 text-left text-sm font-semibold text-[#1E3A8A]">
              Ações
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index} className="hover:bg-gray-50">
              <TableCell className="px-6 py-4 text-sm text-[#1E3A8A]">
                {item.produto}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm text-[#1E3A8A]">
                {item.quantidade}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm text-[#1E3A8A]">
                {item.preco}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm text-[#1E3A8A]">
                {item.valor_total}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm text-[#1E3A8A]">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-blue-600 hover:bg-blue-100"
                    onClick={() => onEdit?.(item.id)}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-red-600 hover:bg-red-100"
                    onClick={() => openConfirmDialog(item.id)}
                  >
                    <Trash className="w-4 h-4" />
                    <span>Excluir</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

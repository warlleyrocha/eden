// TableClient.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Search } from 'lucide-react';

import type { Client } from '@/@types/clients';

import { formatCpfCnpj } from '@/utils/formatCpfCnpj';
import { formatPhone } from '@/utils/formatPhone';

import useTableClientLogic from './useTableClientLogic';

import { useState } from 'react';
import { ConfirmDialog } from '../ConfirmDialog';

interface TableClientProps {
  clients: Client[];
  onSelectClientForEdit: (client: Client) => void;
  onDelete?: (id: string) => void;
}

export default function TableClient({
  clients,
  onDelete,
  onSelectClientForEdit,
}: TableClientProps) {
  // Lógica de busca e filtragem
  const { searchTerm, setSearchTerm, filteredClients } = useTableClientLogic({
    formattedClients: clients,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openConfirmDialog = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId && onDelete) {
      onDelete(selectedId);
    }
    setDialogOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="w-full h-full p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row w-full justify-between mb-[5vh] mt-[8px] ">
        <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0 ">
          <Search className="mr-2" />
          <Input
            type="text"
            placeholder="Buscar clientes"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="flex-grow sm:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <Table className="w-full border rounded-lg shadow-md">
        <TableHeader>
          <TableRow className="bg-gray-100 text-center">
            <TableCell className="py-2 px-4">Nome</TableCell>
            <TableCell className="py-2 px-4">Telefone</TableCell>
            <TableCell className="py-2 px-4">E-mail</TableCell>
            <TableCell className="py-2 px-4">Endereço</TableCell>
            <TableCell className="py-2 px-4">CPF/CNPJ</TableCell>
            <TableCell className="py-2 px-4"></TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredClients.map((client) => (
            <TableRow key={client.id} className="hover:bg-gray-50 text-center">
              <TableCell className="py-2 px-4">{client.nome}</TableCell>
              <TableCell className="py-2 px-4">
                {formatPhone(client.telefone)}
              </TableCell>
              <TableCell className="py-2 px-4">{client.email}</TableCell>
              <TableCell className="py-2 px-4">{client.endereco}</TableCell>
              <TableCell className="py-2 px-4">
                {formatCpfCnpj(client.cpfCnpj)}
              </TableCell>
              <TableCell className="py-2 px-4">
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-blue-600 hover:bg-blue-100"
                    onClick={() => onSelectClientForEdit(client)}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-red-600 hover:bg-red-100"
                    onClick={() => openConfirmDialog(client.id)}
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
        title="Excluir Cliente"
        description="Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
      />
    </div>
  );
}

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
      await onDelete(selectedId);
    }
    setDialogOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="w-full space-y-6 ">
      <div className="relative w-full sm:w-[30%]">
        <Input
          type="text"
          placeholder="Buscar clientes"
          className="w-full bg-white placeholder:text-[#55575c] pl-10 pr-3 sm:pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Versão Desktop/Tablet */}
      <div className="hidden md:block bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableCell className="py-3 px-4 text-left font-semibold">
                  Nome
                </TableCell>
                <TableCell className="py-3 px-4 text-left font-semibold">
                  Telefone
                </TableCell>
                <TableCell className="py-3 px-4 text-left font-semibold">
                  E-mail
                </TableCell>
                <TableCell className="py-3 px-4 text-left font-semibold">
                  Endereço
                </TableCell>
                <TableCell className="py-3 px-4 text-left font-semibold">
                  CPF/CNPJ
                </TableCell>
                <TableCell className="py-3 px-4 text-center font-semibold">
                  Ações
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => onSelectClientForEdit(client)}
                >
                  <TableCell className="py-3 px-4 max-w-[150px]">
                    <div className="truncate" title={client.nome}>
                      {client.nome}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {formatPhone(client.telefone)}
                  </TableCell>
                  <TableCell className="py-3 px-4 max-w-[200px]">
                    <div className="truncate" title={client.email}>
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 max-w-[200px]">
                    <div className="truncate" title={client.endereco}>
                      {client.endereco}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {formatCpfCnpj(client.cpfCnpj)}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-blue-600 hover:bg-blue-100 min-w-[36px] px-2"
                        onClick={() => onSelectClientForEdit(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-red-600 hover:bg-red-100 min-w-[36px] px-2"
                        onClick={() => openConfirmDialog(client.id)}
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
      <div className="block md:hidden space-y-4">
        {filteredClients.map((client) => (
          <button
            key={client.id}
            className="bg-white w-full border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50"
            onDoubleClick={() => onSelectClientForEdit(client)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-2">
                {client.nome}
              </h3>
              <div className="flex space-x-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-blue-600 hover:bg-blue-100 min-w-[32px] px-1.5 h-8"
                  onClick={() => onSelectClientForEdit(client)}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-red-600 hover:bg-red-100 min-w-[32px] px-1.5 h-8"
                  onClick={() => openConfirmDialog(client.id)}
                >
                  <Trash className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="text-gray-600 w-20">Telefone:</span>
                <span className="text-gray-900 font-medium">
                  {formatPhone(client.telefone)}
                </span>
              </div>

              <div className="flex items-start">
                <span className="text-gray-600 w-20 flex-shrink-0">
                  E-mail:
                </span>
                <span className="text-gray-900 font-medium break-all">
                  {client.email}
                </span>
              </div>

              <div className="flex items-start">
                <span className="text-gray-600 w-20 flex-shrink-0">
                  Endereço:
                </span>
                <span className="text-gray-900 font-medium">
                  {client.endereco}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-gray-600 w-20">CPF/CNPJ:</span>
                <span className="text-gray-900 font-medium">
                  {formatCpfCnpj(client.cpfCnpj)}
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
        title="Excluir Cliente"
        description="Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
      />
    </div>
  );
}

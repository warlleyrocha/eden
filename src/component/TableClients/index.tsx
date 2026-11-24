import { useState } from 'react';
import { Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/components/layout/use-logout';

import type { Client } from '@/@types/clients';
import { formatCpfCnpj } from '@/utils/formatCpfCnpj';
import { formatPhone } from '@/utils/formatPhone';

import { ConfirmDialog } from '../ConfirmDialog';

interface TableClientProps {
  clients: Client[];
  onSelectClientForEdit: (client: Client) => void;
  onDelete?: (id: string) => void;
}

function ClientAvatar({ nome }: { nome: string }) {
  return (
    <Avatar className="size-10 rounded-md border border-border">
      <AvatarFallback className="rounded-md bg-surface-secondary text-xs font-semibold text-foreground-secondary">
        {getInitials(nome)}
      </AvatarFallback>
    </Avatar>
  );
}

function RowActions({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onEdit}
        aria-label={`Editar ${client.nome}`}
        title="Editar"
      >
        <Pencil />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onDelete}
        aria-label={`Excluir ${client.nome}`}
        title="Excluir"
        className="hover:border-danger/40 hover:bg-danger-bg hover:text-danger-foreground"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export default function TableClient({
  clients,
  onDelete,
  onSelectClientForEdit,
}: TableClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (selectedId && onDelete) await onDelete(selectedId);
    setSelectedId(null);
  };

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="pr-6 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                onDoubleClick={() => onSelectClientForEdit(client)}
              >
                <TableCell className="max-w-[300px] pl-6">
                  <div className="flex items-center gap-3">
                    <ClientAvatar nome={client.nome} />
                    <div className="min-w-0">
                      <p className="truncate font-medium" title={client.nome}>
                        {client.nome}
                      </p>
                      {client.email && (
                        <p
                          className="truncate text-xs text-foreground-secondary"
                          title={client.email}
                        >
                          {client.email}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="tabular text-foreground-secondary">
                  {client.telefone ? formatPhone(client.telefone) : '—'}
                </TableCell>
                <TableCell className="tabular text-foreground-secondary">
                  {client.cpfCnpj ? formatCpfCnpj(client.cpfCnpj) : '—'}
                </TableCell>
                <TableCell className="max-w-[260px] text-foreground-secondary">
                  <p className="truncate" title={client.endereco}>
                    {client.endereco || '—'}
                  </p>
                </TableCell>
                <TableCell className="pr-6">
                  <RowActions
                    client={client}
                    onEdit={() => onSelectClientForEdit(client)}
                    onDelete={() => setSelectedId(client.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="divide-y divide-border border-t border-border md:hidden">
        {clients.map((client) => (
          <li key={client.id} className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ClientAvatar nome={client.nome} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{client.nome}</p>
                  <p className="tabular truncate text-xs text-foreground-secondary">
                    {client.cpfCnpj ? formatCpfCnpj(client.cpfCnpj) : '—'}
                  </p>
                </div>
              </div>
              <RowActions
                client={client}
                onEdit={() => onSelectClientForEdit(client)}
                onDelete={() => setSelectedId(client.id)}
              />
            </div>
            <ul className="space-y-1.5 text-sm text-foreground-secondary [&_svg]:size-3.5 [&_svg]:shrink-0">
              {client.telefone && (
                <li className="flex items-center gap-2">
                  <Phone /> {formatPhone(client.telefone)}
                </li>
              )}
              {client.email && (
                <li className="flex items-center gap-2 break-all">
                  <Mail /> {client.email}
                </li>
              )}
              {client.endereco && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5" /> {client.endereco}
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        title="Excluir cliente"
        description="Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
      />
    </>
  );
}

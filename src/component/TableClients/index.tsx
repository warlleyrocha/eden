import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EntityIdentity } from '@/components/app/entity-identity';
import { RowActions } from '@/components/app/row-actions';

import type { Client } from '@/@types/clients';
import { formatCpfCnpj } from '@/utils/formatCpfCnpj';
import { formatPhone } from '@/utils/formatPhone';

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
                  <EntityIdentity nome={client.nome} subtitle={client.email} />
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
                    label={client.nome}
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
              <EntityIdentity
                nome={client.nome}
                subtitle={client.cpfCnpj ? formatCpfCnpj(client.cpfCnpj) : '—'}
                subtitleClassName="tabular"
              />
              <RowActions
                label={client.nome}
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

import { useState } from 'react';
import { UserCheck, UserX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

import type { Funcionario } from '@/@types/funcionario';
import { getPermissaoLabel } from '@/lib/permissoes';
import { cn } from '@/lib/utils';

import { ConfirmDialog } from '../ConfirmDialog';

function Permissoes({ permissoes }: { permissoes: string[] }) {
  if (permissoes.length === 0) {
    return <span className="text-foreground-secondary">Sem permissões</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {permissoes.map((p) => (
        <Badge key={p} variant="brand">
          {getPermissaoLabel(p)}
        </Badge>
      ))}
    </div>
  );
}

function Status({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="neutral">Inativo</Badge>
  );
}

type TableFuncionariosProps = {
  funcionarios: Funcionario[];
  onEdit: (funcionario: Funcionario) => void;
  onToggleAtivo: (funcionario: Funcionario) => void;
  onDelete: (id: string) => Promise<void>;
  /** Id com ativar/desativar em andamento. */
  togglingId?: string | null;
};

export default function TableFuncionarios({
  funcionarios,
  onEdit,
  onToggleAtivo,
  onDelete,
  togglingId,
}: TableFuncionariosProps) {
  const [excluindo, setExcluindo] = useState<Funcionario | null>(null);

  const handleConfirmDelete = async () => {
    if (excluindo) await onDelete(excluindo.id);
    setExcluindo(null);
  };

  const actions = (f: Funcionario) => (
    <RowActions
      label={f.nome}
      loading={togglingId === f.id}
      onEdit={() => onEdit(f)}
      onDelete={() => setExcluindo(f)}
      actions={[
        {
          label: f.ativo ? 'Desativar acesso' : 'Reativar acesso',
          icon: f.ativo ? UserX : UserCheck,
          onSelect: () => onToggleAtivo(f),
          disabled: togglingId === f.id,
        },
      ]}
    />
  );

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Funcionário</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarios.map((f) => (
              <TableRow
                key={f.id}
                onDoubleClick={() => onEdit(f)}
                className={cn(!f.ativo && 'text-foreground-secondary')}
              >
                <TableCell className="max-w-[320px] pl-6">
                  <EntityIdentity nome={f.nome} subtitle={f.email} />
                </TableCell>
                <TableCell>
                  <Permissoes permissoes={f.permissoes} />
                </TableCell>
                <TableCell>
                  <Status ativo={f.ativo} />
                </TableCell>
                <TableCell className="pr-6 text-right">{actions(f)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="divide-y divide-border border-t border-border md:hidden">
        {funcionarios.map((f) => (
          <li key={f.id} className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <EntityIdentity nome={f.nome} subtitle={f.email} />
              <div className="flex shrink-0 items-center gap-1">
                <Status ativo={f.ativo} />
                {actions(f)}
              </div>
            </div>
            <Permissoes permissoes={f.permissoes} />
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={excluindo !== null}
        onOpenChange={(open) => !open && setExcluindo(null)}
        title="Excluir funcionário"
        description={`Excluir ${excluindo?.nome ?? 'este funcionário'} de vez? Esta ação não pode ser desfeita. Para só bloquear o acesso, use "Desativar acesso".`}
        onConfirm={handleConfirmDelete}
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
      />
    </>
  );
}

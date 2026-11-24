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

import type { Funcionario } from '@/@types/funcionario';
import { getPermissaoLabel } from '@/lib/permissoes';

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

function Status({ ativo }: { ativo?: boolean }) {
  return ativo === false ? (
    <Badge variant="neutral">Inativo</Badge>
  ) : (
    <Badge variant="success">Ativo</Badge>
  );
}

export default function TableFuncionarios({
  funcionarios,
}: {
  funcionarios: Funcionario[];
}) {
  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Funcionário</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarios.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="max-w-[320px] pl-6">
                  <EntityIdentity nome={f.nome} subtitle={f.email} />
                </TableCell>
                <TableCell>
                  <Permissoes permissoes={f.permissoes} />
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Status ativo={f.ativo} />
                </TableCell>
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
              <Status ativo={f.ativo} />
            </div>
            <Permissoes permissoes={f.permissoes} />
          </li>
        ))}
      </ul>
    </>
  );
}

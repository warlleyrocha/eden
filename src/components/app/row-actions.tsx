import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

type RowActionsProps = {
  /** Nome do registro, usado nos rótulos acessíveis ("Editar Fulano"). */
  label: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

/** Botões de editar/excluir alinhados à direita de uma linha de listagem. */
export function RowActions({ label, onEdit, onDelete }: RowActionsProps) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className="flex justify-end gap-2">
      {onEdit && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onEdit}
          aria-label={`Editar ${label}`}
          title="Editar"
        >
          <Pencil />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onDelete}
          aria-label={`Excluir ${label}`}
          title="Excluir"
          className="hover:border-danger/40 hover:bg-danger-bg hover:text-danger-foreground"
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
}

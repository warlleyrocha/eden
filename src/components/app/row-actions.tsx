import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type RowAction = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
};

type RowActionsProps = {
  /** Nome do registro, usado no rótulo acessível ("Ações de Fulano"). */
  label: string;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Ações extras, mostradas entre "Editar" e "Excluir". */
  actions?: RowAction[];
  /** Troca os três pontos por um spinner (ação da linha em andamento). */
  loading?: boolean;
  className?: string;
};

/**
 * Menu de três pontos com as ações de uma linha de listagem:
 * Editar, ações extras e, separado, Excluir.
 */
export function RowActions({
  label,
  onEdit,
  onDelete,
  actions = [],
  loading,
  className,
}: RowActionsProps) {
  if (!onEdit && !onDelete && actions.length === 0) return null;

  return (
    <div className={cn('flex justify-end', className)}>
      {/* modal={false}: o menu fecha antes de abrir o Dialog/AlertDialog da
          ação, sem deixar o body travado (pointer-events) entre um e outro. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Ações de ${label}`}
            title="Ações"
            // Não dispara o duplo clique da linha (que abre a edição)
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {loading ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onEdit && (
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil />
              Editar
            </DropdownMenuItem>
          )}
          {actions.map(({ label: actionLabel, icon: Icon, onSelect, disabled }) => (
            <DropdownMenuItem
              key={actionLabel}
              onSelect={onSelect}
              disabled={disabled}
            >
              <Icon />
              {actionLabel}
            </DropdownMenuItem>
          ))}
          {onDelete && (
            <>
              {(onEdit || actions.length > 0) && <DropdownMenuSeparator />}
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 />
                Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

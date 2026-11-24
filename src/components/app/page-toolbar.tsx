import type { ReactNode } from 'react';

/** Linha logo abaixo do header: contexto da página à esquerda, ações principais à direita. */
export function PageToolbar({
  description,
  actions,
}: {
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-foreground-secondary">{description}</p>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

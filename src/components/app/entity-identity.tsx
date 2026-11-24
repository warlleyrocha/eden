import type { ReactNode } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/components/layout/use-logout';
import { cn } from '@/lib/utils';

/** Avatar quadrado com as iniciais do nome (clientes, funcionários...). */
export function EntityAvatar({
  nome,
  className,
}: {
  nome: string;
  className?: string;
}) {
  return (
    <Avatar className={cn('size-10 rounded-md border border-border', className)}>
      <AvatarFallback className="rounded-md bg-surface-secondary text-xs font-semibold text-foreground-secondary">
        {getInitials(nome)}
      </AvatarFallback>
    </Avatar>
  );
}

type EntityIdentityProps = {
  nome: string;
  /** Linha secundária abaixo do nome (e-mail, documento...). */
  subtitle?: ReactNode;
  subtitleClassName?: string;
};

/** Avatar + nome + subtítulo, usado na primeira coluna das listagens. */
export function EntityIdentity({
  nome,
  subtitle,
  subtitleClassName,
}: EntityIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <EntityAvatar nome={nome} />
      <div className="min-w-0">
        <p className="truncate font-medium" title={nome}>
          {nome}
        </p>
        {subtitle && (
          <p
            className={cn(
              'truncate text-xs text-foreground-secondary',
              subtitleClassName
            )}
            title={typeof subtitle === 'string' ? subtitle : undefined}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

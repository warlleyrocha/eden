import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** Ações alinhadas à direita do cabeçalho (filtros, botões). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove o padding do corpo (útil para tabelas de borda a borda). */
  flush?: boolean;
};

/** Card principal do design system: superfície branca, raio 20px, cabeçalho com título e ações. */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  flush,
}: SectionCardProps) {
  const hasHeader = title || description || actions;
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card',
        className
      )}
    >
      {hasHeader && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg leading-tight font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-foreground-secondary">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </header>
      )}
      <div className={cn('min-w-0 flex-1', !flush && 'px-5 pb-5 sm:px-6 sm:pb-6')}>
        {children}
      </div>
    </section>
  );
}

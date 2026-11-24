import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export type KpiTrend = {
  /** Variação percentual (ex.: 8.4 = +8,4%). `null` quando não há base de comparação. */
  value: number | null;
  /** Se `true`, uma variação positiva é ruim (ex.: despesas). */
  invert?: boolean;
  /** Texto de apoio para leitores de tela / tooltip, ex.: "vs. ontem". */
  label?: string;
};

type KpiCardProps = {
  label: string;
  value: ReactNode;
  trend?: KpiTrend;
  /** Selo informativo no lugar da variação (ex.: "12 no total"). */
  badge?: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
};

function formatTrend(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}%`;
}

function TrendChip({ value, invert, label }: KpiTrend) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span
        className="rounded-sm bg-neutral-bg px-1.5 py-0.5 text-xs font-medium text-foreground-secondary"
        title={label}
      >
        —
      </span>
    );
  }
  const good = invert ? value < 0 : value > 0;
  const neutral = value === 0;
  return (
    <span
      title={label}
      className={cn(
        'tabular rounded-sm px-1.5 py-0.5 text-xs font-medium',
        neutral && 'bg-neutral-bg text-foreground-secondary',
        !neutral && good && 'bg-success-bg text-success-foreground',
        !neutral && !good && 'bg-danger-bg text-danger-foreground'
      )}
    >
      {formatTrend(value)}
      {label && <span className="sr-only"> {label}</span>}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  trend,
  badge,
  hint,
  icon,
  loading,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex min-h-28 flex-col justify-between gap-3 rounded-card border border-border bg-surface p-5 shadow-card',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[15px] text-foreground-secondary">
          {icon && <span className="text-foreground-muted [&_svg]:size-4">{icon}</span>}
          <span>{label}</span>
        </div>
        <div className="shrink-0 whitespace-nowrap">
          {trend ? <TrendChip {...trend} /> : badge}
        </div>
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p className="tabular text-[28px] leading-none font-bold tracking-tight text-foreground">
            {value}
          </p>
        )}
        {hint && (
          <p className="mt-2 text-xs text-foreground-secondary">{hint}</p>
        )}
      </div>
    </div>
  );
}

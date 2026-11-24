import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { PackageOpen } from 'lucide-react';

import { SectionCard } from '@/components/app/section-card';
import { EmptyState } from '@/components/app/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LOW_STOCK_THRESHOLD, type StockStatus } from '@/lib/status';

const SEGMENTOS: { key: StockStatus; label: string; color: string }[] = [
  { key: 'in_stock', label: 'Em estoque', color: 'var(--success)' },
  { key: 'low_stock', label: 'Estoque baixo', color: 'var(--warning)' },
  { key: 'out_of_stock', label: 'Esgotado', color: 'var(--danger)' },
];

export function StockStatusChart({
  contagem,
  total,
  loading,
}: {
  contagem: Record<StockStatus, number>;
  total: number;
  loading?: boolean;
}) {
  const data = SEGMENTOS.map((s) => ({ ...s, value: contagem[s.key] })).filter(
    (d) => d.value > 0
  );
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <SectionCard
      title="Situação do estoque"
      description={`Estoque baixo: até ${LOW_STOCK_THRESHOLD} unidades`}
      className="h-full"
    >
      {loading ? (
        <div className="flex flex-col items-center gap-6 pt-2">
          <Skeleton className="size-48 rounded-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<PackageOpen />}
          title="Nenhum produto cadastrado"
          description="Cadastre produtos para acompanhar a situação do estoque."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/estoque">Ir para o estoque</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex h-full flex-col justify-between gap-6">
          <div
            className="relative mx-auto h-[210px] w-full max-w-[240px]"
            role="img"
            aria-label={SEGMENTOS.map(
              (s) => `${s.label}: ${contagem[s.key]} produtos`
            ).join(', ')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={data.length > 1 ? 3 : 0}
                  cornerRadius={8}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="tabular text-3xl font-bold text-foreground">
                {total}
              </span>
              <span className="text-xs text-foreground-secondary">produtos</span>
            </div>
          </div>

          <ul className="grid grid-cols-3 gap-2">
            {SEGMENTOS.map((s) => (
              <li key={s.key} className="min-w-0">
                <p className="flex items-start gap-1.5 text-xs leading-tight text-foreground-secondary">
                  <span
                    className="mt-1 size-2 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                </p>
                <p className="tabular mt-1 text-xl font-bold text-foreground">
                  {contagem[s.key]}
                  <span className="ml-1 text-xs font-medium text-foreground-muted">
                    {pct(contagem[s.key])}%
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';

import { SectionCard } from '@/components/app/section-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatarMoeda } from '@/utils/formatters';

import type { FluxoPonto } from './useDashboard';

type Periodo = 'mensal' | 'diario';

const SERIES = [
  { key: 'entradas', label: 'Entradas', color: 'var(--brand)' },
  { key: 'saidas', label: 'Saídas', color: 'var(--danger)' },
] as const;

const compacto = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const ponto = payload[0].payload as FluxoPonto;
  const saldo = ponto.entradas - ponto.saidas;
  return (
    <div className="min-w-44 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm shadow-dropdown">
      <p className="mb-1.5 text-xs font-medium text-foreground-secondary first-letter:uppercase">
        {ponto.fullLabel}
      </p>
      {SERIES.map((s) => (
        <div key={s.key} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-2 text-foreground-secondary">
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
          <span className="tabular font-semibold text-foreground">
            {formatarMoeda(ponto[s.key])}
          </span>
        </div>
      ))}
      <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-border pt-1.5">
        <span className="text-foreground-secondary">Saldo</span>
        <span className="tabular font-semibold text-foreground">
          {formatarMoeda(saldo)}
        </span>
      </div>
    </div>
  );
}

export function CashFlowChart({
  mensal,
  diario,
  loading,
}: {
  mensal: FluxoPonto[];
  diario: FluxoPonto[];
  loading?: boolean;
}) {
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const [hover, setHover] = useState<number | null>(null);

  const data = periodo === 'mensal' ? mensal : diario;
  // Sem hover, destaca o período atual (mês corrente / hoje)
  const atual = periodo === 'mensal' ? new Date().getMonth() : data.length - 1;
  const destaque = hover ?? atual;

  const totalEntradas = data.reduce((s, d) => s + d.entradas, 0);
  const totalSaidas = data.reduce((s, d) => s + d.saidas, 0);

  return (
    <SectionCard
      title="Fluxo de caixa"
      description={
        periodo === 'mensal'
          ? `Entradas e saídas em ${new Date().getFullYear()}`
          : 'Entradas e saídas nos últimos 14 dias'
      }
      actions={
        <>
          <div className="mr-1 hidden items-center gap-4 text-sm text-foreground-secondary md:flex">
            {SERIES.map((s) => (
              <span key={s.key} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
            <SelectTrigger size="sm" className="w-[120px]" aria-label="Período do gráfico">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="diario">Diário</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    >
      {loading ? (
        <Skeleton className="h-[280px] w-full rounded-lg" />
      ) : (
        <>
          <div
            className="h-[280px] w-full"
            role="img"
            aria-label={`Gráfico de barras. Total de entradas ${formatarMoeda(
              totalEntradas
            )}, total de saídas ${formatarMoeda(totalSaidas)} no período.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                barGap={3}
                barCategoryGap={periodo === 'mensal' ? '22%' : '18%'}
                margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
                onMouseMove={(state) =>
                  setHover(
                    typeof state?.activeTooltipIndex === 'number'
                      ? state.activeTooltipIndex
                      : null
                  )
                }
                onMouseLeave={() => setHover(null)}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 4"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  interval={periodo === 'diario' ? 1 : 0}
                  tick={({ x, y, payload, index }) => (
                    <text
                      x={x}
                      y={y}
                      dy={8}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={index === destaque ? 600 : 400}
                      fill={
                        index === destaque
                          ? 'var(--foreground)'
                          : 'var(--foreground-secondary)'
                      }
                    >
                      {payload.value}
                    </text>
                  )}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v: number) => compacto.format(v)}
                  tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--surface-secondary)', radius: 8 }}
                  content={<ChartTooltip />}
                />
                {SERIES.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    fill={s.color}
                    radius={[6, 6, 2, 2]}
                    maxBarSize={22}
                    isAnimationActive={false}
                  >
                    {data.map((d, i) => (
                      <Cell
                        key={d.key}
                        fillOpacity={i === destaque ? 1 : 0.35}
                      />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-foreground-secondary md:hidden">
            {SERIES.map((s) => (
              <span key={s.key} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
}

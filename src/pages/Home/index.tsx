import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';

import { KpiCard } from '@/components/app/kpi-card';
import { SectionCard } from '@/components/app/section-card';
import { EmptyState } from '@/components/app/empty-state';
import { OrcamentoStatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatarMoeda } from '@/utils/formatters';

import { useDashboard } from './useDashboard';
import { CashFlowChart } from './CashFlowChart';
import { StockStatusChart } from './StockStatusChart';

export default function Home() {
  const { kpis, fluxoMensal, fluxoDiario, estoque, orcamentosRecentes, loading } =
    useDashboard();

  return (
    <>
      {/* Indicadores */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Entradas hoje"
          value={formatarMoeda(kpis.entradasHoje)}
          trend={{ value: kpis.entradasVar, label: 'em relação a ontem' }}
          loading={loading.financeiro}
        />
        <KpiCard
          label="Saídas hoje"
          value={formatarMoeda(kpis.saidasHoje)}
          trend={{ value: kpis.saidasVar, invert: true, label: 'em relação a ontem' }}
          loading={loading.financeiro}
        />
        <KpiCard
          label="Saldo do mês"
          value={formatarMoeda(kpis.saldoMes)}
          trend={{ value: kpis.saldoMesVar, label: 'em relação ao mês anterior' }}
          loading={loading.financeiro}
        />
        <KpiCard
          label="Orçamentos em aberto"
          value={kpis.orcamentosAbertos}
          badge={
            <span className="tabular rounded-sm bg-neutral-bg px-1.5 py-0.5 text-xs font-medium text-foreground-secondary">
              de {kpis.orcamentosTotal}
            </span>
          }
          loading={loading.orcamentos}
        />
      </div>

      {/* Área analítica */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <CashFlowChart
            mensal={fluxoMensal}
            diario={fluxoDiario}
            loading={loading.financeiro}
          />
        </div>
        <StockStatusChart
          contagem={estoque.contagem}
          total={estoque.total}
          loading={loading.estoque}
        />
      </div>

      {/* Área operacional */}
      <SectionCard
        title="Orçamentos recentes"
        flush
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/orcamentos">
              Ver todos <ArrowRight />
            </Link>
          </Button>
        }
      >
        {loading.orcamentos ? (
          <div className="space-y-2 px-6 pb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orcamentosRecentes.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="Nenhum orçamento ainda"
            description="Os orçamentos criados aparecerão aqui."
          />
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 pl-6">Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentosRecentes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="tabular pl-6 text-foreground-secondary">
                    #{o.numero}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate font-medium">
                    {o.cliente}
                  </TableCell>
                  <TableCell className="tabular text-foreground-secondary">
                    {o.criadoEm ? new Date(o.criadoEm).toLocaleDateString('pt-BR') : '—'}
                  </TableCell>
                  <TableCell className="tabular text-right text-foreground-secondary">
                    {o.itens}
                  </TableCell>
                  <TableCell className="tabular text-right font-medium">
                    {formatarMoeda(o.total)}
                  </TableCell>
                  <TableCell className="pr-6">
                    <OrcamentoStatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </>
  );
}

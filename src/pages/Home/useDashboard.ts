import { useMemo } from 'react';
import {
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfDay,
  subDays,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useFinanceiro } from '@/hooks/useFinanceiro';
import { useEstoque } from '@/hooks/useEstoque';
import { useOrcamento } from '@/hooks/useOrcamento';
import { getStockStatus, type StockStatus } from '@/lib/status';

import type { MovimentoFinanceiro } from '@/@types/financeiro';

export type FluxoPonto = {
  key: string;
  label: string;
  /** Rótulo longo para o tooltip, ex.: "novembro de 2026". */
  fullLabel: string;
  entradas: number;
  saidas: number;
};

/** Variação percentual; `null` quando não há base para comparar. */
export function variacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

function somar(
  movs: MovimentoFinanceiro[],
  tipo: MovimentoFinanceiro['tipo'],
  filtro: (d: Date) => boolean
) {
  return movs.reduce((acc, m) => {
    if (m.tipo !== tipo) return acc;
    const d = new Date(m.criadoEm);
    return filtro(d) ? acc + (Number(m.valor) || 0) : acc;
  }, 0);
}

export function useDashboard() {
  const { movimentacoes, loading: loadingFin } = useFinanceiro();
  const { products, loading: loadingEstoque } = useEstoque();
  const { orcamentos, loading: loadingOrc } = useOrcamento();

  const kpis = useMemo(() => {
    const hoje = new Date();
    const ontem = subDays(hoje, 1);
    const mesAnterior = subMonths(hoje, 1);

    const entradasHoje = somar(movimentacoes, 'ENTRADA', (d) => isSameDay(d, hoje));
    const entradasOntem = somar(movimentacoes, 'ENTRADA', (d) => isSameDay(d, ontem));
    const saidasHoje = somar(movimentacoes, 'SAIDA', (d) => isSameDay(d, hoje));
    const saidasOntem = somar(movimentacoes, 'SAIDA', (d) => isSameDay(d, ontem));

    const saldoMes =
      somar(movimentacoes, 'ENTRADA', (d) => isSameMonth(d, hoje)) -
      somar(movimentacoes, 'SAIDA', (d) => isSameMonth(d, hoje));
    const saldoMesAnterior =
      somar(movimentacoes, 'ENTRADA', (d) => isSameMonth(d, mesAnterior)) -
      somar(movimentacoes, 'SAIDA', (d) => isSameMonth(d, mesAnterior));

    const abertos = orcamentos.filter((o) => o.status === 'ABERTO').length;

    return {
      entradasHoje,
      entradasVar: variacao(entradasHoje, entradasOntem),
      saidasHoje,
      saidasVar: variacao(saidasHoje, saidasOntem),
      saldoMes,
      saldoMesVar: variacao(saldoMes, saldoMesAnterior),
      orcamentosAbertos: abertos,
      orcamentosTotal: orcamentos.length,
    };
  }, [movimentacoes, orcamentos]);

  const fluxoMensal = useMemo<FluxoPonto[]>(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    return Array.from({ length: 12 }, (_, mes) => {
      const ref = new Date(ano, mes, 1);
      const noMes = (d: Date) => isSameYear(d, ref) && d.getMonth() === mes;
      const label = format(ref, 'MMM', { locale: ptBR });
      return {
        key: `${ano}-${mes}`,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        fullLabel: format(ref, "MMMM 'de' yyyy", { locale: ptBR }),
        entradas: somar(movimentacoes, 'ENTRADA', noMes),
        saidas: somar(movimentacoes, 'SAIDA', noMes),
      };
    });
  }, [movimentacoes]);

  const fluxoDiario = useMemo<FluxoPonto[]>(() => {
    const hoje = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => {
      const dia = subDays(hoje, 13 - i);
      const noDia = (d: Date) => isSameDay(d, dia);
      return {
        key: dia.toISOString(),
        label: format(dia, 'dd/MM'),
        fullLabel: format(dia, "EEEE, d 'de' MMMM", { locale: ptBR }),
        entradas: somar(movimentacoes, 'ENTRADA', noDia),
        saidas: somar(movimentacoes, 'SAIDA', noDia),
      };
    });
  }, [movimentacoes]);

  const estoque = useMemo(() => {
    const contagem: Record<StockStatus, number> = {
      in_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
    };
    for (const p of products) contagem[getStockStatus(p.estoque)] += 1;
    return { contagem, total: products.length };
  }, [products]);

  const orcamentosRecentes = useMemo(() => {
    const ordenados = orcamentos
      .slice()
      .sort(
        (a, b) =>
          new Date(b.criadoEm ?? 0).getTime() - new Date(a.criadoEm ?? 0).getTime()
      );
    return ordenados.slice(0, 5).map((o, i) => {
      const total =
        o.total ??
        o.itens.reduce((s, it) => s + it.precoUnitario * it.quantidade, 0) +
          o.servicos.reduce((s, sv) => s + sv.valor, 0);
      return {
        id: o.id,
        numero: ordenados.length - i,
        cliente: o.cliente?.nome ?? 'Cliente não informado',
        criadoEm: o.criadoEm,
        total,
        status: o.status,
        itens: o.itens.length + o.servicos.length,
      };
    });
  }, [orcamentos]);

  return {
    kpis,
    fluxoMensal,
    fluxoDiario,
    estoque,
    orcamentosRecentes,
    loading: {
      financeiro: loadingFin && movimentacoes.length === 0,
      estoque: loadingEstoque && products.length === 0,
      orcamentos: loadingOrc && orcamentos.length === 0,
    },
  };
}

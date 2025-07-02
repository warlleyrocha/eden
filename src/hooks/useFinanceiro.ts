import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { financeiroAPI } from '@/services/financeiro.api';

import type {
  MovimentoFinanceiro,
  RelatorioFinanceiro,
  SaidaFinanceiraPayload,
} from '@/@types/financeiro';
import { toast } from 'sonner';

interface CreateSaidaParams {
  payload: SaidaFinanceiraPayload;
  signal?: AbortSignal;
}

interface CreateEntradaParams {
  payload: SaidaFinanceiraPayload;
  signal?: AbortSignal;
}

type ApiError = {
  message: string;
  status?: number;
};

export function useFinanceiro() {
  const [movimentacoes, setMovimentacoes] = useState<MovimentoFinanceiro[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Buscar movimentações
  const fetchMovimentacoes = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const data = await financeiroAPI.fetchMovimentacoesFinanceira(signal);
      setMovimentacoes(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err as ApiError); // A API já retorna ApiError
        setMovimentacoes([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relatório do dia
  const fetchRelatorioHoje = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const data = await financeiroAPI.fetchRelatorioFinanceiro(signal);
      setRelatorio(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err as ApiError); // A API já retorna ApiError
        setRelatorio(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relatório por período
  const fetchRelatorioPorPeriodo = useCallback(
    async (
      params: { dataInicial: string; dataFinal: string },
      signal?: AbortSignal
    ) => {
      const { dataInicial, dataFinal } = params;
      return await financeiroAPI.fetchRelatorioFinanceiroComPeriodo({
        dataInicial,
        dataFinal,
        signal,
      });
    },
    []
  );

  // Criar entrada
  const createEntrada = useCallback(
    async ({ payload, signal }: CreateEntradaParams) => {
      setLoading(true);
      setError(null);

      try {
        const result = await financeiroAPI.createEntrada({ payload, signal });

        // Recarregar dados após criar
        await Promise.all([
          fetchMovimentacoes(signal),
          fetchRelatorioHoje(signal),
        ]);

        return result;
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err as ApiError); // A API já retorna ApiError
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoes, fetchRelatorioHoje]
  );
  // Criar saída
  const createSaida = useCallback(
    async ({ payload, signal }: CreateSaidaParams) => {
      setLoading(true);
      setError(null);

      try {
        const result = await financeiroAPI.createSaida({ payload, signal });

        // Recarregar dados após criar
        await Promise.all([
          fetchMovimentacoes(signal),
          fetchRelatorioHoje(signal),
        ]);

        return result;
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err as ApiError); // A API já retorna ApiError
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoes, fetchRelatorioHoje]
  );

  // Deletar mov. financeira
  const deleteFinanceiro = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await financeiroAPI.deleteFinanceiro({ id });
        await fetchMovimentacoes();
        toast.success('Movimentação excluída com sucesso!');
      } catch (error) {
        setError(error as Error);
        toast.error('Erro ao excluir movimentação');
        throw error; // Permite tratamento adicional no componente
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoes]
  );

  // Auto-fetch inicial
  useEffect(() => {
    const controller = new AbortController();
    fetchMovimentacoes(controller.signal);

    return () => controller.abort();
  }, [fetchMovimentacoes]);

  return {
    // Estados
    movimentacoes,
    relatorio,
    loading,
    error,
    // Actions
    createSaida,
    createEntrada,
    deleteFinanceiro,
    setMovimentacoes,
    fetchMovimentacoes,
    fetchRelatorioHoje,
    fetchRelatorioPorPeriodo,
  };
}

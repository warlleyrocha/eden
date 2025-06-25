import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { financeiroAPI } from '@/services/financeiro.api';
import type {
  MovimentoFinanceiro,
  RelatorioFinanceiro,
  SaidaFinanceiraPayload,
} from '@/@types/financeiro';

interface CreateSaidaParams {
  payload: SaidaFinanceiraPayload;
  signal?: AbortSignal;
}

type ApiError = {
  message: string;
  status?: number;
};

// Helper para tratar erros
const handleApiError = (err: unknown): ApiError => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ?? err.message ?? 'Erro desconhecido';

    const errorMessages: Record<number, string> = {
      401: 'Não autorizado. Faça login novamente.',
      404: 'Recurso não encontrado.',
      500: 'Erro interno do servidor.',
    };

    return {
      message: errorMessages[status!] || message,
      status,
    };
  }
  return { message: 'Erro desconhecido ao processar a requisição.' };
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
        setError(handleApiError(err));
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
        setError(handleApiError(err));
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
      try {
        return await financeiroAPI.fetchRelatorioFinanceiroComPeriodo({
          dataInicial,
          dataFinal,
          signal,
        });
      } catch (err) {
        throw handleApiError(err);
      }
    },
    []
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
          setError(handleApiError(err));
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoes, fetchRelatorioHoje]
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
    setMovimentacoes,
    fetchMovimentacoes,
    fetchRelatorioHoje,
    fetchRelatorioPorPeriodo,
  };
}

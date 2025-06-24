import { api } from '@/services/api';

import { getTodayDateRange } from '@/utils/date';

import {
  type ApiError,
  createErrorHandlerMap,
  handleCommonErrors,
  FETCH_MOVEMENTS_ERRORS,
  ERROR_MESSAGES,
  CREATE_OUTFLOW_ERRORS,
} from '@/utils/errorHandlers';

import { AuthContext } from '@/contexts/auth';

import { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';

import type { CancelTokenSource } from 'axios';
import type {
  MovimentoFinanceiro,
  RelatorioFinanceiro,
  SaidaFinanceiraPayload,
} from '@/@types/financeiro';

interface CreateSaidaParams {
  payload: SaidaFinanceiraPayload;
  signal?: AbortSignal;
}

// Criar hook para poder usar o contexto
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export function useFinanceiro() {
  // Buscar token do contexto
  const { token } = useAuth();

  // Estados
  const [movimentacoes, setMovimentacoes] = useState<MovimentoFinanceiro[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Listar todas as movimentações financeiras
  const fetchMovimentacoesFinanceiras = useCallback(
    async (cancelToken?: CancelTokenSource) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/financeiro/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cancelToken: cancelToken?.token,
        });

        if (response.status === 200) {
          console.log(
            'Lista de movimentações financeiras retornada com sucesso:'
          );
          setMovimentacoes(response.data);
        } else {
          setError({ message: ERROR_MESSAGES.INVALID_RESPONSE });
          setMovimentacoes([]);
        }
      } catch (err) {
        // Criar o mapa de handlers para esta operação
        const errorHandlerMap = createErrorHandlerMap(FETCH_MOVEMENTS_ERRORS);

        // Usar a função helper para tratar erros comuns
        handleCommonErrors(err, errorHandlerMap, setError, () =>
          setMovimentacoes([])
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Buscar movimentações financeiras quando o componente for montado
  useEffect(() => {
    const cancelToken = axios.CancelToken.source(); // permitir o cancelamento da requisição caso o componente seja desmontado antes da resposta, evitando vazamento de memória ou tentativas de atualização de estado em componentes desmontados.
    fetchMovimentacoesFinanceiras(cancelToken);

    return () => cancelToken.cancel('Requisição cancelada pelo componente.');
  }, [fetchMovimentacoesFinanceiras]);

  // Gerar relatório financeiro do dia de hoje
  const fetchRelatorioFinanceiro = useCallback(
    async (cancelToken?: CancelTokenSource) => {
      setLoading(true);
      setError(null);

      try {
        const { dataInicio, dataFim } = getTodayDateRange();

        const response = await api.get(
          `/financeiro/relatorio/?dataInicio=${dataInicio}&dataFim=${dataFim}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cancelToken: cancelToken?.token,
          }
        );

        if (response.status === 200) {
          console.log('Relatório financeiro do dia gerado com sucesso:');
          setRelatorio(response.data);
        } else {
          setError({ message: ERROR_MESSAGES.INVALID_RESPONSE });
          setRelatorio(null);
        }
      } catch (err) {
        // Criar o mapa de handlers para esta operação
        const errorHandlerMap = createErrorHandlerMap(FETCH_MOVEMENTS_ERRORS);

        // Usar a função helper para tratar erros comuns
        handleCommonErrors(err, errorHandlerMap, setError, () =>
          setRelatorio(null)
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Gerar relatório financeiro por periodo
  const fetchRelatorioFinanceiroComPeriodo = useCallback(
    async ({
      dataInicial,
      dataFinal,
      cancelToken,
    }: {
      dataInicial: string;
      dataFinal: string;
      cancelToken?: CancelTokenSource;
    }) => {
      try {
        // CORREÇÃO: Converter formato de data de YYYY-MM-DD para YYYY/MM/DD
        const converterFormatoData = (data: string) => {
          return data.replace(/-/g, '/');
        };

        const dataInicioAPI = converterFormatoData(dataInicial);
        const dataFimAPI = converterFormatoData(dataFinal);

        const response = await api.get(
          `/financeiro/relatorio/?dataInicio=${dataInicioAPI}&dataFim=${dataFimAPI}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cancelToken: cancelToken?.token,
          }
        );

        if (response.status === 200) {
          console.log('Relatório financeiro por periodo:', response.data);
          return response.data; // RETORNA os dados
        } else {
          setError({ message: ERROR_MESSAGES.INVALID_RESPONSE });
          return null;
        }
      } catch (err) {
        // Criar o mapa de handlers para esta operação
        const errorHandlerMap = createErrorHandlerMap(FETCH_MOVEMENTS_ERRORS);

        // Usar a função helper para tratar erros comuns
        handleCommonErrors(err, errorHandlerMap, setError, () =>
          setRelatorio(null)
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Gera uma nova saída
  const createSaida = useCallback(
    async ({ payload, signal }: CreateSaidaParams) => {
      setLoading(true);

      try {
        const response = await api.post(
          '/financeiro/saida',
          {
            ...payload,
            metodoPagamento: payload.metodoPagamento.toUpperCase(),
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        if (response.status === 201) {
          console.log(
            'Saída financeira registrada com sucesso: R$',
            response.data.valor
          );
          await fetchMovimentacoesFinanceiras();
          await fetchRelatorioFinanceiro();
          return response.data;
        } else {
          setError({ message: ERROR_MESSAGES.INVALID_RESPONSE });
        }
      } catch (err) {
        const errorHandlerMap = createErrorHandlerMap(CREATE_OUTFLOW_ERRORS);
        handleCommonErrors(
          err,
          errorHandlerMap,
          setError,
          () => {} // Função vazia porque não precisamos limpar dados específicos
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoesFinanceiras, fetchRelatorioFinanceiro, token]
  );

  return {
    createSaida,
    setMovimentacoes,
    movimentacoes,
    relatorio,
    loading,
    error,
    fetchMovimentacoesFinanceiras,
    fetchRelatorioFinanceiro,
    fetchRelatorioFinanceiroComPeriodo,
  };
}

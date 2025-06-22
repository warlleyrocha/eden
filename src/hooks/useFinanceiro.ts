import { api } from '@/services/api';
import { getTodayDateRange } from '@/utils/date';
import { getStoreId } from '@/utils/getStoreId';
import { useEffect, useState, useCallback } from 'react';
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

type ApiError = {
  message: string;
  status?: number;
};

const handleApiError = (err: unknown): ApiError => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ?? err.message ?? 'Erro desconhecido';

    if (status === 401)
      return { message: 'Não autorizado. Faça login novamente.', status };
    if (status === 404) return { message: 'Endpoint não encontrado.', status };
    if (status === 500) return { message: 'Erro interno do servidor.', status };

    return { message, status };
  }
  return { message: 'Erro desconhecido ao processar a requisição.' };
};

const getAuthToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Usuário não autenticado: token não encontrado.');
  }
  return token;
};

export function useFinanceiro() {
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
        const token = getAuthToken();

        const response = await api.get('/financeiro/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cancelToken: cancelToken?.token,
        });

        if (response.status === 200) {
          console.log(
            'Lista de movimentações financeiras retornada com sucesso:',
            response.data
          );
          setMovimentacoes(response.data);
        } else {
          setError({ message: 'Resposta inválida da API.' });
          setMovimentacoes([]);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === 'Usuário não autenticado: token não encontrado.'
        ) {
          setError({
            message:
              'Usuário não autenticado. Por favor, faça login novamente.',
          });
          // Aqui você pode adicionar lógica para redirecionar para login, se quiser
        } else if (!axios.isCancel(err)) {
          if (axios.isAxiosError(err) && err.response) {
            switch (err.response.status) {
              case 400:
                setError({
                  message: 'Erro ao listar movimentações financeiras.',
                });
                break;
              case 404:
                setError({ message: 'Loja não encontrada.' });
                break;
              case 500:
                setError({ message: 'Erro interno do servidor.' });
                break;
              default:
                setError(handleApiError(err));
            }
          } else {
            setError(handleApiError(err));
          }
          setMovimentacoes([]);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    fetchMovimentacoesFinanceiras(cancelToken);

    return () => cancelToken.cancel('Requisição cancelada pelo componente.');
  }, [fetchMovimentacoesFinanceiras]);

  // Gerar relatório financeiro
  const fetchRelatorioFinanceiro = useCallback(
    async (cancelToken?: CancelTokenSource) => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        const lojaId = getStoreId();
        if (!lojaId) {
          setError({ message: 'Loja não encontrada.' });
          setLoading(false);
          return;
        }

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
          console.log(
            'Relatório financeiro do dia gerado com sucesso:',
            response.data
          );
          setRelatorio(response.data);
        } else {
          setError({ message: 'Resposta inválida da API.' });
          setRelatorio(null);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === 'Usuário não autenticado: token não encontrado.'
        ) {
          setError({
            message:
              'Usuário não autenticado. Por favor, faça login novamente.',
          });
          // Aqui você pode adicionar lógica para redirecionar para login, se quiser
        } else if (!axios.isCancel(err)) {
          if (axios.isAxiosError(err) && err.response) {
            switch (err.response.status) {
              case 400:
                setError({
                  message: 'Erro ao gerar relatório financeiro.',
                });
                break;
              case 404:
                setError({ message: 'Loja não encontrada.' });
                break;
              case 500:
                setError({ message: 'Erro interno do servidor.' });
                break;
              default:
                setError(handleApiError(err));
            }
          } else {
            setError(handleApiError(err));
          }
          setRelatorio(null);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
        const token = getAuthToken();
        const lojaId = getStoreId();

        if (!lojaId) {
          throw new Error('Loja não encontrada.');
        }

        // CORREÇÃO: Converter formato de data de YYYY-MM-DD para YYYY/MM/DD
        const converterFormatoData = (data: string) => {
          return data.replace(/-/g, '/');
        };

        const dataInicioAPI = converterFormatoData(dataInicial);
        const dataFimAPI = converterFormatoData(dataFinal);

        console.log('Conversão de formato:', {
          original: { dataInicial, dataFinal },
          convertido: { dataInicioAPI, dataFimAPI },
        });

        const response = await api.get(
          `/financeiro/relatorio/?dataInicio=${dataInicioAPI}&dataFim=${dataFimAPI}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cancelToken: cancelToken?.token,
          }
        );

        // LOG DA RESPOSTA COMPLETA
        console.log('Resposta completa da API:', {
          status: response.status,
          data: response.data,
          headers: response.headers,
        });

        if (response.status === 200) {
          console.log('Relatório financeiro por periodo:', response.data);
          return response.data; // RETORNA os dados
        } else {
          throw new Error('Resposta inválida da API.');
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === 'Usuário não autenticado: token não encontrado.'
        ) {
          throw new Error(
            'Usuário não autenticado. Por favor, faça login novamente.'
          );
        } else if (!axios.isCancel(err)) {
          if (axios.isAxiosError(err) && err.response) {
            switch (err.response.status) {
              case 400:
                throw new Error('Erro ao gerar relatório financeiro.');
              case 404:
                throw new Error('Loja não encontrada.');
              case 500:
                throw new Error('Erro interno do servidor.');
              default:
                throw new Error(
                  err.response.data?.message ?? 'Erro desconhecido'
                );
            }
          } else {
            throw err;
          }
        }
        throw err;
      }
    },
    []
  );

  const createSaida = useCallback(
    async ({ payload, signal }: CreateSaidaParams) => {
      const token = getAuthToken();
      console.log('Registrando saída financeira com dados:', payload);

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
            'Saída financeira registrada com sucesso:',
            response.data
          );
          await fetchMovimentacoesFinanceiras();
          await fetchRelatorioFinanceiro();
          return response.data;
        } else {
          setError({ message: 'Resposta inválida da API.' });
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === 'Usuário não autenticado: token não encontrado.'
        ) {
          setError({
            message:
              'Usuário não autenticado. Por favor, faça login novamente.',
          });
        } else if (!axios.isCancel(err)) {
          if (axios.isAxiosError(err) && err.response) {
            switch (err.response.status) {
              case 400:
                setError({
                  message: 'Erro ao registrar saída financeira.',
                });
                break;
              case 404:
                setError({ message: 'Loja não encontrada.' });
                break;
              case 500:
                setError({ message: 'Erro interno do servidor.' });
                break;
              default:
                setError(handleApiError(err));
            }
          } else {
            setError(handleApiError(err));
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchMovimentacoesFinanceiras, fetchRelatorioFinanceiro]
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

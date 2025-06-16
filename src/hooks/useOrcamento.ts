import { useEffect, useState, useCallback } from 'react';
import { getStoreId } from '@/utils/getStoreId';
import { api } from '@/services/api';
import axios from 'axios';
import type { AxiosError } from 'axios';
import type { Orcamento, CreateOrcamento } from '@/@types/orcamento';
import { toast } from 'sonner';

type ApiError = {
  message: string;
  status?: number;
};

interface CreateOrcamentoParams {
  payload: CreateOrcamento;
  signal?: AbortSignal;
}

function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

const getAuthToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Usuário não autenticado: token não encontrado.');
  }
  return token;
};

export function useOrcamento() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleApiError = (err: unknown): ApiError => {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 404) return { message: 'Loja não encontrada.', status };
      if (status && status >= 500)
        return { message: 'Erro no servidor.', status };
      return {
        message: err.message || 'Erro inesperado ao buscar orçamentos.',
        status,
      };
    }
    return { message: 'Erro inesperado ao buscar orçamentos.' };
  };

  const fetchOrcamentos = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const lojaId = getStoreId();

      if (!lojaId) {
        setError({ message: 'ID da loja não encontrado no localStorage' });
        return;
      }

      const response = await api.get(`/orcamentos/loja/${lojaId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setOrcamentos(response.data);
      } else {
        setError({ message: 'Resposta inválida da API.' });
        setOrcamentos([]);
      }
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' || err.name === 'AbortError')
      )
        return; // Ignore cancel errors
      if (
        err instanceof Error &&
        err.message === 'Usuário não autenticado: token não encontrado.'
      ) {
        setError({
          message: 'Usuário não autenticado. Por favor, faça login novamente.',
        });
      } else {
        setError(handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrcamentos(controller.signal);
    return () => controller.abort();
  }, [fetchOrcamentos]);

  const createOrcamento = useCallback(
    async ({ payload, signal }: CreateOrcamentoParams) => {
      const token = getAuthToken();
      console.log('Criando orçamento com dados:', payload);
      try {
        const response = await api.post('/orcamentos', payload, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });
        await fetchOrcamentos();
        toast.success('Orçamento criado com sucesso!');
        return response.data;
      } catch (err) {
        if (
          err instanceof Error &&
          err.message === 'Usuário não autenticado: token não encontrado.'
        ) {
          setError({
            message:
              'Usuário não autenticado. Por favor, faça login novamente.',
          });
          throw err;
        }
        const apiError = handleApiError(err);
        setError(apiError);
        throw apiError;
      }
    },
    [fetchOrcamentos]
  );

  const patchOrcamento = async (
    orcamentoId: string,
    data: Partial<Orcamento>
  ) => {
    const token = getAuthToken();
    try {
      const response = await api.patch(`/orcamentos/${orcamentoId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Atualiza a lista após sucesso
      await fetchOrcamentos();
      return response.data;
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'Usuário não autenticado: token não encontrado.'
      ) {
        setError({
          message: 'Usuário não autenticado. Por favor, faça login novamente.',
        });
        // Também pode fazer logout ou redirecionar aqui
        throw err;
      }

      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  };

  const deleteOrcamento = async (id: string) => {
    const token = getAuthToken();
    try {
      await api.delete(`/orcamentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Atualiza a lista após sucesso
      await fetchOrcamentos();
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === 'Usuário não autenticado: token não encontrado.'
      ) {
        setError({
          message: 'Usuário não autenticado. Por favor, faça login novamente.',
        });
        throw err;
      }
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    }
  };

  const getOrcamentoById = useCallback(
    async (id: string, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();

        const response = await api.get(`/orcamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });

        if (response.status === 200) {
          console.log('Orçamento recebido:', response.data);
          return response.data; // Retorna o orçamento encontrado
        } else {
          setError({ message: 'Resposta inválida da API.' });
          return null;
        }
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          (err.name === 'CanceledError' || err.name === 'AbortError')
        )
          return;
        if (
          err instanceof Error &&
          err.message === 'Usuário não autenticado: token não encontrado.'
        ) {
          setError({
            message:
              'Usuário não autenticado. Por favor, faça login novamente.',
          });
        } else {
          setError(handleApiError(err));
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    orcamentos,
    loading,
    error,
    createOrcamento,
    patchOrcamento,
    deleteOrcamento,
    fetchOrcamentos,
    getOrcamentoById,
    refetch: fetchOrcamentos,
  };
}

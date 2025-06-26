import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import { getStoreId } from '@/utils/getStoreId';
import type { Client } from '@/@types/clients'; // Certifique-se de que o tipo Client está definido corretamente
import type { AxiosError } from 'axios';
import axios from 'axios';
import { toast } from 'sonner';

type ApiError = {
  message: string;
  status?: number;
};

function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export function useClients() {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
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

  const hasFetchedRef = useRef(false);

  // Listar todos os clientes de uma loja
  const fetchClients = useCallback(async (signal?: AbortSignal) => {
    try {
      const lojaId = getStoreId();
      if (!lojaId) {
        alert('ID da loja não encontrado no localStorage');
        return;
      }

      setLoading(true);
      const response = await api.get(`/clientes/loja/${lojaId}`, {
        signal,
      });

      setClients(response.data ?? []);
      setError(null);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' || err.name === 'AbortError')
      )
        return;

      console.error('Erro ao buscar clientes:', err);
      setError({ message: 'Erro ao buscar clientes' });
    } finally {
      setLoading(false);
      hasFetchedRef.current = true; // Marca que já buscou os clientes
    }
  }, []);

  // Buscar cliente por ID
  const fetchClientsById = async (id: string, controller?: AbortController) => {
    setLoading(true);
    setError(null);

    try {
      const token = getStoreId();

      if (!token) {
        alert('ID da loja não encontrado no localStorage');
        return;
      }

      const response = await api.get(`/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller?.signal,
      });

      if (response.status === 200) {
        console.log('Cliente recebido:', response.data);
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
          message: 'Usuário não autenticado. Por favor, faça login novamente.',
        });
      } else {
        setError(handleApiError(err));
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar clientes ao montar o componente
  useEffect(() => {
    const controller = new AbortController();
    fetchClients(controller.signal);
    return () => controller.abort();
  }, [fetchClients]);

  // Atualizar dados de um cliente
  const updateClients = useCallback(
    async (clientId: string, updatedData: Partial<Client>) => {
      const lojaId = getStoreId();
      console.log('Atualizando cliente com ID:', clientId);
      console.log('Dados para atualização:', updatedData);

      if (!lojaId) {
        console.warn('ID da loja não encontrado no localStorage');
        return;
      }

      if (!clientId) {
        console.warn('ID do cliente é obrigatório para atualização');
        return;
      }

      const payload = {
        id: clientId,
        lojaId,
        ...updatedData,
      };

      if (Object.keys(payload).length === 0) {
        console.warn('Nenhum dado válido fornecido para atualização');
        return;
      }

      console.log('Payload para atualização:', payload);

      setLoading(true);
      setError(null);
      try {
        const response = await api.patch(`/clientes/${clientId}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          console.log('Produto atualizado com sucesso:', response.data);
          await fetchClients();
        }
        return response;
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        setError(null);
      } finally {
        setLoading(false);
      }
    },
    [fetchClients]
  );

  // Remover um cliente por ID
  const deleteClient = async (clientId: string) => {
    const lojaId = getStoreId();

    if (!lojaId) {
      alert('ID da loja não encontrado');
      return;
    }

    try {
      setLoading(true);

      const response = await api.delete(`/clientes/${clientId}`);

      if (response.status === 200) {
        toast.success('Cliente removido com sucesso');
        await fetchClients();
        setError(null);
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const status = error.response?.status;

        switch (status) {
        case 400:
          alert('ID inválido');
          break;
        case 404:
          alert('Cliente não encontrado');
          break;
        case 500:
          alert('Erro interno do servidor');
          break;
        default:
          alert('Erro desconhecido ao remover cliente');
          break;
        }

        setError({
          message: error.message,
          status,
        });
      } else {
        alert('Erro inesperado');
        setError({ message: 'Erro desconhecido ao remover cliente' });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    clients,
    error,
    fetchClients,
    fetchClientsById,
    updateClients,
    deleteClient,
  };
}

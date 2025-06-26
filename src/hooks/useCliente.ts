import { useState, useEffect, useCallback } from 'react';
import { clientsAPI } from '@/services/cliente.api';
import { toast } from 'sonner';
import type { Client } from '@/@types/clients';

export function useClients() {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Listar todos os clientes da loja
  const fetchClients = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await clientsAPI.fetchClients(signal);
      setClients(data);
      setError(null);
    } catch (error) {
      if (!signal?.aborted) {
        setError(error as Error);
        toast.error('Erro ao carregar clientes');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar cliente por ID (não armazena no estado, retorna diretamente)
  const fetchClientsById = useCallback(
    async (id: string, signal?: AbortSignal) => {
      setLoading(true);
      try {
        const client = await clientsAPI.getClientById({ id, signal });
        setError(null);
        return client;
      } catch (error) {
        if (!signal?.aborted) {
          setError(error as Error);
          toast.error('Erro ao buscar cliente');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Atualizar cliente
  const updateClient = useCallback(
    async (id: string, data: Partial<Client>) => {
      setLoading(true);
      try {
        const updatedClient = await clientsAPI.updateClient({
          id,
          payload: data,
        });
        await fetchClients(); // Atualiza a lista
        toast.success('Cliente atualizado com sucesso!');
        return updatedClient;
      } catch (error) {
        setError(error as Error);
        toast.error('Erro ao atualizar cliente');
        throw error; // Permite tratamento adicional no componente
      } finally {
        setLoading(false);
      }
    },
    [fetchClients]
  );

  // Deletar cliente
  const deleteClient = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await clientsAPI.deleteClient({ id });
        await fetchClients(); // Atualiza a lista
        toast.success('Cliente removido com sucesso!');
      } catch (error) {
        setError(error as Error);
        toast.error('Erro ao remover cliente');
        throw error; // Permite tratamento adicional no componente
      } finally {
        setLoading(false);
      }
    },
    [fetchClients]
  );

  // Carrega os clientes inicialmente
  useEffect(() => {
    const controller = new AbortController();
    fetchClients(controller.signal);
    return () => controller.abort();
  }, [fetchClients]);

  return {
    loading,
    clients,
    error,
    fetchClients,
    fetchClientsById,
    updateClient,
    deleteClient,
  };
}

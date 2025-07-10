import { useState, useEffect, useCallback, useContext } from 'react';
import { clientsAPI } from '@/services/cliente.api';
import { ClientContext } from '@/contexts/client/client.context';
import { toast } from 'sonner';
import type { Client } from '@/@types/clients';

export function useClients() {
  const context = useContext(ClientContext);

  if (!context)
    throw new Error('useClientContext must be used within ClientProvider');

  const { selectedClient, setSelectedClient } = context;

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

  const selectClient = useCallback(
    (client: Client | null) => {
      setSelectedClient(client);
    },
    [setSelectedClient]
  );

  // Buscar e selecionar cliente por ID
  const selectClientById = useCallback(
    async (id: string, signal?: AbortSignal) => {
      const client = await fetchClientsById(id, signal);
      if (client) {
        selectClient(client);
      }
      return client;
    },
    [fetchClientsById, selectClient]
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
        // Se o cliente atualizado é o selecionado, atualiza o contexto
        if (selectedClient?.id === id) {
          setSelectedClient(updatedClient);
        }
        toast.success('Cliente atualizado com sucesso!', {
          description: 'As informações do cliente foram atualizadas.',
          duration: 2000,
          position: 'bottom-right',
          richColors: true,
        });
        return updatedClient;
      } catch (error) {
        setError(error as Error);
        toast.error('Erro ao atualizar cliente');
        throw error; // Permite tratamento adicional no componente
      } finally {
        setLoading(false);
      }
    },
    [fetchClients, selectedClient, setSelectedClient]
  );

  // Deletar cliente
  const deleteClient = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await clientsAPI.deleteClient({ id });
        if (selectedClient?.id === id) {
          setSelectedClient(null);
        }
        await fetchClients(); // Atualiza a lista

        toast.success('Cliente removido com sucesso!', {
          description: 'O cliente foi removido da lista.',
          duration: 2000,
          position: 'bottom-right',
          richColors: true,
        });
      } catch (error) {
        setError(error as Error);
        toast.error('Erro ao remover cliente');
        throw error; // Permite tratamento adicional no componente
      } finally {
        setLoading(false);
      }
    },
    [fetchClients, selectedClient, setSelectedClient]
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
    selectedClient,
    setSelectedClient,
    selectClient,
    selectClientById,
    clearSelection: () => setSelectedClient(null),
  };
}

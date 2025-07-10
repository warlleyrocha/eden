import { api } from '@/services/api';
import { getStoreId } from '@/utils/getStoreId';
import {
  handleApiError,
  createErrorHandlerMap,
  ERROR_MESSAGES,
  FETCH_CLIENTS_ERRORS,
  FETCH_CLIENT_BY_ID_ERRORS,
  CREATE_CLIENT_ERRORS,
  UPDATE_CLIENT_ERRORS,
  DELETE_CLIENT_ERRORS,
} from '@/utils/errorHandler';

import type { Client, CreateClient } from '@/@types/clients';

// Interfaces para os parâmetros
interface GetClientByIdParams {
  id: string;
  signal?: AbortSignal;
}

interface CreateClientParams {
  payload: CreateClient;
  signal?: AbortSignal;
}

interface UpdateClientParams {
  id: string;
  payload: Partial<Client>;
  signal?: AbortSignal;
}

interface DeleteClientParams {
  id: string;
  signal?: AbortSignal;
}

// Criar handlers específicos
const fetchClientsErrorHandler = createErrorHandlerMap(FETCH_CLIENTS_ERRORS);
const fetchClientByIdErrorHandler = createErrorHandlerMap(
  FETCH_CLIENT_BY_ID_ERRORS
);
const createClientErrorHandler = createErrorHandlerMap(CREATE_CLIENT_ERRORS);
const updateClientErrorHandler = createErrorHandlerMap(UPDATE_CLIENT_ERRORS);
const deleteClientErrorHandler = createErrorHandlerMap(DELETE_CLIENT_ERRORS);

export const clientsAPI = {
  // Buscar todos os clientes da loja
  async fetchClients(signal?: AbortSignal): Promise<Client[]> {
    try {
      const lojaId = getStoreId();
      if (!lojaId) throw new Error(ERROR_MESSAGES.NOT_FOUND_STORE);

      const response = await api.get(`/clientes/loja/${lojaId}`, { signal });

      return response.data ?? [];
    } catch (error) {
      const apiError = handleApiError(error, fetchClientsErrorHandler);
      console.error('Erro ao buscar clientes:', apiError);
      throw apiError;
    }
  },

  // Buscar cliente por ID
  async getClientById({ id, signal }: GetClientByIdParams): Promise<Client> {
    try {
      const response = await api.get(`/clientes/${id}`, { signal });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error, fetchClientByIdErrorHandler);
      console.error('Erro ao buscar cliente:', apiError);
      throw apiError;
    }
  },

  // Criar novo cliente
  async createClient({ payload, signal }: CreateClientParams): Promise<Client> {
    try {
      const response = await api.post(`/clientes/${payload.lojaId}`, payload, {
        signal,
        headers: { 'Content-Type': 'application/json' },
      });

      return response.data;
    } catch (error) {
      const apiError = handleApiError(error, createClientErrorHandler);
      console.error('Erro ao criar cliente:', apiError);
      throw apiError;
    }
  },

  // Atualizar cliente existente
  async updateClient({
    id,
    payload,
    signal,
  }: UpdateClientParams): Promise<Client> {
    try {
      const response = await api.patch(`/clientes/${id}`, payload, {
        signal,
        headers: { 'Content-Type': 'application/json' },
      });

      return response.data;
    } catch (error) {
      const apiError = handleApiError(error, updateClientErrorHandler);
      console.error('Erro ao atualizar cliente:', apiError);
      throw apiError;
    }
  },

  // Deletar cliente
  async deleteClient({ id, signal }: DeleteClientParams): Promise<void> {
    try {
      await api.delete(`/clientes/${id}`, { signal });
    } catch (error) {
      const apiError = handleApiError(error, deleteClientErrorHandler);
      console.error('Erro ao deletar cliente:', apiError);
      throw apiError;
    }
  },
};

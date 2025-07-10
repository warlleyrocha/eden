import { api } from '@/services/api';
import { getStoreId } from '@/utils/getStoreId';
import { toast } from 'sonner';

import {
  handleApiError,
  createErrorHandlerMap,
  FETCH_BUDGETS_ERRORS,
  FETCH_BUDGET_BY_ID_ERRORS,
  CREATE_BUDGET_ERRORS,
  UPDATE_BUDGET_ERRORS,
  DELETE_BUDGET_ERRORS,
  ERROR_MESSAGES,
} from '@/utils/errorHandler';

import type { Orcamento, CreateOrcamento } from '@/@types/orcamento';

interface CreateOrcamentoParams {
  payload: CreateOrcamento;
  signal?: AbortSignal;
}

interface UpdateOrcamentoParams {
  id: string;
  payload: Partial<Orcamento>;
  signal?: AbortSignal;
}

interface DeleteOrcamentoParams {
  id: string;
  signal?: AbortSignal;
}

interface GetOrcamentoByIdParams {
  id: string;
  signal?: AbortSignal;
}

const getAuthToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error(ERROR_MESSAGES.TOKEN_NOT_FOUND);
  }
  return token;
};

// Criar error handlers específicos para cada operação
const fetchBudgetsErrorHandler = createErrorHandlerMap(FETCH_BUDGETS_ERRORS);
const fetchBudgetByIdErrorHandler = createErrorHandlerMap(
  FETCH_BUDGET_BY_ID_ERRORS
);
const createBudgetErrorHandler = createErrorHandlerMap(CREATE_BUDGET_ERRORS);
const updateBudgetErrorHandler = createErrorHandlerMap(UPDATE_BUDGET_ERRORS);
const deleteBudgetErrorHandler = createErrorHandlerMap(DELETE_BUDGET_ERRORS);

export const orcamentoAPI = {
  // Buscar todos os orçamentos da loja
  async fetchOrcamentos(signal?: AbortSignal): Promise<Orcamento[]> {
    try {
      const token = getAuthToken();
      const lojaId = getStoreId();

      if (!lojaId) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND_STORE);
      }

      const response = await api.get(`/orcamentos/loja/${lojaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200) {
        return Array.isArray(response.data) ? response.data : [];
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, fetchBudgetsErrorHandler);
      console.error('Erro ao buscar orçamentos:', apiError);
      throw apiError;
    }
  },

  // Buscar orçamento por ID
  async getOrcamentoById({
    id,
    signal,
  }: GetOrcamentoByIdParams): Promise<Orcamento> {
    try {
      const token = getAuthToken();

      const response = await api.get(`/orcamentos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, fetchBudgetByIdErrorHandler);
      console.error('Erro ao buscar orçamento por ID:', apiError);
      throw apiError;
    }
  },

  // Criar novo orçamento
  async createOrcamento({
    payload,
    signal,
  }: CreateOrcamentoParams): Promise<Orcamento> {
    try {
      const token = getAuthToken();

      const response = await api.post('/orcamentos', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 201) {
        toast.success('Orçamento criado com sucesso!', {
          description: `Orçamento de ${response.data.cliente.nome} criado com sucesso!`,
          duration: 2000,
          position: 'bottom-right',
          richColors: true,
        });
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, createBudgetErrorHandler);
      console.error('Erro ao criar orçamento:', apiError);
      throw apiError;
    }
  },

  // Atualizar orçamento existente
  async updateOrcamento({
    id,
    payload,
    signal,
  }: UpdateOrcamentoParams): Promise<Orcamento> {
    try {
      const token = getAuthToken();

      const response = await api.patch(`/orcamentos/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200) {
        toast.success('Orçamento aprovado com sucesso!', {
          description: `Orçamento de ${response.data.cliente.nome} aprovado com sucesso!`,
          duration: 2000,
          position: 'bottom-right',
          richColors: true,
        });
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, updateBudgetErrorHandler);
      console.error('Erro ao atualizar orçamento:', apiError);
      throw apiError;
    }
  },

  // Deletar orçamento
  async deleteOrcamento({ id, signal }: DeleteOrcamentoParams): Promise<void> {
    try {
      const token = getAuthToken();

      const response = await api.delete(`/orcamentos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200 || response.status === 204) {
        toast.success('Orçamento deletado com sucesso!', {
          duration: 2000,
          position: 'bottom-right',
          richColors: true,
        });
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, deleteBudgetErrorHandler);
      console.error('Erro ao deletar orçamento:', apiError);
      throw apiError;
    }
  },
};

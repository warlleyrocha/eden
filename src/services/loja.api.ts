import { api } from '@/services/api';
import { getStoreId } from '@/utils/getStoreId';

import {
  handleApiError,
  createErrorHandlerMap,
  ERROR_MESSAGES,
} from '@/utils/errorHandler';

export interface StoreData {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  subTitulo: string;
}

// Definir erros específicos para lojas
const FETCH_STORE_ERRORS = {
  NOT_FOUND: 'Loja não encontrada',
  UNAUTHORIZED: 'Acesso não autorizado',
  DEFAULT: 'Erro ao buscar dados da loja',
};

// Criar handler de erro específico
const fetchStoreErrorHandler = createErrorHandlerMap(FETCH_STORE_ERRORS);

export const storeAPI = {
  async fetchStoreData(signal?: AbortSignal): Promise<StoreData> {
    try {
      const lojaId = getStoreId();
      if (!lojaId) throw new Error(ERROR_MESSAGES.NOT_FOUND_STORE);

      const response = await api.get(`/lojas/${lojaId}`, { signal });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error, fetchStoreErrorHandler);
      console.error('Erro ao buscar dados da loja:', apiError);
      throw apiError;
    }
  },
};

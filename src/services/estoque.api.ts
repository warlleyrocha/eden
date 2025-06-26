import { api } from '@/services/api';
import { getStoreId } from '@/utils/getStoreId';
import { toast } from 'sonner';

import {
  handleApiError,
  createErrorHandlerMap,
  FETCH_PRODUCTS_ERRORS,
  CREATE_PRODUCT_ERRORS,
  UPDATE_PRODUCT_ERRORS,
  DELETE_PRODUCT_ERRORS,
  ERROR_MESSAGES,
} from '@/utils/errorHandler';

import type {
  Produto,
  ProductInputPayload,
  ProductUpdatePayload,
} from '@/@types/product';

// Error maps seguindo o padrão do errorHandler.ts

interface StockReportResponse {
  produtos: Produto[];
  totalProdutos: number;
  quantidadeTotal: number;
  valorTotal: number;
}

interface CreateProductParams {
  payload: Omit<ProductInputPayload, 'lojaId'>;
  signal?: AbortSignal;
}

interface UpdateProductParams {
  id: string;
  payload: Partial<ProductUpdatePayload>;
  signal?: AbortSignal;
}

interface DeleteProductParams {
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
const fetchProductsErrorHandler = createErrorHandlerMap(FETCH_PRODUCTS_ERRORS);
const createProductErrorHandler = createErrorHandlerMap(CREATE_PRODUCT_ERRORS);
const updateProductErrorHandler = createErrorHandlerMap(UPDATE_PRODUCT_ERRORS);
const deleteProductErrorHandler = createErrorHandlerMap(DELETE_PRODUCT_ERRORS);

export const estoqueAPI = {
  // Buscar relatório de produtos da loja
  async fetchProducts(signal?: AbortSignal): Promise<StockReportResponse> {
    try {
      const token = getAuthToken();
      const lojaId = getStoreId();

      if (!lojaId) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND_STORE);
      }

      const response = await api.get(`/produtos/relatorio/${lojaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200) {
        console.log(
          'Relatório de produtos retornado com sucesso:',
          response.data
        );

        const { produtos, totalProdutos, quantidadeTotal, valorTotal } =
          response.data;

        return {
          produtos: Array.isArray(produtos) ? produtos : [],
          totalProdutos: totalProdutos ?? 0,
          quantidadeTotal: quantidadeTotal ?? 0,
          valorTotal: valorTotal ?? 0,
        };
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, fetchProductsErrorHandler);
      console.error('Erro ao buscar produtos:', apiError);
      throw apiError;
    }
  },

  // Criar novo produto
  async createProduct({
    payload,
    signal,
  }: CreateProductParams): Promise<Produto> {
    try {
      const token = getAuthToken();
      const lojaId = getStoreId();

      if (!lojaId) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND_STORE);
      }

      const productPayload: ProductInputPayload = {
        ...payload,
        lojaId,
      };

      console.log('Criando produto com dados:', productPayload);

      const response = await api.post('/produtos', productPayload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 201) {
        console.log('Produto criado com sucesso:', response.data);
        toast.success('Produto adicionado com sucesso!');
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, createProductErrorHandler);
      console.error('Erro ao criar produto:', apiError);
      throw apiError;
    }
  },

  // Atualizar produto existente
  async updateProduct({
    id,
    payload,
    signal,
  }: UpdateProductParams): Promise<Produto> {
    try {
      const token = getAuthToken();
      const lojaId = getStoreId();

      if (!lojaId) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND_STORE);
      }

      if (!id) {
        throw new Error('ID do produto é obrigatório para atualização');
      }

      console.log('Atualizando produto com ID:', id);
      console.log('Dados para atualização:', payload);

      // Filtrar campos undefined/null
      const filteredUpdates = Object.fromEntries(
        Object.entries(payload).filter(
          ([, value]) => value !== undefined && value !== null
        )
      );

      // Transformar quantidadeInicial em estoque (mantendo lógica original)
      if ('quantidadeInicial' in filteredUpdates) {
        filteredUpdates.estoque = filteredUpdates.quantidadeInicial;
        delete filteredUpdates.quantidadeInicial;
      }

      const updatePayload = {
        id,
        lojaId,
        ...filteredUpdates,
      };

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('Nenhum dado válido fornecido para atualização');
      }

      console.log('Payload para atualização:', updatePayload);

      const response = await api.patch(`/produtos/${id}`, updatePayload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200) {
        console.log('Produto atualizado com sucesso:', response.data);
        toast.success('Produto atualizado com sucesso!');
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, updateProductErrorHandler);
      console.error('Erro ao atualizar produto:', apiError);
      throw apiError;
    }
  },

  // Deletar produto
  async deleteProduct({ id, signal }: DeleteProductParams): Promise<void> {
    try {
      const token = getAuthToken();

      if (!id) {
        throw new Error('ID do produto é obrigatório');
      }

      console.log('Deletando produto com ID:', id);

      const response = await api.delete(`/produtos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200 || response.status === 204) {
        console.log('Produto deletado com sucesso');
        toast.success('Produto deletado com sucesso!');
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, deleteProductErrorHandler);
      console.error('Erro ao deletar produto:', apiError);
      throw apiError;
    }
  },
};

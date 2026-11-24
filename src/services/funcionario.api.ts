import { api } from '@/services/api';
import {
  handleApiError,
  createErrorHandlerMap,
  FETCH_FUNCIONARIOS_ERRORS,
  CREATE_FUNCIONARIO_ERRORS,
  UPDATE_FUNCIONARIO_ERRORS,
  DELETE_FUNCIONARIO_ERRORS,
} from '@/utils/errorHandler';

import type {
  CreateFuncionario,
  Funcionario,
  UpdateFuncionario,
} from '@/@types/funcionario';

// Todas as rotas são só da conta da loja (funcionário recebe 403) e agem
// sobre a loja do token. O token vai pelo interceptor de `api`.

interface CreateFuncionarioParams {
  payload: CreateFuncionario;
  signal?: AbortSignal;
}

interface UpdateFuncionarioParams {
  id: string;
  payload: UpdateFuncionario;
  signal?: AbortSignal;
}

interface DeleteFuncionarioParams {
  id: string;
  signal?: AbortSignal;
}

const fetchFuncionariosErrorHandler = createErrorHandlerMap(
  FETCH_FUNCIONARIOS_ERRORS
);
const createFuncionarioErrorHandler = createErrorHandlerMap(
  CREATE_FUNCIONARIO_ERRORS
);
const updateFuncionarioErrorHandler = createErrorHandlerMap(
  UPDATE_FUNCIONARIO_ERRORS
);
const deleteFuncionarioErrorHandler = createErrorHandlerMap(
  DELETE_FUNCIONARIO_ERRORS
);

/** Garante o formato usado pela tela, qualquer que seja o que a API mande a mais. */
function toFuncionario(data: Record<string, unknown>): Funcionario {
  return {
    id: String(data.id),
    nome: String(data.nome ?? ''),
    email: String(data.email ?? ''),
    lojaId: String(data.lojaId ?? ''),
    permissoes: Array.isArray(data.permissoes) ? data.permissoes : [],
    ativo: data.ativo !== false,
  };
}

export const funcionariosAPI = {
  // Ativos e inativos da loja, por nome
  async fetchFuncionarios(signal?: AbortSignal): Promise<Funcionario[]> {
    try {
      const response = await api.get('/auth/loja/funcionarios', { signal });
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(toFuncionario);
    } catch (error) {
      const apiError = handleApiError(error, fetchFuncionariosErrorHandler);
      if (!signal?.aborted) {
        console.error('Erro ao buscar funcionários:', apiError);
      }
      throw apiError;
    }
  },

  async createFuncionario({
    payload,
    signal,
  }: CreateFuncionarioParams): Promise<Funcionario> {
    try {
      const response = await api.post('/auth/loja/criar-funcionario', payload, {
        signal,
      });
      return toFuncionario(response.data ?? {});
    } catch (error) {
      const apiError = handleApiError(error, createFuncionarioErrorHandler);
      console.error('Erro ao criar funcionário:', apiError);
      throw apiError;
    }
  },

  // `ativo: false` bloqueia o acesso na hora, sem excluir
  async updateFuncionario({
    id,
    payload,
    signal,
  }: UpdateFuncionarioParams): Promise<Funcionario> {
    try {
      const response = await api.patch(
        `/auth/loja/funcionarios/${id}`,
        payload,
        { signal }
      );
      return toFuncionario(response.data ?? {});
    } catch (error) {
      const apiError = handleApiError(error, updateFuncionarioErrorHandler);
      console.error('Erro ao atualizar funcionário:', apiError);
      throw apiError;
    }
  },

  // Exclusão definitiva (204)
  async deleteFuncionario({ id, signal }: DeleteFuncionarioParams): Promise<void> {
    try {
      await api.delete(`/auth/loja/funcionarios/${id}`, { signal });
    } catch (error) {
      const apiError = handleApiError(error, deleteFuncionarioErrorHandler);
      console.error('Erro ao excluir funcionário:', apiError);
      throw apiError;
    }
  },
};

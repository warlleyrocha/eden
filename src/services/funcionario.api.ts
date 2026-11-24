import { api } from '@/services/api';
import {
  handleApiError,
  createErrorHandlerMap,
  ERROR_MESSAGES,
  CREATE_FUNCIONARIO_ERRORS,
} from '@/utils/errorHandler';

import type { CreateFuncionario, Funcionario } from '@/@types/funcionario';

interface CreateFuncionarioParams {
  payload: CreateFuncionario;
  signal?: AbortSignal;
}

const getAuthToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error(ERROR_MESSAGES.TOKEN_NOT_FOUND);
  return token;
};

const createFuncionarioErrorHandler = createErrorHandlerMap(
  CREATE_FUNCIONARIO_ERRORS
);

export const funcionariosAPI = {
  // Criar novo funcionário (a loja é identificada pelo token)
  async createFuncionario({
    payload,
    signal,
  }: CreateFuncionarioParams): Promise<Funcionario> {
    try {
      const token = getAuthToken();
      const response = await api.post('/auth/loja/criar-funcionario', payload, {
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // A API devolve o registro completo do usuário (inclusive o hash da
      // senha); mantém só os campos que a tela usa.
      const data = response.data ?? {};
      return {
        id: data.id,
        nome: data.nome,
        email: data.email,
        lojaId: data.lojaId,
        permissoes: Array.isArray(data.permissoes) ? data.permissoes : [],
        ativo: data.ativo,
      };
    } catch (error) {
      const apiError = handleApiError(error, createFuncionarioErrorHandler);
      console.error('Erro ao criar funcionário:', apiError);
      throw apiError;
    }
  },
};

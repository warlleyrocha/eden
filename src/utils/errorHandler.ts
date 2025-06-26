import axios from 'axios';

export type ApiError = {
  message: string;
  status?: number;
};

// 2. Create error handler maps for different operations
export type ErrorHandler = (error: unknown) => ApiError;

type ErrorMessageMap = Record<number, string>;

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// 1. Centralize error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Usuário não autenticado. Por favor, faça login novamente.',
  NOT_FOUND_STORE: 'Loja não encontrada.',
  NOT_FOUND_ENDPOINT: 'Endpoint não encontrado.',
  SERVER_ERROR: 'Erro interno do servidor.',
  UNKNOWN_ERROR: 'Erro desconhecido ao processar a requisição.',
  INVALID_RESPONSE: 'Resposta inválida da API.',
  TOKEN_NOT_FOUND: 'Usuário não autenticado: token não encontrado.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

// 3. Specific error handlers for each operation
const FETCH_MOVEMENTS_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao listar movimentações financeiras.',
  [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND_STORE,
};

const FETCH_REPORT_ERRORS = {
  400: 'Erro ao gerar relatório financeiro.',
  404: ERROR_MESSAGES.NOT_FOUND_STORE,
};

const CREATE_OUTFLOW_ERRORS = {
  400: 'Erro ao registrar saída financeira.',
  404: ERROR_MESSAGES.NOT_FOUND_STORE,
};

const FETCH_BUDGETS_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao listar orçamentos.',
  [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND_STORE,
};

const FETCH_BUDGET_BY_ID_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao buscar orçamento.',
  [HTTP_STATUS.NOT_FOUND]: 'Orçamento não encontrado.',
};

const CREATE_BUDGET_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao criar orçamento.',
  [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND_STORE,
};

const UPDATE_BUDGET_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao atualizar orçamento.',
  [HTTP_STATUS.NOT_FOUND]: 'Orçamento não encontrado para atualização.',
};

const DELETE_BUDGET_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao deletar orçamento.',
  [HTTP_STATUS.NOT_FOUND]: 'Orçamento não encontrado para exclusão.',
};

const FETCH_PRODUCTS_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao listar produtos.',
  [HTTP_STATUS.NOT_FOUND]: 'Produtos não encontrados.',
  403: 'Sem permissão para acessar produtos.',
};

const CREATE_PRODUCT_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao criar produto.',
  409: 'Produto já existe.',
  422: 'Dados do produto não processáveis.',
};

const UPDATE_PRODUCT_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao atualizar produto.',
  [HTTP_STATUS.NOT_FOUND]: 'Produto não encontrado para atualização.',
  409: 'Conflito ao atualizar produto.',
  422: 'Dados não processáveis.',
};

const DELETE_PRODUCT_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao deletar produto.',
  [HTTP_STATUS.NOT_FOUND]: 'Produto não encontrado para exclusão.',
  409: 'Não é possível deletar produto em uso.',
};

const FETCH_CLIENTS_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao listar clientes.',
  [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND_STORE,
};

const FETCH_CLIENT_BY_ID_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao buscar cliente.',
  [HTTP_STATUS.NOT_FOUND]: 'Cliente não encontrado.',
};

const CREATE_CLIENT_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao criar cliente.',
  [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND_STORE,
  409: 'Cliente já cadastrado (CPF/CNPJ ou e-mail já existe).',
};

const UPDATE_CLIENT_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao atualizar cliente.',
  [HTTP_STATUS.NOT_FOUND]: 'Cliente não encontrado para atualização.',
  409: 'Conflito ao atualizar cliente (CPF/CNPJ ou e-mail já existe).',
};

const DELETE_CLIENT_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: 'Erro ao deletar cliente.',
  [HTTP_STATUS.NOT_FOUND]: 'Cliente não encontrado para exclusão.',
  409: 'Não é possível deletar cliente com orçamentos vinculados.',
};

const createErrorHandlerMap = (
  operationMessages: ErrorMessageMap
): Record<number, ErrorHandler> => ({
  [HTTP_STATUS.BAD_REQUEST]: () => ({
    message:
      operationMessages[HTTP_STATUS.BAD_REQUEST] || 'Requisição inválida.',
  }),
  [HTTP_STATUS.UNAUTHORIZED]: () => ({
    message: ERROR_MESSAGES.UNAUTHORIZED,
    status: HTTP_STATUS.UNAUTHORIZED,
  }),
  [HTTP_STATUS.NOT_FOUND]: () => ({
    message:
      operationMessages[HTTP_STATUS.NOT_FOUND] ||
      ERROR_MESSAGES.NOT_FOUND_ENDPOINT,
    status: HTTP_STATUS.NOT_FOUND,
  }),
  [HTTP_STATUS.SERVER_ERROR]: () => ({
    message: ERROR_MESSAGES.SERVER_ERROR,
    status: HTTP_STATUS.SERVER_ERROR,
  }),
});

// 4. Generic error handler
const handleApiError = (
  err: unknown,
  errorHandlerMap?: Record<number, ErrorHandler>
): ApiError => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;

    if (status && errorHandlerMap?.[status]) {
      return errorHandlerMap[status](err);
    }

    const message =
      err.response?.data?.message ??
      err.message ??
      ERROR_MESSAGES.UNKNOWN_ERROR;
    return { message, status };
  }

  return { message: ERROR_MESSAGES.UNKNOWN_ERROR };
};

// 5. Helper function to handle common error scenarios
const handleCommonErrors = (
  err: unknown,
  errorHandlerMap: Record<number, ErrorHandler>,
  setError: (error: ApiError) => void,
  setDataToEmpty: () => void
): void => {
  if (err instanceof Error && err.message === ERROR_MESSAGES.TOKEN_NOT_FOUND) {
    setError({ message: ERROR_MESSAGES.UNAUTHORIZED });
  } else if (!axios.isCancel(err)) {
    setError(handleApiError(err, errorHandlerMap));
    setDataToEmpty();
  }
};

export {
  createErrorHandlerMap,
  handleApiError,
  handleCommonErrors,
  FETCH_MOVEMENTS_ERRORS,
  FETCH_REPORT_ERRORS,
  CREATE_OUTFLOW_ERRORS,
  FETCH_BUDGETS_ERRORS,
  FETCH_BUDGET_BY_ID_ERRORS,
  CREATE_BUDGET_ERRORS,
  UPDATE_BUDGET_ERRORS,
  DELETE_BUDGET_ERRORS,
  FETCH_PRODUCTS_ERRORS,
  CREATE_PRODUCT_ERRORS,
  UPDATE_PRODUCT_ERRORS,
  DELETE_PRODUCT_ERRORS,
  FETCH_CLIENTS_ERRORS,
  FETCH_CLIENT_BY_ID_ERRORS,
  CREATE_CLIENT_ERRORS,
  UPDATE_CLIENT_ERRORS,
  DELETE_CLIENT_ERRORS,
};

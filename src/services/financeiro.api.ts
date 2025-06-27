import { api } from '@/services/api';
import { getTodayDateRange } from '@/utils/date';
import { getStoreId } from '@/utils/getStoreId';

import {
  handleApiError,
  createErrorHandlerMap,
  FETCH_MOVEMENTS_ERRORS,
  FETCH_REPORT_ERRORS,
  CREATE_OUTFLOW_ERRORS,
  ERROR_MESSAGES,
} from '@/utils/errorHandler';

import type {
  MovimentoFinanceiro,
  RelatorioFinanceiro,
  SaidaFinanceiraPayload,
  EntradaFinanceiraPayload,
} from '@/@types/financeiro';

interface CreateSaidaParams {
  payload: SaidaFinanceiraPayload;
  signal?: AbortSignal;
}

interface CreateEntradaParams {
  payload: EntradaFinanceiraPayload;
  signal?: AbortSignal;
}

interface RelatorioParams {
  dataInicial: string;
  dataFinal: string;
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
const movementsErrorHandler = createErrorHandlerMap(FETCH_MOVEMENTS_ERRORS);
const reportErrorHandler = createErrorHandlerMap(FETCH_REPORT_ERRORS);
const outflowErrorHandler = createErrorHandlerMap(CREATE_OUTFLOW_ERRORS);

export const financeiroAPI = {
  // Listar todas as movimentações financeiras
  async fetchMovimentacoesFinanceira(
    signal?: AbortSignal
  ): Promise<MovimentoFinanceiro[]> {
    try {
      const token = getAuthToken();

      const response = await api.get('/financeiro/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 200) {
        console.log(
          'Lista de movimentações financeiras retornada com sucesso:',
          response.data
        );
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, movementsErrorHandler);
      console.error('Erro ao buscar movimentações financeiras:', apiError);
      throw apiError;
    }
  },

  // Gerar relatório financeiro do dia atual
  async fetchRelatorioFinanceiro(
    signal?: AbortSignal
  ): Promise<RelatorioFinanceiro> {
    try {
      const token = getAuthToken();
      const lojaId = getStoreId();
      if (!lojaId) {
        throw new Error('Loja não encontrada.');
      }
      const { dataInicio, dataFim } = getTodayDateRange();

      const response = await api.get(
        `/financeiro/relatorio/?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      if (response.status === 200) {
        console.log(
          'Relatório financeiro do dia gerado com sucesso:',
          response.data
        );
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, reportErrorHandler);
      console.error('Erro ao buscar relatório financeiro:', apiError);
      throw apiError;
    }
  },

  // Gerar relatorio por periodo
  async fetchRelatorioFinanceiroComPeriodo({
    dataInicial,
    dataFinal,
    signal,
  }: RelatorioParams): Promise<RelatorioFinanceiro> {
    try {
      const token = getAuthToken();
      const lojaId = getStoreId();

      if (!lojaId) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND_STORE);
      }

      // CORREÇÃO: Converter formato de data de YYYY-MM-DD para YYYY/MM/DD
      const converterFormatoData = (data: string) => {
        return data.replace(/-/g, '/');
      };

      const dataInicioAPI = converterFormatoData(dataInicial);
      const dataFimAPI = converterFormatoData(dataFinal);

      const response = await api.get(
        `/financeiro/relatorio/?dataInicio=${dataInicioAPI}&dataFim=${dataFimAPI}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      if (response.status === 200) {
        console.log('Relatório financeiro por periodo:', response.data);
        return response.data; // RETORNA os dados
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, reportErrorHandler);
      console.error(
        'Erro ao buscar relatório financeiro por período:',
        apiError
      );
      throw apiError;
    }
  },

  // Registrar saída
  async createSaida({ payload, signal }: CreateSaidaParams) {
    try {
      const token = getAuthToken();

      const response = await api.post(
        '/financeiro/saida',
        {
          ...payload,
          metodoPagamento: payload.metodoPagamento.toUpperCase(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      if (response.status === 201) {
        console.log('Saída financeira registrada com sucesso:', response.data);
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, outflowErrorHandler);
      console.error('Erro ao criar saída financeira:', apiError);
      throw apiError;
    }
  },

  // Registrar entrada
  async createEntrada({ payload, signal }: CreateEntradaParams) {
    try {
      const token = getAuthToken();

      const response = await api.post(
        '/financeiro/entrada',
        {
          ...payload,
          metodoPagamento: payload.metodoPagamento.toUpperCase(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      if (response.status === 201) {
        console.log(
          'Entrada financeira registrada com sucesso:',
          response.data
        );
        return response.data;
      } else {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }
    } catch (error) {
      const apiError = handleApiError(error, outflowErrorHandler);
      console.error('Erro ao criar entrada financeira:', apiError);
      throw apiError;
    }
  },
};

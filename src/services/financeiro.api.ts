import { api } from '@/services/api';
import { getTodayDateRange } from '@/utils/date';
import { getStoreId } from '@/utils/getStoreId';

import type {
  MovimentoFinanceiro,
  RelatorioFinanceiro,
  SaidaFinanceiraPayload,
} from '@/@types/financeiro';

interface CreateSaidaParams {
  payload: SaidaFinanceiraPayload;
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
    throw new Error('Usuário não autenticado: token não encontrado.');
  }
  return token;
};

export const financeiroAPI = {
  // Listar todas as movimentações financeiras
  async fetchMovimentacoesFinanceira(
    signal?: AbortSignal
  ): Promise<MovimentoFinanceiro[]> {
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
      throw new Error('Resposta inválida da API.');
    }
  },

  // Gerar relatório financeiro do dia atual
  async fetchRelatorioFinanceiro(
    signal?: AbortSignal
  ): Promise<RelatorioFinanceiro> {
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
      throw new Error('Resposta inválida da API.');
    }
  },

  // Gerar relatorio por periodo
  async fetchRelatorioFinanceiroComPeriodo({
    dataInicial,
    dataFinal,
    signal,
  }: RelatorioParams): Promise<RelatorioFinanceiro> {
    const token = getAuthToken();
    const lojaId = getStoreId();

    if (!lojaId) {
      throw new Error('Loja não encontrada.');
    }

    // CORREÇÃO: Converter formato de data de YYYY-MM-DD para YYYY/MM/DD
    const converterFormatoData = (data: string) => {
      return data.replace(/-/g, '/');
    };

    const dataInicioAPI = converterFormatoData(dataInicial);
    const dataFimAPI = converterFormatoData(dataFinal);

    console.log('Conversão de formato:', {
      original: { dataInicial, dataFinal },
      convertido: { dataInicioAPI, dataFimAPI },
    });

    const response = await api.get(
      `/financeiro/relatorio/?dataInicio=${dataInicioAPI}&dataFim=${dataFimAPI}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }
    );

    // LOG DA RESPOSTA COMPLETA
    console.log('Resposta completa da API:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });

    if (response.status === 200) {
      console.log('Relatório financeiro por periodo:', response.data);
      return response.data; // RETORNA os dados
    } else {
      throw new Error('Resposta inválida da API.');
    }
  },

  async createSaida({ payload, signal }: CreateSaidaParams) {
    const token = getAuthToken();
    console.log('Registrando saída financeira com dados:', payload);

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
    } else throw new Error('Resposta inválida da API.');
  },
};

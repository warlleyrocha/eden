import { useEffect, useState, useCallback, useContext } from 'react';
import { orcamentoAPI } from '@/services/orcamento.api';
import {
  OrcamentoSequenciaContext,
  type OrcamentoContextData,
} from '@/contexts/OrcamentoSequenciaContext';
import type { Orcamento, CreateOrcamento } from '@/@types/orcamento';
import type { ApiError } from '@/utils/errorHandler';

interface CreateOrcamentoParams {
  payload: CreateOrcamento;
  signal?: AbortSignal;
}

interface UpdateOrcamentoParams {
  id: string;
  payload: Partial<Orcamento>;
  signal?: AbortSignal;
}

export function useOrcamento() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Buscar todos os orçamentos
  const fetchOrcamentos = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const data = await orcamentoAPI.fetchOrcamentos(signal);
      setOrcamentos(data);
    } catch (err) {
      // Ignora erros de cancelamento
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' || err.name === 'AbortError')
      ) {
        return;
      }
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar orçamentos na inicialização
  useEffect(() => {
    const controller = new AbortController();
    fetchOrcamentos(controller.signal);
    return () => controller.abort();
  }, [fetchOrcamentos]);

  // Criar novo orçamento
  const createOrcamento = useCallback(
    async ({ payload, signal }: CreateOrcamentoParams) => {
      try {
        const newOrcamento = await orcamentoAPI.createOrcamento({
          payload,
          signal,
        });
        // Atualiza a lista após criação
        await fetchOrcamentos();
        return newOrcamento;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      }
    },
    [fetchOrcamentos]
  );

  // Atualizar orçamento existente
  const updateOrcamento = useCallback(
    async ({ id, payload, signal }: UpdateOrcamentoParams) => {
      try {
        const updatedOrcamento = await orcamentoAPI.updateOrcamento({
          id,
          payload,
          signal,
        });
        // Atualiza a lista após atualização
        await fetchOrcamentos();
        return updatedOrcamento;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      }
    },
    [fetchOrcamentos]
  );

  // Função de compatibilidade com a assinatura antiga
  const patchOrcamento = useCallback(
    async (id: string, payload: Partial<Orcamento>, signal?: AbortSignal) => {
      return updateOrcamento({ id, payload, signal });
    },
    [updateOrcamento]
  );

  // Deletar orçamento
  const deleteOrcamento = useCallback(
    async (id: string, signal?: AbortSignal) => {
      try {
        await orcamentoAPI.deleteOrcamento({ id, signal });
        // Atualiza a lista após exclusão
        await fetchOrcamentos();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      }
    },
    [fetchOrcamentos]
  );

  // Buscar orçamento por ID
  const getOrcamentoById = useCallback(
    async (id: string, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const orcamento = await orcamentoAPI.getOrcamentoById({ id, signal });
        return orcamento;
      } catch (err) {
        // Ignora erros de cancelamento
        if (
          err instanceof Error &&
          (err.name === 'CanceledError' || err.name === 'AbortError')
        ) {
          return null;
        }
        setError(err as ApiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    // Estados
    orcamentos,
    loading,
    error,

    // Ações
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    fetchOrcamentos,
    getOrcamentoById,
    patchOrcamento,

    // Alias para compatibilidade
    refetch: fetchOrcamentos,
  };
}

// Hook personalizado para usar o contexto
export const useOrcamentoContext = (): OrcamentoContextData => {
  const context = useContext(OrcamentoSequenciaContext);

  if (context === undefined) {
    throw new Error(
      'useOrcamento deve ser usado dentro de um OrcamentoSequenciaProvider'
    );
  }

  return context;
};

// Hook específico para obter apenas o número sequencial
export const useNumeroSequencial = (orcamentoId: string): number | null => {
  const { getNumeroSequencial } = useOrcamentoContext();
  return getNumeroSequencial(orcamentoId);
};

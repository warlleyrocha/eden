import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import type { Orcamento } from '@/@types/orcamento';

interface OrcamentoSequenciaContextData {
  orcamentos: Orcamento[];
  setOrcamentos: (orcamentos: Orcamento[]) => void;
  adicionarOrcamento: (orcamento: Orcamento) => void;
  getNumeroSequencial: (orcamentoId: string) => number | null;
  getOrcamentosOrdenados: () => Orcamento[];
}

interface OrcamentoSequenciaProviderProps {
  children: ReactNode;
}

const OrcamentoSequenciaContext = createContext<
  OrcamentoSequenciaContextData | undefined
>(undefined);

export const OrcamentoSequenciaProvider: React.FC<
  OrcamentoSequenciaProviderProps
> = ({ children }) => {
  const [orcamentos, setOrcamentosState] = useState<Orcamento[]>([]);

  // Função para ordenar orçamentos por data de criação (mais antigo primeiro)
  const getOrcamentosOrdenados = useCallback((): Orcamento[] => {
    return [...orcamentos].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [orcamentos]);

  // Função principal: obter o número sequencial do orçamento baseado na ordem de criação
  const getNumeroSequencial = useCallback(
    (orcamentoId: string): number | null => {
      const orcamentosOrdenados = getOrcamentosOrdenados();
      const indice = orcamentosOrdenados.findIndex(
        (orc) => orc.id === orcamentoId
      );
      return indice !== -1 ? indice + 1 : null;
    },
    [getOrcamentosOrdenados]
  );

  // Função para definir lista de orçamentos
  const setOrcamentos = useCallback((novosOrcamentos: Orcamento[]) => {
    setOrcamentosState(novosOrcamentos);
  }, []);

  // Função para adicionar novo orçamento
  const adicionarOrcamento = useCallback((novoOrcamento: Orcamento) => {
    setOrcamentosState((prev) => [...prev, novoOrcamento]);
  }, []);

  const value: OrcamentoSequenciaContextData = {
    orcamentos,
    setOrcamentos,
    adicionarOrcamento,
    getNumeroSequencial,
    getOrcamentosOrdenados,
  };

  return (
    <OrcamentoSequenciaContext.Provider value={value}>
      {children}
    </OrcamentoSequenciaContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useOrcamentoSequencia = (): OrcamentoSequenciaContextData => {
  const context = useContext(OrcamentoSequenciaContext);

  if (context === undefined) {
    throw new Error(
      'useOrcamentoSequencia deve ser usado dentro de um OrcamentoSequenciaProvider'
    );
  }

  return context;
};

// Hook específico para obter apenas o número sequencial
export const useNumeroSequencial = (orcamentoId: string): number | null => {
  const { getNumeroSequencial } = useOrcamentoSequencia();
  return getNumeroSequencial(orcamentoId);
};

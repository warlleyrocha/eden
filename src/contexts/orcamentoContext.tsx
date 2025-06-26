import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import type { Orcamento } from '@/@types/orcamento';

interface OrcamentoContextData {
  orcamentos: Orcamento[];
  setOrcamentos: (orcamentos: Orcamento[]) => void;
  adicionarOrcamento: (orcamento: Orcamento) => void;
  getNumeroSequencial: (orcamentoId: string) => number | null;
  getOrcamentosOrdenados: () => Orcamento[];
  modalAberto: boolean;
  orcamentoParaImprimir: Orcamento | null;
  abrirModalImpressao: (orcamento: Orcamento) => void;
  fecharModalImpressao: () => void;
}

interface OrcamentoSequenciaProviderProps {
  children: ReactNode;
}

const OrcamentoSequenciaContext = createContext<
  OrcamentoContextData | undefined
>(undefined);

export const OrcamentoSequenciaProvider: React.FC<
  OrcamentoSequenciaProviderProps
> = ({ children }) => {
  const [orcamentos, setOrcamentosState] = useState<Orcamento[]>([]);
  // Estados do modal
  const [modalAberto, setModalAberto] = useState(false);
  const [orcamentoParaImprimir, setOrcamentoParaImprimir] =
    useState<Orcamento | null>(null);

  // Funções do modal
  const abrirModalImpressao = useCallback((orcamento: Orcamento) => {
    setOrcamentoParaImprimir(orcamento);
    setModalAberto(true);
  }, []);

  const fecharModalImpressao = useCallback(() => {
    setModalAberto(false);
    setOrcamentoParaImprimir(null);
  }, []);

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
    const orcamentosTratados = novosOrcamentos.map((orcamento) => ({
      ...orcamento,
      itens: orcamento.itens.map((item) => ({
        ...item,
        nomeProduto:
          item.nomeProduto ?? `Produto ${item.produtoId.slice(0, 8)}`,
      })),
    }));
    setOrcamentosState(orcamentosTratados);
  }, []);

  const adicionarOrcamento = useCallback((novoOrcamento: Orcamento) => {
    const orcamentoCompleto = {
      ...novoOrcamento,
      itens: novoOrcamento.itens.map((item) => ({
        ...item,
        nomeProduto:
          item.nomeProduto ?? `Produto ${item.produtoId.slice(0, 8)}`,
      })),
    };
    setOrcamentosState((prev) => [...prev, orcamentoCompleto]);
  }, []);

  const value: OrcamentoContextData = {
    orcamentos,
    setOrcamentos,
    adicionarOrcamento,
    getNumeroSequencial,
    getOrcamentosOrdenados,
    modalAberto,
    orcamentoParaImprimir,
    abrirModalImpressao,
    fecharModalImpressao,
  };

  return (
    <OrcamentoSequenciaContext.Provider value={value}>
      {children}
    </OrcamentoSequenciaContext.Provider>
  );
};

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

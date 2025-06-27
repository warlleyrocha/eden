import React, { useState, useCallback, type ReactNode } from 'react';

import type { Orcamento } from '@/@types/orcamento';
import { tratarOrcamento, tratarOrcamentos } from '@/utils/orcamentoUtils';
import {
  OrcamentoSequenciaContext,
  type OrcamentoContextData,
} from './OrcamentoSequenciaContext';
import { useMemo } from 'react';

interface OrcamentoSequenciaProviderProps {
  children: ReactNode;
}

export const OrcamentoSequenciaProvider: React.FC<
  OrcamentoSequenciaProviderProps
> = ({ children }) => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

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

  const getOrcamentosOrdenados = useCallback((): Orcamento[] => {
    return [...orcamentos].sort((a, b) => {
      // Se a data não existir, usar Date.now() para colocar no final
      const dataA = a.criadoEm ? new Date(a.criadoEm).getTime() : Date.now();
      const dataB = b.criadoEm ? new Date(b.criadoEm).getTime() : Date.now();

      return dataA - dataB;
    });
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

  // Função para definir lista de orçamentos (com tratamento automático)
  const definirLista = useCallback((novosOrcamentos: Orcamento[]) => {
    const orcamentosTratados = tratarOrcamentos(novosOrcamentos);
    setOrcamentos(orcamentosTratados);
  }, []);

  // Função para adicionar orçamento (com tratamento automático)
  const adicionarOrcamento = useCallback((novoOrcamento: Orcamento) => {
    const orcamentoTratado = tratarOrcamento(novoOrcamento);
    setOrcamentos((prev) => [...prev, orcamentoTratado]);
  }, []);

  // Nova função para atualizar orçamento existente
  const atualizarOrcamento = useCallback(
    (orcamentoId: string, orcamentoAtualizado: Orcamento) => {
      const orcamentoTratado = tratarOrcamento(orcamentoAtualizado);
      setOrcamentos((prev) =>
        prev.map((orc) => (orc.id === orcamentoId ? orcamentoTratado : orc))
      );
    },
    []
  );

  // Função para reprocessar orçamentos existentes (útil para dados já salvos)
  const reprocessarOrcamentos = useCallback(() => {
    setOrcamentos((prev) => tratarOrcamentos(prev));
  }, []);

  const value: OrcamentoContextData = useMemo(
    () => ({
      orcamentos,
      definirLista,
      adicionarOrcamento,
      atualizarOrcamento,
      getNumeroSequencial,
      getOrcamentosOrdenados,
      modalAberto,
      orcamentoParaImprimir,
      abrirModalImpressao,
      fecharModalImpressao,
      reprocessarOrcamentos,
    }),
    [
      orcamentos,
      definirLista,
      adicionarOrcamento,
      atualizarOrcamento,
      getNumeroSequencial,
      getOrcamentosOrdenados,
      modalAberto,
      orcamentoParaImprimir,
      abrirModalImpressao,
      fecharModalImpressao,
      reprocessarOrcamentos,
    ]
  );

  return (
    <OrcamentoSequenciaContext.Provider value={value}>
      {children}
    </OrcamentoSequenciaContext.Provider>
  );
};

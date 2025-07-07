import { createContext } from 'react';
import type { Orcamento } from '@/@types/orcamento';

// Tipos do contexto (ajuste conforme sua implementação)
export interface OrcamentoContextData {
  orcamentos: Orcamento[];
  definirLista: (orcamentos: Orcamento[]) => void;
  adicionarOrcamento: (orcamento: Orcamento) => void;
  atualizarOrcamento: (
    orcamentoId: string,
    orcamentoAtualizado: Orcamento
  ) => void;
  getNumeroSequencial: (orcamentoId: string) => number | null;
  getOrcamentosOrdenados: () => Orcamento[];
  modalAberto: boolean;
  orcamentoParaImprimir: Orcamento | null;
  abrirModalImpressao: (orcamento: Orcamento) => void;
  fecharModalImpressao: () => void;
  reprocessarOrcamentos: () => void; // Para tratar dados já existentes
}

// Contexto
export const OrcamentoSequenciaContext = createContext<
  OrcamentoContextData | undefined
>(undefined);

// utils/orcamentoUtils.ts
import type { Orcamento, ItemOrcamento } from '@/@types/orcamento';

/**
 * Trata um item de orçamento garantindo que tenha nomeProduto
 */
export const tratarItemOrcamento = (item: ItemOrcamento): ItemOrcamento => {
  return {
    ...item,
    nome: item.nome ?? `Produto ${item.produtoId.slice(0, 8)}`,
  };
};

/**
 * Trata um orçamento garantindo que todos os itens tenham nomeProduto
 */
export const tratarOrcamento = (orcamento: Orcamento): Orcamento => {
  return {
    ...orcamento,
    itens: orcamento.itens.map(tratarItemOrcamento),
  };
};

/**
 * Trata uma lista de orçamentos
 */
export const tratarOrcamentos = (orcamentos: Orcamento[]): Orcamento[] => {
  return orcamentos.map(tratarOrcamento);
};

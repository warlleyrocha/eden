// Hook específico para controle do modal
import { useCallback } from 'react';
import { useOrcamentoContext } from '@/contexts/orcamentoContext';

export const useModalImpressao = () => {
  const {
    modalAberto,
    orcamentoParaImprimir,
    abrirModalImpressao,
    fecharModalImpressao,
    getNumeroSequencial,
    orcamentos,
  } = useOrcamentoContext();

  // Função helper para obter dados formatados para impressão
  const getDadosImpressao = useCallback(() => {
    if (!orcamentoParaImprimir) return null;

    const numeroSequencial = getNumeroSequencial(orcamentoParaImprimir.id);
    const totalOrcamentos = orcamentos.length;
    const index = numeroSequencial
      ? totalOrcamentos - numeroSequencial
      : undefined;

    return {
      index,
      totalOrcamentos,
      orcamentoId: orcamentoParaImprimir.id,
      cliente: {
        id: orcamentoParaImprimir.cliente?.id ?? '',
        nome: orcamentoParaImprimir.cliente?.nome ?? 'Cliente não informado',
        telefone: orcamentoParaImprimir.cliente?.telefone ?? 'Não informado',
        endereco: orcamentoParaImprimir.cliente?.endereco ?? 'Não informado',
      },
      date: orcamentoParaImprimir.criadoEm
        ? new Date(orcamentoParaImprimir.criadoEm).toLocaleDateString('pt-BR')
        : 'Data não informada',
      itens:
        orcamentoParaImprimir.itens?.map((item) => ({
          produtoId: item.produtoId,
          nome: item.nomeProduto ?? 'Produto não especificado',
          precoUnitario: item.precoUnitario,
          quantidade: item.quantidade,
          valorTotal: item.precoUnitario * item.quantidade,
        })) || [],
      servicos:
        orcamentoParaImprimir.servicos?.map((servico) => ({
          descricao: servico.descricao,
          valor: servico.valor,
        })) || [],
      total: orcamentoParaImprimir.total ?? 0,
      lojaId: orcamentoParaImprimir.lojaId ?? '',
      descricao: orcamentoParaImprimir.descricao ?? '',
      metodoPagamento: orcamentoParaImprimir.metodoPagamento ?? '',
      numeroParcelas: orcamentoParaImprimir.numeroParcelas ?? 1,
      status: orcamentoParaImprimir.status ?? 'pendente',
    };
  }, [orcamentoParaImprimir, getNumeroSequencial, orcamentos]);

  return {
    modalAberto,
    orcamentoParaImprimir,
    abrirModalImpressao,
    fecharModalImpressao,
    getDadosImpressao,
  };
};

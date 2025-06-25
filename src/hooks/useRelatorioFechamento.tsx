// hooks/useRelatorioFechamento.ts
import React, { useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { RelatorioFechamentoPDF } from '../component/RelatorioFechamentoPDF';
import type { RelatorioFinanceiro, Movimento } from '@/@types/relatorio';
import { extrairDataSemTimezone } from '../utils/date';

interface PDFUtilities {
  formatarDataSimples: (data: string) => string;
  formatarMoeda: (valor: number) => string;
  formatarMetodoPagamentoCompleto: (
    metodo: string,
    parcelas?: number,
    juros?: number
  ) => string;
  METODOS_PAGAMENTO_LABELS: Record<string, string>;
}

// Interface para os dados necessários
interface PDFData {
  dataInicial: string;
  dataFinal: string;
  fetchRelatorioFinanceiroComPeriodo: (params: {
    dataInicial: string;
    dataFinal: string;
  }) => Promise<RelatorioFinanceiro>;
  movimentacoes: Movimento[];
}

/**
 * Hook para gerenciar a geração de relatórios PDF
 */
export const useRelatorioFechamento = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  /**
   * Gera PDF com período específico usando seu hook existente
   */
  const gerarPDFComPeriodo = useCallback(
    async (data: PDFData, utilities: PDFUtilities) => {
      const {
        dataInicial,
        dataFinal,
        fetchRelatorioFinanceiroComPeriodo,
        movimentacoes,
      } = data;
      const {
        formatarDataSimples,
        formatarMoeda,
        formatarMetodoPagamentoCompleto,
        METODOS_PAGAMENTO_LABELS,
      } = utilities;

      setIsGeneratingPDF(true);

      try {
        console.log('Iniciando geração do PDF para período:', {
          dataInicial,
          dataFinal,
        });

        // Garantir que as datas estejam no formato correto
        const dataInicialSegura = extrairDataSemTimezone(dataInicial);
        const dataFinalSegura = extrairDataSemTimezone(dataFinal);

        // Busca o relatório usando seu hook existente
        const relatorioFiltrado = await fetchRelatorioFinanceiroComPeriodo({
          dataInicial: dataInicialSegura,
          dataFinal: dataFinalSegura,
        });

        console.log('Relatório retornado:', relatorioFiltrado);

        if (!relatorioFiltrado || typeof relatorioFiltrado !== 'object') {
          console.error('Relatório inválido:', relatorioFiltrado);
          throw new Error('Relatório não encontrado ou inválido');
        }

        // Garantir que as propriedades existam com valores padrão
        const relatorio: RelatorioFinanceiro = {
          totalPorMetodoEntrada: relatorioFiltrado.totalPorMetodoEntrada || {},
          totalEntradas: relatorioFiltrado.totalEntradas || 0,
          totalSaidas: relatorioFiltrado.totalSaidas || 0,
          saldo: relatorioFiltrado.saldo || 0,
        };

        // Período formatado usando função segura
        const periodo = `${formatarDataSimples(
          dataInicialSegura
        )} à ${formatarDataSimples(dataFinalSegura)}`;

        // Filtrar movimentações do período de forma mais segura
        const movimentacoesPeriodo = movimentacoes.filter((m) => {
          const dataMovimento = extrairDataSemTimezone(m.criadoEm);
          return (
            dataMovimento >= dataInicialSegura &&
            dataMovimento <= dataFinalSegura
          );
        });

        const entradasPeriodo = movimentacoesPeriodo.filter(
          (m) => m.tipo === 'ENTRADA'
        );
        const saidasPeriodo = movimentacoesPeriodo.filter(
          (m) => m.tipo === 'SAIDA'
        );

        console.log('Movimentações filtradas:', {
          total: movimentacoesPeriodo.length,
          entradas: entradasPeriodo.length,
          saidas: saidasPeriodo.length,
        });

        // Data de geração usando função segura
        const dataGeracao = formatarDataSimples(new Date().toString());

        // Gerar PDF usando React PDF
        const pdfDoc = (
          <RelatorioFechamentoPDF
            relatorio={relatorio}
            periodo={periodo}
            entradasPeriodo={entradasPeriodo}
            saidasPeriodo={saidasPeriodo}
            dataGeracao={dataGeracao}
            formatarMoeda={formatarMoeda}
            formatarDataSimples={formatarDataSimples}
            formatarMetodoPagamentoCompleto={formatarMetodoPagamentoCompleto}
            METODOS_PAGAMENTO_LABELS={METODOS_PAGAMENTO_LABELS}
          />
        );

        // Gerar e baixar o PDF
        const blob = await pdf(pdfDoc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `fechamento-caixa-${dataInicialSegura}-${dataFinalSegura}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log('PDF gerado com sucesso');
        toast.success('Relatório PDF gerado com sucesso!');
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);

        const mensagemErro =
          error instanceof Error
            ? error.message
            : 'Erro desconhecido ao gerar o relatório';

        toast.error(`Erro ao gerar o relatório: ${mensagemErro}`);
      } finally {
        setIsGeneratingPDF(false);
      }
    },
    []
  );

  return {
    gerarPDFComPeriodo,
    isGeneratingPDF,
  };
};

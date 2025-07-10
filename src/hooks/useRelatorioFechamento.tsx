// hooks/useRelatorioFechamento.ts
import React, { useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { RelatorioFechamentoPDF } from '../component/RelatorioFechamentoPDF';
import type { RelatorioFinanceiro, Movimento } from '@/@types/relatorio';
import { extrairDataSemTimezone, formatarDataSegura } from '../utils/date';

/**
 * Hook para gerenciar a geração de relatórios PDF
 */
export const useRelatorioFechamento = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  /**
   * Gera PDF com período específico usando seu hook existente
   */
  const gerarPDFComPeriodo = useCallback(
    async (
      dataInicial: string,
      dataFinal: string,
      fetchRelatorioFinanceiroComPeriodo: (params: {
        dataInicial: string;
        dataFinal: string;
      }) => Promise<RelatorioFinanceiro>,
      movimentacoes: Movimento[],
      formatarDataSimples: (data: string) => string,
      formatarMoeda: (valor: number) => string,
      formatarMetodoPagamentoCompleto: (
        metodo: string,
        parcelas?: number,
        juros?: number
      ) => string,
      METODOS_PAGAMENTO_LABELS: Record<string, string>
    ) => {
      setIsGeneratingPDF(true);

      try {
        // Garantir que as datas estejam no formato correto
        const dataInicialSegura = extrairDataSemTimezone(dataInicial);
        const dataFinalSegura = extrairDataSemTimezone(dataFinal);

        // Busca o relatório usando seu hook existente
        const relatorioFiltrado = await fetchRelatorioFinanceiroComPeriodo({
          dataInicial: dataInicialSegura,
          dataFinal: dataFinalSegura,
        });

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
        const periodo = `${formatarDataSegura(
          dataInicialSegura
        )} à ${formatarDataSegura(dataFinalSegura)}`;

        // CORREÇÃO PRINCIPAL: Filtrar movimentações com a mesma lógica de data
        const movimentacoesPeriodo = movimentacoes.filter((movimento) => {
          // Extrair data da movimentação no mesmo formato
          const dataMovimento = extrairDataSemTimezone(movimento.criadoEm);

          // Comparar strings diretamente (YYYY-MM-DD)
          const estaNoPeríodo =
            dataMovimento >= dataInicialSegura &&
            dataMovimento <= dataFinalSegura;

          return estaNoPeríodo;
        });

        // Separar entradas e saídas
        const entradasPeriodo = movimentacoesPeriodo.filter(
          (m) => m.tipo === 'ENTRADA'
        );
        const saidasPeriodo = movimentacoesPeriodo.filter(
          (m) => m.tipo === 'SAIDA'
        );

        // Data de geração usando função segura
        const dataGeracao = formatarDataSegura(new Date());

        // Gerar PDF usando React PDF
        const pdfDoc = (
          <RelatorioFechamentoPDF
            relatorio={relatorio}
            periodo={periodo}
            entradasPeriodo={entradasPeriodo}
            saidasPeriodo={saidasPeriodo}
            dataGeracao={dataGeracao}
            formatarMoeda={formatarMoeda}
            formatarDataSimples={formatarDataSegura}
            formatarMetodoPagamentoCompleto={formatarMetodoPagamentoCompleto}
            METODOS_PAGAMENTO_LABELS={METODOS_PAGAMENTO_LABELS}
          />
        );

        // Gerar e baixar o PDF
        const blob = await pdf(pdfDoc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Nome do arquivo com datas formatadas
        const dataIniFormatada = formatarDataSegura(dataInicialSegura).replace(
          /\//g,
          '-'
        );
        const dataFimFormatada = formatarDataSegura(dataFinalSegura).replace(
          /\//g,
          '-'
        );

        link.href = url;
        link.download = `fechamento-caixa-${dataIniFormatada}-${dataFimFormatada}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        toast.success('Relatório PDF gerado com sucesso!', {
          description: `Relatório de fechamento de caixa gerado para o período de ${periodo}.`,
          duration: 2000,
          position: 'bottom-right',
          richColors: true,
        });
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

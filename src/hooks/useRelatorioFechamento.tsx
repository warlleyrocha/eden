// 2. IMPORTS NECESSÁRIOS
import React, { useCallback } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { toast } from 'sonner';

// 3. ESTILOS DO PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    flex: 1,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 100,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingVertical: 2,
    fontSize: 9,
  },
  date: {
    width: 80,
  },
  method: {
    width: 120,
  },
  amount: {
    width: 80,
    textAlign: 'right',
  },
  description: {
    flex: 1,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
  },
  totalBox: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
});

// 4. TIPOS (baseados no seu código)
interface Movimento {
  criadoEm: string;
  tipo: 'ENTRADA' | 'SAIDA';
  metodoPagamento: string;
  valor: number;
  descricao?: string;
  parcelas?: number;
  juros?: number;
}

interface RelatorioFinanceiro {
  totalPorMetodoEntrada: Record<string, number>;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

interface PDFProps {
  relatorio: RelatorioFinanceiro;
  periodo: string;
  entradasPeriodo: Movimento[];
  saidasPeriodo: Movimento[];
  dataGeracao: string;
  formatarMoeda: (valor: number) => string;
  formatarDataSimples: (data: string) => string;
  formatarMetodoPagamentoCompleto: (
    metodo: string,
    parcelas?: number,
    juros?: number
  ) => string;
  METODOS_PAGAMENTO_LABELS: Record<string, string>;
}

// 5. COMPONENTE DO DOCUMENTO PDF
const RelatorioFechamentoPDF: React.FC<PDFProps> = ({
  relatorio,
  periodo,
  entradasPeriodo,
  saidasPeriodo,
  dataGeracao,
  formatarMoeda,
  formatarDataSimples,
  formatarMetodoPagamentoCompleto,
  METODOS_PAGAMENTO_LABELS,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>RELATÓRIO DE FECHAMENTO DE CAIXA</Text>
        <Text style={styles.subtitle}>PERÍODO: {periodo}</Text>
        <Text style={styles.subtitle}>Data de Geração: {dataGeracao}</Text>
      </View>

      {/* RESUMO FINANCEIRO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RESUMO FINANCEIRO</Text>

        {/* ENTRADAS POR MÉTODO */}
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: 12, backgroundColor: '#E8F5E8' },
          ]}
        >
          ENTRADAS POR MÉTODO
        </Text>
        {Object.entries(relatorio.totalPorMetodoEntrada)
          .filter(([_, valor]) => valor > 0)
          .map(([metodo, valor]) => {
            const nomeMetodo = METODOS_PAGAMENTO_LABELS[metodo] || metodo;
            return (
              <View key={metodo} style={styles.row}>
                <Text style={styles.label}>{nomeMetodo}</Text>
                <Text style={styles.value}>{formatarMoeda(valor)}</Text>
              </View>
            );
          })}

        <View style={styles.separator} />

        {/* TOTAIS */}
        <View style={styles.totalBox}>
          <View style={styles.row}>
            <Text style={styles.label}>TOTAL DE ENTRADAS:</Text>
            <Text
              style={[styles.value, styles.totalValue, { color: '#2E7D32' }]}
            >
              {formatarMoeda(relatorio.totalEntradas)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>TOTAL DE SAÍDAS:</Text>
            <Text
              style={[styles.value, styles.totalValue, { color: '#C62828' }]}
            >
              {formatarMoeda(relatorio.totalSaidas)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SALDO FINAL:</Text>
            <Text
              style={[
                styles.value,
                styles.totalValue,
                {
                  color: relatorio.saldo >= 0 ? '#2E7D32' : '#C62828',
                },
              ]}
            >
              {formatarMoeda(relatorio.saldo)}
            </Text>
          </View>
        </View>
      </View>

      {/* DETALHAMENTO DAS ENTRADAS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { backgroundColor: '#E8F5E8' }]}>
          ENTRADAS DETALHADAS ({entradasPeriodo.length})
        </Text>

        {/* Cabeçalho da tabela */}
        <View
          style={[
            styles.detailRow,
            { fontWeight: 'bold', borderBottomWidth: 1 },
          ]}
        >
          <Text style={styles.date}>Data</Text>
          <Text style={styles.method}>Método</Text>
          <Text style={styles.amount}>Valor</Text>
          <Text style={styles.description}>Descrição</Text>
        </View>

        {entradasPeriodo.length > 0 ? (
          entradasPeriodo.map((movimento, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.date}>
                {formatarDataSimples(movimento.criadoEm)}
              </Text>
              <Text style={styles.method}>
                {formatarMetodoPagamentoCompleto(
                  movimento.metodoPagamento,
                  movimento.parcelas,
                  movimento.juros
                )}
              </Text>
              <Text style={styles.amount}>
                {formatarMoeda(movimento.valor)}
              </Text>
              <Text style={styles.description}>
                {movimento.descricao ?? 'Entrada'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.label}>Nenhuma entrada no período</Text>
        )}
      </View>

      {/* DETALHAMENTO DAS SAÍDAS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { backgroundColor: '#FFEBEE' }]}>
          SAÍDAS DETALHADAS ({saidasPeriodo.length})
        </Text>

        {/* Cabeçalho da tabela */}
        <View
          style={[
            styles.detailRow,
            { fontWeight: 'bold', borderBottomWidth: 1 },
          ]}
        >
          <Text style={styles.date}>Data</Text>
          <Text style={styles.method}>Método</Text>
          <Text style={styles.amount}>Valor</Text>
          <Text style={styles.description}>Descrição</Text>
        </View>

        {saidasPeriodo.length > 0 ? (
          saidasPeriodo.map((movimento, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.date}>
                {formatarDataSimples(movimento.criadoEm)}
              </Text>
              <Text style={styles.method}>
                {formatarMetodoPagamentoCompleto(
                  movimento.metodoPagamento,
                  movimento.parcelas,
                  movimento.juros
                )}
              </Text>
              <Text style={styles.amount}>
                {formatarMoeda(movimento.valor)}
              </Text>
              <Text style={styles.description}>
                {movimento.descricao ?? 'Saída'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.label}>Nenhuma saída no período</Text>
        )}
      </View>

      {/* ESTATÍSTICAS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ESTATÍSTICAS DO PERÍODO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Número total de transações:</Text>
          <Text style={styles.value}>
            {entradasPeriodo.length + saidasPeriodo.length}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Número de entradas:</Text>
          <Text style={styles.value}>{entradasPeriodo.length}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Número de saídas:</Text>
          <Text style={styles.value}>{saidasPeriodo.length}</Text>
        </View>
      </View>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <Text>Sistema de Caixa - Gerado automaticamente</Text>
        <Text>Documento gerado em {dataGeracao}</Text>
      </View>
    </Page>
  </Document>
);

// FUNÇÕES AUXILIARES PARA CORRIGIR O PROBLEMA DE FUSO HORÁRIO

// 1. Função para converter data string (YYYY-MM-DD) para Date local
const converterDataStringParaLocal = (dataString: string): Date => {
  // Adiciona o horário meio-dia para evitar problemas de fuso horário
  return new Date(dataString + 'T12:00:00');
};

// 2. Função para extrair apenas a data (YYYY-MM-DD) sem conversão de timezone
const extrairDataSemTimezone = (dataISO: string): string => {
  // Se a data já está no formato YYYY-MM-DD, retorna como está
  if (dataISO.length === 10 && dataISO.includes('-')) {
    return dataISO;
  }

  // Se é um ISO string completo, extrai apenas a parte da data
  return dataISO.split('T')[0];
};

// 3. Função para formatar data garantindo que não mude por timezone
const formatarDataSegura = (dataInput: string | Date): string => {
  let data: Date;

  if (typeof dataInput === 'string') {
    // Se é string, usa a função segura de conversão
    data = converterDataStringParaLocal(extrairDataSemTimezone(dataInput));
  } else {
    data = dataInput;
  }

  // Formata usando as funções locais para evitar conversão de timezone
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
};

// 4. VERSÃO CORRIGIDA DA FUNÇÃO PRINCIPAL
export const useRelatorioFechamento = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const gerarPDFComPeriodo = useCallback(
    async (
      dataInicial: string,
      dataFinal: string,
      fetchRelatorioFinanceiroComPeriodo: any,
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
        console.log('Iniciando geração do PDF para período:', {
          dataInicial,
          dataFinal,
        });

        // CORREÇÃO 1: Garantir que as datas estejam no formato correto
        const dataInicialSegura = extrairDataSemTimezone(dataInicial);
        const dataFinalSegura = extrairDataSemTimezone(dataFinal);

        console.log('Datas seguras:', {
          dataInicialSegura,
          dataFinalSegura,
        });

        // Busca o relatório com o período específico
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

        // CORREÇÃO 2: Período formatado usando função segura
        const periodo = `${formatarDataSegura(
          dataInicialSegura
        )} à ${formatarDataSegura(dataFinalSegura)}`;

        // CORREÇÃO 3: Filtrar movimentações do período de forma mais segura
        const movimentacoesPeriodo = movimentacoes.filter((m) => {
          // Extrai apenas a data da movimentação sem considerar timezone
          const dataMovimento = extrairDataSemTimezone(m.criadoEm);

          console.log('Comparando datas:', {
            dataMovimento,
            dataInicialSegura,
            dataFinalSegura,
            incluir:
              dataMovimento >= dataInicialSegura &&
              dataMovimento <= dataFinalSegura,
          });

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

        // CORREÇÃO 4: Data de geração usando função segura
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
            formatarDataSimples={formatarDataSegura} // Usar função segura
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

// 5. FUNÇÃO ALTERNATIVA PARA formatarDataSimples (substitua a existente)
export const formatarDataSimplesSegura = (dataInput: string | Date): string => {
  return formatarDataSegura(dataInput);
};

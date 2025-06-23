// components/RelatorioFechamentoPDF.tsx
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { PDFProps } from '@/@types/relatorio';
import { pdfStyles } from '@/assets/styles/pdfStyles';

export const RelatorioFechamentoPDF: React.FC<PDFProps> = ({
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
    <Page size="A4" style={pdfStyles.page}>
      {/* CABEÇALHO */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>RELATÓRIO DE FECHAMENTO DE CAIXA</Text>
        <Text style={pdfStyles.subtitle}>PERÍODO: {periodo}</Text>
        <Text style={pdfStyles.subtitle}>Data de Geração: {dataGeracao}</Text>
      </View>

      {/* RESUMO FINANCEIRO */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>RESUMO FINANCEIRO</Text>

        {/* ENTRADAS POR MÉTODO */}
        <Text
          style={[
            pdfStyles.sectionTitle,
            { fontSize: 12, backgroundColor: '#E8F5E8' },
          ]}
        >
          ENTRADAS POR MÉTODO
        </Text>
        {Object.entries(relatorio.totalPorMetodoEntrada)
          .filter(([, valor]) => valor > 0)
          .map(([metodo, valor]) => {
            const nomeMetodo = METODOS_PAGAMENTO_LABELS[metodo] || metodo;
            return (
              <View key={metodo} style={pdfStyles.row}>
                <Text style={pdfStyles.label}>{nomeMetodo}</Text>
                <Text style={pdfStyles.value}>{formatarMoeda(valor)}</Text>
              </View>
            );
          })}

        <View style={pdfStyles.separator} />

        {/* TOTAIS */}
        <View style={pdfStyles.totalBox}>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>TOTAL DE ENTRADAS:</Text>
            <Text
              style={[
                pdfStyles.value,
                pdfStyles.totalValue,
                { color: '#2E7D32' },
              ]}
            >
              {formatarMoeda(relatorio.totalEntradas)}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>TOTAL DE SAÍDAS:</Text>
            <Text
              style={[
                pdfStyles.value,
                pdfStyles.totalValue,
                { color: '#C62828' },
              ]}
            >
              {formatarMoeda(relatorio.totalSaidas)}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>SALDO FINAL:</Text>
            <Text
              style={[
                pdfStyles.value,
                pdfStyles.totalValue,
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
      <View style={pdfStyles.section}>
        <Text style={[pdfStyles.sectionTitle, { backgroundColor: '#E8F5E8' }]}>
          ENTRADAS DETALHADAS ({entradasPeriodo.length})
        </Text>

        {/* Cabeçalho da tabela */}
        <View
          style={[
            pdfStyles.detailRow,
            { fontWeight: 'bold', borderBottomWidth: 1 },
          ]}
        >
          <Text style={pdfStyles.date}>Data</Text>
          <Text style={pdfStyles.method}>Método</Text>
          <Text style={pdfStyles.amount}>Valor</Text>
          <Text style={pdfStyles.description}>Descrição</Text>
        </View>

        {entradasPeriodo.length > 0 ? (
          entradasPeriodo.map((movimento) => (
            <View key={movimento.id} style={pdfStyles.detailRow}>
              <Text style={pdfStyles.date}>
                {formatarDataSimples(movimento.criadoEm)}
              </Text>
              <Text style={pdfStyles.method}>
                {formatarMetodoPagamentoCompleto(
                  movimento.metodoPagamento,
                  movimento.parcelas,
                  movimento.juros
                )}
              </Text>
              <Text style={pdfStyles.amount}>
                {formatarMoeda(movimento.valor)}
              </Text>
              <Text style={pdfStyles.description}>
                {movimento.descricao ?? 'Entrada'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={pdfStyles.label}>Nenhuma entrada no período</Text>
        )}
      </View>

      {/* DETALHAMENTO DAS SAÍDAS */}
      <View style={pdfStyles.section}>
        <Text style={[pdfStyles.sectionTitle, { backgroundColor: '#FFEBEE' }]}>
          SAÍDAS DETALHADAS ({saidasPeriodo.length})
        </Text>

        {/* Cabeçalho da tabela */}
        <View
          style={[
            pdfStyles.detailRow,
            { fontWeight: 'bold', borderBottomWidth: 1 },
          ]}
        >
          <Text style={pdfStyles.date}>Data</Text>
          <Text style={pdfStyles.method}>Método</Text>
          <Text style={pdfStyles.amount}>Valor</Text>
          <Text style={pdfStyles.description}>Descrição</Text>
        </View>

        {saidasPeriodo.length > 0 ? (
          saidasPeriodo.map((movimento) => (
            <View key={movimento.id} style={pdfStyles.detailRow}>
              <Text style={pdfStyles.date}>
                {formatarDataSimples(movimento.criadoEm)}
              </Text>
              <Text style={pdfStyles.method}>
                {formatarMetodoPagamentoCompleto(
                  movimento.metodoPagamento,
                  movimento.parcelas,
                  movimento.juros
                )}
              </Text>
              <Text style={pdfStyles.amount}>
                {formatarMoeda(movimento.valor)}
              </Text>
              <Text style={pdfStyles.description}>
                {movimento.descricao ?? 'Saída'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={pdfStyles.label}>Nenhuma saída no período</Text>
        )}
      </View>

      {/* ESTATÍSTICAS */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>ESTATÍSTICAS DO PERÍODO</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Número total de transações:</Text>
          <Text style={pdfStyles.value}>
            {entradasPeriodo.length + saidasPeriodo.length}
          </Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Número de entradas:</Text>
          <Text style={pdfStyles.value}>{entradasPeriodo.length}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Número de saídas:</Text>
          <Text style={pdfStyles.value}>{saidasPeriodo.length}</Text>
        </View>
      </View>

      {/* RODAPÉ */}
      <View style={pdfStyles.footer}>
        <Text>Sistema de Caixa - Gerado automaticamente</Text>
        <Text>Documento gerado em {dataGeracao}</Text>
      </View>
    </Page>
  </Document>
);

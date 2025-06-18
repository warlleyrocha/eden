// hooks/useCaixa.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import type { MovimentoFinanceiro } from '@/@types/financeiro';

// Mapeamento de métodos de pagamento
const METODOS_PAGAMENTO_LABELS = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  DEBITO: 'Débito',
  CREDITO_AVISTA: 'Crédito à vista',
  CREDITO_PARCELADO: 'Crédito parcelado',
} as const;

export const useCaixa = () => {
  const {
    createSaida,
    fetchMovimentacoesFinanceiras,
    fetchRelatorioFinanceiro,
    movimentacoes,
    relatorio,
  } = useFinanceiro();

  // Estados do hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [valorSaida, setValorSaida] = useState('');
  const [descricaoSaida, setDescricaoSaida] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [juros, setJuros] = useState(0);
  // Estados para controlar o período do relatório
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Carrega as saídas financeiras
  useEffect(() => {
    fetchMovimentacoesFinanceiras();
    fetchRelatorioFinanceiro();
  }, [fetchMovimentacoesFinanceiras, fetchRelatorioFinanceiro]);

  // Formatação de data
  const formatarData = useCallback((dataString: string) => {
    const data = new Date(dataString);

    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return data.toLocaleString('pt-BR', options);
  }, []);

  // Formatação apenas de data (sem hora)
  const formatarDataSimples = useCallback((dataString: string) => {
    const data = new Date(dataString);

    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }

    return data.toLocaleDateString('pt-BR');
  }, []);

  // Formatação de moeda
  const formatarMoeda = useCallback((valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  }, []);

  // Normaliza o tipo de método de pagamento
  const formatarTipoMetodo = useCallback(
    (
      metodo: string,
      parcelas?: number
    ):
      | 'PIX'
      | 'DINHEIRO'
      | 'DEBITO'
      | 'CREDITO_AVISTA'
      | 'CREDITO_PARCELADO' => {
      const metodoUpper = metodo.toUpperCase();

      if (metodoUpper === 'CREDITO') {
        return parcelas && parcelas > 1
          ? 'CREDITO_PARCELADO'
          : 'CREDITO_AVISTA';
      }

      return metodoUpper as 'PIX' | 'DINHEIRO' | 'DEBITO';
    },
    []
  );

  // Formata o método de pagamento para exibição simples
  const formatarMetodoPagamento = useCallback(
    (metodo: string, parcelas?: number): string => {
      const metodoNormalizado = formatarTipoMetodo(metodo, parcelas);
      return METODOS_PAGAMENTO_LABELS[metodoNormalizado];
    },
    [formatarTipoMetodo]
  );

  // Formata o método de pagamento com detalhes (parcelas, juros)
  const formatarMetodoPagamentoCompleto = useCallback(
    (metodo: string, parcelas?: number, juros?: number): string => {
      const metodoFormatado = formatarMetodoPagamento(metodo, parcelas);
      const metodoNormalizado = formatarTipoMetodo(metodo, parcelas);

      if (metodoNormalizado === 'CREDITO_PARCELADO') {
        const detalhes = [];
        if (parcelas) detalhes.push(`${parcelas}x`);
        if (juros) detalhes.push(`${juros}% juros`);

        if (detalhes.length > 0) {
          return `${metodoFormatado} (${detalhes.join(' • ')})`;
        }
      }

      return metodoFormatado;
    },
    [formatarMetodoPagamento, formatarTipoMetodo]
  );

  // Calcula o total de entradas
  const totalEntries = useMemo(() => {
    return relatorio ? formatarMoeda(relatorio.totalEntradas || 0) : 'R$ 0,00';
  }, [relatorio, formatarMoeda]);

  // Calcula o total de saídas
  const totalSaidas = useMemo(() => {
    return relatorio ? formatarMoeda(relatorio.totalSaidas || 0) : 'R$ 0,00';
  }, [relatorio, formatarMoeda]);

  // Calcula o saldo final
  const finalBalance = useMemo(() => {
    return relatorio ? formatarMoeda(relatorio.saldo || 0) : 'R$ 0,00';
  }, [relatorio, formatarMoeda]);

  // Extrai os totais por método de pagamento do relatório
  const totalPorMetodo = relatorio?.totalPorMetodo ?? {};

  // Desestruturação dos totais por método de pagamento
  const {
    PIX = 0,
    DINHEIRO = 0,
    DEBITO = 0,
    CREDITO_AVISTA = 0,
    CREDITO_PARCELADO = 0,
  } = totalPorMetodo;

  // Calcula o total de crédito (avista + parcelado)
  const totalCredito = CREDITO_AVISTA + CREDITO_PARCELADO;

  // Manipulador de envio de saída
  const handleSaidaSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!valorSaida || isNaN(Number(valorSaida))) {
        setError('Valor inválido');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // Calcula valor final (com juros se for crédito)
        let valorFinal = Number(valorSaida);
        if (metodoPagamento === 'credito' && juros > 0) {
          valorFinal = valorFinal * (1 + juros / 100);
        }

        const payload = {
          metodoPagamento: formatarTipoMetodo(
            metodoPagamento,
            metodoPagamento === 'credito' ? parcelas : undefined
          ),
          valor: valorFinal,
          descricao: descricaoSaida,
          ...(metodoPagamento === 'credito' && {
            parcelas: Number(parcelas),
            juros: Number(juros),
          }),
        };

        await createSaida({ payload });

        // Reset dos campos após sucesso
        setValorSaida('');
        setDescricaoSaida('');
        setMetodoPagamento('pix');
        setParcelas(1);
        setJuros(0);
        setShowExitModal(false);

        toast.success('Saída registrada com sucesso!');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao registrar saída:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      valorSaida,
      metodoPagamento,
      juros,
      descricaoSaida,
      parcelas,
      formatarTipoMetodo,
      createSaida,
    ]
  );

  // Função para gerar PDF baseado no período selecionado
  const gerarPDFComPeriodo = useCallback(
    async (dataInicial: string, dataFinal: string) => {
      setIsGeneratingPDF(true);

      try {
        // Busca o relatório com o período específico
        const relatorioFiltrado = await fetchRelatorioFinanceiro({
          dataInicial,
          dataFinal,
        });

        if (!relatorioFiltrado) {
          throw new Error('Não foi possível gerar o relatório');
        }

        // Gera o conteúdo do PDF
        const periodo = `${formatarDataSimples(
          dataInicial
        )} à ${formatarDataSimples(dataFinal)}`;

        const conteudoPDF = `
RELATÓRIO DE FECHAMENTO DE CAIXA
================================================================

PERÍODO: ${periodo}
Data de Geração: ${formatarDataSimples(new Date().toISOString())}

================================================================
RESUMO FINANCEIRO
================================================================

💰 ENTRADAS
────────────────────────────────────────────────────────────────
${Object.entries(relatorioFiltrado.totalPorMetodo || {})
    .filter(([_, valor]) => valor > 0)
    .map(([metodo, valor]) => {
      const nomeMetodo =
      METODOS_PAGAMENTO_LABELS[
        metodo as keyof typeof METODOS_PAGAMENTO_LABELS
      ] || metodo;
      return `${nomeMetodo.padEnd(20)} ${formatarMoeda(valor)}`;
    })
    .join('\n')}

TOTAL DE ENTRADAS:        ${formatarMoeda(relatorioFiltrado.totalEntradas || 0)}

----------------------------------------------------------------
💸 SAÍDAS
----------------------------------------------------------------
TOTAL DE SAÍDAS:          ${formatarMoeda(relatorioFiltrado.totalSaidas || 0)}

----------------------------------------------------------------
📊 SALDO FINAL
----------------------------------------------------------------
SALDO:                    ${formatarMoeda(relatorioFiltrado.saldo || 0)}

================================================================
DETALHAMENTO DAS MOVIMENTAÇÕES
================================================================

📈 ENTRADAS DETALHADAS:
${
  movimentacoes
    .filter((m) => {
      const dataMovimento = new Date(m.criadoEm).toISOString().split('T')[0];
      return (
        m.tipo === 'ENTRADA' &&
        dataMovimento >= dataInicial &&
        dataMovimento <= dataFinal
      );
    })
    .map(
      (movimento) =>
        `${formatarDataSimples(
          movimento.criadoEm
        )} | ${formatarMetodoPagamentoCompleto(
          movimento.metodoPagamento,
          movimento.parcelas,
          movimento.juros
        )} | ${formatarMoeda(movimento.valor)} | ${
          movimento.descricao || 'Entrada'
        }`
    )
    .join('\n') || 'Nenhuma entrada no período'
}

📉 SAÍDAS DETALHADAS:
${
  movimentacoes
    .filter((m) => {
      const dataMovimento = new Date(m.criadoEm).toISOString().split('T')[0];
      return (
        m.tipo === 'SAIDA' &&
        dataMovimento >= dataInicial &&
        dataMovimento <= dataFinal
      );
    })
    .map(
      (movimento) =>
        `${formatarDataSimples(
          movimento.criadoEm
        )} | ${formatarMetodoPagamentoCompleto(
          movimento.metodoPagamento,
          movimento.parcelas,
          movimento.juros
        )} | ${formatarMoeda(movimento.valor)} | ${
          movimento.descricao || 'Saída'
        }`
    )
    .join('\n') || 'Nenhuma saída no período'
}

================================================================
ESTATÍSTICAS DO PERÍODO
================================================================

Número total de transações: ${
  movimentacoes.filter((m) => {
    const dataMovimento = new Date(m.criadoEm)
      .toISOString()
      .split('T')[0];
    return dataMovimento >= dataInicial && dataMovimento <= dataFinal;
  }).length
}

Número de entradas: ${
  movimentacoes.filter((m) => {
    const dataMovimento = new Date(m.criadoEm)
      .toISOString()
      .split('T')[0];
    return (
      m.tipo === 'ENTRADA' &&
              dataMovimento >= dataInicial &&
              dataMovimento <= dataFinal
    );
  }).length
}

Número de saídas: ${
  movimentacoes.filter((m) => {
    const dataMovimento = new Date(m.criadoEm)
      .toISOString()
      .split('T')[0];
    return (
      m.tipo === 'SAIDA' &&
              dataMovimento >= dataInicial &&
              dataMovimento <= dataFinal
    );
  }).length
}

================================================================
Sistema de Caixa - Gerado automaticamente
================================================================
      `;

        // Cria e baixa o arquivo
        const blob = new Blob([conteudoPDF], {
          type: 'text/plain;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fechamento-caixa-${dataInicial}-${dataFinal}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Relatório PDF gerado com sucesso!');
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast.error('Erro ao gerar o relatório PDF');
      } finally {
        setIsGeneratingPDF(false);
      }
    },
    [
      fetchRelatorioFinanceiro,
      movimentacoes,
      formatarDataSimples,
      formatarMoeda,
      formatarMetodoPagamentoCompleto,
    ]
  );

  // Callback para quando as datas são alteradas no CashClosureModel
  const handleDateChange = useCallback(
    (dataInicial: string, dataFinal: string) => {
      setStartDate(dataInicial);
      setEndDate(dataFinal);
    },
    []
  );

  // Download do PDF com período selecionado
  const downloadPDF = useCallback(() => {
    if (!startDate || !endDate) {
      toast.error('Por favor, selecione um período válido');
      return;
    }

    gerarPDFComPeriodo(startDate, endDate);
  }, [startDate, endDate, gerarPDFComPeriodo]);

  // Função para filtrar apenas entradas
  const filtrarEntradas = (movimentacoes: MovimentoFinanceiro[]) => {
    if (!movimentacoes || !Array.isArray(movimentacoes)) {
      return [];
    }

    return movimentacoes.filter(
      (movimentacao) => movimentacao.tipo === 'ENTRADA'
    );
  };

  // Função para filtrar apenas saídas
  const filtrarSaidas = (movimentacoes: MovimentoFinanceiro[]) => {
    if (!movimentacoes || !Array.isArray(movimentacoes)) {
      return [];
    }

    return movimentacoes.filter(
      (movimentacao) => movimentacao.tipo === 'SAIDA'
    );
  };

  // Filtrar métodos entradas
  const totalEntradaPix = filtrarEntradas(movimentacoes)
    .filter((entrada) => entrada.metodoPagamento === 'PIX')
    .reduce((total, entrada) => total + entrada.valor, 0);

  const totalEntradaDebito = filtrarEntradas(movimentacoes)
    .filter((entrada) => entrada.metodoPagamento === 'DEBITO')
    .reduce((total, entrada) => total + entrada.valor, 0);

  const totalEntradaDinheiro = filtrarEntradas(movimentacoes)
    .filter((entrada) => entrada.metodoPagamento === 'DINHEIRO')
    .reduce((total, entrada) => total + entrada.valor, 0);

  const totalEntradaCredito = filtrarEntradas(movimentacoes)
    .filter(
      (entrada) =>
        entrada.metodoPagamento === 'CREDITO_PARCELADO' ||
        entrada.metodoPagamento === 'CREDITO_AVISTA'
    )
    .reduce((total, entrada) => total + entrada.valor, 0);

  //Filtrar métodos saídas
  const totalSaidaPix = filtrarSaidas(movimentacoes)
    .filter((saida) => saida.metodoPagamento === 'PIX')
    .reduce((total, saida) => total + saida.valor, 0);

  const totalSaidaDebito = filtrarSaidas(movimentacoes)
    .filter((saida) => saida.metodoPagamento === 'DEBITO')
    .reduce((total, saida) => total + saida.valor, 0);

  const totalSaidaDinheiro = filtrarSaidas(movimentacoes)
    .filter((saida) => saida.metodoPagamento === 'DINHEIRO')
    .reduce((total, saida) => total + saida.valor, 0);

  const totalSaidaCredito = filtrarSaidas(movimentacoes)
    .filter(
      (saida) =>
        saida.metodoPagamento === 'CREDITO_PARCELADO' ||
        saida.metodoPagamento === 'CREDITO_AVISTA'
    )
    .reduce((total, saida) => total + saida.valor, 0);

  return {
    // Estados
    totalEntradaPix,
    totalEntradaDebito,
    totalEntradaDinheiro,
    totalEntradaCredito,
    totalSaidaPix,
    totalSaidaDebito,
    totalSaidaDinheiro,
    totalSaidaCredito,
    isSubmitting,
    isGeneratingPDF,
    error,
    showModal,
    showExitModal,
    totalEntries,
    totalSaidas,
    finalBalance,
    PIX,
    DINHEIRO,
    DEBITO,
    CREDITO_AVISTA,
    CREDITO_PARCELADO,
    totalCredito,
    relatorio,
    metodoPagamento,
    valorSaida,
    descricaoSaida,
    parcelas,
    juros,
    movimentacoes,
    startDate,
    endDate,

    // Setters
    setShowModal,
    setShowExitModal,
    setMetodoPagamento,
    setValorSaida,
    setDescricaoSaida,
    setParcelas,
    setJuros,
    setStartDate,
    setEndDate,

    // Funções
    filtrarEntradas,
    filtrarSaidas,
    formatarData,
    formatarDataSimples,
    formatarMoeda,
    formatarMetodoPagamento,
    formatarMetodoPagamentoCompleto,
    handleSaidaSubmit,
    handleDateChange,
    downloadPDF,
    gerarPDFComPeriodo,
  };
};

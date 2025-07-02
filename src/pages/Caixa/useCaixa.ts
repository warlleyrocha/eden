// hooks/useCaixa.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { useEstoque } from '@/hooks/useEstoque';
import { useRelatorioFechamento } from '@/hooks/useRelatorioFechamento';
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
    createEntrada,
    deleteFinanceiro,
    fetchMovimentacoes,
    fetchRelatorioHoje,
    fetchRelatorioPorPeriodo,
    movimentacoes,
    relatorio,
  } = useFinanceiro();

  const { gerarPDFComPeriodo, isGeneratingPDF } = useRelatorioFechamento();

  const { products } = useEstoque();

  // Estados do hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCashClosureModal, setShowCashClosureModal] = useState(false);
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSaidaModal, setShowSaidaModal] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [valorSaida, setValorSaida] = useState('');
  const [valorEntrada, setValorEntrada] = useState('');
  const [descricaoSaida, setDescricaoSaida] = useState('');
  const [descricaoEntrada, setDescricaoEntrada] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [juros, setJuros] = useState(0);
  // Estados para controlar o período do relatório
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [produtosSelecionados, setProdutosSelecionados] = useState<
    Array<{
      produtoId: string;
      quantidade: number;
      valorUnitario: number;
    }>
  >([]);
  const [produtoParaAdicionar, setProdutoParaAdicionar] = useState('');
  const [quantidadeParaAdicionar, setQuantidadeParaAdicionar] = useState(1);
  const [valorParaAdicionar, setValorParaAdicionar] = useState(0);

  // Carrega as saídas financeiras
  useEffect(() => {
    fetchMovimentacoes();
    fetchRelatorioHoje();
  }, [fetchMovimentacoes, fetchRelatorioHoje]);

  // Função para limpar os produtos selecionados quando fechar o modal de entrada
  const handleCloseEntradaModal = useCallback(() => {
    setShowEntradaModal(false);
    setProdutosSelecionados([]); // Limpa o array de produtos selecionados
  }, []);

  const adicionarProduto = useCallback(() => {
    if (
      produtoParaAdicionar &&
      quantidadeParaAdicionar > 0 &&
      valorParaAdicionar > 0
    ) {
      setProdutosSelecionados((prev) => [
        ...prev,
        {
          produtoId: produtoParaAdicionar,
          quantidade: quantidadeParaAdicionar,
          valorUnitario: valorParaAdicionar,
        },
      ]);
      setProdutoParaAdicionar('');
      setQuantidadeParaAdicionar(1);
      setValorParaAdicionar(0);
    }
  }, [produtoParaAdicionar, quantidadeParaAdicionar, valorParaAdicionar]);

  const removerProduto = useCallback((index: number) => {
    setProdutosSelecionados((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Função para calcular o valor total dos produtos selecionados
  const calcularValorTotalProdutos = useCallback(() => {
    return produtosSelecionados.reduce((total, item) => {
      return total + item.quantidade * item.valorUnitario;
    }, 0);
  }, [produtosSelecionados]);

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
  const totalEntradas = useMemo(() => {
    return relatorio ? formatarMoeda(relatorio.totalEntradas || 0) : 'R$ 0,00';
  }, [relatorio, formatarMoeda]);

  // Calcula o total de saídas
  const totalSaidas = useMemo(() => {
    return relatorio ? formatarMoeda(relatorio.totalSaidas || 0) : 'R$ 0,00';
  }, [relatorio, formatarMoeda]);

  // Calcula o saldo final
  const saldoFinal = useMemo(() => {
    return relatorio ? formatarMoeda(relatorio.saldo || 0) : 'R$ 0,00';
  }, [relatorio, formatarMoeda]);

  // Extrai os totais por método de pagamento do relatório
  const totalPorMetodoEntrada = relatorio?.totalPorMetodoEntrada ?? {};
  const totalPorMetodoSaida = relatorio?.totalPorMetodoSaida ?? {};

  // Desestruturação dos totais por método de pagamento
  const {
    PIX: pixEntrada = 0,
    DINHEIRO: dinheiroEntrada = 0,
    DEBITO: debitoEntrada = 0,
    CREDITO_AVISTA: creditoAvistaEntrada = 0,
    CREDITO_PARCELADO: creditoParceladoEntrada = 0,
  } = totalPorMetodoEntrada;

  const {
    PIX: pixSaida = 0,
    DINHEIRO: dinheiroSaida = 0,
    DEBITO: debitoSaida = 0,
    CREDITO_AVISTA: creditoAvistaSaida = 0,
    CREDITO_PARCELADO: creditoParceladoSaida = 0,
  } = totalPorMetodoSaida;

  // Calcula o total de crédito (avista + parcelado)
  const totalCreditoEntrada = creditoAvistaEntrada + creditoParceladoEntrada;
  const totalCreditoSaida = creditoAvistaSaida + creditoParceladoSaida;

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
        setShowSaidaModal(false);

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

  //Manipulador de envio de entrada
  const handleEntradaSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const valorTotalProdutos = calcularValorTotalProdutos();
      const temProdutos = produtosSelecionados.length > 0;

      // Se tem produtos, usa o valor total dos produtos; senão, usa o valor manual
      const valorParaEnvio = temProdutos
        ? valorTotalProdutos
        : Number(valorEntrada);

      if (!temProdutos && (!valorEntrada || isNaN(Number(valorEntrada)))) {
        setError('Valor inválido');
        return;
      }

      if (temProdutos && valorTotalProdutos <= 0) {
        setError('Adicione produtos com valores válidos');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // Calcula valor final (com juros se for crédito)
        let valorFinal = valorParaEnvio;
        if (metodoPagamento === 'credito' && juros > 0) {
          valorFinal = valorFinal * (1 + juros / 100);
        }

        const payload = {
          metodoPagamento: formatarTipoMetodo(
            metodoPagamento,
            metodoPagamento === 'credito' ? parcelas : undefined
          ),
          valor: valorFinal,
          descricao: descricaoEntrada,
          ...(metodoPagamento === 'credito' && {
            parcelas: Number(parcelas),
            juros: Number(juros),
          }),
          // Adicionar os arrays de produtos e quantidades
          ...(produtosSelecionados.length > 0 && {
            produtosIds: produtosSelecionados.map((p) => p.produtoId),
            quantidades: produtosSelecionados.map((p) => p.quantidade),
            valoresUnitarios: produtosSelecionados.map((p) => p.valorUnitario),
          }),
        };

        console.log('Payload', payload);
        await createEntrada({ payload });

        // Reset dos campos após sucesso
        setValorEntrada('');
        setDescricaoEntrada('');
        setMetodoPagamento('pix');
        setParcelas(1);
        setJuros(0);
        setShowEntradaModal(false);
        setProdutosSelecionados([]);
        setProdutoParaAdicionar('');
        setQuantidadeParaAdicionar(1);
        setValorParaAdicionar(0);

        toast.success('Venda registrada com sucesso!');
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
      valorEntrada,
      metodoPagamento,
      juros,
      descricaoEntrada,
      parcelas,
      produtosSelecionados,
      calcularValorTotalProdutos,
      formatarTipoMetodo,
      createEntrada,
    ]
  );

  // Download do PDF com período selecionado
  const downloadPDF = useCallback(() => {
    if (!startDate || !endDate) {
      toast.error('Por favor, selecione um período válido');
      return;
    }

    gerarPDFComPeriodo(
      startDate,
      endDate,
      fetchRelatorioPorPeriodo,
      movimentacoes,
      formatarDataSimples,
      formatarMoeda,
      formatarMetodoPagamentoCompleto,
      METODOS_PAGAMENTO_LABELS
    );
  }, [
    startDate,
    endDate,
    gerarPDFComPeriodo,
    fetchRelatorioPorPeriodo,
    movimentacoes,
    formatarDataSimples,
    formatarMoeda,
    formatarMetodoPagamentoCompleto,
  ]);

  // Callback para quando as datas são alteradas no CashClosureModel
  const handleDateChange = useCallback(
    (dataInicial: string, dataFinal: string) => {
      setStartDate(dataInicial);
      setEndDate(dataFinal);
    },
    []
  );

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
    isSubmitting,
    isGeneratingPDF,
    error,
    showCashClosureModal,
    showSaidaModal,
    showEntradaModal,
    produtosSelecionados,
    produtoParaAdicionar,
    quantidadeParaAdicionar,
    valorParaAdicionar,
    products,

    // Referente ao estado *relatorio¹* do hook useFinanceiro
    totalEntradas,
    totalSaidas,
    saldoFinal,

    pixEntrada,
    dinheiroEntrada,
    debitoEntrada,
    totalCreditoEntrada,

    pixSaida,
    dinheiroSaida,
    debitoSaida,
    totalCreditoSaida,

    // Referente ao estado *movimentacoes²* do hook useFinanceiro
    totalEntradaPix,
    totalEntradaDinheiro,
    totalEntradaDebito,
    totalEntradaCredito,

    totalSaidaPix,
    totalSaidaDinheiro,
    totalSaidaDebito,
    totalSaidaCredito,

    relatorio /* 1* */,
    movimentacoes /* 2* */,
    metodoPagamento,
    valorSaida,
    descricaoSaida,
    valorEntrada,
    descricaoEntrada,
    parcelas,
    juros,
    startDate,
    endDate,

    // Setters
    setShowCashClosureModal,
    setShowSaidaModal,
    setShowEntradaModal,
    setMetodoPagamento,
    setValorSaida,
    setDescricaoSaida,
    setValorEntrada,
    setDescricaoEntrada,
    setParcelas,
    setJuros,
    setStartDate,
    setEndDate,
    setProdutosSelecionados,
    setProdutoParaAdicionar,
    setQuantidadeParaAdicionar,
    setValorParaAdicionar,

    // Funções
    filtrarEntradas,
    filtrarSaidas,
    formatarData,
    formatarDataSimples,
    formatarMoeda,
    formatarMetodoPagamento,
    formatarMetodoPagamentoCompleto,
    handleSaidaSubmit,
    handleEntradaSubmit,
    handleCloseEntradaModal,
    handleDateChange,
    downloadPDF,
    gerarPDFComPeriodo,
    adicionarProduto,
    removerProduto,
    deleteFinanceiro,
    calcularValorTotalProdutos,
  };
};

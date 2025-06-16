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
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [valorSaida, setValorSaida] = useState('');
  const [descricaoSaida, setDescricaoSaida] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [juros, setJuros] = useState(0);

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

  // Exporta para PDF (simulação)
  const exportToPDF = useCallback(() => {
    const content = `
      Resumo do Caixa
      Entradas por Método de Pagamento

      Total de Entradas: R$ ${totalEntries}
      Total de Saídas: R$ ${totalSaidas}
      Saldo: R$ ${finalBalance}
      Data de Fechamento: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resumo_do_caixa.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [totalEntries, totalSaidas, finalBalance]);

  // Download do PDF
  const downloadPDF = useCallback(() => {
    exportToPDF();
  }, [exportToPDF]);

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

    // Setters
    setShowModal,
    setShowExitModal,
    setMetodoPagamento,
    setValorSaida,
    setDescricaoSaida,
    setParcelas,
    setJuros,

    // Funções
    filtrarEntradas,
    filtrarSaidas,
    formatarData,
    formatarMoeda,
    formatarMetodoPagamento,
    formatarMetodoPagamentoCompleto,
    handleSaidaSubmit,
    downloadPDF,
  };
};

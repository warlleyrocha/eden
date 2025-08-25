import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useReducer,
  useRef,
} from 'react';

import { getStoreId } from '@/utils/getStoreId';

import { useClients } from '@/hooks/useCliente';
import { useOrcamento } from '@/hooks/useOrcamento';

import type { Client } from '@/@types/clients';
import type {
  Orcamento,
  OrcamentoRenderDetails,
  CreateOrcamento,
} from '@/@types/orcamento';
import type { SetStateAction, Dispatch } from 'react';

import axios from 'axios';
interface OrcamentoProduto {
  name: string;
  value: string;
  unitPrice: string;
  quantity?: string;
}

interface Servico {
  description: string;
  value: string;
}

interface ProductType {
  id: string;
  nome: string;
  precoCusto: number;
  estoque?: number; // Adicionado campo de estoque
}

type PagamentoAction =
  | {
      type: 'SET_FIELD';
      field: keyof PagamentoState;
      value: number | string | boolean;
    }
  | { type: 'RESET' }
  | { type: 'SET_TOTAL'; total: number };

interface UseTableLogicProps {
  formattedClients: Client[];
  formattedOrcamentos: Omit<OrcamentoRenderDetails, 'telefone'>[];
  onSubmitOrcamento?: (orcamentoData: CreateOrcamento) => Promise<void>;
  isSubmitting?: boolean;
  setIsSubmitting?: (isSubmitting: boolean) => void;
  products: ProductType[];
}

interface PagamentoState {
  valorEntrada: string;
  descricaoEntrada: string;
  metodoPagamento: string;
  parcelas: number;
  juros: number;
  registroConcluido: boolean;
  totalCalculado: number;
}

const initialPagamentoState: PagamentoState = {
  valorEntrada: '',
  descricaoEntrada: '',
  metodoPagamento: '',
  parcelas: 1,
  juros: 0,
  registroConcluido: false,
  totalCalculado: 0,
};

function pagamentoReducer(
  state: PagamentoState,
  action: PagamentoAction
): PagamentoState {
  switch (action.type) {
  case 'SET_FIELD':
    return { ...state, [action.field]: action.value };
  case 'RESET':
    return initialPagamentoState;
  case 'SET_TOTAL':
    return {
      ...state,
      totalCalculado: action.total,
      valorEntrada: action.total.toString(),
    };
  default:
    return state;
  }
}

export function useTableLogic({
  formattedClients,
  formattedOrcamentos,
  onSubmitOrcamento,
  products,
}: UseTableLogicProps) {
  // 🔧 Usando refs para evitar re-renderizações desnecessárias
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);

  // 🔧 Hooks externos chamados apenas uma vez no topo
  const { clients } = useClients();
  const { getOrcamentoById } = useOrcamento();

  // Estados locais
  const [modalState, setModalState] = useState({
    isModalOpen: false,
    isModalOpenDetails: false,
    showExitModal: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({});
  const [orcamentoSelecionadoId, setOrcamentoSelecionadoId] = useState<
    string | null
  >(null);

  const [orcamentoProdutos, setOrcamentoProdutos] = useState<
    OrcamentoProduto[]
  >([{ name: '', value: '', unitPrice: '', quantity: '' }]);
  const [services, setServices] = useState<Servico[]>([
    { description: '', value: '' },
  ]);

  const [pagamentoState, dispatchPagamento] = useReducer(
    pagamentoReducer,
    initialPagamentoState
  );

  // 🔧 useEffect para cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Adicione este useMemo logo após os estados, antes do filteredClients
  const orcamentosComNumeracao = useMemo(() => {
    return formattedOrcamentos.map((orcamento, index) => ({
      ...orcamento,
      numeroSequencial: formattedOrcamentos.length - index,
    }));
  }, [formattedOrcamentos]);

  // 🔧 Filtros otimizados com debounce implícito
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return formattedClients;
    const lowerSearch = searchTerm.toLowerCase().trim();
    return formattedClients.filter((c) =>
      c?.nome?.toLowerCase().includes(lowerSearch)
    );
  }, [formattedClients, searchTerm]);

  const filteredOrcamentos = useMemo(() => {
    if (!searchTerm.trim()) return orcamentosComNumeracao;
    const lowerSearch = searchTerm.toLowerCase().trim();

    return orcamentosComNumeracao.filter((o) => {
      const clienteNome = o.cliente?.nome?.toLowerCase() ?? '';
      const status = o.status?.toLowerCase() ?? '';
      const total = o.total?.toString() ?? '';
      const data = o.criadoEm ?? '';
      const dataFormatada = o.criadoEm
        ? new Date(o.criadoEm).toLocaleDateString('pt-BR')
        : '';

      return (
        clienteNome.includes(lowerSearch) ||
        status.includes(lowerSearch) ||
        total.includes(lowerSearch) ||
        data.includes(lowerSearch) ||
        dataFormatada.includes(lowerSearch)
      );
    });
  }, [orcamentosComNumeracao, searchTerm]);

  // 🔧 Funções de modal estáveis
  const modalActions = useMemo(
    () => ({
      toggleModal: () =>
        setModalState((prev) => ({ ...prev, isModalOpen: !prev.isModalOpen })),
      toggleModalDetails: () =>
        setModalState((prev) => ({
          ...prev,
          isModalOpenDetails: !prev.isModalOpenDetails,
        })),
      setIsModalOpen: (value: boolean) =>
        setModalState((prev) => ({ ...prev, isModalOpen: value })),
      setIsModalOpenDetails: (value: boolean) =>
        setModalState((prev) => ({
          ...prev,
          isModalOpenDetails: value,
        })),
      setShowExitModal: (value: boolean | ((prevState: boolean) => boolean)) =>
        setModalState((prev) => ({
          ...prev,
          showExitModal:
            typeof value === 'function' ? value(prev.showExitModal) : value,
        })),
    }),
    []
  );

  // 🔧 handleOpenModalDetails otimizado
  const handleOpenModalDetails = useCallback(
    async (orcamentoId: string) => {
      if (!mountedRef.current) return;

      try {
        const orcamento = await getOrcamentoById(orcamentoId);
        if (orcamento && mountedRef.current) {
          setSelectedOrcamento(orcamento);
          modalActions.toggleModalDetails();
        }
      } catch (error) {
        console.error('Erro ao buscar orçamento:', error);
      }
    },
    [getOrcamentoById, modalActions]
  );

  // 🔧 validateStock com cache simples
  const validateStock = useCallback(() => {
    const errors: Record<string, string> = {};

    for (const item of orcamentoProdutos) {
      if (!item.value || !item.quantity) continue;

      const produto = products.find((p) => p.id === item.value);
      const quantidade = Number(item.quantity);

      if (
        produto &&
        produto.estoque !== undefined &&
        produto.estoque < quantidade
      ) {
        errors[
          item.value
        ] = `Estoque insuficiente (${produto.estoque} disponíveis)`;
      }
    }

    setStockErrors((prevErrors) => {
      // Só atualiza se houver mudanças
      const hasChanges =
        Object.keys(errors).length !== Object.keys(prevErrors).length ||
        Object.keys(errors).some((key) => errors[key] !== prevErrors[key]);

      return hasChanges ? errors : prevErrors;
    });

    return Object.keys(errors).length === 0;
  }, [orcamentoProdutos, products]);

  // 🔧 useEffect otimizado para validação
  useEffect(() => {
    if (orcamentoProdutos.some((p) => p.value && p.quantity)) {
      validateStock();
    }
  }, [orcamentoProdutos, products, validateStock]);

  // 🔧 calculateTotal memoizado
  const calculateTotal = useCallback(() => {
    const totalProdutos = orcamentoProdutos.reduce((acc, item) => {
      const preco = parseFloat(item.unitPrice) || 0;
      const quantidade = parseInt(item.quantity ?? '1') || 0;
      return acc + preco * quantidade;
    }, 0);

    const totalServicos = services.reduce((acc, item) => {
      return acc + (parseFloat(item.value) || 0);
    }, 0);

    return totalProdutos + totalServicos;
  }, [orcamentoProdutos, services]);

  // 🔧 Funções de pagamento otimizadas
  const pagamentoActions = useMemo(
    () => ({
      setValorEntrada: (value: SetStateAction<string>) => {
        const newValue =
          typeof value === 'function'
            ? value(pagamentoState.valorEntrada)
            : value;
        dispatchPagamento({
          type: 'SET_FIELD',
          field: 'valorEntrada',
          value: newValue,
        });
      },

      setDescricaoEntrada: (value: SetStateAction<string>) => {
        const newValue =
          typeof value === 'function'
            ? value(pagamentoState.descricaoEntrada)
            : value;
        dispatchPagamento({
          type: 'SET_FIELD',
          field: 'descricaoEntrada',
          value: newValue,
        });
      },

      setMetodoPagamento: (value: SetStateAction<string>) => {
        const newValue =
          typeof value === 'function'
            ? value(pagamentoState.metodoPagamento)
            : value;
        dispatchPagamento({
          type: 'SET_FIELD',
          field: 'metodoPagamento',
          value: newValue,
        });
      },

      setParcelas: (value: SetStateAction<number>) => {
        const newValue =
          typeof value === 'function' ? value(pagamentoState.parcelas) : value;
        dispatchPagamento({
          type: 'SET_FIELD',
          field: 'parcelas',
          value: newValue,
        });
      },

      setJuros: (value: SetStateAction<number>) => {
        const newValue =
          typeof value === 'function' ? value(pagamentoState.juros) : value;
        dispatchPagamento({
          type: 'SET_FIELD',
          field: 'juros',
          value: newValue,
        });
      },

      setRegistroConcluido: (value: SetStateAction<boolean>) => {
        const newValue =
          typeof value === 'function'
            ? value(pagamentoState.registroConcluido)
            : value;
        dispatchPagamento({
          type: 'SET_FIELD',
          field: 'registroConcluido',
          value: newValue,
        });
      },

      reset: () => dispatchPagamento({ type: 'RESET' }),
    }),
    [pagamentoState]
  ) as {
    setValorEntrada: Dispatch<SetStateAction<string>>;
    setDescricaoEntrada: Dispatch<SetStateAction<string>>;
    setMetodoPagamento: Dispatch<SetStateAction<string>>;
    setParcelas: Dispatch<SetStateAction<number>>;
    setJuros: Dispatch<SetStateAction<number>>;
    setRegistroConcluido: Dispatch<SetStateAction<boolean>>;
    reset: () => void;
  };

  // 🔧 resetForm otimizado
  const resetForm = useCallback(() => {
    setModalState((prev) => ({ ...prev, isModalOpen: false }));
    setSelectedClient('');
    setOrcamentoProdutos([
      { name: '', value: '', unitPrice: '', quantity: '' },
    ]);
    setServices([{ description: '', value: '' }]);
    pagamentoActions.reset();
  }, [pagamentoActions]);

  // 🔧 handleSubmissionError otimizado
  const handleSubmissionError = useCallback((error: unknown) => {
    console.error('Erro ao criar orçamento:', error);

    let message = 'Erro desconhecido ao criar orçamento';

    if (error instanceof Error) {
      message = error.message;
    } else if (axios.isAxiosError(error)) {
      message = error.response?.data?.message ?? 'Erro na requisição';
    }

    alert(message);
  }, []);

  // 🔧 handleGenerateOrcamento com proteção contra múltiplas chamadas
  const handleGenerateOrcamento = useCallback(async () => {
    // Proteção contra múltiplas submissões
    if (submittingRef.current || isSubmitting || !mountedRef.current) {
      console.warn('Bloqueado por estado:', {
        submittingRef: submittingRef.current,
        isSubmitting,
        mountedRef: mountedRef.current,
      });
      return;
    }

    // Validações
    if (!selectedClient) {
      alert('Selecione um cliente');
      return;
    }

    const lojaId = getStoreId();
    if (!lojaId) {
      alert('Loja não identificada');
      return;
    }

    if (orcamentoProdutos.length === 0 && services.length === 0) {
      alert('Adicione pelo menos um item ou serviço');
      return;
    }

    const clienteSelecionado = clients.find((c) => c.nome === selectedClient);
    if (!clienteSelecionado) {
      alert('Cliente não encontrado');
      return;
    }

    if (!onSubmitOrcamento) {
      console.error('Callback onSubmitOrcamento não fornecido');
      alert('Erro de configuração: callback não fornecido');
      return;
    }

    // Marca como submitting
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const newOrcamento: CreateOrcamento = {
        clienteId: clienteSelecionado.id.toString(),
        lojaId,
        status: 'ABERTO',
        descricao: pagamentoState.descricaoEntrada,
        metodoPagamento: pagamentoState.metodoPagamento.toUpperCase(),
        numeroParcelas: pagamentoState.parcelas,
        taxaJuros: pagamentoState.juros,
        itens: orcamentoProdutos
          .filter((p) => p.value && p.quantity)
          .map((p) => ({
            produtoId: p.value,
            quantidade: Math.max(1, Number(p.quantity)) || 1,
            precoUnitario: parseFloat(p.unitPrice || '0'),
          })),
        servicos: services
          .filter((s) => s.description && s.value)
          .map((s) => ({
            descricao: s.description,
            valor: parseFloat(s.value),
          })),
      };

      await onSubmitOrcamento(newOrcamento);

      if (mountedRef.current) {
        resetForm();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      if (mountedRef.current) {
        handleSubmissionError(error);
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    isSubmitting,
    selectedClient,
    pagamentoState.descricaoEntrada,
    pagamentoState.metodoPagamento,
    pagamentoState.parcelas,
    pagamentoState.juros,
    orcamentoProdutos,
    services,
    onSubmitOrcamento,
    clients,
    resetForm,
    handleSubmissionError,
  ]);

  // 🔧 handleOpenPaymentModal otimizado
  const handleOpenPaymentModal = useCallback(() => {
    const total = calculateTotal();
    if (total <= 0) {
      alert('Adicione pelo menos um produto ou serviço com valor válido');
      return;
    }
    dispatchPagamento({ type: 'SET_TOTAL', total });
    modalActions.setShowExitModal(true);
  }, [calculateTotal, modalActions]);

  const handleEntradaSubmit = useCallback(() => {
    modalActions.setShowExitModal(false);
  }, [modalActions]);

  // 🔧 Retorno estável e otimizado
  return useMemo(
    () => ({
      // Dados
      products,
      filteredClients,
      filteredOrcamentos,
      selectedOrcamento,
      stockErrors,

      // Estados de modal
      isModalOpen: modalState.isModalOpen,
      isModalOpenDetails: modalState.isModalOpenDetails,
      showExitModal: modalState.showExitModal,

      // Estados de formulário
      searchTerm,
      selectedClient,
      orcamentoSelecionadoId,
      orcamentoProdutos,
      services,
      isSubmitting,

      // Estados de pagamento
      valorEntrada: pagamentoState.valorEntrada,
      descricaoEntrada: pagamentoState.descricaoEntrada,
      metodoPagamento: pagamentoState.metodoPagamento,
      parcelas: pagamentoState.parcelas,
      juros: pagamentoState.juros,
      registroConcluido: pagamentoState.registroConcluido,
      totalCalculado: pagamentoState.totalCalculado,

      // Setters básicos (estes podem causar re-render, mas são necessários)
      setSearchTerm,
      setSelectedClient,
      setOrcamentoSelecionadoId,
      setOrcamentoProdutos,
      setServices,
      setIsSubmitting,

      // Actions estáveis
      ...modalActions,
      ...pagamentoActions,

      // Funções computadas estáveis
      handleOpenModalDetails,
      handleGenerateOrcamento,
      handleEntradaSubmit,
      handleOpenPaymentModal,
      calculateTotal,
    }),
    [
      // Dependências que realmente podem mudar
      products,
      filteredClients,
      filteredOrcamentos,
      selectedOrcamento,
      stockErrors,
      modalState,
      searchTerm,
      selectedClient,
      orcamentoSelecionadoId,
      orcamentoProdutos,
      services,
      isSubmitting,
      pagamentoState,
      modalActions,
      pagamentoActions,
      handleOpenModalDetails,
      handleGenerateOrcamento,
      handleEntradaSubmit,
      handleOpenPaymentModal,
      calculateTotal,
    ]
  );
}

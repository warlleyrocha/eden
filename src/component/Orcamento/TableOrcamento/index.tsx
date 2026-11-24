import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { FileText, Plus, Printer, Trash2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SectionCard } from '@/components/app/section-card';
import { SearchInput } from '@/components/app/search-input';
import { EmptyState } from '@/components/app/empty-state';
import { OrcamentoStatusBadge } from '@/components/app/status-badge';
import { ConfirmDialog } from '@/component/ConfirmDialog';

import OrcamentoPrintContent from '../PrintOrcamento';
import FormOrcamento from '../FormOrcamento';
import { TableRowOrcamento } from '../TableRowOrcamento';

import { formatCpfCnpj } from '@/utils/formatCpfCnpj';
import { formatarMoeda } from '@/utils/formatters';
import {
  updateItem,
  removeItem,
  addItem,
} from '@/utils/handlersOrcamentoForms';

import { useTableLogic } from './useTableLogic';

import type { Client } from '@/@types/clients';
import type { ProductType } from '@/@types/product';
import type {
  OrcamentoRenderDetails,
  CreateOrcamento,
} from '@/@types/orcamento';

interface TableProps {
  formattedClients?: Client[];
  formattedOrcamentos: OrcamentoRenderDetails[];
  onSubmitOrcamento?: (orcamentoData: CreateOrcamento) => Promise<void>;
  onDeleteOrcamento: (id: string) => void;
  // Novos props para evitar requisições desnecessárias
  products?: ProductType[];
  storeData?: {
    nome: string;
    email: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    subTitulo: string;
  };
}

function TableOrcamento({
  formattedClients = [],
  formattedOrcamentos,
  onDeleteOrcamento,
  onSubmitOrcamento,
  products: externalProducts, // Receber produtos do componente pai
  storeData: externalStoreData, // Receber dados da loja do componente pai
}: TableProps) {
  const products = useMemo(() => {
    return externalProducts || [];
  }, [externalProducts]);

  // Hooks personalizados para lógica da tabela
  const {
    //Estados
    isModalOpen,
    isSubmitting,
    stockErrors,
    searchTerm,
    selectedOrcamento,
    selectedClient,
    orcamentoProdutos,
    services,
    showExitModal,
    valorEntrada,
    descricaoEntrada,
    metodoPagamento,
    parcelas,
    juros,
    registroConcluido,
    filteredOrcamentos,

    // Setters
    setSearchTerm,
    setSelectedClient,
    setSelectedOrcamento,
    setOrcamentoProdutos,
    setServices,
    setShowExitModal,
    setValorEntrada,
    setDescricaoEntrada,
    setMetodoPagamento,
    setParcelas,
    setJuros,
    setRegistroConcluido,

    // Funções
    toggleModal,
    handleGenerateOrcamento,
    handleEntradaSubmit,
    handleOpenPaymentModal,
    handleOpenModalDetails,
  } = useTableLogic({
    products,
    formattedClients,
    formattedOrcamentos,
    onSubmitOrcamento,
  });

  const [shouldPrint, setShouldPrint] = useState(false);

  // Usar dados da loja externos se disponíveis
  const storeData = useMemo(() => {
    if (externalStoreData) {
      return externalStoreData;
    }
    // Fallback: usar hook apenas se não tiver dados externos
    // IMPORTANTE: Mova esta lógica para o componente pai
    return {
      nome: '',
      email: '',
      cnpj: '',
      endereco: '',
      subTitulo: '',
      telefone: '',
    };
  }, [externalStoreData]);

  // Memoriza as informações da empresa
  const empresaInfo = useMemo(
    () => ({
      nome: storeData.nome,
      cnpj: formatCpfCnpj(storeData.cnpj),
      endereco: storeData.endereco,
      subTitulo: storeData.subTitulo,
      telefone: '00 00000-0000',
      email: storeData.email,
      data: '2023-10-01',
    }),
    [
      storeData.nome,
      storeData.email,
      storeData.cnpj,
      storeData.endereco,
      storeData.subTitulo,
    ]
  );

  const orcamentoInfo = useMemo(() => {
    const o = selectedOrcamento;

    return {
      index: o ? filteredOrcamentos.findIndex((x) => x.id === o.id) : 0,
      totalOrcamentos: o ? filteredOrcamentos.length : 0,
      orcamentoId: o?.id ?? '',
      cliente: {
        id: o?.cliente?.id ?? '',
        nome: o?.cliente?.nome ?? 'Cliente não informado',
        telefone: o?.cliente?.telefone ?? 'Não informado',
        endereco: o?.cliente?.endereco ?? 'Não informado',
      },
      date: o?.criadoEm
        ? new Date(o.criadoEm).toLocaleDateString('pt-BR')
        : 'Data não informada',
      itens:
        o?.itens?.map((item) => ({
          produtoId: item.produtoId,
          nome: item.nomeProduto ?? 'Produto sem nome',
          precoUnitario: item.precoUnitario,
          quantidade: item.quantidade,
          valorTotal: item.precoUnitario * item.quantidade,
        })) || [],
      servicos:
        o?.servicos?.map((s) => ({
          descricao: s.descricao,
          valor: s.valor,
        })) || [],
      total: o?.total ?? 0,
      lojaId: o?.lojaId ?? '',
      descricao: o?.descricao ?? '',
      metodoPagamento: o?.metodoPagamento ?? '',
      numeroParcelas: o?.numeroParcelas ?? 1,
      status: o?.status ?? 'pendente',
    };
  }, [selectedOrcamento, filteredOrcamentos]);

  // Handler para mudança do cliente
  const handleClientChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setSelectedClient(e.target.value),
    [setSelectedClient]
  );

  // Produtos
  const handleProductUpdate = updateItem(setOrcamentoProdutos);
  const handleProductRemove = removeItem(setOrcamentoProdutos);
  const handleAddProduct = addItem(setOrcamentoProdutos, {
    name: '',
    value: '',
    unitPrice: '',
    quantity: '',
  });

  // Serviços
  const handleServiceUpdate = updateItem(setServices);
  const handleServiceRemove = removeItem(setServices);
  const handleAddService = addItem(setServices, { description: '', value: '' });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Orcamento',
    onAfterPrint: () => {
      // Limpar o estado depois da impressão
      setSelectedOrcamento(null);
      setShouldPrint(false);
    },
  });

  const onPrint = useCallback(
    (orcamentoId: string) => {
      // Atualiza o selectedOrcamento primeiro
      handleOpenModalDetails(orcamentoId);
      setShouldPrint(true); // Marca que queremos imprimir assim que os dados carregarem
    },
    [handleOpenModalDetails]
  );

  // Assim que selectedOrcamento mudar, dispara o print
  useEffect(() => {
    if (shouldPrint && selectedOrcamento) {
      handlePrint();
      setShouldPrint(false); // Reseta o gatilho
    }
  }, [shouldPrint, selectedOrcamento, handlePrint]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const temBusca = searchTerm.trim() !== '';

  return (
    <>
      <SectionCard
        title="Orçamentos"
        description={
          temBusca
            ? `${filteredOrcamentos.length} de ${formattedOrcamentos.length} orçamentos`
            : `${formattedOrcamentos.length} orçamento${formattedOrcamentos.length === 1 ? '' : 's'}`
        }
        flush
        actions={
          <>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por cliente, status ou data..."
              className="sm:w-80"
            />
            <Button onClick={toggleModal}>
              <Plus /> Novo orçamento
            </Button>
          </>
        }
      >
        {filteredOrcamentos.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title={temBusca ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento criado'}
            description={
              temBusca
                ? 'Tente buscar por outro cliente, status ou data.'
                : 'Crie um orçamento para enviar ao cliente.'
            }
            action={
              temBusca ? (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              ) : (
                <Button size="sm" onClick={toggleModal}>
                  <Plus /> Novo orçamento
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop / tablet */}
            <div className="hidden md:block">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 pl-6">Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrcamentos.map((orcamento) => (
                    <TableRowOrcamento
                      key={orcamento.id}
                      orcamento={orcamento}
                      numeroSequencial={orcamento.numeroSequencial}
                      onPrint={onPrint}
                      onDeleteOrcamento={setDeleteId}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: cards */}
            <ul className="divide-y divide-border border-t border-border md:hidden">
              {filteredOrcamentos.map((orcamento) => (
                <li key={orcamento.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {orcamento.cliente?.nome ?? 'Cliente não informado'}
                      </p>
                      <p className="tabular text-xs text-foreground-secondary">
                        #{orcamento.numeroSequencial} ·{' '}
                        {new Date(orcamento.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <OrcamentoStatusBadge status={orcamento.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="tabular text-lg font-semibold">
                      {formatarMoeda(orcamento.total)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onPrint(orcamento.id)}
                        aria-label="Imprimir orçamento"
                      >
                        <Printer />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setDeleteId(orcamento.id)}
                        aria-label="Excluir orçamento"
                        className="hover:border-danger/40 hover:bg-danger-bg hover:text-danger-foreground"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionCard>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir orçamento"
        description="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (deleteId) onDeleteOrcamento(deleteId);
          setDeleteId(null);
        }}
      />

      {isModalOpen && (
        <FormOrcamento
          isOpen={isModalOpen}
          onClose={toggleModal}
          // Estados básicos
          selectedClient={selectedClient}
          formattedClients={formattedClients}
          orcamentoProdutos={orcamentoProdutos}
          services={services}
          products={products}
          stockErrors={stockErrors}
          // Estados do pagamento
          registroConcluido={registroConcluido}
          showExitModal={showExitModal}
          valorEntrada={valorEntrada}
          descricaoEntrada={descricaoEntrada}
          metodoPagamento={metodoPagamento}
          parcelas={parcelas}
          juros={juros}
          isSubmitting={isSubmitting}
          // Handlers
          onClientChange={handleClientChange}
          onProductUpdate={handleProductUpdate}
          onProductRemove={handleProductRemove}
          onServiceUpdate={handleServiceUpdate}
          onServiceRemove={handleServiceRemove}
          onAddProduct={handleAddProduct}
          onAddService={handleAddService}
          onOpenPaymentModal={handleOpenPaymentModal}
          onEntradaSubmit={handleEntradaSubmit}
          onGenerateClick={handleGenerateOrcamento}
          // Setters
          setShowExitModal={setShowExitModal}
          setValorEntrada={setValorEntrada}
          setDescricaoEntrada={setDescricaoEntrada}
          setMetodoPagamento={setMetodoPagamento}
          setParcelas={setParcelas}
          setJuros={setJuros}
          setRegistroConcluido={setRegistroConcluido}
        />
      )}

      {/* Conteúdo que será impresso */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <OrcamentoPrintContent
            empresaInfo={empresaInfo}
            orcamentoInfo={orcamentoInfo}
          />
        </div>
      </div>
    </>
  );
}

export default memo(TableOrcamento);

import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { FileText, Search, Trash } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import OrcamentoPrintContent from '../PrintOrcamento';
import FormOrcamento from '../FormOrcamento';
import { TableRowOrcamento } from '../TableRowOrcamento';

import { formatCpfCnpj } from '@/utils/formatCpfCnpj';
import { formatarDataSegura } from '@/utils/date';
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
      console.log('Imprimindo orçamento: ', orcamentoId);
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

  return (
    <div className="flex-1">
      {/* 🔍 Barra de busca e botão */}
      <div className="flex flex-row justify-between gap-2 pb-6">
        {/* Campo de busca */}
        <div className="relative w-full sm:w-[30%]">
          <Input
            type="text"
            placeholder="Buscar orçamentos"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full bg-white placeholder:text-[#55575c] pl-10 pr-3 sm:pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Botão novo orçamento */}
        <div>
          <Button
            onClick={toggleModal}
            className="flex items-center sm:space-x-2 bg-[#1E3A8A] text-white hover:bg-[#152C6B] px-3 sm:px-4 py-2 rounded-lg cursor-pointer text-sm sm:text-base"
          >
            <FileText className="mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* 🖥️ Lista em Tabela (Desktop/Tablet) */}
      <div className="hidden md:block bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-gray-100 text-center">
                <TableCell className="py-3 px-4  font-semibold">ID</TableCell>
                <TableCell className="py-3 px-4  font-semibold">Nome</TableCell>
                <TableCell className="py-3 px-4  font-semibold">Data</TableCell>
                <TableCell className="py-3 px-4  font-semibold">
                  Total
                </TableCell>
                <TableCell className="py-3 px-4  font-semibold">
                  Status
                </TableCell>
                <TableCell className="py-3 px-4 text-center font-semibold">
                  Ações
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrcamentos.map((orcamento) => (
                <TableRowOrcamento
                  key={orcamento.id}
                  orcamento={orcamento}
                  numeroSequencial={orcamento.numeroSequencial}
                  onPrint={onPrint}
                  onDeleteOrcamento={onDeleteOrcamento}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 📱 Lista em Cards (Mobile) */}
      <div className="block md:hidden space-y-4">
        {filteredOrcamentos.map((orcamento) => (
          <div
            key={orcamento.id}
            className="bg-white w-full border border-gray-200 rounded-lg p-4 shadow-sm hover:bg-gray-50"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-2">
                #{orcamento.numeroSequencial} - {orcamento.cliente?.nome}
              </h3>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-100 min-w-[32px] px-1.5 h-8"
                  onClick={() => onPrint(orcamento.id)}
                >
                  <FileText className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-100 min-w-[32px] px-1.5 h-8"
                  onClick={() => onDeleteOrcamento(orcamento.id)}
                >
                  <Trash className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="text-gray-600 w-20">Data:</span>
                <span className="text-gray-900 font-medium">
                  {formatarDataSegura(orcamento.criadoEm)}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-gray-600 w-20">Total:</span>
                <span className="text-gray-900 font-medium">
                  {formatarMoeda(orcamento.total)}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-gray-600 w-20">Status:</span>
                <span className="text-gray-900 font-medium">
                  {orcamento.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}

export default memo(TableOrcamento);

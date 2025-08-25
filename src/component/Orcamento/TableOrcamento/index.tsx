import { memo, useMemo, useCallback } from 'react';
import { FileText, Search, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { OrcamentoModalDetails } from './EmpresaInfo';
import FormOrcamento from '../FormOrcamento';
import { TableRowOrcamento } from '../TableRowOrcamento';

import { formatCpfCnpj } from '@/utils/formatCpfCnpj';
import { formatarDataSegura } from '@/utils/date';
import { formatarMoeda } from '@/utils/formatters';

import { useTableLogic } from './useTableLogic';

import type {
  OrcamentoRenderDetails,
  CreateOrcamento,
} from '@/@types/orcamento';
import type { Client } from '@/@types/clients';
import type { ProductType } from '@/@types/product';

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
    isModalOpenDetails,
    searchTerm,
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
    toggleModalDetails,
    handleGenerateOrcamento,
    handleEntradaSubmit,
    handleOpenPaymentModal,
    handleOpenModalDetails,
    selectedOrcamento,
  } = useTableLogic({
    products,
    formattedClients,
    formattedOrcamentos,
    onSubmitOrcamento,
  });

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

  // Handlers memorizados para produtos
  const handleProductUpdate = useCallback(
    (index: number, field: string, value: string) => {
      setOrcamentoProdutos((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    },
    [setOrcamentoProdutos]
  );

  const handleProductRemove = useCallback(
    (index: number) => {
      setOrcamentoProdutos((prev) => prev.filter((_, i) => i !== index));
    },
    [setOrcamentoProdutos]
  );

  // Handlers memoizados para serviços
  const handleServiceUpdate = useCallback(
    (index: number, field: string, value: string) => {
      setServices((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    },
    [setServices]
  );

  const handleServiceRemove = useCallback(
    (index: number) => {
      setServices((prev) => prev.filter((_, i) => i !== index));
    },
    [setServices]
  );

  // Handlers para adicionar itens
  const handleAddProduct = useCallback(() => {
    setOrcamentoProdutos((prev) => [
      ...prev,
      { name: '', value: '', unitPrice: '', quantity: '' },
    ]);
  }, [setOrcamentoProdutos]);

  const handleAddService = useCallback(() => {
    setServices((prev) => [...prev, { description: '', value: '' }]);
  }, [setServices]);

  // Handler para mudança do cliente
  const handleClientChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedClient(e.target.value);
    },
    [setSelectedClient]
  );

  // Handler para busca
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm]
  );

  // Handler para gerar orçamento
  const handleGenerateClick = () => {
    handleGenerateOrcamento();
  };

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
            onChange={handleSearchChange}
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
                  onOpenModalDetails={handleOpenModalDetails}
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
                  onClick={() => handleOpenModalDetails(orcamento.id)}
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
          onGenerateClick={handleGenerateClick}
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

      {isModalOpenDetails && selectedOrcamento && (
        <OrcamentoModalDetails
          isOpen={isModalOpenDetails}
          onClose={toggleModalDetails}
          empresaInfo={empresaInfo}
          orcamentoInfo={{
            index: filteredOrcamentos.findIndex(
              (o) => o.id === selectedOrcamento.id
            ),
            totalOrcamentos: filteredOrcamentos.length,
            orcamentoId: selectedOrcamento.id,
            cliente: {
              id: selectedOrcamento.cliente?.id ?? '',
              nome: selectedOrcamento.cliente?.nome ?? 'Cliente não informado',
              telefone: selectedOrcamento.cliente?.telefone ?? 'Não informado',
              endereco: selectedOrcamento.cliente?.endereco ?? 'Não informado',
            },
            date: selectedOrcamento.criadoEm
              ? new Date(selectedOrcamento.criadoEm).toLocaleDateString('pt-BR')
              : 'Data não informada',
            itens:
              selectedOrcamento.itens?.map((item) => ({
                produtoId: item.produtoId,
                nome: item.nomeProduto
                  ? `Produto: ${item.nomeProduto}`
                  : 'Produto: Produto sem nome informado',
                precoUnitario: item.precoUnitario,
                quantidade: item.quantidade,
                valorTotal: item.precoUnitario * item.quantidade,
              })) || [],
            servicos:
              selectedOrcamento.servicos?.map((servico) => ({
                descricao: servico.descricao,
                valor: servico.valor,
              })) || [],
            total: selectedOrcamento.total ?? 0,
            lojaId: selectedOrcamento.lojaId ?? '',
            descricao: selectedOrcamento.descricao ?? '',
            metodoPagamento: selectedOrcamento.metodoPagamento ?? '',
            numeroParcelas: selectedOrcamento.numeroParcelas ?? 1,
            status: selectedOrcamento.status ?? 'pendente',
          }}
          autoPrint={true}
        />
      )}
    </div>
  );
}

export default memo(TableOrcamento);

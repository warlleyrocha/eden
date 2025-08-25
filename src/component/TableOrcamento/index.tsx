import { memo, useMemo, useCallback } from 'react';
import { FileText, Plus, Printer, Search, Trash, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { OrcamentoModalDetails } from './EmpresaInfo';
import ModalEntrada from '../ModalEntrada';
import ModalOrcamentos from '../ModalOrcamentos';

import { formatCpfCnpj } from '@/utils/formatCpfCnpj';
import { formatarDataSegura } from '@/utils/date';
import { formatarMoeda } from '@/utils/formatters';

import { useTableLogic } from './useTableLogic';

import type {
  OrcamentoRenderDetails,
  CreateOrcamento,
} from '@/@types/orcamento';
import type { Client } from '@/@types/clients';

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

interface ServiceItemType {
  description: string;
  value: string;
}

interface ProductItemType {
  name: string;
  value: string;
  unitPrice: string;
  quantity?: string;
}

interface ProductType {
  id: string;
  nome: string;
  precoCusto: number;
}

// Componente para linha da tabela de orçamentos
const TableRowOrcamento = memo(
  ({
    orcamento,
    numeroSequencial,
    onOpenModalDetails,
    onDeleteOrcamento,
  }: {
    orcamento: OrcamentoRenderDetails;
    numeroSequencial: number;
    onOpenModalDetails: (id: string) => void;
    onDeleteOrcamento: (id: string) => void;
  }) => {
    const handleClick = useCallback(() => {
      onOpenModalDetails(orcamento.id);
    }, [orcamento.id, onOpenModalDetails]);

    const formattedDate = useMemo(() => {
      return new Date(orcamento.criadoEm).toLocaleDateString('pt-BR');
    }, [orcamento.criadoEm]);

    const formattedTotal = useMemo(() => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(orcamento.total);
    }, [orcamento.total]);

    return (
      <TableRow className="hover:bg-gray-50 text-center bg-white">
        <TableCell className="py-2 px-4">{numeroSequencial}</TableCell>
        <TableCell className="py-2 px-4">
          {orcamento.cliente?.nome ?? 'Sem nome'}
        </TableCell>
        <TableCell className="py-2 px-4">{formattedDate}</TableCell>
        <TableCell className="py-2 px-4">{formattedTotal}</TableCell>
        <TableCell className="py-2 px-4">{orcamento.status}</TableCell>
        <TableCell className="py-2 px-4 space-x-2">
          <Button
            variant="outline"
            className="text-blue-600 hover:bg-blue-100 "
            onClick={handleClick}
          >
            <Printer />
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-100"
            onClick={() => onDeleteOrcamento(orcamento.id)}
          >
            <Trash />
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

// Componente para item de produto no modal
const ProductItem = memo(
  ({
    item,
    index,
    products,
    onUpdate,
    onRemove,
    stockError,
  }: {
    item: ProductItemType;
    index: number;
    products: ProductType[];
    onUpdate: (index: number, field: string, value: string) => void;
    onRemove: (index: number) => void;
    stockError?: string;
  }) => {
    const handleProductChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onUpdate(index, 'name', value);

        // Auto-preencher valor com base no produto selecionado
        const produtoSelecionado = products.find((p) => p.nome === value);
        if (produtoSelecionado) {
          onUpdate(index, 'value', produtoSelecionado.id);
          onUpdate(index, 'unitPrice', String(produtoSelecionado.precoCusto));
        }
      },
      [index, products, onUpdate]
    );

    const handlePriceChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'unitPrice', e.target.value);
      },
      [index, onUpdate]
    );

    const handleQuantityChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'quantity', e.target.value);
      },
      [index, onUpdate]
    );

    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    return (
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex-1 min-w-[200px]">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Produto
          </Label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={item.name}
            onChange={handleProductChange}
            aria-label="Produto"
          >
            <option value="" disabled>
              Selecione um produto
            </option>
            {products.map((produto) => (
              <option key={produto.id} value={produto.nome}>
                {produto.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Valor (R$)
          </Label>
          <Input
            type="text"
            placeholder="Valor"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={item.unitPrice}
            onChange={handlePriceChange}
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade
          </Label>
          <Input
            type="number"
            placeholder="Quantidade"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={item.quantity ?? ''}
            onChange={handleQuantityChange}
          />
        </div>

        <Button
          variant="ghost"
          className="border-2 border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200 self-end"
          onClick={handleRemove}
        >
          <Trash className="text-red-500" />
        </Button>

        {stockError && (
          <p className="mt-1 text-sm text-red-600">{stockError}</p>
        )}
      </div>
    );
  }
);

// Componente para item de serviço no modal
const ServiceItem = memo(
  ({
    item,
    index,
    onUpdate,
    onRemove,
  }: {
    item: ServiceItemType;
    index: number;
    onUpdate: (index: number, field: string, value: string) => void;
    onRemove: (index: number) => void;
  }) => {
    const handleDescriptionChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'description', e.target.value);
      },
      [index, onUpdate]
    );

    const handleValueChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'value', e.target.value);
      },
      [index, onUpdate]
    );

    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    return (
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex-1 min-w-[200px]">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Serviço
          </Label>
          <Input
            type="text"
            placeholder="Descrição do Serviço"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={item.description}
            onChange={handleDescriptionChange}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Valor (R$)
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Valor"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={item.value}
              onChange={handleValueChange}
            />
            <Button
              variant="ghost"
              className="border-2 border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
              onClick={handleRemove}
            >
              <Trash className="text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

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
  const handleGenerateClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleGenerateOrcamento();
    },
    [handleGenerateOrcamento]
  );

  /* // Memoiza o conteúdo do modal de detalhes
  const modalDetailsContent = useMemo(() => {
    if (!selectedOrcamento) return null;

    return (
      
    );
  }, [selectedOrcamento, empresaInfo, filteredOrcamentos]);*/

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
        <ModalOrcamentos
          isOpen={isModalOpen}
          content={
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1E3A8A]">
                    Novo Orçamento
                  </h2>

                  <p className="text-[#152C6B] mt-1">
                    Crie um novo orcamento para um cliente:
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={toggleModal}
                  size="icon"
                  className="text-[#152C6B] hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Fechar modal</span>
                </Button>
              </div>
              <div className="mb-4">
                <Label
                  htmlFor="cliente"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cliente
                </Label>
                <select
                  id="cliente"
                  name="cliente"
                  aria-label="Cliente"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedClient}
                  onChange={handleClientChange}
                >
                  <option value="" disabled>
                    Selecione um cliente
                  </option>
                  {formattedClients.map((item) => (
                    <option key={item.id} value={item.nome}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </div>

              {orcamentoProdutos.map((item, idx) => (
                <ProductItem
                  key={`prod-${idx}`}
                  item={item}
                  index={idx}
                  products={products}
                  onUpdate={handleProductUpdate}
                  onRemove={handleProductRemove}
                  stockError={stockErrors[item.value]}
                />
              ))}

              {services.map((item, idx) => (
                <ServiceItem
                  key={`serv-${idx}`}
                  item={item}
                  index={idx}
                  onUpdate={handleServiceUpdate}
                  onRemove={handleServiceRemove}
                />
              ))}

              <div className="flex-shrink-0 mb-2">
                <Button
                  variant="ghost"
                  className="border-2 w-full border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
                  onClick={handleAddProduct}
                >
                  <Plus className="mr-2" />
                  Adicionar Produtos
                </Button>
              </div>

              <div className="flex-shrink-0 mb-2">
                <Button
                  variant="ghost"
                  className="border-2 w-full border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
                  onClick={handleAddService}
                >
                  <Plus className="mr-2" />
                  Adicionar Serviços
                </Button>
              </div>

              <div className="flex-shrink-0 mb-2">
                {registroConcluido ? (
                  <div className="text-sm text-gray-700 border border-zinc-400 p-4 rounded-md bg-gray-50 space-y-1">
                    <p>
                      <strong>Resumo da Saída:</strong>
                    </p>
                    <p>Descrição: {descricaoEntrada}</p>
                    <p>Método: {metodoPagamento}</p>
                    <p>Valor: R$ {Number(valorEntrada).toFixed(2)}</p>
                    {metodoPagamento === 'credito' && (
                      <>
                        <p>Parcelas: {parcelas}x</p>
                        <p>Juros: {juros}%</p>
                        <p>
                          Total com Juros: R${' '}
                          {(Number(valorEntrada) * (1 + juros / 100)).toFixed(
                            2
                          )}
                        </p>
                        <p>
                          Valor por Parcela: R${' '}
                          {(
                            (Number(valorEntrada) * (1 + juros / 100)) /
                            parcelas
                          ).toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="border-2 w-full border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
                    onClick={handleOpenPaymentModal}
                  >
                    <Plus className="mr-2" />
                    Método de Pagamento
                  </Button>
                )}

                <ModalEntrada
                  showExitModal={showExitModal}
                  setShowExitModal={setShowExitModal}
                  valorEntrada={valorEntrada}
                  setValorEntrada={setValorEntrada}
                  descricaoEntrada={descricaoEntrada}
                  setDescricaoEntrada={setDescricaoEntrada}
                  metodoPagamento={metodoPagamento}
                  setMetodoPagamento={setMetodoPagamento}
                  parcelas={parcelas}
                  setParcelas={setParcelas}
                  juros={juros}
                  setJuros={setJuros}
                  handleEntradaSubmit={() => {
                    handleEntradaSubmit();
                    setRegistroConcluido(true);
                  }}
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </Label>
                <Input
                  type="text"
                  placeholder="Descrição do orçamento"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Separator className="my-4" />

              <div className="flex-shrink-0">
                <Button
                  variant="ghost"
                  className="border-2 w-full border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
                  onClick={handleGenerateClick}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Gerando...' : 'Gerar Orçamento'}
                </Button>
              </div>
            </>
          }
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

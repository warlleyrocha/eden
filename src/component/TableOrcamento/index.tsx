import { memo, useMemo, useCallback } from 'react';
import { FileText, Plus, Printer, Search, X } from 'lucide-react';

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

import { OrcamentoModelDetals } from './EmpresaInfo';
import ModalEntrada from '../ModalEntrada';
import ModalOrcamentos from '../ModalOrcamentos';

import { formatCpfCnpj } from '@/utils/formatCpfCnpj';

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
      <TableRow className="hover:bg-gray-50 text-center">
        <TableCell className="py-2 px-4">{numeroSequencial}</TableCell>
        <TableCell className="py-2 px-4">
          {orcamento.cliente?.nome ?? 'Sem nome'}
        </TableCell>
        <TableCell className="py-2 px-4">{formattedDate}</TableCell>
        <TableCell className="py-2 px-4">{formattedTotal}</TableCell>
        <TableCell className="py-2 px-4">{orcamento.status}</TableCell>
        <TableCell className="py-2 px-4 space-x-2 text-center">
          <Button
            variant="ghost"
            className="border-2 border-zinc-700"
            onClick={handleClick}
          >
            <Printer className="mr-1" />
            Imprimir
          </Button>
          <Button
            variant="ghost"
            className="border-2 border-zinc-700"
            onClick={() => onDeleteOrcamento(orcamento.id)}
          >
            <X className="mr-1" />
            Deletar
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
          <X className="text-red-500" />
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
              <X className="text-red-500" />
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

  // Memoiza o conteúdo do modal de detalhes
  const modalDetailsContent = useMemo(() => {
    if (!selectedOrcamento) return null;

    return (
      <OrcamentoModelDetals
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
    );
  }, [selectedOrcamento, empresaInfo, filteredOrcamentos]);

  return (
    <div className="w-full h-full p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row w-full justify-between mb-10">
        <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
          <Search className="mr-2" />
          <Input
            type="text"
            placeholder="Buscar orçamentos"
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow sm:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="my-2">
          <Button
            variant={'ghost'}
            onClick={toggleModal}
            className="border-2 border-zinc-700 w-full"
          >
            <FileText className="mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      <Table className="w-full border rounded-lg shadow-md">
        <TableHeader>
          <TableRow className="bg-gray-100 text-center">
            <TableCell className="py-2 px-4">ID</TableCell>
            <TableCell className="py-2 px-4">Nome</TableCell>
            <TableCell className="py-2 px-4">Data</TableCell>
            <TableCell className="py-2 px-4">Total</TableCell>
            <TableCell className="py-2 px-4">Status</TableCell>
            <TableCell className="py-2 px-4">Ações</TableCell>
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

      {isModalOpen && (
        <ModalOrcamentos
          isOpen={isModalOpen}
          onClose={toggleModal}
          title="Novo orçamento"
          subTitle="Crie um novo orcamento para um cliente:"
          content={
            <>
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
        <ModalOrcamentos
          isOpen={isModalOpenDetails}
          onClose={toggleModalDetails}
          content={modalDetailsContent}
        />
      )}
    </div>
  );
}

export default memo(TableOrcamento);

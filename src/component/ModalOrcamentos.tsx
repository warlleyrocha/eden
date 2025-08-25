import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { ProductItem } from './Orcamento/ProductItem';
import { ServiceItem } from './Orcamento/ServiceItem';
import ModalEntrada from './ModalEntrada';

import type { ProductType } from '@/@types/product';

// Interfaces

interface Servico {
  description: string;
  value: string;
}

interface OrcamentoProduto {
  name: string;
  value: string;
  unitPrice: string;
  quantity?: string;
}

interface ClientType {
  id: string;
  nome: string;
}

interface ModalOrcamentosProps {
  // Controle do modal
  isOpen?: boolean;
  onClose?: () => void;

  // Estados básicos
  selectedClient: string;
  formattedClients: ClientType[];
  orcamentoProdutos: OrcamentoProduto[];
  services: Servico[];
  products: ProductType[];
  stockErrors: Record<string, string>;

  // Estados do pagamento
  registroConcluido: boolean;
  showExitModal: boolean;
  valorEntrada: string;
  descricaoEntrada: string;
  metodoPagamento: string;
  parcelas: number;
  juros: number;
  isSubmitting: boolean;

  // Handlers de ação
  onClientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onProductUpdate: (index: number, field: string, value: string) => void;
  onProductRemove: (index: number) => void;
  onServiceUpdate: (index: number, field: string, value: string) => void;
  onServiceRemove: (index: number) => void;
  onAddProduct: () => void;
  onAddService: () => void;
  onOpenPaymentModal: () => void;
  onEntradaSubmit: () => void;
  onGenerateClick: (e?: React.MouseEvent) => void;

  // Setters para estados controlados
  setShowExitModal: Dispatch<SetStateAction<boolean>>;
  setValorEntrada: Dispatch<SetStateAction<string>>;
  setDescricaoEntrada: Dispatch<SetStateAction<string>>;
  setMetodoPagamento: Dispatch<SetStateAction<string>>;
  setParcelas: Dispatch<SetStateAction<number>>;
  setJuros: Dispatch<SetStateAction<number>>;
  setRegistroConcluido: Dispatch<SetStateAction<boolean>>;
}

const ModalOrcamentos: React.FC<ModalOrcamentosProps> = ({
  // Controle do modal
  isOpen = false,
  onClose,

  // Estados básicos
  selectedClient,
  formattedClients,
  orcamentoProdutos,
  services,
  products,
  stockErrors,

  // Estados do pagamento
  registroConcluido,
  showExitModal,
  valorEntrada,
  descricaoEntrada,
  metodoPagamento,
  parcelas,
  juros,
  isSubmitting,

  // Handlers
  onClientChange,
  onProductUpdate,
  onProductRemove,
  onServiceUpdate,
  onServiceRemove,
  onAddProduct,
  onAddService,
  onOpenPaymentModal,
  onEntradaSubmit,
  onGenerateClick,

  // Setters
  setShowExitModal,
  setValorEntrada,
  setDescricaoEntrada,
  setMetodoPagamento,
  setParcelas,
  setJuros,
  setRegistroConcluido,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleEntradaSubmitComplete = () => {
    onEntradaSubmit();
    setRegistroConcluido(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay com fundo escuro semi-transparente */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />

      {/* Conteúdo do Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A8A]">
              Novo Orçamento
            </h2>
            <p className="text-[#152C6B] mt-1">
              Crie um novo orçamento para um cliente:
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            size="icon"
            className="text-[#152C6B] hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar modal</span>
          </Button>
        </div>

        {/* Seleção de Cliente */}
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
            onChange={onClientChange}
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

        {/* Lista de Produtos */}
        {orcamentoProdutos.map((item, idx) => (
          <ProductItem
            key={`prod-${idx}`}
            item={item}
            index={idx}
            products={products}
            onUpdate={onProductUpdate}
            onRemove={onProductRemove}
            stockError={stockErrors[item.value]}
          />
        ))}

        {/* Lista de Serviços */}
        {services.map((item, idx) => (
          <ServiceItem
            key={`serv-${idx}`}
            item={item}
            index={idx}
            onUpdate={onServiceUpdate}
            onRemove={onServiceRemove}
          />
        ))}

        {/* Botão Adicionar Produtos */}
        <div className="flex-shrink-0 mb-2">
          <Button
            variant="ghost"
            className="border-2 w-full border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
            onClick={onAddProduct}
          >
            <Plus className="mr-2" />
            Adicionar Produtos
          </Button>
        </div>

        {/* Botão Adicionar Serviços */}
        <div className="flex-shrink-0 mb-2">
          <Button
            variant="ghost"
            className="border-2 w-full border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
            onClick={onAddService}
          >
            <Plus className="mr-2" />
            Adicionar Serviços
          </Button>
        </div>

        {/* Seção de Pagamento */}
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
                    {(Number(valorEntrada) * (1 + juros / 100)).toFixed(2)}
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
              onClick={onOpenPaymentModal}
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
            handleEntradaSubmit={handleEntradaSubmitComplete}
          />
        </div>

        {/* Descrição */}
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

        {/* Botão Gerar Orçamento */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            className="border-2 w-full border-zinc-400 p-2 rounded-md hover:bg-gray-100 transition duration-200"
            onClick={onGenerateClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Gerando...' : 'Gerar Orçamento'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalOrcamentos;

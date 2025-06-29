import React from 'react';
import { ArrowRight, Banknote, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Produto } from '@/@types/product';

interface RegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'entrada' | 'saida';
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
  valor: string;
  setValor: (v: string) => void;
  descricao: string;
  setDescricao: (v: string) => void;
  metodoPagamento: string;
  setMetodoPagamento: (v: string) => void;
  parcelas: number;
  setParcelas: (n: number) => void;
  juros: number;
  setJuros: (n: number) => void;
  products?: Produto[];
  produtosSelecionados?: Array<{
    produtoId: string;
    quantidade: number;
  }>;
  produtoParaAdicionar?: string;
  quantidadeParaAdicionar?: number;
  setProdutoParaAdicionar?: (produto: string) => void;
  setQuantidadeParaAdicionar?: (quantidade: number) => void;
  adicionarProduto?: () => void;
  removerProduto?: (index: number) => void;
}

export const RegistroModal: React.FC<RegistroModalProps> = ({
  isOpen,
  onClose,
  tipo,
  isSubmitting,
  onSubmit,
  error,
  valor,
  setValor,
  descricao,
  setDescricao,
  metodoPagamento,
  setMetodoPagamento,
  parcelas,
  setParcelas,
  juros,
  setJuros,
  products,
  produtosSelecionados,
  produtoParaAdicionar,
  quantidadeParaAdicionar,
  setProdutoParaAdicionar,
  setQuantidadeParaAdicionar,
  adicionarProduto,
  removerProduto,
}) => {
  if (!isOpen) return null;

  const isCredito = metodoPagamento === 'credito';
  const titulo =
    tipo === 'entrada' ? 'Registrar Nova Entrada' : 'Registrar Nova Saída';
  const botaoTexto =
    tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída';
  const loadingTexto =
    tipo === 'entrada' ? 'Registrando entrada...' : 'Registrando saída...';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
      <button
        className="bg-black opacity-60 absolute inset-0"
        onClick={onClose}
        disabled={isSubmitting}
      ></button>

      <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 max-w-lg w-full shadow-lg">
        <h2 className="text-xl font-semibold text-[#1E3A8A] mb-4">{titulo}</h2>

        {isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center z-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A] mx-auto mb-4" />
              <p className="text-[#1E3A8A] font-medium">{loadingTexto}</p>
            </div>
          </div>
        )}

        <form className="space-y-4 justify-between">
          <div>
            <label
              htmlFor="value"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {tipo === 'entrada' && (
            <div className="flex-1 min-w-[200px]">
              {/* Seção para adicionar produto */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                {/* Campo Produto */}
                <div className="flex-1">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Produto
                  </Label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={produtoParaAdicionar} // Estado temporário para o produto sendo adicionado
                    onChange={(e) => setProdutoParaAdicionar?.(e.target.value)}
                    disabled={isSubmitting}
                    aria-label="Produto"
                  >
                    <option value="" disabled>
                      Selecione um produto
                    </option>
                    {products?.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campo Quantidade */}
                <div className="flex-1">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </Label>
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    className="w-full mt-[5px] py-4.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={quantidadeParaAdicionar} // Estado temporário para quantidade
                    onChange={(e) => {
                      setQuantidadeParaAdicionar?.(Number(e.target.value));
                    }}
                    min="1"
                  />
                </div>

                {/* Botão Adicionar */}
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={adicionarProduto}
                    disabled={
                      !produtoParaAdicionar ||
                      (quantidadeParaAdicionar ?? 0) <= 0
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Lista de produtos selecionados */}
              {(produtosSelecionados ?? []).length > 0 && (
                <div className="border rounded-md p-4 bg-gray-50">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Produtos Selecionados
                  </Label>
                  <div className="space-y-2">
                    {produtosSelecionados?.map((item, index) => {
                      const produto = products?.find(
                        (p) => p.id === item.produtoId
                      );
                      return (
                        <div
                          key={`produto-${item.produtoId}-${index}`}
                          className="flex items-center justify-between bg-white p-2 rounded border"
                        >
                          <span className="text-sm">
                            {produto?.nome} - Qtd: {item.quantidade}
                          </span>
                          <Button
                            type="button"
                            onClick={() => removerProduto?.(index)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Remover
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descrição
            </label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={`Descrição da ${tipo}`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="payment-method"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Método de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: 'pix',
                  label: 'PIX',
                  icon: <ArrowRight className="h-4 w-4" />,
                },
                {
                  id: 'dinheiro',
                  label: 'Dinheiro',
                  icon: <Banknote className="h-4 w-4" />,
                },
                {
                  id: 'debito',
                  label: 'Débito',
                  icon: <CreditCard className="h-4 w-4" />,
                },
                {
                  id: 'credito',
                  label: 'Crédito',
                  icon: <CreditCard className="h-4 w-4" />,
                },
              ].map(({ id, label, icon }) => (
                <div key={id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={id}
                    name="metodo"
                    value={id}
                    checked={metodoPagamento === id}
                    onChange={() => setMetodoPagamento(id)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor={id} className="flex items-center gap-2">
                    {icon}
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {isCredito && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="parcelas-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Número de Parcelas
                </label>
                <select
                  id="parcelas-select"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={parcelas}
                  onChange={(e) => setParcelas(Number(e.target.value))}
                  disabled={isSubmitting}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}x
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="juros"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Juros (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0"
                  value={juros}
                  onChange={(e) => setJuros(Number(e.target.value))}
                  disabled={isSubmitting}
                />
              </div>
              {juros > 0 && valor && (
                <div className="text-sm text-gray-600">
                  <p>Valor Original: R$ {Number(valor).toFixed(2)}</p>
                  <p>
                    Valor com Juros: R${' '}
                    {(Number(valor) * (1 + juros / 100)).toFixed(2)}
                  </p>
                  <p>
                    Valor por Parcela: R${' '}
                    {((Number(valor) * (1 + juros / 100)) / parcelas).toFixed(
                      2
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-full border-gray-300 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#1AAE4E] text-white px-5 py-3 rounded-full transition-colors duration-200"
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                  Registrando...
                </>
              ) : (
                botaoTexto
              )}
            </Button>
          </div>
          {error && (
            <div className="error-message text-red-600 text-sm mt-2 text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

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
    valorUnitario: number | string; // Adicionado campo de valor unitário
  }>;
  produtoParaAdicionar?: string;
  quantidadeParaAdicionar?: number;
  valorParaAdicionar?: string; // Adicionado campo de valor para adicionar
  setProdutoParaAdicionar?: (produto: string) => void;
  setQuantidadeParaAdicionar?: (quantidade: number) => void;
  setValorParaAdicionar?: (valor: string) => void; // Adicionado setter para valor
  adicionarProduto?: () => void;
  removerProduto?: (index: number) => void;
  isEditing?: boolean;
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
  valorParaAdicionar,
  setProdutoParaAdicionar,
  setQuantidadeParaAdicionar,
  setValorParaAdicionar,
  adicionarProduto,
  removerProduto,
  isEditing = false,
}) => {
  if (!isOpen) return null;

  const isCredito = metodoPagamento === 'credito';

  // Lógica condicional para título e textos dos botões
  let titulo: string;
  let botaoTexto: string;
  let loadingTexto: string;

  if (isEditing) {
    titulo = tipo === 'entrada' ? 'Editar Entrada' : 'Editar Saída';
    botaoTexto = 'Editar';
    loadingTexto = 'Editando...';
  } else if (tipo === 'entrada') {
    titulo = 'Registrar Nova Entrada';
    botaoTexto = 'Registrar Entrada';
    loadingTexto = 'Registrando entrada...';
  } else {
    titulo = 'Registrar Nova Saída';
    botaoTexto = 'Registrar Saída';
    loadingTexto = 'Registrando saída...';
  }

  // Calcula o valor total dos produtos selecionados
  const valorTotalProdutos = (produtosSelecionados ?? []).reduce(
    (total, item) => {
      return total + Number(item.quantidade) * Number(item.valorUnitario);
    },
    0
  );

  // Função para formatar valor em moeda
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
      <button
        className="bg-slate-900/40 backdrop-blur-[2px] absolute inset-0"
        onClick={onClose}
        disabled={isSubmitting}
      ></button>

      <div className="bg-white rounded-card p-6 sm:p-8 relative z-10 max-w-lg w-full shadow-modal max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">{titulo}</h2>

        {isSubmitting && (
          <div className="absolute inset-0 bg-surface/90 rounded-card flex items-center justify-center z-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">{loadingTexto}</p>
            </div>
          </div>
        )}

        <form className="space-y-4 justify-between">
          {/* Campo de valor para saídas ou quando não há produtos selecionados */}
          {tipo !== 'entrada' && (
            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="mt-1 block h-10 w-full px-3 bg-surface border border-border rounded-md shadow-xs hover:border-border-hover focus:outline-none focus:ring-[3px] focus:ring-brand/25 focus:border-brand sm:text-sm"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          )}

          {tipo === 'entrada' && (
            <div className="flex-1 min-w-[200px]">
              {/* Seção para adicionar produto */}
              <div className="space-y-4 mb-4">
                <h3 className="text-sm font-medium text-foreground">
                  Adicionar Produto
                </h3>

                {/* Linha 1: Produto e Quantidade */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Campo Produto */}
                  <div className="flex-1">
                    <Label className="block text-sm font-medium text-foreground mb-1">
                      Produto
                    </Label>
                    <select
                      className="mt-1 block h-10 w-full px-3 bg-surface border border-border rounded-md shadow-xs hover:border-border-hover focus:outline-none focus:ring-[3px] focus:ring-brand/25 focus:border-brand sm:text-sm"
                      value={produtoParaAdicionar}
                      onChange={(e) =>
                        setProdutoParaAdicionar?.(e.target.value)
                      }
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
                    <Label className="block text-sm font-medium text-foreground mb-1">
                      Quantidade
                      {produtoParaAdicionar &&
                        (() => {
                          const produtoSelecionado = products?.find(
                            (p) => p.id === produtoParaAdicionar
                          );
                          const estoqueDisponivel =
                            (produtoSelecionado?.estoque || 0) -
                            (produtosSelecionados
                              ?.filter(
                                (item) =>
                                  item.produtoId === produtoParaAdicionar
                              )
                              .reduce(
                                (total, item) => total + item.quantidade,
                                0
                              ) || 0);
                          return (
                            <span
                              className={`ml-2 text-xs ${
                                estoqueDisponivel > 0
                                  ? 'text-success-foreground'
                                  : 'text-danger-foreground'
                              }`}
                            >
                              (Disponível: {estoqueDisponivel})
                            </span>
                          );
                        })()}
                    </Label>
                    <Input
                      type="number"
                      placeholder="Quantidade"
                      className={`w-full mt-[5px] py-4.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                        produtoParaAdicionar &&
                        (() => {
                          const produtoSelecionado = products?.find(
                            (p) => p.id === produtoParaAdicionar
                          );
                          const estoqueDisponivel =
                            (produtoSelecionado?.estoque || 0) -
                            (produtosSelecionados
                              ?.filter(
                                (item) =>
                                  item.produtoId === produtoParaAdicionar
                              )
                              .reduce(
                                (total, item) => total + item.quantidade,
                                0
                              ) || 0);
                          return (quantidadeParaAdicionar || 0) >
                            estoqueDisponivel
                            ? 'border-danger/40'
                            : 'border-border';
                        })()
                      }`}
                      value={
                        quantidadeParaAdicionar === 0
                          ? ''
                          : quantidadeParaAdicionar ?? ''
                      }
                      onChange={(e) => {
                        const valor = e.target.value;
                        setQuantidadeParaAdicionar?.(
                          valor === '' ? 0 : Number(valor)
                        );
                      }}
                      min="1"
                      max={
                        produtoParaAdicionar
                          ? (() => {
                            const produtoSelecionado = products?.find(
                              (p) => p.id === produtoParaAdicionar
                            );
                            const estoqueDisponivel =
                                (produtoSelecionado?.estoque || 0) -
                                (produtosSelecionados
                                  ?.filter(
                                    (item) =>
                                      item.produtoId === produtoParaAdicionar
                                  )
                                  .reduce(
                                    (total, item) => total + item.quantidade,
                                    0
                                  ) || 0);
                            return estoqueDisponivel;
                          })()
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Linha 2: Valor Unitário e Botão Adicionar */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Campo Valor Unitário */}
                  <div className="flex-1">
                    <Label className="block text-sm font-medium text-foreground mb-1">
                      Valor Unitário (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.00"
                      placeholder="0,00"
                      className="w-full mt-[5px] py-4.5 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/30"
                      value={valorParaAdicionar ?? ''}
                      onChange={(e) => {
                        setValorParaAdicionar?.(String(e.target.value));
                      }}
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
                      className="px-4 h-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de produtos selecionados */}
              {(produtosSelecionados ?? []).length > 0 && (
                <div className="border rounded-md p-4 bg-surface-secondary">
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    Produtos Selecionados
                  </Label>
                  <div className="space-y-2">
                    {produtosSelecionados?.map((item, index) => {
                      const produto = products?.find(
                        (p) => p.id === item.produtoId
                      );
                      const valorTotal =
                        Number(item.quantidade) * Number(item.valorUnitario);
                      return (
                        <div
                          key={`produto-${item.produtoId}-${index}`}
                          className="flex items-center justify-between bg-white p-3 rounded border"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {produto?.nome}
                            </div>
                            <div className="text-xs text-foreground-secondary">
                              Qtd: {item.quantidade} ×{' '}
                              {formatarMoeda(Number(item.valorUnitario))} ={' '}
                              {formatarMoeda(valorTotal)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removerProduto?.(index)}
                            className="px-2 py-1 bg-danger-bg text-danger-foreground border border-danger/30 rounded-sm text-xs hover:bg-danger/20"
                          >
                            Remover
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Valor Total */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        Valor Total:
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {formatarMoeda(valorTotalProdutos)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Descrição
            </label>
            <input
              type="text"
              className="mt-1 block h-10 w-full px-3 bg-surface border border-border rounded-md shadow-xs hover:border-border-hover focus:outline-none focus:ring-[3px] focus:ring-brand/25 focus:border-brand sm:text-sm"
              placeholder={`Descrição da ${tipo}`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="payment-method"
              className="block text-sm font-medium text-foreground mb-1"
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
                    className="h-4 w-4 accent-primary focus:ring-brand/30 border-border"
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
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Número de Parcelas
                </label>
                <select
                  id="parcelas-select"
                  className="mt-1 block h-10 w-full px-3 bg-surface border border-border rounded-md shadow-xs hover:border-border-hover focus:outline-none focus:ring-[3px] focus:ring-brand/25 focus:border-brand sm:text-sm"
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
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Juros (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 block h-10 w-full px-3 bg-surface border border-border rounded-md shadow-xs hover:border-border-hover focus:outline-none focus:ring-[3px] focus:ring-brand/25 focus:border-brand sm:text-sm"
                  placeholder="0"
                  value={juros}
                  onChange={(e) => setJuros(Number(e.target.value))}
                  disabled={isSubmitting}
                />
              </div>
              {juros > 0 && (
                <div className="text-sm text-foreground-secondary">
                  {tipo === 'entrada' && valorTotalProdutos > 0 ? (
                    <>
                      <p>Valor Original: {formatarMoeda(valorTotalProdutos)}</p>
                      <p>
                        Valor com Juros:{' '}
                        {formatarMoeda(valorTotalProdutos * (1 + juros / 100))}
                      </p>
                      <p>
                        Valor por Parcela:{' '}
                        {formatarMoeda(
                          (valorTotalProdutos * (1 + juros / 100)) / parcelas
                        )}
                      </p>
                    </>
                  ) : (
                    valor && (
                      <>
                        <p>Valor Original: R$ {Number(valor).toFixed(2)}</p>
                        <p>
                          Valor com Juros: R${' '}
                          {(Number(valor) * (1 + juros / 100)).toFixed(2)}
                        </p>
                        <p>
                          Valor por Parcela: R${' '}
                          {(
                            (Number(valor) * (1 + juros / 100)) /
                            parcelas
                          ).toFixed(2)}
                        </p>
                      </>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-full border-border hover:bg-neutral-bg"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-5 h-10 rounded-md transition-colors duration-200"
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                  {isEditing ? 'Editando...' : 'Registrando...'}
                </>
              ) : (
                botaoTexto
              )}
            </Button>
          </div>
          {error && (
            <div className="error-message text-danger-foreground text-sm mt-2 text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

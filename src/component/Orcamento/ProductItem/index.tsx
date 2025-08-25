import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash } from 'lucide-react';
import type { ProductType } from '@/@types/product';

interface ProductItemType {
  name: string;
  value: string;
  unitPrice: string;
  quantity?: string;
}

export interface ProductItemProps {
  item: ProductItemType;
  index: number;
  products: ProductType[];
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  stockError?: string;
}

export const ProductItem = memo<ProductItemProps>(
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

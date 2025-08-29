import { memo, useCallback } from 'react';
import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

interface ServiceItemType {
  description: string;
  value: string;
}

export interface ServiceItemProps {
  item: ServiceItemType;
  index: number;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  stockError?: string;
}

export const ServiceItem = memo<ServiceItemProps>(
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

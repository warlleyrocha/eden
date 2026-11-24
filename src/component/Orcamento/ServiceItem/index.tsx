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
          <Label className="block text-sm font-medium text-foreground mb-1">
            Serviço
          </Label>
          <Input
            type="text"
            placeholder="Descrição do Serviço"
            className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/30"
            value={item.description}
            onChange={handleDescriptionChange}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label className="block text-sm font-medium text-foreground mb-1">
            Valor (R$)
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Valor"
              className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={item.value}
              onChange={handleValueChange}
            />
            <Button
              variant="ghost"
              className="border-2 border-border p-2 rounded-md hover:bg-neutral-bg transition duration-200"
              onClick={handleRemove}
            >
              <Trash className="text-danger-foreground" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

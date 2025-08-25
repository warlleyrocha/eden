import React from 'react';
import {
  Sheet as ShadcnSheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type DynamicSheetProps = {
  title: string;
  description: string;
  triggerText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DynamicSheet({
  title,
  description,
  triggerText,
  icon,
  children,
  isOpen,
  onOpenChange,
}: Readonly<DynamicSheetProps>) {
  return (
    <ShadcnSheet open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <SheetTrigger asChild>
        <button onClick={() => onOpenChange(true)}>
          {icon} {triggerText}
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </ShadcnSheet>
  );
}

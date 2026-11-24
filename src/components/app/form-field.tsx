import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps = {
  htmlFor: string;
  label: ReactNode;
  /** Ícone exibido antes do rótulo. */
  icon?: ReactNode;
  /** Mensagem de erro de validação exibida abaixo do campo. */
  error?: string;
  /** Texto de apoio exibido abaixo do campo quando não há erro. */
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Rótulo (com ícone opcional) + controle + mensagem de erro/dica. */
export function FormField({
  htmlFor,
  label,
  icon,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={htmlFor}
        className="flex items-center text-sm font-medium text-foreground"
      >
        {icon}
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-danger-foreground">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-foreground-secondary">{hint}</p>
      )}
    </div>
  );
}

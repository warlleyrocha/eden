import type { FormEventHandler, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type EntityFormLayoutProps = {
  title: string;
  description?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  /** Desativa a validação nativa do navegador (quando há validação própria). */
  noValidate?: boolean;
  children: ReactNode;
};

/**
 * Estrutura padrão dos formulários de cadastro dentro de um Dialog:
 * cabeçalho, campos e rodapé com Cancelar / Salvar.
 */
export function EntityFormLayout({
  title,
  description,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
  noValidate,
  children,
}: EntityFormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate={noValidate}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>

      <div className="space-y-4">{children}</div>

      <DialogFooter>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

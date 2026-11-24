import type { ReactNode } from 'react';

import { SectionCard } from '@/components/app/section-card';
import { SearchInput } from '@/components/app/search-input';
import { EmptyState } from '@/components/app/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Noun = {
  /** Ex.: "cliente" */
  singular: string;
  /** Ex.: "clientes" */
  plural: string;
};

type EmptyCopy = {
  title: string;
  description?: string;
};

type EntityListSectionProps = {
  title: string;
  noun: Noun;
  /** Total de registros (sem filtro). */
  total: number;
  /** Quantidade de registros após a busca. */
  filtered: number;
  loading?: boolean;

  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  createLabel: string;
  createIcon?: ReactNode;
  onCreate: () => void;

  emptyIcon?: ReactNode;
  /** Texto quando não há nenhum registro cadastrado. */
  empty: EmptyCopy;
  /** Texto quando a busca não retorna resultados. */
  emptySearch: EmptyCopy;

  /** Sobrescreve o subtítulo padrão ("N clientes cadastrados"). */
  description?: ReactNode;

  /** Listagem (tabela/cards), renderizada quando há resultados. */
  children: ReactNode;
};

function defaultDescription({
  loading,
  hasSearch,
  total,
  filtered,
  noun,
}: {
  loading?: boolean;
  hasSearch: boolean;
  total: number;
  filtered: number;
  noun: Noun;
}) {
  if (loading) return 'Carregando...';
  if (hasSearch) return `${filtered} de ${total} ${noun.plural}`;
  const one = total === 1;
  return `${total} ${one ? noun.singular : noun.plural} cadastrado${one ? '' : 's'}`;
}

/**
 * Card de listagem padrão (clientes, funcionários...): título com contagem,
 * busca, botão de cadastro, skeleton de carregamento e estados vazios.
 */
export function EntityListSection({
  title,
  noun,
  total,
  filtered,
  loading,
  search,
  onSearchChange,
  searchPlaceholder,
  createLabel,
  createIcon,
  onCreate,
  emptyIcon,
  empty,
  emptySearch,
  description,
  children,
}: EntityListSectionProps) {
  const hasSearch = search.trim() !== '';
  const emptyCopy = hasSearch ? emptySearch : empty;

  let body: ReactNode;
  if (loading) {
    body = (
      <div className="space-y-2 px-6 pb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  } else if (filtered === 0) {
    body = (
      <EmptyState
        icon={emptyIcon}
        title={emptyCopy.title}
        description={emptyCopy.description}
        action={
          hasSearch ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSearchChange('')}
            >
              Limpar busca
            </Button>
          ) : (
            <Button size="sm" onClick={onCreate}>
              {createIcon} {createLabel}
            </Button>
          )
        }
      />
    );
  } else {
    body = children;
  }

  return (
    <SectionCard
      title={title}
      description={
        description ??
        defaultDescription({ loading, hasSearch, total, filtered, noun })
      }
      flush
      actions={
        <>
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="sm:w-80"
          />
          <Button onClick={onCreate}>
            {createIcon} {createLabel}
          </Button>
        </>
      }
    >
      {body}
    </SectionCard>
  );
}

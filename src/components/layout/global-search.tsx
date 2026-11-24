import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, User } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useEstoque } from '@/hooks/useEstoque';
import { useClients } from '@/hooks/useCliente';
import { cn } from '@/lib/utils';

import { NAV_ITEMS } from './nav-items';

/**
 * Resultados da busca. Montado só com o diálogo aberto, para que
 * produtos e clientes sejam buscados sob demanda.
 */
function SearchResults({ onSelect }: { onSelect: (url: string) => void }) {
  const { products, loading: loadingProducts } = useEstoque();
  const { clients, loading: loadingClients } = useClients();

  return (
    <CommandList className="max-h-[360px]">
      <CommandEmpty>
        {loadingProducts || loadingClients
          ? 'Carregando...'
          : 'Nenhum resultado encontrado.'}
      </CommandEmpty>

      <CommandGroup heading="Páginas">
        {NAV_ITEMS.map((item) => (
          <CommandItem
            key={item.url}
            value={`pagina ${item.title}`}
            onSelect={() => onSelect(item.url)}
          >
            <item.icon />
            {item.title}
          </CommandItem>
        ))}
      </CommandGroup>

      {products.length > 0 && (
        <CommandGroup heading="Produtos">
          {products.map((p) => (
            <CommandItem
              key={p.id}
              value={`produto ${p.nome} ${p.id}`}
              onSelect={() =>
                onSelect(`/estoque?busca=${encodeURIComponent(p.nome)}`)
              }
            >
              <Package />
              <span className="truncate">{p.nome}</span>
              <span className="tabular ml-auto text-xs text-foreground-secondary">
                {p.estoque ?? 0} un.
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {clients.length > 0 && (
        <CommandGroup heading="Clientes">
          {clients.map((c) => (
            <CommandItem
              key={c.id}
              value={`cliente ${c.nome} ${c.email ?? ''} ${c.id}`}
              onSelect={() =>
                onSelect(`/clientes?busca=${encodeURIComponent(c.nome)}`)
              }
            >
              <User />
              <span className="truncate">{c.nome}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandList>
  );
}

export function GlobalSearch({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 cursor-pointer items-center gap-2.5 rounded-full border border-border bg-surface px-4 text-sm text-foreground-muted shadow-xs transition-colors hover:border-border-hover',
          className
        )}
        aria-label="Buscar produtos, clientes ou páginas"
      >
        <Search className="size-4 shrink-0 text-foreground-secondary" />
        <span className="hidden flex-1 truncate text-left sm:inline">
          Buscar produtos, clientes...
        </span>
        <kbd className="hidden rounded-sm border border-border bg-surface-secondary px-1.5 py-0.5 font-sans text-[11px] text-foreground-secondary lg:inline">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Busca"
        description="Busque produtos, clientes ou páginas"
      >
        <CommandInput placeholder="Buscar produtos, clientes ou páginas..." />
        {open && <SearchResults onSelect={handleSelect} />}
      </CommandDialog>
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Inbox, Loader2, X } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { OrcamentoStatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';

import { useHeaderLogic } from '@/component/Header/useHeaderLogic';
import { useModalImpressao } from '@/hooks/useModalOrcamento';
import { useOrcamentoContext } from '@/hooks/useOrcamento';
import { formatarMoeda } from '@/utils/formatters';

/** Sino do header: lista de orçamentos com ações rápidas de aprovar/rejeitar. */
export function NotificationsSheet() {
  const [open, setOpen] = useState(false);
  const { definirLista, getNumeroSequencial } = useOrcamentoContext();
  const { abrirModalImpressao, modalAberto } = useModalImpressao();

  const {
    orcamentos,
    loading,
    error,
    errorMessage,
    processingActionId,
    atualizarStatus,
    removerOrcamento,
    refreshOrcamentos,
  } = useHeaderLogic();

  // Mantém a numeração sequencial global sincronizada
  useEffect(() => {
    if (orcamentos.length > 0) definirLista(orcamentos);
  }, [orcamentos, definirLista]);

  const ordenados = useMemo(
    () =>
      orcamentos
        .slice()
        .sort(
          (a, b) =>
            new Date(b.criadoEm ?? 0).getTime() -
            new Date(a.criadoEm ?? 0).getTime()
        ),
    [orcamentos]
  );

  const abertos = orcamentos.filter((o) => o.status === 'ABERTO').length;

  const handleOpenChange = (next: boolean) => {
    // Enquanto o modal de impressão estiver aberto, não fecha o painel
    if (!next && modalAberto) return;
    setOpen(next);
    if (next) refreshOrcamentos();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full"
          aria-label={
            abertos > 0
              ? `Notificações: ${abertos} orçamentos em aberto`
              : 'Notificações'
          }
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          {abertos > 0 && (
            <span className="tabular absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-background">
              {abertos > 9 ? '9+' : abertos}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="text-lg">Notificações</SheetTitle>
          <SheetDescription>
            {abertos > 0
              ? `${abertos} orçamento${abertos > 1 ? 's' : ''} aguardando aprovação.`
              : 'Nenhum orçamento aguardando aprovação.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && ordenados.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-foreground-secondary">
              <Loader2 className="size-4 animate-spin" /> Carregando orçamentos...
            </div>
          )}
          {(error || errorMessage) && (
            <p className="mb-3 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger-foreground">
              {errorMessage ?? error?.message}
            </p>
          )}
          {!loading && ordenados.length === 0 && (
            <EmptyState icon={<Inbox />} title="Nada por aqui" />
          )}

          <ul className="space-y-2.5">
            {ordenados.map((orcamento) => {
              const numero = getNumeroSequencial(orcamento.id);
              const isApproving = processingActionId === `approve-${orcamento.id}`;
              const isRejecting = processingActionId === `reject-${orcamento.id}`;
              return (
                <li
                  key={orcamento.id}
                  className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hover"
                >
                  <button
                    type="button"
                    className="block w-full cursor-pointer text-left"
                    onClick={() => abrirModalImpressao(orcamento)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {orcamento.cliente?.nome ?? 'Cliente não informado'}
                        </p>
                        <p className="tabular mt-0.5 text-xs text-foreground-secondary">
                          {numero ? `#${numero} · ` : ''}
                          {orcamento.criadoEm
                            ? new Date(orcamento.criadoEm).toLocaleString('pt-BR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                            : 'Sem data'}
                          {typeof orcamento.total === 'number' &&
                            ` · ${formatarMoeda(orcamento.total)}`}
                        </p>
                      </div>
                      <OrcamentoStatusBadge status={orcamento.status} />
                    </div>
                  </button>

                  {orcamento.status === 'ABERTO' && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-success-foreground hover:bg-success-bg"
                        disabled={!!processingActionId}
                        onClick={() => atualizarStatus(orcamento.id, 'APROVADO')}
                      >
                        {isApproving ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Check />
                        )}
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-danger-foreground hover:bg-danger-bg"
                        disabled={!!processingActionId}
                        onClick={() => removerOrcamento(orcamento.id)}
                      >
                        {isRejecting ? <Loader2 className="animate-spin" /> : <X />}
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}

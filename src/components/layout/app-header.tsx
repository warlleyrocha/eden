import { useLocation } from 'react-router-dom';
import { LogOut, PanelLeft } from 'lucide-react';

import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/hooks/useLoja';

import { findNavItem } from './nav-items';
import { GlobalSearch } from './global-search';
import { NotificationsSheet } from './notifications-sheet';
import { getInitials, useLogout } from './use-logout';

export function AppHeader() {
  const { pathname } = useLocation();
  const { state, isMobile, toggleSidebar } = useSidebar();
  const { storeData } = useStore();
  const logout = useLogout();

  const current = findNavItem(pathname);
  const isDashboard = current?.url === '/home';
  const storeName = storeData?.nome;

  const title = isDashboard
    ? `Olá${storeName ? `, ${storeName}` : ''} 👋`
    : (current?.title ?? '');
  const subtitle = isDashboard
    ? 'Bem-vindo de volta! Aqui está o resumo de hoje.'
    : current?.description;

  const showTrigger = isMobile || state === 'collapsed';

  return (
    <header className="flex items-center gap-3 px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
      {showTrigger && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="-ml-1 cursor-pointer rounded-md p-2 text-foreground-secondary hover:bg-surface hover:text-foreground"
          aria-label="Abrir menu lateral"
        >
          <PanelLeft className="size-5" />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 hidden truncate text-sm text-foreground-secondary sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <GlobalSearch className="w-10 justify-center px-0 sm:w-64 sm:justify-start sm:px-4 lg:w-72" />
        <NotificationsSheet />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="cursor-pointer rounded-full ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              aria-label="Menu da conta"
            >
              <Avatar className="size-10 border border-border">
                <AvatarFallback className="bg-brand-bg text-sm font-semibold text-brand-foreground">
                  {getInitials(storeName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium">
                {storeName ?? 'Minha loja'}
              </p>
              {storeData?.email && (
                <p className="truncate text-xs text-foreground-secondary">
                  {storeData.email}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout} className="cursor-pointer">
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

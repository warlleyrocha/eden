import { NavLink, useLocation } from 'react-router-dom';
import { ChevronsUpDown, LogOut, PanelLeft } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStore } from '@/hooks/useLoja';
import { cn } from '@/lib/utils';

import { NAV_ITEMS, findNavItem } from './nav-items';
import { getInitials, useLogout } from './use-logout';

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/light-icon.svg"
      alt=""
      aria-hidden
      className={cn('size-8 rounded-lg', className)}
    />
  );
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const { storeData } = useStore();
  const logout = useLogout();
  const active = findNavItem(pathname);

  const storeName = storeData?.nome ?? 'Minha loja';

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark />
            <span className="truncate text-xl font-semibold tracking-tight text-foreground">
              Éden
            </span>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="cursor-pointer rounded-md p-1.5 text-foreground-secondary hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Recolher menu lateral"
          >
            <PanelLeft className="size-[18px]" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup className="p-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = active?.url === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-11 gap-3 rounded-md border border-transparent px-3 text-[15px] font-medium text-foreground-secondary [&>svg]:size-[19px]',
                        'hover:bg-sidebar-accent hover:text-foreground',
                        'data-[active=true]:border-border data-[active=true]:bg-surface data-[active=true]:text-foreground data-[active=true]:shadow-card'
                      )}
                    >
                      <NavLink
                        to={item.url}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <item.icon strokeWidth={1.75} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-2.5 text-left shadow-card transition-colors hover:border-border-hover"
            >
              <Avatar className="size-9 rounded-md">
                <AvatarFallback className="rounded-md bg-brand-bg text-sm font-semibold text-brand-foreground">
                  {getInitials(storeName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {storeName}
                </p>
                <p className="truncate text-xs text-foreground-secondary">
                  {storeData?.email ?? 'Administrador'}
                </p>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-foreground-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? 'top' : 'right'}
            align="end"
            className="w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium">{storeName}</p>
              {storeData?.cnpj && (
                <p className="truncate text-xs text-foreground-secondary">
                  CNPJ {storeData.cnpj}
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
      </SidebarFooter>
    </Sidebar>
  );
}

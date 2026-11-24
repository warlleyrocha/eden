import { Outlet } from 'react-router-dom';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ModalImpressao } from '@/component/ModalImpressao';

import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

/** Estrutura das páginas autenticadas: sidebar fixa + header + conteúdo. */
export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-8 sm:px-6">
          <Outlet />
        </div>
      </SidebarInset>
      <ModalImpressao />
    </SidebarProvider>
  );
}

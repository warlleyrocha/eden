import {
  FileText,
  House,
  Package,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Subtítulo mostrado no header quando a página está ativa. */
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/home',
    icon: House,
    description: 'Visão geral do negócio',
  },
  {
    title: 'Caixa',
    url: '/caixa',
    icon: Wallet,
    description: 'Entradas, saídas e fechamento',
  },
  {
    title: 'Estoque',
    url: '/estoque',
    icon: Package,
    description: 'Produtos e quantidades disponíveis',
  },
  {
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
    description: 'Cadastro e contatos',
  },
  {
    title: 'Orçamentos',
    url: '/orcamentos',
    icon: FileText,
    description: 'Propostas e aprovações',
  },
];

export function findNavItem(pathname: string) {
  return NAV_ITEMS.find(
    (item) => pathname === item.url || pathname.startsWith(`${item.url}/`)
  );
}

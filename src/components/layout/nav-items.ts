import {
  FileText,
  House,
  IdCard,
  Package,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { PermissaoValue } from '@/lib/permissoes';

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Subtítulo mostrado no header quando a página está ativa. */
  description: string;
  /**
   * Quem pode abrir o módulo: a permissão exigida do funcionário, ou 'loja'
   * para só a conta da loja. Sem valor, qualquer pessoa logada.
   */
  acesso?: PermissaoValue | 'loja';
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
    acesso: 'gerenciar_caixa',
    icon: Wallet,
    description: 'Entradas, saídas e fechamento',
  },
  {
    title: 'Estoque',
    url: '/estoque',
    acesso: 'cadastrar_produto',
    icon: Package,
    description: 'Produtos e quantidades disponíveis',
  },
  {
    title: 'Clientes',
    url: '/clientes',
    acesso: 'cadastrar_cliente',
    icon: Users,
    description: 'Cadastro e contatos',
  },
  {
    title: 'Orçamentos',
    url: '/orcamentos',
    acesso: 'gerar_orcamento',
    icon: FileText,
    description: 'Propostas e aprovações',
  },
  {
    title: 'Funcionários',
    url: '/funcionarios',
    acesso: 'loja',
    icon: IdCard,
    description: 'Equipe e permissões de acesso',
  },
];

export function findNavItem(pathname: string) {
  return NAV_ITEMS.find(
    (item) => pathname === item.url || pathname.startsWith(`${item.url}/`)
  );
}

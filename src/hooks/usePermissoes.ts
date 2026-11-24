import { useCallback } from 'react';

import useAuth from '@/hooks/useAuth';
import type { NavItem } from '@/components/layout/nav-items';
import type { PermissaoValue } from '@/lib/permissoes';
import { temPermissao } from '@/lib/session';

/**
 * O que a pessoa logada pode ver. Só esconde menus e botões: quem barra de
 * verdade é a API (403), que lê as permissões do banco a cada requisição.
 * Se a loja mudar as permissões de alguém logado, o menu dele só atualiza
 * no próximo login.
 */
export function usePermissoes() {
  const { sessao } = useAuth();
  const isLoja = sessao?.role !== 'FUNCIONARIO';

  const pode = useCallback(
    (permissao: PermissaoValue) => !!sessao && temPermissao(sessao, permissao),
    [sessao]
  );

  const podeAcessar = useCallback(
    (item: Pick<NavItem, 'acesso'>) => {
      if (!item.acesso) return true;
      if (item.acesso === 'loja') return isLoja;
      return pode(item.acesso);
    },
    [isLoja, pode]
  );

  return { sessao, isLoja, usuario: sessao?.usuario ?? null, pode, podeAcessar };
}

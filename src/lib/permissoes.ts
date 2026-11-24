export type PermissaoValue =
  | 'gerenciar_caixa'
  | 'cadastrar_produto'
  | 'cadastrar_cliente'
  | 'gerar_orcamento';

export type Permissao = {
  /** Valor enviado ao backend em `permissoes`. */
  value: PermissaoValue;
  label: string;
  description: string;
};

/**
 * Permissões que podem ser atribuídas a um funcionário. Cada uma libera o
 * módulo do menu de mesmo nome.
 *
 * Lista oficial no backend: `src/models/auth/permissoes.ts` (EdenBackEnd).
 * Um valor fora dela é recusado com 400, então mantenha as duas iguais.
 */
export const PERMISSOES: Permissao[] = [
  {
    value: 'gerenciar_caixa',
    label: 'Caixa',
    description: 'Registrar entradas, saídas e fechamento',
  },
  {
    value: 'cadastrar_produto',
    label: 'Estoque',
    description: 'Cadastrar e editar produtos',
  },
  {
    value: 'cadastrar_cliente',
    label: 'Clientes',
    description: 'Cadastrar e editar clientes',
  },
  {
    value: 'gerar_orcamento',
    label: 'Orçamentos',
    description: 'Criar e aprovar orçamentos',
  },
];

const LABELS = new Map<string, string>(PERMISSOES.map((p) => [p.value, p.label]));

export function getPermissaoLabel(value: string) {
  return LABELS.get(value) ?? value;
}

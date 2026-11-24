export type Permissao = {
  /** Valor enviado ao backend em `permissoes`. */
  value: string;
  label: string;
  description: string;
};

/**
 * Permissões que podem ser atribuídas a um funcionário.
 * O backend aceita qualquer string; mantenha esta lista alinhada com as
 * verificações de permissão quando elas forem implementadas na API.
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

const LABELS = new Map(PERMISSOES.map((p) => [p.value, p.label]));

export function getPermissaoLabel(value: string) {
  return LABELS.get(value) ?? value;
}

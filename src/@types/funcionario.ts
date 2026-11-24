export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  lojaId: string;
  permissoes: string[];
  ativo: boolean;
}

/** Corpo de POST /auth/loja/criar-funcionario (lojaId vem do token). */
export interface CreateFuncionario {
  nome: string;
  email: string;
  senha: string;
  permissoes: string[];
}

/** Corpo de PATCH /auth/loja/funcionarios/:id: só os campos que mudam. */
export type UpdateFuncionario = Partial<CreateFuncionario & { ativo: boolean }>;

export interface FuncionarioFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  permissoes: string[];
}

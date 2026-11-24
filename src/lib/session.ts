import type { PermissaoValue } from '@/lib/permissoes';

/**
 * Sessão de quem está logado: a conta da loja ou um funcionário.
 *
 * O token e o `storeId` continuam nas mesmas chaves de antes; `role` e
 * `usuario` vêm da resposta de POST /auth/login. Sessões abertas antes do
 * login de funcionário existir não têm `role` e são tratadas como LOJA
 * (na época só a loja conseguia entrar).
 */
export type Role = 'LOJA' | 'FUNCIONARIO';

export type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  permissoes: string[];
};

export type Sessao = {
  role: Role;
  /** Preenchido só para funcionário. */
  usuario: UsuarioSessao | null;
};

export type LoginResponse = {
  access_token: string;
  role?: Role;
  loja?: { id: string; nome: string };
  usuario?: UsuarioSessao;
};

const TOKEN_KEY = 'token';
const STORE_ID_KEY = 'storeId';
const ROLE_KEY = 'role';
const USUARIO_KEY = 'usuario';
const AVISO_KEY = 'avisoSessao';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function salvarSessao(data: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.loja?.id) localStorage.setItem(STORE_ID_KEY, data.loja.id);

  const role: Role = data.role === 'FUNCIONARIO' ? 'FUNCIONARIO' : 'LOJA';
  localStorage.setItem(ROLE_KEY, role);

  if (role === 'FUNCIONARIO' && data.usuario) {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(data.usuario));
  } else {
    localStorage.removeItem(USUARIO_KEY);
  }
}

export function lerSessao(): Sessao {
  const role: Role =
    localStorage.getItem(ROLE_KEY) === 'FUNCIONARIO' ? 'FUNCIONARIO' : 'LOJA';
  if (role === 'LOJA') return { role, usuario: null };

  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    const usuario = raw ? (JSON.parse(raw) as UsuarioSessao) : null;
    return {
      role,
      usuario: usuario && {
        ...usuario,
        permissoes: Array.isArray(usuario.permissoes) ? usuario.permissoes : [],
      },
    };
  } catch {
    return { role, usuario: null };
  }
}

/** Remove o token e os dados de quem estava logado. */
export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

/** A conta da loja pode tudo; funcionário só o que estiver em `permissoes`. */
export function temPermissao(sessao: Sessao, permissao: PermissaoValue) {
  if (sessao.role === 'LOJA') return true;
  return sessao.usuario?.permissoes.includes(permissao) ?? false;
}

/** Mensagem para a tela de login depois de uma sessão encerrada pela API. */
export function definirAvisoSessao(mensagem: string) {
  sessionStorage.setItem(AVISO_KEY, mensagem);
}

export function consumirAvisoSessao() {
  const mensagem = sessionStorage.getItem(AVISO_KEY);
  if (mensagem) sessionStorage.removeItem(AVISO_KEY);
  return mensagem;
}

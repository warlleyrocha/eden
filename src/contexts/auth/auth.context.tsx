import { createContext } from 'react';

import type { Sessao } from '@/lib/session';

interface AuthContextType {
  setAuthenticated: (value: boolean) => void;
  authenticated: boolean;
  login: (userData?: unknown) => void;
  logout: () => void;
  user?: unknown;
  loading: boolean;
  /** Quem está logado (loja ou funcionário). `null` sem sessão. */
  sessao: Sessao | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

import { createContext } from 'react';

interface AuthContextType {
  setAuthenticated: (value: boolean) => void;
  authenticated: boolean;
  login: (userData?: unknown) => void;
  logout: () => void;
  user?: unknown;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

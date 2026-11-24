/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode, useState, useEffect, useMemo } from 'react';
import { lerSessao, limparSessao } from '@/lib/session';
import { AuthContext } from './auth.context';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData?: any) => {
    setAuthenticated(true);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
    limparSessao();
  };

  // role/usuario só mudam no login e no logout, que sempre alternam
  // `authenticated`; por isso basta reler o localStorage quando ele muda.
  const sessao = useMemo(
    () => (authenticated ? lerSessao() : null),
    [authenticated]
  );

  const contextValue = useMemo(
    () => ({
      authenticated,
      setAuthenticated,
      loading,
      login,
      logout,
      user,
      sessao,
    }),
    [authenticated, loading, user, sessao]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

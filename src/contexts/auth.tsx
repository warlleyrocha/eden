/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  type ReactNode,
  useState,
  useEffect,
  useMemo,
} from 'react';

interface AuthContextType {
  setAuthenticated: (value: boolean) => void;
  authenticated: boolean;
  login: (userData?: any) => void;
  logout: () => void;
  user?: any;
  token?: string | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData?: any, authToken?: string) => {
    setAuthenticated(true);

    if (userData) {
      setUser(userData);
    }

    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
    }
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const contextValue = useMemo(
    () => ({
      authenticated,
      setAuthenticated,
      loading,
      login,
      logout,
      user,
      token,
    }),
    [authenticated, loading, user, token]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

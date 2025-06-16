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
    localStorage.removeItem('token');
  };

  const contextValue = useMemo(
    () => ({
      authenticated,
      setAuthenticated,
      loading,
      login,
      logout,
      user,
    }),
    [authenticated, loading, user]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

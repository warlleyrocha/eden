import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { storeAPI } from '@/services/loja.api';
import type { StoreData } from '@/@types/loja';

interface StoreContextType {
  storeData: StoreData | null;
  loading: boolean;
  error: boolean;
  refreshStoreData: (force?: boolean) => Promise<void>;
  clearStoreData: () => void;
}

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined
);

// Cache com tipagem forte
const storeCache = {
  data: null as StoreData | null,
  lastFetch: null as number | null,
  isLoading: false,
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos de cache

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, setState] = useState<{
    data: StoreData | null;
    loading: boolean;
    error: boolean;
  }>(() => ({
    data: storeCache.data || null,
    loading: !storeCache.data,
    error: false,
  }));

  const fetchStoreData = useCallback(async (force = false): Promise<void> => {
    const now = Date.now();
    const shouldUseCache =
      !force &&
      storeCache.data &&
      storeCache.lastFetch &&
      now - storeCache.lastFetch < CACHE_DURATION;

    if (shouldUseCache) {
      setState((prev) => ({
        ...prev,
        data: storeCache.data,
        loading: false,
        error: false,
      }));
      return;
    }

    if (storeCache.isLoading && !force) return;

    try {
      storeCache.isLoading = true;
      setState((prev) => ({ ...prev, loading: true, error: false }));

      const data = await storeAPI.fetchStoreData();

      storeCache.data = data;
      storeCache.lastFetch = Date.now();

      setState({ data, loading: false, error: false });
    } catch (error) {
      console.error('Erro ao buscar dados da loja:', error);
      setState((prev) => ({
        ...prev,
        error: true,
        data: prev.data ? { ...prev.data, nome: 'Erro ao carregar' } : null,
      }));
    } finally {
      storeCache.isLoading = false;
    }
  }, []);

  const refreshStoreData = useCallback(
    async (force = true) => {
      await fetchStoreData(force);
    },
    [fetchStoreData]
  );

  const clearStoreData = useCallback(() => {
    storeCache.data = null;
    storeCache.lastFetch = null;
    storeCache.isLoading = false;
    setState({ data: null, loading: true, error: false });
  }, []);

  // Carrega os dados inicialmente
  useEffect(() => {
    const hasValidCache =
      storeCache.data &&
      storeCache.lastFetch &&
      Date.now() - storeCache.lastFetch < CACHE_DURATION;

    if (!hasValidCache && !storeCache.isLoading) {
      fetchStoreData();
    }
  }, [fetchStoreData]);

  // Escuta mudanças no storeId
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storeId') {
        clearStoreData();
        fetchStoreData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearStoreData, fetchStoreData]);

  const contextValue: StoreContextType = {
    storeData: state.data,
    loading: state.loading,
    error: state.error,
    refreshStoreData,
    clearStoreData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
};

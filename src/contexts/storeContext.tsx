// contexts/StoreContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/services/api';

interface StoreData {
  nameStore: string;
  emailStore: string;
  cnpjStore: string;
  enderecoStore: string;
  storeId: string | null;
}

interface StoreContextType {
  // Dados
  storeData: StoreData;
  loading: boolean;
  error: boolean;

  // Funções
  refreshStoreData: () => Promise<void>;
  clearStoreData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Cache para persistir dados mesmo após remontagem
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
  const [storeData, setStoreData] = useState<StoreData>(() => {
    // Inicializa com dados do cache se disponível
    return (
      storeCache.data || {
        nameStore: 'Carregando...',
        emailStore: 'Carregando...',
        cnpjStore: 'Carregando...',
        enderecoStore: 'Carregando...',
        storeId: localStorage.getItem('storeId'),
      }
    );
  });

  const [loading, setLoading] = useState(() => {
    // Se já tem dados no cache, não precisa mostrar loading
    return !storeCache.data;
  });

  const [error, setError] = useState(false);

  const fetchStoreData = useCallback(
    async (forceRefresh = false): Promise<void> => {
      const now = Date.now();
      const storeId = localStorage.getItem('storeId');

      if (!storeId) {
        setError(true);
        setStoreData((prev) => ({ ...prev, nameStore: 'ID Not found' }));
        setLoading(false);
        return;
      }

      // Verifica se deve usar cache
      if (
        !forceRefresh &&
        storeCache.data &&
        storeCache.lastFetch &&
        now - storeCache.lastFetch < CACHE_DURATION
      ) {
        // Usa dados do cache
        setStoreData(storeCache.data);
        setLoading(false);
        setError(false);
        return;
      }

      // Evita múltiplas chamadas simultâneas
      if (storeCache.isLoading && !forceRefresh) {
        return;
      }

      storeCache.isLoading = true;
      setLoading(true);
      setError(false);

      try {
        const response = await api.get(`/lojas/${storeId}`);

        const newStoreData: StoreData = {
          nameStore: response.data.nome,
          emailStore: response.data.email,
          cnpjStore: response.data.cnpj,
          enderecoStore: response.data.endereco,
          storeId,
        };

        // Atualiza cache e estado
        storeCache.data = newStoreData;
        storeCache.lastFetch = now;

        setStoreData(newStoreData);
        setError(false);
      } catch (error: unknown) {
        console.error('Erro ao buscar dados da loja:', error);
        setError(true);
        setStoreData((prev) => ({
          ...prev,
          nameStore: 'Erro ao carregar',
        }));
      } finally {
        storeCache.isLoading = false;
        setLoading(false);
      }
    },
    []
  );

  const refreshStoreData = useCallback(() => {
    return fetchStoreData(true);
  }, [fetchStoreData]);

  const clearStoreData = useCallback(() => {
    storeCache.data = null;
    storeCache.lastFetch = null;
    storeCache.isLoading = false;

    setStoreData({
      nameStore: 'Carregando...',
      emailStore: 'Carregando...',
      cnpjStore: 'Carregando...',
      enderecoStore: 'Carregando...',
      storeId: localStorage.getItem('storeId'),
    });
    setLoading(true);
    setError(false);
  }, []);

  // Fetch inicial apenas se não tem dados válidos no cache
  useEffect(() => {
    const now = Date.now();
    const hasValidCache =
      storeCache.data &&
      storeCache.lastFetch &&
      now - storeCache.lastFetch < CACHE_DURATION;

    if (!hasValidCache && !storeCache.isLoading) {
      fetchStoreData();
    }
  }, [fetchStoreData]);

  // Escuta mudanças no storeId do localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storeId') {
        // Limpa cache e recarrega dados
        clearStoreData();
        fetchStoreData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearStoreData, fetchStoreData]);

  const contextValue: StoreContextType = {
    storeData,
    loading,
    error,
    refreshStoreData,
    clearStoreData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export { StoreContext };

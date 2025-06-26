// contexts/StoreContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/services/api';

interface StoreData {
  nome: string;
  email: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  subTitle: string;
  lojaId: string | null;
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
        nome: 'Carregando...',
        email: 'Carregando...',
        cnpj: 'Carregando...',
        telefone: 'Carregadno...',
        endereco: 'Carregando...',
        subTitle: 'Carregando...',
        lojaId: localStorage.getItem('storeId'),
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
      const lojaId = localStorage.getItem('storeId');

      if (!lojaId) {
        setError(true);
        setStoreData((prev) => ({ ...prev, nome: 'ID Not found' }));
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
        const response = await api.get(`/lojas/${lojaId}`);

        const newStoreData: StoreData = {
          nome: response.data.nome,
          email: response.data.email,
          cnpj: response.data.cnpj,
          endereco: response.data.endereco,
          telefone: response.data.telefone,
          subTitle: response.data.subTitulo,
          lojaId: response.data.lojaId,
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
          nome: 'Erro ao carregar',
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
      nome: 'Carregando...',
      email: 'Carregando...',
      cnpj: 'Carregando...',
      endereco: 'Carregando...',
      telefone: 'Carregando ...',
      subTitle: 'Carregando...',
      lojaId: localStorage.getItem('storeId'),
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

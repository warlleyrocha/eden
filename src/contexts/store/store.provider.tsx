import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { storeAPI } from '@/services/loja.api';
import type { StoreData } from '@/@types/loja';
import { StoreContext } from './store.context';

// Cache com identificação por usuário
interface CacheEntry {
  data: StoreData | null;
  lastFetch: number | null;
  userId: string | null;
}

const storeCache: CacheEntry = {
  data: null,
  lastFetch: null,
  userId: null,
};

let isLoading = false;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos de cache

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, setState] = useState<{
    data: StoreData | null;
    loading: boolean;
    error: boolean;
  }>({
    data: null,
    loading: true,
    error: false,
  });

  // Função para obter ID do usuário atual
  const getCurrentUserId = useCallback((): string | null => {
    // Tenta obter do localStorage ou de onde você armazena o ID do usuário
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Se você armazena o userId separadamente, use:
    // return localStorage.getItem('userId');

    // Ou se está no token (você precisará decodificar)
    // Por enquanto, vamos usar o token como identificador
    return token;
  }, []);

  const fetchStoreData = useCallback(
    async (force = false): Promise<void> => {
      const currentUserId = getCurrentUserId();

      // Se não há usuário autenticado, limpa tudo
      if (!currentUserId) {
        setState({ data: null, loading: false, error: false });
        return;
      }

      const now = Date.now();
      const isCacheValid =
        !force &&
        storeCache.data &&
        storeCache.lastFetch &&
        storeCache.userId === currentUserId && // IMPORTANTE: Verifica se o cache é do usuário atual
        now - storeCache.lastFetch < CACHE_DURATION;

      if (isCacheValid) {
        setState({
          data: storeCache.data,
          loading: false,
          error: false,
        });
        return;
      }

      // Se mudou o usuário, limpa o cache
      if (storeCache.userId && storeCache.userId !== currentUserId) {
        storeCache.data = null;
        storeCache.lastFetch = null;
        storeCache.userId = null;
      }

      if (isLoading && !force) return;

      try {
        isLoading = true;
        setState((prev) => ({ ...prev, loading: true, error: false }));

        const data = await storeAPI.fetchStoreData();

        // Salva no cache com o ID do usuário atual
        storeCache.data = data;
        storeCache.lastFetch = Date.now();
        storeCache.userId = currentUserId;

        setState({ data, loading: false, error: false });
      } catch (error) {
        console.error('Erro ao buscar dados da loja:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: true,
          data: prev.data ? { ...prev.data, nome: 'Erro ao carregar' } : null,
        }));
      } finally {
        isLoading = false;
      }
    },
    [getCurrentUserId]
  );

  const refreshStoreData = useCallback(
    async (force = true) => {
      await fetchStoreData(force);
    },
    [fetchStoreData]
  );

  const clearStoreData = useCallback(() => {
    storeCache.data = null;
    storeCache.lastFetch = null;
    storeCache.userId = null;
    isLoading = false;
    setState({ data: null, loading: true, error: false });
  }, []);

  // Carrega os dados inicialmente
  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Escuta mudanças no token e storeId
  useEffect(() => {
    const checkForChanges = () => {
      const currentUserId = getCurrentUserId();
      const currentStoreId = localStorage.getItem('storeId');

      // Se não há usuário autenticado, limpa tudo
      if (!currentUserId) {
        if (storeCache.data) {
          clearStoreData();
        }
        return;
      }

      // Se mudou o usuário ou a loja, limpa cache e busca novos dados
      if (
        storeCache.userId !== currentUserId ||
        (storeCache.data && storeCache.data.id !== currentStoreId)
      ) {
        clearStoreData();
        fetchStoreData();
      }
    };

    // Verifica mudanças periodicamente (para detectar mudanças na mesma aba)
    const interval = setInterval(checkForChanges, 1000);

    // Mantém o listener para mudanças entre abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'storeId') {
        checkForChanges();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [clearStoreData, fetchStoreData, getCurrentUserId]);

  // Memoriza o contextValue para evitar re-renders desnecessários
  const contextValue = useMemo(
    () => ({
      storeData: state.data,
      loading: state.loading,
      error: state.error,
      refreshStoreData,
      clearStoreData,
    }),
    [state.data, state.loading, state.error, refreshStoreData, clearStoreData]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

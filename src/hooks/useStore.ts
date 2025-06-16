// hooks/useStore.ts
import { useContext } from 'react';
import { StoreContext } from '@/contexts/storeContext';

interface StoreData {
  nameStore: string;
  emailStore: string;
  cnpjStore: string;
  enderecoStore: string;
  storeId: string | null;
}

interface StoreContextType {
  storeData: StoreData;
  loading: boolean;
  error: boolean;
  refreshStoreData: () => Promise<void>;
  clearStoreData: () => void;
}

// Hook customizado para usar o contexto
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);

  if (context === undefined) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }

  return context;
};

// Hook de compatibilidade (para não quebrar código existente)
export const useStoreData = () => {
  const { storeData, loading, error } = useStore();

  return {
    nameStore: storeData.nameStore,
    emailStore: storeData.emailStore,
    cnpjStore: storeData.cnpjStore,
    enderecoStore: storeData.enderecoStore,
    loading,
    error,
  };
};

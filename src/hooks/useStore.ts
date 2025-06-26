// hooks/useStore.ts
import { useContext } from 'react';
import { StoreContext } from '@/contexts/storeContext';

interface StoreData {
  nome: string;
  email: string;
  cnpj: string;
  endereco: string;
  subTitle: string;
  telefone: string;
  lojaId: string | null;
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
    nome: storeData.nome,
    email: storeData.email,
    cnpj: storeData.cnpj,
    endereco: storeData.endereco,
    telefone: storeData.telefone,
    subTitle: storeData.subTitle,
    loading,
    error,
  };
};

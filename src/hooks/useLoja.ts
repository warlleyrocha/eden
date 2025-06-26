// hooks/useStore.ts
import { useContext } from 'react';
import { StoreContext } from '@/contexts/storeContext';
import type { StoreData } from '@/@types/loja';

interface UseStoreReturn {
  // Dados completos
  storeData: StoreData | null;
  // Estados
  loading: boolean;
  error: boolean;
  // Métodos
  refreshStoreData: (force?: boolean) => Promise<void>;
  clearStoreData: () => void;
  // Dados individuais (para compatibilidade)
  nome: string;
  email: string;
  cnpj: string;
  endereco: string;
  subTitle: string;
  telefone: string;
  lojaId: string | null;
}

export const useStore = (): UseStoreReturn => {
  const context = useContext(StoreContext);

  if (context === undefined) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }

  return {
    ...context,
    nome: context.storeData?.nome ?? 'Carregando...',
    email: context.storeData?.email ?? 'Carregando...',
    cnpj: context.storeData?.cnpj ?? 'Carregando...',
    endereco: context.storeData?.endereco ?? 'Carregando...',
    subTitle: context.storeData?.subTitulo ?? 'Carregando...',
    telefone: context.storeData?.telefone ?? 'Carregando...',
    lojaId: context.storeData?.id ?? null,
  };
};

// Versão simplificada (para compatibilidade)
export const useStoreData = () => {
  const { nome, email, cnpj, endereco, subTitle, telefone, loading, error } =
    useStore();
  return { nome, email, cnpj, endereco, subTitle, telefone, loading, error };
};

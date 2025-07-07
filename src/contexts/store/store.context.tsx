import { createContext } from 'react';
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

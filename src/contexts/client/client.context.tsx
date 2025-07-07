import { createContext } from 'react';
import type { Client } from '@/@types/clients';

export type ClientContextType = {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
};

export const ClientContext = createContext<ClientContextType | undefined>(
  undefined
);

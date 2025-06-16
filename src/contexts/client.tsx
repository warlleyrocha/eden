// src/contexts/ClientContext.tsx
import { createContext, useContext, useState } from 'react';
import type { Client } from '@/@types/clients';

type ClientContextType = {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  return (
    <ClientContext.Provider value={{ selectedClient, setSelectedClient }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context)
    throw new Error('useClientContext must be used within ClientProvider');
  return context;
};

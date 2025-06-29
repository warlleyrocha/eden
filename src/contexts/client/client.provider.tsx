// src/context/client/ClientProvider.tsx
import { useState, useMemo } from 'react';
import { ClientContext } from './client.context';
import type { Client } from '@/@types/clients';

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const contextValue = useMemo(
    () => ({
      selectedClient,
      setSelectedClient,
    }),
    [selectedClient]
  );

  return (
    <ClientContext.Provider value={contextValue}>
      {children}
    </ClientContext.Provider>
  );
};

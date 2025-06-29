// src/context/client/ClientProvider.tsx
import { useState } from 'react';
import { ClientContext } from './client.context';
import type { Client } from '@/@types/clients';

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <ClientContext.Provider value={{ selectedClient, setSelectedClient }}>
      {children}
    </ClientContext.Provider>
  );
};

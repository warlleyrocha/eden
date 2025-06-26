import { AuthProvider } from './contexts/auth';
import { ClientProvider } from './contexts/client';
import { StoreProvider } from './contexts/storeContext';
import { OrcamentoSequenciaProvider } from './contexts/orcamentoContext';
import RouterApp from './routes';

export const App = () => {
  return (
    <AuthProvider>
      <OrcamentoSequenciaProvider>
        <ClientProvider>
          <StoreProvider>
            <RouterApp />
          </StoreProvider>
        </ClientProvider>
      </OrcamentoSequenciaProvider>
    </AuthProvider>
  );
};

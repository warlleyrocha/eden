import { AuthProvider } from './contexts/auth/auth.provider';
import { ClientProvider } from './contexts/client/client.provider';
import { StoreProvider } from './contexts/store/store.provider';
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

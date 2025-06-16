import { AuthProvider } from './contexts/auth';
import { ClientProvider } from './contexts/client';
import { StoreProvider } from './contexts/storeContext';
import RouterApp from './routes';

export const App = () => {
  return (
    <AuthProvider>
      <ClientProvider>
        <StoreProvider>
          <RouterApp />
        </StoreProvider>
      </ClientProvider>
    </AuthProvider>
  );
};

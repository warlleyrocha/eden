import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
} from 'react-router-dom';

import SignIn from '../pages/Signin';
import Home from '../pages/Home';
import useAuth from '../hooks/useAuth';
import { usePermissoes } from '@/hooks/usePermissoes';
import { findNavItem } from '@/components/layout/nav-items';
import Caixa from '@/pages/Caixa';
import Stock from '@/pages/estoque';
import Clientes from '@/pages/clientes';
import Orcamentos from '@/pages/orcamentos';
import Funcionarios from '@/pages/funcionarios';
import { AppLayout } from '@/components/layout/app-layout';

const Private = ({ children }: { children: React.ReactElement }) => {
  const { authenticated, loading } = useAuth();
  const { podeAcessar } = usePermissoes();
  const { pathname } = useLocation();
  const accessToken = localStorage.getItem('token');
  const isLoggedIn = authenticated && !!accessToken;
  if (loading) return null; // ou um spinner
  if (!isLoggedIn) return <Navigate to="/signin" replace />;

  // Funcionário sem a permissão do módulo (URL digitada ou link antigo)
  const item = findNavItem(pathname);
  if (item && !podeAcessar(item)) return <Navigate to="/home" replace />;

  return children;
};

const Public = ({ children }: { children: React.ReactElement }) => {
  const { authenticated, loading } = useAuth();
  const accessToken = localStorage.getItem('token');
  const isLoggedIn = authenticated && !!accessToken;
  if (loading) return null; // ou um spinner
  return isLoggedIn ? <Navigate to="/home" replace /> : children;
};

const router = createBrowserRouter(
  [
    {
      element: (
        <Private>
          <AppLayout />
        </Private>
      ),
      children: [
        { path: '/home', element: <Home /> },
        { path: '/caixa', element: <Caixa /> },
        { path: '/estoque', element: <Stock /> },
        { path: '/clientes', element: <Clientes /> },
        { path: '/orcamentos', element: <Orcamentos /> },
        { path: '/funcionarios', element: <Funcionarios /> },
        // Rota antiga (clientes + orçamentos juntos)
        { path: '/orcamento', element: <Navigate to="/orcamentos" replace /> },
      ],
    },
    {
      path: '/signin',
      element: (
        <Public>
          <SignIn />
        </Public>
      ),
    },
    {
      path: '*',
      element: (
        <Public>
          <SignIn />
        </Public>
      ),
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

const RouterApp = () => {
  return <RouterProvider router={router} />;
};

export default RouterApp;

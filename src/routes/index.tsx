import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';

import SignIn from '../pages/Signin';
import Home from '../pages/Home';
import useAuth from '../hooks/useAuth';
import Caixa from '@/pages/Caixa';
import Stock from '@/pages/estoque';
import Orcamento from '@/pages/orcamentos';

const Private = ({ children }: { children: React.ReactElement }) => {
  const { authenticated, loading } = useAuth();
  const accessToken = localStorage.getItem('token');
  const isLoggedIn = authenticated && !!accessToken;
  if (loading) return null; // ou um spinner
  return isLoggedIn ? children : <Navigate to="/signin" replace />;
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
      path: '/home',
      element: (
        <Private>
          <Home />
        </Private>
      ),
    },
    {
      path: '/caixa',
      element: (
        <Private>
          <Caixa />
        </Private>
      ),
    },
    {
      path: '/estoque',
      element: (
        <Private>
          <Stock />
        </Private>
      ),
    },
    {
      path: '/orcamento',
      element: (
        <Private>
          <Orcamento />
        </Private>
      ),
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

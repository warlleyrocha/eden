//API
import Axios from 'axios';

import { definirAvisoSessao, getToken, limparSessao } from '@/lib/session';

export const api = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Envia o token em todas as chamadas (clientes, lojas... que antes iam sem).
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 com sessão aberta = token expirado ou funcionário desativado/excluído
// (a API confere isso a cada requisição). Encerra a sessão e volta ao login.
// O próprio /auth/login fica de fora: lá 401 é só senha errada.
api.interceptors.response.use(undefined, (error) => {
  const status = error?.response?.status;
  const url: string = error?.config?.url ?? '';

  if (status === 401 && getToken() && !url.includes('/auth/login')) {
    limparSessao();
    definirAvisoSessao(
      'Sua sessão expirou ou seu acesso foi revogado. Entre novamente.'
    );
    window.location.replace('/signin');
  }

  return Promise.reject(error);
});

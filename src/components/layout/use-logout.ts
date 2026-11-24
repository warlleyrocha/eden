import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { limparSessao } from '@/lib/session';

export function useLogout() {
  const { setAuthenticated } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    limparSessao();
    setAuthenticated(false);
    navigate('/signin');
  }, [setAuthenticated, navigate]);
}

export function getInitials(nome?: string | null) {
  if (!nome) return '?';
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

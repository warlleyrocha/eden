import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { CreateFuncionario, Funcionario } from '@/@types/funcionario';
import { funcionariosAPI } from '@/services/funcionario.api';

/**
 * Estado da tela de funcionários.
 *
 * A API ainda não expõe uma rota de listagem, então `funcionarios` contém
 * apenas os cadastrados nesta sessão. Quando existir um GET, basta carregar
 * a lista aqui (como em `useClients`) — a tela não precisa mudar.
 */
export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [saving, setSaving] = useState(false);

  const createFuncionario = useCallback(async (data: CreateFuncionario) => {
    setSaving(true);
    try {
      const novo = await funcionariosAPI.createFuncionario({ payload: data });
      setFuncionarios((prev) => [...prev, novo]);
      toast.success('Funcionário cadastrado com sucesso!', {
        description: 'Os dados do funcionário foram salvos.',
        duration: 2000,
        position: 'bottom-right',
        richColors: true,
      });
      return novo;
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Erro inesperado ao processar a requisição.';
      toast.error('Erro ao cadastrar funcionário', {
        description: message,
        duration: 3000,
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  return { funcionarios, saving, createFuncionario };
}

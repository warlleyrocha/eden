import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import type {
  CreateFuncionario,
  Funcionario,
  UpdateFuncionario,
} from '@/@types/funcionario';
import { funcionariosAPI } from '@/services/funcionario.api';

function errorMessage(error: unknown) {
  return error && typeof error === 'object' && 'message' in error
    ? String(error.message)
    : 'Erro inesperado ao processar a requisição.';
}

function sucesso(title: string, description?: string) {
  toast.success(title, {
    description,
    duration: 2000,
    position: 'bottom-right',
    richColors: true,
  });
}

function falha(title: string, error: unknown) {
  toast.error(title, { description: errorMessage(error), duration: 3000 });
}

/** Estado da tela de funcionários: carrega a lista ao montar e mantém em dia. */
export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** Id do funcionário com ativar/desativar em andamento. */
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchFuncionarios = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      setFuncionarios(await funcionariosAPI.fetchFuncionarios(signal));
    } catch (err) {
      if (signal?.aborted) return;
      setError(errorMessage(err));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFuncionarios(controller.signal);
    return () => controller.abort();
  }, [fetchFuncionarios]);

  const replace = (atualizado: Funcionario) =>
    setFuncionarios((prev) =>
      prev.map((f) => (f.id === atualizado.id ? atualizado : f))
    );

  const createFuncionario = useCallback(async (data: CreateFuncionario) => {
    setSaving(true);
    try {
      const novo = await funcionariosAPI.createFuncionario({ payload: data });
      setFuncionarios((prev) => [...prev, novo]);
      sucesso(
        'Funcionário cadastrado com sucesso!',
        'Ele já pode entrar com o e-mail e a senha cadastrados.'
      );
      return novo;
    } catch (err) {
      falha('Erro ao cadastrar funcionário', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateFuncionario = useCallback(
    async (id: string, data: UpdateFuncionario) => {
      setSaving(true);
      try {
        const atualizado = await funcionariosAPI.updateFuncionario({
          id,
          payload: data,
        });
        replace(atualizado);
        sucesso('Funcionário atualizado com sucesso!');
        return atualizado;
      } catch (err) {
        falha('Erro ao atualizar funcionário', err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  /** Bloqueia ou libera o acesso sem excluir; vale na hora na API. */
  const toggleAtivo = useCallback(async (funcionario: Funcionario) => {
    const ativo = !funcionario.ativo;
    setTogglingId(funcionario.id);
    try {
      const atualizado = await funcionariosAPI.updateFuncionario({
        id: funcionario.id,
        payload: { ativo },
      });
      replace(atualizado);
      sucesso(
        ativo ? 'Acesso reativado' : 'Acesso desativado',
        ativo
          ? `${funcionario.nome} pode entrar no sistema novamente.`
          : `${funcionario.nome} não consegue mais entrar no sistema.`
      );
    } catch (err) {
      falha(
        ativo ? 'Erro ao reativar funcionário' : 'Erro ao desativar funcionário',
        err
      );
    } finally {
      setTogglingId(null);
    }
  }, []);

  const deleteFuncionario = useCallback(async (id: string) => {
    try {
      await funcionariosAPI.deleteFuncionario({ id });
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
      sucesso('Funcionário excluído');
    } catch (err) {
      falha('Erro ao excluir funcionário', err);
    }
  }, []);

  return {
    funcionarios,
    loading,
    error,
    saving,
    togglingId,
    fetchFuncionarios,
    createFuncionario,
    updateFuncionario,
    toggleAtivo,
    deleteFuncionario,
  };
}

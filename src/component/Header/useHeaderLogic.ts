// components/Header/useHeaderLogic.ts

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useStore } from '@/hooks/useLoja';
import { useOrcamento } from '@/hooks/useOrcamento';
import { toast } from 'sonner';

export type OrcamentoStatus = 'ABERTO' | 'APROVADO' | 'REPROVADO';

export function useHeaderLogic() {
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingActionId, setProcessingActionId] = useState<string | null>(
    null
  );

  // Hooks personalizados para autenticação, nome da loja e orçamentos
  const { setAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { storeData } = useStore();
  const nameStore = storeData?.nome;

  const {
    orcamentos,
    loading,
    error,
    patchOrcamento,
    deleteOrcamento,
    fetchOrcamentos,
  } = useOrcamento();

  const refreshOrcamentos = useCallback(() => {
    fetchOrcamentos(); // Chama o fetchOrcamentos do hook useOrcamento
  }, [fetchOrcamentos]);

  // Verifica se há notificações de orçamentos pendentes
  const hasNotifications = orcamentos.length > 0;

  // Função para realizar logout do usuário
  const handleLogOut = useCallback(() => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    navigate('/signin');
  }, [setAuthenticated, navigate]);

  async function processAction<T>(
    id: string,
    actionName: string,
    actionFn: () => Promise<T>
  ) {
    try {
      setProcessingActionId(`${actionName}-${id}`);
      setErrorMessage(null);
      await actionFn();
      refreshOrcamentos();
    } catch {
      setErrorMessage(
        actionName === 'approve'
          ? 'Falha ao atualizar status'
          : 'Falha ao rejeitar orçamento'
      );
    } finally {
      setProcessingActionId(null);
    }
  }

  const atualizarStatus = useCallback(
    (id: string, status: OrcamentoStatus) => {
      return processAction(id, 'approve', () => patchOrcamento(id, { status }));
    },
    [patchOrcamento, refreshOrcamentos]
  );

  const removerOrcamento = useCallback(
    async (id: string) => {
      try {
        await processAction(id, 'reject', () => deleteOrcamento(id));
      } catch (error: unknown) {
        let errorMessage = 'Falha ao excluir';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        toast.error(errorMessage);
      }
    },
    [deleteOrcamento, refreshOrcamentos]
  );

  return {
    // Dados e estados
    nameStore,
    orcamentos,
    loading,
    error,
    errorMessage,
    processingActionId,
    showModal,
    hasNotifications,

    // Setters
    setShowModal,

    // Funções
    handleLogOut,
    atualizarStatus,
    removerOrcamento,
    refreshOrcamentos,
  };
}

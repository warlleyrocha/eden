import type { FormValues } from '@/@types/clients';
import { useClients } from '@/hooks/useCliente';
import {
  removeCpfCnpjFormatting,
  removePhoneFormatting,
} from '@/utils/formatters';
import { toast } from 'sonner';

export function useFormClient({
  reset,
  setShowModal,
}: {
  reset: (values?: FormValues) => void;
  setShowModal: (value: boolean) => void;
}) {
  const {
    fetchClients,
    createClient,
    updateClient,
    selectedClient,
    setSelectedClient,
    loading,
    setLoading,
  } = useClients();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    const lojaId = localStorage.getItem('storeId');
    if (!lojaId) {
      toast.error('Erro ao cadastrar', {
        description: 'ID da loja não encontrado.',
        duration: 2000,
      });
      setLoading(false);
      return;
    }

    // Remove a formatação antes de enviar para a API
    const payload = {
      nome: data.name,
      email: data.email,
      telefone: removePhoneFormatting(data.phone),
      cpfCnpj: removeCpfCnpjFormatting(data.cpfCnpj),
      endereco: data.address,
      lojaId,
    };

    try {
      if (selectedClient?.id) {
        // Atualização de cliente existente
        await updateClient(selectedClient.id, payload);
      } else {
        // Cadastro de novo cliente
        await createClient(payload);
      }

      // Atualiza a lista de clientes
      await fetchClients();

      // Reseta o formulário e fecha o modal
      reset();
      setSelectedClient(null);
      setShowModal(false);
    } catch (error) {
      let errorMessage = 'Erro inesperado ao processar a requisição.';
      if (error instanceof Error) errorMessage = error.message;

      toast.error('Erro ao cadastrar cliente', {
        description: errorMessage,
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    reset();
    setShowModal(false);
    setSelectedClient(null);
  };

  return {
    onSubmit,
    handleCloseModal,
    loading,
    selectedClient,
  };
}

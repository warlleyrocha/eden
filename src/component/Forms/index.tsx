import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// API
import { api } from '@/services/api';
import { AxiosError } from 'axios';

import { useClientContext } from '@/contexts/client';
import { useClients } from '@/hooks/useClients';

type FormsProps = {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
};

export default function Forms({ showModal, setShowModal }: FormsProps) {
  const { selectedClient, setSelectedClient } = useClientContext();
  const { updateClients, fetchClients } = useClients();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpfCnpj: '',
    address: '',
  });

  useEffect(() => {
    if (showModal && selectedClient) {
      setFormData({
        name: selectedClient.nome ?? '',
        phone: selectedClient.telefone ?? '',
        email: selectedClient.email ?? '',
        cpfCnpj: selectedClient.cpfCnpj ?? '',
        address: selectedClient.endereco ?? '',
      });
    } else if (showModal && !selectedClient) {
      // modo novo
      setFormData({
        name: '',
        phone: '',
        email: '',
        cpfCnpj: '',
        address: '',
      });
    }
  }, [showModal, selectedClient]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const lojaId = localStorage.getItem('storeId');
    if (!lojaId) {
      toast.error('Erro ao cadastrar', {
        description: 'ID da loja não encontrado.',
        duration: 1500,
      });
      return;
    }

    const payload = {
      nome: formData.name,
      email: formData.email,
      telefone: formData.phone,
      cpfCnpj: formData.cpfCnpj,
      endereco: formData.address,
      lojaId,
    };

    try {
      if (selectedClient?.id) {
        const response = await updateClients(selectedClient.id, payload);
        if (response?.status === 200) {
          setShowModal(false);
          toast.success('Cliente atualizado com sucesso!', {
            description: 'Dados atualizados.',
            duration: 1500,
          });
        } else {
          // Se a atualização falhar, você pode querer tratar isso de forma diferente
          toast.error('Erro ao atualizar cliente', {
            description: `Status inesperado: ${response?.status}`,
            duration: 1500,
          });
        }
      } else {
        // Cadastro de novo cliente
        const response = await api.post(`/clientes/${lojaId}`, payload);
        if (response.status === 201) {
          console.log(`Cliente, ${response.data.nome} cadastrado com sucesso!`);
          await fetchClients();
          toast.success('Cliente cadastrado com sucesso!', {
            description: 'Os dados do cliente foram salvos com sucesso.',
            duration: 1000,
          });
        } else {
          toast.error('Erro ao cadastrar cliente', {
            description: `Status inesperado: ${response.status}`,
            duration: 1500,
          });
        }
      }

      setFormData({
        name: '',
        phone: '',
        email: '',
        cpfCnpj: '',
        address: '',
      });
      setSelectedClient(null);
      setShowModal(false);
    } catch (error: unknown) {
      let errorMessage = 'Erro inesperado.';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error('Erro ao cadastrar cliente', {
        description: errorMessage,
        duration: 1500,
      });
    }
  };

  const handleCloseModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      cpfCnpj: '',
      address: '',
    });
    setShowModal(false);
    setSelectedClient(null);
  };

  if (!showModal) return null;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold text-gray-900">
          {selectedClient ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </h2>
        <div className="mb-4">
          <Label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nome:
          </Label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
          />
        </div>

        <div className="mb-4">
          <Label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Telefone:
          </Label>
          <Input
            type="text"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
          />
        </div>

        <div className="mb-4">
          <Label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email:
          </Label>
          <Input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
          />
        </div>

        <div className="mb-4">
          <Label
            htmlFor="cpfCnpj"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            CPF/CNPJ:
          </Label>
          <Input
            type="text"
            required
            value={formData.cpfCnpj}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cpfCnpj: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
          />
        </div>

        <div className="mb-4">
          <Label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Endereço:
          </Label>
          <Input
            type="text"
            required
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-3 rounded-full hover:from-red-600 hover:to-red-800"
            onClick={handleCloseModal}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-3 rounded-full hover:from-blue-600 hover:to-blue-800"
          >
            {selectedClient ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

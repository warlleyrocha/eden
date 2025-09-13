import type { FormValues } from '@/@types/clients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formatCpfCnpj,
  formatPhone,
  removeCpfCnpjFormatting,
  removePhoneFormatting,
} from '@/utils/formatters';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  IconAddress,
  IconDocument,
  IconEmail,
  IconName,
  IconPhone,
} from '../Icons/FormIcons';
import { useFormClient } from './useFormClient';

type FormsProps = Readonly<{
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}>;

const INITIAL_FORM: FormValues = {
  name: '',
  phone: '',
  email: '',
  cpfCnpj: '',
  address: '',
};

export default function Forms({ showModal, setShowModal }: FormsProps) {
  const { onSubmit, handleCloseModal, loading, selectedClient } = useFormClient(
    { reset: () => reset(INITIAL_FORM), setShowModal }
  );

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: INITIAL_FORM,
  });

  useEffect(() => {
    if (!showModal) return;

    if (selectedClient) {
      reset({
        name: selectedClient.nome ?? '',
        phone: selectedClient.telefone
          ? formatPhone(selectedClient.telefone)
          : '',
        email: selectedClient.email ?? '',
        cpfCnpj: selectedClient.cpfCnpj
          ? formatCpfCnpj(selectedClient.cpfCnpj)
          : '',
        address: selectedClient.endereco ?? '',
      });
    } else {
      reset(INITIAL_FORM);
    }
  }, [showModal, selectedClient, reset]);

  if (!showModal) return null;

  let buttonLabel: string;

  if (loading) {
    buttonLabel = 'Salvando...';
  } else if (selectedClient) {
    buttonLabel = 'Atualizar Cliente';
  } else {
    buttonLabel = 'Cadastrar Cliente';
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedClient ? 'Atualizar Cliente' : 'Novo Cliente'}
          </h2>
          <p className="text-sm text-gray-600">
            {selectedClient
              ? 'Atualize as informações do cliente'
              : 'Preencha os dados para cadastrar um novo cliente'}
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Nome */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-gray-700 flex items-center"
            >
              <IconName />
              Nome Completo
            </Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Digite o nome completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm"
                />
              )}
            />
          </div>

          {/* Telefone e Email - Layout em Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telefone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-semibold text-gray-700 flex items-center"
              >
                <IconPhone />
                Telefone
              </Label>
              <Controller
                name="phone"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="phone"
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (removePhoneFormatting(value).length <= 11) {
                        field.onChange(formatPhone(value));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                )}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 flex items-center"
              >
                <IconEmail />
                Email
              </Label>
              <Controller
                name="email"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm"
                  />
                )}
              />
            </div>
          </div>

          {/* CPF/CNPJ */}
          <div className="space-y-2">
            <Label
              htmlFor="cpfCnpj"
              className="text-sm font-semibold text-gray-700 flex items-center"
            >
              <IconDocument />
              CPF/CNPJ
            </Label>

            <Controller
              name="cpfCnpj"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="cpfCnpj"
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (removeCpfCnpjFormatting(value).length <= 14) {
                      field.onChange(formatCpfCnpj(value));
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm"
                />
              )}
            />
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-semibold text-gray-700 flex items-center"
            >
              <IconAddress />
              Endereço Completo
            </Label>
            <Controller
              name="address"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="address"
                  type="text"
                  placeholder="Rua, número, bairro, cidade - UF"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm"
                />
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleCloseModal}
            variant="outline"
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {buttonLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

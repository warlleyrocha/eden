import type { FormValues } from '@/@types/clients';
import { EntityFormLayout } from '@/components/app/entity-form-layout';
import { FormField } from '@/components/app/form-field';
import { Input } from '@/components/ui/input';
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

  return (
    <EntityFormLayout
      title={selectedClient ? 'Editar cliente' : 'Novo cliente'}
      description={
        selectedClient
          ? 'Atualize as informações do cliente.'
          : 'Preencha os dados para cadastrar um novo cliente.'
      }
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCloseModal}
      submitLabel={selectedClient ? 'Salvar alterações' : 'Cadastrar cliente'}
      loading={loading}
    >
      <FormField htmlFor="name" label="Nome Completo" icon={<IconName />}>
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
            />
          )}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField htmlFor="phone" label="Telefone" icon={<IconPhone />}>
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (removePhoneFormatting(value).length <= 11) {
                    field.onChange(formatPhone(value));
                  }
                }}
              />
            )}
          />
        </FormField>

        <FormField htmlFor="email" label="Email" icon={<IconEmail />}>
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
              />
            )}
          />
        </FormField>
      </div>

      <FormField htmlFor="cpfCnpj" label="CPF/CNPJ" icon={<IconDocument />}>
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
              onChange={(e) => {
                const value = e.target.value;
                if (removeCpfCnpjFormatting(value).length <= 14) {
                  field.onChange(formatCpfCnpj(value));
                }
              }}
            />
          )}
        />
      </FormField>

      <FormField
        htmlFor="address"
        label="Endereço Completo"
        icon={<IconAddress />}
      >
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
            />
          )}
        />
      </FormField>
    </EntityFormLayout>
  );
}

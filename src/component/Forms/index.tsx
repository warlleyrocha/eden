import type { FormValues } from '@/@types/clients';
import { Button } from '@/components/ui/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    buttonLabel = 'Salvar alterações';
  } else {
    buttonLabel = 'Cadastrar cliente';
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>
            {selectedClient ? 'Editar cliente' : 'Novo cliente'}
          </DialogTitle>
          <DialogDescription>
            {selectedClient
              ? 'Atualize as informações do cliente.'
              : 'Preencha os dados para cadastrar um novo cliente.'}
          </DialogDescription>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="flex items-center text-sm font-medium text-foreground"
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
                className="flex items-center text-sm font-medium text-foreground"
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
                   
                  />
                )}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center text-sm font-medium text-foreground"
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
                   
                  />
                )}
              />
            </div>
          </div>

          {/* CPF/CNPJ */}
          <div className="space-y-2">
            <Label
              htmlFor="cpfCnpj"
              className="flex items-center text-sm font-medium text-foreground"
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
                 
                />
              )}
            />
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="flex items-center text-sm font-medium text-foreground"
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
                 
                />
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleCloseModal} variant="outline">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {buttonLabel}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}

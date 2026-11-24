import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

import type {
  CreateFuncionario,
  FuncionarioFormValues,
} from '@/@types/funcionario';
import { EntityFormLayout } from '@/components/app/entity-form-layout';
import { FormField } from '@/components/app/form-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PERMISSOES } from '@/lib/permissoes';
import { cn } from '@/lib/utils';

import { IconEmail, IconName } from '../Icons/FormIcons';

const schema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome do funcionário.'),
    email: z
      .string()
      .trim()
      .min(1, 'Informe o e-mail.')
      .email('E-mail inválido.'),
    password: z.string().min(6, 'A senha precisa ter no mínimo 6 caracteres.'),
    confirmPassword: z.string(),
    permissoes: z.array(z.string()),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  });

const INITIAL_FORM: FuncionarioFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  permissoes: [],
};

type FormFuncionarioProps = Readonly<{
  onSubmit: (data: CreateFuncionario) => Promise<unknown>;
  onClose: () => void;
  loading?: boolean;
}>;

export default function FormFuncionario({
  onSubmit,
  onClose,
  loading,
}: FormFuncionarioProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FuncionarioFormValues>({
    defaultValues: INITIAL_FORM,
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit({
        nome: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        senha: data.password,
        permissoes: data.permissoes,
      });
      onClose();
    } catch {
      // O erro já é exibido via toast; mantém o formulário aberto.
    }
  });

  return (
    <EntityFormLayout
      title="Novo funcionário"
      description="Cadastre um funcionário e defina o que ele pode acessar."
      onSubmit={submit}
      onCancel={onClose}
      submitLabel="Cadastrar funcionário"
      loading={loading}
      noValidate
    >
      <FormField
        htmlFor="name"
        label="Nome Completo"
        icon={<IconName />}
        error={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="name"
              type="text"
              placeholder="Digite o nome completo"
              autoComplete="off"
              aria-invalid={!!errors.name}
            />
          )}
        />
      </FormField>

      <FormField
        htmlFor="email"
        label="Email"
        icon={<IconEmail />}
        error={errors.email?.message}
        hint="Usado pelo funcionário para entrar no sistema."
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="email"
              type="email"
              placeholder="funcionario@email.com"
              autoComplete="off"
              aria-invalid={!!errors.email}
            />
          )}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          htmlFor="password"
          label="Senha"
          icon={<KeyRound className="mr-2 size-4 text-foreground-muted" />}
          error={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
              />
            )}
          />
        </FormField>

        <FormField
          htmlFor="confirmPassword"
          label="Confirmar senha"
          icon={<KeyRound className="mr-2 size-4 text-foreground-muted" />}
          error={errors.confirmPassword?.message}
        >
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
              />
            )}
          />
        </FormField>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 flex items-center text-sm font-medium text-foreground">
          <ShieldCheck className="mr-2 size-4 text-foreground-muted" />
          Permissões
        </legend>
        <Controller
          name="permissoes"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PERMISSOES.map((p) => {
                const checked = field.value.includes(p.value);
                const id = `perm-${p.value}`;
                return (
                  <label
                    key={p.value}
                    htmlFor={id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:border-border-hover',
                      checked && 'border-brand/40 bg-brand-bg'
                    )}
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(value) =>
                        field.onChange(
                          value
                            ? [...field.value, p.value]
                            : field.value.filter((v) => v !== p.value)
                        )
                      }
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {p.label}
                      </span>
                      <span className="block text-xs text-foreground-secondary">
                        {p.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </fieldset>
    </EntityFormLayout>
  );
}

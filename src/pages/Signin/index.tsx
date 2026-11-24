/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandMark } from '@/components/layout/app-sidebar';
import { toast } from 'sonner';
import { Eye, EyeOff, LogInIcon } from 'lucide-react';

export default function SignIn() {
  const { setAuthenticated } = useAuth(); // Hook para gerenciar autenticação
  const navigate = useNavigate(); // Hook para navegação entre rotas

  const [email, setEmail] = useState(''); // Estado para armazenar o email
  const [password, setPassword] = useState(''); // Estado para armazenar a senha
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar a visibilidade da senha
  const [error, setError] = useState('');

  // Função para lidar com o envio do formulário de login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: email,
        senha: password,
      });

      if (response.status === 200) {
        const { access_token, loja } = response.data;

        localStorage.setItem('token', access_token);

        if (loja?.id) {
          localStorage.setItem('storeId', loja.id);
        }

        setError('');

        toast.success('Login realizado com sucesso!', {
          description: 'Você está sendo redirecionado para a página inicial',
          duration: 2000,
          position: 'bottom-right',
          richColors: true,
        });

        setAuthenticated(true);

        setTimeout(() => {
          navigate('/home');
        }, 3000); // Aguarda o toast antes de redirecionar
      }
    } catch (err) {
      toast.error('Credenciais inválidas!', {
        description: 'Verifique seu Email e senha.',
        duration: 2000,
        position: 'bottom-right',
        richColors: true,
      });
    }
  };

  // Função para alternar visibilidade
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-4">
      {/* Credenciais do usuário de teste */}
      <div className="group absolute top-5 right-5">
        <button
          type="button"
          className="flex size-10 cursor-help items-center justify-center rounded-full border border-border bg-surface text-foreground-secondary shadow-card hover:text-foreground"
          aria-label="Ver usuário de teste"
        >
          <LogInIcon size={18} />
        </button>
        <div className="pointer-events-none absolute top-12 right-0 w-56 rounded-lg border border-border bg-surface p-4 text-sm opacity-0 shadow-dropdown transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <p className="mb-1 font-semibold">Usuário de teste</p>
          <p className="text-foreground-secondary">front@dev.com</p>
          <p className="text-foreground-secondary">Npmrundev!</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark className="size-11 rounded-xl" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Entrar no Éden
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Gestão de caixa, estoque e orçamentos
          </p>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="voce@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="Sua senha"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded-sm p-1.5 text-foreground-muted hover:bg-neutral-bg hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger-foreground"
              >
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandMark } from '@/components/layout/app-sidebar';
import { NAV_ITEMS } from '@/components/layout/nav-items';
import { toast } from 'sonner';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogInIcon,
  Mail,
  ShieldCheck,
} from 'lucide-react';

const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

// Destaques do painel esquerdo: os módulos do menu, exceto o Dashboard
const FEATURES = NAV_ITEMS.filter((item) => item.url !== '/home');

function showComingSoon(feature: string) {
  toast.info(`${feature} em breve`, {
    description: 'Este recurso ainda não está disponível.',
    duration: 2500,
    position: 'bottom-right',
  });
}

function Brand({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const lg = size === 'lg';
  return (
    <div className="flex items-center gap-3">
      <BrandMark className={lg ? 'size-12 rounded-xl' : 'size-10 rounded-xl'} />
      <span
        className={
          lg
            ? 'text-3xl font-semibold tracking-tight text-foreground'
            : 'text-2xl font-semibold tracking-tight text-foreground'
        }
      >
        Éden
      </span>
    </div>
  );
}

/** Linhas decorativas do painel esquerdo (substituem a foto da referência). */
function DecorativeLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-brand"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMaxYMid slice"
      fill="none"
    >
      <rect
        x="560"
        y="150"
        width="520"
        height="520"
        rx="80"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      <rect
        x="660"
        y="-140"
        width="520"
        height="520"
        rx="120"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />
      <path
        d="M560 900 C 600 700, 680 600, 800 560"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function SignIn() {
  const { setAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    () => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''
  );
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem(REMEMBERED_EMAIL_KEY) !== null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
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

        // "Lembrar de mim": guarda o e-mail para preencher no próximo acesso
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }

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
    } catch {
      setIsSubmitting(false);
      toast.error('Credenciais inválidas!', {
        description: 'Verifique seu Email e senha.',
        duration: 2000,
        position: 'bottom-right',
        richColors: true,
      });
    }
  };

  return (
    <div className="relative flex min-h-svh items-stretch justify-center bg-background p-0 sm:p-4 lg:p-6">
      <div className="flex w-full max-w-[1440px] overflow-hidden bg-surface sm:rounded-container sm:border sm:border-border sm:shadow-dropdown">
        {/* Painel institucional */}
        <aside className="relative hidden w-[55%] flex-col overflow-hidden bg-gradient-to-br from-brand-bg via-[#f7f5ff] to-surface-secondary p-12 lg:flex xl:p-16">
          <DecorativeLines />

          <div className="relative">
            <Brand size="lg" />
          </div>

          <div className="relative mt-auto mb-auto max-w-lg pt-16">
            <h2 className="text-4xl leading-[1.15] font-bold tracking-tight text-foreground xl:text-5xl">
              <span className="block">Sua empresa</span>
              <span className="block">mais organizada,</span>
              <span className="block">sempre à frente.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-foreground-secondary">
              Controle financeiro, estoque, clientes e orçamentos em um só
              lugar.
            </p>
          </div>

          <ul className="relative grid max-w-lg grid-cols-2 gap-3">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-xl border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-bg text-brand-foreground">
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {title}
                  </span>
                  <span className="block text-xs leading-snug text-foreground-secondary">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Formulário */}
        <main className="relative flex flex-1 flex-col px-6 py-10 sm:px-12">
          {/* Credenciais do usuário de teste */}
          <div className="group absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
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

          <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center">
            <Brand />

            <h1 className="mt-10 text-3xl font-bold tracking-tight text-foreground">
              Bem-vindo de volta!
            </h1>
            <p className="mt-2 text-foreground-secondary">
              Faça login para acessar seu sistema.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleLogin} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail ou usuário</Label>
                <div className="relative">
                  <Mail
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-foreground-secondary"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    placeholder="Digite seu e-mail ou usuário"
                    className="h-12 pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-foreground-secondary"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder="Digite sua senha"
                    className="h-12 pr-12 pl-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-sm p-1.5 text-foreground-secondary hover:bg-neutral-bg hover:text-foreground"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v === true)}
                    className="size-[18px]"
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer font-normal"
                  >
                    Lembrar de mim
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => showComingSoon('Recuperação de senha')}
                  className="cursor-pointer rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger-foreground"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-12 w-full text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="size-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4 text-sm text-foreground-secondary">
              <span className="h-px flex-1 bg-border" />
              ou
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full text-base"
              onClick={() => showComingSoon('Acesso com SSO')}
            >
              <ShieldCheck className="size-5" />
              Acessar com SSO
            </Button>
          </div>

          <p className="mt-10 text-center text-xs text-foreground-secondary">
            <span className="font-medium text-foreground">Éden</span>
            <span className="mx-2" aria-hidden>
              •
            </span>
            Gestão inteligente para o seu negócio
          </p>
        </main>
      </div>
    </div>
  );
}

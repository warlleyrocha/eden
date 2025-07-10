/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SignIn() {
  const { setAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="flex flex-col items-center p-4 justify-center h-screen bg-[linear-gradient(90deg,rgba(42,123,155,1)_37%,rgba(87,199,133,1)_98%)]">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#1E3A8A]">
          Login
        </h2>
        <form className="w-full" onSubmit={handleLogin}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1E3A8A] mb-2"
            >
              Email:
            </label>
            <Input
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Email"
              className="mt-1 block w-full border-2 border-[#B8C6E0] rounded-md p-3
             transition-all duration-200 ease-in-out
             focus:border-[#152C6B] focus:ring-4 focus:ring-[#3A5AAA]
             focus:outline-none placeholder-[#0E1F4D]
             hover:border-[#2A4A9A] text-[#081534]"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1E3A8A] mb-2"
            >
              Password:
            </label>
            <Input
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Senha"
              className="mt-1 block w-full border-2 border-[#B8C6E0] rounded-md p-3
             transition-all duration-200 ease-in-out
             focus:border-[#152C6B] focus:ring-4 focus:ring-[#3A5AAA]
             focus:outline-none placeholder-[#0E1F4D]
             hover:border-[#2A4A9A] text-[#081534]"
            />
          </div>
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-[#1E3A8A] text-white hover:bg-[#152C6B] transition-colors duration-200 cursor-pointer"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

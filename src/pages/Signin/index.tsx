/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="flex flex-col items-center p-4 justify-center h-screen bg-[linear-gradient(90deg,rgba(42,123,155,1)_37%,rgba(87,199,133,1)_98%)]">
      <div className="absolute top-5 right-5 bg-gradient-to-br from-blue-400 to-[#1E3A8A] p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group cursor-text">
        <LogInIcon color="white" size={20} />
        <div className="absolute top-5 right-5 bg-white rounded-2xl p-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto shadow-2xl border border-gray-100">
          <p className="text-gray-800 font-semibold mb-1">User Test</p>
          <p className="text-gray-600 text-sm mb-1">front@dev.com</p>
          <p className="text-gray-600 text-sm">Npmrundev!</p>
        </div>
      </div>

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
            <div className="relative">
              {' '}
              {/* Container relativo para posicionar o ícone */}
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Senha"
                className="mt-1 block w-full border-2 border-[#B8C6E0] rounded-md p-3 pr-12
               transition-all duration-200 ease-in-out
               focus:border-[#152C6B] focus:ring-4 focus:ring-[#3A5AAA]
               focus:outline-none placeholder-[#0E1F4D]
               hover:border-[#2A4A9A] text-[#081534]"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                         text-[#1E3A8A] hover:text-[#152C6B] transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-[#3A5AAA] focus:ring-offset-1 rounded"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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

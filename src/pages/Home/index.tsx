import Cards from '@/component/Card';
import { Header } from '@/component/Header';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#333] flex flex-col h-full  ">
      <div className="flex flex-row">
        <Header />
      </div>

      <div className="flex flex-1/2 items-center justify-center ">
        <div className="px-10  my-4  grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Cards
            title="Caixa"
            subTitle="Controle financeiro e métodos de pagamento"
            description="Registre todas as transações financeiras com PIX, dinheiro, débito e crédito."
            buttonTitle="Acessar"
            onButtonClick={() => navigate('/caixa')}
          />
          <Cards
            title="Estoque"
            subTitle="Gerenciamento de inventário"
            description="Controle seu inventário com informações detalhadas sobre produtos e quantidades disponíveis."
            onButtonClick={() => navigate('/estoque')}
            buttonTitle="Acessar"
          />
          <Cards
            title="Orçamento"
            subTitle="Clientes e Orçamentos"
            description="Cadastre clientes e gere orçamentos personalizados com cópias para ambas as partes."
            onButtonClick={() => navigate('/orcamento')}
            buttonTitle="Acessar"
          />
        </div>
      </div>
    </div>
  );
}

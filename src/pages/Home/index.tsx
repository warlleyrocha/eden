import Cards from "@/component/Card";
import { Header } from "@/component/Header";
import { useNavigate } from "react-router-dom";

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
            subTitle="Controle de entrada e saida e metedos de pagamento"
            description="Registre todas as transaçoes financeiras incluido entradas saidae metodos de pagamento com pix dinheiro debito e credito"
            buttonTitle="Acessar"
            onButtonClick={() => navigate("/caixa")}
          />
          <Cards
            title="Estoque"
            subTitle="Gerenciamento de produto e quantidade"
            description="Mantenha o controle do seu inventario com inoformaçoes detalhada sobre cada produto e suas quantidade disponivel."
            onButtonClick={() => navigate("/estoque")}
            buttonTitle="Acessar"
          />
          <Cards
            title="Orçamento"
            subTitle="Cadastro de clientes e geração de orçamentos"
            description="Cadastre seus clientes e gere orçamentos personalizados com cópias para o cliente e para a loja."
            onButtonClick={() => navigate("/orcamento")}
            buttonTitle="Acessar"
          />
        </div>
      </div>
    </div>
  );
}

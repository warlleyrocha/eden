// File: src/pages/estoque/index.tsx

import { useMemo, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import DialogModal from '@/component/DialogModal';
import { Header } from '@/component/Header';
import { TableData } from '@/component/TableData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStock } from '@/hooks/useStock';
import { toast } from 'sonner';

import type { Produto } from '@/@types/product';

export default function Stock() {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [busca, setBusca] = useState('');
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  const { products, addProduct, updateProduct, deleteProduct } = useStock();

  const produtosFiltrados = useMemo(() => {
    if (!busca.trim()) {
      return products.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    const termoBusca = busca.toLowerCase();
    return products
      .filter((item) => item.nome.toLowerCase().includes(termoBusca))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [busca, products]);

  const stats = useMemo(
    () => ({
      totalProdutos: products.length,
      totalEstoque: products.reduce((sum, p) => sum + (p.estoque ?? 0), 0),
      valorTotalEstoque: products.reduce(
        (sum, p) => sum + (p.estoque ?? 0) * (p.precoCusto ?? 0),
        0
      ),
    }),
    [products]
  );

  const openModal = () => {
    setIsOpen(true);
  };

  const editarProduto = (id: string) => {
    const produto = products.find((p) => p.id === id);
    if (!produto) return;

    setProdutoEditando(produto);
    setNome(produto.nome || '');
    setQuantidade(produto.estoque?.toString() || '');
    setPreco(produto.precoCusto?.toString() || '');
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#333] flex flex-col h-full">
      <div className="flex flex-row">
        <Header />
      </div>
      <div className="max-w-4xl mx-auto mt-8 w-full px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-md">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A8A]">
            Gerenciador de Estoque
          </h1>
          <Button
            className="flex items-center space-x-2 bg-[#1E3A8A] text-white hover:bg-[#152C6B] transition-colors duration-200 px-4 py-2 rounded-lg mt-4 sm:mt-0 cursor-pointer"
            onClick={openModal}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Adicionar no Estoque</span>
          </Button>
        </div>

        <div className="px-5 py-5 border-2 rounded-2xl shadow-lg border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
            Resumo do estoque
          </h1>
          <p className="text-lg text-[#1E3A8A] mb-4">
            Visão geral dos produtos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6 p-4 bg-white rounded-lg">
            <div className="card-body p-4 rounded-lg border border-[#081534]">
              <p className="card-title text-[#1E3A8A] text-lg font-semibold">
                Total de Produtos
              </p>
              <h3 className="card-text text-[#2A4A9A]">
                {stats.totalProdutos}
              </h3>
            </div>
            <div className="card-body p-4 rounded-lg border border-[#081534]">
              <p className="card-title text-[#1E3A8A] text-lg font-semibold">
                Itens em Estoque
              </p>
              <h3 className="card-text text-[#2A4A9A]">{stats.totalEstoque}</h3>
            </div>
            <div className="card-body p-4 rounded-lg border border-[#081534]">
              <p className="card-title text-[#1E3A8A] text-lg font-semibold">
                Valor Total em Estoque
              </p>
              <h3 className="card-text text-[#2A4A9A]">
                {stats.valorTotalEstoque.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </h3>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-[30%] mt-5">
          <div className="relative">
            <form className="flex flex-row gap-1.5">
              <Input
                placeholder="Buscar produto..."
                className="w-full bg-white placeholder:text-[#081534] px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <Button type="button" className="bg-[#1E3A8A]">
                <Search />
              </Button>
            </form>
          </div>
        </div>

        <div className="w-full overflow-x-auto mt-4">
          <TableData
            onEdit={(produtoSelecionado) => editarProduto(produtoSelecionado)}
            onDelete={(id) => {
              deleteProduct(id);
              toast.success('Produto excluído com sucesso!', {
                description: 'O item foi removido do estoque.',
                duration: 3000,
                position: 'top-right',
                richColors: true,
              });
            }}
            items={produtosFiltrados.map((item) => {
              const precoUnit = item.precoCusto ?? 0;
              const qtd = item.estoque ?? 0;
              const valorTotal = precoUnit * qtd;
              return {
                id: item.id, // <- necessário
                produto: item.nome || 'Sem nome',
                quantidade: qtd,
                preco: precoUnit.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }),
                valor_total: valorTotal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }),
              };
            })}
          />
        </div>
      </div>

      {isOpen && (
        <DialogModal
          title="Adicionar ao Estoque"
          description="Preencha os detalhes do item abaixo"
          isOpen={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          customStyles={{
            width: '400px',
            height: 'full',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'left',
            color: '#1E3A8A',
            paddingBottom: '3px',
          }}
        >
          <div className="text-center text-[#1E3A8A]">
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();

                const dados = {
                  nome,
                  quantidadeInicial: parseInt(quantidade),
                  precoCusto: parseFloat(preco),
                };

                if (produtoEditando) {
                  // Aqui você deve chamar o updateProduct() com o ID correto
                  await updateProduct(produtoEditando.id, dados);
                  toast.success('Produto atualizado com sucesso!', {
                    description: 'As alterações foram salvas.',
                    duration: 3000,
                    position: 'top-right',
                    richColors: true,
                  });
                } else {
                  await addProduct(dados);
                  toast.success('Produto adicionado ao estoque com sucesso!', {
                    description:
                      'O item foi incluído corretamente no seu inventário.',
                    duration: 3000,
                    position: 'top-right',
                    richColors: true,
                  });
                }

                // Limpa tudo
                setIsOpen(false);
                setProdutoEditando(null);
                setNome('');
                setQuantidade('');
                setPreco('');
              }}
            >
              <Label>Nome do produto</Label>
              <Input
                type="text"
                placeholder="Nome do Item"
                value={nome}
                className="w-full px-3 py-2 mb-8 border rounded"
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <div className="w-full flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <Label className="py-3">Quantidade</Label>
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={quantidade}
                    className="w-full px-3 py-2 border rounded"
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label className="py-3">Preço (R$)</Label>
                  <Input
                    type="number"
                    placeholder="Preço"
                    value={preco}
                    className="w-full px-3 py-2 border rounded"
                    onChange={(e) => setPreco(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between space-x-2 pb-6 pt-4 gap-3 flex-col sm:flex-row">
                <Button
                  type="button"
                  className="bg-white text-gray-700 px-4 py-2 rounded-full border border-[#152C6B] hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1E3A8A] text-white px-4 py-2 rounded-full hover:bg-[#152C6B] transition-colors duration-200 cursor-pointer"
                >
                  {produtoEditando ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </DialogModal>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { KpiCard } from '@/components/app/kpi-card';
import { SectionCard } from '@/components/app/section-card';
import { SearchInput } from '@/components/app/search-input';
import { EmptyState } from '@/components/app/empty-state';
import { TableData } from '@/component/TableData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { useEstoque } from '@/hooks/useEstoque';
import { getStockStatus, STOCK_STATUS, type StockStatus } from '@/lib/status';
import { formatarMoeda } from '@/utils/formatters';

import type { Produto } from '@/@types/product';

type FiltroStatus = 'todos' | StockStatus;

// Capitaliza cada palavra do nome do produto
const capitalize = (text: string): string =>
  text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const toastOk = (title: string, description: string) =>
  toast.success(title, {
    description,
    duration: 2000,
    position: 'bottom-right',
    richColors: true,
  });

export default function Stock() {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [busca, setBusca] = useState(() => searchParams.get('busca') ?? '');
  const [filtro, setFiltro] = useState<FiltroStatus>('todos');
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Busca vinda da busca global (?busca=...)
  const buscaParam = searchParams.get('busca');
  useEffect(() => {
    if (buscaParam !== null) setBusca(buscaParam);
  }, [buscaParam]);

  const { products, loading, addProduct, updateProduct, deleteProduct } =
    useEstoque();
  const carregando = loading && products.length === 0;

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return products
      .filter((p) => !termo || p.nome.toLowerCase().includes(termo))
      .filter((p) => filtro === 'todos' || getStockStatus(p.estoque) === filtro)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [busca, filtro, products]);

  const stats = useMemo(() => {
    let reposicao = 0;
    let esgotados = 0;
    for (const p of products) {
      const s = getStockStatus(p.estoque);
      if (s !== 'in_stock') reposicao += 1;
      if (s === 'out_of_stock') esgotados += 1;
    }
    return {
      totalProdutos: products.length,
      totalEstoque: products.reduce((sum, p) => sum + (p.estoque ?? 0), 0),
      valorTotalEstoque: products.reduce(
        (sum, p) => sum + (p.estoque ?? 0) * (p.precoCusto ?? 0),
        0
      ),
      reposicao,
      esgotados,
    };
  }, [products]);

  const resetForm = () => {
    setProdutoEditando(null);
    setNome('');
    setPreco('');
    setQuantidade('');
  };

  const openNew = () => {
    resetForm();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetForm();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      nome: capitalize(nome),
      quantidadeInicial: parseInt(quantidade),
      precoCusto: parseFloat(preco),
    };

    setSalvando(true);
    try {
      if (produtoEditando) {
        await updateProduct(produtoEditando.id, dados);
        toastOk('Produto atualizado com sucesso!', 'As alterações foram salvas.');
      } else {
        await addProduct(dados);
        toastOk(
          'Produto adicionado ao estoque com sucesso!',
          'O item foi incluído corretamente no seu inventário.'
        );
      }
      closeModal();
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    toastOk('Produto excluído com sucesso!', 'O item foi removido do estoque.');
  };

  const temFiltro = busca.trim() !== '' || filtro !== 'todos';

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total de produtos"
          value={stats.totalProdutos.toLocaleString('pt-BR')}
          loading={carregando}
        />
        <KpiCard
          label="Unidades em estoque"
          value={stats.totalEstoque.toLocaleString('pt-BR')}
          loading={carregando}
        />
        <KpiCard
          label="Valor em estoque"
          value={formatarMoeda(stats.valorTotalEstoque)}
          hint="Calculado pelo preço de custo"
          loading={carregando}
        />
        <KpiCard
          label="Precisam de reposição"
          value={stats.reposicao.toLocaleString('pt-BR')}
          badge={
            stats.esgotados > 0 ? (
              <span className="tabular rounded-sm bg-danger-bg px-1.5 py-0.5 text-xs font-medium text-danger-foreground">
                {stats.esgotados} esgotado{stats.esgotados > 1 ? 's' : ''}
              </span>
            ) : undefined
          }
          loading={carregando}
        />
      </div>

      <SectionCard
        title="Produtos"
        description={
          carregando
            ? 'Carregando...'
            : `${produtosFiltrados.length} de ${products.length} produtos`
        }
        flush
        actions={
          <>
            <SearchInput
              value={busca}
              onChange={setBusca}
              placeholder="Buscar produto..."
            />
            <Select
              value={filtro}
              onValueChange={(v) => setFiltro(v as FiltroStatus)}
            >
              <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {(Object.keys(STOCK_STATUS) as StockStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STOCK_STATUS[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openNew}>
              <Plus /> Adicionar produto
            </Button>
          </>
        }
      >
        {carregando ? (
          <div className="space-y-2 px-6 pb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <EmptyState
            icon={<PackageOpen />}
            title={temFiltro ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            description={
              temFiltro
                ? 'Tente outro termo de busca ou altere o filtro de status.'
                : 'Adicione o primeiro produto para começar a controlar o estoque.'
            }
            action={
              temFiltro ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca('');
                    setFiltro('todos');
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={openNew}>
                  <Plus /> Adicionar produto
                </Button>
              )
            }
          />
        ) : (
          <TableData
            items={produtosFiltrados}
            onEdit={editarProduto}
            onDelete={handleDelete}
          />
        )}
      </SectionCard>

      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {produtoEditando ? 'Editar produto' : 'Adicionar produto'}
            </DialogTitle>
            <DialogDescription>
              {produtoEditando
                ? 'Atualize os dados do produto.'
                : 'Preencha os dados do novo item do estoque.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="produto-nome">Nome do produto</Label>
              <Input
                id="produto-nome"
                type="text"
                placeholder="Ex.: Fone sem fio"
                value={nome}
                onChange={(e) => setNome(capitalize(e.target.value))}
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="produto-qtd">Quantidade</Label>
                <Input
                  id="produto-qtd"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="0"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="produto-preco">Preço de custo (R$)</Label>
                <Input
                  id="produto-preco"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {produtoEditando ? 'Salvar alterações' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

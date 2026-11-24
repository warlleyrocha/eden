import { useCallback, useMemo } from 'react';

import { KpiCard } from '@/components/app/kpi-card';
import TableOrcamento from '@/component/Orcamento/TableOrcamento';

import { useClients } from '@/hooks/useCliente';
import { useOrcamento } from '@/hooks/useOrcamento';
import { useEstoque } from '@/hooks/useEstoque';
import { useStore } from '@/hooks/useLoja';
import { formatarMoeda } from '@/utils/formatters';

import type {
  Orcamento,
  OrcamentoRenderDetails,
  CreateOrcamento,
} from '@/@types/orcamento';

// Converte Orcamento -> OrcamentoRenderDetails
const convertToRenderDetails = (
  orcamento: Orcamento
): OrcamentoRenderDetails => {
  const totalCalculado =
    orcamento.itens.reduce(
      (sum, item) => sum + item.precoUnitario * item.quantidade,
      0
    ) + orcamento.servicos.reduce((sum, servico) => sum + servico.valor, 0);

  return {
    id: orcamento.id,
    cliente: orcamento.cliente
      ? {
        id: orcamento.cliente.id,
        nome: orcamento.cliente.nome ?? '',
        telefone: orcamento.cliente.telefone ?? '',
      }
      : undefined,
    criadoEm: orcamento.criadoEm ?? new Date().toISOString(),
    total: orcamento.total ?? totalCalculado,
    status: orcamento.status,
  };
};

export default function Orcamentos() {
  const { products } = useEstoque();
  const { storeData } = useStore();
  const { clients } = useClients();
  const {
    orcamentos,
    loading,
    fetchOrcamentos,
    createOrcamento,
    deleteOrcamento,
  } = useOrcamento();

  const carregando = loading && orcamentos.length === 0;

  const handleOrcamentoSubmit = useCallback(
    async (orcamentoData: CreateOrcamento) => {
      try {
        await createOrcamento({ payload: orcamentoData });
      } catch (error) {
        console.error('Erro ao criar orçamento:', error);
      }
    },
    [createOrcamento]
  );

  const handleDeleteOrcamento = useCallback(
    async (id: string) => {
      try {
        await deleteOrcamento(id);
      } catch (error) {
        console.error('Falha ao deletar orçamento:', error);
        fetchOrcamentos();
      }
    },
    [deleteOrcamento, fetchOrcamentos]
  );

  const formattedClients = useMemo(
    () =>
      clients.map((client, index) => ({
        id: typeof client.id === 'string' ? client.id : String(client.id ?? index),
        nome: client.nome || '',
        telefone: client.telefone || '',
        email: client.email || '',
        cpfCnpj: client.cpfCnpj ?? '',
        doc: client.doc || '',
        endereco: client.endereco || '',
      })),
    [clients]
  );

  const formattedOrcamentos = useMemo<OrcamentoRenderDetails[]>(
    () =>
      orcamentos
        .map(convertToRenderDetails)
        .sort(
          (a, b) =>
            new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        ),
    [orcamentos]
  );

  const stats = useMemo(() => {
    let abertos = 0;
    let aprovados = 0;
    let valorAprovado = 0;
    let valorAberto = 0;
    for (const o of formattedOrcamentos) {
      if (o.status === 'ABERTO') {
        abertos += 1;
        valorAberto += o.total;
      } else if (o.status === 'APROVADO') {
        aprovados += 1;
        valorAprovado += o.total;
      }
    }
    const total = formattedOrcamentos.length;
    return {
      total,
      abertos,
      aprovados,
      valorAprovado,
      valorAberto,
      taxaAprovacao: total ? Math.round((aprovados / total) * 100) : 0,
    };
  }, [formattedOrcamentos]);

  const formattedStoreData = useMemo(() => {
    if (!storeData) return undefined;
    return {
      nome: storeData.nome || '',
      email: storeData.email || '',
      cnpj: storeData.cnpj || '',
      endereco: storeData.endereco || '',
      telefone: storeData.telefone || '',
      subTitulo: storeData.subTitulo || '',
    };
  }, [storeData]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total de orçamentos"
          value={stats.total.toLocaleString('pt-BR')}
          loading={carregando}
        />
        <KpiCard
          label="Em aberto"
          value={stats.abertos.toLocaleString('pt-BR')}
          hint={`${formatarMoeda(stats.valorAberto)} aguardando aprovação`}
          loading={carregando}
        />
        <KpiCard
          label="Aprovados"
          value={stats.aprovados.toLocaleString('pt-BR')}
          badge={
            <span className="tabular rounded-sm bg-neutral-bg px-1.5 py-0.5 text-xs font-medium text-foreground-secondary">
              {stats.taxaAprovacao}% do total
            </span>
          }
          loading={carregando}
        />
        <KpiCard
          label="Valor aprovado"
          value={formatarMoeda(stats.valorAprovado)}
          loading={carregando}
        />
      </div>

      <TableOrcamento
        formattedOrcamentos={formattedOrcamentos}
        formattedClients={formattedClients}
        onDeleteOrcamento={handleDeleteOrcamento}
        onSubmitOrcamento={handleOrcamentoSubmit}
        products={products}
        storeData={formattedStoreData}
      />
    </>
  );
}

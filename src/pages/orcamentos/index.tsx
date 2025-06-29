import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

import { Header } from '@/component/Header';
import { Button } from '@/components/ui/button';

import Forms from '@/component/Forms';

import TableOrcamento from '@/component/TableOrcamento';
import TableClient from '@/component/TableClients';

import { useClients } from '@/hooks/useCliente';
import { useOrcamento } from '@/hooks/useOrcamento';
import { useEstoque } from '@/hooks/useEstoque';
import { useStore } from '@/hooks/useLoja';
import { useClientContext } from '@/contexts/client';

import type {
  Orcamento,
  OrcamentoRenderDetails,
  CreateOrcamento,
} from '@/@types/orcamento';
import type { Client } from '@/@types/clients';

// Função auxiliar para converter Orcamento -> OrcamentoRenderDetails
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

export default function Orcamento() {
  const [activeTab, setActiveTab] = useState('Clientes');
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [tableClientKey, setTableClientKey] = useState(0);
  const { setSelectedClient } = useClientContext();
  const { products } = useEstoque();
  const { storeData } = useStore();

  // Refs para controlar se os dados já foram carregados
  const clientsLoadedRef = useRef(false);
  const orcamentosLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const { clients, deleteClient, fetchClients, fetchClientsById } =
    useClients();
  const { orcamentos, fetchOrcamentos, createOrcamento, deleteOrcamento } =
    useOrcamento();

  // Função para carregar clientes apenas uma vez
  const loadClients = useCallback(async () => {
    if (clientsLoadedRef.current || !isMountedRef.current) return;

    try {
      await fetchClients();
      clientsLoadedRef.current = true;
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }, [fetchClients]);

  // Função para carregar orçamentos apenas uma vez
  const loadOrcamentos = useCallback(async () => {
    if (orcamentosLoadedRef.current || !isMountedRef.current) return;

    try {
      await fetchOrcamentos();
      orcamentosLoadedRef.current = true;
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    }
  }, [fetchOrcamentos]);

  // Carrega dados baseado na aba ativa, mas apenas uma vez
  useEffect(() => {
    if (activeTab === 'Clientes') {
      loadClients();
    } else if (activeTab === 'Orçamentos') {
      loadClients(); // Também precisa dos clientes para o select
      loadOrcamentos();
    }
  }, [activeTab, loadClients, loadOrcamentos]);

  // Cleanup no desmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleOrcamentoSubmit = useCallback(
    async (orcamentoData: CreateOrcamento) => {
      const controller = new AbortController();
      try {
        await createOrcamento({
          payload: orcamentoData,
          signal: controller.signal,
        });
        // Recarrega orçamentos após criar novo
        orcamentosLoadedRef.current = false;
        await loadOrcamentos();
      } catch (error) {
        console.error('Erro ao criar orçamento:', error);
      }
    },
    [createOrcamento, loadOrcamentos]
  );

  // Função para deletar orçamento
  const handleDeleteOrcamento = useCallback(
    async (id: string) => {
      try {
        await deleteOrcamento(id);
        console.log('Orçamento deletado com sucesso!');
        // Recarrega orçamentos após deletar
        orcamentosLoadedRef.current = false;
        await loadOrcamentos();
      } catch (error) {
        console.error('Falha ao deletar orçamento:', error);
      }
    },
    [deleteOrcamento, loadOrcamentos]
  );

  const formattedClients = useMemo(
    () =>
      clients.map((client, index) => {
        const idStr =
          typeof client.id === 'string'
            ? client.id
            : String(client.id ?? index);

        return {
          id: idStr,
          nome: client.nome || '',
          telefone: client.telefone || '',
          email: client.email || '',
          cpfCnpj: client.cpfCnpj ?? '',
          doc: client.doc || '',
          endereco: client.endereco || '',
        };
      }),
    [clients]
  );

  const formattedOrcamentos = useMemo<OrcamentoRenderDetails[]>(() => {
    return orcamentos
      .map(convertToRenderDetails)
      .sort(
        (a, b) =>
          new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );
  }, [orcamentos]);

  // Função para selecionar cliente para edição
  const handleSelectClientForEdit = useCallback(
    async (client: Client) => {
      try {
        const clientData = await fetchClientsById(client.id);
        if (clientData) {
          setSelectedClient(clientData);
          setShowEditClientModal(true);
        } else {
          console.error('Erro ao buscar dados do cliente para edição.');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente para edição:', error);
      }
    },
    [fetchClientsById, setSelectedClient]
  );

  // Função para fechar o modal
  const handleCloseEditClientModal = useCallback(() => {
    setShowEditClientModal(false);
    setSelectedClient(null);
    // Recarrega clientes após edição
    clientsLoadedRef.current = false;
    loadClients();
    setTableClientKey((prevKey) => prevKey + 1);
  }, [loadClients, setSelectedClient]);

  // Handlers de mudança de aba estabilizados
  const handleClientesTab = useCallback(() => {
    setActiveTab('Clientes');
  }, []);

  const handleOrcamentosTab = useCallback(() => {
    setActiveTab('Orçamentos');
  }, []);

  // Formatação dos dados da loja com verificações
  const formattedStoreData = useMemo(() => {
    if (!storeData) {
      return undefined;
    }

    return {
      nome: storeData.nome || '',
      email: storeData.email || '',
      cnpj: storeData.cnpj || '',
      endereco: storeData.endereco || '',
      telefone: storeData.telefone || '',
      subTitulo: storeData.subTitulo || '',
    };
  }, [storeData]);

  // Renderização condicional otimizada
  const renderContent = useMemo(() => {
    switch (activeTab) {
    case 'Clientes':
      return (
        <TableClient
          key={tableClientKey}
          clients={formattedClients}
          onDelete={deleteClient}
          onSelectClientForEdit={handleSelectClientForEdit}
        />
      );
    case 'Orçamentos':
      return (
        <TableOrcamento
          formattedOrcamentos={formattedOrcamentos}
          formattedClients={formattedClients}
          onDeleteOrcamento={handleDeleteOrcamento}
          onSubmitOrcamento={handleOrcamentoSubmit}
          products={products}
          storeData={formattedStoreData}
        />
      );
    default:
      return null;
    }
  }, [
    products,
    activeTab,
    tableClientKey,
    formattedClients,
    formattedOrcamentos,
    formattedStoreData,

    deleteClient,
    handleSelectClientForEdit,
    handleDeleteOrcamento,
    handleOrcamentoSubmit,
  ]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#333] flex flex-col h-full">
      <Header />

      <div className="container mx-auto px-4 py-8 ">
        <h1 className="text-3xl text-[#1E3A8A] font-bold mb-6">
          Clientes e Orçamentos
        </h1>

        <div className="flex mb-4 w-full gap-5 p-5 bg-white rounded-lg shadow-md hover:none ">
          <Button
            variant={'ghost'}
            onClick={handleClientesTab}
            className={`px-4 py-2 rounded flex-1 transition-colors duration-300 ${
              activeTab === 'Clientes' ? 'border-2 border-[#0E1F4D]' : ''
            }`}
          >
            Clientes
          </Button>
          <Button
            variant={'ghost'}
            onClick={handleOrcamentosTab}
            className={`px-4 py-2 rounded flex-1 transition-colors duration-300 ${
              activeTab === 'Orçamentos' ? 'border-2 border-zinc-700' : ''
            }`}
          >
            Orçamentos
          </Button>
        </div>

        <div className="p-4 bg-white rounded shadow">{renderContent}</div>
      </div>

      {/* Modal de edição de cliente */}
      {showEditClientModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
          <div className="bg-black opacity-60 absolute inset-0"></div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 max-w-lg w-full">
            <div className="flex flex-col gap-4">
              <Forms
                showModal={showEditClientModal}
                setShowModal={handleCloseEditClientModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

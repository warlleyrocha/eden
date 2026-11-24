import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';

import { EntityListSection } from '@/components/app/entity-list-section';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import Forms from '@/component/Forms';
import TableClient from '@/component/TableClients';

import { useClients } from '@/hooks/useCliente';
import type { Client } from '@/@types/clients';

export default function Clientes() {
  const [searchParams] = useSearchParams();
  const [busca, setBusca] = useState(() => searchParams.get('busca') ?? '');
  const [formOpen, setFormOpen] = useState(false);

  const {
    clients,
    loading,
    deleteClient,
    fetchClients,
    fetchClientsById,
    setSelectedClient,
  } = useClients();

  // Busca vinda da busca global (?busca=...)
  const buscaParam = searchParams.get('busca');
  useEffect(() => {
    if (buscaParam !== null) setBusca(buscaParam);
  }, [buscaParam]);

  const carregando = loading && clients.length === 0;

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = clients.map((c) => ({
      ...c,
      id: String(c.id),
      nome: c.nome || '',
      telefone: c.telefone || '',
      email: c.email || '',
      cpfCnpj: c.cpfCnpj ?? '',
      endereco: c.endereco || '',
    }));
    if (!termo) return lista.sort((a, b) => a.nome.localeCompare(b.nome));
    const digitos = termo.replace(/\D/g, '');
    return lista
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          c.email.toLowerCase().includes(termo) ||
          (digitos.length > 0 &&
            (c.telefone.includes(digitos) || c.cpfCnpj.includes(digitos)))
      )
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [clients, busca]);

  const openNew = useCallback(() => {
    setSelectedClient(null);
    setFormOpen(true);
  }, [setSelectedClient]);

  const openEdit = useCallback(
    async (client: Client) => {
      const clientData = await fetchClientsById(client.id);
      if (clientData) {
        setSelectedClient(clientData);
        setFormOpen(true);
      }
    },
    [fetchClientsById, setSelectedClient]
  );

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      setFormOpen(open);
      if (!open) {
        setSelectedClient(null);
        fetchClients(); // o formulário usa outra instância do hook
      }
    },
    [fetchClients, setSelectedClient]
  );

  return (
    <>
      <EntityListSection
        title="Clientes"
        noun={{ singular: 'cliente', plural: 'clientes' }}
        total={clients.length}
        filtered={filtrados.length}
        loading={carregando}
        search={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Buscar por nome, e-mail ou documento..."
        createLabel="Novo cliente"
        createIcon={<UserPlus />}
        onCreate={openNew}
        emptyIcon={<Users />}
        empty={{
          title: 'Nenhum cliente cadastrado',
          description: 'Cadastre clientes para usá-los nos orçamentos.',
        }}
        emptySearch={{
          title: 'Nenhum cliente encontrado',
          description: 'Tente buscar por outro nome, e-mail ou documento.',
        }}
      >
        <TableClient
          clients={filtrados}
          onDelete={deleteClient}
          onSelectClientForEdit={openEdit}
        />
      </EntityListSection>

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="sm:max-w-xl">
          {formOpen && (
            <Forms
              showModal={formOpen}
              setShowModal={(v) => handleFormOpenChange(v)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

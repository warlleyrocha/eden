import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';

import { SectionCard } from '@/components/app/section-card';
import { SearchInput } from '@/components/app/search-input';
import { EmptyState } from '@/components/app/empty-state';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

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

  const temBusca = busca.trim() !== '';

  return (
    <>
      <SectionCard
        title="Clientes"
        description={
          carregando
            ? 'Carregando...'
            : temBusca
              ? `${filtrados.length} de ${clients.length} clientes`
              : `${clients.length} cliente${clients.length === 1 ? '' : 's'} cadastrado${clients.length === 1 ? '' : 's'}`
        }
        flush
        actions={
          <>
            <SearchInput
              value={busca}
              onChange={setBusca}
              placeholder="Buscar por nome, e-mail ou documento..."
              className="sm:w-80"
            />
            <Button onClick={openNew}>
              <UserPlus /> Novo cliente
            </Button>
          </>
        }
      >
        {carregando ? (
          <div className="space-y-2 px-6 pb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title={temBusca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            description={
              temBusca
                ? 'Tente buscar por outro nome, e-mail ou documento.'
                : 'Cadastre clientes para usá-los nos orçamentos.'
            }
            action={
              temBusca ? (
                <Button variant="outline" size="sm" onClick={() => setBusca('')}>
                  Limpar busca
                </Button>
              ) : (
                <Button size="sm" onClick={openNew}>
                  <UserPlus /> Novo cliente
                </Button>
              )
            }
          />
        ) : (
          <TableClient
            clients={filtrados}
            onDelete={deleteClient}
            onSelectClientForEdit={openEdit}
          />
        )}
      </SectionCard>

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

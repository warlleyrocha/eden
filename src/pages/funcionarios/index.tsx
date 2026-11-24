import { useMemo, useState } from 'react';
import { IdCard, UserPlus } from 'lucide-react';

import { EntityListSection } from '@/components/app/entity-list-section';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import FormFuncionario from '@/component/FormFuncionario';
import TableFuncionarios from '@/component/TableFuncionarios';

import { useFuncionarios } from '@/hooks/useFuncionarios';

export default function Funcionarios() {
  const [busca, setBusca] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const { funcionarios, saving, createFuncionario } = useFuncionarios();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = [...funcionarios].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
    if (!termo) return lista;
    return lista.filter(
      (f) =>
        f.nome.toLowerCase().includes(termo) ||
        f.email.toLowerCase().includes(termo)
    );
  }, [funcionarios, busca]);

  const openNew = () => setFormOpen(true);

  // Sem rota de listagem na API: a contagem reflete só os cadastros desta sessão.
  const total = funcionarios.length;
  const description = busca.trim()
    ? undefined
    : `${total} cadastrado${total === 1 ? '' : 's'} nesta sessão`;

  return (
    <>
      <EntityListSection
        title="Funcionários"
        noun={{ singular: 'funcionário', plural: 'funcionários' }}
        total={total}
        filtered={filtrados.length}
        description={description}
        search={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Buscar por nome ou e-mail..."
        createLabel="Novo funcionário"
        createIcon={<UserPlus />}
        onCreate={openNew}
        emptyIcon={<IdCard />}
        empty={{
          title: 'Nenhum funcionário cadastrado nesta sessão',
          description:
            'Cadastre funcionários e defina as permissões de acesso de cada um.',
        }}
        emptySearch={{
          title: 'Nenhum funcionário encontrado',
          description: 'Tente buscar por outro nome ou e-mail.',
        }}
      >
        <TableFuncionarios funcionarios={filtrados} />
      </EntityListSection>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl">
          {formOpen && (
            <FormFuncionario
              onSubmit={createFuncionario}
              onClose={() => setFormOpen(false)}
              loading={saving}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

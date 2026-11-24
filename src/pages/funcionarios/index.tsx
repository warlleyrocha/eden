import { useMemo, useState } from 'react';
import { AlertCircle, IdCard, UserPlus } from 'lucide-react';

import { EntityListSection } from '@/components/app/entity-list-section';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import FormFuncionario from '@/component/FormFuncionario';
import TableFuncionarios from '@/component/TableFuncionarios';

import type { Funcionario } from '@/@types/funcionario';
import { useFuncionarios } from '@/hooks/useFuncionarios';

export default function Funcionarios() {
  const [busca, setBusca] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Funcionario | null>(null);

  const {
    funcionarios,
    loading,
    error,
    saving,
    togglingId,
    fetchFuncionarios,
    createFuncionario,
    updateFuncionario,
    toggleAtivo,
    deleteFuncionario,
  } = useFuncionarios();

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

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (funcionario: Funcionario) => {
    setEditing(funcionario);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const total = funcionarios.length;
  const inativos = funcionarios.filter((f) => !f.ativo).length;
  const description =
    !loading && !busca.trim() && inativos > 0
      ? `${total} cadastrado${total === 1 ? '' : 's'} · ${inativos} inativo${inativos === 1 ? '' : 's'}`
      : undefined;

  if (error && funcionarios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-container border border-border bg-surface px-6 py-16 text-center">
        <AlertCircle className="size-8 text-danger-foreground" />
        <div>
          <p className="font-medium text-foreground">
            Não foi possível carregar os funcionários
          </p>
          <p className="mt-1 text-sm text-foreground-secondary">{error}</p>
        </div>
        <Button variant="outline" onClick={() => fetchFuncionarios()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <>
      <EntityListSection
        title="Funcionários"
        noun={{ singular: 'funcionário', plural: 'funcionários' }}
        total={total}
        filtered={filtrados.length}
        loading={loading && total === 0}
        description={description}
        search={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Buscar por nome ou e-mail..."
        createLabel="Novo funcionário"
        createIcon={<UserPlus />}
        onCreate={openNew}
        emptyIcon={<IdCard />}
        empty={{
          title: 'Nenhum funcionário cadastrado',
          description:
            'Cadastre funcionários e defina as permissões de acesso de cada um.',
        }}
        emptySearch={{
          title: 'Nenhum funcionário encontrado',
          description: 'Tente buscar por outro nome ou e-mail.',
        }}
      >
        <TableFuncionarios
          funcionarios={filtrados}
          onEdit={openEdit}
          onToggleAtivo={toggleAtivo}
          onDelete={deleteFuncionario}
          togglingId={togglingId}
        />
      </EntityListSection>

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="sm:max-w-xl">
          {formOpen && (
            <FormFuncionario
              key={editing?.id ?? 'novo'}
              funcionario={editing}
              onCreate={createFuncionario}
              onUpdate={updateFuncionario}
              onClose={closeForm}
              loading={saving}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

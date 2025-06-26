// src/components/modals/ModalImpressao.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useModalImpressao } from '@/hooks/useModalOrcamento';
import { OrcamentoModelDetals } from '@/component/TableOrcamento/EmpresaInfo';
import { useStore } from '@/hooks/useStore';

export function ModalImpressao() {
  const { modalAberto, fecharModalImpressao, getDadosImpressao } =
    useModalImpressao();
  const { storeData } = useStore();
  const dados = getDadosImpressao();

  if (!modalAberto || !dados) return null;

  console.log('Dados:', dados);

  return (
    <Dialog open={modalAberto} onOpenChange={fecharModalImpressao}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <OrcamentoModelDetals empresaInfo={storeData} orcamentoInfo={dados} />
      </DialogContent>
    </Dialog>
  );
}

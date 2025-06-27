// src/components/modals/ModalImpressao.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { OrcamentoModelDetals } from '@/component/TableOrcamento/EmpresaInfo';

import { useModalImpressao } from '@/hooks/useModalOrcamento';
import { useStore } from '@/hooks/useLoja';

export function ModalImpressao() {
  const { modalAberto, fecharModalImpressao, getDadosImpressao } =
    useModalImpressao();
  const { storeData } = useStore();
  const dados = getDadosImpressao();

  if (!modalAberto || !dados) return null;

  return (
    <Dialog open={modalAberto} onOpenChange={fecharModalImpressao}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Orçamento</DialogTitle>
          <DialogDescription>Detalhes do orçamento</DialogDescription>
        </VisuallyHidden>
        <OrcamentoModelDetals
          empresaInfo={storeData ?? undefined}
          orcamentoInfo={dados}
        />
      </DialogContent>
    </Dialog>
  );
}

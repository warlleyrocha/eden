// src/components/modals/ModalImpressao.tsx
import { OrcamentoModalDetails } from '@/component/Orcamento/TableOrcamento/EmpresaInfo';

import { useModalImpressao } from '@/hooks/useModalOrcamento';
import { useStore } from '@/hooks/useLoja';

export function ModalImpressao() {
  const { modalAberto, fecharModalImpressao, getDadosImpressao } =
    useModalImpressao();
  const { storeData } = useStore();
  const dados = getDadosImpressao();

  if (!modalAberto || !dados) return null;

  return (
    <OrcamentoModalDetails
      isOpen={modalAberto}
      onClose={fecharModalImpressao}
      empresaInfo={storeData ?? undefined}
      orcamentoInfo={dados}
      autoPrint={false}
    />
  );
}

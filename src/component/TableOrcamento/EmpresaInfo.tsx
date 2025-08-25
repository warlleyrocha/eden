import { Smartphone, X } from 'lucide-react';
import { useEffect } from 'react';
import {
  formatarMoeda,
  formatPhone,
  formatCnpj,
  toTitleCase,
} from '../../utils/formatters';

type OrcamentoModalDetailsProps = Readonly<{
  empresaInfo?: Readonly<{
    nome: string;
    cnpj: string;
    endereco: string;
    subTitulo: string;
    telefone: string;
    email: string;
  }>;

  orcamentoInfo: Readonly<{
    index?: number;
    totalOrcamentos?: number;
    orcamentoId: string;
    cliente?: Readonly<{
      id: string;
      nome?: string;
      telefone?: string;
      endereco: string;
    }>;
    lojaId: string;
    descricao: string;
    metodoPagamento: string;
    date: string;
    itens: ReadonlyArray<
      Readonly<{
        produtoId: string;
        nome?: string;
        precoUnitario: number;
        quantidade: number;
        valorTotal: number;
      }>
    >;
    servicos: ReadonlyArray<
      Readonly<{
        descricao: string;
        valor: number;
      }>
    >;
    numeroParcelas: number;
    status: string;
    total: number;
  }>;
  isOpen: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}>;

export function OrcamentoModalDetails({
  empresaInfo,
  orcamentoInfo,
  autoPrint = false,
  isOpen,
  onClose,
}: OrcamentoModalDetailsProps) {
  // Auto print functionality
  useEffect(() => {
    if (autoPrint && isOpen) {
      const timeout = setTimeout(() => {
        window.print();
      }, 450);
      return () => clearTimeout(timeout);
    }
  }, [autoPrint, isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !empresaInfo || !orcamentoInfo) return null;

  const getOrcamentoNumber = () => {
    return orcamentoInfo.totalOrcamentos && orcamentoInfo.index !== undefined
      ? orcamentoInfo.totalOrcamentos - orcamentoInfo.index
      : orcamentoInfo.orcamentoId;
  };

  const produtos = orcamentoInfo.itens.filter((item) =>
    item.nome?.includes('Produto:')
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 print:hidden">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Orçamento #{getOrcamentoNumber()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="printable-content space-y-6">
            {/* Company Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg print:bg-transparent print:p-0">
                  <Smartphone className="w-6 h-6 text-blue-600 print:text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                    {empresaInfo.nome}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    <p className="break-words">{empresaInfo.endereco}</p>
                    <p>{formatCnpj(empresaInfo.cnpj)}</p>
                    <p className="break-words">{empresaInfo.email}</p>
                    {empresaInfo.telefone && <p>{empresaInfo.telefone}</p>}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <div className="bg-gray-50 p-3 rounded-lg print:bg-transparent print:p-0">
                  <p className="text-sm text-gray-600">
                    Data: {orcamentoInfo.date}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Status:{' '}
                    <span className="font-medium">{orcamentoInfo.status}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Informações do Cliente
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-0">
                <h3 className="font-medium text-gray-900">
                  {orcamentoInfo.cliente?.nome || 'Cliente não informado'}
                </h3>
                {orcamentoInfo.cliente?.endereco && (
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    {toTitleCase(orcamentoInfo.cliente.endereco)}
                  </p>
                )}
                {orcamentoInfo.cliente?.telefone && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatPhone(orcamentoInfo.cliente.telefone)}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Itens do Orçamento
              </h2>

              <div className="border border-gray-200 rounded-lg overflow-hidden print:border-gray-400">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 print:bg-gray-100">
                      <tr>
                        <th className="text-left font-semibold text-gray-900 px-3 py-3 text-sm">
                          Descrição
                        </th>
                        <th className="text-center font-semibold text-gray-900 px-3 py-3 w-20 text-sm">
                          Qtd.
                        </th>
                        <th className="text-right font-semibold text-gray-900 px-3 py-3 w-28 text-sm">
                          Valor Unit.
                        </th>
                        <th className="text-right font-semibold text-gray-900 px-3 py-3 w-28 text-sm">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Products Section */}
                      {produtos.length > 0 && (
                        <>
                          <tr className="bg-blue-50 print:bg-gray-100">
                            <td
                              colSpan={4}
                              className="font-semibold text-gray-900 px-3 py-2 text-sm"
                            >
                              Produtos
                            </td>
                          </tr>
                          {produtos.map((item, index) => (
                            <tr
                              key={`produto-${item.produtoId}-${index}`}
                              className="hover:bg-gray-50 print:hover:bg-transparent"
                            >
                              <td className="px-3 py-2">
                                <span className="text-sm text-gray-900 break-words">
                                  {item.nome
                                    ? item.nome.replace('Produto: ', '')
                                    : 'Produto sem nome'}
                                </span>
                              </td>
                              <td className="text-center px-3 py-2">
                                <span className="text-sm text-gray-900">
                                  {item.quantidade}
                                </span>
                              </td>
                              <td className="text-right px-3 py-2">
                                <span className="text-sm text-gray-900 font-medium">
                                  {formatarMoeda(item.precoUnitario)}
                                </span>
                              </td>
                              <td className="text-right px-3 py-2">
                                <span className="text-sm text-gray-900 font-medium">
                                  {formatarMoeda(item.valorTotal)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}

                      {/* Services Section */}
                      {orcamentoInfo.servicos.length > 0 && (
                        <>
                          <tr className="bg-green-50 print:bg-gray-100">
                            <td
                              colSpan={4}
                              className="font-semibold text-gray-900 px-3 py-2 text-sm"
                            >
                              Serviços
                            </td>
                          </tr>
                          {orcamentoInfo.servicos.map((item, index) => (
                            <tr
                              key={`servico-${index}`}
                              className="hover:bg-gray-50 print:hover:bg-transparent"
                            >
                              <td className="px-3 py-2">
                                <span className="text-sm text-gray-900 break-words">
                                  {item.descricao.replace('Serviço: ', '')}
                                </span>
                              </td>
                              <td className="text-center px-3 py-2">
                                <span className="text-sm text-gray-500">-</span>
                              </td>
                              <td className="text-right px-3 py-2">
                                <span className="text-sm text-gray-900 font-medium">
                                  {formatarMoeda(item.valor)}
                                </span>
                              </td>
                              <td className="text-right px-3 py-2">
                                <span className="text-sm text-gray-900 font-medium">
                                  {formatarMoeda(item.valor)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}

                      {/* Total Row */}
                      <tr className="bg-gray-100 print:bg-gray-200">
                        <td
                          className="font-semibold text-gray-900 text-right px-3 py-3 text-sm"
                          colSpan={3}
                        >
                          Total Geral
                        </td>
                        <td className="text-right px-3 py-3">
                          <span className="text-lg font-bold text-gray-900">
                            {formatarMoeda(orcamentoInfo.total)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Pagamento
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded print:bg-transparent print:p-0">
                  Método: {orcamentoInfo.metodoPagamento}
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-0">
                  Descrição: {orcamentoInfo.descricao}
                </p>
              </div>
              {orcamentoInfo.numeroParcelas > 1 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Parcelas
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded print:bg-transparent print:p-0">
                    {orcamentoInfo.numeroParcelas}x de{' '}
                    {formatarMoeda(
                      orcamentoInfo.total / orcamentoInfo.numeroParcelas
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Signature Sections */}
            <div className="space-y-8 mt-12 print:mt-8">
              {/* Store Signature */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Assinatura da Loja
                </h3>
                <div className="h-20 border-b-2 border-gray-300 mb-3"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-gray-600">
                  <span>Data de Recebimento: __ /__ / ____</span>
                  <span>Data de Entrega: __ /__ / ____</span>
                </div>
              </div>

              {/* Footer Info */}
              <div className="text-center text-xs text-gray-600 py-4 border-t border-gray-200">
                <p className="mb-1">Este orçamento tem validade de 7 dias.</p>
                <p className="font-semibold">
                  {empresaInfo.nome} - {empresaInfo.subTitulo}
                </p>
              </div>

              {/* Dotted line separator */}
              <div className="border-b border-dashed border-gray-300"></div>

              {/* Client Signature */}
              <div className="pt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Assinatura do Cliente
                  </h3>
                  <span className="text-sm font-semibold text-gray-700">
                    Orçamento: #{getOrcamentoNumber()}
                  </span>
                </div>
                <div className="h-20 border-b-2 border-gray-300 mb-3"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-gray-600">
                  <span>Data de Recebimento: __ /__ / ____</span>
                  <span>Data de Entrega: __ /__ / ____</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

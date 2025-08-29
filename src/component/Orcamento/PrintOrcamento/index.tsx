import { Smartphone } from 'lucide-react';
import {
  formatarMoeda,
  formatPhone,
  formatCnpj,
  toTitleCase,
} from '../../../utils/formatters';

type OrcamentoPrintContentProps = Readonly<{
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
        id?: string;
        descricao: string;
        valor: number;
      }>
    >;
    numeroParcelas: number;
    status: string;
    total: number;
  }>;
}>;

export default function OrcamentoPrintContent({
  empresaInfo,
  orcamentoInfo,
}: OrcamentoPrintContentProps) {
  if (!empresaInfo || !orcamentoInfo) return null;

  const getOrcamentoNumber = () => {
    return orcamentoInfo.totalOrcamentos && orcamentoInfo.index !== undefined
      ? orcamentoInfo.totalOrcamentos - orcamentoInfo.index
      : orcamentoInfo.orcamentoId;
  };

  const produtos = orcamentoInfo.itens;

  return (
    <div className="p-6 w-full max-w-4xl mx-auto text-gray-900 font-sans">
      {/* Cabeçalho da Empresa */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-3 items-start">
          <Smartphone className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              {empresaInfo.nome}
            </h1>
            <div className="text-sm text-gray-600 space-y-1 mt-1">
              <p>{empresaInfo.endereco}</p>
              <p>{formatCnpj(empresaInfo.cnpj)}</p>
              <p>{empresaInfo.email}</p>
              {empresaInfo.telefone && <p>{empresaInfo.telefone}</p>}
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-700">
          <p>Orçamento: #{getOrcamentoNumber()}</p>
          <p>Data: {orcamentoInfo.date}</p>
          <p className="mt-1">
            Status:{' '}
            <span className="font-semibold">{orcamentoInfo.status}</span>
          </p>
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-base font-semibold uppercase tracking-wide mb-2 text-gray-700">
          Cliente
        </h2>
        <h3 className="font-medium text-gray-900">
          {orcamentoInfo.cliente?.nome ?? 'Cliente não informado'}
        </h3>
        {orcamentoInfo.cliente?.endereco && (
          <p className="text-sm text-gray-700">
            {toTitleCase(orcamentoInfo.cliente.endereco)}
          </p>
        )}
        {orcamentoInfo.cliente?.telefone && (
          <p className="text-sm text-gray-700">
            {formatPhone(orcamentoInfo.cliente.telefone)}
          </p>
        )}
      </div>

      {/* Tabela de Itens */}
      <div className="mb-8">
        <h2 className="text-base font-semibold uppercase tracking-wide mb-2 text-gray-700">
          Itens do Orçamento
        </h2>
        <table className="w-full border border-gray-300 text-sm rounded-lg overflow-hidden">
          <thead className="bg-blue-50">
            <tr>
              <th className="text-left px-3 py-2">Descrição</th>
              <th className="text-center px-3 py-2 w-20">Qtd.</th>
              <th className="text-right px-3 py-2 w-28">Valor Unit.</th>
              <th className="text-right px-3 py-2 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length > 0 && (
              <>
                <tr className="bg-blue-100">
                  <td colSpan={4} className="font-semibold px-3 py-2">
                    Produtos
                  </td>
                </tr>
                {produtos.map((item, idx) => (
                  <tr
                    key={`produto-${item.produtoId}-${idx}`}
                    className="border-t border-gray-200"
                  >
                    <td className="px-3 py-2">
                      {item.nome ?? 'Produto sem nome'}
                    </td>
                    <td className="text-center px-3 py-2">{item.quantidade}</td>
                    <td className="text-right px-3 py-2 font-medium">
                      {formatarMoeda(item.precoUnitario)}
                    </td>
                    <td className="text-right px-3 py-2 font-medium">
                      {formatarMoeda(item.valorTotal)}
                    </td>
                  </tr>
                ))}
              </>
            )}
            {orcamentoInfo.servicos.length > 0 && (
              <>
                <tr className="bg-green-50">
                  <td colSpan={4} className="font-semibold px-3 py-2">
                    Serviços
                  </td>
                </tr>
                {orcamentoInfo.servicos.map((item) => (
                  <tr
                    key={`servico-${item.id}`}
                    className="border-t border-gray-200"
                  >
                    <td className="px-3 py-2">
                      {item.descricao.replace('Serviço: ', '')}
                    </td>
                    <td className="text-center px-3 py-2">-</td>
                    <td className="text-right px-3 py-2 font-medium">
                      {formatarMoeda(item.valor)}
                    </td>
                    <td className="text-right px-3 py-2 font-medium">
                      {formatarMoeda(item.valor)}
                    </td>
                  </tr>
                ))}
              </>
            )}
            <tr className="bg-gray-100 border-t">
              <td colSpan={3} className="text-right font-semibold px-3 py-2">
                Total Geral
              </td>
              <td className="text-right px-3 py-2 font-bold text-lg">
                {formatarMoeda(orcamentoInfo.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Assinatura da Loja */}
      <div className="">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          Assinatura da Loja
        </h3>
        <div className="h-20 border-b-2 mb-2"></div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Data de Recebimento: __ /__ / ____</span>
          <span>Data de Entrega: __ /__ / ____</span>
        </div>
        {/* Rodapé */}
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Este orçamento tem validade de 7 dias.</p>
          <p>
            {empresaInfo.nome} - {empresaInfo.subTitulo}
          </p>
        </div>
      </div>

      {/* Linha de corte */}
      <div className="border-t-2 border-dashed my-6"></div>

      {/* Assinatura do Cliente – destacável */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-row justify-between">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">
            Assinatura do Cliente
          </h3>
          <p className="text-sm font-semibold mb-2 text-gray-700">
            Orçamento: #{getOrcamentoNumber()}
          </p>
        </div>

        <div className="h-10 border-b-2 mb-2"></div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Data de Recebimento: __ /__ / ____</span>
          <span>Data de Entrega: __ /__ / ____</span>
        </div>
      </div>
    </div>
  );
}

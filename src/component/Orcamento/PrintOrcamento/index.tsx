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
    <div className="p-6 w-full max-w-4xl mx-auto text-gray-900">
      {/* Cabeçalho da Empresa */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">{empresaInfo.nome}</h1>
            <div className="text-sm space-y-1 mt-1">
              <p>{empresaInfo.endereco}</p>
              <p>{formatCnpj(empresaInfo.cnpj)}</p>
              <p>{empresaInfo.email}</p>
              {empresaInfo.telefone && <p>{empresaInfo.telefone}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm">Data: {orcamentoInfo.date}</p>
          <p className="text-sm mt-1">
            Status: <span className="font-medium">{orcamentoInfo.status}</span>
          </p>
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2">Informações do Cliente</h2>
        <div className="p-3 bg-gray-50 rounded">
          <h3 className="font-medium">
            {orcamentoInfo.cliente?.nome || 'Cliente não informado'}
          </h3>
          {orcamentoInfo.cliente?.endereco && (
            <p className="text-sm">
              {toTitleCase(orcamentoInfo.cliente.endereco)}
            </p>
          )}
          {orcamentoInfo.cliente?.telefone && (
            <p className="text-sm">
              {formatPhone(orcamentoInfo.cliente.telefone)}
            </p>
          )}
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2">Itens do Orçamento</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
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
                <tr className="bg-blue-50">
                  <td colSpan={4} className="font-semibold px-3 py-2">
                    Produtos
                  </td>
                </tr>
                {produtos.map((item, index) => (
                  <tr
                    key={`produto-${item.produtoId}-${index}`}
                    className="border-t"
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
                  <tr key={`servico-${item.id}`} className="border-t">
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

      {/* Pagamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <h3 className="text-sm font-semibold mb-2">Pagamento</h3>
          <p className="text-sm bg-gray-50 p-2 rounded">
            Método: {orcamentoInfo.metodoPagamento}
          </p>
          <p className="text-sm bg-gray-50 p-2 rounded mt-2">
            Descrição: {orcamentoInfo.descricao}
          </p>
        </div>
        {orcamentoInfo.numeroParcelas > 1 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Parcelas</h3>
            <p className="text-sm bg-gray-50 p-2 rounded">
              {orcamentoInfo.numeroParcelas}x de{' '}
              {formatarMoeda(
                orcamentoInfo.total / orcamentoInfo.numeroParcelas
              )}
            </p>
          </div>
        )}
      </div>

      {/* Assinaturas */}
      <div className="mt-12 space-y-8">
        <div>
          <h3 className="text-sm font-semibold mb-4">Assinatura da Loja</h3>
          <div className="h-20 border-b-2 mb-3"></div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Data de Recebimento: __ /__ / ____</span>
            <span>Data de Entrega: __ /__ / ____</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 border-t pt-4">
          <p>Este orçamento tem validade de 7 dias.</p>
          <p className="font-semibold">
            {empresaInfo.nome} - {empresaInfo.subTitulo}
          </p>
        </div>

        <div className="border-b border-dashed"></div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">Assinatura do Cliente</h3>
            <span className="text-sm font-semibold">
              Orçamento: #{getOrcamentoNumber()}
            </span>
          </div>
          <div className="h-20 border-b-2 mb-3"></div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Data de Recebimento: __ /__ / ____</span>
            <span>Data de Entrega: __ /__ / ____</span>
          </div>
        </div>
      </div>
    </div>
  );
}

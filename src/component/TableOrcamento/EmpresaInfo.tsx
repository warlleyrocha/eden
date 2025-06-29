//EmpresaInfo.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Smartphone } from 'lucide-react';
import { useEffect } from 'react';

type OrcamentoModelDetalsProps = Readonly<{
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

  autoPrint?: boolean;
}>;

export function OrcamentoModelDetals({
  empresaInfo,
  orcamentoInfo,
  autoPrint = false,
}: OrcamentoModelDetalsProps) {
  useEffect(() => {
    // Só executa o print se autoPrint for true
    if (autoPrint) {
      const timeout = setTimeout(() => {
        window.print();
      }, 450); // pequeno delay para garantir renderização

      return () => clearTimeout(timeout);
    }
  }, [autoPrint]);

  if (!empresaInfo || !orcamentoInfo) return null;

  return (
    <div className="w-full h-full bg-white p-6 rounded-lg shadow-md">
      <div className="printable-content">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Smartphone className="text-gray-600 w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {empresaInfo.nome}
              </h1>
              {/*<h2 className="text-sm text-gray-500">{empresaInfo.slug}</h2>*/}
              <h3 className="text-sm text-gray-500">{empresaInfo.endereco}</h3>
              <h3 className="text-sm text-gray-500">{empresaInfo.cnpj}</h3>
              <h3 className="text-sm text-gray-500">{empresaInfo.email}</h3>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-sm font-semibold text-gray-700">
              Orçamento: #
              {orcamentoInfo.totalOrcamentos &&
              orcamentoInfo.index !== undefined
                ? orcamentoInfo.totalOrcamentos - orcamentoInfo.index
                : orcamentoInfo.orcamentoId}
            </h1>
            <p className="text-sm text-gray-500">Data: {orcamentoInfo.date}</p>
          </div>
        </div>
        <div className="text-gray-600">
          <div className="mb-4">
            <h1 className="text-base font-bold text-gray-800">
              {orcamentoInfo.cliente?.nome ?? 'Sem nome'}
            </h1>
            <p className="text-sm text-gray-500">
              {orcamentoInfo.cliente?.endereco ?? 'Sem endereço'}
            </p>
            <p className="text-sm text-gray-500">
              {orcamentoInfo.cliente?.telefone ?? 'Sem telefone'}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Itens</p>
            <Table className="w-full border rounded-lg shadow-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Descrição</TableHead>
                  <TableHead className="text-center">Qtd.</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Seção de Produtos */}
                {orcamentoInfo.itens.filter((item) =>
                  item.nome?.includes('Produto:')
                ).length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={4} className="font-bold bg-gray-100">
                        Produtos
                      </TableCell>
                    </TableRow>
                    {orcamentoInfo.itens
                      .filter((item) => item.nome?.includes('Produto:'))
                      .map((item) => (
                        <TableRow
                          key={`produto-${item.produtoId}-${item.precoUnitario}-${item.quantidade}`}
                        >
                          <TableCell>
                            {item.nome
                              ? item.nome.replace('Produto: ', '')
                              : 'Produto sem nome informado'}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantidade}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.precoUnitario)}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.valorTotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                )}

                {/* Seção de Serviços */}
                {orcamentoInfo.servicos.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={4} className="font-bold bg-gray-100">
                        Serviços
                      </TableCell>
                    </TableRow>
                    {orcamentoInfo.servicos.map((item) => (
                      <TableRow key={`servico-${item.descricao}-${item.valor}`}>
                        <TableCell>
                          {item.descricao.replace('Serviço: ', '')}
                        </TableCell>
                        <TableCell className="text-center"></TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.valor)}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* Total Geral */}
                <TableRow>
                  <TableCell className="font-medium text-right" colSpan={3}>
                    Total Geral
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(orcamentoInfo.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-8 space-y-10 text-sm text-gray-700">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 mb-2">
              Assinatura da Loja
            </span>
            <div className="h-[80px] border-b border-gray-400 mb-2"></div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Data de Recebimento: __ /__ / __</span>
              <span>Data de Entrega: __ /__ / __</span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 pt-1 pb-0.5">
            <p>Este orçamento tem validade de 7 dias.</p>
            <p className="font-semibold">
              {empresaInfo.nome} - {empresaInfo.subTitulo}
            </p>
          </div>
          <div className="border-b border-dashed my-1"></div>
          <br />

          <div className="flex flex-col border-t pt-6 border-gray-300 print:border-none">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800 mb-2">
                Assinatura do Cliente (Recorte aqui)
              </span>
              <h1 className="text-sm font-semibold text-gray-700">
                Orçamento: #
                {orcamentoInfo.totalOrcamentos &&
                orcamentoInfo.index !== undefined
                  ? orcamentoInfo.totalOrcamentos - orcamentoInfo.index
                  : orcamentoInfo.orcamentoId}
              </h1>
            </div>

            <div className="h-[80px] border-b border-gray-400 mb-2"></div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Data de Recebimento: __ /__ / __</span>
              <span>Data de Entrega: __ /__ / __</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

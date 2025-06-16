//EmpresaInfo.tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Smartphone } from 'lucide-react';

type OrcamentoModelDetalsProps = {
  empresaInfo?: {
    //slug: string;
    nome: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    email: string;
  };

  orcamentoInfo: {
    index?: number;
    totalOrcamentos?: number;
    orcamentoId: string;
    cliente?: {
      id: string;
      nome?: string;
      telefone?: string;
    };
    lojaId: string;
    descricao: string;
    metodoPagamento: string;
    date: string;
    itens: Array<{
      produtoId: string;
      nome?: string;
      precoUnitario: number;
      quantidade: number;
      valorTotal: number;
    }>;
    servicos: Array<{
      descricao: string;
      valor: number;
    }>;
    numeroParcelas: number;
    status: string;
    total: number;
  };
};

export function OrcamentoModelDetals({
  empresaInfo,
  orcamentoInfo,
}: OrcamentoModelDetalsProps) {
  if (!empresaInfo || !orcamentoInfo) return null;

  return (
    <div className="w-full h-full bg-white p-6 rounded-lg shadow-md">
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
            {orcamentoInfo.totalOrcamentos && orcamentoInfo.index !== undefined
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
            {orcamentoInfo.cliente?.telefone ?? 'Sem telefone'}
          </p>
        </div>
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Itens</p>
          <Table className="w-full border rounded-lg shadow-sm">
            <TableCaption>Este orçamento tem validade de 7 dias.</TableCaption>
            <TableCaption>{empresaInfo.nome}</TableCaption>
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
                    .map((item, index) => (
                      <TableRow key={`produto-${index}`}>
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
                  {orcamentoInfo.servicos.map((item, index) => (
                    <TableRow key={`servico-${index}`}>
                      <TableCell>
                        {item.descricao.replace('Serviço: ', '')}
                      </TableCell>
                      <TableCell className="text-center">1</TableCell>
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
    </div>
  );
}

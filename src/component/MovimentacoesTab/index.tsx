// MovimentacoesTab.jsx
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import LabelBullet from '../LabelBullet';

import type { MovimentoFinanceiro, TipoMovimento } from '@/@types/financeiro';

interface MovimentacoesTabProps {
  // Dados dos cartões de resumo
  pixValue: number;
  dinheiroValue: number;
  debitoValue: number;
  creditoValue: number;

  // Dados da seção principal
  sectionTitle: string;
  movimentacoes: MovimentoFinanceiro[];
  tipoMovimento: TipoMovimento;
  totalValue: string;
  emptyMessage: string;

  // Dados do resumo final
  totalEntradas: string;
  totalSaidas: string;
  saldoFinal: string;

  // Handlers
  onAddClick: () => void;
  onClick: (id: string) => void;
  onDoubleClick: (id: string) => void;

  // Funções de formatação
  formatarMoeda: (valor: number) => string;
  formatarData: (data: string) => string;
  formatarMetodoPagamentoCompleto: (
    metodo: string,
    parcelas?: number,
    juros?: number
  ) => string;
}

const MovimentacoesTab: React.FC<MovimentacoesTabProps> = ({
  // Dados dos cartões de resumo
  pixValue,
  dinheiroValue,
  debitoValue,
  creditoValue,

  // Dados da seção principal
  sectionTitle,
  movimentacoes,
  tipoMovimento, // 'ENTRADA' ou 'SAIDA'
  totalValue,
  emptyMessage,

  // Dados do resumo final
  totalEntradas,
  totalSaidas,
  saldoFinal,

  // Handlers
  onAddClick,
  onClick,
  onDoubleClick,

  // Funções de formatação
  formatarMoeda,
  formatarData,
  formatarMetodoPagamentoCompleto,
}) => {
  const isEntrada = tipoMovimento === 'ENTRADA';
  const textColor = isEntrada ? 'text-green-600' : 'text-red-600';
  const totalColor = isEntrada ? 'text-green-600' : 'text-red-500';

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const movimentacoesDoDia = movimentacoes
    .filter((m) => m.tipo === tipoMovimento)
    .filter((m) => {
      const dataMov = new Date(m.criadoEm);
      dataMov.setHours(0, 0, 0, 0);
      return dataMov.getTime() === hoje.getTime();
    });

  return (
    <div className="flex-1">
      {/* Cards de resumo por método de pagamento */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
        <LabelBullet title="PIX" type="pix" value={formatarMoeda(pixValue)} />
        <LabelBullet
          title="Dinheiro"
          type="money"
          value={formatarMoeda(dinheiroValue)}
        />
        <LabelBullet
          title="Débito"
          type="debit"
          value={formatarMoeda(debitoValue)}
        />
        <LabelBullet
          title="Crédito"
          type="credit"
          value={formatarMoeda(creditoValue)}
        />
      </div>

      {/* Seção principal com lista de movimentações */}
      <div className="bg-white rounded-xl p-6 shadow-sm mt-[20px]">
        <h2 className="text-xl font-semibold text-[#1E3A8A] mb-6">
          <div className="flex justify-between">
            {sectionTitle}
            <Button
              variant={'ghost'}
              onClick={onAddClick}
              className="cursor-pointer hover:bg-[#F0F4FF] rounded-full p-2"
            >
              <PlusCircle className="text-[#1E3A8A]" />
            </Button>
          </div>
        </h2>

        <div className="space-y-4">
          {movimentacoesDoDia.length === 0 ? (
            <div className="flex flex-col">
              <div className="flex justify-between text-[#1E3A8A]">
                <span>{emptyMessage}</span>
                <span>R$ 0,00</span>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {movimentacoesDoDia
                  .filter((m) => m.tipo === tipoMovimento)
                  .slice()
                  .map((movimento) => (
                    <button
                      key={movimento.id}
                      className="w-full text-left flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-[16px] transition-colors bg-transparent border-0 outline-none focus:ring-2 focus:ring-gray-100 focus:ring-offset-1 font-inherit"
                      onDoubleClick={() => onDoubleClick?.(movimento.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {movimento.descricao ??
                            (isEntrada ? 'Entrada' : 'Saída')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatarData(movimento.criadoEm)} •{' '}
                          {formatarMetodoPagamentoCompleto(
                            movimento.metodoPagamento,
                            movimento.parcelas,
                            movimento.juros
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p className={`font-medium ${textColor}`}>
                          {isEntrada ? '' : '-'}
                          {formatarMoeda(movimento.valor)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClick(movimento.id);
                          }}
                          title="Excluir movimento"
                        >
                          <svg
                            className="h-4 w-4 group-hover:scale-110 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </button>
                  ))}
              </div>
              <div className="flex justify-between text-[#1E3A8A] border-t pt-2">
                <span className="font-medium">
                  Total de {isEntrada ? 'Vendas' : 'Saídas'}
                </span>
                <span className={`font-bold ${totalColor}`}>{totalValue}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards de resumo final */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl p-6 bg-white shadow-sm">
        <div className="flex flex-col items-center bg-green-100 p-4 rounded-lg">
          <div className="text-gray-900 font-medium">Total de Entradas</div>
          <div className="text-[#22C55E] text-lg font-bold">
            {totalEntradas}
          </div>
        </div>
        <div className="flex flex-col items-center bg-red-100 p-4 rounded-lg">
          <div className="text-gray-700 font-medium">Total de Saídas</div>
          <div className="text-[#EF4444] text-lg font-bold">{totalSaidas}</div>
        </div>
        <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg">
          <div className="text-[#1E3A8A] font-medium">Saldo Final</div>
          <div className="text-[#1E3A8A] text-lg font-bold">{saldoFinal}</div>
        </div>
      </div>
    </div>
  );
};

export default MovimentacoesTab;

import { ArrowRight, Banknote, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Dispatch, SetStateAction } from 'react';

interface ModalEntradaProps {
  showExitModal: boolean;
  setShowExitModal: Dispatch<SetStateAction<boolean>>;
  valorEntrada: string;
  setValorEntrada: Dispatch<SetStateAction<string>>;
  descricaoEntrada: string;
  setDescricaoEntrada: Dispatch<SetStateAction<string>>;
  metodoPagamento: string;
  setMetodoPagamento: Dispatch<SetStateAction<string>>;
  parcelas: number;
  setParcelas: Dispatch<SetStateAction<number>>;
  juros: number;
  setJuros: Dispatch<SetStateAction<number>>;
  handleEntradaSubmit: () => void;
}

export default function ModalEntrada({
  showExitModal,
  setShowExitModal,
  valorEntrada,
  descricaoEntrada,
  setDescricaoEntrada,
  metodoPagamento,
  setMetodoPagamento,
  parcelas,
  setParcelas,
  juros,
  setJuros,
  handleEntradaSubmit,
}: ModalEntradaProps) {
  if (!showExitModal) return null;

  const enviarEntradaComMetodo = () => {
    const metodoFinal =
      metodoPagamento === 'credito'
        ? parcelas === 1
          ? 'CREDITO_AVISTA'
          : 'CREDITO_PARCELADO'
        : metodoPagamento;

    setMetodoPagamento(metodoFinal); // opcional se o estado for usado fora
    handleEntradaSubmit();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
      <div
        className="bg-black opacity-60 absolute inset-0"
        onClick={() => setShowExitModal(false)}
      ></div>
      <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 max-w-lg w-full shadow-lg">
        <h2 className="text-xl font-semibold text-black mb-4">
          Registrar Nova Entrada
        </h2>
        <form className="space-y-4">
          <div></div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Descrição da entrada"
              value={descricaoEntrada}
              onChange={(e) => setDescricaoEntrada(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: 'pix',
                  label: 'PIX',
                  icon: <ArrowRight className="h-4 w-4" />,
                },
                {
                  id: 'dinheiro',
                  label: 'Dinheiro',
                  icon: <Banknote className="h-4 w-4" />,
                },
                {
                  id: 'debito',
                  label: 'Débito',
                  icon: <CreditCard className="h-4 w-4" />,
                },
                {
                  id: 'credito',
                  label: 'Crédito',
                  icon: <CreditCard className="h-4 w-4" />,
                },
              ].map(({ id, label, icon }) => (
                <div className="flex items-center space-x-2" key={id}>
                  <input
                    type="radio"
                    id={id}
                    name="metodo"
                    value={id}
                    checked={metodoPagamento === id}
                    onChange={() => setMetodoPagamento(id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor={id} className="flex items-center gap-2">
                    {icon} {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {metodoPagamento === 'credito' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="parcelas-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Número de Parcelas
                </label>
                <select
                  id="parcelas-select"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={parcelas}
                  onChange={(e) => setParcelas(Number(e.target.value))}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}x
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Juros (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0"
                  value={juros}
                  onChange={(e) => setJuros(Number(e.target.value))}
                />
              </div>
              {juros > 0 && valorEntrada && (
                <div className="text-sm text-gray-600">
                  <p>Valor Original: R$ {Number(valorEntrada).toFixed(2)}</p>
                  <p>
                    Valor com Juros: R${' '}
                    {(Number(valorEntrada) * (1 + juros / 100)).toFixed(2)}
                  </p>
                  <p>
                    Valor por Parcela: R${' '}
                    {(
                      (Number(valorEntrada) * (1 + juros / 100)) /
                      parcelas
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between space-x-2 mt-6">
            <Button
              variant="outline"
              className="w-[30%] sm:w-auto rounded-full"
              type="button"
              onClick={() => setShowExitModal(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-3 rounded-full hover:from-green-600 hover:to-green-800 w-auto sm:w-auto"
              type="button"
              onClick={enviarEntradaComMetodo}
            >
              Registrar Entrada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

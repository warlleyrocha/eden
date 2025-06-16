import React from 'react';

type CashClosureModelProps = {
  totalEntries: string;
  totalExits: string;
  finalBalance: string;
  closureDate: string;
};

const CashClosureModel: React.FC<CashClosureModelProps> = ({
  totalEntries,
  totalExits,
  finalBalance,
  closureDate,
}) => {
  return (
    <div className="flex flex-col p-6 rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4 text-[#1E3A8A]">
        Fechamento de Caixa
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Selecione o período para visualizar o fechamento
      </p>
      <label htmlFor="period-select" className="mb-1 text-sm text-gray-700">
        Período
      </label>
      <select
        id="period-select"
        className="mb-4 p-2 bg-gray-200 text-gray-900 rounded"
        aria-label="Selecione o período"
      >
        <option>Mensal</option>
      </select>
      <p className="text-sm text-gray-600 mb-4">Período: {closureDate}</p>
      <div className="flex justify-between text-lg mb-2 bg-gray-100 p-4 rounded-lg">
        <span className="text-green-600">Total de Entradas:</span>
        <span className="text-green-600">{totalEntries}</span>
      </div>
      <div className="flex justify-between text-lg mb-2 bg-gray-100 p-4 rounded-lg">
        <span className="text-red-600">Total de Saídas:</span>
        <span className="text-red-600">{totalExits}</span>
      </div>
      <div className="flex justify-between text-lg mb-4 bg-gray-100 p-4 rounded-lg">
        <span className="text-blue-600">Saldo:</span>
        <span className="text-blue-600">{finalBalance}</span>
      </div>
    </div>
  );
};

export default CashClosureModel;

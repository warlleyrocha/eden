import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

type CashClosureModelProps = {
  totalEntries: string;
  totalExits: string;
  finalBalance: string;
  onDateChange?: (startDate: string, endDate: string) => void;
};

const CashClosureModel: React.FC<CashClosureModelProps> = ({
  totalEntries,
  totalExits,
  finalBalance,
  onDateChange,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateDates = () => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (
      onDateChange &&
      date &&
      endDate &&
      new Date(date) <= new Date(endDate)
    ) {
      onDateChange(date, endDate);
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (
      onDateChange &&
      startDate &&
      date &&
      new Date(startDate) <= new Date(date)
    ) {
      onDateChange(startDate, date);
    }
  };

  return (
    <div className="flex flex-col p-6 rounded-lg bg-white max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-[#1E3A8A]">
        Fechamento de Caixa
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Selecione o período para visualizar o fechamento
      </p>

      <div className="mb-4">
        <label
          htmlFor="selected-period"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Período Selecionado
        </label>
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-700 font-medium">
            {startDate && endDate
              ? `${formatDateForDisplay(startDate)} à ${formatDateForDisplay(
                endDate
              )}`
              : 'Selecione as datas'}
          </span>
        </div>
        {!validateDates() && (
          <p className="text-red-500 text-xs mt-1">
            A data inicial deve ser anterior ou igual à data final
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label
            htmlFor="start-date"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={endDate || getCurrentDate()}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="end-date"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate}
            max={getCurrentDate()}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-lg bg-green-50 p-4 rounded-lg border border-green-200">
          <span className="text-green-700 font-medium">Total de Entradas:</span>
          <span className="text-green-700 font-bold">{totalEntries}</span>
        </div>

        <div className="flex justify-between text-lg bg-red-50 p-4 rounded-lg border border-red-200">
          <span className="text-red-700 font-medium">Total de Saídas:</span>
          <span className="text-red-700 font-bold">{totalExits}</span>
        </div>

        <div className="flex justify-between text-lg bg-blue-50 p-4 rounded-lg border border-blue-200">
          <span className="text-blue-700 font-medium">Saldo Final:</span>
          <span className="text-blue-700 font-bold">{finalBalance}</span>
        </div>
      </div>

      {startDate && endDate && validateDates() && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Período de{' '}
            {Math.ceil(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1}{' '}
            dias selecionado
          </p>
        </div>
      )}
    </div>
  );
};

export default CashClosureModel;

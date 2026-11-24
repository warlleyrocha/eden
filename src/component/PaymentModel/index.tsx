import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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

  const dias =
    startDate && endDate && validateDates()
      ? Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
      ) + 1
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start-date">Data inicial</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={endDate || getCurrentDate()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">Data final</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate}
            max={getTomorrowDate()}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 py-2.5 text-sm">
        <Calendar className="size-4 text-foreground-secondary" />
        <span className="tabular font-medium">
          {startDate && endDate
            ? `${formatDateForDisplay(startDate)} a ${formatDateForDisplay(endDate)}`
            : 'Selecione as datas (sem período, mostra o dia de hoje)'}
        </span>
        {dias && (
          <span className="ml-auto text-xs text-foreground-secondary">
            {dias} dia{dias > 1 ? 's' : ''}
          </span>
        )}
      </div>
      {!validateDates() && (
        <p className="-mt-3 text-xs text-danger-foreground">
          A data inicial deve ser anterior ou igual à data final
        </p>
      )}

      <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="flex items-center gap-2 text-sm text-foreground-secondary">
            <span className="size-2 rounded-full bg-success" /> Total de entradas
          </dt>
          <dd className="tabular font-semibold text-success-foreground">{totalEntries}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="flex items-center gap-2 text-sm text-foreground-secondary">
            <span className="size-2 rounded-full bg-danger" /> Total de saídas
          </dt>
          <dd className="tabular font-semibold text-danger-foreground">{totalExits}</dd>
        </div>
        <div className="flex items-center justify-between bg-surface-secondary px-4 py-3">
          <dt className="text-sm font-medium">Saldo final</dt>
          <dd className="tabular text-lg font-bold">{finalBalance}</dd>
        </div>
      </dl>
    </div>
  );
};

export default CashClosureModel;

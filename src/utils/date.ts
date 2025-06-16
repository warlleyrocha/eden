// utils/date.ts
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

export const getTodayDateRange = (): {
  dataInicio: string;
  dataFim: string;
} => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    dataInicio: formatDate(today),
    dataFim: formatDate(tomorrow),
  };
};

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

// utils/dateUtils.ts
/**
 * Utilitários para manipulação segura de datas
 * Resolve problemas de fuso horário em operações de data
 */

/**
 * Converte data string (YYYY-MM-DD) para Date local
 * Adiciona horário meio-dia para evitar problemas de fuso horário
 */
export const converterDataStringParaLocal = (dataString: string): Date => {
  return new Date(dataString + 'T12:00:00');
};

/**
 * Extrai apenas a data (YYYY-MM-DD) sem conversão de timezone
 */
export const extrairDataSemTimezone = (dataISO: string): string => {
  // Se a data já está no formato YYYY-MM-DD, retorna como está
  if (dataISO.length === 10 && dataISO.includes('-')) {
    return dataISO;
  }

  // Se é um ISO string completo, extrai apenas a parte da data
  return dataISO.split('T')[0];
};

/**
 * Formata data garantindo que não mude por timezone
 */
export const formatarDataSegura = (dataInput: string | Date): string => {
  let data: Date;

  if (typeof dataInput === 'string') {
    // Se é string, usa a função segura de conversão
    data = converterDataStringParaLocal(extrairDataSemTimezone(dataInput));
  } else {
    data = dataInput;
  }

  // Formata usando as funções locais para evitar conversão de timezone
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
};

/**
 * Função alternativa para formatarDataSimples (para compatibilidade)
 */
export const formatarDataSimplesSegura = (dataInput: string | Date): string => {
  return formatarDataSegura(dataInput);
};

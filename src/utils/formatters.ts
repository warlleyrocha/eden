/**
 * Utilitários para formatação de dados
 * Arquivo: utils/formatters.ts
 */

/**
 * Formata um número de telefone brasileiro
 * Suporta tanto telefone fixo quanto celular
 * @param value - String com números do telefone
 * @returns String formatada no padrão (00) 00000-0000 ou (00) 0000-0000
 */
export const formatPhone = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');

  // Aplica a formatação baseada no tamanho
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
      6
    )}`;
  } else {
    // Formato para celular com 11 dígitos
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
      11
    )}`;
  }
};

export const formatarMoeda = (valor: number) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
};

/**
 * Formata CPF ou CNPJ automaticamente baseado no tamanho
 * @param value - String com números do documento
 * @returns String formatada no padrão CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)
 */
export const formatCpfCnpj = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    // Formato CPF: 000.000.000-00
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6
      )}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6,
        9
      )}-${numbers.slice(9, 11)}`;
    }
  } else {
    // Formato CNPJ: 00.000.000/0000-00
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5
      )}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5,
        8
      )}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5,
        8
      )}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  }
};

/**
 * Formata apenas CPF
 * @param value - String com números do CPF
 * @returns String formatada no padrão 000.000.000-00
 */
export const formatCpf = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
      6,
      9
    )}-${numbers.slice(9, 11)}`;
  }
};

/**
 * Formata apenas CNPJ
 * @param value - String com números do CNPJ
 * @returns String formatada no padrão 00.000.000/0000-00
 */
export const formatCnpj = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14);

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8)}`;
  } else {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
};

export const toTitleCase = (str: string) => {
  const minorWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no'];

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Primeira palavra sempre maiúscula
      if (index === 0 || !minorWords.includes(word)) {
        // Se a palavra tem 2 letras ou menos, provavelmente é abreviação
        if (word.length <= 2) {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};

/**
 * Formata CEP no padrão 00000-000
 * @param value - String com números do CEP
 * @returns String formatada no padrão 00000-000
 */
export const formatCep = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);

  if (numbers.length <= 5) {
    return numbers;
  } else {
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }
};

/**
 * Remove toda formatação deixando apenas números
 * @param value - String formatada
 * @returns String apenas com números
 */
export const removeFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Remove formatação de telefone (alias para removeFormatting)
 * @param value - String com telefone formatado
 * @returns String apenas com números
 */
export const removePhoneFormatting = (value: string): string => {
  return removeFormatting(value);
};

/**
 * Remove formatação de CPF/CNPJ (alias para removeFormatting)
 * @param value - String com CPF/CNPJ formatado
 * @returns String apenas com números
 */
export const removeCpfCnpjFormatting = (value: string): string => {
  return removeFormatting(value);
};

/**
 * Remove formatação de CEP (alias para removeFormatting)
 * @param value - String com CEP formatado
 * @returns String apenas com números
 */
export const removeCepFormatting = (value: string): string => {
  return removeFormatting(value);
};

/**
 * Valida se o CPF tem 11 dígitos
 * @param value - String com CPF
 * @returns boolean
 */
export const isValidCpfLength = (value: string): boolean => {
  return removeFormatting(value).length === 11;
};

/**
 * Valida se o CNPJ tem 14 dígitos
 * @param value - String com CNPJ
 * @returns boolean
 */
export const isValidCnpjLength = (value: string): boolean => {
  return removeFormatting(value).length === 14;
};

/**
 * Valida se o telefone tem tamanho válido (10 ou 11 dígitos)
 * @param value - String com telefone
 * @returns boolean
 */
export const isValidPhoneLength = (value: string): boolean => {
  const numbers = removeFormatting(value);
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Detecta se o documento é CPF ou CNPJ baseado no tamanho
 * @param value - String com documento
 * @returns 'cpf' | 'cnpj' | 'invalid'
 */
export const detectDocumentType = (
  value: string
): 'cpf' | 'cnpj' | 'invalid' => {
  const numbers = removeFormatting(value);

  if (numbers.length === 11) {
    return 'cpf';
  } else if (numbers.length === 14) {
    return 'cnpj';
  } else {
    return 'invalid';
  }
};

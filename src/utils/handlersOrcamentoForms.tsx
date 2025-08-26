// Função de atualização de item
export const updateItem =
  (setter: any) => (index: number, field: string, value: any) =>
    setter((prev: any[]) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

// Função de remoção de item
export const removeItem = (setter: any) => (index: number) =>
  setter((prev: any[]) => prev.filter((_, i) => i !== index));

// Função de adicionar item
export const addItem = (setter: any, newItem: any) => () =>
  setter((prev: any[]) => [...prev, newItem]);

// Produto completo com ID – usado para leitura/listagem
export interface Produto {
  id: string;
  nome: string;
  /*categoria: string; //Caso queiram adicionar categorias
  descricao: string;*/ // Informações adicionais
  estoque: number;
  precoCusto: number;
  lojaId: string;
}

// Payload usado para **criar** um novo produto (sem ID, com quantidade inicial)
export interface ProductInputPayload {
  nome: string;
  precoCusto: number;
  quantidadeInicial: number;
  lojaId: string;
}

// Payload usado para **atualizar** um produto (sem quantidade inicial)
export interface ProductUpdatePayload {
  nome: string;
  precoCusto: number;
  estoque: number;
  /*categoria?: string;
  descricao?: string;*/
}

export interface ProductType {
  id: string;
  nome: string;
  precoCusto: number;
  estoque?: number;
}

export interface Orcamento {
  id: string;
  cliente: {
    endereco: string;
    id: string;
    nome?: string;
    telefone?: string;
  };
  lojaId: string;
  status: string;
  descricao: string;
  metodoPagamento: string;
  numeroParcelas: number;
  taxaJuros: number;
  itens: {
    produtoId: string;
    nomeProduto?: string;
    quantidade: number;
    precoUnitario: number;
  }[];
  servicos: {
    descricao: string;
    valor: number;
  }[];
  criadoEm?: string;
  total?: number;
}

export interface CreateOrcamento {
  clienteId: string;
  lojaId: string;
  itens: {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome?: string;
  }[];
  servicos: {
    descricao: string;
    valor: number;
  }[];
  metodoPagamento: string;
  numeroParcelas: number;
  taxaJuros: number;
  descricao: string;
  status: string;
}

export interface ItemOrcamento {
  produtoId: string;
  nome?: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal?: number;
  descricao?: string;
  unidade?: string;
}

export interface OrcamentoRenderDetails {
  id: string;
  cliente?: {
    id: string;
    nome: string;
    telefone: string;
  };
  criadoEm: string;
  total: number;
  status: string;
  numeroSequencial?: number;
}

export interface OrcamentoProduto {
  name: string;
  value: string;
  unitPrice: string;
  quantity?: string;
}

export interface OrcamentoService {
  description: string;
  value: string;
}

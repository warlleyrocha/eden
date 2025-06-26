export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  doc: string;
  endereco: string;
  cpfCnpj?: string;
}
export interface CreateClient {
  nome: string;
  telefone: string;
  email: string;
  cpfCnpj: string;
  endereco: string;
  lojaId: string;
}

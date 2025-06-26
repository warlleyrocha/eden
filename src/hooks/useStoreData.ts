import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const useStoreData = () => {
  const [nome, setNome] = useState('Carregando...');
  const [email, setEmail] = useState('Carregando...');
  const [cnpj, setCnpj] = useState('Carregando...');
  const [endereco, setEndereco] = useState('Carregando...');
  const [subTitle, setSubTitle] = useState('Carregando ...');
  const [telefone, setTelefone] = useState('Carregando ...');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchStoreData = async () => {
      try {
        const lojaId = localStorage.getItem('storeId');
        if (lojaId) {
          const response = await api.get(`/lojas/${lojaId}`, {
            signal: abortController.signal,
          });
          console.log('Resposta:', response.data);
          setNome(response.data.nome);
          setEmail(response.data.email);
          setCnpj(response.data.cnpj);
          setTelefone(response.data.telefone);
          setEndereco(response.data.endereco);
          setSubTitle(response.data.subTitulo);
          setError(false);
        } else {
          setError(true);
          setNome('ID Not found');
        }
      } catch (error: unknown) {
        // ✅ Ignora erros de abort - são intencionais
        if (
          typeof error === 'object' &&
          error !== null &&
          ('name' in error || 'code' in error)
        ) {
          const err = error as { name?: string; code?: string };
          if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
            console.log('Requisição cancelada (normal)');
            return;
          }
        }

        console.error('Erro ao buscar o nome da loja:', error);
        setError(true);
        setNome('Erro ao carregar');
      } finally {
        // ✅ Só atualiza loading se a requisição não foi abortada
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStoreData();

    // ✅ Cleanup: aborta a requisição se o componente desmontar
    return () => {
      abortController.abort();
    };
  }, []);

  return {
    nome,
    email,
    cnpj,
    endereco,
    subTitle,
    telefone,
    error,
    loading,
  };
};

export default useStoreData;

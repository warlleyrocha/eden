import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const useStoreData = () => {
  const [nameStore, setNameStore] = useState('Carregando...');
  const [emailStore, setEmailStore] = useState('Carregando...');
  const [cnpjStore, setCnpjStore] = useState('Carregando...');
  const [enderecoStore, setEnderecoStore] = useState('Carregando...');
  const [subTitleStore, setSubTitleStore] = useState('Carregando ...');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchStoreData = async () => {
      try {
        const storeId = localStorage.getItem('storeId');
        if (storeId) {
          const response = await api.get(`/lojas/${storeId}`, {
            signal: abortController.signal,
          });
          console.log('Resposta:', response.data);
          setNameStore(response.data.nome);
          setEmailStore(response.data.email);
          setCnpjStore(response.data.cnpj);
          setEnderecoStore(response.data.endereco);
          setSubTitleStore(response.data.subTitulo);
          setError(false);
        } else {
          setError(true);
          setNameStore('ID Not found');
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
        setNameStore('Erro ao carregar');
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
    nameStore,
    emailStore,
    cnpjStore,
    enderecoStore,
    subTitleStore,
    error,
    loading,
  };
};

export default useStoreData;

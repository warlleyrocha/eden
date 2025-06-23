// src/hooks/useStock.ts
import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { getStoreId } from '@/utils/getStoreId';

import type {
  Produto,
  ProductInputPayload,
  ProductUpdatePayload,
} from '@/@types/product';

export function useStock() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Produto[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = async () => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      const lojaId = getStoreId();

      if (!lojaId) {
        alert('ID da loja não encontrado no localStorage');
        return;
      }

      setLoading(true);
      const response = await api.get(`/produtos/relatorio/${lojaId}`, {
        signal: abortController.signal,
      });
      const { produtos, totalProdutos, quantidadeTotal, valorTotal } =
        response.data;

      setProducts(produtos);
      setTotalProdutos(totalProdutos ?? 0);
      setQuantidadeTotal(quantidadeTotal ?? 0);
      setValorTotal(valorTotal ?? 0);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao buscar produtos');
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const addProduct = async (data: Omit<ProductInputPayload, 'lojaId'>) => {
    const lojaId = getStoreId();

    if (!lojaId) {
      alert('ID da loja não encontrado no localStorage');
      return;
    }

    const payload: ProductInputPayload = {
      ...data,
      lojaId,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/produtos', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        console.log('Produto adicionado:', response.data);
        await fetchProducts(); // Atualiza a lista
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      setError('Erro ao adicionar produto');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    const lojaId = getStoreId();

    if (!lojaId) {
      alert('ID da loja não encontrado no localStorage');
      return;
    }

    try {
      if (!lojaId) throw new Error('ID do produto é obrigatório');
      console.log('Deletando produto com ID:', productId);
      setLoading(true);
      await api.delete(`/produtos/${productId}`);
      await fetchProducts();
      setError(null);
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      setError('Erro ao deletar produto');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<ProductUpdatePayload>
  ) => {
    const lojaId = getStoreId();

    console.log('Atualizando produto com ID:', productId);
    console.log('Dados para atualização:', updates);

    if (!lojaId) {
      console.warn('ID da loja não encontrado no localStorage');
      return;
    }

    if (!productId) {
      console.warn('ID do produto é obrigatório para atualização');
      return;
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([, value]) => value !== undefined && value !== null
      )
    );

    // Substitui `quantidadeInicial` por `estoque`
    if ('quantidadeInicial' in filteredUpdates) {
      filteredUpdates.estoque = filteredUpdates.quantidadeInicial;
      delete filteredUpdates.quantidadeInicial;
    }

    const payload = {
      id: productId,
      lojaId,
      ...filteredUpdates,
    };

    if (Object.keys(payload).length === 0) {
      console.warn('Nenhum dado válido fornecido para atualização');
      return;
    }

    console.log('Payload para atualização:', payload);

    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/produtos/${productId}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        console.log('Produto atualizado com sucesso:', response.data);
        await fetchProducts();
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Erro ao atualizar produto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    products,
    totalProdutos,
    quantidadeTotal,
    valorTotal,
    loading,
    error,
    addProduct,
    fetchProducts,
    updateProduct,
    deleteProduct,
  };
}

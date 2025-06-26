// src/hooks/useStock.ts
import { useState, useEffect, useRef } from 'react';
import { estoqueAPI } from '@/services/estoque.api';

import type { ApiError } from '@/utils/errorHandler';

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
  const [error, setError] = useState<ApiError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = async () => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      setError(null);

      const stockReport = await estoqueAPI.fetchProducts(
        abortController.signal
      );

      setProducts(stockReport.produtos);
      setTotalProdutos(stockReport.totalProdutos);
      setQuantidadeTotal(stockReport.quantidadeTotal);
      setValorTotal(stockReport.valorTotal);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' || err.name === 'AbortError')
      ) {
        return;
      }

      console.error('Erro ao buscar produtos:', err);
      setError(err as ApiError);
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Adicionar produto no estoque
  const addProduct = async (data: Omit<ProductInputPayload, 'lojaId'>) => {
    setLoading(true);
    setError(null);

    try {
      await estoqueAPI.createProduct({ payload: data });
      await fetchProducts(); // Atualiza a lista após criar
    } catch (err: unknown) {
      console.error('Erro ao adicionar produto:', err);
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<ProductUpdatePayload>
  ) => {
    if (!productId) {
      console.warn('ID do produto é obrigatório para atualização');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await estoqueAPI.updateProduct({
        id: productId,
        payload: updates,
      });
      await fetchProducts(); // Atualiza a lista após atualizar
    } catch (err: unknown) {
      console.error('Erro ao atualizar produto:', err);
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!productId) {
      console.warn('ID do produto é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await estoqueAPI.deleteProduct({ id: productId });
      await fetchProducts(); // Atualiza a lista após deletar
    } catch (err: unknown) {
      console.error('Erro ao deletar produto:', err);
      setError(err as ApiError);
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

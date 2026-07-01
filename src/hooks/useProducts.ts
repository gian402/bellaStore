'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, ProductFilters } from '@/types';

interface UseProductsOptions extends ProductFilters {
  limit?: number;
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { limit, enabled = true, ...filters } = options;

  const fetchProducts = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from('productos')
        .select('*, categoria:categorias(*)');

      if (filters.busqueda) {
        query = query.ilike('nombre', `%${filters.busqueda}%`);
      }
      if (filters.categoria_id) {
        query = query.eq('categoria_id', filters.categoria_id);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.precio_min !== undefined) {
        query = query.gte('precio', filters.precio_min);
      }
      if (filters.precio_max !== undefined) {
        query = query.lte('precio', filters.precio_max);
      }
      if (filters.etiqueta === 'nuevo') {
        query = query.eq('es_nuevo', true);
      } else if (filters.etiqueta === 'oferta') {
        query = query.eq('en_oferta', true);
      } else if (filters.etiqueta === 'mas_vendido') {
        query = query.eq('mas_vendido', true);
      } else if (filters.etiqueta === 'destacado') {
        query = query.eq('destacado', true);
      }

      switch (filters.orden) {
        case 'precio_asc':
          query = query.order('precio', { ascending: true });
          break;
        case 'precio_desc':
          query = query.order('precio', { ascending: false });
          break;
        case 'mas_vendidos':
          query = query.order('ventas', { ascending: false });
          break;
        case 'nombre_asc':
          query = query.order('nombre', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      setProducts((data as Product[]) ?? []);
    } catch (err) {
      setError('No se pudieron cargar los productos');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from('productos')
          .select('*, categoria:categorias(*)')
          .eq('slug', slug)
          .single();

        if (err) throw err;
        setProduct(data as Product);

        // Incrementar vistas
        if (data) {
          supabase.from('productos').update({ vistas: (data.vistas ?? 0) + 1 }).eq('id', data.id);
        }
      } catch {
        setError('Producto no encontrado');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { product, isLoading, error };
}

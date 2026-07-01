'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { useFavoritesStore } from '@/store/favoritesStore';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

/* Productos de ejemplo para cuando no hay Supabase */
const SAMPLE_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i + 1}`,
  nombre: [
    'Perfume Floral Premium', 'Cartera Cuero Elegante', 'Set Pulseras Doradas',
    'Collar Perlas', 'Bolso Tote Moderno', 'Perfume Oriental',
    'Pañuelo de Seda', 'Anillo Plata 925', 'Cartera Mini Cadena',
    'Set Aretes Perla', 'Perfume Cítrico', 'Clutch Brillante',
  ][i],
  descripcion: 'Descripción del producto.',
  precio:        [850, 1200, 350, 650, 980, 720, 280, 450, 890, 320, 760, 540][i],
  precio_oferta: i % 3 === 0 ? [680, null, 280, null, 780, null, null, 360, null, 256, 600, null][i] : null,
  categoria_id:  `cat-${(i % 6) + 1}`,
  categoria:     { id: `cat-${(i % 6) + 1}`, nombre: ['Perfumes','Carteras','Accesorios','Maquillaje','Cuidado','Regalos'][i % 6], slug: '', orden: i % 6, activa: true, created_at: '' },
  imagenes: [],
  imagen_principal: '',
  stock:       Math.floor(Math.random() * 20) + 1,
  estado:      'disponible' as const,
  destacado:   i < 4,
  es_nuevo:    i % 3 === 0,
  en_oferta:   i % 4 === 0,
  mas_vendido: i % 5 === 0,
  etiquetas:   [],
  slug: [
    'perfume-floral','cartera-cuero','pulseras-doradas','collar-perlas',
    'bolso-tote','perfume-oriental','panuelo-seda','anillo-plata',
    'cartera-mini','aretes-perla','perfume-citrico','clutch-brillante',
  ][i],
  vistas: 0, ventas: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export default function FavoritesPage() {
  const { favoriteIds, clearFavorites } = useFavoritesStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('productos')
        .select('*, categoria:categorias(*)')
        .in('id', favoriteIds);
      if (error) throw error;
      setProducts((data as Product[]) ?? []);
    } catch {
      // Fallback: filtrar los de ejemplo que estén en favoritos
      setProducts(SAMPLE_PRODUCTS.filter(p => favoriteIds.includes(p.id)));
    } finally {
      setIsLoading(false);
    }
  }, [favoriteIds]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">

        {/* Encabezado */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Favoritos</h1>
                  <p className="text-xs text-gray-400">
                    {favoriteIds.length} {favoriteIds.length === 1 ? 'producto guardado' : 'productos guardados'}
                  </p>
                </div>
              </div>

              {favoriteIds.length > 0 && (
                <button
                  onClick={clearFavorites}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpiar todo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Cargando */}
          {isLoading ? (
            <div className="flex justify-center py-32">
              <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            </div>

          /* Sin favoritos */
          ) : favoriteIds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center px-4"
            >
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-5">
                <Heart className="w-10 h-10 text-rose-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aún no tienes favoritos
              </h3>
              <p className="text-sm text-gray-400 mb-7 max-w-xs">
                Toca el corazón en cualquier producto para guardarlo aquí
              </p>
              <Link
                href="/catalogo"
                className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Ver catálogo
              </Link>
            </motion.div>

          /* Grid de favoritos */
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    className="h-full"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
  );
}

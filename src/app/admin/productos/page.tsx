'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Package, ToggleLeft, ToggleRight, Loader2, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

// Datos de ejemplo
const SAMPLE_PRODUCTS: Product[] = Array.from({ length: 10 }, (_, i) => ({
  id: `prod-${i + 1}`,
  nombre: ['Perfume Floral Premium', 'Cartera Cuero Elegante', 'Set Pulseras Doradas', 'Collar Perlas', 'Bolso Tote', 'Perfume Oriental', 'Pañuelo Seda', 'Anillo Plata', 'Cartera Mini', 'Aretes Perla'][i],
  descripcion: 'Descripción del producto',
  precio: [850, 1200, 350, 650, 980, 720, 280, 450, 890, 320][i],
  precio_oferta: i % 3 === 0 ? 680 : null,
  categoria_id: 'cat-1',
  categoria: { id: 'cat-1', nombre: ['Perfumes', 'Carteras', 'Accesorios', 'Accesorios', 'Carteras', 'Perfumes', 'Accesorios', 'Accesorios', 'Carteras', 'Accesorios'][i], slug: 'cat', orden: 1, activa: true, created_at: '' },
  imagenes: [],
  imagen_principal: '/images/placeholder.jpg',
  stock: [15, 8, 20, 5, 12, 3, 25, 9, 0, 14][i],
  estado: i === 8 ? 'agotado' : 'disponible',
  destacado: i < 3,
  es_nuevo: i % 3 === 0,
  en_oferta: i % 4 === 0,
  mas_vendido: i % 5 === 0,
  etiquetas: [],
  slug: `producto-${i + 1}`,
  vistas: Math.floor(Math.random() * 200),
  ventas: Math.floor(Math.random() * 100),
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}));

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteConfirm, setIsBulkDeleteConfirm] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('productos')
        .select('*, categoria:categorias(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data as Product[]) ?? []);
    } catch {
      setProducts(SAMPLE_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria?.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Producto eliminado', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Error al eliminar producto', { style: { borderRadius: '12px' } });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const supabase = createClient();
      const ids = Array.from(selectedIds);
      const { error } = await supabase.from('productos').delete().in('id', ids);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      toast.success(`${ids.length} productos eliminados`, { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Error al eliminar productos', { style: { borderRadius: '12px' } });
    } finally {
      setIsBulkDeleteConfirm(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {products.length} productos en total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
            />
          </div>

          {/* Acciones bulk */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setIsBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 hover:bg-red-100 font-medium rounded-xl text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay productos</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Intenta con otros términos' : 'Agrega tu primer producto'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-left">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                      {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'hover:bg-gray-50/50 transition-colors',
                      selectedIds.has(product.id) && 'bg-rose-50/30'
                    )}
                  >
                    <td className="p-4">
                      <button
                        onClick={() => toggleSelect(product.id)}
                        className="text-gray-400 hover:text-rose-500"
                      >
                        {selectedIds.has(product.id) ? (
                          <CheckSquare className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={product.imagen_principal || '/images/placeholder.jpg'}
                            alt={product.nombre}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                            {product.nombre}
                          </p>
                          <div className="flex gap-1 mt-0.5">
                            {product.es_nuevo && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Nuevo</span>
                            )}
                            {product.en_oferta && (
                              <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">Oferta</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {product.categoria?.nombre ?? '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        {product.precio_oferta ? (
                          <>
                            <p className="text-sm font-bold text-rose-500">{formatPrice(product.precio_oferta)}</p>
                            <p className="text-xs text-gray-400 line-through">{formatPrice(product.precio)}</p>
                          </>
                        ) : (
                          <p className="text-sm font-semibold text-gray-800">{formatPrice(product.precio)}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={cn(
                        'text-sm font-medium',
                        product.stock === 0 ? 'text-red-500' :
                        product.stock <= 5 ? 'text-amber-500' : 'text-gray-700'
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                        product.estado === 'disponible'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          product.estado === 'disponible' ? 'bg-emerald-500' : 'bg-gray-400'
                        )} />
                        {product.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/producto/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver en tienda"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal confirmar eliminar individual */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-800 mb-2">
                ¿Eliminar producto?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal confirmar eliminar masivo */}
      <AnimatePresence>
        {isBulkDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsBulkDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-center text-gray-800 mb-2">
                ¿Eliminar {selectedIds.size} productos?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Esta acción eliminará permanentemente los productos seleccionados.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsBulkDeleteConfirm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar todos
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

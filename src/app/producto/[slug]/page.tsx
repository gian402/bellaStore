'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingBag, Heart, Minus, Plus, Share2, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import ProductGallery from '@/components/products/ProductGallery';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Hooks siempre antes de cualquier return condicional
  const { addItem, openCart } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  // Cargar producto real desde Supabase
  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('productos')
          .select('*, categoria:categorias(*)')
          .eq('slug', slug)
          .single();
        if (error || !data) throw error ?? new Error('Producto no encontrado');
        setProduct(data as Product);
        // Incrementar vistas
        try {
          await supabase.from('productos').update({ vistas: (data.vistas ?? 0) + 1 }).eq('id', data.id);
        } catch { /* silencioso */ }
      } catch {
        toast.error('Producto no encontrado', { style: { borderRadius: '12px' } });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-rose-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 text-lg">Producto no encontrado</p>
          <Link href="/catalogo" className="text-rose-500 hover:underline">← Volver al catálogo</Link>
        </div>
      </Layout>
    );
  }

  const favorite = isFavorite(product.id);
  const discount = product.precio_oferta
    ? calculateDiscount(product.precio, product.precio_oferta)
    : 0;

  // Soporta imágenes como array de objetos {url} o array de strings
  const images = (product.imagenes ?? []).map((img) =>
    typeof img === 'string' ? img : img.url
  ).filter(Boolean);

  // Si no hay imágenes usar imagen_principal o placeholder
  const displayImages = images.length > 0
    ? images
    : product.imagen_principal
    ? [product.imagen_principal]
    : ['/images/placeholder.jpg'];

  const handleAddToCart = () => {
    if (product.estado === 'agotado') return;
    addItem(product, quantity);
    setAddedToCart(true);
    toast.success('Producto agregado al carrito', {
      icon: '🛍️',
      style: { borderRadius: '12px' },
    });
    setTimeout(() => {
      setAddedToCart(false);
      openCart();
    }, 1500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.nombre,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado', { style: { borderRadius: '12px' } });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-rose-500 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/catalogo" className="hover:text-rose-500 transition-colors">Catálogo</Link>
            <span>/</span>
            {product.categoria && (
              <>
                <Link
                  href={`/catalogo?categoria=${product.categoria.slug}`}
                  className="hover:text-rose-500 transition-colors"
                >
                  {product.categoria.nombre}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-600 truncate max-w-xs">{product.nombre}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Galería */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductGallery images={displayImages} productName={product.nombre} />
            </motion.div>

            {/* Detalles */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              {/* Etiquetas */}
              <div className="flex gap-2 mb-4">
                {product.es_nuevo && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                    ✨ Nuevo
                  </span>
                )}
                {product.en_oferta && discount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full">
                    -{discount}% Oferta
                  </span>
                )}
                {product.mas_vendido && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                    ⭐ Popular
                  </span>
                )}
              </div>

              {/* Categoría */}
              {product.categoria && (
                <Link
                  href={`/catalogo?categoria=${product.categoria.slug}`}
                  className="text-sm text-rose-400 font-medium uppercase tracking-wider hover:text-rose-500 transition-colors mb-2"
                >
                  {product.categoria.nombre}
                </Link>
              )}

              {/* Nombre */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {product.nombre}
              </h1>

              {/* Precio */}
              <div className="flex items-center gap-3 mb-6">
                {product.precio_oferta ? (
                  <>
                    <span className="text-3xl font-bold text-rose-500">
                      {formatPrice(product.precio_oferta)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.precio)}
                    </span>
                    <span className="bg-rose-100 text-rose-600 text-sm font-semibold px-2.5 py-1 rounded-full">
                      Ahorra {formatPrice(product.precio - product.precio_oferta)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.precio)}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                {product.descripcion}
              </p>

              {/* Color */}
              {product.color && (() => {
                const parts = product.color.split('|');
                const colorNombre = parts[0];
                const colorHex = parts[1] ?? null;
                return (
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm font-medium text-gray-700">Color:</span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100">
                      {colorHex && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: colorHex }}
                        />
                      )}
                      <span className="text-sm font-medium text-gray-700">{colorNombre}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                {product.estado === 'disponible' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-emerald-600 font-medium">Disponible</span>
                    {product.stock <= 10 && (
                      <span className="text-xs text-amber-500">· Solo {product.stock} restantes</span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-sm text-gray-400">Agotado</span>
                  </>
                )}
              </div>

              {/* Selector de cantidad */}
              {product.estado === 'disponible' && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Cantidad:</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-gray-500" />
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Subtotal: {formatPrice((product.precio_oferta ?? product.precio) * quantity)}
                    </span>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 mb-6">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.estado === 'agotado'}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all duration-200',
                    product.estado === 'agotado'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : addedToCart
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg hover:shadow-rose-200'
                  )}
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Agregado al carrito
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      {product.estado === 'agotado' ? 'Agotado' : 'Agregar al carrito'}
                    </>
                  )}
                </motion.button>

                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-200',
                    favorite
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-400'
                  )}
                >
                  <Heart className={cn('w-5 h-5', favorite && 'fill-white')} />
                </button>

                <button
                  onClick={handleShare}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📦</span>
                  <span>Envío coordinado por WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Producto 100% original y garantizado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔄</span>
                  <span>Devoluciones en 7 días si hay defectos</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  const { addItem }                     = useCartStore();
  const { toggleFavorite, isFavorite }  = useFavoritesStore();

  // Evitar hydration mismatch con zustand/localStorage
  useEffect(() => { setMounted(true); }, []);

  const favorite = mounted && isFavorite(product.id);
  const discount = product.precio_oferta
    ? calculateDiscount(product.precio, product.precio_oferta)
    : 0;

  const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E";

  const rawImage = product.imagenes.length > 1 && isHovered
    ? (product.imagenes[1]?.url || product.imagen_principal)
    : product.imagen_principal;
  const currentImage = rawImage || PLACEHOLDER;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.estado === 'agotado' || product.agotado) return;
    addItem(product);
    toast.success(`${product.nombre} agregado al carrito`, {
      icon: '🛍️',
      style: { borderRadius: '12px', fontSize: '13px' },
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
    toast.success(
      favorite ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      {
        icon: favorite ? '💔' : '❤️',
        style: { borderRadius: '12px', fontSize: '13px' },
      }
    );
  };

  const goToProduct = () => router.push(`/producto/${product.slug}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col h-full cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={goToProduct}
    >
      {/* ── Imagen ── */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        <Image
          src={currentImage}
          alt={product.nombre}
          fill
          unoptimized={currentImage.startsWith('data:')}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/20 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )} />

        {/* Botón "Ver detalles" — div, no Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={goToProduct}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-800 text-xs font-medium rounded-full shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-colors whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver detalles
          </div>
        </motion.div>

        {/* Agotado */}
        {(product.estado === 'agotado' || product.agotado) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <span className="relative z-10 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg">
              AGOTADO
            </span>
          </div>
        )}

        {/* Etiquetas */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.es_nuevo && (
            <span className="bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Nuevo
            </span>
          )}
          {product.en_oferta && discount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.mas_vendido && (
            <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Popular
            </span>
          )}
        </div>

        {/* Favorito */}
        <button
          onClick={handleToggleFavorite}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
            mounted && favorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/90 text-gray-400 hover:bg-rose-50 hover:text-rose-500 shadow-sm'
          )}
          aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={cn('w-4 h-4', mounted && favorite && 'fill-white')} />
        </button>
      </div>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col flex-1">
        {product.categoria && (
          <p className="text-[10px] text-rose-400 font-medium uppercase tracking-wider mb-1">
            {product.categoria.nombre}
          </p>
        )}

        <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-1.5 group-hover:text-rose-500 transition-colors line-clamp-2">
          {product.nombre}
        </h3>

        {/* Precio + carrito — siempre al fondo */}
        <div className="mt-auto pt-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              {product.precio_oferta ? (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through leading-tight">
                    {formatPrice(product.precio)}
                  </span>
                  <span className="text-base font-bold text-rose-500 leading-tight">
                    {formatPrice(product.precio_oferta)}
                  </span>
                </div>
              ) : (
                <span className="text-base font-bold text-gray-800">
                  {formatPrice(product.precio)}
                </span>
              )}
            </div>

            {(product.estado === 'agotado' || product.agotado) ? (
              /* Botón verde "Solicitar" para productos agotados */
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(product);
                  toast.success('Agregado — completa tu solicitud', {
                    icon: '📦',
                    style: { borderRadius: '12px', fontSize: '13px' },
                  });
                }}
                className="flex items-center gap-1 px-3 h-8 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 flex-shrink-0"
                aria-label="Solicitar pedido"
              >
                Solicitar
              </button>
            ) : (
              /* Botón carrito normal */
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:shadow-md active:scale-95"
                aria-label="Agregar al carrito"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
          </div>

          {product.estado === 'disponible' && !product.agotado && product.stock <= 5 && product.stock > 0 && (
            <p className="text-[10px] text-amber-500 font-medium mt-1.5">
              ¡Solo quedan {product.stock}!
            </p>
          )}

          {/* Info de pedido anticipado en la tarjeta */}
          {(product.estado === 'agotado' || product.agotado) && (product.costo_pedido || product.tiempo_llegada) && (
            <div className="mt-1.5 space-y-0.5">
              {product.costo_pedido && (
                <p className="text-[10px] text-gray-500">
                  Costo pedido: <span className="font-semibold text-gray-700">{formatPrice(product.costo_pedido)}</span>
                </p>
              )}
              {product.tiempo_llegada && (
                <p className="text-[10px] text-gray-500">
                  Llega en: <span className="font-semibold text-gray-700">{product.tiempo_llegada}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

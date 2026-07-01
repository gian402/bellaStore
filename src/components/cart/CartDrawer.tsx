'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, getTotal, getItemCount } =
    useCartStore();

  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeCart}
          />

          {/* Panel del carrito */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                <h2 className="font-bold text-gray-800">Mi carrito</h2>
                {itemCount > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                /* Carrito vacío */
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                    <Package className="w-10 h-10 text-rose-300" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-2">Tu carrito está vacío</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Agrega productos para comenzar tu compra
                  </p>
                  <Link
                    href="/catalogo"
                    onClick={closeCart}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors text-sm"
                  >
                    Ver productos
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* Lista de items */
                <div className="p-4 space-y-3">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gray-50 rounded-2xl p-3"
                      >
                        <div className="flex gap-3">
                          {/* Imagen */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white">
                            <Image
                              src={item.producto.imagen_principal || '/images/placeholder.jpg'}
                              alt={item.producto.nombre}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-800 truncate">
                              {item.producto.nombre}
                            </h3>
                            {item.producto.categoria && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {item.producto.categoria.nombre}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              {/* Controles de cantidad */}
                              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.producto.id, item.cantidad - 1)
                                  }
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-l-lg"
                                >
                                  <Minus className="w-3 h-3 text-gray-500" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-700">
                                  {item.cantidad}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.producto.id, item.cantidad + 1)
                                  }
                                  disabled={item.cantidad >= item.producto.stock}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r-lg disabled:opacity-40"
                                >
                                  <Plus className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>

                              {/* Precio y eliminar */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-rose-500">
                                  {formatPrice(item.subtotal)}
                                </span>
                                <button
                                  onClick={() => removeItem(item.producto.id)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Limpiar carrito */}
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full text-center text-xs text-gray-400 hover:text-red-400 transition-colors py-2"
                    >
                      Vaciar carrito
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer con total y acciones */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-5 space-y-4">
                {/* Resumen */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-lg text-rose-500">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    * Costo de envío se coordina por WhatsApp
                  </p>
                </div>

                {/* Botón de compra */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-center rounded-2xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Proceder al pago
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

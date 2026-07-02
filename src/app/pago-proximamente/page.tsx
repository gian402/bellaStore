'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Camera, MessageCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function PagoProximamentePage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const total = mounted ? getTotal() : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Tarjeta principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden"
          >
            {/* Header decorativo */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Estamos trabajando en ello
              </h1>
              <p className="text-rose-100 text-sm">
                El sistema de pagos en línea estará disponible muy pronto
              </p>
            </div>

            {/* Contenido */}
            <div className="px-8 py-7 space-y-6">

              {/* Resumen del pedido */}
              {mounted && items.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Tu pedido
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate mr-2">
                          {item.producto.nombre}
                          <span className="text-gray-400 ml-1">×{item.cantidad}</span>
                        </span>
                        <span className="font-medium text-gray-800 flex-shrink-0">
                          {formatPrice(item.precio_unitario * item.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="font-bold text-rose-500 text-base">{formatPrice(total)}</span>
                  </div>
                </div>
              )}

              {/* Instrucciones */}
              <div className="space-y-4">
                <p className="text-gray-700 text-sm font-medium text-center">
                  Para completar tu compra, sigue estos pasos:
                </p>

                <div className="space-y-3">
                  {/* Paso 1 */}
                  <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-rose-500" />
                        Toma una captura de pantalla
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Fotografía esta página o tu carrito con los productos que deseas.
                      </p>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-500" />
                        Envíala por WhatsApp
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Mándanos la captura al número de contacto que encontraste en el catálogo.
                      </p>
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-blue-500" />
                        Coordina tu entrega
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Te confirmaremos el pedido y coordinaremos el pago y la entrega contigo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje final */}
              <div className="text-center bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                <p className="text-sm text-amber-800 font-medium">
                  🚀 Muy pronto podrás pagar directamente desde aquí.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Gracias por tu paciencia y confianza en <strong>BellaStore</strong>.
                </p>
              </div>

              {/* Botón volver */}
              <button
                onClick={() => router.back()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-2xl hover:border-rose-300 hover:text-rose-500 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al catálogo
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

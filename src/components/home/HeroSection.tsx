'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 min-h-[85vh] flex items-center">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-100/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contenido */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-rose-500 bg-rose-100 px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Nueva colección disponible
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Encuentra productos{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                    únicos
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8C50 3 100 3 198 8"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>{' '}
                para resaltar tu estilo
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                Perfumes exclusivos, carteras elegantes, accesorios y mucho más.
                Todo lo que necesitas para lucir perfecta cada día.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-rose-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Comprar ahora
                </Link>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 hover:border-rose-300 hover:text-rose-500 transition-all duration-300"
                >
                  Ver productos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Imagen Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Círculo decorativo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-50" />
              
              {/* Imagen principal */}
              <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  {/* Placeholder visual elegante */}
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow-xl">
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-rose-400 font-medium text-sm">Tu imagen de hero aquí</p>
                    <p className="text-rose-300 text-xs mt-1">Sube desde el panel admin</p>
                  </div>
                </div>
              </div>

              {/* Tarjetas flotantes */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-6 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">🌹</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Perfume N°5</p>
                  <p className="text-xs text-rose-500 font-bold">L. 850.00</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-6 bg-white rounded-2xl shadow-lg p-3 z-20"
              >
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-medium">+2,000 clientes</p>
                <p className="text-xs text-gray-400">felices</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { Search, Home, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center p-6">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-rose-200/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Número grande */}
        <div className="relative mb-6">
          <p
            className="text-[140px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </p>
          {/* Ícono superpuesto */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-rose-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-rose-400" />
            </div>
          </div>
        </div>

        {/* Texto */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe, fue movida o está
          temporalmente no disponible.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/catalogo"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-rose-200 transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver catálogo
          </Link>
        </div>

        {/* Enlace de volver */}
        <button
          onClick={() => history.back()}
          className="mt-6 flex items-center gap-1.5 mx-auto text-sm text-gray-400 hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver atrás
        </button>
      </div>
    </div>
  );
}

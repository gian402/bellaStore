'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, ShoppingBag } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log de errores a un servicio de monitoreo (ej: Sentry)
    console.error('[BellaStore Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center p-6">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-rose-200/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Ícono de error */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-9 h-9 text-amber-500" />
          </div>
        </div>

        {/* Texto */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Algo salió mal
        </h1>
        <p className="text-gray-500 mb-2 leading-relaxed">
          Ocurrió un error inesperado. Por favor intenta de nuevo. Si el
          problema persiste, contáctanos por WhatsApp.
        </p>

        {/* Código de error (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-3 bg-gray-900 rounded-xl text-left">
            <p className="text-xs font-mono text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-rose-200 transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>

        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-rose-400 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

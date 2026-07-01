import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">

      {/* Línea decorativa superior */}
      <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />

      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

          {/* Marca */}
          <div className="max-w-xs">
            <Link href="/catalogo" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-rose-500/30 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Bella</span>
                <span className="text-2xl font-light text-gray-400">Store</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tu destino favorito para productos únicos que resaltan tu estilo. Perfumes, carteras, accesorios y más.
            </p>
          </div>

        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <p className="text-xs text-gray-600 text-center">
            © {new Date().getFullYear()} BellaStore. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

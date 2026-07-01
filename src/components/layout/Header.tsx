'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { cn } from '@/lib/utils';

// El inicio redirige al catálogo — solo mostramos Catálogo en la nav
const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const { getItemCount, openCart } = useCartStore();
  const { favoriteIds } = useFavoritesStore();

  // Evitar hydration mismatch con zustand/localStorage
  useEffect(() => { setMounted(true); }, []);

  const itemCount = mounted ? getItemCount() : 0;
  const favCount  = mounted ? favoriteIds.length : 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?busqueda=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-rose-100/50'
            : 'bg-white/90 backdrop-blur-sm'
        )}
      >
        {/* Barra superior — contacto por correo */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs py-1.5 text-center">
          <a
            href="mailto:contacto@bellastore.com"
            className="flex items-center justify-center gap-1.5 hover:underline transition-all"
          >
            <Mail className="w-3 h-3" />
            Escríbenos: contacto@bellastore.com
            <Sparkles className="w-3 h-3" />
          </a>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/catalogo" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                  Bella
                </span>
                <span className="text-xl lg:text-2xl font-light text-gray-600">Store</span>
              </div>
            </Link>

            {/* Navegación desktop */}
            <nav className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href === '/catalogo' && pathname === '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-sm font-semibold transition-colors relative group py-1 tracking-wide',
                      'text-gray-600 hover:text-rose-500',
                      isActive && 'text-rose-500'
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 bg-rose-400 transition-all duration-300',
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Buscador inline desktop + acciones */}
            <div className="flex items-center gap-2 lg:gap-3">

              {/* Buscador visible solo en desktop */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-56 xl:w-72 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 focus:w-80 xl:focus:w-96 transition-all duration-300 placeholder:text-gray-400"
                />
              </form>

              {/* Búsqueda móvil (ícono) */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Favoritos */}
              <Link
                href="/favoritos"
                className="relative p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                aria-label="Favoritos"
              >
                <Heart className="w-5 h-5" />
                {favCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {favCount > 9 ? '9+' : favCount}
                  </motion.span>
                )}
              </Link>

              {/* Carrito */}
              <button
                onClick={openCart}
                className="relative p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </button>

              {/* Menú hamburguesa móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                aria-label="Menú"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Barra de búsqueda expandible — solo móvil */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden lg:hidden"
              >
                <form onSubmit={handleSearch} className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      autoFocus
                      className="w-full pl-11 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      Buscar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menú móvil — solo Inicio y Catálogo */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href || (link.href === '/catalogo' && pathname === '/');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        'text-gray-700 hover:bg-rose-50 hover:text-rose-500',
                        isActive && 'bg-rose-50 text-rose-500'
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer para compensar el header fijo */}
      <div className="h-16 lg:h-20 mt-7" />
    </>
  );
}

'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductFilters, ProductSortOption, Category } from '@/types';

const SORT_OPTIONS: { value: ProductSortOption; label: string; icon: string }[] = [
  { value: 'mas_recientes', label: 'Más recientes', icon: '🕐' },
  { value: 'precio_asc',    label: 'Menor precio',  icon: '↑$' },
  { value: 'precio_desc',   label: 'Mayor precio',  icon: '↓$' },
  { value: 'mas_vendidos',  label: 'Más vendidos',  icon: '🔥' },
  { value: 'nombre_asc',    label: 'Nombre A-Z',    icon: 'Az' },
];

const TAGS: { value: string; label: string; bg: string; text: string; dot: string }[] = [
  { value: 'nuevo',       label: 'Nuevo',     bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  { value: 'oferta',      label: 'Oferta',    bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-400'    },
  { value: 'mas_vendido', label: 'Popular',   bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  { value: 'destacado',   label: 'Destacado', bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-400'  },
];

const EMOJI: Record<string, string> = {
  nuevo: '✨', oferta: '🔥', mas_vendido: '⭐', destacado: '💎',
};

interface CatalogFiltersProps {
  categories?: Category[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  totalProducts: number;
  /** En true solo renderiza la barra móvil (botón + contador), sin el panel desktop */
  mobileOnly?: boolean;
}

export default function CatalogFilters({
  categories = [],
  filters,
  onFiltersChange,
  totalProducts,
  mobileOnly = false,
}: CatalogFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sortOpen,     setSortOpen]     = useState(true);
  const [tagOpen,      setTagOpen]      = useState(true);
  const [catOpen,      setCatOpen]      = useState(true);

  const activeCount = [filters.etiqueta, filters.categoria_id].filter(Boolean).length;

  const setSort = (v: ProductSortOption) => onFiltersChange({ ...filters, orden: v });

  const toggleTag = (tag: string) =>
    onFiltersChange({
      ...filters,
      etiqueta: filters.etiqueta === tag ? undefined : (tag as ProductFilters['etiqueta']),
    });

  const toggleCategory = (id: string) =>
    onFiltersChange({
      ...filters,
      categoria_id: filters.categoria_id === id ? undefined : id,
    });

  const clearFilters = () => onFiltersChange({ orden: filters.orden });

  /* ── Sección colapsable ── */
  const Section = ({
    title,
    isOpen,
    onToggle,
    children,
  }: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full group"
        aria-expanded={isOpen}
      >
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
            isOpen ? 'rotate-0' : '-rotate-90'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ── Contenido de filtros (reutilizado en desktop y drawer) ── */
  const FiltersContent = () => (
    <div className="space-y-5">
      {/* Ordenar */}
      <Section title="Ordenar por" isOpen={sortOpen} onToggle={() => setSortOpen(v => !v)}>
        <div className="space-y-0.5">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all',
                filters.orden === opt.value
                  ? 'bg-rose-50 text-rose-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <span className="text-xs w-5 text-center opacity-60">{opt.icon}</span>
              {opt.label}
              {filters.orden === opt.value && (
                <span className="ml-auto w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Categorías — solo botón Todas */}
      <div className="border-t border-gray-100" />
      <Section title="Categoría" isOpen={catOpen} onToggle={() => setCatOpen(v => !v)}>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onFiltersChange({ ...filters, categoria_id: undefined })}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-rose-50 text-rose-600 font-semibold"
          >
            Todas
          </button>
        </div>
      </Section>

      {activeCount > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-rose-500 hover:text-rose-700 font-medium border border-rose-200 hover:border-rose-400 rounded-xl transition-all hover:bg-rose-50/50"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar filtros
          <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {activeCount}
          </span>
        </motion.button>
      )}
    </div>
  );
  /* ── Barra móvil (botón + contador) ── */
  const MobileBar = () => (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={() => setIsMobileOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-rose-300 rounded-xl text-sm font-medium text-gray-700 transition-colors shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4 text-rose-400" />
        Filtros
        {activeCount > 0 && (
          <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>
      <p className="text-sm text-gray-400">
        <span className="font-semibold text-gray-700">{totalProducts}</span>{' '}
        {totalProducts === 1 ? 'producto' : 'productos'}
      </p>
    </div>
  );

  /* ── Drawer móvil ── */
  const MobileDrawer = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                Filtros
              </h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              <FiltersContent />
            </div>

            {/* Footer CTA */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Ver {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  /* ── Render ── */

  // Cuando se llama con mobileOnly=true solo renderiza la barra y el drawer
  if (mobileOnly) {
    return (
      <>
        <MobileBar />
        <MobileDrawer />
      </>
    );
  }

  // En desktop: panel lateral fijo
  return (
    <>
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-28">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-rose-400" />
              Filtros
            </h2>
            {activeCount > 0 && (
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                {activeCount} activo{activeCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <FiltersContent />
        </div>
      </aside>
    </>
  );
}

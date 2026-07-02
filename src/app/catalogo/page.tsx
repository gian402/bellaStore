'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid3X3, List, Loader2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import ProductCard from '@/components/products/ProductCard';
import { createClient } from '@/lib/supabase/client';
import { cn, debounce } from '@/lib/utils';
import type { Product, Category, ProductFilters } from '@/types';

/* ─── Datos de ejemplo ──────────────────────────────────────────────────── */
const SAMPLE_CATEGORIES: Category[] = [
  { id: 'cat-1', nombre: 'Perfumes',   slug: 'perfumes',   orden: 1, activa: true, created_at: '' },
  { id: 'cat-2', nombre: 'Carteras',   slug: 'carteras',   orden: 2, activa: true, created_at: '' },
  { id: 'cat-3', nombre: 'Accesorios', slug: 'accesorios', orden: 3, activa: true, created_at: '' },
  { id: 'cat-4', nombre: 'Maquillaje', slug: 'maquillaje', orden: 4, activa: true, created_at: '' },
  { id: 'cat-5', nombre: 'Cuidado',    slug: 'cuidado',    orden: 5, activa: true, created_at: '' },
  { id: 'cat-6', nombre: 'Regalos',    slug: 'regalos',    orden: 6, activa: true, created_at: '' },
];

const SAMPLE_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i + 1}`,
  nombre: [
    'Perfume Floral Premium', 'Cartera Cuero Elegante', 'Set Pulseras Doradas',
    'Collar Perlas', 'Bolso Tote Moderno', 'Perfume Oriental',
    'Pañuelo de Seda', 'Anillo Plata 925', 'Cartera Mini Cadena',
    'Set Aretes Perla', 'Perfume Cítrico', 'Clutch Brillante',
  ][i],
  descripcion: 'Descripción del producto con detalles importantes.',
  precio:        [850, 1200, 350, 650, 980, 720, 280, 450, 890, 320, 760, 540][i],
  precio_oferta: i % 3 === 0 ? [680, null, 280, null, 780, null, null, 360, null, 256, 600, null][i] : null,
  categoria_id:  SAMPLE_CATEGORIES[i % 6].id,
  categoria:     SAMPLE_CATEGORIES[i % 6],
  imagenes: [],
  imagen_principal: '',
  stock:       Math.floor(Math.random() * 20) + 1,
  estado:      'disponible' as const,
  destacado:   i < 4,
  es_nuevo:    i % 3 === 0,
  en_oferta:   i % 4 === 0,
  mas_vendido: i % 5 === 0,
  etiquetas:   [],
  slug: [
    'perfume-floral', 'cartera-cuero', 'pulseras-doradas', 'collar-perlas',
    'bolso-tote', 'perfume-oriental', 'panuelo-seda', 'anillo-plata',
    'cartera-mini', 'aretes-perla', 'perfume-citrico', 'clutch-brillante',
  ][i],
  vistas:      Math.floor(Math.random() * 200),
  ventas:      Math.floor(Math.random() * 100),
  created_at:  new Date(Date.now() - i * 86400000).toISOString(),
  updated_at:  new Date().toISOString(),
}));

/* ─── Componente interno ─────────────────────────────────────────────────── */
function CatalogContent() {
  const searchParams = useSearchParams();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [viewMode,   setViewMode]   = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<ProductFilters>({
    busqueda:     searchParams.get('busqueda') ?? undefined,
    categoria_id: undefined,
    etiqueta:     (searchParams.get('tag') as ProductFilters['etiqueta']) ?? undefined,
    orden:        'mas_recientes',
  });

  /* ── Fetch productos ── */
  const fetchProducts = useCallback(async (f: ProductFilters) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      // Traer todos (disponibles Y agotados) — los agotados van al final
      let q = supabase
        .from('productos')
        .select('*, categoria:categorias(*)');

      if (f.busqueda)                   q = q.ilike('nombre', `%${f.busqueda}%`);
      if (f.categoria_id)               q = q.eq('categoria_id', f.categoria_id);
      if (f.precio_min !== undefined)   q = q.gte('precio', f.precio_min);
      if (f.precio_max !== undefined)   q = q.lte('precio', f.precio_max);
      if (f.etiqueta === 'nuevo')       q = q.eq('es_nuevo', true);
      if (f.etiqueta === 'oferta')      q = q.eq('en_oferta', true);
      if (f.etiqueta === 'mas_vendido') q = q.eq('mas_vendido', true);
      if (f.etiqueta === 'destacado')   q = q.eq('destacado', true);

      switch (f.orden) {
        case 'precio_asc':  q = q.order('precio',     { ascending: true  }); break;
        case 'precio_desc': q = q.order('precio',     { ascending: false }); break;
        case 'mas_vendidos':q = q.order('ventas',     { ascending: false }); break;
        case 'nombre_asc':  q = q.order('nombre',     { ascending: true  }); break;
        default:            q = q.order('created_at', { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;

      // Agotados siempre al final
      const all = (data as Product[]) ?? [];
      const disponibles = all.filter(p => p.estado !== 'agotado' && !p.agotado);
      const agotados    = all.filter(p => p.estado === 'agotado' || p.agotado);
      setProducts([...disponibles, ...agotados]);
    } catch {
      let sample = [...SAMPLE_PRODUCTS];
      if (f.busqueda)                   sample = sample.filter(p => p.nombre.toLowerCase().includes(f.busqueda!.toLowerCase()));
      if (f.etiqueta === 'nuevo')       sample = sample.filter(p => p.es_nuevo);
      if (f.etiqueta === 'oferta')      sample = sample.filter(p => p.en_oferta);
      if (f.etiqueta === 'mas_vendido') sample = sample.filter(p => p.mas_vendido);
      setProducts(sample);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Fetch categorías ── */
  const fetchCategories = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('categorias').select('*').eq('activa', true).order('orden');
      setCategories((data as Category[]) ?? SAMPLE_CATEGORIES);
    } catch {
      setCategories(SAMPLE_CATEGORIES);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(filters); }, [filters, fetchProducts]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">

        {/* ── Encabezado ───────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Catálogo
              </h1>
              <p className="text-sm text-gray-400 mt-0.5 hidden lg:block">
                Encuentra tu producto favorito entre nuestra colección
              </p>
            </div>
          </div>
        </div>

        {/* ── Cuerpo ───────────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* En móvil: barra de filtros arriba del grid, NO dentro del flex */}
          <div className="lg:hidden mb-4">
            <CatalogFilters
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
              totalProducts={products.length}
              mobileOnly
            />
          </div>

          {/* Flex principal — en móvil solo el grid, en desktop sidebar + grid */}
          <div className="flex gap-6 lg:gap-8 items-start">

            {/* Sidebar filtros — solo desktop */}
            <div className="hidden lg:block">
              <CatalogFilters
                categories={categories}
                filters={filters}
                onFiltersChange={setFilters}
                totalProducts={products.length}
              />
            </div>

            {/* Grid de productos */}
            <div className="flex-1 min-w-0 w-full">

              {/* Barra controles desktop */}
              <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-gray-800 text-base">{products.length}</span>{' '}
                    {products.length === 1 ? 'producto' : 'productos'}
                    {filters.etiqueta && (
                      <span className="ml-1 text-rose-400 font-medium">
                        · filtrado
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {([['grid', Grid3X3, 'Cuadrícula'], ['list', List, 'Lista']] as const).map(([mode, Icon, label]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      aria-label={label}
                      title={label}
                      className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        viewMode === mode
                          ? 'bg-white text-rose-500 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cargando */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3">
                  <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                  <p className="text-sm text-gray-400">Cargando productos…</p>
                </div>

              /* Sin resultados */
              ) : products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Sin resultados</h3>
                  <p className="text-sm text-gray-400 mb-6">Intenta con otros filtros</p>
                  <button
                    onClick={() => setFilters({ orden: 'mas_recientes' })}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Ver todos
                  </button>
                </motion.div>

              /* Grid */
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5'
                        : 'flex flex-col gap-4'
                    )}
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.04, 0.28) }}
                        className="h-full"
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {!isLoading && products.length > 0 && (
                <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400 pb-4">
                  <ShoppingBag className="w-4 h-4" />
                  Has visto todos los productos
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        </Layout>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';

interface ProductsSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function ProductsSection({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = 'Ver todos',
}: ProductsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          </motion.div>

          <div className="flex items-center gap-2">
            {/* Flechas de navegación */}
            <button
              onClick={() => scroll('left')}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-500 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-500 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="flex items-center gap-1 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors group ml-1"
              >
                {viewAllLabel}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Carrusel horizontal con scroll suave */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 scroll-smooth"
          style={{
            scrollbarWidth: 'none',         /* Firefox */
            msOverflowStyle: 'none',        /* IE/Edge */
          }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4) }}
              className="flex-none w-[220px] sm:w-[240px] md:w-[260px]"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ocultar scrollbar en webkit */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

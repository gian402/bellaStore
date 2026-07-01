'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag, ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-8 md:p-12 text-white"
        >
          {/* Decoraciones */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-widest opacity-80">
                  Oferta especial
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Hasta 40% de descuento
              </h2>
              <p className="text-white/80 text-sm">
                En perfumes, carteras y accesorios seleccionados. ¡Tiempo limitado!
              </p>
            </div>

            <Link
              href="/catalogo?tag=oferta"
              className="flex-shrink-0 flex items-center gap-2 px-7 py-3.5 bg-white text-rose-500 font-semibold rounded-2xl hover:bg-rose-50 transition-colors shadow-lg"
            >
              Ver ofertas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

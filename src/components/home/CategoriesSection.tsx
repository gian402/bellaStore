'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { icon: '🌹', name: 'Perfumes', slug: 'perfumes', color: 'from-rose-100 to-pink-100', border: 'border-rose-200' },
  { icon: '👜', name: 'Carteras', slug: 'carteras', color: 'from-amber-100 to-yellow-100', border: 'border-amber-200' },
  { icon: '💍', name: 'Accesorios', slug: 'accesorios', color: 'from-purple-100 to-violet-100', border: 'border-purple-200' },
  { icon: '✨', name: 'Maquillaje', slug: 'maquillaje', color: 'from-pink-100 to-fuchsia-100', border: 'border-pink-200' },
  { icon: '🧴', name: 'Cuidado', slug: 'cuidado', color: 'from-emerald-100 to-teal-100', border: 'border-emerald-200' },
  { icon: '🎀', name: 'Regalos', slug: 'regalos', color: 'from-red-100 to-rose-100', border: 'border-red-200' },
];

interface CategoriesSectionProps {
  title?: string;
}

export default function CategoriesSection({ title = 'Nuestras categorías' }: CategoriesSectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm">Explora todo lo que tenemos para ti</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={`/catalogo?categoria=${cat.slug}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:shadow-md transition-all duration-300 hover:-translate-y-1 group`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

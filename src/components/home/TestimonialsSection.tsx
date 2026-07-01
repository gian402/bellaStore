'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: '1',
    nombre: 'María García',
    comentario: 'Los perfumes son increíbles, la calidad es excelente y el servicio al cliente es muy amable. Definitivamente volvería a comprar.',
    calificacion: 5,
    avatar: '👩',
  },
  {
    id: '2',
    nombre: 'Ana López',
    comentario: 'Compré una cartera y quedé encantada. El producto llegó perfectamente empacado y es exactamente como se ve en las fotos.',
    calificacion: 5,
    avatar: '👩‍🦱',
  },
  {
    id: '3',
    nombre: 'Laura Martínez',
    comentario: 'Me encanta esta tienda. Siempre encuentro algo especial aquí. Los precios son muy accesibles y los productos de excelente calidad.',
    calificacion: 5,
    avatar: '👩‍🦰',
  },
  {
    id: '4',
    nombre: 'Sofía Rodríguez',
    comentario: 'El proceso de compra fue súper fácil. Me contactaron por WhatsApp y en minutos ya tenía confirmado mi pedido. ¡Excelente!',
    calificacion: 5,
    avatar: '👱‍♀️',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            Lo que dicen nuestras clientas
          </motion.h2>
          <p className="text-gray-500 text-sm">Más de 2,000 clientas satisfechas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 hover:shadow-md transition-shadow relative"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-rose-100" />

              {/* Estrellas */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.calificacion
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                "{testimonial.comentario}"
              </p>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-base">
                  {testimonial.avatar}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {testimonial.nombre}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

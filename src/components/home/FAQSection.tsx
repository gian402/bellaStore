'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    id: '1',
    pregunta: '¿Cómo realizo mi pedido?',
    respuesta:
      'Es muy sencillo: agrega los productos que deseas a tu carrito, luego ve al proceso de compra, completa tus datos y te contactaremos por WhatsApp para confirmar tu pedido.',
  },
  {
    id: '2',
    pregunta: '¿Hacen envíos a todo el país?',
    respuesta:
      'Sí, realizamos envíos a todo Honduras. El costo y tiempo de envío varía según la ubicación. Nos comunicaremos contigo por WhatsApp para coordinar los detalles del envío.',
  },
  {
    id: '3',
    pregunta: '¿Los productos son originales?',
    respuesta:
      'Todos nuestros productos son 100% originales. Trabajamos directamente con proveedores certificados para garantizar la autenticidad y calidad de cada artículo.',
  },
  {
    id: '4',
    pregunta: '¿Puedo hacer devoluciones?',
    respuesta:
      'Sí, aceptamos devoluciones dentro de los 7 días posteriores a la entrega si el producto presenta defectos o no corresponde a lo descrito. Contáctanos por WhatsApp para gestionar tu caso.',
  },
  {
    id: '5',
    pregunta: '¿Cuáles son los métodos de pago?',
    respuesta:
      'Aceptamos pago en efectivo, transferencia bancaria y pago móvil (BANHCAFE, Banco Atlántida, etc.). Los detalles se coordinan por WhatsApp al confirmar el pedido.',
  },
  {
    id: '6',
    pregunta: '¿Tienen tienda física?',
    respuesta:
      'Por el momento somos una tienda 100% en línea. Esto nos permite ofrecerte los mejores precios y una experiencia de compra cómoda desde tu hogar.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            Preguntas frecuentes
          </motion.h2>
          <p className="text-gray-500 text-sm">Todo lo que necesitas saber</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-100 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-rose-50/50 transition-colors"
              >
                <span className="font-semibold text-gray-800 text-sm pr-4">
                  {faq.pregunta}
                </span>
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-rose-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                      <div className="pt-3">{faq.respuesta}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

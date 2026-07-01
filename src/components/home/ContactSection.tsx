'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, Sparkles } from 'lucide-react';

export default function ContactSection() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) return;
    setSending(true);
    // Simula envío — en producción conectar con un servicio de email (Resend, EmailJS, etc.)
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg mb-5">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¿Tienes alguna pregunta?
            </h2>
            <p className="text-gray-500 text-sm">
              Escríbenos y te respondemos lo antes posible.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto bg-white rounded-3xl shadow-sm border border-rose-100 p-8"
        >
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">¡Mensaje enviado!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Gracias por contactarnos. Te responderemos pronto en tu correo.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ nombre: '', email: '', mensaje: '' }); }}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tu nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="¿Cómo te llamas?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tu correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mensaje
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 pt-1">
                También puedes escribirnos directo a{' '}
                <a
                  href="mailto:contacto@bellastore.com"
                  className="text-rose-400 hover:text-rose-500 transition-colors font-medium"
                >
                  contacto@bellastore.com
                </a>
              </p>
            </form>
          )}
        </motion.div>

        {/* Decoraciones */}
        <div className="flex justify-center mt-8 gap-6">
          {[
            { icon: '📦', label: 'Envíos coordinados' },
            { icon: '✅', label: 'Productos originales' },
            { icon: '🔄', label: 'Devoluciones' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

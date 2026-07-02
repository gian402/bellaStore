'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Send, ArrowLeft, CheckCircle, User, Phone, Mail, MapPin, StickyNote } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn } from '@/lib/utils';

const CONTACT_EMAIL = 'hola@bellastore.com';

const checkoutSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido (mínimo 2 caracteres)'),
  telefono: z.string().min(8, 'Teléfono válido requerido').max(15, 'Teléfono demasiado largo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().min(5, 'Dirección requerida (mínimo 5 caracteres)').optional().or(z.literal('')),
  notas: z.string().max(300, 'Máximo 300 caracteres').optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const [step, setStep] = useState<'datos' | 'confirmacion'>('datos');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const total = getTotal();
  const itemCount = getItemCount();
  const formData = watch();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-400 mb-6">Agrega productos para continuar</p>
            <Link
              href="/catalogo"
              className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const onSubmit = (data: CheckoutFormData) => {
    setStep('confirmacion');
  };

  const handleEmailOrder = async () => {
    // 1. Guardar pedido en la base de datos
    try {
      await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: formData.nombre,
          cliente_telefono: formData.telefono,
          cliente_email: formData.email || null,
          cliente_direccion: formData.direccion || null,
          notas: formData.notas || null,
          items: items.map(item => ({
            producto_id: item.producto.id,
            nombre_producto: item.producto.nombre,
            precio: item.precio_unitario,
            cantidad: item.cantidad,
            subtotal: item.precio_unitario * item.cantidad,
            imagen: item.producto.imagen_principal,
          })),
        }),
      });
    } catch {
      // Continuar aunque falle el guardado
    }

    // 2. Abrir WhatsApp con el resumen del pedido
    const whatsappNumber = '51999999999'; // Cambia por tu número de WhatsApp
    const message = encodeURIComponent(
      `Hola, quiero hacer un pedido:\n\n` +
      `📦 PRODUCTOS:\n` +
      items.map(item => `• ${item.producto.nombre} x${item.cantidad} — ${formatPrice(item.precio_unitario * item.cantidad)}`).join('\n') +
      `\n\n💰 Total: ${formatPrice(total)}\n\n` +
      `📋 DATOS DE CONTACTO:\n` +
      `Nombre: ${formData.nombre}\n` +
      `Teléfono: ${formData.telefono}\n` +
      (formData.email     ? `Email: ${formData.email}\n`        : '') +
      (formData.direccion ? `Dirección: ${formData.direccion}\n` : '') +
      (formData.notas     ? `Notas: ${formData.notas}\n`         : '')
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    clearCart();
    router.push('/');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/catalogo"
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Finalizar compra</h1>
              <p className="text-sm text-gray-400">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'} · {formatPrice(total)}
              </p>
            </div>
          </div>

          {/* Pasos */}
          <div className="flex items-center gap-3 mb-8">
            {['datos', 'confirmacion'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    step === s || (s === 'datos' && step === 'confirmacion')
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  )}
                >
                  {s === 'datos' && step === 'confirmacion' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    step === s ? 'text-gray-800' : 'text-gray-400'
                  )}
                >
                  {s === 'datos' ? 'Tus datos' : 'Confirmación'}
                </span>
                {i === 0 && (
                  <div className="w-12 h-0.5 bg-gray-200 mx-1" />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario / Confirmación */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 'datos' ? (
                  <motion.div
                    key="datos"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl border border-gray-100 p-6"
                  >
                    <h2 className="font-bold text-gray-800 mb-6">Datos de contacto</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Nombre */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <User className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Nombre completo *
                        </label>
                        <input
                          {...register('nombre')}
                          placeholder="Tu nombre completo"
                          className={cn(
                            'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                            errors.nombre
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-rose-200 focus:border-rose-300'
                          )}
                        />
                        {errors.nombre && (
                          <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
                        )}
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          {...register('telefono')}
                          type="tel"
                          placeholder="+51 000 000 000"
                          className={cn(
                            'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                            errors.telefono
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-rose-200 focus:border-rose-300'
                          )}
                        />
                        {errors.telefono && (
                          <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Email (opcional)
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="tu@email.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
                        />
                      </div>

                      {/* Dirección */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Dirección de entrega (opcional)
                        </label>
                        <input
                          {...register('direccion')}
                          placeholder="Ciudad, Colonia, Calle, Casa #"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
                        />
                      </div>

                      {/* Notas */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <StickyNote className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          Notas adicionales (opcional)
                        </label>
                        <textarea
                          {...register('notas')}
                          rows={3}
                          placeholder="Instrucciones especiales para tu pedido..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-300"
                      >
                        Continuar →
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirmacion"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-2xl border border-gray-100 p-6"
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-9 h-9 text-green-500" />
                      </div>
                      <h2 className="font-bold text-gray-800 text-lg">¡Todo listo!</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Al dar clic en el botón se abrirá tu correo con el pedido listo para enviar
                      </p>
                    </div>

                    {/* Resumen de datos */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2.5 text-sm">
                      <h3 className="font-semibold text-gray-700 mb-3">Tus datos:</h3>
                      <div className="flex gap-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{formData.nombre}</span>
                      </div>
                      <div className="flex gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{formData.telefono}</span>
                      </div>
                      {formData.email && (
                        <div className="flex gap-2">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{formData.email}</span>
                        </div>
                      )}
                      {formData.direccion && (
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{formData.direccion}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleEmailOrder}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 text-base"
                      >
                        <Send className="w-5 h-5" />
                        Enviar pedido por correo
                      </button>

                      <button
                        onClick={() => setStep('datos')}
                        className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Editar datos
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-4">
                      Te contactaremos para confirmar disponibilidad y coordinar el envío
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resumen del pedido */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                <h3 className="font-bold text-gray-800 mb-4">Resumen del pedido</h3>

                <div className="space-y-2.5 max-h-72 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                      {/* Cantidad badge + nombre */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 bg-rose-100 text-rose-600 text-[11px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {item.cantidad}
                        </span>
                        <p className="text-sm font-medium text-gray-700 leading-tight">
                          {item.producto.nombre}
                        </p>
                      </div>
                      {/* Precio */}
                      <p className="text-sm font-semibold text-rose-500 flex-shrink-0">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Envío</span>
                    <span className="text-emerald-500">Por coordinar</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 pt-2">
                    <span>Total</span>
                    <span className="text-rose-500 text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

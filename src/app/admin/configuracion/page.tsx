'use client';

import { useState } from 'react';
import {
  Store,
  Phone,
  MapPin,
  MessageCircle,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle,
  Globe,
  Mail,
  Image as ImageIcon,
  Package,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface StoreConfig {
  nombre: string;
  descripcion: string;
  email: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  ciudad: string;
  pais: string;
  moneda: string;
  zona_horaria: string;
  envio_gratis_minimo: number;
  costo_envio: number;
  stock_alerta_minimo: number;
  pedidos_whatsapp: boolean;
  notificaciones_stock: boolean;
  notificaciones_pedidos: boolean;
  modo_mantenimiento: boolean;
}

const DEFAULT_CONFIG: StoreConfig = {
  nombre: 'BellaStore',
  descripcion: 'Tienda online de perfumes, carteras y accesorios para mujer',
  email: 'info@bellastore.com',
  telefono: '+504 9999-0000',
  whatsapp: '50499990000',
  direccion: 'Tegucigalpa, Honduras',
  ciudad: 'Tegucigalpa',
  pais: 'Honduras',
  moneda: 'HNL',
  zona_horaria: 'America/Tegucigalpa',
  envio_gratis_minimo: 1000,
  costo_envio: 150,
  stock_alerta_minimo: 5,
  pedidos_whatsapp: true,
  notificaciones_stock: true,
  notificaciones_pedidos: true,
  modo_mantenimiento: false,
};

const SECTIONS = [
  { id: 'tienda', label: 'Tienda', icon: Store },
  { id: 'contacto', label: 'Contacto', icon: Phone },
  { id: 'envios', label: 'Envíos', icon: Package },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
];

export default function AdminConfigPage() {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('tienda');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: keyof StoreConfig, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Aquí iría la lógica de guardado en Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSavedSuccess(true);
      toast.success('Configuración guardada correctamente', {
        icon: '✅',
        style: { borderRadius: '12px' },
      });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      toast.error('Error al guardar la configuración', {
        style: { borderRadius: '12px' },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    icon: Icon,
    hint,
  }: {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    icon?: React.ComponentType<{ className?: string }>;
    hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all',
            Icon ? 'pl-10 pr-4' : 'px-4'
          )}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const ToggleField = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description?: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          value ? 'bg-rose-500' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            value && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ajusta los datos y preferencias de tu tienda
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-rose-200"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : savedSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {savedSuccess ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menú de secciones */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0',
                  activeSection === section.id
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            {/* Sección: Tienda */}
            {activeSection === 'tienda' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                    <Store className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Datos de la tienda</h2>
                    <p className="text-xs text-gray-400">Información pública de tu negocio</p>
                  </div>
                </div>

                <InputField
                  label="Nombre de la tienda"
                  value={config.nombre}
                  onChange={(v) => handleChange('nombre', v)}
                  placeholder="BellaStore"
                  icon={Store}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={config.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    rows={3}
                    placeholder="Descripción breve de tu tienda..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Moneda
                    </label>
                    <select
                      value={config.moneda}
                      onChange={(e) => handleChange('moneda', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                    >
                      <option value="HNL">Lempiras (HNL)</option>
                      <option value="USD">Dólares (USD)</option>
                      <option value="MXN">Pesos MX (MXN)</option>
                      <option value="GTQ">Quetzales (GTQ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      País
                    </label>
                    <select
                      value={config.pais}
                      onChange={(e) => handleChange('pais', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                    >
                      <option value="Honduras">Honduras</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="México">México</option>
                      <option value="El Salvador">El Salvador</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">Logo e identidad visual</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-rose-200 transition-colors cursor-pointer">
                    <Palette className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">
                      Arrastra o haz click para subir tu logo
                    </p>
                    <p className="text-xs text-gray-300 mt-1">PNG, JPG, SVG — máx 2MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Contacto */}
            {activeSection === 'contacto' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Phone className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Información de contacto</h2>
                    <p className="text-xs text-gray-400">Datos para que clientes te contacten</p>
                  </div>
                </div>

                <InputField
                  label="Email de contacto"
                  value={config.email}
                  onChange={(v) => handleChange('email', v)}
                  type="email"
                  placeholder="info@bellastore.com"
                  icon={Mail}
                />
                <InputField
                  label="Teléfono"
                  value={config.telefono}
                  onChange={(v) => handleChange('telefono', v)}
                  placeholder="+504 9999-0000"
                  icon={Phone}
                />
                <InputField
                  label="WhatsApp (solo números)"
                  value={config.whatsapp}
                  onChange={(v) => handleChange('whatsapp', v)}
                  placeholder="50499990000"
                  icon={MessageCircle}
                  hint="Incluye el código de país sin + (ej: 50499990000)"
                />
                <InputField
                  label="Dirección"
                  value={config.direccion}
                  onChange={(v) => handleChange('direccion', v)}
                  placeholder="Colonia, Ciudad"
                  icon={MapPin}
                />
                <InputField
                  label="Ciudad"
                  value={config.ciudad}
                  onChange={(v) => handleChange('ciudad', v)}
                  placeholder="Tegucigalpa"
                  icon={Globe}
                />

                {/* Preview del link de WhatsApp */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    Vista previa del enlace de WhatsApp:
                  </p>
                  <p className="text-xs text-green-600 break-all">
                    https://wa.me/{config.whatsapp}?text=Hola,%20me%20interesa%20comprar...
                  </p>
                </div>
              </div>
            )}

            {/* Sección: Envíos */}
            {activeSection === 'envios' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Package className="w-4.5 h-4.5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Configuración de envíos</h2>
                    <p className="text-xs text-gray-400">Costos y alertas de inventario</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Costo de envío (L)"
                    value={config.costo_envio}
                    onChange={(v) => handleChange('costo_envio', Number(v))}
                    type="number"
                    placeholder="150"
                    hint="Costo estándar de envío"
                  />
                  <InputField
                    label="Mínimo para envío gratis (L)"
                    value={config.envio_gratis_minimo}
                    onChange={(v) => handleChange('envio_gratis_minimo', Number(v))}
                    type="number"
                    placeholder="1000"
                    hint="Compras mayores a este monto tienen envío gratis"
                  />
                </div>

                <InputField
                  label="Alerta de stock mínimo"
                  value={config.stock_alerta_minimo}
                  onChange={(v) => handleChange('stock_alerta_minimo', Number(v))}
                  type="number"
                  placeholder="5"
                  hint="Recibirás alertas cuando el stock sea menor a este número"
                />

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700">
                    <strong>Nota:</strong> Los pedidos se coordinan directamente por WhatsApp.
                    El costo de envío puede variar según la ubicación del cliente.
                  </p>
                </div>
              </div>
            )}

            {/* Sección: Notificaciones */}
            {activeSection === 'notificaciones' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Bell className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Notificaciones</h2>
                    <p className="text-xs text-gray-400">Elige qué alertas quieres recibir</p>
                  </div>
                </div>

                <ToggleField
                  label="Pedidos por WhatsApp"
                  description="Los clientes podrán completar pedidos enviando mensaje de WhatsApp automático"
                  value={config.pedidos_whatsapp}
                  onChange={(v) => handleChange('pedidos_whatsapp', v)}
                />
                <ToggleField
                  label="Alertas de stock bajo"
                  description="Recibir notificación cuando un producto llegue al stock mínimo configurado"
                  value={config.notificaciones_stock}
                  onChange={(v) => handleChange('notificaciones_stock', v)}
                />
                <ToggleField
                  label="Notificaciones de nuevos pedidos"
                  description="Recibir alerta cuando llegue un pedido nuevo en la plataforma"
                  value={config.notificaciones_pedidos}
                  onChange={(v) => handleChange('notificaciones_pedidos', v)}
                />
              </div>
            )}

            {/* Sección: Seguridad */}
            {activeSection === 'seguridad' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                    <Shield className="w-4.5 h-4.5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Seguridad y acceso</h2>
                    <p className="text-xs text-gray-400">Controla el acceso a tu tienda</p>
                  </div>
                </div>

                <ToggleField
                  label="Modo mantenimiento"
                  description="Deshabilita temporalmente la tienda para clientes. Solo administradores podrán acceder."
                  value={config.modo_mantenimiento}
                  onChange={(v) => handleChange('modo_mantenimiento', v)}
                />

                {config.modo_mantenimiento && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                  >
                    <p className="text-sm font-semibold text-amber-800">⚠️ Modo mantenimiento activo</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Los clientes verán una página de mantenimiento. Solo administradores pueden
                      acceder a la tienda.
                    </p>
                  </motion.div>
                )}

                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Estado de seguridad</p>
                  {[
                    { label: 'Autenticación Supabase', ok: true },
                    { label: 'Row Level Security (RLS)', ok: true },
                    { label: 'HTTPS habilitado', ok: true },
                    { label: 'Variables de entorno protegidas', ok: true },
                    { label: 'Validación de formularios', ok: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <CheckCircle
                        className={cn(
                          'w-4 h-4',
                          item.ok ? 'text-emerald-500' : 'text-gray-300'
                        )}
                      />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="border border-red-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-600 mb-2">Zona de peligro</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Estas acciones son irreversibles. Procede con mucho cuidado.
                  </p>
                  <button
                    onClick={() =>
                      toast.error(
                        'Para eliminar la cuenta contacta al soporte técnico',
                        { style: { borderRadius: '12px' } }
                      )
                    }
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Solicitar eliminación de cuenta
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

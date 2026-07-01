import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import type { Order, Product } from '@/types';

const ORDER_STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  en_proceso: { label: 'En proceso', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: XCircle },
};

// Datos de ejemplo para el dashboard
const SAMPLE_STATS = {
  total_productos: 48,
  productos_agotados: 5,
  total_pedidos: 127,
  pedidos_pendientes: 8,
  total_ventas: 45680,
};

async function getDashboardData() {
  try {
    const supabase = await createClient();
    const [productos, pedidos] = await Promise.all([
      supabase.from('productos').select('id, estado, es_nuevo, mas_vendido, nombre, precio').limit(100),
      supabase.from('pedidos').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    const prods = (productos.data as Product[]) ?? [];
    const orders = (pedidos.data as Order[]) ?? [];

    return {
      total_productos: prods.length,
      productos_agotados: prods.filter((p) => p.estado === 'agotado').length,
      productos_nuevos: prods.filter((p) => p.es_nuevo).length,
      total_pedidos: orders.length,
      pedidos_pendientes: orders.filter((o) => o.estado === 'pendiente').length,
      total_ventas: orders
        .filter((o) => o.estado === 'entregado')
        .reduce((sum, o) => sum + o.total, 0),
      pedidos_recientes: orders.slice(0, 5),
      productos_top: prods
        .sort((a, b) => (b.ventas ?? 0) - (a.ventas ?? 0))
        .slice(0, 5),
    };
  } catch {
    return {
      ...SAMPLE_STATS,
      productos_nuevos: 12,
      pedidos_recientes: [],
      productos_top: [],
    };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const STATS_CARDS = [
    {
      title: 'Total productos',
      value: data.total_productos,
      icon: Package,
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
      href: '/admin/productos',
    },
    {
      title: 'Total pedidos',
      value: data.total_pedidos,
      icon: ShoppingCart,
      color: 'bg-rose-50',
      iconColor: 'text-rose-500',
      href: '/admin/pedidos',
    },
    {
      title: 'Total ventas',
      value: formatPrice(data.total_ventas),
      icon: DollarSign,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      href: '/admin/pedidos',
    },
    {
      title: 'Productos agotados',
      value: data.productos_agotados,
      icon: AlertTriangle,
      color: data.productos_agotados > 0 ? 'bg-amber-50' : 'bg-gray-50',
      iconColor: data.productos_agotados > 0 ? 'text-amber-500' : 'text-gray-400',
      href: '/admin/productos?estado=agotado',
      alert: data.productos_agotados > 0,
    },
  ];

  return (
    <div>
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen general de tu tienda
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              {card.alert && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos recientes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">Pedidos recientes</h2>
            <Link
              href="/admin/pedidos"
              className="text-xs text-rose-500 hover:text-rose-600 font-medium"
            >
              Ver todos →
            </Link>
          </div>

          {data.pedidos_recientes && data.pedidos_recientes.length > 0 ? (
            <div className="space-y-3">
              {(data.pedidos_recientes as Order[]).map((order) => {
                const statusConfig =
                  ORDER_STATUS_CONFIG[order.estado] ?? ORDER_STATUS_CONFIG.pendiente;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {order.numero_pedido}
                      </p>
                      <p className="text-xs text-gray-400">{order.cliente_nombre}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-800">
                        {formatPrice(order.total)}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No hay pedidos aún</p>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-5">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/productos/nuevo', label: 'Nuevo producto', icon: Package, color: 'bg-rose-50 text-rose-500 hover:bg-rose-100' },
              { href: '/admin/pedidos', label: 'Ver pedidos', icon: ShoppingCart, color: 'bg-blue-50 text-blue-500 hover:bg-blue-100' },
              { href: '/admin/categorias', label: 'Categorías', icon: Star, color: 'bg-purple-50 text-purple-500 hover:bg-purple-100' },
              { href: '/admin/productos?tag=agotado', label: 'Stock bajo', icon: AlertTriangle, color: 'bg-amber-50 text-amber-500 hover:bg-amber-100' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Alertas */}
          {data.productos_agotados > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-medium">
                  {data.productos_agotados} productos agotados necesitan atención
                </p>
              </div>
            </div>
          )}
          {data.pedidos_pendientes > 0 && (
            <div className="mt-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 text-rose-700">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-medium">
                  {data.pedidos_pendientes} pedidos pendientes de confirmación
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

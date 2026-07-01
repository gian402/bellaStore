'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, CheckCircle, Truck, XCircle, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'text-blue-700', bg: 'bg-blue-100', icon: CheckCircle },
  en_proceso: { label: 'En proceso', color: 'text-purple-700', bg: 'bg-purple-100', icon: Package },
  entregado: { label: 'Entregado', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: Truck },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
};

const SAMPLE_ORDERS: Order[] = Array.from({ length: 8 }, (_, i) => ({
  id: `order-${i + 1}`,
  numero_pedido: `ORD-260${i + 1}-${String.fromCharCode(65 + i)}${i + 1}`,
  cliente_nombre: ['María García', 'Ana López', 'Laura Martínez', 'Sofía Rodríguez', 'Carmen Díaz', 'Elena Flores', 'Patricia Vargas', 'Lucía Hernández'][i],
  cliente_telefono: `+504 9${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
  cliente_email: undefined,
  cliente_direccion: 'Tegucigalpa, Honduras',
  items: [
    { producto_id: '1', nombre_producto: 'Perfume Floral', precio: 850, cantidad: 1, subtotal: 850 },
    { producto_id: '2', nombre_producto: 'Cartera Mini', precio: 650, cantidad: 1, subtotal: 650 },
  ],
  subtotal: 1500,
  total: 1500,
  estado: (['pendiente', 'confirmado', 'en_proceso', 'entregado', 'cancelado', 'pendiente', 'confirmado', 'entregado'][i] as OrderStatus),
  notas: i % 3 === 0 ? 'Por favor empacar bien' : undefined,
  created_at: new Date(Date.now() - i * 3600000 * 8).toISOString(),
  updated_at: new Date().toISOString(),
}));

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data as Order[]) ?? []);
    } catch {
      setOrders(SAMPLE_ORDERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
      o.numero_pedido.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || o.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, estado: newStatus } : null);
      }
      toast.success('Estado actualizado', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Error al actualizar estado', { style: { borderRadius: '12px' } });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} pedidos en total</p>
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['todos', ...Object.keys(STATUS_CONFIG)] as (OrderStatus | 'todos')[]).map((status) => {
          const config = status === 'todos' ? null : STATUS_CONFIG[status];
          const count = status === 'todos'
            ? orders.length
            : orders.filter((o) => o.estado === status).length;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                statusFilter === status
                  ? status === 'todos'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : `${config?.bg} ${config?.color} border-current`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              )}
            >
              {status === 'todos' ? 'Todos' : config?.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente o número de pedido..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white transition-all"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">No hay pedidos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Pedido', 'Cliente', 'Total', 'Estado', 'Fecha', 'Acción'].map((h) => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => {
                  const status = STATUS_CONFIG[order.estado];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-4 pl-5">
                        <p className="text-sm font-mono font-semibold text-gray-700">
                          {order.numero_pedido}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-700">{order.cliente_nombre}</p>
                        <p className="text-xs text-gray-400">{order.cliente_telefono}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-gray-800">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', status.bg, status.color)}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.estado}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, e.target.value as OrderStatus);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                        >
                          {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                            <option key={value} value={value}>{config.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle pedido */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800">Detalle del pedido</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Info del pedido */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Número:</span>
                  <span className="font-mono font-bold text-gray-800">{selectedOrder.numero_pedido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-medium text-gray-700">{selectedOrder.cliente_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="text-gray-700">{selectedOrder.cliente_telefono}</span>
                </div>
                {selectedOrder.cliente_direccion && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dirección:</span>
                    <span className="text-gray-700 text-right ml-4">{selectedOrder.cliente_direccion}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha:</span>
                  <span className="text-gray-700">{formatDate(selectedOrder.created_at)}</span>
                </div>
              </div>

              {/* Productos */}
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Productos:</h3>
              <div className="space-y-2 mb-4">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.nombre_producto}</p>
                      <p className="text-xs text-gray-400">Cantidad: {item.cantidad}</p>
                    </div>
                    <span className="text-sm font-bold text-rose-500">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 pt-3">
                <span>Total:</span>
                <span className="text-rose-500 text-lg">{formatPrice(selectedOrder.total)}</span>
              </div>

              {/* Cambiar estado */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Cambiar estado:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <button
                      key={value}
                      onClick={() => handleStatusChange(selectedOrder.id, value as OrderStatus)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
                        selectedOrder.estado === value
                          ? `${config.bg} ${config.color} border-current shadow-sm`
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <config.icon className="w-3.5 h-3.5" />
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

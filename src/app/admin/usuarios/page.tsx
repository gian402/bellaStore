'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { UserProfile } from '@/types';

const SAMPLE_USERS: UserProfile[] = [
  {
    id: '1',
    nombre: 'Administradora Principal',
    email: 'admin@bellastore.com',
    rol: 'admin',
    telefono: '+504 9999-0000',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: '2',
    nombre: 'María García',
    email: 'maria@example.com',
    rol: 'cliente',
    telefono: '+504 8888-1111',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '3',
    nombre: 'Laura Martínez',
    email: 'laura@example.com',
    rol: 'cliente',
    telefono: '+504 7777-2222',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: '4',
    nombre: 'Andrea López',
    email: 'andrea@example.com',
    rol: 'cliente',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const ROLE_CONFIG = {
  admin: {
    label: 'Administradora',
    color: 'bg-rose-100 text-rose-700',
    icon: Shield,
  },
  cliente: {
    label: 'Cliente',
    color: 'bg-blue-100 text-blue-700',
    icon: UserCheck,
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | 'admin' | 'cliente'>('todos');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as UserProfile[]) ?? SAMPLE_USERS);
    } catch {
      setUsers(SAMPLE_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'cliente') => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('usuarios')
        .update({ rol: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
      );
      toast.success(
        newRole === 'admin'
          ? 'Usuario promovido a administrador'
          : 'Permisos de administrador removidos',
        { style: { borderRadius: '12px' } }
      );
    } catch {
      toast.error('Error al cambiar el rol', { style: { borderRadius: '12px' } });
    } finally {
      setOpenMenuId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'todos' || u.rol === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter((u) => u.rol === 'admin').length;
  const clientCount = users.filter((u) => u.rol === 'cliente').length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} usuarios registrados
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total usuarios', value: users.length, icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
          { label: 'Administradoras', value: adminCount, icon: Shield, color: 'bg-rose-50', iconColor: 'text-rose-500' },
          { label: 'Clientes', value: clientCount, icon: UserCheck, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          />
        </div>
        <div className="flex gap-2">
          {(['todos', 'admin', 'cliente'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize',
                roleFilter === role
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {role === 'todos' ? 'Todos' : role === 'admin' ? 'Admins' : 'Clientes'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No se encontraron usuarios</p>
            <p className="text-sm mt-1">Intenta ajustar los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Teléfono
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Registrado
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((user) => {
                    const roleConfig = ROLE_CONFIG[user.rol];
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Usuario */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-rose-700">
                                {user.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{user.nombre}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Teléfono */}
                        <td className="py-4 px-5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">
                            {user.telefono ?? '—'}
                          </span>
                        </td>

                        {/* Rol */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${roleConfig.color}`}
                          >
                            <roleConfig.icon className="w-3.5 h-3.5" />
                            {roleConfig.label}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td className="py-4 px-5 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-5 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenMenuId(openMenuId === user.id ? null : user.id)
                              }
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {openMenuId === user.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden"
                                >
                                  {user.rol === 'cliente' ? (
                                    <button
                                      onClick={() => handleChangeRole(user.id, 'admin')}
                                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                    >
                                      <Shield className="w-4 h-4" />
                                      Hacer administradora
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleChangeRole(user.id, 'cliente')}
                                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                    >
                                      <ShieldOff className="w-4 h-4" />
                                      Quitar permisos admin
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setOpenMenuId(null)}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-100"
                                  >
                                    <UserX className="w-4 h-4" />
                                    Cancelar
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota de seguridad */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Nota de seguridad</p>
            <p className="text-xs text-amber-600 mt-1">
              Solo otorga permisos de administradora a personas de absoluta confianza.
              Los administradores tienen acceso completo al panel de control y pueden
              gestionar productos, pedidos y otros usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

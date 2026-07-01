'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Tag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { generateSlug, cn } from '@/lib/utils';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  descripcion: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const SAMPLE_CATEGORIES: Category[] = [
  { id: 'cat-1', nombre: 'Perfumes', descripcion: 'Fragancias para mujer y hombre', slug: 'perfumes', orden: 1, activa: true, created_at: new Date().toISOString() },
  { id: 'cat-2', nombre: 'Carteras', descripcion: 'Bolsos y carteras de moda', slug: 'carteras', orden: 2, activa: true, created_at: new Date().toISOString() },
  { id: 'cat-3', nombre: 'Accesorios', descripcion: 'Joyería y accesorios elegantes', slug: 'accesorios', orden: 3, activa: true, created_at: new Date().toISOString() },
  { id: 'cat-4', nombre: 'Maquillaje', descripcion: 'Cosméticos y maquillaje premium', slug: 'maquillaje', orden: 4, activa: true, created_at: new Date().toISOString() },
  { id: 'cat-5', nombre: 'Cuidado', descripcion: 'Productos para el cuidado personal', slug: 'cuidado', orden: 5, activa: true, created_at: new Date().toISOString() },
];

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const fetchCategories = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('categorias').select('*').order('orden');
      if (error) throw error;
      setCategories((data as Category[]) ?? []);
    } catch {
      setCategories(SAMPLE_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    reset({ nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    reset({ nombre: cat.nombre, descripcion: cat.descripcion ?? '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const supabase = createClient();
      if (editingCategory) {
        const { error } = await supabase
          .from('categorias')
          .update({ nombre: data.nombre, descripcion: data.descripcion, slug: generateSlug(data.nombre) })
          .eq('id', editingCategory.id);
        if (error) throw error;
        setCategories((prev) =>
          prev.map((c) => c.id === editingCategory.id ? { ...c, ...data, slug: generateSlug(data.nombre) } : c)
        );
        toast.success('Categoría actualizada', { style: { borderRadius: '12px' } });
      } else {
        const newCat = {
          nombre: data.nombre,
          descripcion: data.descripcion,
          slug: generateSlug(data.nombre),
          orden: categories.length + 1,
          activa: true,
        };
        const { data: inserted, error } = await supabase.from('categorias').insert(newCat).select().single();
        if (error) throw error;
        setCategories((prev) => [...prev, inserted as Category]);
        toast.success('Categoría creada', { style: { borderRadius: '12px' } });
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Error al guardar categoría. Verifica Supabase.', { style: { borderRadius: '12px' } });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Categoría eliminada', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Error al eliminar', { style: { borderRadius: '12px' } });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categorías</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cat.nombre}</h3>
                    <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {cat.descripcion && (
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">{cat.descripcion}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  cat.activa ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                )}>
                  {cat.activa ? 'Activa' : 'Inactiva'}
                </span>
                <span className="text-xs text-gray-400">Orden: {cat.orden}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-full max-w-md shadow-2xl"
            >
              <h2 className="font-bold text-gray-800 mb-5">
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                  <input
                    {...register('nombre')}
                    placeholder="Ej: Perfumes"
                    className={cn(
                      'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                      errors.nombre ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-rose-200'
                    )}
                  />
                  {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                  <textarea
                    {...register('descripcion')}
                    rows={2}
                    placeholder="Descripción de la categoría..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
                  >
                    {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmar eliminar */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-full max-w-sm shadow-2xl"
            >
              <h3 className="font-bold text-gray-800 text-center mb-2">¿Eliminar categoría?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Los productos de esta categoría no serán eliminados.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Eliminar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

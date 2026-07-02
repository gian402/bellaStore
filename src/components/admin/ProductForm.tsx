'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload, X, ArrowLeft, Save, Loader2,
} from 'lucide-react';
import { generateSlug, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Category, Product, ProductFormData } from '@/types';
import toast from 'react-hot-toast';
import ColorPicker from '@/components/admin/ColorPicker';

const productSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido (mín. 2 caracteres)'),
  descripcion: z.string().min(10, 'Descripción requerida (mín. 10 caracteres)'),
  precio: z.number({ error: 'Precio requerido' }).positive('El precio debe ser positivo'),
  precio_oferta: z.number().positive().optional().nullable(),
  categoria_id: z.string().min(1, 'Selecciona una categoría'),
  stock: z.number({ error: 'Stock requerido' }).int().min(0),
  color: z.string().optional().nullable(),
  agotado: z.boolean(),
  costo_pedido: z.number().positive().optional().nullable(),
  tiempo_llegada: z.string().optional().nullable(),
  destacado: z.boolean(),
  es_nuevo: z.boolean(),
  en_oferta: z.boolean(),
  mas_vendido: z.boolean(),
  etiquetas: z.array(z.string()),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Categorías de ejemplo usadas solo si Supabase no responde
const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-1', nombre: 'Perfumes', slug: 'perfumes', orden: 1, activa: true, created_at: '' },
  { id: 'cat-2', nombre: 'Carteras', slug: 'carteras', orden: 2, activa: true, created_at: '' },
  { id: 'cat-3', nombre: 'Accesorios', slug: 'accesorios', orden: 3, activa: true, created_at: '' },
  { id: 'cat-4', nombre: 'Maquillaje', slug: 'maquillaje', orden: 4, activa: true, created_at: '' },
  { id: 'cat-5', nombre: 'Cuidado', slug: 'cuidado', orden: 5, activa: true, created_at: '' },
];

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData>;
  existingImages?: string[];
}

export default function ProductForm({
  productId,
  initialData,
  existingImages = [],
}: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!productId);
  const [images, setImages] = useState<string[]>(existingImages);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colorHex, setColorHex] = useState<string>('#000000');

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: 0,
      precio_oferta: null,
      categoria_id: '',
      stock: 0,
      color: '',
      agotado: false,
      costo_pedido: null,
      tiempo_llegada: '',
      destacado: false,
      es_nuevo: true,
      en_oferta: false,
      mas_vendido: false,
      etiquetas: [] as string[],
      ...(initialData as Partial<ProductFormValues>),
    },
  });

  // Cargar categorías reales desde Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .eq('activa', true)
          .order('orden');
        if (error) throw error;
        setCategories((data as Category[]).length > 0 ? (data as Category[]) : FALLBACK_CATEGORIES);
      } catch {
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  // Si es edición, cargar los datos actuales del producto
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setIsLoadingData(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', productId)
          .single();
        if (error || !data) throw error ?? new Error('Producto no encontrado');
        const p = data as Product;
        // El color se guarda como "Nombre|#HEX", parseamos el hex si existe
        const colorParts = p.color ? p.color.split('|') : [];
        const savedHex = colorParts[1] ?? '#000000';
        if (colorParts[1]) setColorHex(savedHex);
        reset({
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          precio_oferta: p.precio_oferta ?? null,
          categoria_id: p.categoria_id,
          stock: p.stock,
          color: colorParts[0] ?? '',
          agotado: p.agotado ?? false,
          costo_pedido: p.costo_pedido ?? null,
          tiempo_llegada: p.tiempo_llegada ?? '',
          destacado: p.destacado,
          es_nuevo: p.es_nuevo,
          en_oferta: p.en_oferta,
          mas_vendido: p.mas_vendido,
          etiquetas: p.etiquetas ?? [],
        });
        // Pre-cargar imágenes existentes
        const existingUrls = (p.imagenes ?? []).map((img) =>
          typeof img === 'string' ? img : img.url
        );
        if (existingUrls.length > 0) {
          setImages(existingUrls);
        }
      } catch {
        toast.error('No se pudo cargar el producto', { style: { borderRadius: '12px' } });
        router.push('/admin/productos');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProduct();
  }, [productId, reset, router]);

  const nombre = watch('nombre');
  const en_oferta = watch('en_oferta');
  const agotado = watch('agotado');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 6) {
      toast.error('Máximo 6 imágenes por producto', { style: { borderRadius: '12px' } });
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: La imagen no puede superar 5MB`, { style: { borderRadius: '12px' } });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
      setImageFiles((prev) => [...prev, file]);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Sube imágenes a través de la ruta protegida /api/upload (requiere sesión admin)
  const uploadImagesToStorage = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'productos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Las cookies de sesión se envían automáticamente (same-origin)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error al subir ${file.name}`);
      }

      const json = await res.json();
      if (!json.success || !json.data?.url) {
        throw new Error(`No se recibió URL para ${file.name}`);
      }

      urls.push(json.data.url as string);
    }

    return urls;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      // 1. Subir nuevas imágenes via ruta protegida
      let allImageUrls: string[] = images.filter((img) => img.startsWith('http'));
      if (imageFiles.length > 0) {
        toast.loading('Subiendo imágenes...', { id: 'upload' });
        const newUrls = await uploadImagesToStorage(imageFiles);
        toast.dismiss('upload');
        allImageUrls = [...allImageUrls, ...newUrls];
      }

      // 2. Construir payload del producto
      const colorNombre = (data.color ?? '').trim();
      const productData = {
        ...data,
        // Guarda "Nombre|#HEX" si hay color, null si no
        color: colorNombre
          ? `${colorNombre}|${colorHex}`
          : null,
        agotado: data.agotado ?? false,
        costo_pedido: data.agotado ? (data.costo_pedido ?? null) : null,
        tiempo_llegada: data.agotado ? (data.tiempo_llegada || null) : null,
        slug: generateSlug(data.nombre),
        imagen_principal: allImageUrls[0] ?? '',
        imagenes: allImageUrls.map((url, i) => ({
          id: `img-${i}`,
          url,
          alt: data.nombre,
          order: i,
        })),
        estado: data.agotado ? 'agotado' : (data.stock > 0 ? 'disponible' : 'agotado'),
        ventas: productId ? undefined : 0,
        vistas: productId ? undefined : 0,
        etiquetas: [
          data.es_nuevo && 'nuevo',
          data.en_oferta && 'oferta',
          data.mas_vendido && 'mas_vendido',
          data.destacado && 'destacado',
        ].filter(Boolean),
      };

      // 3. Crear o actualizar via API protegida
      const url = productId ? `/api/productos/${productId}` : '/api/productos';
      const method = productId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Error al guardar el producto');
      }

      toast.success(
        productId ? 'Producto actualizado ✓' : 'Producto creado ✓',
        { style: { borderRadius: '12px' } }
      );
      router.push('/admin/productos');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      toast.error(msg, { style: { borderRadius: '12px' } });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {productId ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          {nombre && (
            <p className="text-xs text-gray-400 mt-0.5">
              Slug: {generateSlug(nombre)}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-5">
            {/* Info básica */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Información básica</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del producto *
                  </label>
                  <input
                    {...register('nombre')}
                    placeholder="Ej: Perfume Floral Premium"
                    className={cn(
                      'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                      errors.nombre ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-rose-200 focus:border-rose-300'
                    )}
                  />
                  {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripción *
                  </label>
                  <textarea
                    {...register('descripcion')}
                    rows={4}
                    placeholder="Describe el producto con detalle..."
                    className={cn(
                      'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none',
                      errors.descripcion ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-rose-200 focus:border-rose-300'
                    )}
                  />
                  {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <ColorPicker
                        hex={colorHex}
                        nombre={field.value ?? ''}
                        onChange={(newHex, newNombre) => {
                          setColorHex(newHex);
                          field.onChange(newNombre);
                        }}
                        onClear={() => {
                          setColorHex('#000000');
                          field.onChange('');
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Precios y stock */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Precio y stock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Precio regular (L.) *
                  </label>
                  <input
                    {...register('precio', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={cn(
                      'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                      errors.precio ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-rose-200 focus:border-rose-300'
                    )}
                  />
                  {errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Precio oferta (L.)
                  </label>
                  <input
                    {...register('precio_oferta', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={!en_oferta}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Stock *
                  </label>
                  <input
                    {...register('stock', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="0"
                    className={cn(
                      'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                      errors.stock ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-rose-200 focus:border-rose-300'
                    )}
                  />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message as string}</p>}
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-1">Imágenes</h2>
              <p className="text-xs text-gray-400 mb-4">
                Máximo 6 imágenes. La primera será la imagen principal. Formatos: JPG, PNG, WebP.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <div className="w-full h-full rounded-xl overflow-hidden border-2 border-gray-200">
                      <Image
                        src={img}
                        alt={`Imagen ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                    {i === 0 && (
                      <span className="absolute -top-1 -left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50 transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Subir</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-5">
            {/* Categoría */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-3">Categoría *</h2>
              <select
                {...register('categoria_id')}
                className={cn(
                  'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white',
                  errors.categoria_id ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-rose-200 focus:border-rose-300'
                )}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoria_id && (
                <p className="text-xs text-red-500 mt-1">{errors.categoria_id.message as string}</p>
              )}
            </div>

            {/* Etiquetas y opciones */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-3">Opciones del producto</h2>
              <div className="space-y-3">
                {[
                  { field: 'destacado', label: 'Producto destacado', desc: 'Aparece en la sección destacados', icon: '⭐' },
                  { field: 'es_nuevo', label: 'Producto nuevo', desc: 'Muestra etiqueta "Nuevo"', icon: '✨' },
                  { field: 'en_oferta', label: 'En oferta', desc: 'Activa el precio de oferta', icon: '🔥' },
                  { field: 'mas_vendido', label: 'Más vendido', desc: 'Etiqueta "Popular"', icon: '🏆' },
                ].map((opt) => (
                  <Controller
                    key={opt.field}
                    name={opt.field as keyof typeof productSchema.shape}
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={field.value as boolean}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={cn(
                            'w-10 h-5.5 rounded-full transition-colors duration-200',
                            field.value ? 'bg-rose-500' : 'bg-gray-200'
                          )}>
                            <div className={cn(
                              'w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ml-0.5',
                              field.value ? 'translate-x-5' : 'translate-x-0'
                            )} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <span>{opt.icon}</span>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-400">{opt.desc}</p>
                        </div>
                      </label>
                    )}
                  />
                ))}

                {/* Toggle Agotado */}
                <Controller
                  name="agotado"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 cursor-pointer transition-colors border border-transparent hover:border-red-100">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={field.value as boolean}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={cn(
                            'w-10 h-5.5 rounded-full transition-colors duration-200',
                            field.value ? 'bg-red-500' : 'bg-gray-200'
                          )}>
                            <div className={cn(
                              'w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ml-0.5',
                              field.value ? 'translate-x-5' : 'translate-x-0'
                            )} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <span>🚫</span>
                            Agotado
                          </p>
                          <p className="text-xs text-gray-400">Marca el producto como agotado</p>
                        </div>
                      </label>

                      {/* Formulario de pedido anticipado — visible solo cuando agotado=true */}
                      {agotado && (
                        <div className="mt-2 ml-3 p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                            Info para pedido anticipado
                          </p>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Costo de pedido (S/.)
                            </label>
                            <input
                              {...register('costo_pedido', { valueAsNumber: true })}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Ej: 15.00"
                              className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tiempo de llegada
                            </label>
                            <input
                              {...register('tiempo_llegada')}
                              type="text"
                              placeholder="Ej: 3 a 5 días hábiles"
                              className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Botón guardar */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {productId ? 'Guardar cambios' : 'Crear producto'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

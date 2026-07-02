import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Product } from '@/types';

// GET /api/productos - Listar productos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda') ?? '';
    const categoria_id = searchParams.get('categoria_id') ?? '';
    const precio_min = searchParams.get('precio_min');
    const precio_max = searchParams.get('precio_max');
    const etiqueta = searchParams.get('etiqueta') ?? '';
    const estado = searchParams.get('estado') ?? '';
    const orden = searchParams.get('orden') ?? 'mas_recientes';
    const page = Number(searchParams.get('page') ?? '1');
    const per_page = Number(searchParams.get('per_page') ?? '12');

    const supabase = await createClient();

    let query = supabase
      .from('productos')
      .select('*, categoria:categorias(*)', { count: 'exact' });

    // Filtros
    if (busqueda) {
      query = query.ilike('nombre', `%${busqueda}%`);
    }
    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id);
    }
    if (precio_min) {
      query = query.gte('precio', Number(precio_min));
    }
    if (precio_max) {
      query = query.lte('precio', Number(precio_max));
    }
    if (estado) {
      query = query.eq('estado', estado);
    }
    if (etiqueta === 'nuevo') query = query.eq('es_nuevo', true);
    if (etiqueta === 'oferta') query = query.eq('en_oferta', true);
    if (etiqueta === 'mas_vendido') query = query.eq('mas_vendido', true);
    if (etiqueta === 'destacado') query = query.eq('destacado', true);

    // Ordenamiento
    switch (orden) {
      case 'precio_asc':
        query = query.order('precio', { ascending: true });
        break;
      case 'precio_desc':
        query = query.order('precio', { ascending: false });
        break;
      case 'mas_vendidos':
        query = query.order('ventas', { ascending: false });
        break;
      case 'nombre_asc':
        query = query.order('nombre', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Paginación
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Error al obtener productos' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        productos: data as Product[],
        meta: {
          page,
          per_page,
          total: count ?? 0,
          total_pages: Math.ceil((count ?? 0) / per_page),
        },
      },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/productos - Crear producto (solo admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const { data: profile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (profile?.rol !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validación básica
    if (!body.nombre || !body.precio || !body.categoria_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Campos requeridos: nombre, precio, categoria_id' },
        { status: 400 }
      );
    }

    // Sanitizar y preparar datos
    const productData = {
      nombre: String(body.nombre).trim().slice(0, 200),
      descripcion: String(body.descripcion ?? '').trim().slice(0, 2000),
      precio: Math.abs(Number(body.precio)),
      precio_oferta: body.precio_oferta ? Math.abs(Number(body.precio_oferta)) : null,
      categoria_id: String(body.categoria_id),
      stock: Math.max(0, Number(body.stock ?? 0)),
      estado: body.stock > 0 ? 'disponible' : 'agotado',
      destacado: Boolean(body.destacado),
      es_nuevo: Boolean(body.es_nuevo),
      en_oferta: Boolean(body.en_oferta),
      mas_vendido: Boolean(body.mas_vendido),
      etiquetas: Array.isArray(body.etiquetas) ? body.etiquetas : [],
      imagenes: Array.isArray(body.imagenes) ? body.imagenes : [],
      imagen_principal: body.imagen_principal ?? '',
      slug: body.slug ?? body.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      color: body.color ? String(body.color) : null,
      vistas: 0,
      ventas: 0,
    };

    const { data, error } = await supabase
      .from('productos')
      .insert(productData)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Error al crear el producto' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: data as Product, message: 'Producto creado correctamente' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

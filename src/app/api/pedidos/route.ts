import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Order } from '@/types';

// GET /api/pedidos - Listar pedidos (solo admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

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

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') ?? '';
    const busqueda = searchParams.get('busqueda') ?? '';
    const page = Number(searchParams.get('page') ?? '1');
    const per_page = Number(searchParams.get('per_page') ?? '20');

    let query = supabase
      .from('pedidos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (estado) query = query.eq('estado', estado);
    if (busqueda) {
      query = query.or(
        `cliente_nombre.ilike.%${busqueda}%,numero_pedido.ilike.%${busqueda}%`
      );
    }

    const from = (page - 1) * per_page;
    query = query.range(from, from + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Error al obtener pedidos' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        pedidos: data as Order[],
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

// POST /api/pedidos - Crear pedido (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación
    if (!body.cliente_nombre || !body.cliente_telefono || !body.items?.length) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Campos requeridos: cliente_nombre, cliente_telefono, items' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Calcular totales
    const subtotal = body.items.reduce(
      (sum: number, item: { precio: number; cantidad: number }) =>
        sum + item.precio * item.cantidad,
      0
    );

    const numeroPedido = `BLZ-${Date.now().toString().slice(-8)}`;

    const orderData = {
      numero_pedido: numeroPedido,
      cliente_nombre: String(body.cliente_nombre).trim().slice(0, 100),
      cliente_telefono: String(body.cliente_telefono).trim().slice(0, 30),
      cliente_email: body.cliente_email ? String(body.cliente_email).trim().slice(0, 100) : null,
      cliente_direccion: body.cliente_direccion ? String(body.cliente_direccion).trim().slice(0, 300) : null,
      items: body.items,
      subtotal,
      total: subtotal,
      estado: 'pendiente',
      notas: body.notas ? String(body.notas).trim().slice(0, 500) : null,
    };

    const { data, error } = await supabase
      .from('pedidos')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Error al crear el pedido' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: data as Order,
        message: `Pedido ${numeroPedido} creado correctamente`,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

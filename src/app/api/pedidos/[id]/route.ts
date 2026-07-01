import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Order, OrderStatus } from '@/types';

const VALID_STATUSES: OrderStatus[] = [
  'pendiente',
  'confirmado',
  'en_proceso',
  'entregado',
  'cancelado',
];

// PATCH /api/pedidos/[id] - Actualizar estado del pedido (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();

    if (!body.estado || !VALID_STATUSES.includes(body.estado)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Estado inválido. Debe ser uno de: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado: body.estado as OrderStatus })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Pedido no encontrado o error al actualizar' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data as Order,
      message: `Estado actualizado a "${body.estado}"`,
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/pedidos/[id] - Obtener pedido por id (solo admin)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: data as Order });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

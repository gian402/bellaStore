import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Product } from '@/types';

// GET /api/productos/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('productos')
      .select('*, categoria:categorias(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: data as Product });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/productos/[id] - Actualizar producto (solo admin)
export async function PUT(
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

    const updateData: Partial<Product> = {};
    if (body.nombre !== undefined) updateData.nombre = String(body.nombre).trim().slice(0, 200);
    if (body.descripcion !== undefined) updateData.descripcion = String(body.descripcion).trim().slice(0, 2000);
    if (body.precio !== undefined) updateData.precio = Math.abs(Number(body.precio));
    if (body.precio_oferta !== undefined) updateData.precio_oferta = body.precio_oferta ? Math.abs(Number(body.precio_oferta)) : null;
    if (body.categoria_id !== undefined) updateData.categoria_id = String(body.categoria_id);
    if (body.stock !== undefined) {
      updateData.stock = Math.max(0, Number(body.stock));
      updateData.estado = updateData.stock > 0 ? 'disponible' : 'agotado';
    }
    if (body.destacado !== undefined) updateData.destacado = Boolean(body.destacado);
    if (body.es_nuevo !== undefined) updateData.es_nuevo = Boolean(body.es_nuevo);
    if (body.en_oferta !== undefined) updateData.en_oferta = Boolean(body.en_oferta);
    if (body.mas_vendido !== undefined) updateData.mas_vendido = Boolean(body.mas_vendido);
    if (body.imagenes !== undefined) updateData.imagenes = Array.isArray(body.imagenes) ? body.imagenes : [];
    if (body.imagen_principal !== undefined) updateData.imagen_principal = body.imagen_principal;

    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Error al actualizar el producto' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data as Product,
      message: 'Producto actualizado correctamente',
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/productos/[id] - Eliminar producto (solo admin)
export async function DELETE(
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

    const { error } = await supabase.from('productos').delete().eq('id', id);

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Error al eliminar el producto' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Producto eliminado correctamente',
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import type { ApiResponse } from '@/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'tienda';

// Cliente con service_role — tiene permiso de subir a Storage
// Solo se usa en el servidor, nunca se expone al cliente
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan variables de entorno de Supabase');
  }
  return createServiceClient(url, key, {
    auth: { persistSession: false },
  });
}

// ─── POST /api/upload ─────────────────────────────────────────────────────────
// Sube una imagen a Supabase Storage.
// Seguridad:
//   1. Verifica que el usuario tenga sesión activa (cookie HttpOnly).
//   2. Verifica que su rol sea "admin" consultando la tabla usuarios.
//   3. Usa el service_role client para subir — el anon key NO tiene permiso.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // ── 1. Verificar sesión ──────────────────────────────────────────────────
    const sessionClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await sessionClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado. Inicia sesión primero.' },
        { status: 401 }
      );
    }

    // ── 2. Verificar rol admin ───────────────────────────────────────────────
    const { data: profile } = await sessionClient
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (profile?.rol !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acceso denegado. Se requiere rol de administrador.' },
        { status: 403 }
      );
    }

    // ── 3. Parsear y validar archivo ─────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) ?? 'productos';

    // Sanear carpeta: solo letras, números y guiones
    const safeFolder = folder.replace(/[^a-z0-9-_]/gi, '').slice(0, 50) || 'productos';

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No se proporcionó ningún archivo.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Tipo no permitido. Usa JPG, PNG, WEBP o GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'El archivo supera el límite de 5 MB.' },
        { status: 400 }
      );
    }

    // ── 4. Generar nombre seguro ─────────────────────────────────────────────
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z]/g, '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 9);
    const fileName = `${safeFolder}/${timestamp}-${random}.${ext}`;

    // ── 5. Subir con service_role (único que tiene permiso de escritura) ──────
    const serviceClient = getServiceClient();
    const buffer = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await serviceClient.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 año — las imágenes no cambian
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Error al subir: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── 6. Devolver URL pública ──────────────────────────────────────────────
    const { data: urlData } = serviceClient.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          url: urlData.publicUrl,
          fileName,
          size: file.size,
          type: file.type,
        },
        message: 'Imagen subida correctamente.',
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json<ApiResponse>(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/upload ───────────────────────────────────────────────────────
// Elimina una imagen de Storage.
// Misma doble verificación: sesión + rol admin.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const sessionClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await sessionClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado.' },
        { status: 401 }
      );
    }

    const { data: profile } = await sessionClient
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (profile?.rol !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acceso denegado.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';

    if (!fileName) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Se requiere el campo fileName.' },
        { status: 400 }
      );
    }

    // Prevenir path traversal
    if (fileName.includes('..') || fileName.startsWith('/')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Nombre de archivo inválido.' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    const { error } = await serviceClient.storage.from(BUCKET).remove([fileName]);

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Error al eliminar la imagen.' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Imagen eliminada correctamente.',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json<ApiResponse>(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combinar clases de Tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear precio en moneda local
export function formatPrice(price: number, currency = 'PEN'): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

// Calcular descuento porcentual
export function calculateDiscount(original: number, sale: number): number {
  if (!original || !sale || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

// Generar slug desde texto
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Truncar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Formatear fecha
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

// Formatear fecha corta
export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('es-HN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dateString));
}

// Generar número de pedido único
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

// Debounce para búsqueda
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar teléfono hondureño
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+504)?[389]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// URL de imagen de Supabase Storage
export function getStorageUrl(path: string, bucket = 'productos'): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !path) return '/images/placeholder.jpg';
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// Placeholder de imagen
export const IMAGE_PLACEHOLDER = '/images/placeholder.jpg';

// Convertir bytes a tamaño legible
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Número de estrellas de calificación
export function getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });
}

// Sanitizar texto para prevenir XSS
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Construir mensaje de WhatsApp
export function buildWhatsAppMessage(
  items: Array<{ nombre: string; cantidad: number; precio: number }>,
  total: number,
  clientName?: string
): string {
  const productList = items
    .map(
      (item) =>
        `• ${item.nombre} x${item.cantidad} - ${formatPrice(item.precio * item.cantidad)}`
    )
    .join('\n');

  const greeting = clientName ? `Hola, soy ${clientName}. ` : 'Hola, ';

  return encodeURIComponent(
    `${greeting}estoy interesado/a en comprar estos productos:\n\n${productList}\n\nTotal: ${formatPrice(total)}\n\n¿Podría confirmar mi pedido?`
  );
}

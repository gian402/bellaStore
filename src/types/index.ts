// ============================================================
// TIPOS GLOBALES - Tienda Online
// ============================================================

// --- PRODUCTO ---
export type ProductTag = 'nuevo' | 'oferta' | 'mas_vendido' | 'destacado';

export type ProductStatus = 'disponible' | 'agotado';

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_oferta?: number | null;
  categoria_id: string;
  categoria?: Category;
  imagenes: ProductImage[];
  imagen_principal: string;
  stock: number;
  estado: ProductStatus;
  destacado: boolean;
  es_nuevo: boolean;
  en_oferta: boolean;
  mas_vendido: boolean;
  etiquetas: ProductTag[];
  slug: string;
  vistas: number;
  ventas: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  precio_oferta?: number | null;
  categoria_id: string;
  stock: number;
  destacado: boolean;
  es_nuevo: boolean;
  en_oferta: boolean;
  mas_vendido: boolean;
  etiquetas: ProductTag[];
}

// --- CATEGORÍA ---
export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  slug: string;
  orden: number;
  activa: boolean;
  created_at: string;
}

// --- CARRITO ---
export interface CartItem {
  id: string;
  producto: Product;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  cantidad_total: number;
  subtotal: number;
}

// --- PEDIDO ---
export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_proceso'
  | 'entregado'
  | 'cancelado';

export interface OrderItem {
  producto_id: string;
  nombre_producto: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  imagen?: string;
}

export interface Order {
  id: string;
  numero_pedido: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  cliente_direccion?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  estado: OrderStatus;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFormData {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  cliente_direccion?: string;
  notas?: string;
}

// --- USUARIO / AUTH ---
export type UserRole = 'admin' | 'cliente';

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  avatar?: string;
  created_at: string;
}

// --- FAVORITOS ---
export interface Favorite {
  id: string;
  usuario_id: string;
  producto_id: string;
  producto?: Product;
  created_at: string;
}

// --- FILTROS DE CATÁLOGO ---
export interface ProductFilters {
  busqueda?: string;
  categoria_id?: string;
  precio_min?: number;
  precio_max?: number;
  estado?: ProductStatus;
  etiqueta?: ProductTag;
  orden?: ProductSortOption;
}

export type ProductSortOption =
  | 'precio_asc'
  | 'precio_desc'
  | 'mas_recientes'
  | 'mas_vendidos'
  | 'nombre_asc';

// --- TESTIMONIOS ---
export interface Testimonial {
  id: string;
  nombre: string;
  comentario: string;
  calificacion: number;
  avatar?: string;
  created_at: string;
}

// --- BANNER ---
export interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagen: string;
  url_destino?: string;
  activo: boolean;
  orden: number;
}

// --- FAQ ---
export interface FAQ {
  id: string;
  pregunta: string;
  respuesta: string;
  orden: number;
}

// --- DASHBOARD STATS ---
export interface DashboardStats {
  total_productos: number;
  productos_agotados: number;
  productos_nuevos: number;
  total_pedidos: number;
  pedidos_pendientes: number;
  total_ventas: number;
  ventas_hoy: number;
  productos_mas_vendidos: Product[];
}

// --- PAGINACIÓN ---
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// --- API RESPONSE ---
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// --- SUPABASE DATABASE TYPES ---
export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      categorias: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      pedidos: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      usuarios: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      favoritos: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'>;
        Update: Partial<Omit<Favorite, 'id' | 'created_at'>>;
      };
    };
  };
}

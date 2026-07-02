-- ============================================================
-- BELLASTORE — SCHEMA COMPLETO PARA SUPABASE
-- Pegar completo en: Supabase > SQL Editor > New Query > Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CATEGORIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id          UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre      TEXT         NOT NULL,
  descripcion TEXT,
  imagen      TEXT,
  slug        TEXT         NOT NULL UNIQUE,
  orden       INTEGER      DEFAULT 0,
  activa      BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_slug   ON categorias(slug);
CREATE INDEX IF NOT EXISTS idx_categorias_activa ON categorias(activa);

-- ============================================================
-- 2. PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  id               UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre           TEXT          NOT NULL,
  descripcion      TEXT          NOT NULL,
  precio           NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  precio_oferta    NUMERIC(10,2) CHECK (precio_oferta > 0 AND precio_oferta < precio),
  categoria_id     UUID          REFERENCES categorias(id) ON DELETE SET NULL,
  imagenes         JSONB         DEFAULT '[]',
  imagen_principal TEXT          DEFAULT '',
  stock            INTEGER       DEFAULT 0 CHECK (stock >= 0),
  estado           TEXT          DEFAULT 'disponible' CHECK (estado IN ('disponible','agotado')),
  destacado        BOOLEAN       DEFAULT FALSE,
  es_nuevo         BOOLEAN       DEFAULT FALSE,
  en_oferta        BOOLEAN       DEFAULT FALSE,
  mas_vendido      BOOLEAN       DEFAULT FALSE,
  etiquetas        TEXT[]        DEFAULT '{}',
  slug             TEXT          NOT NULL UNIQUE,
  color            TEXT,
  agotado          BOOLEAN       DEFAULT FALSE,
  costo_pedido     NUMERIC(10,2),
  tiempo_llegada   TEXT,
  vistas           INTEGER       DEFAULT 0,
  ventas           INTEGER       DEFAULT 0,
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_slug        ON productos(slug);
CREATE INDEX IF NOT EXISTS idx_productos_categoria   ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_estado      ON productos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_destacado   ON productos(destacado);
CREATE INDEX IF NOT EXISTS idx_productos_es_nuevo    ON productos(es_nuevo);
CREATE INDEX IF NOT EXISTS idx_productos_en_oferta   ON productos(en_oferta);
CREATE INDEX IF NOT EXISTS idx_productos_mas_vendido ON productos(mas_vendido);
CREATE INDEX IF NOT EXISTS idx_productos_created_at  ON productos(created_at DESC);

-- Actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS productos_updated_at ON productos;
CREATE TRIGGER productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sincroniza estado según stock
CREATE OR REPLACE FUNCTION sync_estado_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock = 0 THEN
    NEW.estado = 'agotado';
  ELSIF NEW.stock > 0 AND OLD.estado = 'agotado' THEN
    NEW.estado = 'disponible';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_producto_estado ON productos;
CREATE TRIGGER sync_producto_estado
  BEFORE INSERT OR UPDATE OF stock ON productos
  FOR EACH ROW EXECUTE FUNCTION sync_estado_stock();

-- ============================================================
-- 3. USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre     TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  telefono   TEXT,
  rol        TEXT        DEFAULT 'cliente' CHECK (rol IN ('admin','cliente')),
  avatar     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol   ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Crea perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usuarios (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. PEDIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id                UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_pedido     TEXT          NOT NULL UNIQUE,
  cliente_nombre    TEXT          NOT NULL,
  cliente_telefono  TEXT          NOT NULL,
  cliente_email     TEXT,
  cliente_direccion TEXT,
  items             JSONB         NOT NULL DEFAULT '[]',
  subtotal          NUMERIC(10,2) NOT NULL,
  total             NUMERIC(10,2) NOT NULL,
  estado            TEXT          DEFAULT 'pendiente'
                                  CHECK (estado IN ('pendiente','confirmado','en_proceso','entregado','cancelado')),
  notas             TEXT,
  usuario_id        UUID          REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ   DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado     ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero     ON pedidos(numero_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario    ON pedidos(usuario_id);

DROP TRIGGER IF EXISTS pedidos_updated_at ON pedidos;
CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Genera número de pedido automático: BS-20260701-4823
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
    NEW.numero_pedido = 'BS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                        LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pedido_numero_auto ON pedidos;
CREATE TRIGGER pedido_numero_auto
  BEFORE INSERT ON pedidos
  FOR EACH ROW EXECUTE FUNCTION generar_numero_pedido();

-- ============================================================
-- 5. FAVORITOS
-- ============================================================
CREATE TABLE IF NOT EXISTS favoritos (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id  UUID        REFERENCES usuarios(id)  ON DELETE CASCADE NOT NULL,
  producto_id UUID        REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_usuario  ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_producto ON favoritos(producto_id);

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos   ENABLE ROW LEVEL SECURITY;

-- Helper: verifica si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Categorias
DROP POLICY IF EXISTS "cat_publica"    ON categorias;
DROP POLICY IF EXISTS "cat_admin_crud" ON categorias;
CREATE POLICY "cat_publica"    ON categorias FOR SELECT USING (activa = TRUE);
CREATE POLICY "cat_admin_crud" ON categorias FOR ALL   USING (is_admin());

-- Productos
DROP POLICY IF EXISTS "prod_publica"   ON productos;
DROP POLICY IF EXISTS "prod_admin_todo" ON productos;
CREATE POLICY "prod_publica"    ON productos FOR SELECT USING (estado = 'disponible');
CREATE POLICY "prod_admin_todo" ON productos FOR ALL   USING (is_admin());

-- Usuarios
DROP POLICY IF EXISTS "usr_ver_propio"    ON usuarios;
DROP POLICY IF EXISTS "usr_editar_propio" ON usuarios;
DROP POLICY IF EXISTS "usr_admin_todo"    ON usuarios;
CREATE POLICY "usr_ver_propio"    ON usuarios FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "usr_editar_propio" ON usuarios FOR UPDATE USING (id = auth.uid());
CREATE POLICY "usr_admin_todo"    ON usuarios FOR ALL    USING (is_admin());

-- Pedidos: cualquiera puede crear (invitados incluidos), admin gestiona todo
DROP POLICY IF EXISTS "ped_ver_propios" ON pedidos;
DROP POLICY IF EXISTS "ped_crear"       ON pedidos;
DROP POLICY IF EXISTS "ped_admin_todo"  ON pedidos;
CREATE POLICY "ped_ver_propios" ON pedidos FOR SELECT USING (usuario_id = auth.uid() OR is_admin());
CREATE POLICY "ped_crear"       ON pedidos FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "ped_admin_todo"  ON pedidos FOR ALL    USING (is_admin());

-- Favoritos
DROP POLICY IF EXISTS "fav_usuario_propio" ON favoritos;
CREATE POLICY "fav_usuario_propio" ON favoritos FOR ALL USING (usuario_id = auth.uid());

-- ============================================================
-- 7. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('tienda',   'tienda',   true,  5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('banners',  'banners',  true,  5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('avatares', 'avatares', false, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "tienda_lectura"   ON storage.objects;
DROP POLICY IF EXISTS "tienda_subida"    ON storage.objects;
DROP POLICY IF EXISTS "tienda_borrado"   ON storage.objects;
DROP POLICY IF EXISTS "banners_lectura"  ON storage.objects;
DROP POLICY IF EXISTS "banners_subida"   ON storage.objects;
DROP POLICY IF EXISTS "avatares_lectura" ON storage.objects;
DROP POLICY IF EXISTS "avatares_subida"  ON storage.objects;

CREATE POLICY "tienda_lectura"  ON storage.objects FOR SELECT USING (bucket_id = 'tienda');
CREATE POLICY "tienda_subida"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tienda'  AND is_admin());
CREATE POLICY "tienda_borrado"  ON storage.objects FOR DELETE USING  (bucket_id = 'tienda'  AND is_admin());
CREATE POLICY "banners_lectura" ON storage.objects FOR SELECT USING  (bucket_id = 'banners');
CREATE POLICY "banners_subida"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND is_admin());
CREATE POLICY "avatares_lectura" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatares_subida"  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 8. VISTAS
-- ============================================================
CREATE OR REPLACE VIEW productos_con_categoria AS
SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id;

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*)             FROM productos)                           AS total_productos,
  (SELECT COUNT(*)             FROM productos WHERE estado = 'agotado')  AS productos_agotados,
  (SELECT COUNT(*)             FROM productos WHERE es_nuevo = TRUE)     AS productos_nuevos,
  (SELECT COUNT(*)             FROM pedidos)                             AS total_pedidos,
  (SELECT COUNT(*)             FROM pedidos  WHERE estado = 'pendiente') AS pedidos_pendientes,
  (SELECT COALESCE(SUM(total),0) FROM pedidos WHERE estado = 'entregado') AS total_ventas,
  (SELECT COALESCE(SUM(total),0) FROM pedidos
   WHERE estado = 'entregado' AND created_at >= CURRENT_DATE)            AS ventas_hoy;

-- ============================================================
-- 9. DATOS INICIALES
-- ============================================================
INSERT INTO categorias (nombre, descripcion, slug, orden) VALUES
  ('Perfumes',         'Fragancias exclusivas para mujer',     'perfumes',   1),
  ('Carteras',         'Carteras y bolsos elegantes',          'carteras',   2),
  ('Accesorios',       'Joyería y accesorios de moda',         'accesorios', 3),
  ('Maquillaje',       'Cosméticos y maquillaje premium',      'maquillaje', 4),
  ('Cuidado personal', 'Productos para el cuidado de la piel', 'cuidado',    5),
  ('Regalos',          'Sets y productos para regalar',        'regalos',    6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO productos
  (nombre, descripcion, precio, precio_oferta, categoria_id, stock, destacado, es_nuevo, en_oferta, mas_vendido, slug)
SELECT
  p.nombre, p.descripcion, p.precio, p.precio_oferta,
  (SELECT id FROM categorias WHERE slug = p.cat LIMIT 1),
  p.stock, p.destacado, p.es_nuevo, p.en_oferta, p.mas_vendido, p.slug
FROM (VALUES
  ('Perfume Floral Premium',    'Fragancia floral con notas de jazmín y rosa. Duración 8 horas.',          85.00,  68.00, 'perfumes',   15, TRUE,  FALSE, TRUE,  FALSE, 'perfume-floral-premium'),
  ('Perfume Oriental Oud',      'Fragancia oriental intensa con notas de oud y vainilla.',                120.00,  NULL,  'perfumes',   10, TRUE,  TRUE,  FALSE, FALSE, 'perfume-oriental-oud'),
  ('Perfume Cítrico Fresh',     'Fragancia fresca y cítrica, ideal para el día a día.',                   76.00,  60.00, 'perfumes',   20, FALSE, FALSE, TRUE,  TRUE,  'perfume-citrico-fresh'),
  ('Cartera Cuero Elegante',    'Cartera de cuero genuino con múltiples compartimentos internos.',        120.00,  NULL,  'carteras',    8, TRUE,  FALSE, FALSE, TRUE,  'cartera-cuero-elegante'),
  ('Bolso Tote Moderno',        'Bolso espacioso ideal para el trabajo y el día a día.',                   98.00,  78.00, 'carteras',   12, FALSE, TRUE,  TRUE,  FALSE, 'bolso-tote-moderno'),
  ('Cartera Mini Cadena',       'Cartera compacta con cadena dorada, perfecta para salidas.',              89.00,  NULL,  'carteras',    6, TRUE,  TRUE,  FALSE, FALSE, 'cartera-mini-cadena'),
  ('Set Pulseras Doradas',      'Set de 3 pulseras bañadas en oro 18k, diseño minimalista.',              35.00,  28.00, 'accesorios', 25, FALSE, FALSE, TRUE,  TRUE,  'set-pulseras-doradas'),
  ('Collar Perlas Naturales',   'Collar de perlas naturales con cierre de plata 925.',                    65.00,  NULL,  'accesorios', 10, TRUE,  FALSE, FALSE, FALSE, 'collar-perlas-naturales'),
  ('Anillo Plata 925',          'Anillo de plata 925 con piedra zirconia, talla ajustable.',              45.00,  36.00, 'accesorios', 18, FALSE, TRUE,  TRUE,  FALSE, 'anillo-plata-925'),
  ('Paleta Sombras Nude',       'Paleta de 12 sombras en tonos nude y tierra, alta pigmentación.',        55.00,  NULL,  'maquillaje', 20, TRUE,  TRUE,  FALSE, TRUE,  'paleta-sombras-nude'),
  ('Labial Mate Larga Duración','Labial mate que no transfiere. Set de 3 tonos a elegir.',                32.00,  25.00, 'maquillaje', 30, FALSE, FALSE, TRUE,  FALSE, 'labial-mate-larga-duracion'),
  ('Set Cuidado Facial',        'Set completo: sérum vitamina C, contorno de ojos y crema hidratante.',   95.00,  NULL,  'cuidado',    15, TRUE,  TRUE,  FALSE, FALSE, 'set-cuidado-facial'),
  ('Crema Hidratante Premium',  'Crema facial con ácido hialurónico y colágeno. 50ml.',                   48.00,  38.00, 'cuidado',    22, FALSE, FALSE, TRUE,  TRUE,  'crema-hidratante-premium'),
  ('Set Regalo Mujer',          'Set de regalo con perfume, crema y labial en caja premium.',            150.00,  NULL,  'regalos',     8, TRUE,  TRUE,  FALSE, FALSE, 'set-regalo-mujer'),
  ('Set Accesorios Completo',   'Set con collar, aretes y pulsera a juego en estuche elegante.',          75.00,  60.00, 'regalos',    12, FALSE, FALSE, TRUE,  FALSE, 'set-accesorios-completo')
) AS p(nombre, descripcion, precio, precio_oferta, cat, stock, destacado, es_nuevo, en_oferta, mas_vendido, slug)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 10. CREAR ADMINISTRADOR
-- ============================================================
-- 1. Ve a Supabase > Authentication > Users > Add user
--    Ingresa tu email y contraseña.
--
-- 2. Luego ejecuta (cambia el email):
--    UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@email.com';
-- ============================================================

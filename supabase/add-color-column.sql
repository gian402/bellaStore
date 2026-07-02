-- ============================================================
-- MIGRACIÓN: Agregar columna "color" a la tabla productos
-- ============================================================
-- INSTRUCCIONES:
-- 1. Abre Supabase → SQL Editor → New Query
-- 2. Pega este código completo y haz clic en "Run"
-- ============================================================

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS color TEXT;

-- Verifica que se creó correctamente (opcional):
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'productos' AND column_name = 'color';

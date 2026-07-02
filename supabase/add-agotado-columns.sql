-- ============================================================
-- MIGRACIÓN: Agregar columnas para sistema de "Agotado"
-- Ejecutar en: Supabase > SQL Editor > New Query > Run
-- ============================================================

-- Agregar columna color (si no existe)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS color TEXT;

-- Agregar columna agotado
ALTER TABLE productos ADD COLUMN IF NOT EXISTS agotado BOOLEAN DEFAULT FALSE;

-- Agregar costo de pedido anticipado
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo_pedido NUMERIC(10,2);

-- Agregar tiempo de llegada estimado
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tiempo_llegada TEXT;

'use client';

import { Palette, X } from 'lucide-react';

// ─── Tabla de colores en español ─────────────────────────────────────────────
const COLOR_NAMES: [number, number, number, string][] = [
  [255, 255, 255, 'Blanco'],
  [245, 245, 245, 'Blanco hueso'],
  [240, 240, 240, 'Blanco perla'],
  [211, 211, 211, 'Gris claro'],
  [169, 169, 169, 'Gris'],
  [128, 128, 128, 'Gris oscuro'],
  [64,  64,  64,  'Gris carbón'],
  [0,   0,   0,   'Negro'],
  [101, 67,  33,  'Marrón oscuro'],
  [80,  40,  20,  'Café oscuro'],
  [139, 69,  19,  'Marrón'],
  [160, 82,  45,  'Canela'],
  [205, 133, 63,  'Madera'],
  [210, 180, 140, 'Tostado'],
  [255, 218, 185, 'Melocotón'],
  [255, 200, 170, 'Piel claro'],
  [240, 180, 140, 'Piel medio'],
  [210, 150, 100, 'Piel oscuro'],
  [196, 133, 106, 'Nude rosado'],
  [188, 143, 143, 'Nude rosado oscuro'],
  [205, 160, 130, 'Nude cálido'],
  [210, 170, 130, 'Caramelo'],
  [222, 184, 135, 'Arena'],
  [255, 192, 160, 'Melocotón suave'],
  [255, 160, 122, 'Salmón claro'],
  [255, 0,   0,   'Rojo'],
  [220, 20,  60,  'Carmesí'],
  [178, 34,  34,  'Rojo oscuro'],
  [139, 0,   0,   'Granate oscuro'],
  [128, 0,   0,   'Vino oscuro'],
  [165, 42,  42,  'Café rojizo'],
  [255, 99,  71,  'Coral'],
  [255, 127, 80,  'Coral claro'],
  [255, 69,  0,   'Rojo anaranjado'],
  [255, 105, 180, 'Rosa fuerte'],
  [255, 182, 193, 'Rosa claro'],
  [255, 192, 203, 'Rosa bebé'],
  [219, 112, 147, 'Rosa viejo'],
  [255, 20,  147, 'Rosa intenso'],
  [199, 21,  133, 'Violeta rojizo'],
  [240, 128, 128, 'Rojo claro'],
  [250, 128, 114, 'Salmón'],
  [176, 48,  96,  'Borgoña'],
  [128, 0,   32,  'Vino'],
  [139, 0,   98,  'Ciruela oscura'],
  [255, 165, 0,   'Naranja'],
  [255, 140, 0,   'Naranja oscuro'],
  [255, 215, 0,   'Dorado'],
  [255, 255, 0,   'Amarillo'],
  [218, 165, 32,  'Dorado viejo'],
  [184, 134, 11,  'Mostaza oscuro'],
  [255, 200, 50,  'Mostaza'],
  [0,   128, 0,   'Verde'],
  [0,   100, 0,   'Verde oscuro'],
  [50,  205, 50,  'Verde manzana'],
  [46,  139, 87,  'Verde mar'],
  [34,  139, 34,  'Verde bosque'],
  [107, 142, 35,  'Verde oliva'],
  [128, 128, 0,   'Oliva'],
  [0,   0,   255, 'Azul'],
  [0,   0,   139, 'Azul oscuro'],
  [100, 149, 237, 'Azul aciano'],
  [135, 206, 235, 'Azul cielo'],
  [173, 216, 230, 'Azul bebé'],
  [0,   191, 255, 'Azul turquesa'],
  [70,  130, 180, 'Azul acero'],
  [30,  144, 255, 'Azul eléctrico'],
  [65,  105, 225, 'Azul real'],
  [25,  25,  112, 'Azul marino'],
  [128, 0,   128, 'Morado'],
  [148, 0,   211, 'Violeta'],
  [186, 85,  211, 'Orquídea'],
  [221, 160, 221, 'Ciruela'],
  [255, 0,   255, 'Fucsia'],
  [255, 20,  147, 'Rosa fucsia'],
  [75,  0,   130, 'Índigo'],
];

// ─── Convierte hex a RGB ──────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

// ─── Convierte HEX al nombre más cercano en español ──────────────────────────
export function hexToColorName(hex: string): string {
  if (!hex || hex.length < 4) return '';
  const [r, g, b] = hexToRgb(hex);
  let minDist = Infinity;
  let bestName = '';
  for (const [cr, cg, cb, name] of COLOR_NAMES) {
    const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
    if (dist < minDist) {
      minDist = dist;
      bestName = name;
    }
  }
  return bestName;
}

// ─── Paleta rápida de maquillaje ─────────────────────────────────────────────
const QUICK_COLORS = [
  { hex: '#F5C5B0', nombre: 'Nude claro' },
  { hex: '#C4856A', nombre: 'Nude rosado' },
  { hex: '#D2956A', nombre: 'Nude cálido' },
  { hex: '#E8A090', nombre: 'Melocotón' },
  { hex: '#FF6B6B', nombre: 'Coral' },
  { hex: '#E8175E', nombre: 'Rosa intenso' },
  { hex: '#C0392B', nombre: 'Rojo clásico' },
  { hex: '#8B0000', nombre: 'Vino' },
  { hex: '#6D2B6D', nombre: 'Ciruela' },
  { hex: '#F4A0B5', nombre: 'Rosa bebé' },
  { hex: '#FF007F', nombre: 'Rosa fucsia' },
  { hex: '#B5651D', nombre: 'Marrón' },
  { hex: '#8B4513', nombre: 'Marrón oscuro' },
  { hex: '#D4A96A', nombre: 'Caramelo' },
  { hex: '#F5E6C8', nombre: 'Vainilla' },
  { hex: '#808080', nombre: 'Gris' },
  { hex: '#1C1C1C', nombre: 'Negro' },
  { hex: '#FFFFFF', nombre: 'Blanco' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ColorPickerProps {
  /** HEX actual, ej: "#C4856A". El padre lo controla. */
  hex: string;
  /** Nombre actual, ej: "Nude rosado". El padre lo controla. */
  nombre: string;
  /** Se dispara cuando el usuario elige un color. */
  onChange: (hex: string, nombre: string) => void;
  /** Se dispara cuando el usuario borra el color. */
  onClear: () => void;
}

// ─── Componente (completamente controlado — sin estado interno) ───────────────
export default function ColorPicker({ hex, nombre, onChange, onClear }: ColorPickerProps) {
  const hasColor = nombre.trim().length > 0;

  const handleNativeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    const newNombre = hexToColorName(newHex);
    onChange(newHex, newNombre);
  };

  const handleQuickColor = (qhex: string, qnombre: string) => {
    onChange(qhex, qnombre);
  };

  return (
    <div className="space-y-3">

      {/* ── Fila principal ── */}
      <div className="flex items-center gap-3">

        {/* Círculo interactivo */}
        <label className="relative cursor-pointer group flex-shrink-0">
          {/* Input nativo oculto */}
          <input
            type="color"
            value={hex || '#C4856A'}
            onChange={handleNativeInput}
            className="sr-only"
          />
          {/* Círculo visible */}
          <div
            className="w-12 h-12 rounded-full border-4 border-white shadow-md ring-2 ring-gray-200 group-hover:ring-rose-400 transition-all"
            style={{ backgroundColor: hasColor ? hex : '#e5e7eb' }}
          />
          {/* Ícono cuando no hay color */}
          {!hasColor && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Palette className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </label>

        {/* Texto resultado / instrucción */}
        <div className="flex-1 min-w-0">
          {hasColor ? (
            <div className="flex items-center gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{nombre}</p>
                <p className="text-xs text-gray-400 font-mono">{hex.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={onClear}
                title="Quitar color"
                className="ml-auto flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Haz clic en el círculo para elegir el color</p>
              <p className="text-xs text-gray-400 mt-0.5">O selecciona un tono rápido abajo</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Paleta rápida ── */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Tonos frecuentes en maquillaje:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_COLORS.map(({ hex: qhex, nombre: qnombre }) => {
            const isSelected = hasColor && hex === qhex;
            return (
              <button
                key={qhex}
                type="button"
                title={qnombre}
                onClick={() => handleQuickColor(qhex, qnombre)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: qhex,
                  outline: isSelected ? '3px solid #f43f5e' : '2px solid white',
                  outlineOffset: isSelected ? '2px' : '1px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

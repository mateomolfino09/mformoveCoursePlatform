// Sistema de colores centralizado para MForMove
// Basado en la paleta de marca: azul #234C8C, negro, blanco

/** Paleta de colores del sistema (usar en todo el producto) */
export const palette = {
  ink: '#141411',       // Negro / tinta
  sage: '#acae89',      // Verde salvia
  stone: '#787867',     // Gris piedra
  deepTeal: '#001b1c',  // Teal oscuro
  teal: '#074647',      // Teal
  white: '#FAF8F4',     // Blanco minimalista
  cream: '#FAF8F4',     // Crema (mismo que white)
} as const;

export const colors = {
  // Paleta del sistema (alias para uso con colors.palette)
  palette,

  // Colores principales de marca
  primary: {
    blue: '#234C8C',        // Azul principal de marca
    blueLight: '#3A5A9E',   // Azul más claro para hover
    blueDark: '#1A3A6B',    // Azul más oscuro para active
  },

  // Colores neutros
  neutral: {
    black: '#000000',       // Negro puro
    white: '#FFFFFF',       // Blanco puro
    gray50: '#F9FAFB',      // Gris muy claro (fondos)
    gray100: '#F3F4F6',     // Gris claro (fondos secundarios)
    gray200: '#E5E7EB',     // Gris medio (bordes)
    gray300: '#D1D5DB',     // Gris medio (divisores)
    gray400: '#9CA3AF',     // Gris medio (texto secundario)
    gray500: '#6B7280',     // Gris medio (texto)
    gray600: '#4B5563',     // Gris oscuro (texto principal)
    gray700: '#374151',     // Gris muy oscuro (títulos)
    gray800: '#1F2937',     // Gris casi negro
    gray900: '#111827',     // Negro suave
  },

  // Colores de estado
  status: {
    success: '#10B981',     // Verde para éxito
    successLight: '#D1FAE5', // Verde claro para fondos
    warning: '#F59E0B',     // Amarillo para advertencias
    warningLight: '#FEF3C7', // Amarillo claro para fondos
    error: '#EF4444',       // Rojo para errores
    errorLight: '#FEE2E2',  // Rojo claro para fondos
    info: '#3B82F6',        // Azul para información
    infoLight: '#DBEAFE',   // Azul claro para fondos
  },

  // Colores de fondo
  background: {
    primary: '#FFFFFF',     // Fondo principal
    secondary: '#F9FAFB',   // Fondo secundario
    tertiary: '#F3F4F6',    // Fondo terciario
    dark: '#111827',        // Fondo oscuro
    overlay: 'rgba(0, 0, 0, 0.5)', // Overlay para modales
  },

  // Colores de texto
  text: {
    primary: '#111827',     // Texto principal
    secondary: '#6B7280',   // Texto secundario
    tertiary: '#9CA3AF',    // Texto terciario
    inverse: '#FFFFFF',     // Texto sobre fondos oscuros
    muted: '#9CA3AF',       // Texto atenuado
  },

  // Colores de bordes
  border: {
    light: '#E5E7EB',       // Borde claro
    medium: '#D1D5DB',      // Borde medio
    dark: '#9CA3AF',        // Borde oscuro
    focus: '#234C8C',       // Borde de focus (azul marca)
  },

  // Colores de sombras
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Gradientes
  gradient: {
    primary: 'linear-gradient(135deg, #234C8C 0%, #3A5A9E 100%)',
    secondary: 'linear-gradient(135deg, #1A3A6B 0%, #234C8C 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    dark: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
  }
};

// Funciones de utilidad para colores
export const colorUtils = {
  // Obtener color con opacidad
  withOpacity: (color: string, opacity: number) => {
    // Convertir hex a rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  // Obtener color más claro
  lighten: (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },

  // Obtener color más oscuro
  darken: (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
};

// Exportar tipos para TypeScript
export type ColorKey = keyof typeof colors;
export type PaletteKey = keyof typeof palette;
export type PrimaryColorKey = keyof typeof colors.primary;
export type NeutralColorKey = keyof typeof colors.neutral;
export type StatusColorKey = keyof typeof colors.status; 
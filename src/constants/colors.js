/**
 * colors.js — Tokens de diseño y helpers semánticos
 * Auditado: consistencia, valores correctos
 */

export const C = {
  // Colores base
  navy:      '#0B1929',
  navyLight: '#1E2F47',
  teal:      '#0FBCAA',
  tealDark:  '#0A9488',
  amber:     '#F5A623',
  amberDark: '#D4861A',
  green:     '#22C55E',
  yellow:    '#EAB308',
  red:       '#EF4444',
  white:     '#FFFFFF',

  // Escala de grises
  gray50:  '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray600: '#475569',
  gray800: '#1E293B',
}

// ── Colores por nivel de cliente ──────────────────────
export const nivelColor = (nivel) => ({
  alto:  C.green,
  medio: C.yellow,
  bajo:  C.red,
}[nivel] || C.gray400)

export const nivelBg = (nivel) => ({
  alto:  '#DCFCE7',
  medio: '#FEF9C3',
  bajo:  '#FEE2E2',
}[nivel] || C.gray100)

export const nivelTxt = (nivel) => ({
  alto:  '#166534',
  medio: '#854D0E',
  bajo:  '#991B1B',
}[nivel] || C.gray600)

// ── Colores por estado de pago ─────────────────────────
export const estadoPagoInfo = (estado) => ({
  pagado:    { bg:'#DCFCE7', txt:'#166534', label:'Pagado'    },
  parcial:   { bg:'#FEF9C3', txt:'#854D0E', label:'Parcial'   },
  pendiente: { bg:'#FEE2E2', txt:'#991B1B', label:'Pendiente' },
}[estado] || { bg:C.gray100, txt:C.gray600, label: estado || 'Desconocido' })

// ── Métodos de pago ───────────────────────────────────
export const metodoPagoLabel = (metodo) => ({
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  pagoMovil:     'Pago Móvil',
  zelle:         'Zelle',
  otro:          'Otro',
}[metodo] || metodo || '—')

// ── Colores de categoría de producto (fallback) ────────
export const categoriaColor = (cat) => ({
  alimento:  C.green,
  medicina:  C.red,
  accesorio: '#A78BFA',
}[cat] || C.gray400)

export const categoriaIcon = (cat) => ({
  alimento:  'pkg',
  medicina:  'pill',
  accesorio: 'shopping',
}[cat] || 'pkg')

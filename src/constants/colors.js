export const C = {
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
  gray50:    '#F8FAFC',
  gray100:   '#F1F5F9',
  gray200:   '#E2E8F0',
  gray400:   '#94A3B8',
  gray600:   '#475569',
  gray800:   '#1E293B',
}

export const nivelColor = (n) =>
  ({ alto: C.green, medio: C.yellow, bajo: C.red }[n] || C.gray400)

export const nivelBg = (n) =>
  ({ alto: '#DCFCE7', medio: '#FEF9C3', bajo: '#FEE2E2' }[n] || C.gray100)

export const nivelTxt = (n) =>
  ({ alto: '#166534', medio: '#854D0E', bajo: '#991B1B' }[n] || C.gray600)

export const tipoColor = (t) =>
  ({ veterinaria: '#3B82F6', petshop: C.teal, agropecuaria: '#22C55E' }[t] || C.gray400)

export const estadoPagoInfo = (e) => ({
  pagado:    { bg: '#DCFCE7', txt: '#166534', label: 'Pagado'    },
  parcial:   { bg: '#FEF9C3', txt: '#854D0E', label: 'Parcial'   },
  pendiente: { bg: '#FEE2E2', txt: '#991B1B', label: 'Pendiente' },
}[e] || { bg: C.gray100, txt: C.gray600, label: e })

export const metodoPagoLabel = (m) =>
  ({ efectivo: 'Efectivo', transferencia: 'Transferencia', pagoMovil: 'Pago Móvil' }[m] || m)

export const tipoIconName = (t) =>
  ({ veterinaria: 'steth', petshop: 'shopping', agropecuaria: 'leaf' }[t] || 'pkg')

export const categoriaColor = (c) =>
  ({ alimento: C.green, medicina: C.red, accesorio: '#A78BFA' }[c] || C.gray400)

export const categoriaIcon = (c) =>
  ({ alimento: 'pkg', medicina: 'pill', accesorio: 'shopping' }[c] || 'pkg')

/**
 * helpers.js — Funciones utilitarias
 * Auditado: manejo de null/undefined, fechas Firestore
 */

// Formatea número como moneda USD
export const fmtUSD = (n) => {
  const num = Number(n)
  if (isNaN(num)) return '$0.00'
  return `$${num.toFixed(2)}`
}

// Días desde una fecha — acepta Date, Timestamp Firestore o string
export const daysSince = (fecha) => {
  if (!fecha) return 0
  let date
  if (fecha?.toDate) {
    // Timestamp de Firestore
    date = fecha.toDate()
  } else if (fecha instanceof Date) {
    date = fecha
  } else if (typeof fecha === 'string') {
    date = new Date(fecha)
  } else if (typeof fecha === 'number') {
    date = new Date(fecha)
  } else {
    return 0
  }
  if (isNaN(date.getTime())) return 0
  const diff = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}

// Formatea fecha Firestore a string legible
export const fmtFecha = (fecha, locale = 'es-VE') => {
  if (!fecha) return '—'
  let date
  if (fecha?.toDate) {
    date = fecha.toDate()
  } else if (fecha instanceof Date) {
    date = fecha
  } else {
    date = new Date(fecha)
  }
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(locale, {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  })
}

// Suma total de ventas
export const sumVentas = (ventas) => {
  if (!Array.isArray(ventas)) return 0
  return ventas.reduce((s, v) => s + (Number(v.total) || 0), 0)
}

// Suma deuda total de clientes
export const sumDeuda = (clientes) => {
  if (!Array.isArray(clientes)) return 0
  return clientes.reduce((s, c) => s + (Number(c.deuda) || 0), 0)
}

// Ticket promedio
export const ticketPromedio = (ventas) => {
  if (!Array.isArray(ventas) || ventas.length === 0) return 0
  return sumVentas(ventas) / ventas.length
}

// Clientes con deuda
export const clientesConDeuda = (clientes) => {
  if (!Array.isArray(clientes)) return []
  return clientes.filter(c => (Number(c.deuda) || 0) > 0)
}

// Clientes inactivos por N días
export const clientesInactivos = (clientes, dias = 30) => {
  if (!Array.isArray(clientes)) return []
  return clientes.filter(c => daysSince(c.ultimaVisita) > dias)
}

// Porcentaje de cambio entre dos valores
export const pctCambio = (actual, anterior) => {
  if (!anterior || anterior === 0) return 0
  return Math.round(((actual - anterior) / anterior) * 100)
}

// Distancia Haversine entre dos coordenadas (km)
export const distanciaKm = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 0
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Formatea distancia en m o km
export const fmtDistancia = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// Capitaliza primera letra
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Trunca texto a N caracteres
export const truncar = (str, n = 30) => {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

// Obtiene iniciales de un nombre
export const iniciales = (nombre) => {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .slice(0, 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('')
}

export const fmtUSD = (n) => `$${Number(n).toFixed(2)}`

export const daysSince = (dateStr) =>
  Math.floor((Date.now() - new Date(dateStr)) / 86_400_000)

export const sumVentas = (ventas) =>
  ventas.reduce((s, v) => s + v.total, 0)

export const sumDeuda = (clientes) =>
  clientes.reduce((s, c) => s + c.deuda, 0)

export const ticketPromedio = (ventas) =>
  ventas.length === 0 ? 0 : sumVentas(ventas) / ventas.length

export const clientesConDeuda = (clientes) =>
  clientes.filter((c) => c.deuda > 0)

export const clientesInactivos = (clientes, dias = 30) =>
  clientes.filter((c) => daysSince(c.ultimaVisita) > dias)

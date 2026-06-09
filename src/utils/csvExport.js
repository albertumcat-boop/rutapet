/**
 * csvExport.js — Utilidad para exportar datos a CSV
 */

function escaparCSV(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function filaCSV(arr) {
  return arr.map(escaparCSV).join(',')
}

export function descargarCSV(filas, nombreArchivo = 'exportar.csv') {
  if (!filas || filas.length === 0) return
  const contenido = filas.map(filaCSV).join('\n')
  const bom = '﻿' // BOM para Excel con UTF-8
  const blob = new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Exportadores específicos ─────────────────────────────────────

export function exportarVentas(ventas, clientes = [], productos = []) {
  const getCliente = (id) => clientes.find(c => c.id === id)?.nombre || id
  const hoy = new Date().toISOString().split('T')[0]

  const header = ['Fecha','Cliente','Total','Descuento%','Monto pagado','Saldo pendiente','Estado','Método pago','Vendedor']
  const filas  = ventas.map(v => [
    v.fecha?.toDate?.().toLocaleDateString('es-VE') || v.fecha || '',
    getCliente(v.clienteId),
    v.total ?? '',
    v.descuento ?? 0,
    v.montoPagado ?? 0,
    Math.max(0, (v.total ?? 0) - (v.montoPagado ?? 0)),
    v.estado || '',
    v.metodoPago || '',
    v.vendedorNombre || '',
  ])

  descargarCSV([header, ...filas], `ventas_${hoy}.csv`)
}

export function exportarClientesConDeuda(clientes) {
  const hoy    = new Date().toISOString().split('T')[0]
  const header = ['Nombre','Contacto','Teléfono','Deuda','Límite crédito','Condición pago']
  const filas  = clientes
    .filter(c => (c.deuda || 0) > 0)
    .sort((a, b) => (b.deuda || 0) - (a.deuda || 0))
    .map(c => [
      c.nombre || '',
      c.contacto || '',
      c.telefono || '',
      c.deuda || 0,
      c.limiteCredito || 0,
      c.condicionPago || '',
    ])

  descargarCSV([header, ...filas], `deudas_${hoy}.csv`)
}

export function exportarInventario(productos) {
  const hoy    = new Date().toISOString().split('T')[0]
  const header = ['Nombre','Categoría','Marca','Precio','Stock','Stock mínimo','Vencimiento','Requiere receta','Cadena frío']
  const filas  = productos.map(p => [
    p.nombre || '',
    p.categoria || '',
    p.marca || '',
    p.precio ?? '',
    p.stock ?? '',
    p.stockMinimo ?? '',
    p.fechaVencimiento || '',
    p.requiereReceta ? 'Sí' : 'No',
    p.cadenaFrio ? 'Sí' : 'No',
  ])

  descargarCSV([header, ...filas], `inventario_${hoy}.csv`)
}

export function exportarClientes(clientes) {
  const hoy    = new Date().toISOString().split('T')[0]
  const header = ['Nombre','Tipo','Contacto','Teléfono','Email','Dirección','Nivel','Deuda','Límite crédito']
  const filas  = clientes.map(c => [
    c.nombre || '',
    c.tipo || '',
    c.contacto || '',
    c.telefono || '',
    c.email || '',
    c.direccion || '',
    c.nivel || '',
    c.deuda || 0,
    c.limiteCredito || 0,
  ])

  descargarCSV([header, ...filas], `clientes_${hoy}.csv`)
}

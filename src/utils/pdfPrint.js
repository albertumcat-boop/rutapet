/**
 * pdfPrint.js — Generación de reportes imprimibles (HTML → Print → PDF)
 * No requiere dependencias externas — usa window.print() del navegador
 * Compatible con móvil (Chrome → "Guardar como PDF")
 */

const STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 28px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #0FBCAA; }
  .logo-box { display: flex; align-items: center; gap: 10px; }
  .logo-circle { width: 42px; height: 42px; border-radius: 12px; background: #0FBCAA; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .empresa-nombre { font-size: 18px; font-weight: 900; color: #0B1929; }
  .empresa-rubro  { font-size: 11px; color: #64748b; }
  .doc-title  { font-size: 20px; font-weight: 900; color: #0FBCAA; text-align: right; }
  .doc-num    { font-size: 11px; color: #64748b; text-align: right; }
  .section    { margin-bottom: 16px; }
  .section-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
  .info-box { background: #f8fafc; border-radius: 8px; padding: 12px 14px; border: 1px solid #e2e8f0; }
  .info-label { font-size: 10px; color: #94a3b8; margin-bottom: 2px; }
  .info-val   { font-size: 13px; font-weight: 700; color: #1e293b; }
  .info-sub   { font-size: 11px; color: #475569; margin-top: 1px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #0B1929; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
  td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
  tr:nth-child(even) td { background: #f8fafc; }
  .total-row td { font-weight: 900; font-size: 14px; background: #f0fdf4; color: #166534; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-green  { background: #dcfce7; color: #166534; }
  .badge-red    { background: #fee2e2; color: #991b1b; }
  .badge-blue   { background: #dbeafe; color: #1e40af; }
  .badge-yellow { background: #fef9c3; color: #854d0e; }
  .notes-box  { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
  .firma-box  { border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 10px 14px; text-align: center; min-height: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .firma-img  { max-height: 80px; max-width: 240px; }
  .footer     { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  @media print {
    body { padding: 16px; }
    button { display: none !important; }
    @page { margin: 1.2cm; size: A4 portrait; }
  }
`

const PRINT_BTN = `
  <div style="text-align:right;margin-bottom:16px" class="no-print">
    <button onclick="window.print()" style="background:#0FBCAA;color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">
      🖨️ Imprimir / Guardar PDF
    </button>
  </div>
`

function docNum() {
  return 'VR-' + Date.now().toString(36).toUpperCase().slice(-6)
}

function hoy() {
  return new Date().toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── REPORTE DE VISITA ───────────────────────────────────────────
export function imprimirReporteVisita({ visita, cliente, vendedorNombre, empresa, firma }) {
  const num = docNum()
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reporte de Visita — ${cliente?.nombre || ''}</title>
<style>${STYLES}</style></head>
<body>
${PRINT_BTN}

<!-- HEADER -->
<div class="header">
  <div class="logo-box">
    <div class="logo-circle">🐾</div>
    <div>
      <div class="empresa-nombre">${empresa?.nombre || 'VetRuta'}</div>
      <div class="empresa-rubro">${empresa?.rubro || 'Medicamentos veterinarios'}</div>
    </div>
  </div>
  <div>
    <div class="doc-title">Reporte de Visita</div>
    <div class="doc-num">N° ${num} · ${hoy()}</div>
  </div>
</div>

<!-- INFO GRID -->
<div class="grid-2">
  <div class="info-box">
    <div class="info-label">Cliente visitado</div>
    <div class="info-val">${cliente?.nombre || '—'}</div>
    <div class="info-sub">${cliente?.tipo || ''} ${cliente?.ruc ? '· RUC: ' + cliente.ruc : ''}</div>
    <div class="info-sub">${cliente?.direccion || ''}</div>
    <div class="info-sub">${cliente?.telefono || ''}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Vendedor</div>
    <div class="info-val">${vendedorNombre || '—'}</div>
    <div class="info-label" style="margin-top:8px">Fecha de visita</div>
    <div class="info-val">${visita?.fecha ? new Date(visita.fecha?.toDate?.() || visita.fecha).toLocaleDateString('es-VE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }) : hoy()}</div>
    <div style="margin-top:8px">
      <span class="badge ${visita?.vendio ? 'badge-green' : 'badge-red'}">
        ${visita?.vendio ? '✅ Realizó venta' : '❌ Sin venta'}
      </span>
    </div>
  </div>
</div>

<!-- NOTAS -->
${visita?.notas ? `
<div class="section">
  <div class="section-title">Observaciones y acuerdos</div>
  <div class="notes-box">${visita.notas}</div>
</div>` : ''}

<!-- FIRMA -->
<div class="grid-2">
  <div>
    <div class="section-title" style="margin-bottom:8px">Firma del vendedor</div>
    <div class="firma-box">
      ${firma ? `<img class="firma-img" src="${firma}" alt="Firma" />` : '<span style="color:#94a3b8;font-size:11px">Sin firma capturada</span>'}
    </div>
  </div>
  <div>
    <div class="section-title" style="margin-bottom:8px">Firma del cliente</div>
    <div class="firma-box">
      <span style="color:#94a3b8;font-size:11px">___________________________</span>
      <span style="color:#94a3b8;font-size:10px;margin-top:6px">${cliente?.nombre || ''}</span>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <span>${empresa?.nombre || 'VetRuta'} · ${empresa?.rubro || 'Medicamentos veterinarios'}</span>
  <span>Documento N° ${num} · Generado el ${hoy()}</span>
</div>
</body></html>`

  abrirVentana(html, `Visita-${cliente?.nombre || 'reporte'}`)
}

// ── NOTA DE ENTREGA / REMISIÓN ──────────────────────────────────
export function imprimirRemision({ venta, cliente, productos, empresa, descuento = 0 }) {
  const num  = docNum()
  const items = (venta?.items || []).map(it => {
    const p = productos?.find(x => x.id === it.pId) || {}
    return { ...it, nombre: p.nombre || it.nombre || '—', lote: p.lote || '' }
  })

  const subtotal = items.reduce((s, it) => s + (Number(it.precio) * Number(it.qty)), 0)
  const descVal  = subtotal * (Number(descuento) / 100)
  const total    = subtotal - descVal

  const estadoInfo = {
    pagado:   { label: 'Pagado',    css: 'badge-green'  },
    parcial:  { label: 'Parcial',   css: 'badge-yellow' },
    pendiente:{ label: 'Pendiente', css: 'badge-red'    },
  }[venta?.estado || 'pendiente']

  const metodoPagoLabel = {
    efectivo:      'Efectivo',
    transferencia: 'Transferencia',
    pagoMovil:     'Pago Móvil',
    zelle:         'Zelle',
  }[venta?.metodoPago] || 'Efectivo'

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nota de Entrega — ${cliente?.nombre || ''}</title>
<style>${STYLES}</style></head>
<body>
${PRINT_BTN}

<!-- HEADER -->
<div class="header">
  <div class="logo-box">
    <div class="logo-circle">🐾</div>
    <div>
      <div class="empresa-nombre">${empresa?.nombre || 'VetRuta'}</div>
      <div class="empresa-rubro">${empresa?.rubro || 'Medicamentos veterinarios'}</div>
    </div>
  </div>
  <div>
    <div class="doc-title">Nota de Entrega</div>
    <div class="doc-num">N° ${num} · ${hoy()}</div>
    <div style="margin-top:4px"><span class="badge ${estadoInfo.css}">${estadoInfo.label}</span></div>
  </div>
</div>

<!-- CLIENTE / PAGO -->
<div class="grid-2">
  <div class="info-box">
    <div class="info-label">Cliente</div>
    <div class="info-val">${cliente?.nombre || '—'}</div>
    <div class="info-sub">${cliente?.tipo || ''} ${cliente?.ruc ? '· RUC: ' + cliente.ruc : ''}</div>
    <div class="info-sub">${cliente?.direccion || ''}</div>
    <div class="info-sub">${cliente?.telefono || ''}</div>
  </div>
  <div class="info-box">
    <div class="info-label">Método de pago</div>
    <div class="info-val">${metodoPagoLabel}</div>
    <div class="info-label" style="margin-top:8px">Fecha</div>
    <div class="info-val">${hoy()}</div>
    ${venta?.montoPagado > 0 && venta?.estado !== 'pagado' ? `
    <div class="info-label" style="margin-top:8px">Abono recibido</div>
    <div class="info-val" style="color:#0FBCAA">$${Number(venta.montoPagado).toFixed(2)}</div>` : ''}
  </div>
</div>

<!-- TABLA DE PRODUCTOS -->
<div class="section">
  <div class="section-title">Detalle de productos</div>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Lote</th>
        <th style="text-align:center">Cant.</th>
        <th style="text-align:right">P. Unitario</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(it => `
      <tr>
        <td>${it.nombre}</td>
        <td style="color:#64748b;font-size:11px">${it.lote || '—'}</td>
        <td style="text-align:center">${it.qty}</td>
        <td style="text-align:right">$${Number(it.precio).toFixed(2)}</td>
        <td style="text-align:right;font-weight:700">$${(Number(it.precio) * Number(it.qty)).toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
    <tfoot>
      ${descuento > 0 ? `
      <tr>
        <td colspan="4" style="text-align:right;font-weight:700;padding-right:10px">Subtotal</td>
        <td style="text-align:right;font-weight:700">$${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" style="text-align:right;color:#dc2626;padding-right:10px">Descuento ${descuento}%</td>
        <td style="text-align:right;color:#dc2626">-$${descVal.toFixed(2)}</td>
      </tr>` : ''}
      <tr class="total-row">
        <td colspan="4" style="text-align:right;padding-right:10px">TOTAL</td>
        <td style="text-align:right">$${total.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
</div>

${venta?.notas ? `
<div class="section">
  <div class="section-title">Notas</div>
  <div class="notes-box">${venta.notas}</div>
</div>` : ''}

<!-- FIRMAS -->
<div class="grid-2" style="margin-top:24px">
  <div>
    <div class="section-title" style="margin-bottom:8px">Entregado por</div>
    <div class="firma-box">
      <span style="color:#94a3b8;font-size:11px">___________________________</span>
      <span style="color:#475569;font-size:11px;margin-top:6px;font-weight:700">Vendedor</span>
    </div>
  </div>
  <div>
    <div class="section-title" style="margin-bottom:8px">Recibido por</div>
    <div class="firma-box">
      <span style="color:#94a3b8;font-size:11px">___________________________</span>
      <span style="color:#475569;font-size:11px;margin-top:6px;font-weight:700">${cliente?.nombre || 'Cliente'}</span>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <span>${empresa?.nombre || 'VetRuta'} · ${empresa?.rubro || 'Medicamentos veterinarios'}</span>
  <span>Nota de Entrega N° ${num} · ${hoy()}</span>
</div>
</body></html>`

  abrirVentana(html, `Remision-${cliente?.nombre || 'entrega'}`)
}

// ── Helper: abre ventana de impresión ──────────────────────────
function abrirVentana(html, titulo) {
  const win = window.open('', '_blank', 'width=800,height=700,scrollbars=yes')
  if (!win) {
    alert('Por favor permite ventanas emergentes para generar el PDF')
    return
  }
  win.document.write(html)
  win.document.close()
  win.document.title = titulo
  // Auto-print después de que cargue
  win.onload = () => win.print()
}

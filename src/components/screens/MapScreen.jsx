import { useEffect, C } from 'react'
import { C, nivelColor, nivelBg, nivelTxt, tipoColor, tipoIconName } from '../../constants/colors'
import { CLIENTES } from '../../constants/data'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function MapScreen({ nav }) {
  const [sel,  setSel]  = React.useState(null)
  const [filt, setFilt] = React.useState('todos')
  const [mapReady, setMapReady] = React.useState(false)

  const visible = CLIENTES.filter((c) => filt === 'todos' || c.tipo === filt)

  useEffect(() => {
    // Cargar Leaflet CSS dinámicamente
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // Pequeño delay para asegurar que CSS cargue
    setTimeout(() => setMapReady(true), 100)

    return () => document.head.removeChild(link)
  }, [])

  useEffect(() => {
    if (!mapReady) return

    // Limpiar mapa anterior si existe
    const container = document.getElementById('rutapet-map')
    if (!container) return
    if (container._leaflet_id) return

    const L = window.L
    if (!L) return

    // Centrar en Caracas
    const map = L.map('rutapet-map').setView([10.48, -66.87], 12)

    // Tiles de OpenStreetMap (GRATIS)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Colores por nivel
    const colores = { alto: '#22C55E', medio: '#EAB308', bajo: '#EF4444' }

    // Agregar pines de clientes
    CLIENTES.filter(c => filt === 'todos' || c.tipo === filt).forEach((c) => {
      const color = colores[c.nivel] || '#94A3B8'
      const letra = { veterinaria: 'V', petshop: 'P', agropecuaria: 'A' }[c.tipo] || '?'

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${color};
          border:3px solid white;
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:14px;color:white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          font-family:Nunito,sans-serif;
        ">${letra}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)

      marker.bindPopup(`
        <div style="font-family:Nunito,sans-serif;min-width:180px;">
          <p style="font-weight:800;font-size:14px;margin:0 0 4px">${c.nombre}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 4px">${c.contacto}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 8px">${c.telefono}</p>
          <div style="display:flex;gap:6px;">
            <span style="background:${colores[c.nivel]}20;color:${colores[c.nivel]};font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">
              Nivel ${c.nivel}
            </span>
            <span style="background:#E0F2F1;color:#0F4C41;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">
              ${c.tipo}
            </span>
          </div>
          ${c.deuda > 0 ? `<p style="margin:8px 0 0;font-size:12px;color:#EF4444;font-weight:700;">Debe $${c.deuda.toFixed(2)}</p>` : ''}
        </div>
      `)
    })

    return () => map.remove()
  }, [mapReady, filt])

  return (
    <div className="screen-enter" style={{ background: '#F1F5F9', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#0B1929', padding: '20px 14px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Mapa de clientes</h1>
          <span style={{ fontSize: 13, color: '#0FBCAA', fontWeight: 700 }}>{visible.length} visibles</span>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {['todos', 'veterinaria', 'petshop', 'agropecuaria'].map((t) => (
            <button key={t} onClick={() => { setFilt(t); setSel(null) }}
              style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', background: filt === t ? '#0FBCAA' : '#ffffff20', color: '#fff', border: 'none', flexShrink: 0 }}>
              {t === 'todos' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa Leaflet */}
      <div style={{ position: 'relative' }}>
        {!mapReady && (
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F5E9' }}>
            <p style={{ fontSize: 14, color: '#94A3B8' }}>Cargando mapa...</p>
          </div>
        )}
        <div id="rutapet-map" style={{ height: 320, display: mapReady ? 'block' : 'none' }} />
      </div>

      {/* Script de Leaflet */}
      {mapReady && !window.L && (
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
      )}

      {/* Leyenda */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          {[['● Alto', '#22C55E'], ['● Medio', '#EAB308'], ['● Bajo', '#EF4444']].map(([l, c]) => (
            <span key={l} style={{ fontSize: 12, color: c, fontWeight: 700 }}>{l}</span>
          ))}
          <span style={{ fontSize: 12, color: '#94A3B8' }}>· V=Vet · P=Pet · A=Agro</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Button icon="nav" fullWidth>Crear ruta hoy</Button>
          <Button icon="target" variant="secondary" fullWidth>Cercanos a mí</Button>
        </div>
      </div>

      <div style={{ height: 90 }} />
    </div>
  )
}

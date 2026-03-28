import { useState, useEffect, useRef } from 'react'
import { C, nivelColor, nivelBg, nivelTxt, tipoColor, tipoIconName } from '../../constants/colors'
import { CLIENTES } from '../../constants/data'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function MapScreen({ nav }) {
  const [sel,  setSel]  = useState(null)
  const [filt, setFilt] = useState('todos')
  const mapRef          = useRef(null)
  const mapInstanceRef  = useRef(null)
  const markersRef      = useRef([])

  const visible = CLIENTES.filter((c) => filt === 'todos' || c.tipo === filt)

  // Inicializar mapa una sola vez
  useEffect(() => {
    let L
    let map

    const init = async () => {
      // Importar Leaflet dinámicamente
      const leaflet = await import('leaflet')
      L = leaflet.default

      // Fix iconos por defecto de Leaflet en Vite
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current || mapInstanceRef.current) return

      // Crear mapa centrado en Caracas
      map = L.map(mapRef.current).setView([10.48, -66.87], 12)
      mapInstanceRef.current = map

      // Tiles OpenStreetMap — 100% gratis
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      agregarPines(L, map, 'todos')
    }

    init()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Actualizar pines cuando cambia el filtro
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    import('leaflet').then(({ default: L }) => {
      // Quitar pines anteriores
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      agregarPines(L, map, filt)
    })
  }, [filt])

  const agregarPines = (L, map, filtro) => {
    const colores = { alto: '#22C55E', medio: '#EAB308', bajo: '#EF4444' }
    const letras  = { veterinaria: 'V', petshop: 'P', agropecuaria: 'A' }

    const clientesFiltrados = CLIENTES.filter(c => filtro === 'todos' || c.tipo === filtro)

    clientesFiltrados.forEach((c) => {
      const color = colores[c.nivel] || '#94A3B8'
      const letra = letras[c.tipo] || '?'

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${color};
          border:3px solid white;
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:14px;color:white;
          box-shadow:0 3px 10px rgba(0,0,0,0.3);
          font-family:Nunito,sans-serif;
          cursor:pointer;
        ">${letra}</div>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 18],
        popupAnchor:[0, -20],
      })

      const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)

      marker.bindPopup(`
        <div style="font-family:Nunito,sans-serif;min-width:200px;padding:4px;">
          <p style="font-weight:800;font-size:15px;margin:0 0 4px;color:#1E293B;">${c.nombre}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 2px;">👤 ${c.contacto}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 8px;">📞 ${c.telefono}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 8px;">📍 ${c.direccion}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="background:${color}20;color:${color};font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">
              ● Nivel ${c.nivel}
            </span>
            <span style="background:#E0F2F1;color:#0F4C41;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">
              ${c.tipo}
            </span>
          </div>
          ${c.deuda > 0
            ? `<p style="margin:8px 0 0;font-size:12px;color:#EF4444;font-weight:700;">💳 Debe $${c.deuda.toFixed(2)}</p>`
            : `<p style="margin:8px 0 0;font-size:12px;color:#22C55E;font-weight:700;">✓ Sin deuda</p>`
          }
          <p style="font-size:11px;color:#94A3B8;margin:6px 0 0;">Última visita: ${c.ultimaVisita}</p>
        </div>
      `, { maxWidth: 250 })

      markersRef.current.push(marker)
    })
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 14px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Mapa de clientes</h1>
          <span style={{ fontSize: 13, color: C.teal, fontWeight: 700 }}>{visible.length} visibles</span>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {['todos', 'veterinaria', 'petshop', 'agropecuaria'].map((t) => (
            <button
              key={t}
              onClick={() => { setFilt(t); setSel(null) }}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
                background: filt === t ? C.teal : '#ffffff20', color: '#fff',
                border: 'none', flexShrink: 0,
              }}
            >
              {t === 'todos' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa real */}
      <div
        ref={mapRef}
        style={{ height: 350, width: '100%', zIndex: 1 }}
      />

      {/* Leyenda y acciones */}
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: C.green,  fontWeight: 700 }}>● Alto</span>
          <span style={{ fontSize: 12, color: C.yellow, fontWeight: 700 }}>● Medio</span>
          <span style={{ fontSize: 12, color: C.red,    fontWeight: 700 }}>● Bajo</span>
          <span style={{ fontSize: 12, color: C.gray400 }}>V=Vet · P=Pet · A=Agro</span>
        </div>

        <p style={{ fontSize: 13, color: C.gray400, marginBottom: 12, textAlign: 'center' }}>
          Toca un pin en el mapa para ver los detalles del cliente
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Button icon="nav"    fullWidth>Crear ruta hoy</Button>
          <Button icon="target" variant="secondary" fullWidth>Cercanos a mí</Button>
        </div>
      </div>

      <div style={{ height: 90 }} />
    </div>
  )
}

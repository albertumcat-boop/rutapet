import { useState, useEffect, useRef } from 'react'
import { C, nivelColor } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function MapScreen({ nav, onBack }) {
  const { clientes } = useAppData()
  const { config }   = useConfig()

  const [filt,        setFilt]        = useState('todos')
  const [buscandoGPS, setBuscandoGPS] = useState(false)
  const [cercanos,    setCercanos]    = useState([])
  const [mapReady,    setMapReady]    = useState(false)
  const mapRef         = useRef()
  const mapInstanceRef = useRef()
  const markersRef     = useRef([])
  const miPinRef       = useRef()

  const visible   = clientes.filter(c => filt === 'todos' || c.tipo === filt)
  const conGPS    = visible.filter(c => c.lat && c.lng).length
  const sinGPS    = visible.filter(c => !c.lat || !c.lng).length

  // ── Obtener color y letra del tipo desde config ──────
  const getTipoColor = (key) => {
    const t = config.tiposCliente.find(t => t.key === key)
    return t?.color || '#94A3B8'
  }
  const getTipoLetra = (key) => {
    const t = config.tiposCliente.find(t => t.key === key)
    return t?.label?.charAt(0).toUpperCase() || '?'
  }
  const getTipoLabel = (key) => {
    const t = config.tiposCliente.find(t => t.key === key)
    return t?.label || key
  }
  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin registro'
    if (fecha?.toDate) return fecha.toDate().toLocaleDateString('es-VE')
    return fecha
  }

  // ── Inicializar mapa con posición real del usuario ────
  useEffect(() => {
    const init = async () => {
      const leaflet = await import('leaflet')
      const L = leaflet.default
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      if (!mapRef.current || mapInstanceRef.current) return

      // Primer cliente con coords como fallback si no hay GPS
      const primerCliente = clientes.find(c => c.lat && c.lng)
      const fallback = primerCliente
        ? [primerCliente.lat, primerCliente.lng]
        : [10.48, -66.87]

      // Crear mapa con fallback, luego mover a posición real si el usuario la permite
      const map = L.map(mapRef.current).setView(fallback, 13)
      mapInstanceRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)
      setTimeout(() => map.invalidateSize(), 100)
      setMapReady(true)

      // Intentar centrar en posición real del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords
            map.setView([lat, lng], 13)
            // Poner pin "Tú estás aquí" silencioso al abrir
            const miIcon = L.divIcon({
              className: '',
              html: `<div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 4px #3B82F640;"></div>`,
              iconSize: [18, 18], iconAnchor: [9, 9],
            })
            if (miPinRef.current) { miPinRef.current.remove() }
            miPinRef.current = L.marker([lat, lng], { icon: miIcon })
              .addTo(map)
              .bindPopup('<b style="font-family:Nunito">📍 Tú estás aquí</b>')
          },
          () => { /* sin permiso → quedarse en fallback, sin alert */ },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        )
      }
    }
    init()
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Agregar/actualizar pines cuando cambian clientes o filtro ──
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapReady) return
    import('leaflet').then(({ default: L }) => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      const filtrados = clientes.filter(c => filt === 'todos' || c.tipo === filt)
      filtrados.forEach(c => {
        if (!c.lat || !c.lng) return
        const color = nivelColor(c.nivel)
        const letra = getTipoLetra(c.tipo)
        const icon  = L.divIcon({
          className: '',
          html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:white;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-family:Nunito,sans-serif;cursor:pointer;">${letra}</div>`,
          iconSize:   [36, 36],
          iconAnchor: [18, 18],
          popupAnchor:[0, -20],
        })
        const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)
        marker.bindPopup(`
          <div style="font-family:Nunito,sans-serif;min-width:200px;padding:4px;">
            <p style="font-weight:800;font-size:15px;margin:0 0 4px;color:#1E293B;">${c.nombre}</p>
            <p style="font-size:12px;color:#475569;margin:0 0 2px;">👤 ${c.contacto || ''}</p>
            <p style="font-size:12px;color:#475569;margin:0 0 8px;">📞 ${c.telefono || ''}</p>
            <p style="font-size:12px;color:#475569;margin:0 0 8px;">📍 ${c.direccion || ''}</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span style="background:${color}20;color:${color};font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">● Nivel ${c.nivel || 'medio'}</span>
              <span style="background:#E0F2F1;color:#0F4C41;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">${getTipoLabel(c.tipo)}</span>
            </div>
            ${c.deuda > 0
              ? `<p style="margin:8px 0 0;font-size:12px;color:#EF4444;font-weight:700;">💳 Debe $${Number(c.deuda).toFixed(2)}</p>`
              : `<p style="margin:8px 0 0;font-size:12px;color:#22C55E;font-weight:700;">✓ Sin deuda</p>`
            }
            <p style="font-size:11px;color:#94A3B8;margin:6px 0 0;">Última visita: ${formatFecha(c.ultimaVisita)}</p>
          </div>
        `, { maxWidth: 250 })
        markersRef.current.push(marker)
      })
    })
  }, [clientes, filt, mapReady, config])

  // ── Helper: colocar/actualizar pin "Tú estás aquí" ───
  const colocarMiPin = (L, map, lat, lng, abrirPopup = false) => {
    if (miPinRef.current) { miPinRef.current.remove(); miPinRef.current = null }
    const miIcon = L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 4px #3B82F640;"></div>`,
      iconSize: [18, 18], iconAnchor: [9, 9],
    })
    const marker = L.marker([lat, lng], { icon: miIcon })
      .addTo(map)
      .bindPopup('<b style="font-family:Nunito">📍 Tú estás aquí</b>')
    if (abrirPopup) marker.openPopup()
    miPinRef.current = marker
  }

  // ── CERCANOS A MÍ ─────────────────────────────────────
  const handleCercanos = () => {
    if (!navigator.geolocation) { alert('Tu dispositivo no soporta GPS'); return }
    setBuscandoGPS(true)
    setCercanos([])

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const myLat = pos.coords.latitude
        const myLng = pos.coords.longitude
        setBuscandoGPS(false)

        const distancia = (lat1, lng1, lat2, lng2) => {
          const R    = 6371
          const dLat = (lat2 - lat1) * Math.PI / 180
          const dLng = (lng2 - lng1) * Math.PI / 180
          const a    = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        }

        const conDistancia = clientes
          .filter(c => c.lat && c.lng)
          .map(c => ({ ...c, distanciaKm: distancia(myLat, myLng, c.lat, c.lng) }))
          .sort((a, b) => a.distanciaKm - b.distanciaKm)

        setCercanos(conDistancia.slice(0, 5))

        const map = mapInstanceRef.current
        if (map) {
          import('leaflet').then(({ default: L }) => {
            colocarMiPin(L, map, myLat, myLng, true)
            map.setView([myLat, myLng], 14)
          })
        }
      },
      (err) => {
        setBuscandoGPS(false)
        const msgs = {
          1: 'Permiso denegado. Actívalo en ajustes del navegador.',
          2: 'No se pudo obtener la ubicación.',
          3: 'Tiempo de espera agotado.',
        }
        alert(msgs[err.code] || 'Error de GPS')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>

      {/* TopBar solo en mobile (el Sidebar ya navega en desktop) */}
      {onBack && <TopBar title="Mapa de clientes" onBack={onBack} />}

      {/* Header */}
      <div style={{ background: C.navy, padding: onBack ? '0 14px 14px' : '20px 14px 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:0 }}>Mapa de clientes</h1>
          <div style={{ textAlign:'right' }}>
            <span style={{ fontSize:13, color:C.teal, fontWeight:700 }}>{conGPS} en mapa</span>
            {sinGPS > 0 && (
              <span style={{ fontSize:11, color:'#FCA5A5', fontWeight:600, display:'block' }}>{sinGPS} sin GPS</span>
            )}
          </div>
        </div>

        {/* Filtros dinámicos desde config */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          <button
            onClick={() => setFilt('todos')}
            style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', background:filt==='todos'?C.teal:'#ffffff20', color:'#fff', border:'none', flexShrink:0 }}>
            Todos
          </button>
          {config.tiposCliente.map(t => (
            <button
              key={t.key}
              onClick={() => setFilt(t.key)}
              style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', background:filt===t.key?t.color:'#ffffff20', color:'#fff', border:'none', flexShrink:0 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa Leaflet */}
     <div ref={mapRef} style={{ height:340, width:'100%', zIndex:1, display:'block', position:'relative' }} />

      {/* Botones de acción */}
      <div style={{ padding:'14px 14px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <button
            onClick={() => nav('routes')}
            style={{ padding:'12px', borderRadius:14, background:C.teal, border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontWeight:700, fontSize:14, color:'#fff' }}>
            <Icon name="route" size={18} color="#fff" />
            Crear ruta hoy
          </button>
          <button
            onClick={handleCercanos}
            disabled={buscandoGPS}
            style={{ padding:'12px', borderRadius:14, background:'transparent', border:`1.5px solid ${C.teal}`, cursor:buscandoGPS?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontWeight:700, fontSize:14, color:C.teal, opacity:buscandoGPS?0.7:1 }}>
            {buscandoGPS
              ? <><span style={{ width:16, height:16, border:`2px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Buscando...</>
              : <><Icon name="target" size={18} color={C.teal} />Cercanos a mí</>
            }
          </button>
        </div>

        {/* Aviso sin GPS */}
        {sinGPS > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FFF7ED', border:'1px solid #FDBA74', borderRadius:12, padding:'8px 12px', marginBottom:10 }}>
            <Icon name="alert" size={15} color="#F97316" />
            <p style={{ fontSize:12, color:'#9A3412', margin:0, flex:1 }}>
              <b>{sinGPS} cliente{sinGPS>1?'s':''}</b> sin coordenadas GPS no aparece{sinGPS>1?'n':''} en el mapa.
              Edítalos para añadir ubicación.
            </p>
          </div>
        )}

        {/* Leyenda */}
        <div style={{ display:'flex', gap:14, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:12, color:C.green,   fontWeight:700 }}>● Alto</span>
          <span style={{ fontSize:12, color:C.yellow,  fontWeight:700 }}>● Medio</span>
          <span style={{ fontSize:12, color:C.red,     fontWeight:700 }}>● Bajo</span>
          <span style={{ fontSize:12, color:'#3B82F6', fontWeight:700 }}>● Tú</span>
        </div>
      </div>

      {/* Lista cercanos */}
      {cercanos.length > 0 && (
        <div style={{ padding:'0 14px' }}>
          <p style={{ fontSize:14, fontWeight:800, color:C.gray800, marginBottom:10 }}>
            📍 Clientes más cercanos a ti
          </p>
          {cercanos.map((c, i) => (
            <Card key={c.id} onClick={() => nav('clientDetail', c)}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:C.teal+'20', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:C.teal }}>#{i+1}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {c.nombre}
                  </p>
                  <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>
                    {getTipoLabel(c.tipo)}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:15, fontWeight:800, color:C.teal, margin:0 }}>
                    {c.distanciaKm < 1
                      ? `${Math.round(c.distanciaKm * 1000)} m`
                      : `${c.distanciaKm.toFixed(1)} km`
                    }
                  </p>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:nivelColor(c.nivel), margin:'2px 0 0 auto' }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Sin clientes */}
      {clientes.length === 0 && (
        <div style={{ padding:'30px 14px', textAlign:'center' }}>
          <Icon name="map" size={36} color={C.gray400} />
          <p style={{ fontSize:14, color:C.gray400, marginTop:10 }}>
            Aún no tienes clientes en el mapa
          </p>
          <Button icon="plus" style={{ marginTop:12 }} onClick={() => nav('addClient')}>
            Agregar cliente
          </Button>
        </div>
      )}

      <div style={{ height:90 }} />
    </div>
  )
}

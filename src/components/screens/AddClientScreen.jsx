import { useState, useRef, useEffect } from 'react'
import { C } from '../../constants/colors'
import { useConfig } from '../../context/ConfigContext'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

function comprimirImagen(file, maxWidth = 800, calidad = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', calidad))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function AddClientScreen({ onBack }) {
  const { config } = useConfig()
  const TIPOS = config.tiposCliente

  const [form,         setForm]         = useState({ nombre:'', tipo: TIPOS[0]?.key || '', contacto:'', telefono:'', direccion:'', notas:'' })
  const [foto,         setFoto]         = useState(null)
  const [fotoSize,     setFotoSize]     = useState(null)
  const [comprimiendo, setComprimiendo] = useState(false)
  const [ubicacion,    setUbicacion]    = useState(null)
  const [buscandoGPS,  setBuscandoGPS]  = useState(false)
  const [gpsError,     setGpsError]     = useState('')
  const [mapListo,     setMapListo]     = useState(false)
  const [done,         setDone]         = useState(false)
  const fileRef  = useRef()
  const mapRef   = useRef()
  const mapInst  = useRef()
  const markerRef= useRef()

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const originalKB = Math.round(file.size / 1024)
    setComprimiendo(true)
    try {
      const base64 = await comprimirImagen(file, 800, 0.7)
      const comprimidoKB = Math.round((base64.length * 0.75) / 1024)
      setFoto(base64)
      setFotoSize({ original: originalKB, comprimido: comprimidoKB })
    } catch { alert('Error al procesar la imagen') }
    finally { setComprimiendo(false) }
  }

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) { setGpsError('Tu dispositivo no soporta GPS'); return }
    setBuscandoGPS(true)
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUbicacion({ lat, lng })
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'es' } })
          const data = await res.json()
          if (data.display_name) {
            const parts = data.display_name.split(',')
            upd('direccion', parts.slice(0, 3).join(',').trim())
          }
        } catch {}
        setBuscandoGPS(false)
        setMapListo(true)
      },
      (err) => {
        setBuscandoGPS(false)
        const msgs = { 1:'Permiso denegado.', 2:'No se pudo obtener la ubicación.', 3:'Tiempo agotado.' }
        setGpsError(msgs[err.code] || 'Error de GPS')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (!mapListo || !ubicacion || !mapRef.current) return
    if (mapInst.current) {
      mapInst.current.setView([ubicacion.lat, ubicacion.lng], 16)
      if (markerRef.current) markerRef.current.setLatLng([ubicacion.lat, ubicacion.lng])
      return
    }
    import('leaflet').then(({ default: L }) => {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      const map = L.map(mapRef.current).setView([ubicacion.lat, ubicacion.lng], 16)
      mapInst.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap', maxZoom:19 }).addTo(map)
      const marker = L.marker([ubicacion.lat, ubicacion.lng], { draggable:true }).addTo(map)
      markerRef.current = marker
      marker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng()
        setUbicacion({ lat, lng })
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers:{ 'Accept-Language':'es' } })
          const data = await res.json()
          if (data.display_name) upd('direccion', data.display_name.split(',').slice(0,3).join(',').trim())
        } catch {}
      })
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng
        setUbicacion({ lat, lng })
        marker.setLatLng([lat, lng])
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers:{ 'Accept-Language':'es' } })
          const data = await res.json()
          if (data.display_name) upd('direccion', data.display_name.split(',').slice(0,3).join(',').trim())
        } catch {}
      })
    })
    return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null } }
  }, [mapListo, ubicacion?.lat, ubicacion?.lng])

  if (done) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
        <Icon name="ok_circle" size={36} color={C.green} />
      </div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.gray800 }}>¡Cliente guardado!</h2>
      {ubicacion && <p style={{ fontSize:13, color:C.teal, fontWeight:700, marginTop:4 }}>📍 Ubicación guardada en el mapa</p>}
    </div>
  )

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Nuevo cliente" onBack={onBack} />
      <div style={{ padding:14 }}>

        {/* Foto */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:18 }}>
          <div onClick={() => fileRef.current.click()}
            style={{ width:100, height:100, borderRadius:22, background:foto?'transparent':C.gray100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', border:`2px dashed ${foto?C.teal:C.gray200}`, overflow:'hidden', position:'relative' }}>
            {comprimiendo ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <span style={{ width:20, height:20, border:`2px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                <span style={{ fontSize:10, color:C.gray400 }}>Comprimiendo...</span>
              </div>
            ) : foto ? (
              <>
                <img src={foto} alt="foto" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.5)', padding:'4px 0', textAlign:'center' }}>
                  <span style={{ fontSize:9, color:'#fff', fontWeight:700 }}>Cambiar foto</span>
                </div>
              </>
            ) : (
              <>
                <Icon name="camera" size={26} color={C.gray400} />
                <span style={{ fontSize:11, color:C.gray400, marginTop:6 }}>Agregar foto</span>
              </>
            )}
          </div>
          {fotoSize && (
            <div style={{ marginTop:8, background:'#DCFCE7', borderRadius:10, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
              <Icon name="ok_circle" size={13} color={C.green} />
              <span style={{ fontSize:11, color:'#166534', fontWeight:700 }}>
                {fotoSize.original} KB → {fotoSize.comprimido} KB ({Math.round((1 - fotoSize.comprimido / fotoSize.original) * 100)}% menos)
              </span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} style={{ display:'none' }} />
        </div>

        {/* Tipo de cliente — DINÁMICO */}
        <Card>
          <p style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:10 }}>Tipo de cliente</p>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(TIPOS.length, 3)},1fr)`, gap:8 }}>
            {TIPOS.map(t => (
              <button key={t.key} onClick={() => upd('tipo', t.key)}
                style={{ padding:'10px 6px', borderRadius:12, border:`2px solid ${form.tipo===t.key?t.color:C.gray200}`, background:form.tipo===t.key?t.color+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
                <Icon name={t.icon} size={20} color={t.color} style={{ display:'block', margin:'0 auto 4px' }} />
                <span style={{ fontSize:11, fontWeight:700, color:form.tipo===t.key?t.color:C.gray600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Campos */}
        {[
          { key:'nombre',   label:'Nombre del negocio *', placeholder:'Ej: Distribuidora García' },
          { key:'contacto', label:'Contacto',              placeholder:'Ej: Juan García'          },
          { key:'telefono', label:'Teléfono',              placeholder:'+58 412-XXX-XXXX'         },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>{f.label}</label>
            <input value={form[f.key]} onChange={e => upd(f.key, e.target.value)} placeholder={f.placeholder}
              style={{ width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
        ))}

        {/* Dirección + GPS */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Dirección</label>
          <input value={form.direccion} onChange={e => upd('direccion', e.target.value)}
            placeholder="Se llena automáticamente con GPS..."
            style={{ width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', marginBottom:8 }} />
          <button onClick={usarMiUbicacion} disabled={buscandoGPS}
            style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid ${C.teal}`, background:C.teal+'10', cursor:buscandoGPS?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', fontWeight:700, fontSize:14, color:C.teal }}>
            {buscandoGPS
              ? <><span style={{ width:16, height:16, border:`2px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Detectando...</>
              : <><Icon name="target" size={16} color={C.teal} />{ubicacion ? '📍 Ubicación detectada — actualizar' : 'Usar mi ubicación actual (GPS)'}</>
            }
          </button>
          {gpsError && <p style={{ fontSize:12, color:C.red, marginTop:6, fontWeight:600 }}>⚠️ {gpsError}</p>}
        </div>

        {/* Mini mapa */}
        {mapListo && ubicacion && (
          <div style={{ marginBottom:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <label style={{ fontSize:13, fontWeight:700, color:C.gray600 }}>Ubicación en el mapa</label>
              <span style={{ fontSize:11, color:C.gray400 }}>Arrastra el pin para ajustar</span>
            </div>
            <div ref={mapRef} style={{ height:220, borderRadius:14, overflow:'hidden', border:`1.5px solid ${C.teal}`, zIndex:1 }} />
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
              <Icon name="ok_circle" size={14} color={C.green} />
              <span style={{ fontSize:11, color:'#166534', fontWeight:700 }}>
                Lat: {ubicacion.lat.toFixed(5)} · Lng: {ubicacion.lng.toFixed(5)}
              </span>
            </div>
          </div>
        )}

        {/* Notas */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Notas (opcional)</label>
          <textarea value={form.notas} onChange={e => upd('notas', e.target.value)}
            placeholder="Preferencias, observaciones..." rows={3}
            style={{ width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }} />
        </div>

        <Button icon="ok_circle" size="lg" fullWidth
          onClick={() => {
            if (!form.nombre) { alert('El nombre es obligatorio'); return }
            setDone(true)
            setTimeout(onBack, 1600)
          }}>
          Guardar cliente {ubicacion ? '📍' : ''}
        </Button>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

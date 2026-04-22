import { useState, useEffect } from 'react'
import { C, nivelColor } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { agregarRuta, actualizarRuta, eliminarRuta as deleteRuta } from '../../services/firestore'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function RoutesScreen({ onBack }) {
  const { clientes, rutas: rutasFirebase, recargar } = useAppData()
  const [rutas,     setRutas]     = useState([])
  const [open,      setOpen]      = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [nombre,    setNombre]    = useState('')
  const [fecha,     setFecha]     = useState(new Date().toISOString().split('T')[0])
  const [selCls,    setSelCls]    = useState([])
  const [guardado,  setGuardado]  = useState(false)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => { setRutas(rutasFirebase) }, [rutasFirebase])

  const toggleCliente = (id) =>
    setSelCls(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const handleGuardar = async () => {
    if (!nombre || selCls.length === 0) return
    setSaving(true)
    try {
      const ref = await agregarRuta({ nombre, clientes:selCls, fecha, estado:'pendiente', km:0 })
      setRutas(prev => [{ id:ref.id, nombre, clientes:selCls, fecha, estado:'pendiente', km:0 }, ...prev])
      setGuardado(true)
      setTimeout(() => {
        setShowForm(false); setGuardado(false)
        setNombre(''); setSelCls([])
        setFecha(new Date().toISOString().split('T')[0])
      }, 1500)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const marcarCompletada = async (id, e) => {
    e.stopPropagation()
    const ruta = rutas.find(r => r.id === id)
    const nuevoEstado = ruta.estado === 'completada' ? 'pendiente' : 'completada'
    setRutas(prev => prev.map(r => r.id === id ? { ...r, estado:nuevoEstado } : r))
    await actualizarRuta(id, { estado:nuevoEstado })
  }

  const handleEliminar = async (id, e) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta ruta?')) return
    setRutas(prev => prev.filter(r => r.id !== id))
    if (open === id) setOpen(null)
    await deleteRuta(id)
  }

  // Iniciar ruta desde ubicación actual en Google Maps
  const iniciarRutaGPS = (e, cls) => {
    e.stopPropagation()
    if (cls.length === 0) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          // Construir URL con waypoints para todos los clientes
          const destino     = cls[cls.length - 1]
          const waypoints   = cls.slice(0, -1).map(c => `${c.lat},${c.lng}`).join('|')
          const origin      = `${latitude},${longitude}`
          const destination = `${destino.lat},${destino.lng}`
          let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
          if (waypoints) url += `&waypoints=${waypoints}`
          window.open(url, '_blank')
        },
        () => {
          // Si falla el GPS, usar el primer cliente como origen
          const first = cls[0]
          const rest  = cls.slice(1)
          let url = `https://www.google.com/maps/dir/?api=1&origin=${first.lat},${first.lng}&destination=${cls[cls.length-1].lat},${cls[cls.length-1].lng}&travelmode=driving`
          if (rest.length > 1) url += `&waypoints=${rest.slice(0,-1).map(c=>`${c.lat},${c.lng}`).join('|')}`
          window.open(url, '_blank')
        },
        { enableHighAccuracy:true, timeout:5000 }
      )
    } else {
      const first = cls[0]
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${first.lat},${first.lng}`, '_blank')
    }
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar
        title="Rutas"
        onBack={onBack}
        right={
          <button onClick={() => setShowForm(true)}
            style={{ background:C.teal, border:'none', borderRadius:10, padding:'6px 12px', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            <Icon name="plus" size={14} color="#fff" /> Nueva
          </button>
        }
      />

      <div style={{ background:C.navy, padding:'0 14px 14px' }}>
        <p style={{ fontSize:13, color:C.gray400, margin:0 }}>
          {rutas.length} ruta{rutas.length!==1?'s':''} · {rutas.filter(r=>r.estado==='pendiente').length} pendientes
        </p>
      </div>

      <div style={{ padding:14 }}>
        {rutas.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <Icon name="route" size={40} color={C.gray400} />
            <p style={{ fontSize:14, color:C.gray400, marginTop:12 }}>Sin rutas. Crea tu primera ruta.</p>
            <Button icon="plus" style={{ marginTop:16 }} onClick={() => setShowForm(true)}>Crear ruta</Button>
          </div>
        ) : rutas.map(r => {
          const isOpen = open === r.id
          const cls    = clientes.filter(c => (r.clientes||[]).includes(c.id))
          const stBg   = r.estado==='completada'?'#DCFCE7':'#FEF9C3'
          const stTxt  = r.estado==='completada'?'#166534':'#854D0E'

          return (
            <Card key={r.id} onClick={() => setOpen(isOpen?null:r.id)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:15, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.nombre}</p>
                  <p style={{ fontSize:12, color:C.gray400, marginTop:2 }}>{r.fecha}</p>
                  <div style={{ display:'flex', gap:14, marginTop:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Icon name="pin" size={13} color={C.teal} />
                      <span style={{ fontSize:12, fontWeight:600, color:C.gray600 }}>{(r.clientes||[]).length} paradas</span>
                    </div>
                    {r.km > 0 && (
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <Icon name="truck" size={13} color={C.amber} />
                        <span style={{ fontSize:12, fontWeight:600, color:C.gray600 }}>{r.km} km</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge bg={stBg} txt={stTxt}>{r.estado==='completada'?'✓ Completada':'Pendiente'}</Badge>
              </div>

              {isOpen && (
                <>
                  <div style={{ borderTop:`1px solid ${C.gray200}`, paddingTop:12, marginTop:12, marginBottom:12 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:8 }}>Paradas en orden:</p>
                    {cls.length === 0
                      ? <p style={{ fontSize:12, color:C.gray400 }}>Sin clientes asignados</p>
                      : cls.map((c,i) => (
                          <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                            <div style={{ width:24, height:24, borderRadius:'50%', background:C.teal+'20', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontSize:11, fontWeight:800, color:C.teal }}>{i+1}</span>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:13, fontWeight:600, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.nombre}</p>
                              <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{c.direccion}</p>
                            </div>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:nivelColor(c.nivel), flexShrink:0 }} />
                          </div>
                        ))
                    }
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {/* Iniciar desde mi ubicación GPS */}
                    <button onClick={e => iniciarRutaGPS(e, cls)}
                      style={{ flex:1, minWidth:140, padding:'10px', borderRadius:12, background:C.teal, border:'none', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      <Icon name="nav" size={15} color="#fff" />
                      Iniciar desde mi ubicación
                    </button>
                    <button onClick={e => marcarCompletada(r.id, e)}
                      style={{ flex:1, minWidth:140, padding:'10px', borderRadius:12, background:'transparent', border:`1.5px solid ${C.teal}`, color:C.teal, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      <Icon name="ok_circle" size={15} color={C.teal} />
                      {r.estado==='completada'?'Marcar pendiente':'Marcar completada'}
                    </button>
                    <button onClick={e => handleEliminar(r.id, e)}
                      style={{ width:'100%', padding:'10px', borderRadius:12, border:'1px solid #FEE2E2', background:'#FFF5F5', color:C.red, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      Eliminar ruta
                    </button>
                  </div>
                </>
              )}
            </Card>
          )
        })}

        <div style={{ background:`linear-gradient(135deg,${C.navy},#1E2F47)`, borderRadius:16, padding:'16px', border:`1px solid ${C.teal}30`, marginTop:4 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Icon name="zap" size={16} color={C.amber} />
            <span style={{ fontSize:13, fontWeight:700, color:C.amber }}>Próximamente — IA de rutas</span>
          </div>
          <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>Optimización automática por cercanía y probabilidad de compra.</p>
        </div>
      </div>

      {/* Modal nueva ruta */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            {guardado ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <Icon name="ok_circle" size={32} color={C.green} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:C.gray800 }}>¡Ruta creada!</h3>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <h3 style={{ fontSize:17, fontWeight:800, color:C.gray800, margin:0 }}>Nueva ruta</h3>
                  <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer' }}>
                    <Icon name="x_circle" size={22} color={C.gray400} />
                  </button>
                </div>

                <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Nombre de la ruta *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Ruta Norte — Lunes"
                  style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', marginBottom:14 }} />

                <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Fecha</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                  style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', marginBottom:14 }} />

                <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:8 }}>
                  Selecciona clientes ({selCls.length} seleccionados)
                </label>

                {clientes.length === 0 ? (
                  <p style={{ fontSize:13, color:C.gray400, textAlign:'center', padding:'16px 0' }}>
                    No tienes clientes aún.
                  </p>
                ) : clientes.map(c => (
                  <div key={c.id} onClick={() => toggleCliente(c.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, marginBottom:6, cursor:'pointer', background:selCls.includes(c.id)?C.teal+'10':'#F8FAFC', border:`1.5px solid ${selCls.includes(c.id)?C.teal:'#E2E8F0'}` }}>
                    <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${selCls.includes(c.id)?C.teal:'#E2E8F0'}`, background:selCls.includes(c.id)?C.teal:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {selCls.includes(c.id) && <Icon name="ok_circle" size={12} color="#fff" />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.nombre}</p>
                      <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{c.direccion}</p>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop:16 }}>
                  <Button icon="ok_circle" size="lg" fullWidth disabled={!nombre||selCls.length===0||saving} onClick={handleGuardar}>
                    {saving ? 'Guardando...' : `Crear ruta con ${selCls.length} cliente${selCls.length!==1?'s':''}`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ height:90 }} />
    </div>
  )
}

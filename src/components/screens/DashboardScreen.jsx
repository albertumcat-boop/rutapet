import { useState } from 'react'
import { C, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { fmtUSD, daysSince, sumVentas, sumDeuda, clientesInactivos } from '../../utils/helpers'
import { auth } from '../../../firebase/firebase.config'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import KpiCard from '../shared/KpiCard'
import Avatar from '../shared/Avatar'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function DashboardScreen({ nav }) {
  const { clientes, ventas, rutas, loading } = useAppData()
  const { config } = useConfig()
  const [showNotif, setShowNotif] = useState(false)

  const user   = auth.currentUser
  const nombre = user?.displayName || user?.email?.split('@')[0] || 'Usuario'
  const avatar = nombre.slice(0, 2).toUpperCase()

  const total   = sumVentas(ventas)
  const deuda   = sumDeuda(clientes)
  const inact   = clientesInactivos(clientes, 30)
  const conDeuda = clientes.filter(c => c.deuda > 0)
  const rutaHoy  = rutas.find(r => r.estado === 'pendiente')

  // ── Notificaciones calculadas desde datos reales ──
  const notificaciones = [
    ...inact.map(c => ({
      id:    `inact-${c.id}`,
      tipo:  'alerta',
      icon:  'calendar',
      color: '#F5A623',
      bg:    '#FEF9C3',
      titulo:`Sin visita: ${c.nombre}`,
      desc:  `Hace ${daysSince(c.ultimaVisita?.toDate?.() || c.ultimaVisita)} días sin visita`,
      onClick: () => { setShowNotif(false); nav('clientDetail', c) },
    })),
    ...conDeuda.map(c => ({
      id:    `deuda-${c.id}`,
      tipo:  'cobro',
      icon:  'dollar',
      color: '#EF4444',
      bg:    '#FEE2E2',
      titulo:`Deuda pendiente: ${c.nombre}`,
      desc:  `Debe ${fmtUSD(c.deuda)}`,
      onClick: () => { setShowNotif(false); nav('payments') },
    })),
    ...rutas.filter(r => r.estado === 'pendiente').map(r => ({
      id:    `ruta-${r.id}`,
      tipo:  'ruta',
      icon:  'route',
      color: C.teal,
      bg:    '#E0F2F1',
      titulo:`Ruta pendiente: ${r.nombre}`,
      desc:  `${r.clientes?.length || 0} paradas · ${r.fecha}`,
      onClick: () => { setShowNotif(false); nav('routes') },
    })),
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.gray50, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ width:36, height:36, border:`3px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:C.navy, padding:'20px 16px 28px', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:12, color:C.gray400, margin:0 }}>Buenos días,</p>
            <h1 style={{ fontSize:22, fontWeight:900, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {nombre.split(' ')[0]} 👋
            </h1>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
            {/* Campana con panel */}
            <div style={{ position:'relative' }}>
              <button
                onClick={() => setShowNotif(v => !v)}
                style={{ background:'none', border:'none', cursor:'pointer', position:'relative', padding:4, display:'flex' }}>
                <Icon name="bell" size={22} color="#fff" />
                {notificaciones.length > 0 && (
                  <span style={{ position:'absolute', top:0, right:0, width:16, height:16, borderRadius:'50%', background:C.red, fontSize:9, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>
                    {notificaciones.length}
                  </span>
                )}
              </button>

              {/* Panel de notificaciones */}
              {showNotif && (
                <>
                  {/* Overlay para cerrar */}
                  <div
                    onClick={() => setShowNotif(false)}
                    style={{ position:'fixed', inset:0, zIndex:98 }}
                  />
                  <div style={{
                    position:'absolute', top:36, right:-8,
                    width:300, maxWidth:'90vw',
                    background:'#fff', borderRadius:16,
                    boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
                    zIndex:99, overflow:'hidden',
                    border:`1px solid ${C.gray200}`,
                  }}>
                    <div style={{ padding:'14px 16px', borderBottom:`1px solid ${C.gray200}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:14, fontWeight:800, color:C.gray800 }}>Notificaciones</span>
                      <span style={{ fontSize:12, color:C.teal, fontWeight:700 }}>{notificaciones.length} nuevas</span>
                    </div>

                    {notificaciones.length === 0 ? (
                      <div style={{ padding:'24px 16px', textAlign:'center' }}>
                        <Icon name="ok_circle" size={28} color={C.green} />
                        <p style={{ fontSize:13, color:C.gray400, marginTop:8 }}>Todo al día 🎉</p>
                      </div>
                    ) : (
                      <div style={{ maxHeight:320, overflowY:'auto' }}>
                        {notificaciones.map((n, i) => (
                          <div
                            key={n.id}
                            onClick={n.onClick}
                            style={{
                              display:'flex', alignItems:'flex-start', gap:10,
                              padding:'12px 16px',
                              borderBottom: i < notificaciones.length-1 ? `1px solid ${C.gray100}` : 'none',
                              cursor:'pointer',
                              background:'#fff',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background=C.gray50}
                            onMouseLeave={e => e.currentTarget.style.background='#fff'}
                          >
                            <div style={{ width:34, height:34, borderRadius:10, background:n.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Icon name={n.icon} size={16} color={n.color} />
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {n.titulo}
                              </p>
                              <p style={{ fontSize:11, color:C.gray400, margin:'2px 0 0' }}>{n.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ padding:'10px 16px', borderTop:`1px solid ${C.gray200}`, textAlign:'center' }}>
                      <button
                        onClick={() => setShowNotif(false)}
                        style={{ fontSize:12, color:C.teal, fontWeight:700, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Avatar initials={avatar} size={38} />
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Icon name="pin" size={13} color={C.teal} />
          <span style={{ fontSize:12, color:C.gray400 }}>
            {new Date().toLocaleDateString('es-VE', { weekday:'long', day:'numeric', month:'long' })}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ padding:'0 14px', marginTop:-14 }}>
        <div className="kpi-grid">
          <KpiCard label="Ventas totales"  val={fmtUSD(total)} sub={`${ventas.length} transacciones`}               icon="dollar" color={C.teal} />
          <KpiCard label="Deuda pendiente" val={fmtUSD(deuda)} sub={`${conDeuda.length} clientes`}                  icon="card"   color={C.red}  />
        </div>
        <div className="kpi-grid">
          <KpiCard label="Clientes"  val={clientes.length} sub={`${inact.length} inactivos`}                        icon="users"  color="#3B82F6" />
          <KpiCard label="Rutas"     val={rutas.length}    sub={`${rutas.filter(r=>r.estado==='pendiente').length} pendientes`} icon="route" color={C.amber} />
        </div>
      </div>

      {/* Ruta pendiente */}
      {rutaHoy && (
        <div style={{ padding:'14px 14px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Icon name="route" size={16} color={C.teal} />
              <span style={{ fontSize:15, fontWeight:800, color:C.gray800 }}>Ruta pendiente</span>
            </div>
            <button onClick={() => nav('routes')} style={{ fontSize:12, color:C.teal, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Ver todas</button>
          </div>
          <div onClick={() => nav('routes')} style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:16, padding:'16px', cursor:'pointer', border:`1px solid ${C.teal}30`, marginBottom:14 }}>
            <p style={{ fontSize:13, color:C.teal, fontWeight:700, margin:'0 0 4px' }}>📍 {rutaHoy.nombre}</p>
            <p style={{ fontSize:18, fontWeight:900, color:'#fff', margin:'0 0 12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {rutaHoy.clientes?.length || 0} visitas planeadas
            </p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:C.gray400 }}>{rutaHoy.fecha}</span>
              <Button size="sm" icon="nav" onClick={e => e.stopPropagation()}>Iniciar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Alertas inactividad */}
      {inact.length > 0 && (
        <div style={{ padding:'0 14px 14px' }}>
          <p style={{ fontSize:14, fontWeight:800, color:C.gray800, marginBottom:8 }}>⚠️ Clientes inactivos</p>
          {inact.slice(0, 3).map(c => (
            <div key={c.id} onClick={() => nav('clientDetail', c)}
              style={{ display:'flex', alignItems:'center', gap:10, background:'#FEF9C3', borderRadius:12, padding:'10px 12px', marginBottom:8, border:'1px solid #FDE047', cursor:'pointer' }}>
              <Icon name="alert" size={16} color="#854D0E" />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#854D0E', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.nombre}</p>
                <p style={{ fontSize:11, color:'#A16207', margin:0 }}>
                  Sin visita hace {daysSince(c.ultimaVisita?.toDate?.() || c.ultimaVisita)} días
                </p>
              </div>
              <Icon name="chevron" size={14} color="#A16207" />
            </div>
          ))}
        </div>
      )}

      {/* Acciones rápidas */}
      <div style={{ padding:'0 14px 14px' }}>
        <p style={{ fontSize:14, fontWeight:800, color:C.gray800, marginBottom:10 }}>⚡ Acciones rápidas</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { icon:'plus',  label:'Nueva venta', color:C.teal,    screen:'addSale'   },
            { icon:'users', label:'Clientes',    color:'#3B82F6', screen:'clients'   },
            { icon:'map',   label:'Mapa',        color:C.amber,   screen:'map'       },
            { icon:'chart', label:'Analítica',   color:'#A78BFA', screen:'analytics' },
          ].map(a => (
            <button key={a.screen} onClick={() => nav(a.screen)}
              style={{ background:'#fff', border:`1px solid ${C.gray200}`, borderRadius:14, padding:'10px 4px', cursor:'pointer', textAlign:'center', fontFamily:'inherit' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:a.color+'15', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 5px' }}>
                <Icon name={a.icon} size={17} color={a.color} />
              </div>
              <span style={{ fontSize:10, fontWeight:700, color:C.gray600 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ padding:'0 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:14, fontWeight:800, color:C.gray800 }}>Actividad reciente</span>
          <button onClick={() => nav('clients')} style={{ fontSize:12, color:C.teal, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Ver todo</button>
        </div>
        {ventas.length === 0 ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <Icon name="activity" size={32} color={C.gray400} />
            <p style={{ fontSize:13, color:C.gray400, marginTop:8 }}>Aún no hay ventas registradas</p>
            <Button icon="plus" size="sm" style={{ marginTop:10 }} onClick={() => nav('addSale')}>Primera venta</Button>
          </div>
        ) : ventas.slice(0, 4).map(v => {
          const cl = clientes.find(c => c.id === v.clienteId)
          const ep = estadoPagoInfo(v.estado)
          return (
            <Card key={v.id}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Avatar initials={cl?.nombre?.slice(0,2).toUpperCase() || '?'} bg={C.teal} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {cl?.nombre || 'Cliente'}
                  </p>
                  <p style={{ fontSize:12, color:C.gray400, margin:0 }}>{metodoPagoLabel(v.metodoPago)}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:14, fontWeight:800, color:C.gray800, margin:0 }}>{fmtUSD(v.total)}</p>
                  <Badge bg={ep.bg} txt={ep.txt}>{ep.label}</Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div style={{ height:90 }} />
    </div>
  )
}

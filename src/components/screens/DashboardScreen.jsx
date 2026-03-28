import { C, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { CURRENT_USER } from '../../constants/data'
import { useAppData } from '../../hooks/useAppData'
import { fmtUSD, daysSince, sumVentas, sumDeuda, clientesInactivos } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import KpiCard from '../shared/KpiCard'
import Avatar from '../shared/Avatar'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import { auth } from '../../../firebase/firebase.config'

export default function DashboardScreen({ nav }) {
  const { clientes, ventas, rutas, loading } = useAppData()

  const user   = auth.currentUser
  const nombre = user?.displayName || user?.email?.split('@')[0] || 'Usuario'
  const avatar = nombre.slice(0, 2).toUpperCase()

  const total = sumVentas(ventas)
  const deuda = sumDeuda(clientes)
  const inact = clientesInactivos(clientes, 30)
  const rutaHoy = rutas.find(r => r.estado === 'pendiente')

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.gray50, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <span style={{ width:36, height:36, border:`3px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
        <p style={{ fontSize:13, color:C.gray400, marginTop:12 }}>Cargando datos...</p>
      </div>
    </div>
  )

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:C.navy, padding:'20px 16px 28px', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div>
            <p style={{ fontSize:12, color:C.gray400, margin:0 }}>Buenos días,</p>
            <h1 style={{ fontSize:22, fontWeight:900, margin:0 }}>{nombre.split(' ')[0]} 👋</h1>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ position:'relative' }}>
              <Icon name="bell" size={22} color="#fff" />
              {inact.length > 0 && (
                <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:C.red, fontSize:9, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>
                  {inact.length}
                </span>
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
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <KpiCard label="Ventas totales"   val={fmtUSD(total)}    sub={`${ventas.length} transacciones`} icon="dollar" color={C.teal}   />
          <KpiCard label="Deuda pendiente"  val={fmtUSD(deuda)}    sub={`${clientes.filter(c=>c.deuda>0).length} clientes`} icon="card" color={C.red} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <KpiCard label="Clientes activos" val={clientes.length}  sub={`${inact.length} inactivos`} icon="users"  color="#3B82F6" />
          <KpiCard label="Rutas creadas"    val={rutas.length}     sub={`${rutas.filter(r=>r.estado==='pendiente').length} pendientes`} icon="route" color={C.amber} />
        </div>
      </div>

      {/* Ruta del día */}
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
            <p style={{ fontSize:19, fontWeight:900, color:'#fff', margin:'0 0 12px' }}>{rutaHoy.clientes?.length || 0} visitas planeadas</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
              <div style={{ display:'flex', gap:24 }}>
                <div>
                  <p style={{ fontSize:17, fontWeight:800, color:'#fff', margin:0 }}>{rutaHoy.fecha}</p>
                  <p style={{ fontSize:11, color:C.gray400, margin:0 }}>Fecha</p>
                </div>
              </div>
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
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#854D0E', margin:0 }}>{c.nombre}</p>
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
              style={{ background:'#fff', border:`1px solid ${C.gray200}`, borderRadius:14, padding:'10px 6px', cursor:'pointer', textAlign:'center', fontFamily:'inherit' }}>
              <div style={{ width:38, height:38, borderRadius:11, background:a.color+'15', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px' }}>
                <Icon name={a.icon} size={18} color={a.color} />
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
            <Button icon="plus" size="sm" style={{ marginTop:10 }} onClick={() => nav('addSale')}>Registrar primera venta</Button>
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
                    {cl?.nombre || 'Cliente eliminado'}
                  </p>
                  <p style={{ fontSize:12, color:C.gray400, margin:0 }}>
                    {metodoPagoLabel(v.metodoPago)}
                  </p>
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

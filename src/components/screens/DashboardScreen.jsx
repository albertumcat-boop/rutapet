import { C, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { CLIENTES, VENTAS, CURRENT_USER } from '../../constants/data'
import { fmtUSD, daysSince, sumVentas, sumDeuda, clientesInactivos } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import KpiCard from '../shared/KpiCard'
import Avatar from '../shared/Avatar'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function DashboardScreen({ nav }) {
  const total = sumVentas(VENTAS)
  const deuda = sumDeuda(CLIENTES)
  const inact = clientesInactivos(CLIENTES, 30)

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <div style={{ background: C.navy, padding: '20px 16px 28px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>Buenos días,</p>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{CURRENT_USER.nombre.split(' ')[0]} 👋</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <Icon name="bell" size={22} color="#fff" />
              {inact.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: C.red, fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{inact.length}</span>}
            </div>
            <Avatar initials={CURRENT_USER.avatar} size={38} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="pin" size={13} color={C.teal} />
          <span style={{ fontSize: 12, color: C.gray400 }}>Zona: {CURRENT_USER.zona}  ·  26 Mar 2025</span>
        </div>
      </div>

      <div style={{ padding: '0 14px', marginTop: -14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <KpiCard label="Ventas del mes"  val={fmtUSD(total)} sub="8 transacciones" icon="dollar" color={C.teal}   trend={18} />
          <KpiCard label="Deuda pendiente" val={fmtUSD(deuda)} sub="4 clientes"      icon="card"   color={C.red} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <KpiCard label="Clientes activos" val={CLIENTES.length} sub={`${inact.length} inactivos`} icon="users"  color="#3B82F6" />
          <KpiCard label="Meta mensual"      val="$1,000"          sub="118% alcanzada"               icon="target" color={C.amber} trend={18} />
        </div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="route" size={16} color={C.teal} />
            <span style={{ fontSize: 15, fontWeight: 800, color: C.gray800 }}>Ruta de hoy</span>
          </div>
          <button onClick={() => nav('routes')} style={{ fontSize: 12, color: C.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Ver todas</button>
        </div>
        <div onClick={() => nav('routes')} style={{ background: `linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`, borderRadius: 16, padding: '16px', cursor: 'pointer', border: `1px solid ${C.teal}30`, marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: C.teal, fontWeight: 700, margin: '0 0 4px' }}>📍 Ruta Centro — Martes</p>
          <p style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>3 visitas planeadas</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <div><p style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>8.7 km</p><p style={{ fontSize: 11, color: C.gray400, margin: 0 }}>Distancia</p></div>
              <div><p style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>0 / 3</p><p style={{ fontSize: 11, color: C.gray400, margin: 0 }}>Visitas</p></div>
            </div>
            <Button size="sm" icon="nav" onClick={(e) => e.stopPropagation()}>Iniciar</Button>
          </div>
        </div>
      </div>

      {inact.length > 0 && (
        <div style={{ padding: '0 14px 14px' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: C.gray800, marginBottom: 8 }}>⚠️ Clientes inactivos</p>
          {inact.map((c) => (
            <div key={c.id} onClick={() => nav('clientDetail', c)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF9C3', borderRadius: 12, padding: '10px 12px', marginBottom: 8, border: '1px solid #FDE047', cursor: 'pointer' }}>
              <Icon name="alert" size={16} color="#854D0E" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#854D0E', margin: 0 }}>{c.nombre}</p>
                <p style={{ fontSize: 11, color: '#A16207', margin: 0 }}>Sin visita hace {daysSince(c.ultimaVisita)} días</p>
              </div>
              <Icon name="chevron" size={14} color="#A16207" />
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '0 14px 14px' }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: C.gray800, marginBottom: 10 }}>⚡ Acciones rápidas</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { icon:'plus',  label:'Nueva venta', color:C.teal,    screen:'addSale'   },
            { icon:'users', label:'Clientes',    color:'#3B82F6', screen:'clients'   },
            { icon:'map',   label:'Mapa',        color:C.amber,   screen:'map'       },
            { icon:'chart', label:'Analítica',   color:'#A78BFA', screen:'analytics' },
          ].map((a) => (
            <button key={a.screen} onClick={() => nav(a.screen)} style={{ background: '#fff', border: `1px solid ${C.gray200}`, borderRadius: 14, padding: '10px 6px', cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: a.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <Icon name={a.icon} size={18} color={a.color} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.gray600 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.gray800 }}>Actividad reciente</span>
          <button onClick={() => nav('clients')} style={{ fontSize: 12, color: C.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Ver todo</button>
        </div>
        {VENTAS.slice(0, 4).map((v) => {
          const cl = CLIENTES.find((c) => c.id === v.clienteId)
          const ep = estadoPagoInfo(v.estado)
          return (
            <Card key={v.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={cl?.nombre.slice(0, 2).toUpperCase()} bg={C.teal} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cl?.nombre}</p>
                  <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>{v.fecha} · {metodoPagoLabel(v.metodoPago)}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: C.gray800, margin: 0 }}>{fmtUSD(v.total)}</p>
                  <Badge bg={ep.bg} txt={ep.txt}>{ep.label}</Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      <div style={{ height: 90 }} />
    </div>
  )
}

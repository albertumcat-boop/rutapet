/**
 * DashboardScreen.jsx — Panel principal con KPIs farmacéuticos y alertas de vencimiento
 */
import { useState, useMemo } from 'react'
import { C, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { useToast } from '../../context/ToastContext'
import { fmtUSD, daysSince, sumVentas, sumDeuda, clientesInactivos, fmtFecha } from '../../utils/helpers'
import { auth } from '../../../firebase/firebase.config'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import KpiCard from '../shared/KpiCard'
import Avatar from '../shared/Avatar'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

function diasParaVencer(fechaStr) {
  if (!fechaStr) return null
  return Math.ceil((new Date(fechaStr) - new Date()) / 86_400_000)
}

export default function DashboardScreen({ nav }) {
  const { clientes, ventas, rutas, productos, loading } = useAppData()
  const { config, isAdmin } = useConfig()
  const toast = useToast()
  const [showNotif, setShowNotif] = useState(false)

  const user    = auth.currentUser
  const nombre  = user?.displayName || user?.email?.split('@')[0] || 'Usuario'
  const avatar  = nombre.slice(0, 2).toUpperCase()
  const empresa = config.empresa?.nombre || 'VetRuta'

  const total    = useMemo(() => sumVentas(ventas), [ventas])
  const deuda    = useMemo(() => sumDeuda(clientes), [clientes])
  const inact    = useMemo(() => clientesInactivos(clientes, 30), [clientes])
  const conDeuda = useMemo(() => clientes.filter(c => (c.deuda || 0) > 0), [clientes])
  const rutaHoy  = rutas.find(r => r.estado === 'pendiente')

  // Productos próximos a vencer (90 días)
  const porVencer = useMemo(() =>
    productos.filter(p => {
      const d = diasParaVencer(p.fechaVencimiento)
      return d !== null && d <= 90
    }).sort((a, b) => diasParaVencer(a.fechaVencimiento) - diasParaVencer(b.fechaVencimiento)),
    [productos]
  )
  const yaVencidos = porVencer.filter(p => diasParaVencer(p.fechaVencimiento) < 0)
  const vencen30   = porVencer.filter(p => {
    const d = diasParaVencer(p.fechaVencimiento)
    return d !== null && d >= 0 && d <= 30
  })

  // Clientes que superaron límite de crédito
  const sobreLimite = useMemo(() =>
    clientes.filter(c => c.limiteCredito > 0 && c.deuda > c.limiteCredito),
    [clientes]
  )

  // Todas las notificaciones
  const notificaciones = useMemo(() => [
    ...yaVencidos.map(p => ({
      id:      `venc-${p.id}`,
      icon:    'alert_circle',
      color:   C.red,
      bg:      '#FEE2E2',
      titulo:  `VENCIDO: ${p.nombre}`,
      desc:    `Lote ${p.lote || 'sin lote'} — venció ${Math.abs(diasParaVencer(p.fechaVencimiento))} días atrás`,
      onClick: () => { setShowNotif(false); nav('expiry') },
      urgente: true,
    })),
    ...vencen30.map(p => ({
      id:      `venc30-${p.id}`,
      icon:    'clock',
      color:   '#F97316',
      bg:      '#FFF7ED',
      titulo:  `Próximo a vencer: ${p.nombre}`,
      desc:    `En ${diasParaVencer(p.fechaVencimiento)} días · ${p.lote || ''}`,
      onClick: () => { setShowNotif(false); nav('expiry') },
      urgente: false,
    })),
    ...sobreLimite.map(c => ({
      id:      `limite-${c.id}`,
      icon:    'alert',
      color:   C.red,
      bg:      '#FEE2E2',
      titulo:  `Límite excedido: ${c.nombre}`,
      desc:    `Deuda ${fmtUSD(c.deuda)} / Límite ${fmtUSD(c.limiteCredito)}`,
      onClick: () => { setShowNotif(false); nav('clientDetail', c) },
      urgente: true,
    })),
    ...inact.map(c => ({
      id:      `inact-${c.id}`,
      icon:    'calendar',
      color:   '#F5A623',
      bg:      '#FEF9C3',
      titulo:  `Sin visita: ${c.nombre}`,
      desc:    `Hace ${daysSince(c.ultimaVisita)} días`,
      onClick: () => { setShowNotif(false); nav('clientDetail', c) },
      urgente: false,
    })),
    ...conDeuda.map(c => ({
      id:      `deuda-${c.id}`,
      icon:    'dollar',
      color:   C.red,
      bg:      '#FEE2E2',
      titulo:  `Deuda: ${c.nombre}`,
      desc:    `Debe ${fmtUSD(c.deuda)}`,
      onClick: () => { setShowNotif(false); nav('payments') },
      urgente: false,
    })),
    ...rutas.filter(r => r.estado === 'pendiente').map(r => ({
      id:      `ruta-${r.id}`,
      icon:    'route',
      color:   C.teal,
      bg:      '#E0F2F1',
      titulo:  `Ruta pendiente: ${r.nombre}`,
      desc:    `${(r.clientes || []).length} paradas · ${r.fecha}`,
      onClick: () => { setShowNotif(false); nav('routes') },
      urgente: false,
    })),
  ], [yaVencidos, vencen30, sobreLimite, inact, conDeuda, rutas])

  const urgentes = notificaciones.filter(n => n.urgente).length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.gray50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: 36, height: 36, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: C.navy, padding: '20px 16px 28px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Icon name="paw" size={12} color={C.teal} />
              <p style={{ fontSize: 11, color: C.teal, margin: 0, fontWeight: 700 }}>{empresa}</p>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Hola, {nombre.split(' ')[0]} 👋
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

            {/* Campana */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotif(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', position: 'relative' }}>
                <Icon name="bell" size={22} color="#fff" />
                {notificaciones.length > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: urgentes > 0 ? C.red : C.amber, fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {Math.min(notificaciones.length, 9)}
                  </span>
                )}
              </button>

              {showNotif && (
                <>
                  <div onClick={() => setShowNotif(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
                  <div style={{ position: 'absolute', top: 36, right: -8, width: 300, maxWidth: '88vw', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 99, overflow: 'hidden', border: `1px solid ${C.gray200}` }}>
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.gray800 }}>Alertas</span>
                      {urgentes > 0 && (
                        <span style={{ fontSize: 11, color: '#fff', background: C.red, fontWeight: 700, borderRadius: 8, padding: '2px 8px' }}>{urgentes} urgente{urgentes > 1 ? 's' : ''}</span>
                      )}
                    </div>
                    {notificaciones.length === 0 ? (
                      <div style={{ padding: '20px 14px', textAlign: 'center' }}>
                        <Icon name="ok_circle" size={28} color={C.green} />
                        <p style={{ fontSize: 13, color: C.gray400, marginTop: 8 }}>¡Todo al día! 🎉</p>
                      </div>
                    ) : (
                      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {notificaciones.map((n, i) => (
                          <div key={n.id} onClick={n.onClick}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderBottom: i < notificaciones.length - 1 ? `1px solid ${C.gray100}` : 'none', cursor: 'pointer', background: n.urgente ? '#FFF5F5' : '#fff' }}
                            onMouseEnter={e => e.currentTarget.style.background = C.gray50}
                            onMouseLeave={e => e.currentTarget.style.background = n.urgente ? '#FFF5F5' : '#fff'}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon name={n.icon} size={15} color={n.color} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.titulo}</p>
                              <p style={{ fontSize: 11, color: C.gray400, margin: '2px 0 0' }}>{n.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.gray200}`, textAlign: 'center' }}>
                      <button onClick={() => setShowNotif(false)}
                        style={{ fontSize: 12, color: C.teal, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Avatar initials={avatar} size={36} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="calendar" size={12} color={C.teal} />
          <span style={{ fontSize: 11, color: C.gray400 }}>
            {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Alertas críticas de vencimiento (inline) */}
      {yaVencidos.length > 0 && (
        <div onClick={() => nav('expiry')}
          style={{ margin: '10px 14px 0', background: '#FEE2E2', border: '1.5px solid #FCA5A5', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Icon name="alert_circle" size={18} color={C.red} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', margin: 0 }}>
              ⚠ {yaVencidos.length} producto{yaVencidos.length > 1 ? 's' : ''} VENCIDO{yaVencidos.length > 1 ? 'S' : ''}
            </p>
            <p style={{ fontSize: 11, color: '#991B1B', margin: 0, opacity: 0.8 }}>Toca para gestionar</p>
          </div>
          <Icon name="chevron" size={14} color={C.red} />
        </div>
      )}

      {/* KPIs */}
      <div style={{ padding: '14px 14px 0', marginTop: yaVencidos.length > 0 ? 0 : -14 }}>
        <div className="kpi-grid">
          <KpiCard label="Ventas totales"  val={fmtUSD(total)} sub={`${ventas.length} transacciones`} icon="dollar" color={C.teal} />
          <KpiCard label="Deuda pendiente" val={fmtUSD(deuda)} sub={`${conDeuda.length} clientes`}    icon="card"   color={C.red} />
        </div>
        <div className="kpi-grid">
          <KpiCard label="Clientes"        val={clientes.length} sub={`${inact.length} inactivos`}    icon="users"  color="#3B82F6" />
          <KpiCard label="Por vencer"      val={porVencer.length}
            sub={yaVencidos.length > 0 ? `${yaVencidos.length} vencidos 🚨` : `${vencen30.length} en 30 días`}
            icon="clock"  color={yaVencidos.length > 0 ? C.red : C.amber} />
        </div>
      </div>

      {/* Alerta próximos a vencer (30 días) */}
      {vencen30.length > 0 && yaVencidos.length === 0 && (
        <div style={{ padding: '10px 14px 0' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#9A3412', marginBottom: 8 }}>🕐 Vencen pronto (&lt;30 días)</p>
          {vencen30.slice(0, 3).map(p => (
            <div key={p.id} onClick={() => nav('expiry')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF7ED', borderRadius: 12, padding: '10px 12px', marginBottom: 6, border: '1px solid #FDBA74', cursor: 'pointer' }}>
              <Icon name="clock" size={16} color="#F97316" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.nombre}
                </p>
                <p style={{ fontSize: 11, color: '#C2410C', margin: 0 }}>
                  Lote {p.lote || '—'} · Vence en {diasParaVencer(p.fechaVencimiento)} días
                </p>
              </div>
              <Icon name="chevron" size={13} color="#F97316" />
            </div>
          ))}
        </div>
      )}

      {/* Ruta pendiente */}
      {rutaHoy && (
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="route" size={15} color={C.teal} />
              <span style={{ fontSize: 14, fontWeight: 800, color: C.gray800 }}>Ruta pendiente</span>
            </div>
            <button onClick={() => nav('routes')}
              style={{ fontSize: 12, color: C.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Ver todas
            </button>
          </div>
          <div onClick={() => nav('routes')}
            style={{ background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius: 16, padding: '16px', cursor: 'pointer', border: `1px solid ${C.teal}30`, marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: C.teal, fontWeight: 700, margin: '0 0 4px' }}>📍 {rutaHoy.nombre}</p>
            <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(rutaHoy.clientes || []).length} visitas planeadas
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.gray400 }}>{rutaHoy.fecha}</span>
              <Button size="sm" icon="nav" onClick={e => e.stopPropagation()}>Iniciar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Clientes sobre límite de crédito */}
      {sobreLimite.length > 0 && (
        <div style={{ padding: '0 14px 14px' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.red, marginBottom: 8 }}>🚫 Límite de crédito excedido</p>
          {sobreLimite.slice(0, 3).map(c => (
            <div key={c.id} onClick={() => nav('clientDetail', c)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEE2E2', borderRadius: 12, padding: '10px 12px', marginBottom: 6, border: '1px solid #FCA5A5', cursor: 'pointer' }}>
              <Icon name="alert" size={16} color={C.red} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.nombre}
                </p>
                <p style={{ fontSize: 11, color: '#991B1B', opacity: 0.8, margin: 0 }}>
                  Deuda {fmtUSD(c.deuda)} / Límite {fmtUSD(c.limiteCredito)}
                </p>
              </div>
              <Icon name="chevron" size={13} color={C.red} />
            </div>
          ))}
        </div>
      )}

      {/* Inactivos */}
      {inact.length > 0 && (
        <div style={{ padding: '0 14px 14px' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.gray800, marginBottom: 8 }}>⚠️ Sin visita (30+ días)</p>
          {inact.slice(0, 3).map(c => (
            <div key={c.id} onClick={() => nav('clientDetail', c)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF9C3', borderRadius: 12, padding: '10px 12px', marginBottom: 6, border: '1px solid #FDE047', cursor: 'pointer' }}>
              <Icon name="alert" size={16} color="#854D0E" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#854D0E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.nombre}
                </p>
                <p style={{ fontSize: 11, color: '#A16207', margin: 0 }}>
                  Hace {daysSince(c.ultimaVisita)} días sin visita
                </p>
              </div>
              <Icon name="chevron" size={13} color="#A16207" />
            </div>
          ))}
        </div>
      )}

      {/* Acciones rápidas */}
      <div style={{ padding: '0 14px 14px' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: C.gray800, marginBottom: 10 }}>⚡ Acciones rápidas</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { icon: 'plus',    label: 'Nueva venta', color: C.teal,     screen: 'addSale'  },
            { icon: 'users',   label: 'Clientes',    color: '#3B82F6',  screen: 'clients'  },
            { icon: 'clock',   label: 'Vencimientos',color: '#F97316',  screen: 'expiry'   },
            { icon: 'chart',   label: 'Analítica',   color: '#A78BFA',  screen: 'analytics'},
          ].map(a => (
            <button key={a.screen} onClick={() => nav(a.screen)}
              style={{ background: '#fff', border: `1px solid ${C.gray200}`, borderRadius: 14, padding: '10px 4px', cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px' }}>
                <Icon name={a.icon} size={17} color={a.color} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.gray600 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ padding: '0 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.gray800 }}>Actividad reciente</span>
          <button onClick={() => nav('analytics')}
            style={{ fontSize: 12, color: C.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            Ver analítica
          </button>
        </div>

        {ventas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Icon name="activity" size={32} color={C.gray400} />
            <p style={{ fontSize: 13, color: C.gray400, marginTop: 8 }}>Sin ventas aún</p>
            <Button icon="plus" size="sm" style={{ marginTop: 10 }} onClick={() => nav('addSale')}>
              Primera venta
            </Button>
          </div>
        ) : ventas.slice(0, 4).map(v => {
          const cl = clientes.find(c => c.id === v.clienteId)
          const ep = estadoPagoInfo(v.estado)
          return (
            <Card key={v.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={cl?.nombre?.slice(0, 2).toUpperCase() || '?'} bg={C.teal} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cl?.nombre || 'Cliente eliminado'}
                  </p>
                  <p style={{ fontSize: 11, color: C.gray400, margin: 0 }}>
                    {fmtFecha(v.fecha)} · {metodoPagoLabel(v.metodoPago)}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: C.gray800, margin: 0 }}>{fmtUSD(v.total)}</p>
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

/**
 * AdminScreen.jsx — Panel de administración
 * Auditado: datos reales, sin vendedores demo
 */
import { useState } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { useToast } from '../../context/ToastContext'
import { fmtUSD, sumVentas, sumDeuda, iniciales } from '../../utils/helpers'
import { auth } from '../../../firebase/firebase.config'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Avatar from '../shared/Avatar'
import KpiCard from '../shared/KpiCard'
import TopBar from '../shared/TopBar'
import Button from '../shared/Button'

export default function AdminScreen({ onBack, nav }) {
  const { clientes, ventas, productos, visitas, inventario } = useAppData()
  const { config, resetConfig, actualizarConfig } = useConfig()
  const toast = useToast()
  const [editComision, setEditComision] = useState(false)
  const [pctInput,     setPctInput]     = useState(String(config.comisionPct || 5))

  const user   = auth.currentUser
  const nombre = user?.displayName || user?.email?.split('@')[0] || 'Admin'
  const avatar = iniciales(nombre)
  const total  = sumVentas(ventas)
  const deuda  = sumDeuda(clientes)

  // Ventas por método de pago para gráfica
  const chartData = [
    { nombre:'Efectivo',  ventas:ventas.filter(v=>v.metodoPago==='efectivo').reduce((s,v)=>s+Number(v.total||0),0)      },
    { nombre:'Transfer.', ventas:ventas.filter(v=>v.metodoPago==='transferencia').reduce((s,v)=>s+Number(v.total||0),0) },
    { nombre:'Pago Móvil',ventas:ventas.filter(v=>v.metodoPago==='pagoMovil').reduce((s,v)=>s+Number(v.total||0),0)     },
    { nombre:'Zelle',     ventas:ventas.filter(v=>v.metodoPago==='zelle').reduce((s,v)=>s+Number(v.total||0),0)         },
  ].filter(d => d.ventas > 0)

  // Clientes por nivel
  const clientesPorNivel = [
    { nivel:'Alto',  count:clientes.filter(c=>c.nivel==='alto').length,  color:C.green  },
    { nivel:'Medio', count:clientes.filter(c=>c.nivel==='medio').length, color:'#EAB308'},
    { nivel:'Bajo',  count:clientes.filter(c=>c.nivel==='bajo').length,  color:C.red    },
  ]

  // Inventario: clientes con inventario configurado
  const clientesConInv = clientes.filter(c =>
    inventario.some(i => i.clienteId === c.id)
  ).length

  const handleReconfigurar = () => {
    if (confirm('¿Reconfigurar la app? Se borrarán los tipos de cliente y categorías personalizadas.')) {
      resetConfig()
    }
  }

  const handleGuardarComision = async () => {
    const pct = parseFloat(pctInput)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.warning('Ingresa un porcentaje entre 0 y 100')
      return
    }
    try {
      await actualizarConfig({ comisionPct: pct })
      toast.success(`Comisión actualizada: ${pct}%`)
      setEditComision(false)
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
    }
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Administración" onBack={onBack} />

      {/* Header */}
      <div style={{ background:C.navy, padding:'0 14px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <Avatar initials={avatar} size={46} />
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:14, fontWeight:800, color:'#fff', margin:0 }}>{nombre}</p>
            <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{config.empresa?.nombre || ''}</p>
            <p style={{ fontSize:11, color:C.teal, margin:0 }}>{config.empresa?.rubro || ''}</p>
          </div>
        </div>

        {/* Contadores */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { l:'Clientes',  v:clientes.length,  c:C.teal    },
            { l:'Ventas',    v:ventas.length,     c:'#3B82F6' },
            { l:'Productos', v:productos.length,  c:C.amber   },
            { l:'Visitas',   v:visitas.length,    c:'#A78BFA' },
          ].map((k,i) => (
            <div key={i} style={{ background:'#ffffff15', borderRadius:12, padding:'10px 4px', textAlign:'center' }}>
              <p style={{ fontSize:15, fontWeight:900, color:k.c, margin:0 }}>{k.v}</p>
              <p style={{ fontSize:10, color:C.gray400, margin:0 }}>{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:14 }}>

        {/* KPIs financieros */}
        <div className="kpi-grid">
          <KpiCard label="Total facturado" val={fmtUSD(total)} icon="dollar" color={C.teal} />
          <KpiCard label="Deuda pendiente" val={fmtUSD(deuda)} icon="card"   color={C.red}  />
        </div>

        {/* Clientes por nivel */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <Icon name="users" size={15} color={C.teal} />
            <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Clientes por nivel</span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {clientesPorNivel.map(n => (
              <div key={n.nivel} style={{ flex:1, textAlign:'center', background:n.color+'12', borderRadius:12, padding:'12px 8px', border:`1px solid ${n.color}30` }}>
                <p style={{ fontSize:22, fontWeight:900, color:n.color, margin:0 }}>{n.count}</p>
                <p style={{ fontSize:11, color:C.gray600, margin:0 }}>{n.nivel}</p>
              </div>
            ))}
            <div style={{ flex:1, textAlign:'center', background:C.teal+'12', borderRadius:12, padding:'12px 8px', border:`1px solid ${C.teal}30` }}>
              <p style={{ fontSize:22, fontWeight:900, color:C.teal, margin:0 }}>{clientesConInv}</p>
              <p style={{ fontSize:11, color:C.gray600, margin:0 }}>Con inventario</p>
            </div>
          </div>
        </Card>

        {/* Gráfica ventas por método */}
        {chartData.length > 0 && (
          <Card style={{ padding:'14px 8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12, paddingLeft:8 }}>
              <Icon name="chart" size={15} color={C.teal} />
              <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Ventas por método de pago</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.gray200} />
                <XAxis type="number" tick={{ fontSize:10, fill:C.gray400 }} tickFormatter={v=>`$${v}`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize:11, fill:C.gray800 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip formatter={v=>[`$${Number(v).toFixed(2)}`,'Total']} />
                <Bar dataKey="ventas" fill={C.teal} radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Configuración empresa */}
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
            <div style={{ minWidth:0, flex:1, marginRight:10 }}>
              <p style={{ fontSize:14, fontWeight:800, color:C.gray800, margin:0 }}>{config.empresa?.nombre || '—'}</p>
              <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>{config.empresa?.rubro || '—'}</p>
              <p style={{ fontSize:12, color:C.teal, fontWeight:700 }}>Moneda: {config.empresa?.moneda || 'USD'}</p>
            </div>
            <button onClick={handleReconfigurar}
              style={{ background:C.gray100, border:'none', borderRadius:10, padding:'6px 12px', fontSize:11, fontWeight:700, color:C.gray600, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
              Reconfigurar
            </button>
          </div>

          {config.tiposCliente.length > 0 && (
            <>
              <p style={{ fontSize:11, fontWeight:700, color:C.gray600, marginBottom:8 }}>Tipos de cliente</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                {config.tiposCliente.map(t => (
                  <div key={t.key} style={{ display:'flex', alignItems:'center', gap:5, background:t.color+'12', borderRadius:20, padding:'4px 10px' }}>
                    <Icon name={t.icon} size={12} color={t.color} />
                    <span style={{ fontSize:11, fontWeight:700, color:t.color }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {config.categoriasProducto.length > 0 && (
            <>
              <p style={{ fontSize:11, fontWeight:700, color:C.gray600, marginBottom:8 }}>Categorías de producto</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {config.categoriasProducto.map(c => (
                  <div key={c.key} style={{ display:'flex', alignItems:'center', gap:5, background:c.color+'12', borderRadius:20, padding:'4px 10px' }}>
                    <Icon name={c.icon} size={12} color={c.color} />
                    <span style={{ fontSize:11, fontWeight:700, color:c.color }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Comisiones */}
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: editComision ? 14 : 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="trending_up" size={15} color='#8B5CF6' />
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0 }}>Comisión por ventas</p>
                <p style={{ fontSize:11, color:C.gray400, margin:0 }}>
                  Tasa actual: <strong style={{ color:'#8B5CF6' }}>{config.comisionPct || 5}%</strong>
                </p>
              </div>
            </div>
            <button onClick={() => { setEditComision(e => !e); setPctInput(String(config.comisionPct || 5)) }}
              style={{ background:C.gray100, border:'none', borderRadius:10, padding:'6px 12px', fontSize:11, fontWeight:700, color:C.gray600, cursor:'pointer', fontFamily:'inherit' }}>
              {editComision ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          {editComision && (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input
                type="number" min="0" max="100" step="0.5"
                value={pctInput}
                onChange={e => setPctInput(e.target.value)}
                placeholder="5"
                style={{ flex:1, padding:'10px', borderRadius:10, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit' }}
              />
              <span style={{ fontSize:13, color:C.gray600 }}>%</span>
              <Button size="sm" icon="ok_circle" onClick={handleGuardarComision}>Guardar</Button>
            </div>
          )}
        </Card>

        {/* Acceso rápido — admin */}
        {nav && (
          <Card>
            <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Accesos rápidos</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { icon:'team',        label:'Equipo',       color:'#6366F1', screen:'team'        },
                { icon:'trending_up', label:'Comisiones',   color:'#8B5CF6', screen:'commissions' },
                { icon:'activity',    label:'Analítica',    color:C.teal,    screen:'analytics'   },
                { icon:'card',        label:'Cobros',       color:'#F5A623', screen:'payments'    },
              ].map(a => (
                <button key={a.screen} onClick={() => nav(a.screen)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, background:'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:a.color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name={a.icon} size={17} color={a.color} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:C.gray800 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Estado del sistema */}
        <div style={{ background:C.navy, borderRadius:16, padding:16 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:12 }}>⚙️ Estado del sistema</p>
          {[
            { icon:'globe',    l:'Moneda',       v:config.empresa?.moneda || 'USD'       },
            { icon:'wifi',     l:'Base de datos', v:'Firebase Firestore'                  },
            { icon:'users',    l:'Clientes',      v:`${clientes.length} registrados`      },
            { icon:'activity', l:'Visitas',       v:`${visitas.length} registradas`       },
            { icon:'pkg',      l:'Inventarios',   v:`${clientesConInv} tiendas activas`   },
          ].map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:i<4?10:0 }}>
              <Icon name={s.icon} size={13} color={C.teal} />
              <span style={{ fontSize:12, color:C.gray400, flex:1 }}>{s.l}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

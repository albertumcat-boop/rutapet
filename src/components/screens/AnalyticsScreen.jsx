import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { fmtUSD, sumVentas, ticketPromedio } from '../../utils/helpers'
import { AreaChart, Area, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import KpiCard from '../shared/KpiCard'
import TopBar from '../shared/TopBar'
import { useConfig } from '../../context/ConfigContext'

export default function AnalyticsScreen({ onBack }) {
  const { clientes, ventas, productos, loading } = useAppData()
  const { config } = useConfig()

  const total = sumVentas(ventas)
  const avg   = ticketPromedio(ventas)

  // Top clientes por ventas
  const top5 = clientes
    .map(c => ({ ...c, compras: ventas.filter(v => v.clienteId === c.id).reduce((s,v) => s+v.total, 0) }))
    .sort((a,b) => b.compras - a.compras)
    .slice(0, 5)

  // Ventas por método de pago
  const porMetodo = ['efectivo','transferencia','pagoMovil'].map(m => ({
    name: m === 'efectivo' ? 'Efectivo' : m === 'transferencia' ? 'Transferencia' : 'Pago Móvil',
    value: ventas.filter(v => v.metodoPago === m).length,
    color: m === 'efectivo' ? C.green : m === 'transferencia' ? C.teal : C.amber,
  })).filter(m => m.value > 0)

  // Ventas por estado
  const porEstado = [
    { name:'Pagado',    value: ventas.filter(v=>v.estado==='pagado').length,    color: C.green  },
    { name:'Parcial',   value: ventas.filter(v=>v.estado==='parcial').length,   color: C.yellow },
    { name:'Pendiente', value: ventas.filter(v=>v.estado==='pendiente').length, color: C.red    },
  ].filter(e => e.value > 0)

  // Top productos vendidos
  const topProductos = productos.map(p => ({
    ...p,
    vendidos: ventas.flatMap(v => v.items || []).filter(it => it.pId === p.id).reduce((s,it) => s + (it.qty||1), 0)
  })).sort((a,b) => b.vendidos - a.vendidos).slice(0,5).filter(p => p.vendidos > 0)

  // Categorías de venta
  const porCategoria = config.categoriasProducto.map((cat, i) => {
    const colors = [C.teal, C.amber, C.green, '#A78BFA']
    const totalCat = ventas.flatMap(v => v.items || []).filter(it => {
      const prod = productos.find(p => p.id === it.pId)
      return prod?.categoria === cat.key
    }).reduce((s,it) => {
      const prod = productos.find(p => p.id === it.pId)
      return s + (prod ? prod.precio * (it.qty||1) : 0)
    }, 0)
    return { name: cat.label, value: totalCat, color: cat.color || colors[i] || C.teal }
  }).filter(c => c.value > 0)

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ width:32, height:32, border:`3px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Analítica" onBack={onBack} />
      <div style={{ background:C.navy, padding:'0 14px 16px' }}>
        <p style={{ fontSize:13, color:C.gray400, margin:0 }}>Basado en tus datos reales</p>
      </div>

      <div style={{ padding:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <KpiCard label="Total ventas"    val={fmtUSD(total)}     icon="dollar" color={C.teal}  />
          <KpiCard label="Ticket promedio" val={fmtUSD(avg)}       icon="star"   color={C.amber} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <KpiCard label="Total clientes"  val={clientes.length}   icon="users"  color="#3B82F6" />
          <KpiCard label="Ventas totales"  val={ventas.length}     icon="activity" color="#A78BFA" />
        </div>

        {/* Estado de ventas */}
        {porEstado.length > 0 && (
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <Icon name="chart" size={16} color={C.teal} />
              <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Estado de ventas</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={porEstado} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2}>
                    {porEstado.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1 }}>
                {porEstado.map((e,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:i<porEstado.length-1?8:0 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:e.color }} />
                    <span style={{ fontSize:13, color:C.gray800, flex:1 }}>{e.name}</span>
                    <span style={{ fontSize:14, fontWeight:900, color:e.color }}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Método de pago */}
        {porMetodo.length > 0 && (
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <Icon name="card" size={16} color={C.amber} />
              <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Método de pago preferido</span>
            </div>
            {porMetodo.map((m,i) => (
              <div key={i} style={{ marginBottom:i<porMetodo.length-1?10:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{m.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:m.color }}>{m.value} ventas</span>
                </div>
                <div style={{ height:6, background:C.gray100, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(m.value/ventas.length)*100}%`, background:m.color, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Top productos */}
        {topProductos.length > 0 && (
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <Icon name="award" size={16} color={C.amber} />
              <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Productos más vendidos</span>
            </div>
            {topProductos.map((p,i) => (
              <div key={p.id} style={{ marginBottom:i<topProductos.length-1?10:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{p.nombre}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:C.teal }}>{p.vendidos} uds</span>
                </div>
                <div style={{ height:6, background:C.gray100, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(p.vendidos/topProductos[0].vendidos)*100}%`, background:C.teal, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Clientes más rentables */}
        {top5.filter(c => c.compras > 0).length > 0 && (
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <Icon name="star" size={16} color={C.teal} />
              <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Clientes más rentables</span>
            </div>
            {top5.filter(c => c.compras > 0).map((c,i) => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:i<4?10:0 }}>
                <span style={{ fontSize:16, fontWeight:900, color:C.gray400, width:20 }}>#{i+1}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0 }}>{c.nombre}</p>
                  <div style={{ height:4, background:C.gray100, borderRadius:2, marginTop:4 }}>
                    <div style={{ height:'100%', width:`${(c.compras/top5[0].compras)*100}%`, background:C.teal, borderRadius:2 }} />
                  </div>
                </div>
                <span style={{ fontSize:14, fontWeight:900, color:C.teal }}>{fmtUSD(c.compras)}</span>
              </div>
            ))}
          </Card>
        )}

        {/* Sin datos */}
        {ventas.length === 0 && (
          <div style={{ textAlign:'center', padding:'30px 0' }}>
            <Icon name="chart" size={40} color={C.gray400} />
            <p style={{ fontSize:14, color:C.gray400, marginTop:12, fontWeight:600 }}>Sin datos aún</p>
            <p style={{ fontSize:13, color:C.gray400 }}>Registra ventas para ver tu analítica</p>
          </div>
        )}
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

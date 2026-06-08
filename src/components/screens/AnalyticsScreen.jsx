/**
 * AnalyticsScreen.jsx — Analítica con datos reales
 * Auditado: cálculos correctos, sin datos demo, responsive
 */
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { fmtUSD, sumVentas, ticketPromedio, fmtFecha } from '../../utils/helpers'
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import KpiCard from '../shared/KpiCard'
import TopBar from '../shared/TopBar'
import { exportarVentas, exportarClientesConDeuda, exportarInventario, exportarClientes } from '../../utils/csvExport'

export default function AnalyticsScreen({ onBack }) {
  const { clientes, ventas, productos, visitas, loading } = useAppData()
  const { config } = useConfig()

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ width:32, height:32, border:`3px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
    </div>
  )

  const total = sumVentas(ventas)
  const avg   = ticketPromedio(ventas)
  const conversion = visitas.length > 0
    ? Math.round((visitas.filter(v => v.vendio).length / visitas.length) * 100)
    : 0

  // Top 5 clientes por compras
  const top5 = clientes
    .map(c => ({
      ...c,
      compras: ventas
        .filter(v => v.clienteId === c.id)
        .reduce((s, v) => s + (Number(v.total) || 0), 0),
    }))
    .sort((a, b) => b.compras - a.compras)
    .filter(c => c.compras > 0)
    .slice(0, 5)

  // Ventas por método de pago
  const porMetodo = ['efectivo','transferencia','pagoMovil','zelle'].map(m => ({
    name:  m === 'efectivo' ? 'Efectivo' : m === 'transferencia' ? 'Transfer.' : m === 'pagoMovil' ? 'Pago Móvil' : 'Zelle',
    valor: ventas.filter(v => v.metodoPago === m).reduce((s,v) => s + (Number(v.total)||0), 0),
  })).filter(m => m.valor > 0)

  // Ventas por estado
  const porEstado = [
    { name:'Pagado',    value:ventas.filter(v=>v.estado==='pagado').length,    color:C.green  },
    { name:'Parcial',   value:ventas.filter(v=>v.estado==='parcial').length,   color:'#EAB308'},
    { name:'Pendiente', value:ventas.filter(v=>v.estado==='pendiente').length, color:C.red    },
  ].filter(e => e.value > 0)

  // Top productos vendidos
  const topProductos = productos
    .map(p => ({
      ...p,
      vendidos: ventas
        .flatMap(v => v.items || [])
        .filter(it => it.pId === p.id)
        .reduce((s, it) => s + (Number(it.qty) || 1), 0),
      ingresos: ventas
        .flatMap(v => v.items || [])
        .filter(it => it.pId === p.id)
        .reduce((s, it) => s + (Number(it.precio || p.precio) * (Number(it.qty)||1)), 0),
    }))
    .filter(p => p.vendidos > 0)
    .sort((a, b) => b.vendidos - a.vendidos)
    .slice(0, 5)

  // Ventas por categoría (desde config)
  const porCategoria = config.categoriasProducto.map((cat, i) => {
    const colors = [C.teal, C.amber, C.green, '#A78BFA', '#3B82F6']
    const totalCat = ventas
      .flatMap(v => v.items || [])
      .filter(it => {
        const prod = productos.find(p => p.id === it.pId)
        return prod?.categoria === cat.key
      })
      .reduce((s, it) => {
        const prod = productos.find(p => p.id === it.pId)
        return s + ((Number(it.precio || prod?.precio || 0)) * (Number(it.qty) || 1))
      }, 0)
    return {
      name:  cat.label,
      value: totalCat,
      color: cat.color || colors[i % colors.length],
    }
  }).filter(c => c.value > 0)

  const sinDatos = ventas.length === 0

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Analítica" onBack={onBack} />
      <div style={{ background:C.navy, padding:'0 14px 14px' }}>
        <p style={{ fontSize:12, color:C.gray400, margin:0 }}>Datos reales de tu actividad</p>
      </div>

      <div style={{ padding:14 }}>
        {/* KPIs */}
        <div className="kpi-grid">
          <KpiCard label="Total ventas"    val={fmtUSD(total)}     icon="dollar"   color={C.teal}  />
          <KpiCard label="Ticket promedio" val={fmtUSD(avg)}       icon="star"     color={C.amber} />
        </div>
        <div className="kpi-grid">
          <KpiCard label="Clientes"        val={clientes.length}   icon="users"    color="#3B82F6" />
          <KpiCard label="Conversión"      val={`${conversion}%`} icon="target"   color={C.green} />
        </div>

        {/* Exportar CSV */}
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:8 }}>Exportar datos</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { label:'Ventas',    fn: () => exportarVentas(ventas, clientes, productos),  icon:'download' },
              { label:'Clientes',  fn: () => exportarClientes(clientes),                  icon:'download' },
              { label:'Deudas',    fn: () => exportarClientesConDeuda(clientes),          icon:'download' },
              { label:'Inventario',fn: () => exportarInventario(productos),               icon:'download' },
            ].map(btn => (
              <button key={btn.label} onClick={btn.fn}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:`1.5px solid ${C.teal}`, background:`${C.teal}10`, color:C.teal, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                <Icon name={btn.icon} size={14} color={C.teal} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {sinDatos ? (
          <div style={{ textAlign:'center', padding:'30px 0' }}>
            <Icon name="chart" size={40} color={C.gray400} />
            <p style={{ fontSize:14, color:C.gray400, marginTop:12, fontWeight:600 }}>Sin datos todavía</p>
            <p style={{ fontSize:13, color:C.gray400 }}>Registra ventas para ver tu analítica aquí</p>
          </div>
        ) : (
          <>
            {/* Estado de ventas */}
            {porEstado.length > 0 && (
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Icon name="chart" size={15} color={C.teal} />
                  <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Estado de cobros</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={porEstado} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={56} paddingAngle={2}>
                        {porEstado.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex:1 }}>
                    {porEstado.map((e,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:i<porEstado.length-1?8:0 }}>
                        <div style={{ width:10, height:10, borderRadius:2, background:e.color, flexShrink:0 }} />
                        <span style={{ fontSize:12, color:C.gray800, flex:1 }}>{e.name}</span>
                        <span style={{ fontSize:14, fontWeight:900, color:e.color }}>{e.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Ventas por método */}
            {porMetodo.length > 0 && (
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Icon name="card" size={15} color={C.amber} />
                  <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Método de pago preferido</span>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={porMetodo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.gray200} />
                    <XAxis type="number" tick={{ fontSize:10, fill:C.gray400 }} tickFormatter={v=>`$${v}`} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:C.gray800 }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v=>[`$${Number(v).toFixed(2)}`,'Total']} />
                    <Bar dataKey="valor" fill={C.teal} radius={[0,6,6,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Top productos */}
            {topProductos.length > 0 && (
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Icon name="award" size={15} color={C.amber} />
                  <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Productos más vendidos</span>
                </div>
                {topProductos.map((p,i) => (
                  <div key={p.id} style={{ marginBottom:i<topProductos.length-1?12:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:C.gray800, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginRight:8 }}>{p.nombre}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:C.teal, flexShrink:0 }}>{p.vendidos} uds</span>
                    </div>
                    <div style={{ height:5, background:C.gray100, borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(p.vendidos/topProductos[0].vendidos)*100}%`, background:C.teal, borderRadius:3 }} />
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Ventas por categoría */}
            {porCategoria.length > 0 && (
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Icon name="pkg" size={15} color="#A78BFA" />
                  <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Ventas por categoría</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={porCategoria} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={56} paddingAngle={2}>
                        {porCategoria.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex:1 }}>
                    {porCategoria.map((c,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:i<porCategoria.length-1?8:0 }}>
                        <div style={{ width:10, height:10, borderRadius:2, background:c.color, flexShrink:0 }} />
                        <span style={{ fontSize:12, color:C.gray800, flex:1 }}>{c.name}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:c.color }}>{fmtUSD(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Clientes más rentables */}
            {top5.length > 0 && (
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Icon name="star" size={15} color={C.teal} />
                  <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Clientes más rentables</span>
                </div>
                {top5.map((c,i) => (
                  <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:i<top5.length-1?12:0 }}>
                    <span style={{ fontSize:14, fontWeight:900, color:C.gray400, width:20, flexShrink:0 }}>#{i+1}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {c.nombre}
                      </p>
                      <div style={{ height:4, background:C.gray100, borderRadius:2, marginTop:4 }}>
                        <div style={{ height:'100%', width:`${(c.compras/top5[0].compras)*100}%`, background:C.teal, borderRadius:2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize:13, fontWeight:900, color:C.teal, flexShrink:0 }}>{fmtUSD(c.compras)}</span>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

import { C } from '../../constants/colors'
import { CLIENTES, VENTAS, VENTAS_MES, TOP_PRODUCTOS, PIE_CATEGORIAS } from '../../constants/data'
import { fmtUSD, sumVentas, ticketPromedio } from '../../utils/helpers'
import {
  AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import KpiCard from '../shared/KpiCard'

export default function AnalyticsScreen() {
  const total = sumVentas(VENTAS)
  const avg   = ticketPromedio(VENTAS)
  const top5  = CLIENTES.map(c=>({...c,compras:VENTAS.filter(v=>v.clienteId===c.id).reduce((s,v)=>s+v.total,0)})).sort((a,b)=>b.compras-a.compras).slice(0,5)

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 16px' }}>
        <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:0 }}>Analítica</h1>
        <p style={{ fontSize:13, color:C.gray400, marginTop:4 }}>Últimos 6 meses · Carlos Mendoza</p>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <KpiCard label="Total ventas"    val={fmtUSD(total)} icon="dollar" color={C.teal}  trend={18} />
          <KpiCard label="Ticket promedio" val={fmtUSD(avg)}   icon="star"   color={C.amber} />
        </div>

        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <Icon name="trending_up" size={16} color={C.teal} />
            <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Ventas vs. Meta mensual</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={VENTAS_MES}>
              <defs>
                <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.teal} stopOpacity={.3} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray200} />
              <XAxis dataKey="mes" tick={{ fontSize:11, fill:C.gray400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:C.gray400 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
              <Tooltip formatter={(v,n)=>[`$${v}`,n==='ventas'?'Ventas':'Meta']} />
              <Area type="monotone" dataKey="ventas" stroke={C.teal} fill="url(#tG)" strokeWidth={2.5} dot={{ r:4, fill:C.teal }} />
              <Line type="monotone" dataKey="meta" stroke={C.amber} strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <Icon name="award" size={16} color={C.amber} />
            <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Productos más vendidos</span>
          </div>
          {TOP_PRODUCTOS.map((p,i)=>(
            <div key={i} style={{ marginBottom:i<4?10:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{p.nombre}</span>
                <span style={{ fontSize:13, fontWeight:700, color:p.color }}>{p.ventas} uds</span>
              </div>
              <div style={{ height:6, background:C.gray100, borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(p.ventas/48)*100}%`, background:p.color, borderRadius:3 }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <Icon name="pkg" size={16} color="#A78BFA" />
            <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Ventas por categoría</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart><Pie data={PIE_CATEGORIAS} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={64} paddingAngle={2}>{PIE_CATEGORIAS.map((e,i)=><Cell key={i} fill={e.color} />)}</Pie></PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1 }}>
              {PIE_CATEGORIAS.map((c,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:i<2?10:0 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:c.color, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:C.gray800, flex:1 }}>{c.name}</span>
                  <span style={{ fontSize:15, fontWeight:900, color:c.color }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <Icon name="star" size={16} color={C.teal} />
            <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Clientes más rentables</span>
          </div>
          {top5.map((c,i)=>(
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
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

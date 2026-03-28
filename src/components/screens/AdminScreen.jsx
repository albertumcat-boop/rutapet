import { C } from '../../constants/colors'
import { CLIENTES, VENDEDORES_ADMIN } from '../../constants/data'
import { fmtUSD } from '../../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Avatar from '../shared/Avatar'
import TopBar from '../shared/TopBar'

export default function AdminScreen({ onBack }) {
  const globalTotal = VENDEDORES_ADMIN.reduce((s,v)=>s+v.ventas,0)
  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Panel Administrador" onBack={onBack} />
      <div style={{ background:C.navy, padding:'0 14px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[{l:'Vendedores',v:VENDEDORES_ADMIN.length,c:C.teal},{l:'Clientes',v:CLIENTES.length,c:'#3B82F6'},{l:'Ventas mes',v:fmtUSD(globalTotal),c:C.amber}].map((k,i)=>(
            <div key={i} style={{ background:'#ffffff15', borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
              <p style={{ fontSize:16, fontWeight:900, color:k.c, margin:0 }}>{k.v}</p>
              <p style={{ fontSize:10, color:C.gray400, margin:0 }}>{k.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
          <Icon name="chart" size={16} color={C.teal} />
          <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Rendimiento por vendedor</span>
        </div>
        <Card style={{ padding:'14px 8px' }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={VENDEDORES_ADMIN} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.gray200} />
              <XAxis type="number" tick={{ fontSize:11, fill:C.gray400 }} tickFormatter={v=>`$${v}`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize:11, fill:C.gray800 }} width={110} axisLine={false} tickLine={false} />
              <Tooltip formatter={v=>[`$${v}`,'Ventas']} />
              <Bar dataKey="ventas" fill={C.teal} radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div style={{ display:'flex', alignItems:'center', gap:6, margin:'14px 0 10px' }}>
          <Icon name="users" size={16} color={C.teal} />
          <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Equipo de vendedores</span>
        </div>
        {VENDEDORES_ADMIN.map(v=>(
          <Card key={v.id}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <Avatar initials={v.av} bg={v.activo?C.teal:C.gray400} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>{v.nombre}</span>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:v.activo?C.green:C.gray400 }} />
                </div>
                <p style={{ fontSize:12, color:C.gray400, margin:0 }}>{v.zona} · {v.cls} clientes</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:15, fontWeight:900, color:C.teal, margin:0 }}>{fmtUSD(v.ventas)}</p>
                <p style={{ fontSize:11, color:C.gray400 }}>este mes</p>
              </div>
            </div>
          </Card>
        ))}

        <div style={{ background:C.navy, borderRadius:16, padding:16, marginTop:6 }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:12 }}>⚙️ Configuración SaaS</p>
          {[{icon:'globe',l:'Moneda',v:'USD / VES'},{icon:'wifi',l:'Sync offline',v:'Activado'},{icon:'users',l:'Plan activo',v:'Pro — 5 users'},{icon:'dollar',l:'Facturación',v:'$29/mes'}].map((s,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:i<3?10:0 }}>
              <Icon name={s.icon} size={14} color={C.teal} />
              <span style={{ fontSize:13, color:C.gray400, flex:1 }}>{s.l}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

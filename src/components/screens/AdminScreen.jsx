import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { fmtUSD, sumVentas, sumDeuda } from '../../utils/helpers'
import { auth } from '../../../firebase/firebase.config'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Avatar from '../shared/Avatar'
import KpiCard from '../shared/KpiCard'
import TopBar from '../shared/TopBar'

export default function AdminScreen({ onBack }) {
  const { clientes, ventas, productos, visitas } = useAppData()
  const { config, resetConfig }                  = useConfig()
  const user    = auth.currentUser
  const nombre  = user?.displayName || user?.email?.split('@')[0] || 'Admin'
  const avatar  = nombre.slice(0, 2).toUpperCase()
  const total   = sumVentas(ventas)
  const deuda   = sumDeuda(clientes)

  // Ventas por método de pago para la gráfica
  const chartData = [
    { nombre: 'Efectivo',      ventas: ventas.filter(v => v.metodoPago === 'efectivo').reduce((s,v) => s+v.total, 0)      },
    { nombre: 'Transferencia', ventas: ventas.filter(v => v.metodoPago === 'transferencia').reduce((s,v) => s+v.total, 0) },
    { nombre: 'Pago Móvil',    ventas: ventas.filter(v => v.metodoPago === 'pagoMovil').reduce((s,v) => s+v.total, 0)     },
  ].filter(d => d.ventas > 0)

  const handleReconfigurar = () => {
    if (confirm('¿Reconfigurar la app? Se borrarán tus tipos y categorías personalizadas.')) {
      resetConfig()
    }
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Panel Admin" onBack={onBack} />

      <div style={{ background:C.navy, padding:'0 14px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <Avatar initials={avatar} size={46} />
          <div>
            <p style={{ fontSize:15, fontWeight:800, color:'#fff', margin:0 }}>{nombre}</p>
            <p style={{ fontSize:12, color:C.gray400, margin:0 }}>{config.empresa.nombre}</p>
            <p style={{ fontSize:11, color:C.teal, margin:0 }}>{config.empresa.rubro}</p>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { l:'Clientes',  v:clientes.length,  c:C.teal    },
            { l:'Ventas',    v:ventas.length,     c:'#3B82F6' },
            { l:'Productos', v:productos.length,  c:C.amber   },
            { l:'Visitas',   v:visitas.length,    c:'#A78BFA' },
          ].map((k,i) => (
            <div key={i} style={{ background:'#ffffff15', borderRadius:12, padding:'10px 4px', textAlign:'center' }}>
              <p style={{ fontSize:16, fontWeight:900, color:k.c, margin:0 }}>{k.v}</p>
              <p style={{ fontSize:10, color:C.gray400, margin:0 }}>{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:14 }}>

        {/* KPIs financieros */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <KpiCard label="Total facturado" val={fmtUSD(total)} icon="dollar" color={C.teal}  />
          <KpiCard label="Deuda pendiente" val={fmtUSD(deuda)} icon="card"   color={C.red}   />
        </div>

        {/* Gráfica ventas por método */}
        {chartData.length > 0 && (
          <Card style={{ padding:'14px 8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12, paddingLeft:8 }}>
              <Icon name="chart" size={16} color={C.teal} />
              <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Ventas por método de pago</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.gray200} />
                <XAxis type="number" tick={{ fontSize:11, fill:C.gray400 }} tickFormatter={v=>`$${v}`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize:11, fill:C.gray800 }} width={100} axisLine={false} tickLine={false} />
                <Tooltip formatter={v=>[`$${v}`,'Total']} />
                <Bar dataKey="ventas" fill={C.teal} radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Config de la empresa */}
        <Card style={{ marginTop:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:C.gray800, margin:0 }}>{config.empresa.nombre}</p>
              <p style={{ fontSize:13, color:C.gray400, margin:'2px 0' }}>{config.empresa.rubro}</p>
              <p style={{ fontSize:12, color:C.teal, fontWeight:700 }}>Moneda: {config.empresa.moneda}</p>
            </div>
            <button onClick={handleReconfigurar}
              style={{ background:C.gray100, border:'none', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:700, color:C.gray600, cursor:'pointer', fontFamily:'inherit' }}>
              Reconfigurar
            </button>
          </div>

          <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:8 }}>Tipos de cliente</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
            {config.tiposCliente.map(t => (
              <div key={t.key} style={{ display:'flex', alignItems:'center', gap:6, background:t.color+'12', borderRadius:20, padding:'4px 12px' }}>
                <Icon name={t.icon} size={13} color={t.color} />
                <span style={{ fontSize:12, fontWeight:700, color:t.color }}>{t.label}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:8 }}>Categorías de producto</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {config.categoriasProducto.map(c => (
              <div key={c.key} style={{ display:'flex', alignItems:'center', gap:6, background:c.color+'12', borderRadius:20, padding:'4px 12px' }}>
                <Icon name={c.icon} size={13} color={c.color} />
                <span style={{ fontSize:12, fontWeight:700, color:c.color }}>{c.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Info técnica */}
        <div style={{ background:C.navy, borderRadius:16, padding:16, marginTop:14 }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:12 }}>⚙️ Estado del sistema</p>
          {[
            { icon:'globe',    l:'Moneda',       v: config.empresa.moneda      },
            { icon:'wifi',     l:'Base de datos', v: 'Firebase Firestore'      },
            { icon:'users',    l:'Clientes',      v: `${clientes.length} registrados` },
            { icon:'activity', l:'Visitas',       v: `${visitas.length} registradas`  },
          ].map((s,i) => (
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

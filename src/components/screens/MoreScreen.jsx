import { C } from '../../constants/colors'
import { CLIENTES, VENTAS, CURRENT_USER } from '../../constants/data'
import { fmtUSD, sumVentas } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Avatar from '../shared/Avatar'

const MENU = [
  { icon:'plus',     label:'Nueva venta',    sub:'Registrar pedido',       color:'#0FBCAA', screen:'addSale'  },
  { icon:'pkg',      label:'Catálogo',        sub:'Ver productos',          color:'#22C55E', screen:'products' },
  { icon:'card',     label:'Cobros',          sub:'Control de deudas',      color:'#EF4444', screen:'payments' },
  { icon:'route',    label:'Rutas',           sub:'Planificar visitas',      color:'#F5A623', screen:'routes'   },
  { icon:'calendar', label:'Visitas',         sub:'Historial de visitas',   color:'#3B82F6', screen:'visits'   },
  { icon:'settings', label:'Admin',           sub:'Panel de administrador', color:'#A78BFA', screen:'admin'    },
]

export default function MoreScreen({ nav, onLogout }) {
  const total = sumVentas(VENTAS)
  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Avatar initials={CURRENT_USER.avatar} size={52} />
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:'#fff', margin:0 }}>{CURRENT_USER.nombre}</p>
            <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>{CURRENT_USER.email}</p>
            <Badge bg={C.teal+'30'} txt={C.teal}>Vendedor — {CURRENT_USER.zona}</Badge>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:16 }}>
          {[{l:'Ventas mes',v:fmtUSD(total)},{l:'Clientes',v:CLIENTES.length},{l:'Crecimiento',v:'+18%'}].map((k,i)=>(
            <div key={i} style={{ background:'#ffffff15', borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
              <p style={{ fontSize:16, fontWeight:900, color:'#fff', margin:0 }}>{k.v}</p>
              <p style={{ fontSize:10, color:C.gray400, margin:0 }}>{k.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:14 }}>
        {MENU.map((item,i)=>(
          <Card key={i} onClick={()=>nav(item.screen)}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:item.color+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name={item.icon} size={22} color={item.color} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15, fontWeight:700, color:C.gray800, margin:0 }}>{item.label}</p>
                <p style={{ fontSize:12, color:C.gray400, margin:0 }}>{item.sub}</p>
              </div>
              <Icon name="chevron" size={16} color={C.gray400} />
            </div>
          </Card>
        ))}
        <div style={{ background:'#DCFCE7', borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, marginTop:4 }}>
          <Icon name="wifi" size={18} color={C.green} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'#166534', margin:0 }}>Conectado — datos sincronizados</p>
            <p style={{ fontSize:11, color:'#15803D', margin:0 }}>Modo offline disponible · 0 cambios pendientes</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ width:'100%', marginTop:14, padding:'13px', background:'#FEE2E2', border:'none', borderRadius:14, color:C.red, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' }}>
          <Icon name="logout" size={18} color={C.red} />
          Cerrar sesión
        </button>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

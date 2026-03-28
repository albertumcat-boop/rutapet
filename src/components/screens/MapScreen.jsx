import { useState } from 'react'
import { C, nivelColor, nivelBg, nivelTxt, tipoColor, tipoIconName } from '../../constants/colors'
import { CLIENTES } from '../../constants/data'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

const TIPO_LETRA = { veterinaria:'V', petshop:'P', agropecuaria:'A' }
const W = 340, H = 260

export default function MapScreen({ nav }) {
  const [sel,  setSel]  = useState(null)
  const [filt, setFilt] = useState('todos')

  const visible = CLIENTES.filter((c) => filt === 'todos' || c.tipo === filt)
  const lats = CLIENTES.map(c=>c.lat), lngs = CLIENTES.map(c=>c.lng)
  const minLat=Math.min(...lats)-.02, maxLat=Math.max(...lats)+.02
  const minLng=Math.min(...lngs)-.02, maxLng=Math.max(...lngs)+.02
  const toX = (lng) => ((lng-minLng)/(maxLng-minLng))*(W-50)+25
  const toY = (lat) => H-((lat-minLat)/(maxLat-minLat))*(H-50)-25

  const rutaPts = ['c2','c4','c8'].map(id=>CLIENTES.find(c=>c.id===id)).filter(Boolean).map(c=>`${toX(c.lng)},${toY(c.lat)}`).join(' ')

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:0 }}>Mapa de clientes</h1>
          <span style={{ fontSize:13, color:C.teal, fontWeight:700 }}>{visible.length} visibles</span>
        </div>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          {['todos','veterinaria','petshop','agropecuaria'].map((t)=>(
            <button key={t} onClick={()=>{setFilt(t);setSel(null)}} style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', background:filt===t?C.teal:'#ffffff20', color:'#fff', border:'none', flexShrink:0 }}>
              {t==='todos'?'Todos':t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'#D1FAE5', position:'relative' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
          <rect width={W} height={H} fill="#E8F5E9" />
          {[.25,.5,.75].map(f=>(
            <g key={f}>
              <line x1={toX(minLng+f*(maxLng-minLng))} y1={0} x2={toX(minLng+f*(maxLng-minLng))} y2={H} stroke="#00000010" strokeWidth={.5} />
              <line x1={0} y1={toY(minLat+f*(maxLat-minLat))} x2={W} y2={toY(minLat+f*(maxLat-minLat))} stroke="#00000010" strokeWidth={.5} />
            </g>
          ))}
          <path d={`M 20 ${H/2} Q ${W/2} ${H/2-15} ${W-20} ${H/2}`} stroke="#ffffff80" strokeWidth={5} fill="none" />
          <path d={`M ${W/2} 15 L ${W/2} ${H-15}`} stroke="#ffffff60" strokeWidth={3} fill="none" />
          <polyline points={rutaPts} stroke={C.amber} strokeWidth={2.5} strokeDasharray="6,4" fill="none" opacity={.8} />
          {visible.map((c)=>{
            const x=toX(c.lng),y=toY(c.lat),col=nivelColor(c.nivel),isSel=sel?.id===c.id
            return (
              <g key={c.id} onClick={()=>setSel(isSel?null:c)} style={{ cursor:'pointer' }}>
                <circle cx={x} cy={y} r={isSel?22:16} fill={col} opacity={.2} />
                <circle cx={x} cy={y} r={isSel?13:10} fill={col} stroke="#fff" strokeWidth={isSel?2.5:1.5} />
                <text x={x} y={y+4} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="bold" fontFamily="sans-serif">{TIPO_LETRA[c.tipo]||'?'}</text>
                {isSel&&<circle cx={x} cy={y} r={22} fill="none" stroke={col} strokeWidth={2} opacity={.7} />}
              </g>
            )
          })}
        </svg>
        <div style={{ position:'absolute', top:10, right:10, background:'rgba(255,255,255,.92)', borderRadius:10, padding:'8px 10px' }}>
          {[['V','#3B82F6','Vet'],['P',C.teal,'Pet'],['A',C.green,'Agro']].map(([l,c,t])=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <div style={{ width:16, height:16, borderRadius:'50%', background:c, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:8, color:'#fff', fontWeight:800 }}>{l}</span></div>
              <span style={{ fontSize:10, color:C.gray600 }}>{t}</span>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${C.gray200}`, paddingTop:4, marginTop:2 }}>
            {[['● Alto',C.green],['● Medio',C.yellow],['● Bajo',C.red]].map(([l,c])=>(<div key={l} style={{ fontSize:10, color:c, fontWeight:700 }}>{l}</div>))}
          </div>
        </div>
      </div>

      {sel ? (
        <div style={{ padding:'12px 14px' }}>
          <Card onClick={() => nav('clientDetail', sel)}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:tipoColor(sel.tipo)+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name={tipoIconName(sel.tipo)} size={22} color={tipoColor(sel.tipo)} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>{sel.nombre}</p>
                <p style={{ fontSize:12, color:C.gray600, margin:'2px 0' }}>{sel.contacto}</p>
                <Badge bg={nivelBg(sel.nivel)} txt={nivelTxt(sel.nivel)}>Nivel {sel.nivel}</Badge>
              </div>
              <Icon name="chevron" size={16} color={C.gray400} />
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <Button size="sm" icon="phone" variant="ghost" onClick={e=>e.stopPropagation()}>Llamar</Button>
              <Button size="sm" icon="nav" variant="secondary" onClick={e=>e.stopPropagation()}>Navegar</Button>
              <Button size="sm" icon="plus" onClick={e=>{e.stopPropagation();nav('addSale',{clienteId:sel.id})}}>Venta</Button>
            </div>
          </Card>
        </div>
      ) : (
        <div style={{ padding:'14px' }}>
          <p style={{ fontSize:13, color:C.gray400, textAlign:'center', marginBottom:12 }}>Toca un pin para ver detalles del cliente</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Button icon="nav" fullWidth>Crear ruta hoy</Button>
            <Button icon="target" variant="secondary" fullWidth>Cercanos a mí</Button>
          </div>
        </div>
      )}
      <div style={{ height: 90 }} />
    </div>
  )
}

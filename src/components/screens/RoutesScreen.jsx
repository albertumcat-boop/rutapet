import { useState } from 'react'
import { C, nivelColor } from '../../constants/colors'
import { CLIENTES, RUTAS } from '../../constants/data'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function RoutesScreen() {
  const [open, setOpen] = useState(null)

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:0 }}>Rutas</h1>
          <Button icon="plus" size="sm">Nueva ruta</Button>
        </div>
        <p style={{ fontSize:13, color:C.gray400, marginTop:6 }}>Planifica y optimiza tus visitas diarias</p>
      </div>
      <div style={{ padding:14 }}>
        {RUTAS.map(r=>{
          const isOpen=open===r.id
          const cls=CLIENTES.filter(c=>r.clientes.includes(c.id))
          const stBg=r.estado==='completada'?'#DCFCE7':'#FEF9C3'
          const stTxt=r.estado==='completada'?'#166534':'#854D0E'
          return (
            <Card key={r.id} onClick={()=>setOpen(isOpen?null:r.id)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:C.gray800, margin:0 }}>{r.nombre}</p>
                  <p style={{ fontSize:12, color:C.gray400, marginTop:2 }}>{r.fecha}</p>
                  <div style={{ display:'flex', gap:14, marginTop:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Icon name="pin" size={13} color={C.teal} />
                      <span style={{ fontSize:12, fontWeight:600, color:C.gray600 }}>{r.clientes.length} paradas</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Icon name="truck" size={13} color={C.amber} />
                      <span style={{ fontSize:12, fontWeight:600, color:C.gray600 }}>{r.km} km</span>
                    </div>
                  </div>
                </div>
                <Badge bg={stBg} txt={stTxt}>{r.estado==='completada'?'✓ Completada':'Pendiente'}</Badge>
              </div>
              {isOpen && (
                <>
                  <div style={{ borderTop:`1px solid ${C.gray200}`, paddingTop:12, marginTop:12, marginBottom:12 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:8 }}>Paradas en orden:</p>
                    {cls.map((c,i)=>(
                      <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', background:C.teal+'20', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontSize:11, fontWeight:800, color:C.teal }}>{i+1}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:C.gray800, margin:0 }}>{c.nombre}</p>
                          <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{c.tipo}</p>
                        </div>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:nivelColor(c.nivel) }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <Button icon="nav" fullWidth onClick={e=>e.stopPropagation()}>Iniciar ruta</Button>
                    <Button icon="map" variant="secondary" fullWidth onClick={e=>e.stopPropagation()}>Ver mapa</Button>
                  </div>
                </>
              )}
            </Card>
          )
        })}
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:16, padding:'16px', border:`1px solid ${C.teal}30` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Icon name="zap" size={16} color={C.amber} />
            <span style={{ fontSize:13, fontWeight:700, color:C.amber }}>Próximamente — IA de rutas</span>
          </div>
          <p style={{ fontSize:13, color:C.gray400, margin:0 }}>Optimización automática: mejores horarios, rutas más cortas y predicción de compra por cliente.</p>
        </div>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

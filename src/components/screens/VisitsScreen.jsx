import { C } from '../../constants/colors'
import { CLIENTES, VISITAS } from '../../constants/data'
import { daysSince } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import KpiCard from '../shared/KpiCard'
import Button from '../shared/Button'

export default function VisitsScreen({ nav }) {
  const pendientes = CLIENTES.filter(c=>daysSince(c.ultimaVisita)>20)
  const conversion = Math.round((VISITAS.filter(v=>v.vendio).length/VISITAS.length)*100)

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:0 }}>Visitas</h1>
          <Button icon="plus" size="sm">Registrar</Button>
        </div>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <KpiCard label="Visitas este mes" val={VISITAS.length}    icon="calendar" color={C.teal}  />
          <KpiCard label="Conversión"        val={`${conversion}%`} icon="target"   color={C.green} />
        </div>

        <p style={{ fontSize:14, fontWeight:800, color:C.gray800, marginBottom:10 }}>Historial reciente</p>
        {VISITAS.map(v=>{
          const cl=CLIENTES.find(c=>c.id===v.clienteId)
          return (
            <Card key={v.id} onClick={()=>cl&&nav('clientDetail',cl)}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:v.vendio?'#DCFCE7':'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name={v.vendio?'ok_circle':'x_circle'} size={20} color={v.vendio?C.green:C.red} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>{cl?.nombre}</p>
                  <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>{v.fecha}</p>
                  {v.notas&&<p style={{ fontSize:12, color:C.gray600, margin:0 }}>{v.notas}</p>}
                </div>
                <Badge bg={v.vendio?'#DCFCE7':'#FEE2E2'} txt={v.vendio?'#166534':'#991B1B'}>{v.vendio?'Vendió':'Sin venta'}</Badge>
              </div>
            </Card>
          )
        })}

        <p style={{ fontSize:14, fontWeight:800, color:C.gray800, margin:'16px 0 10px' }}>⚠️ Pendientes de visita</p>
        {pendientes.map(c=>(
          <Card key={c.id} onClick={()=>nav('clientDetail',c)}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'#FEF9C3', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="calendar" size={18} color={C.yellow} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>{c.nombre}</p>
                <p style={{ fontSize:12, color:C.red, fontWeight:700, margin:0 }}>Sin visita hace {daysSince(c.ultimaVisita)} días</p>
              </div>
              <Icon name="chevron" size={16} color={C.gray400} />
            </div>
          </Card>
        ))}
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

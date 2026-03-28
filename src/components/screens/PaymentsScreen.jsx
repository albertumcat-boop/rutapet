import { useState } from 'react'
import { C, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { CLIENTES, VENTAS } from '../../constants/data'
import { fmtUSD, clientesConDeuda, sumDeuda } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Avatar from '../shared/Avatar'
import Button from '../shared/Button'

export default function PaymentsScreen() {
  const [tab, setTab] = useState('deudas')
  const conDeuda   = clientesConDeuda(CLIENTES)
  const totalDeuda = sumDeuda(CLIENTES)

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 14px' }}>
        <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:'0 0 14px' }}>Cobros</h1>
        <div style={{ background:'#ffffff15', borderRadius:16, padding:'14px', display:'flex', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:12, color:C.gray400, margin:0 }}>Deuda total</p>
            <p style={{ fontSize:26, fontWeight:900, color:C.red, margin:'4px 0 0' }}>{fmtUSD(totalDeuda)}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:12, color:C.gray400, margin:0 }}>Clientes</p>
            <p style={{ fontSize:26, fontWeight:900, color:'#fff', margin:'4px 0 0' }}>{conDeuda.length}</p>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}` }}>
        {[['deudas','Deudas activas'],['historial','Historial']].map(([key,lbl])=>(
          <button key={key} onClick={()=>setTab(key)} style={{ flex:1, padding:'12px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===key?700:400, color:tab===key?C.teal:C.gray400, borderBottom:`2px solid ${tab===key?C.teal:'transparent'}`, fontFamily:'inherit' }}>{lbl}</button>
        ))}
      </div>

      <div style={{ padding:'12px 14px' }}>
        {tab==='deudas' && (conDeuda.length===0
          ? <div style={{ textAlign:'center', padding:'40px 0' }}><Icon name="ok_circle" size={40} color={C.green} /><p style={{ fontSize:14, color:C.gray600, marginTop:10, fontWeight:700 }}>¡Todo al día!</p></div>
          : conDeuda.map(c=>(
              <Card key={c.id}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <Avatar initials={c.nombre.slice(0,2).toUpperCase()} bg={C.red} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>{c.nombre}</p>
                    <p style={{ fontSize:12, color:C.gray400, margin:0 }}>{c.contacto}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:17, fontWeight:900, color:C.red, margin:0 }}>{fmtUSD(c.deuda)}</p>
                    <Badge bg="#FEE2E2" txt="#991B1B">Pendiente</Badge>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <Button size="sm" icon="ok_circle" fullWidth>Registrar pago</Button>
                  <Button size="sm" icon="phone" variant="ghost">Llamar</Button>
                </div>
              </Card>
            ))
        )}
        {tab==='historial' && VENTAS.map(v=>{
          const cl=CLIENTES.find(c=>c.id===v.clienteId)
          const ep=estadoPagoInfo(v.estado)
          return (
            <Card key={v.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>{cl?.nombre}</p>
                  <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>{v.fecha} · {metodoPagoLabel(v.metodoPago)}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:15, fontWeight:800, color:C.gray800, margin:0 }}>{fmtUSD(v.total)}</p>
                  <Badge bg={ep.bg} txt={ep.txt}>{ep.label}</Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

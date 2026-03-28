import { useState } from 'react'
import { C, nivelBg, nivelTxt, tipoColor, tipoIconName, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { VENTAS } from '../../constants/data'
import { fmtUSD, daysSince } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function ClientDetailScreen({ cliente, onBack, nav }) {
  const [tab, setTab] = useState('info')
  if (!cliente) return null
  const ventasC = VENTAS.filter((v) => v.clienteId === cliente.id)
  const total   = ventasC.reduce((s, v) => s + v.total, 0)
  const dias    = daysSince(cliente.ultimaVisita)

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar title={cliente.nombre} onBack={onBack} right={<button style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}><Icon name="edit" size={18} color="#fff" /></button>} />

      <div style={{ background: C.navy, padding: '0 16px 20px', color: '#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:tipoColor(cliente.tipo)+'25', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name={tipoIconName(cliente.tipo)} size={28} color={tipoColor(cliente.tipo)} />
          </div>
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <Badge bg={nivelBg(cliente.nivel)} txt={nivelTxt(cliente.nivel)}>● Nivel {cliente.nivel}</Badge>
              <Badge bg={tipoColor(cliente.tipo)+'20'} txt={tipoColor(cliente.tipo)}>{cliente.tipo}</Badge>
            </div>
            <p style={{ fontSize:13, color:C.gray400, margin:0 }}>{cliente.contacto}</p>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[{l:'Total compras',v:fmtUSD(total)},{l:'Última visita',v:dias===0?'Hoy':`${dias}d`},{l:'Deuda',v:fmtUSD(cliente.deuda)}].map((k,i)=>(
            <div key={i} style={{ textAlign:'center', background:'#ffffff15', borderRadius:12, padding:'10px 6px' }}>
              <p style={{ fontSize:16, fontWeight:900, color:'#fff', margin:0 }}>{k.v}</p>
              <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}` }}>
        {[['info','Info'],['ventas','Ventas'],['notas','Notas']].map(([key,lbl])=>(
          <button key={key} onClick={()=>setTab(key)} style={{ flex:1, padding:'12px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===key?700:400, color:tab===key?C.teal:C.gray400, borderBottom:`2px solid ${tab===key?C.teal:'transparent'}`, fontFamily:'inherit' }}>{lbl}</button>
        ))}
      </div>

      <div style={{ padding: 14 }}>
        {tab === 'info' && (
          <>
            <Card>
              <p style={{ fontSize:13, fontWeight:700, color:C.gray800, marginBottom:12 }}>Información de contacto</p>
              {[{icon:'phone',lbl:'Teléfono',val:cliente.telefono},{icon:'pin',lbl:'Dirección',val:cliente.direccion}].map((r,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:i===0?12:0 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:C.gray100, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name={r.icon} size={14} color={C.gray600} />
                  </div>
                  <div>
                    <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{r.lbl}</p>
                    <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0 }}>{r.val}</p>
                  </div>
                </div>
              ))}
            </Card>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Button icon="plus" fullWidth onClick={() => nav('addSale', { clienteId: cliente.id })}>Nueva venta</Button>
              <Button icon="calendar" variant="secondary" fullWidth>Registrar visita</Button>
            </div>
          </>
        )}
        {tab === 'ventas' && (
          ventasC.length === 0
            ? <div style={{ textAlign:'center', padding:'30px 0' }}><Icon name="pkg" size={32} color={C.gray400} /><p style={{ fontSize:13, color:C.gray400, marginTop:10 }}>Sin ventas registradas</p></div>
            : ventasC.map((v) => {
                const ep = estadoPagoInfo(v.estado)
                return (
                  <Card key={v.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <p style={{ fontSize:15, fontWeight:800, color:C.gray800, margin:0 }}>{fmtUSD(v.total)}</p>
                        <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>{v.fecha} · {metodoPagoLabel(v.metodoPago)}</p>
                        <p style={{ fontSize:12, color:C.gray600, margin:0 }}>{v.items.length} producto(s)</p>
                      </div>
                      <Badge bg={ep.bg} txt={ep.txt}>{ep.label}</Badge>
                    </div>
                  </Card>
                )
              })
        )}
        {tab === 'notas' && <Card><p style={{ fontSize:14, color:C.gray600, margin:0, lineHeight:1.7 }}>{cliente.notas || 'Sin notas.'}</p></Card>}
      </div>
      <div style={{ height: 90 }} />
    </div>
  )
}

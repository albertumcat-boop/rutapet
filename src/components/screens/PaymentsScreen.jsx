import { useState } from 'react'
import { C, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { CLIENTES, VENTAS } from '../../constants/data'
import { fmtUSD, clientesConDeuda, sumDeuda } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Avatar from '../shared/Avatar'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function PaymentsScreen({ onBack }) {
  const [tab,      setTab]      = useState('deudas')
  const [modal,    setModal]    = useState(null)
  const [monto,    setMonto]    = useState('')
  const [metodo,   setMetodo]   = useState('efectivo')
  const [ref,      setRef]      = useState('')
  const [pagado,   setPagado]   = useState(false)

  const conDeuda   = clientesConDeuda(CLIENTES)
  const totalDeuda = sumDeuda(CLIENTES)

  const handlePagar = () => {
    if (!monto) return
    setPagado(true)
    setTimeout(() => {
      setModal(null)
      setMonto('')
      setRef('')
      setPagado(false)
    }, 1500)
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar title="Cobros y pagos" onBack={onBack} />

      <div style={{ background: C.navy, padding: '0 14px 20px' }}>
        <div style={{ background: '#ffffff15', borderRadius: 16, padding: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>Deuda total</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: C.red, margin: '4px 0 0' }}>{fmtUSD(totalDeuda)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>Clientes</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '4px 0 0' }}>{conDeuda.length}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', background: '#fff', borderBottom: `1px solid ${C.gray200}` }}>
        {[['deudas','Deudas activas'],['historial','Historial']].map(([key,lbl]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex:1, padding:'12px', background:'none', border:'none', cursor:'pointer', fontSize:13,
              fontWeight:tab===key?700:400, color:tab===key?C.teal:C.gray400,
              borderBottom:`2px solid ${tab===key?C.teal:'transparent'}`, fontFamily:'inherit' }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 14px' }}>
        {tab === 'deudas' && (
          conDeuda.length === 0
            ? <div style={{ textAlign:'center', padding:'40px 0' }}>
                <Icon name="ok_circle" size={40} color={C.green} />
                <p style={{ fontSize:14, color:C.gray600, marginTop:10, fontWeight:700 }}>¡Todo al día! Sin deudas.</p>
              </div>
            : conDeuda.map((c) => (
                <Card key={c.id}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <Avatar initials={c.nombre.slice(0,2).toUpperCase()} bg={C.red} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>{c.nombre}</p>
                      <p style={{ fontSize:12, color:C.gray400, margin:0 }}>{c.contacto} · {c.telefono}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontSize:17, fontWeight:900, color:C.red, margin:0 }}>{fmtUSD(c.deuda)}</p>
                      <Badge bg="#FEE2E2" txt="#991B1B">Pendiente</Badge>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <Button size="sm" icon="ok_circle" fullWidth onClick={() => setModal(c)}>
                      Registrar pago
                    </Button>
                    <Button size="sm" icon="phone" variant="ghost"
                      onClick={() => window.open(`tel:${c.telefono}`)}>
                      Llamar
                    </Button>
                  </div>
                </Card>
              ))
        )}

        {tab === 'historial' && VENTAS.map((v) => {
          const cl = CLIENTES.find((c) => c.id === v.clienteId)
          const ep = estadoPagoInfo(v.estado)
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

      {/* Modal registrar pago */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:480 }}>
            {pagado ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <Icon name="ok_circle" size={32} color={C.green} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:C.gray800 }}>¡Pago registrado!</h3>
                <p style={{ fontSize:14, color:C.teal, fontWeight:700 }}>{fmtUSD(parseFloat(monto)||0)}</p>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <h3 style={{ fontSize:17, fontWeight:800, color:C.gray800, margin:0 }}>Registrar pago</h3>
                  <button onClick={() => setModal(null)} style={{ background:'none', border:'none', cursor:'pointer' }}>
                    <Icon name="x_circle" size={22} color={C.gray400} />
                  </button>
                </div>

                <div style={{ background:C.gray50, borderRadius:12, padding:'12px', marginBottom:16 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>{modal.nombre}</p>
                  <p style={{ fontSize:13, color:C.red, fontWeight:700, margin:'4px 0 0' }}>Deuda total: {fmtUSD(modal.deuda)}</p>
                </div>

                <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Monto a pagar *</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder={`Máximo ${fmtUSD(modal.deuda)}`}
                  style={{ width:'100%', padding:'12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:16, fontFamily:'inherit', boxSizing:'border-box', marginBottom:14, fontWeight:700 }}
                />

                <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:8 }}>Método de pago</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                  {[{k:'efectivo',l:'Efectivo',i:'dollar'},{k:'transferencia',l:'Transferencia',i:'send'},{k:'pagoMovil',l:'Pago Móvil',i:'phone'}].map((m) => (
                    <button key={m.k} onClick={() => setMetodo(m.k)}
                      style={{ padding:'8px 4px', borderRadius:10, border:`2px solid ${metodo===m.k?C.teal:C.gray200}`, background:metodo===m.k?C.teal+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
                      <Icon name={m.i} size={16} color={metodo===m.k?C.teal:C.gray400} style={{ display:'block', margin:'0 auto 3px' }} />
                      <span style={{ fontSize:10, fontWeight:700, color:metodo===m.k?C.teal:C.gray600 }}>{m.l}</span>
                    </button>
                  ))}
                </div>

                {metodo !== 'efectivo' && (
                  <>
                    <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Referencia / Confirmación</label>
                    <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Nº de referencia..."
                      style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', marginBottom:14 }} />
                  </>
                )}

                <Button icon="ok_circle" size="lg" fullWidth disabled={!monto} onClick={handlePagar}>
                  Confirmar pago de {monto ? fmtUSD(parseFloat(monto)) : '$0.00'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ height: 90 }} />
    </div>
  )
}

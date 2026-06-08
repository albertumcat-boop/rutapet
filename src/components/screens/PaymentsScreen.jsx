/**
 * PaymentsScreen.jsx — Cobros y pagos
 * Auditado: registrarPago conectado a Firebase, recarga datos
 */
import { useState, useEffect } from 'react'
import { C, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useToast } from '../../context/ToastContext'
import { registrarPago, obtenerPagos } from '../../services/firestore'
import { fmtUSD, clientesConDeuda, sumDeuda, fmtFecha } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Avatar from '../shared/Avatar'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function PaymentsScreen({ onBack }) {
  const { clientes, recargar } = useAppData()
  const toast = useToast()
  const [pagosHist, setPagosHist] = useState([])
  const [loadingPagos, setLoadingPagos] = useState(false)

  // Cargar historial real de pagos cuando se activa la pestaña
  const cargarPagos = async () => {
    setLoadingPagos(true)
    try {
      const datos = await obtenerPagos()
      // Ordenar por fecha descendente
      datos.sort((a, b) => {
        const fa = a.fecha?.toDate?.() || new Date(a.fecha || 0)
        const fb = b.fecha?.toDate?.() || new Date(b.fecha || 0)
        return fb - fa
      })
      setPagosHist(datos)
    } catch (err) {
      console.error('cargarPagos:', err)
    } finally {
      setLoadingPagos(false)
    }
  }

  const [tab,    setTab]    = useState('deudas')

  // Cargar pagos al montar
  useEffect(() => { cargarPagos() }, [])
  const [modal,  setModal]  = useState(null)
  const [monto,  setMonto]  = useState('')
  const [metodo, setMetodo] = useState('efectivo')
  const [ref,    setRef]    = useState('')
  const [pagado, setPagado] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const conDeuda   = clientesConDeuda(clientes)
  const totalDeuda = sumDeuda(clientes)

  const handlePagar = async () => {
    setError('')
    const montoNum = parseFloat(monto)
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setError('Ingresa un monto válido mayor a $0')
      return
    }
    if (montoNum > (modal?.deuda || 0)) {
      setError(`El monto no puede superar la deuda de ${fmtUSD(modal.deuda)}`)
      return
    }

    setSaving(true)
    try {
      await registrarPago(modal.id, montoNum, modal.deuda || 0, metodo, ref)
      recargar()
      toast.success(`Pago de ${fmtUSD(montoNum)} registrado`)
      setPagado(true)
      setTimeout(() => {
        setModal(null)
        setMonto('')
        setRef('')
        setMetodo('efectivo')
        setPagado(false)
        setSaving(false)
        setError('')
      }, 1600)
    } catch (err) {
      setError('Error: ' + err.message)
      setSaving(false)
    }
  }

  const abrirModal = (cliente) => {
    setModal(cliente)
    setMonto('')
    setRef('')
    setMetodo('efectivo')
    setError('')
    setPagado(false)
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Cobros y pagos" onBack={onBack} />

      {/* Resumen */}
      <div style={{ background:C.navy, padding:'0 14px 20px' }}>
        <div style={{ background:'#ffffff15', borderRadius:16, padding:'14px', display:'flex', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:11, color:C.gray400, margin:0 }}>Deuda total</p>
            <p style={{ fontSize:24, fontWeight:900, color:C.red, margin:'4px 0 0' }}>{fmtUSD(totalDeuda)}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:11, color:C.gray400, margin:0 }}>Clientes con deuda</p>
            <p style={{ fontSize:24, fontWeight:900, color:'#fff', margin:'4px 0 0' }}>{conDeuda.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}` }}>
        {[['deudas','Deudas activas'],['historial','Historial de pagos']].map(([key,lbl]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex:1, padding:'12px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:tab===key?700:400, color:tab===key?C.teal:C.gray400, borderBottom:`2px solid ${tab===key?C.teal:'transparent'}`, fontFamily:'inherit' }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 14px' }}>

        {/* DEUDAS */}
        {tab === 'deudas' && (
          conDeuda.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <Icon name="ok_circle" size={40} color={C.green} />
              <p style={{ fontSize:14, color:C.gray600, marginTop:10, fontWeight:700 }}>¡Todo al día! Sin deudas.</p>
            </div>
          ) : conDeuda.map(c => (
            <Card key={c.id}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <Avatar initials={c.nombre?.slice(0,2).toUpperCase() || '?'} bg={C.red} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {c.nombre}
                  </p>
                  <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{c.contacto || ''} · {c.telefono || ''}</p>
                  {c.limiteCredito > 0 && (
                    <p style={{ fontSize:11, color:C.gray400, margin:0 }}>
                      Límite: {fmtUSD(c.limiteCredito)}
                    </p>
                  )}
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:16, fontWeight:900, color:C.red, margin:0 }}>{fmtUSD(c.deuda)}</p>
                  <Badge bg="#FEE2E2" txt="#991B1B">Pendiente</Badge>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <Button size="sm" icon="ok_circle" fullWidth onClick={() => abrirModal(c)}>
                  Registrar pago
                </Button>
                <Button size="sm" icon="phone" variant="ghost"
                  onClick={() => c.telefono && window.open(`tel:${c.telefono}`)}>
                  Llamar
                </Button>
              </div>
            </Card>
          ))
        )}

        {/* HISTORIAL DE PAGOS REALES */}
        {tab === 'historial' && (
          loadingPagos ? (
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <span style={{ width:28, height:28, border:`3px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            </div>
          ) : pagosHist.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <Icon name="card" size={32} color={C.gray400} />
              <p style={{ fontSize:13, color:C.gray400, marginTop:10 }}>Sin pagos registrados todavía</p>
            </div>
          ) : pagosHist.map(p => {
            const cl = clientes.find(c => c.id === p.clienteId)
            return (
              <Card key={p.id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name="ok_circle" size={18} color={C.green} />
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {cl?.nombre || 'Cliente'}
                      </p>
                      <p style={{ fontSize:11, color:C.gray400, margin:'2px 0' }}>
                        {fmtFecha(p.fecha)} · {metodoPagoLabel(p.metodoPago)}
                      </p>
                      {p.referencia && (
                        <p style={{ fontSize:10, color:C.teal, margin:0 }}>Ref: {p.referencia}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:8 }}>
                    <p style={{ fontSize:15, fontWeight:900, color:C.green, margin:0 }}>+{fmtUSD(p.monto)}</p>
                    <p style={{ fontSize:10, color:C.gray400, margin:'2px 0 0' }}>
                      Saldo: {fmtUSD(p.deudaDespues)}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })
        )}
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
                <p style={{ fontSize:16, color:C.teal, fontWeight:700, marginTop:4 }}>{fmtUSD(parseFloat(monto)||0)}</p>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <h3 style={{ fontSize:16, fontWeight:800, color:C.gray800, margin:0 }}>Registrar pago</h3>
                  <button onClick={() => setModal(null)} style={{ background:'none', border:'none', cursor:'pointer' }}>
                    <Icon name="x_circle" size={22} color={C.gray400} />
                  </button>
                </div>

                <div style={{ background:C.gray50, borderRadius:12, padding:'12px', marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0 }}>{modal.nombre}</p>
                  <p style={{ fontSize:13, color:C.red, fontWeight:700, margin:'4px 0 0' }}>
                    Deuda total: {fmtUSD(modal.deuda)}
                  </p>
                </div>

                <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
                  Monto a pagar *
                </label>
                <input type="number" min="0.01" step="0.01"
                  value={monto} onChange={e => setMonto(e.target.value)}
                  placeholder={`Máx. ${fmtUSD(modal.deuda)}`}
                  style={{ width:'100%', padding:'12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:16, fontFamily:'inherit', boxSizing:'border-box', marginBottom:14, fontWeight:700 }} />

                <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:8 }}>
                  Método de pago
                </label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                  {[
                    { k:'efectivo',      l:'Efectivo',      i:'dollar' },
                    { k:'transferencia', l:'Transferencia', i:'send'   },
                    { k:'pagoMovil',     l:'Pago Móvil',    i:'phone'  },
                  ].map(m => (
                    <button key={m.k} onClick={() => setMetodo(m.k)}
                      style={{ padding:'8px 4px', borderRadius:10, border:`2px solid ${metodo===m.k?C.teal:C.gray200}`, background:metodo===m.k?C.teal+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
                      <Icon name={m.i} size={15} color={metodo===m.k?C.teal:C.gray400} style={{ display:'block', margin:'0 auto 3px' }} />
                      <span style={{ fontSize:10, fontWeight:700, color:metodo===m.k?C.teal:C.gray600 }}>{m.l}</span>
                    </button>
                  ))}
                </div>

                {metodo !== 'efectivo' && (
                  <>
                    <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
                      Referencia / Confirmación
                    </label>
                    <input value={ref} onChange={e => setRef(e.target.value)}
                      placeholder="Nº de referencia..."
                      style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', marginBottom:14 }} />
                  </>
                )}

                {error && (
                  <p style={{ fontSize:12, color:C.red, fontWeight:600, marginBottom:10 }}>⚠ {error}</p>
                )}

                <Button icon="ok_circle" size="lg" fullWidth disabled={!monto || saving} onClick={handlePagar}>
                  {saving ? 'Guardando...' : `Confirmar ${monto ? fmtUSD(parseFloat(monto)||0) : '$0.00'}`}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ height:90 }} />
    </div>
  )
}

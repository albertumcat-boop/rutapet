/**
 * AddSaleScreen.jsx — Registro de ventas
 * Auditado: validaciones, Firebase, estado
 */
import { useState, useMemo } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { agregarVenta } from '../../services/firestore'
import { fmtUSD } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

const METODOS = [
  { key:'efectivo',      label:'Efectivo',      icon:'dollar' },
  { key:'transferencia', label:'Transferencia', icon:'send'   },
  { key:'pagoMovil',     label:'Pago Móvil',    icon:'phone'  },
  { key:'zelle',         label:'Zelle',         icon:'dollar' },
]

const ESTADOS_PAGO = [
  { key:'pagado',    label:'Pagado',    color:C.green  },
  { key:'parcial',   label:'Parcial',   color:'#EAB308'},
  { key:'pendiente', label:'Pendiente', color:C.red    },
]

export default function AddSaleScreen({ onBack, initCId }) {
  const { clientes, productos, recargar } = useAppData()
  const { config } = useConfig()

  const [cId,          setCId]         = useState(initCId || '')
  const [items,        setItems]        = useState([{ pId: '', qty: 1 }])
  const [metodo,       setMetodo]       = useState('efectivo')
  const [estado,       setEstado]       = useState('pagado')
  const [montoPagado,  setMontoPagado]  = useState('')
  const [notas,        setNotas]        = useState('')
  const [saving,       setSaving]       = useState(false)
  const [done,         setDone]         = useState(false)
  const [error,        setError]        = useState('')

  const addItem  = () => setItems(prev => [...prev, { pId:'', qty:1 }])
  const rmItem   = (idx) => setItems(prev => prev.filter((_,i) => i !== idx))
  const updItem  = (idx, k, v) => setItems(prev => prev.map((it,i) => i===idx ? {...it,[k]:v} : it))

  const itemsValidos = items.filter(it => it.pId && it.qty > 0)

  // Precio aplicable según tipo de cliente
  const clienteSeleccionado = useMemo(() => clientes.find(c => c.id === cId), [clientes, cId])
  const getPrecio = (producto) => {
    if (!producto) return 0
    const tipoKey = clienteSeleccionado?.tipo
    if (tipoKey && producto.precios?.[tipoKey]) {
      return Number(producto.precios[tipoKey]) || Number(producto.precio) || 0
    }
    return Number(producto.precio) || 0
  }

  const total = itemsValidos.reduce((s, it) => {
    const p = productos.find(x => x.id === it.pId)
    return s + getPrecio(p) * (Number(it.qty) || 0)
  }, 0)

  // Tipo del cliente seleccionado para mostrar la lista aplicada
  const tipoLabel = config.tiposCliente?.find(t => t.key === clienteSeleccionado?.tipo)?.label

  const handleSave = async () => {
    setError('')
    if (!cId)               return setError('Selecciona un cliente')
    if (itemsValidos.length === 0) return setError('Agrega al menos un producto válido')
    if (total <= 0)         return setError('El total debe ser mayor a $0')

    setSaving(true)
    try {
      const mPagado = estado === 'parcial' ? (parseFloat(montoPagado) || 0) : (estado === 'pagado' ? total : 0)
      await agregarVenta({
        clienteId:  cId,
        items:      itemsValidos.map(it => ({
          pId:    it.pId,
          qty:    Number(it.qty),
          precio: getPrecio(productos.find(p => p.id === it.pId)),
        })),
        total,
        montoPagado: mPagado,
        metodoPago: metodo,
        estado,
        notas,
      })
      recargar()
      setDone(true)
      setTimeout(onBack, 1800)
    } catch (err) {
      setError('Error al guardar: ' + err.message)
      setSaving(false)
    }
  }

  if (done) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:C.gray50 }}>
      <div style={{ width:76, height:76, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
        <Icon name="ok_circle" size={38} color={C.green} />
      </div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.gray800 }}>¡Venta registrada!</h2>
      <p style={{ fontSize:28, fontWeight:900, color:C.teal, marginTop:8 }}>{fmtUSD(total)}</p>
    </div>
  )

  const selStyle = {
    width:'100%', padding:'11px 12px', borderRadius:12,
    border:`1.5px solid ${C.gray200}`, fontSize:14,
    background:'#fff', fontFamily:'inherit', boxSizing:'border-box',
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Nueva venta" onBack={onBack} />
      <div style={{ padding:14 }}>

        {/* Cliente */}
        <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
          Cliente *
        </label>
        <select value={cId} onChange={e => setCId(e.target.value)} style={{ ...selStyle, marginBottom:16 }}>
          <option value="">Seleccionar cliente...</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {/* Productos */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.gray600 }}>Productos *</span>
          <button onClick={addItem}
            style={{ fontSize:13, color:C.teal, background:'none', border:'none', cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>
            + Agregar
          </button>
        </div>

        {items.map((it, idx) => {
          const p = productos.find(x => x.id === it.pId)
          return (
            <Card key={idx} style={{ padding:'12px', marginBottom:8 }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <select value={it.pId} onChange={e => updItem(idx,'pId',e.target.value)}
                    style={{ ...selStyle, marginBottom:8 }}>
                    <option value="">Seleccionar producto...</option>
                    {productos.map(pr => (
                      <option key={pr.id} value={pr.id}>
                        {pr.nombre} — {fmtUSD(getPrecio(pr))}
                      </option>
                    ))}
                  </select>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, background:C.gray100, borderRadius:8, padding:'4px 10px' }}>
                      <button onClick={() => updItem(idx,'qty', Math.max(1, (Number(it.qty)||1)-1))}
                        style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:'2px' }}>
                        <Icon name="minus_c" size={18} color={C.teal} />
                      </button>
                      <span style={{ fontSize:15, fontWeight:800, minWidth:24, textAlign:'center' }}>
                        {it.qty}
                      </span>
                      <button onClick={() => updItem(idx,'qty', (Number(it.qty)||1)+1)}
                        style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:'2px' }}>
                        <Icon name="plus_c" size={18} color={C.teal} />
                      </button>
                    </div>
                    <span style={{ fontSize:14, fontWeight:800, color:C.teal }}>
                      {p ? fmtUSD(getPrecio(p) * Number(it.qty)) : '$0.00'}
                    </span>
                  </div>
                </div>
                {items.length > 1 && (
                  <button onClick={() => rmItem(idx)}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', flexShrink:0 }}>
                    <Icon name="x_circle" size={18} color={C.red} />
                  </button>
                )}
              </div>
            </Card>
          )
        })}

        {/* Método de pago */}
        <p style={{ fontSize:13, fontWeight:700, color:C.gray600, margin:'14px 0 8px' }}>Método de pago</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
          {METODOS.map(m => (
            <button key={m.key} onClick={() => setMetodo(m.key)}
              style={{ padding:'8px 4px', borderRadius:12, border:`2px solid ${metodo===m.key?C.teal:C.gray200}`, background:metodo===m.key?C.teal+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
              <Icon name={m.icon} size={16} color={metodo===m.key?C.teal:C.gray400} style={{ display:'block', margin:'0 auto 3px' }} />
              <span style={{ fontSize:10, fontWeight:700, color:metodo===m.key?C.teal:C.gray600 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Estado */}
        <p style={{ fontSize:13, fontWeight:700, color:C.gray600, margin:'0 0 8px' }}>Estado del pago</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
          {ESTADOS_PAGO.map(e => (
            <button key={e.key} onClick={() => setEstado(e.key)}
              style={{ padding:'8px 4px', borderRadius:12, border:`2px solid ${estado===e.key?e.color:C.gray200}`, background:estado===e.key?e.color+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center', fontSize:12, fontWeight:700, color:estado===e.key?e.color:C.gray600 }}>
              {e.label}
            </button>
          ))}
        </div>

        {/* Monto inicial (solo para parcial) */}
        {estado === 'parcial' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>
              Monto pagado ahora (abono inicial)
            </label>
            <input
              type="number" min="0" step="0.01"
              value={montoPagado}
              onChange={e => setMontoPagado(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            {montoPagado && parseFloat(montoPagado) > 0 && parseFloat(montoPagado) < total && (
              <p style={{ fontSize: 12, color: C.amber, margin: '4px 0 0', fontWeight: 600 }}>
                Queda pendiente: {(total - parseFloat(montoPagado)).toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Notas */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
            Notas (opcional)
          </label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones de la venta..."
            rows={2}
            style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }} />
        </div>

        {/* Total */}
        <div style={{ background:C.navy, borderRadius:16, padding:'16px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <span style={{ fontSize:13, color:C.gray400 }}>Total</span>
            {tipoLabel && (
              <p style={{ fontSize:11, color:C.teal, margin:'2px 0 0', fontWeight:700 }}>
                Lista: {tipoLabel}
              </p>
            )}
            {itemsValidos.length < items.length && (
              <p style={{ fontSize:11, color:'#EAB308', margin:'2px 0 0' }}>
                {items.length - itemsValidos.length} producto(s) sin seleccionar
              </p>
            )}
          </div>
          <span style={{ fontSize:30, fontWeight:900, color:'#fff' }}>{fmtUSD(total)}</span>
        </div>

        {error && (
          <p style={{ fontSize:13, color:C.red, fontWeight:600, marginBottom:10, textAlign:'center' }}>
            ⚠ {error}
          </p>
        )}

        <Button
          icon="ok_circle"
          size="lg"
          fullWidth
          disabled={!cId || total === 0 || saving}
          onClick={handleSave}
        >
          {saving ? 'Guardando...' : 'Registrar venta'}
        </Button>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

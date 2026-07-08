/**
 * AddSaleScreen.jsx — Registro de ventas
 * Fase 3: Descuentos + Nota de Entrega PDF
 */
import { useState, useMemo, useRef } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { agregarVenta } from '../../services/firestore'
import { fmtUSD } from '../../utils/helpers'
import { imprimirRemision } from '../../utils/pdfPrint'
import { auth } from '../../../firebase/firebase.config'
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
  { key:'pagado',    label:'Pagado',    color:C.green    },
  { key:'parcial',   label:'Parcial',   color:'#EAB308'  },
  { key:'pendiente', label:'Pendiente', color:C.red      },
]

export default function AddSaleScreen({ onBack, initCId }) {
  const { clientes, productos, recargar } = useAppData()
  const { config } = useConfig()
  const user = auth.currentUser

  const [cId,         setCId]        = useState(initCId || '')
  const [busqCliente, setBusqCliente] = useState('')
  const [showClDrop,  setShowClDrop]  = useState(false)
  const clInputRef = useRef(null)
  const [items,       setItems]      = useState([{ pId: '', qty: 1 }])
  const [metodo,      setMetodo]     = useState('efectivo')
  const [estado,      setEstado]     = useState('pagado')
  const [montoPagado, setMontoPagado]= useState('')
  const [descuento,   setDescuento]  = useState('')  // % de descuento
  const [notas,       setNotas]      = useState('')
  const [saving,      setSaving]     = useState(false)
  const [done,        setDone]       = useState(false)
  const [ventaGuardada, setVentaGuardada] = useState(null)
  const [error,       setError]      = useState('')

  const addItem = () => setItems(prev => [...prev, { pId: '', qty: 1 }])
  const rmItem  = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))
  const updItem = (idx, k, v) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, [k]: v } : it))

  const itemsValidos = items.filter(it => it.pId && it.qty > 0)

  // Precio por tipo de cliente
  const clienteSeleccionado = useMemo(() => clientes.find(c => c.id === cId), [clientes, cId])

  const clientesFiltrados = useMemo(() => {
    const q = busqCliente.toLowerCase().trim()
    if (!q) return clientes.slice(0, 50)
    return clientes.filter(c =>
      c.nombre?.toLowerCase().includes(q) ||
      c.contacto?.toLowerCase().includes(q) ||
      c.telefono?.includes(q)
    ).slice(0, 30)
  }, [clientes, busqCliente])
  const getPrecio = (producto) => {
    if (!producto) return 0
    const tipoKey = clienteSeleccionado?.tipo
    if (tipoKey && producto.precios?.[tipoKey]) {
      return Number(producto.precios[tipoKey]) || Number(producto.precio) || 0
    }
    return Number(producto.precio) || 0
  }

  const subtotal = itemsValidos.reduce((s, it) => {
    const p = productos.find(x => x.id === it.pId)
    return s + getPrecio(p) * (Number(it.qty) || 0)
  }, 0)

  const descPct    = Math.min(100, Math.max(0, parseFloat(descuento) || 0))
  const descValor  = subtotal * (descPct / 100)
  const total      = subtotal - descValor

  const tipoLabel = config.tiposCliente?.find(t => t.key === clienteSeleccionado?.tipo)?.label

  const handleSave = async () => {
    setError('')
    if (!cId)                       return setError('Selecciona un cliente')
    if (itemsValidos.length === 0)  return setError('Agrega al menos un producto válido')
    if (total <= 0)                 return setError('El total debe ser mayor a $0')
    if (estado === 'parcial' && !(parseFloat(montoPagado) > 0))
      return setError('Ingresa el monto del abono parcial')

    setSaving(true)
    try {
      const mPagado = estado === 'parcial'
        ? (parseFloat(montoPagado) || 0)
        : (estado === 'pagado' ? total : 0)

      const ventaData = {
        clienteId:   cId,
        items:       itemsValidos.map(it => ({
          pId:    it.pId,
          qty:    Number(it.qty),
          precio: getPrecio(productos.find(p => p.id === it.pId)),
        })),
        subtotal,
        descuento:   descPct,
        descValor,
        total,
        montoPagado: mPagado,
        metodoPago:  metodo,
        estado,
        notas,
        vendedorNombre: user?.displayName || user?.email?.split('@')[0] || '',
      }

      await agregarVenta(ventaData)
      recargar()
      setVentaGuardada(ventaData)
      setDone(true)
    } catch (err) {
      setError('Error al guardar: ' + err.message)
      setSaving(false)
    }
  }

  const handleImprimirRemision = () => {
    if (!ventaGuardada) return
    imprimirRemision({
      venta:    ventaGuardada,
      cliente:  clienteSeleccionado,
      productos,
      empresa:  config.empresa,
      descuento: descPct,
    })
  }

  // ── PANTALLA DE ÉXITO ─────────────────────────────────────────
  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.gray50, padding: 24 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon name="ok_circle" size={42} color={C.green} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.gray800, margin: '0 0 4px' }}>¡Venta registrada!</h2>

      {descPct > 0 && (
        <p style={{ fontSize: 13, color: C.gray400, marginBottom: 2 }}>
          Subtotal: {fmtUSD(subtotal)} — Descuento {descPct}%: -{fmtUSD(descValor)}
        </p>
      )}
      <p style={{ fontSize: 32, fontWeight: 900, color: C.teal, margin: '4px 0 28px' }}>{fmtUSD(total)}</p>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleImprimirRemision}
          style={{ width: '100%', padding: '13px', background: C.teal, border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="download" size={18} color="#fff" />
          Nota de entrega / PDF
        </button>
        <button onClick={onBack}
          style={{ width: '100%', padding: '13px', background: C.gray100, border: 'none', borderRadius: 14, color: C.gray600, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Volver
        </button>
      </div>
    </div>
  )

  const selStyle = {
    width: '100%', padding: '11px 12px', borderRadius: 12,
    border: `1.5px solid ${C.gray200}`, fontSize: 14,
    background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar title="Nueva venta" onBack={onBack} />
      <div style={{ padding: 14 }}>

        {/* Cliente */}
        <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>
          Cliente *
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          {/* Si hay cliente seleccionado, mostrar chip */}
          {cId && clienteSeleccionado ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.teal + '12', border: `1.5px solid ${C.teal}`, borderRadius: 12, padding: '10px 12px' }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.teal }}>{clienteSeleccionado.nombre}</span>
              <button onClick={() => { setCId(''); setBusqCliente(''); setTimeout(() => clInputRef.current?.focus(), 50) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <Icon name="x_circle" size={18} color={C.teal} />
              </button>
            </div>
          ) : (
            <>
              <div style={{ position: 'relative' }}>
                <Icon name="search" size={16} color={C.gray400} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  ref={clInputRef}
                  value={busqCliente}
                  onChange={e => { setBusqCliente(e.target.value); setShowClDrop(true) }}
                  onFocus={() => setShowClDrop(true)}
                  onBlur={() => setTimeout(() => setShowClDrop(false), 150)}
                  placeholder="Buscar cliente por nombre o teléfono..."
                  style={{ ...selStyle, paddingLeft: 34, marginBottom: 0 }}
                />
              </div>
              {showClDrop && clientesFiltrados.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `1px solid ${C.gray200}`, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
                  {clientesFiltrados.map(c => (
                    <button key={c.id}
                      onMouseDown={() => { setCId(c.id); setBusqCliente(''); setShowClDrop(false) }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${C.gray100}`, fontFamily: 'inherit' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.gray800, margin: 0 }}>{c.nombre}</p>
                      {(c.contacto || c.telefono) && (
                        <p style={{ fontSize: 11, color: C.gray400, margin: '2px 0 0' }}>
                          {[c.contacto, c.telefono].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {showClDrop && busqCliente && clientesFiltrados.length === 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: `1px solid ${C.gray200}`, padding: '14px', marginTop: 4, textAlign: 'center', fontSize: 13, color: C.gray400 }}>
                  Sin resultados para "{busqCliente}"
                </div>
              )}
            </>
          )}
        </div>

        {/* Indicador de lista de precio */}
        {tipoLabel && cId && (
          <div style={{ background: C.teal + '10', border: `1px solid ${C.teal}30`, borderRadius: 10, padding: '7px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="tag" size={13} color={C.teal} />
            <span style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>Lista de precios: {tipoLabel}</span>
          </div>
        )}

        {/* Productos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.gray600 }}>Productos *</span>
          <button onClick={addItem}
            style={{ fontSize: 13, color: C.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
            + Agregar
          </button>
        </div>

        {items.map((it, idx) => {
          const p = productos.find(x => x.id === it.pId)
          return (
            <Card key={idx} style={{ padding: '12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <select value={it.pId} onChange={e => updItem(idx, 'pId', e.target.value)}
                    style={{ ...selStyle, marginBottom: 8 }}>
                    <option value="">Seleccionar producto...</option>
                    {productos.map(pr => (
                      <option key={pr.id} value={pr.id}>
                        {pr.nombre} — {fmtUSD(getPrecio(pr))}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.gray100, borderRadius: 8, padding: '4px 10px' }}>
                      <button onClick={() => updItem(idx, 'qty', Math.max(1, (Number(it.qty) || 1) - 1))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                        <Icon name="minus_c" size={18} color={C.teal} />
                      </button>
                      <span style={{ fontSize: 15, fontWeight: 800, minWidth: 24, textAlign: 'center' }}>
                        {it.qty}
                      </span>
                      <button onClick={() => updItem(idx, 'qty', (Number(it.qty) || 1) + 1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                        <Icon name="plus_c" size={18} color={C.teal} />
                      </button>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.teal }}>
                      {p ? fmtUSD(getPrecio(p) * Number(it.qty)) : '$0.00'}
                    </span>
                  </div>
                </div>
                {items.length > 1 && (
                  <button onClick={() => rmItem(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}>
                    <Icon name="x_circle" size={18} color={C.red} />
                  </button>
                )}
              </div>
            </Card>
          )
        })}

        {/* Método de pago */}
        <p style={{ fontSize: 13, fontWeight: 700, color: C.gray600, margin: '14px 0 8px' }}>Método de pago</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
          {METODOS.map(m => (
            <button key={m.key} onClick={() => setMetodo(m.key)}
              style={{ padding: '8px 4px', borderRadius: 12, border: `2px solid ${metodo === m.key ? C.teal : C.gray200}`, background: metodo === m.key ? C.teal + '12' : '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
              <Icon name={m.icon} size={16} color={metodo === m.key ? C.teal : C.gray400} style={{ display: 'block', margin: '0 auto 3px' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: metodo === m.key ? C.teal : C.gray600 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Estado del pago */}
        <p style={{ fontSize: 13, fontWeight: 700, color: C.gray600, margin: '0 0 8px' }}>Estado del pago</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
          {ESTADOS_PAGO.map(e => (
            <button key={e.key} onClick={() => setEstado(e.key)}
              style={{ padding: '8px 4px', borderRadius: 12, border: `2px solid ${estado === e.key ? e.color : C.gray200}`, background: estado === e.key ? e.color + '12' : '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', fontSize: 12, fontWeight: 700, color: estado === e.key ? e.color : C.gray600 }}>
              {e.label}
            </button>
          ))}
        </div>

        {/* Monto parcial */}
        {estado === 'parcial' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>
              Monto pagado ahora (abono inicial)
            </label>
            <input type="number" min="0" step="0.01"
              value={montoPagado} onChange={e => setMontoPagado(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            {montoPagado && parseFloat(montoPagado) > 0 && parseFloat(montoPagado) < total && (
              <p style={{ fontSize: 12, color: '#EAB308', margin: '4px 0 0', fontWeight: 600 }}>
                Queda pendiente: {fmtUSD(total - parseFloat(montoPagado))}
              </p>
            )}
          </div>
        )}

        {/* Descuento */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600 }}>
              Descuento (%)
            </label>
            {descPct > 0 && (
              <span style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>
                -{fmtUSD(descValor)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" min="0" max="100" step="1"
              value={descuento} onChange={e => setDescuento(e.target.value)}
              placeholder="0"
              style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${descPct > 0 ? C.red : C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <span style={{ fontSize: 14, color: C.gray400, fontWeight: 700 }}>%</span>
            {/* Atajos rápidos */}
            {[5, 10, 15, 20].map(v => (
              <button key={v} onClick={() => setDescuento(String(v))}
                style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${descPct === v ? C.red : C.gray200}`, background: descPct === v ? '#FEE2E2' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: descPct === v ? C.red : C.gray600, fontFamily: 'inherit' }}>
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>
            Notas (opcional)
          </label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones de la venta..."
            rows={2}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        {/* Resumen de total */}
        <div style={{ background: C.navy, borderRadius: 16, padding: '16px', marginBottom: 14 }}>
          {descPct > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.gray400 }}>Subtotal</span>
              <span style={{ fontSize: 12, color: C.gray400 }}>{fmtUSD(subtotal)}</span>
            </div>
          )}
          {descPct > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #ffffff15' }}>
              <span style={{ fontSize: 12, color: '#FCA5A5' }}>Descuento {descPct}%</span>
              <span style={{ fontSize: 12, color: '#FCA5A5' }}>-{fmtUSD(descValor)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 13, color: C.gray400 }}>Total</span>
              {tipoLabel && (
                <p style={{ fontSize: 11, color: C.teal, margin: '2px 0 0', fontWeight: 700 }}>
                  Lista: {tipoLabel}
                </p>
              )}
              {itemsValidos.length < items.length && (
                <p style={{ fontSize: 11, color: '#EAB308', margin: '2px 0 0' }}>
                  {items.length - itemsValidos.length} sin seleccionar
                </p>
              )}
            </div>
            <span style={{ fontSize: 30, fontWeight: 900, color: '#fff' }}>{fmtUSD(total)}</span>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: C.red, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
            ⚠ {error}
          </p>
        )}

        <Button
          icon="ok_circle"
          size="lg"
          fullWidth
          disabled={!cId || total === 0 || saving}
          onClick={handleSave}>
          {saving ? 'Guardando...' : 'Registrar venta'}
        </Button>
      </div>
      <div style={{ height: 90 }} />
    </div>
  )
}

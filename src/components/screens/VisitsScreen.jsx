/**
 * VisitsScreen.jsx — Historial y registro de visitas
 * Fase 3: Firma digital en registro + PDF reporte de visita
 */
import { useState, useMemo, useRef } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { useToast } from '../../context/ToastContext'
import { agregarVisita } from '../../services/firestore'
import { daysSince, fmtFecha } from '../../utils/helpers'
import { imprimirReporteVisita } from '../../utils/pdfPrint'
import { auth } from '../../../firebase/firebase.config'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import KpiCard from '../shared/KpiCard'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'
import SignaturePad from '../shared/SignaturePad'

export default function VisitsScreen({ nav, onBack }) {
  const { clientes, visitas, recargar } = useAppData()
  const { config }  = useConfig()
  const toast       = useToast()
  const user        = auth.currentUser
  const vendedorNombre = user?.displayName || user?.email?.split('@')[0] || 'Vendedor'

  const [showForm,   setShowForm]   = useState(false)
  const [clienteId,  setClienteId]  = useState('')
  const [vendio,     setVendio]     = useState(true)
  const [notas,      setNotas]      = useState('')
  const [firma,      setFirma]      = useState(null)
  const [guardado,   setGuardado]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [detalle,    setDetalle]    = useState(null)  // visita seleccionada para detalle
  const [busqVisita, setBusqVisita] = useState('')
  const [showVisDrop, setShowVisDrop] = useState(false)
  const visInputRef = useRef(null)

  const pendientes = clientes.filter(c => daysSince(c.ultimaVisita) > 20)

  const clienteSelVisita = useMemo(() => clientes.find(c => c.id === clienteId), [clientes, clienteId])
  const clientesFiltradosVisita = useMemo(() => {
    const q = busqVisita.toLowerCase().trim()
    if (!q) return clientes.slice(0, 50)
    return clientes.filter(c =>
      c.nombre?.toLowerCase().includes(q) || c.telefono?.includes(q)
    ).slice(0, 30)
  }, [clientes, busqVisita])

  const conversion = visitas.length > 0
    ? Math.round((visitas.filter(v => v.vendio).length / visitas.length) * 100)
    : 0

  const handleGuardar = async () => {
    setError('')
    if (!clienteId) return setError('Selecciona un cliente')
    setSaving(true)
    try {
      await agregarVisita({ clienteId, vendio, notas, firma })
      recargar()
      toast.success('Visita registrada')
      setGuardado(true)
      setTimeout(() => {
        setShowForm(false)
        setGuardado(false)
        setClienteId('')
        setNotas('')
        setFirma(null)
        setVendio(true)
        setSaving(false)
        setError('')
      }, 1500)
    } catch (err) {
      toast.error('Error: ' + err.message)
      setSaving(false)
    }
  }

  const abrirFormCliente = (cId) => {
    setClienteId(cId)
    setVendio(true)
    setNotas('')
    setFirma(null)
    setError('')
    setShowForm(true)
  }

  const handleImprimirVisita = (v) => {
    const cliente = clientes.find(c => c.id === v.clienteId)
    imprimirReporteVisita({
      visita:         v,
      cliente,
      vendedorNombre,
      empresa:        config.empresa,
      firma:          v.firma || null,
    })
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar
        title="Visitas"
        onBack={onBack}
        right={
          <button onClick={() => abrirFormCliente('')}
            style={{ background: C.teal, border: 'none', borderRadius: 10, padding: '6px 12px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} color="#fff" /> Registrar
          </button>
        }
      />

      <div style={{ padding: 14 }}>
        {/* KPIs */}
        <div className="kpi-grid">
          <KpiCard label="Total visitas" val={visitas.length}   icon="calendar" color={C.teal}  />
          <KpiCard label="Conversión"    val={`${conversion}%`} icon="target"   color={C.green} />
        </div>

        {/* Pendientes de visita */}
        {pendientes.length > 0 && (
          <>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.gray800, margin: '0 0 10px' }}>
              ⚠️ Pendientes de visita ({pendientes.length})
            </p>
            {pendientes.map(c => (
              <Card key={c.id} onClick={() => nav('clientDetail', c)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="calendar" size={18} color="#D97706" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.nombre}
                    </p>
                    <p style={{ fontSize: 11, color: C.red, fontWeight: 700, margin: 0 }}>
                      Sin visita hace {daysSince(c.ultimaVisita)} días
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); abrirFormCliente(c.id) }}
                    style={{ background: C.teal, border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                    Registrar
                  </button>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* Historial */}
        <p style={{ fontSize: 13, fontWeight: 800, color: C.gray800, margin: '14px 0 10px' }}>
          Historial reciente
        </p>

        {visitas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Icon name="calendar" size={32} color={C.gray400} />
            <p style={{ fontSize: 13, color: C.gray400, marginTop: 10 }}>Sin visitas registradas aún</p>
          </div>
        ) : visitas.slice(0, 30).map(v => {
          const cl = clientes.find(c => c.id === v.clienteId)
          return (
            <Card key={v.id} onClick={() => setDetalle(v)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: v.vendio ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={v.vendio ? 'ok_circle' : 'x_circle'} size={20} color={v.vendio ? C.green : C.red} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cl?.nombre || 'Cliente eliminado'}
                  </p>
                  <p style={{ fontSize: 11, color: C.gray400, margin: '2px 0' }}>{fmtFecha(v.fecha)}</p>
                  {v.notas && (
                    <p style={{ fontSize: 11, color: C.gray600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.notas}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Badge bg={v.vendio ? '#DCFCE7' : '#FEE2E2'} txt={v.vendio ? '#166534' : '#991B1B'}>
                    {v.vendio ? 'Vendió' : 'Sin venta'}
                  </Badge>
                  {v.firma && (
                    <span style={{ fontSize: 9, color: C.teal, fontWeight: 700 }}>✍ Firmado</span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── MODAL DETALLE VISITA ── */}
      {detalle && (() => {
        const cl = clientes.find(c => c.id === detalle.clienteId)
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '0', width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: C.gray800, margin: 0 }}>Detalle de visita</h3>
                <button onClick={() => setDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Icon name="x_circle" size={22} color={C.gray400} />
                </button>
              </div>

              <div style={{ padding: '16px 20px 24px' }}>
                {/* Info */}
                <div style={{ background: C.gray50, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: C.gray800, margin: '0 0 4px' }}>{cl?.nombre || 'Cliente'}</p>
                  <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>{fmtFecha(detalle.fecha)}</p>
                  <div style={{ marginTop: 8 }}>
                    <Badge bg={detalle.vendio ? '#DCFCE7' : '#FEE2E2'} txt={detalle.vendio ? '#166534' : '#991B1B'}>
                      {detalle.vendio ? '✅ Realizó venta' : '❌ Sin venta'}
                    </Badge>
                  </div>
                </div>

                {detalle.notas && (
                  <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9A3412', margin: '0 0 4px' }}>Notas</p>
                    <p style={{ fontSize: 13, color: '#7C2D12', margin: 0 }}>{detalle.notas}</p>
                  </div>
                )}

                {detalle.firma && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.gray600, marginBottom: 6 }}>Firma capturada</p>
                    <div style={{ border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 8, background: '#fafafa', textAlign: 'center' }}>
                      <img src={detalle.firma} alt="Firma" style={{ maxHeight: 80, maxWidth: '100%' }} />
                    </div>
                  </div>
                )}

                <Button
                  icon="download"
                  size="lg"
                  fullWidth
                  onClick={() => { setDetalle(null); handleImprimirVisita(detalle) }}>
                  Imprimir / PDF Reporte
                </Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── MODAL REGISTRAR VISITA ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto' }}>

            {guardado ? (
              <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Icon name="ok_circle" size={32} color={C.green} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.gray800 }}>¡Visita registrada!</h3>
              </div>
            ) : (
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: C.gray800, margin: 0 }}>Registrar visita</h3>
                  <button onClick={() => { setShowForm(false); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Icon name="x_circle" size={22} color={C.gray400} />
                  </button>
                </div>

                {/* Cliente — búsqueda */}
                <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>
                  Cliente *
                </label>
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  {clienteId && clienteSelVisita ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.teal + '12', border: `1.5px solid ${C.teal}`, borderRadius: 12, padding: '10px 12px' }}>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.teal }}>{clienteSelVisita.nombre}</span>
                      <button onClick={() => { setClienteId(''); setBusqVisita(''); setTimeout(() => visInputRef.current?.focus(), 50) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Icon name="x_circle" size={18} color={C.teal} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: 'relative' }}>
                        <Icon name="search" size={15} color={C.gray400} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          ref={visInputRef}
                          value={busqVisita}
                          onChange={e => { setBusqVisita(e.target.value); setShowVisDrop(true) }}
                          onFocus={() => setShowVisDrop(true)}
                          onBlur={() => setTimeout(() => setShowVisDrop(false), 150)}
                          placeholder="Buscar cliente..."
                          style={{ width: '100%', padding: '11px 11px 11px 32px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </div>
                      {showVisDrop && clientesFiltradosVisita.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: `1px solid ${C.gray200}`, maxHeight: 180, overflowY: 'auto', marginTop: 3 }}>
                          {clientesFiltradosVisita.map(c => (
                            <button key={c.id}
                              onMouseDown={() => { setClienteId(c.id); setBusqVisita(''); setShowVisDrop(false) }}
                              style={{ width: '100%', textAlign: 'left', padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${C.gray100}`, fontFamily: 'inherit' }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: C.gray800, margin: 0 }}>{c.nombre}</p>
                              {c.telefono && <p style={{ fontSize: 11, color: C.gray400, margin: 0 }}>{c.telefono}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Resultado */}
                <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 8 }}>
                  ¿Realizó venta?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    { v: true,  l: '✅ Sí vendió', c: C.green },
                    { v: false, l: '❌ No vendió',  c: C.red   },
                  ].map(opt => (
                    <button key={String(opt.v)} onClick={() => setVendio(opt.v)}
                      style={{ padding: '12px', borderRadius: 12, border: `2px solid ${vendio === opt.v ? opt.c : C.gray200}`, background: vendio === opt.v ? opt.c + '12' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: vendio === opt.v ? opt.c : C.gray600 }}>
                      {opt.l}
                    </button>
                  ))}
                </div>

                {/* Notas */}
                <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>
                  Notas (opcional)
                </label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)}
                  placeholder="Observaciones, acuerdos, próximos pasos..."
                  rows={2}
                  style={{ width: '100%', padding: '11px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />

                {/* Firma digital */}
                <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 8 }}>
                  ✍ Firma digital (opcional)
                </label>
                <SignaturePad onChange={setFirma} height={130} />
                {firma && (
                  <p style={{ fontSize: 11, color: C.teal, fontWeight: 700, margin: '6px 0 0', textAlign: 'right' }}>
                    ✓ Firma capturada
                  </p>
                )}

                {error && (
                  <p style={{ fontSize: 12, color: C.red, fontWeight: 600, margin: '14px 0 0' }}>⚠ {error}</p>
                )}

                <div style={{ marginTop: 16 }}>
                  <Button icon="ok_circle" size="lg" fullWidth disabled={!clienteId || saving} onClick={handleGuardar}>
                    {saving ? 'Guardando...' : 'Guardar visita'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ height: 90 }} />
    </div>
  )
}

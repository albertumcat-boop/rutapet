/**
 * VisitsScreen.jsx — Historial y registro de visitas
 * Auditado: Firebase real, recarga datos, fechas correctas
 */
import { useState } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { agregarVisita } from '../../services/firestore'
import { daysSince, fmtFecha } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import KpiCard from '../shared/KpiCard'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function VisitsScreen({ nav, onBack }) {
  const { clientes, visitas, recargar } = useAppData()

  const [showForm,  setShowForm]  = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [vendio,    setVendio]    = useState(true)
  const [notas,     setNotas]     = useState('')
  const [guardado,  setGuardado]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const pendientes = clientes.filter(c =>
    daysSince(c.ultimaVisita) > 20
  )

  const conversion = visitas.length > 0
    ? Math.round((visitas.filter(v => v.vendio).length / visitas.length) * 100)
    : 0

  const handleGuardar = async () => {
    setError('')
    if (!clienteId) return setError('Selecciona un cliente')

    setSaving(true)
    try {
      await agregarVisita({ clienteId, vendio, notas })
      recargar()
      setGuardado(true)
      setTimeout(() => {
        setShowForm(false)
        setGuardado(false)
        setClienteId('')
        setNotas('')
        setVendio(true)
        setSaving(false)
        setError('')
      }, 1500)
    } catch (err) {
      setError('Error: ' + err.message)
      setSaving(false)
    }
  }

  const abrirFormCliente = (cId) => {
    setClienteId(cId)
    setVendio(true)
    setNotas('')
    setError('')
    setShowForm(true)
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar
        title="Visitas"
        onBack={onBack}
        right={
          <button onClick={() => abrirFormCliente('')}
            style={{ background:C.teal, border:'none', borderRadius:10, padding:'6px 12px', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            <Icon name="plus" size={14} color="#fff" /> Registrar
          </button>
        }
      />

      <div style={{ padding:14 }}>
        {/* KPIs */}
        <div className="kpi-grid">
          <KpiCard label="Total visitas"  val={visitas.length}   icon="calendar" color={C.teal}  />
          <KpiCard label="Conversión"     val={`${conversion}%`} icon="target"   color={C.green} />
        </div>

        {/* Pendientes de visita */}
        {pendientes.length > 0 && (
          <>
            <p style={{ fontSize:13, fontWeight:800, color:C.gray800, margin:'0 0 10px' }}>
              ⚠️ Pendientes de visita ({pendientes.length})
            </p>
            {pendientes.map(c => (
              <Card key={c.id} onClick={() => nav('clientDetail', c)}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:'#FEF9C3', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name="calendar" size={18} color={C.yellow} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.nombre}
                    </p>
                    <p style={{ fontSize:11, color:C.red, fontWeight:700, margin:0 }}>
                      Sin visita hace {daysSince(c.ultimaVisita)} días
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); abrirFormCliente(c.id) }}
                    style={{ background:C.teal, border:'none', borderRadius:8, padding:'6px 10px', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
                    Registrar
                  </button>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* Historial */}
        <p style={{ fontSize:13, fontWeight:800, color:C.gray800, margin:'14px 0 10px' }}>
          Historial reciente
        </p>

        {visitas.length === 0 ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <Icon name="calendar" size={32} color={C.gray400} />
            <p style={{ fontSize:13, color:C.gray400, marginTop:10 }}>Sin visitas registradas aún</p>
          </div>
        ) : visitas.slice(0, 20).map(v => {
          const cl = clientes.find(c => c.id === v.clienteId)
          return (
            <Card key={v.id} onClick={() => cl && nav('clientDetail', cl)}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:v.vendio?'#DCFCE7':'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={v.vendio?'ok_circle':'x_circle'} size={20} color={v.vendio?C.green:C.red} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {cl?.nombre || 'Cliente eliminado'}
                  </p>
                  <p style={{ fontSize:11, color:C.gray400, margin:'2px 0' }}>
                    {fmtFecha(v.fecha)}
                  </p>
                  {v.notas && (
                    <p style={{ fontSize:11, color:C.gray600, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {v.notas}
                    </p>
                  )}
                </div>
                <Badge bg={v.vendio?'#DCFCE7':'#FEE2E2'} txt={v.vendio?'#166534':'#991B1B'}>
                  {v.vendio ? 'Vendió' : 'Sin venta'}
                </Badge>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal registrar visita */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:480 }}>
            {guardado ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <Icon name="ok_circle" size={32} color={C.green} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:C.gray800 }}>¡Visita registrada!</h3>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <h3 style={{ fontSize:16, fontWeight:800, color:C.gray800, margin:0 }}>Registrar visita</h3>
                  <button onClick={() => { setShowForm(false); setError('') }}
                    style={{ background:'none', border:'none', cursor:'pointer' }}>
                    <Icon name="x_circle" size={22} color={C.gray400} />
                  </button>
                </div>

                <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
                  Cliente *
                </label>
                <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                  style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', marginBottom:14 }}>
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>

                <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:8 }}>
                  ¿Realizó venta?
                </label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                  {[
                    { v:true,  l:'✅ Sí vendió', c:C.green },
                    { v:false, l:'❌ No vendió',  c:C.red   },
                  ].map(opt => (
                    <button key={String(opt.v)} onClick={() => setVendio(opt.v)}
                      style={{ padding:'12px', borderRadius:12, border:`2px solid ${vendio===opt.v?opt.c:C.gray200}`, background:vendio===opt.v?opt.c+'12':'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, color:vendio===opt.v?opt.c:C.gray600 }}>
                      {opt.l}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
                  Notas (opcional)
                </label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)}
                  placeholder="Observaciones, acuerdos, próximos pasos..."
                  rows={3}
                  style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', marginBottom:16 }} />

                {error && (
                  <p style={{ fontSize:12, color:C.red, fontWeight:600, marginBottom:10 }}>⚠ {error}</p>
                )}

                <Button icon="ok_circle" size="lg" fullWidth
                  disabled={!clienteId || saving}
                  onClick={handleGuardar}>
                  {saving ? 'Guardando...' : 'Guardar visita'}
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

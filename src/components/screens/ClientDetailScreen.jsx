import { useState } from 'react'
import { C, nivelBg, nivelTxt, tipoColor, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { actualizarCliente, eliminarCliente, agregarVenta } from '../../../src/services/firestore'
import { fmtUSD, daysSince } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function ClientDetailScreen({ cliente, onBack, nav }) {
  const [tab,      setTab]      = useState('info')
  const [editMode, setEditMode] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [deleted,  setDeleted]  = useState(false)
  const [form,     setForm]     = useState({ ...cliente })
  const { ventas, visitas, recargar } = useAppData()
  const { config } = useConfig()

  if (!cliente || deleted) return null

  const ventasC  = ventas.filter(v => v.clienteId === cliente.id)
  const visitasC = visitas.filter(v => v.clienteId === cliente.id)
  const total    = ventasC.reduce((s,v) => s + v.total, 0)
  const dias     = daysSince(cliente.ultimaVisita?.toDate?.() || cliente.ultimaVisita || new Date())

  const getTipoColor = (key) => config.tiposCliente.find(t => t.key === key)?.color || C.gray400
  const getTipoIcon  = (key) => config.tiposCliente.find(t => t.key === key)?.icon  || 'users'
  const getTipoLabel = (key) => config.tiposCliente.find(t => t.key === key)?.label || key

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGuardar = async () => {
    setSaving(true)
    try {
      await actualizarCliente(cliente.id, {
        nombre:    form.nombre,
        contacto:  form.contacto,
        telefono:  form.telefono,
        direccion: form.direccion,
        notas:     form.notas,
        nivel:     form.nivel,
      })
      recargar()
      setEditMode(false)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarCliente(cliente.id)
      recargar()
      setDeleted(true)
      setTimeout(onBack, 500)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1.5px solid ${C.gray200}`, fontSize: 14,
    fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar
        title={editMode ? 'Editar cliente' : cliente.nombre}
        onBack={editMode ? () => setEditMode(false) : onBack}
        right={
          !editMode && (
            <button onClick={() => setEditMode(true)}
              style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}>
              <Icon name="edit" size={18} color="#fff" />
            </button>
          )
        }
      />

      {/* Hero */}
      <div style={{ background: C.navy, padding: '0 16px 20px', color: '#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:getTipoColor(cliente.tipo)+'25', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name={getTipoIcon(cliente.tipo)} size={28} color={getTipoColor(cliente.tipo)} />
          </div>
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <Badge bg={nivelBg(cliente.nivel)} txt={nivelTxt(cliente.nivel)}>● Nivel {cliente.nivel}</Badge>
              <Badge bg={getTipoColor(cliente.tipo)+'20'} txt={getTipoColor(cliente.tipo)}>{getTipoLabel(cliente.tipo)}</Badge>
            </div>
            <p style={{ fontSize:13, color:C.gray400, margin:0 }}>{cliente.contacto}</p>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { l:'Total compras', v: fmtUSD(total) },
            { l:'Última visita', v: dias === 0 ? 'Hoy' : `${dias}d` },
            { l:'Deuda',         v: fmtUSD(cliente.deuda || 0) },
          ].map((k,i) => (
            <div key={i} style={{ textAlign:'center', background:'#ffffff15', borderRadius:12, padding:'10px 6px' }}>
              <p style={{ fontSize:16, fontWeight:900, color:'#fff', margin:0 }}>{k.v}</p>
              <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {!editMode && (
        <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}` }}>
          {[['info','Info'],['ventas','Ventas'],['visitas','Visitas'],['notas','Notas']].map(([key,lbl]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex:1, padding:'12px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:tab===key?700:400, color:tab===key?C.teal:C.gray400, borderBottom:`2px solid ${tab===key?C.teal:'transparent'}`, fontFamily:'inherit' }}>
              {lbl}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:14 }}>

        {/* MODO EDICIÓN */}
        {editMode && (
          <>
            <Card>
              <p style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:12 }}>Editar información</p>

              {/* Nivel */}
              <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:6 }}>Nivel de compra</p>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {['alto','medio','bajo'].map(n => (
                  <button key={n} onClick={() => upd('nivel', n)}
                    style={{ flex:1, padding:'8px', borderRadius:10, border:`2px solid ${form.nivel===n?nivelBg(n):'#E2E8F0'}`, background:form.nivel===n?nivelBg(n):'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, color:nivelTxt(n) }}>
                    {n.charAt(0).toUpperCase()+n.slice(1)}
                  </button>
                ))}
              </div>

              {[
                { k:'nombre',    l:'Nombre *'    },
                { k:'contacto',  l:'Contacto'   },
                { k:'telefono',  l:'Teléfono'   },
                { k:'direccion', l:'Dirección'  },
              ].map(f => (
                <div key={f.k} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>{f.l}</label>
                  <input value={form[f.k] || ''} onChange={e => upd(f.k, e.target.value)} style={inputStyle} />
                </div>
              ))}

              <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>Notas</label>
              <textarea value={form.notas || ''} onChange={e => upd('notas', e.target.value)} rows={3}
                style={{ ...inputStyle, resize:'vertical' }} />
            </Card>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <Button icon="ok_circle" fullWidth disabled={saving} onClick={handleGuardar}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
            </div>

            {/* Eliminar */}
            <button onClick={handleEliminar}
              style={{ width:'100%', padding:'13px', background:'#FEE2E2', border:'none', borderRadius:14, color:C.red, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' }}>
              <Icon name="x_circle" size={16} color={C.red} />
              Eliminar este cliente
            </button>
          </>
        )}

        {/* INFO */}
        {!editMode && tab === 'info' && (
          <>
            <Card>
              <p style={{ fontSize:13, fontWeight:700, color:C.gray800, marginBottom:12 }}>Información de contacto</p>
              {[
                { icon:'phone', lbl:'Teléfono',  val: cliente.telefono  || '—' },
                { icon:'pin',   lbl:'Dirección', val: cliente.direccion || '—' },
              ].map((r,i) => (
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

        {/* VENTAS */}
        {!editMode && tab === 'ventas' && (
          ventasC.length === 0
            ? <div style={{ textAlign:'center', padding:'30px 0' }}>
                <Icon name="pkg" size={32} color={C.gray400} />
                <p style={{ fontSize:13, color:C.gray400, marginTop:10 }}>Sin ventas registradas</p>
              </div>
            : ventasC.map(v => {
                const ep = estadoPagoInfo(v.estado)
                return (
                  <Card key={v.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <p style={{ fontSize:15, fontWeight:800, color:C.gray800, margin:0 }}>{fmtUSD(v.total)}</p>
                        <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>{metodoPagoLabel(v.metodoPago)}</p>
                        <p style={{ fontSize:12, color:C.gray600, margin:0 }}>{v.items?.length || 0} producto(s)</p>
                      </div>
                      <Badge bg={ep.bg} txt={ep.txt}>{ep.label}</Badge>
                    </div>
                  </Card>
                )
              })
        )}

        {/* VISITAS */}
        {!editMode && tab === 'visitas' && (
          visitasC.length === 0
            ? <div style={{ textAlign:'center', padding:'30px 0' }}>
                <Icon name="calendar" size={32} color={C.gray400} />
                <p style={{ fontSize:13, color:C.gray400, marginTop:10 }}>Sin visitas registradas</p>
              </div>
            : visitasC.map(v => (
                <Card key={v.id}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:v.vendio?'#DCFCE7':'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name={v.vendio?'ok_circle':'x_circle'} size={20} color={v.vendio?C.green:C.red} />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>
                        {v.vendio ? 'Venta exitosa' : 'Sin venta'}
                      </p>
                      <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>
                        {v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString('es-VE') : v.fecha}
                      </p>
                      {v.notas && <p style={{ fontSize:12, color:C.gray600, margin:0 }}>{v.notas}</p>}
                    </div>
                    <Badge bg={v.vendio?'#DCFCE7':'#FEE2E2'} txt={v.vendio?'#166534':'#991B1B'}>
                      {v.vendio ? 'Vendió' : 'Sin venta'}
                    </Badge>
                  </div>
                </Card>
              ))
        )}

        {/* NOTAS */}
        {!editMode && tab === 'notas' && (
          <Card>
            <p style={{ fontSize:14, color:C.gray600, margin:0, lineHeight:1.7 }}>
              {cliente.notas || 'Sin notas registradas.'}
            </p>
          </Card>
        )}
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

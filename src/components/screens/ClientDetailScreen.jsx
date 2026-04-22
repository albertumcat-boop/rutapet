import { useState, useEffect } from 'react'
import { C, nivelBg, nivelTxt, estadoPagoInfo, metodoPagoLabel } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { actualizarCliente, eliminarCliente, setInventarioProducto, calcularPorcentajeInventario, colorPorcentaje, labelPorcentaje } from '../../services/firestore'
import { fmtUSD, daysSince } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function ClientDetailScreen({ cliente, onBack, nav }) {
  const { clientes, ventas, visitas, productos, inventario, recargar } = useAppData()
  const { config } = useConfig()

  const [tab,      setTab]      = useState('info')
  const [editMode, setEditMode] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [deleted,  setDeleted]  = useState(false)
  const [form,     setForm]     = useState({})
  const [editInv,  setEditInv]  = useState(false)
  const [invForm,  setInvForm]  = useState({})

  const c = clientes.find(cl => cl.id === cliente?.id) || cliente

  useEffect(() => {
    if (c) setForm({ ...c })
  }, [c?.id])

  if (!c || deleted) return null

  const ventasC     = ventas.filter(v => v.clienteId === c.id)
  const visitasC    = visitas.filter(v => v.clienteId === c.id)
  const invCliente  = inventario.filter(i => i.clienteId === c.id)
  const total       = ventasC.reduce((s,v) => s + v.total, 0)
  const dias        = daysSince(c.ultimaVisita?.toDate?.() || c.ultimaVisita || new Date())
  const pct         = calcularPorcentajeInventario(invCliente)
  const pctColor    = colorPorcentaje(pct)
  const pctLabel    = labelPorcentaje(pct)

  const getTipoColor = (key) => config.tiposCliente.find(t => t.key === key)?.color || C.gray400
  const getTipoIcon  = (key) => config.tiposCliente.find(t => t.key === key)?.icon  || 'users'
  const getTipoLabel = (key) => config.tiposCliente.find(t => t.key === key)?.label || key

  // Productos más comprados por este cliente
  const productosComprados = productos.map(p => {
    const totalComprado = ventasC
      .flatMap(v => v.items || [])
      .filter(it => it.pId === p.id)
      .reduce((s, it) => s + (it.qty || 1), 0)
    const inv = invCliente.find(i => i.productoId === p.id)
    return {
      ...p,
      totalComprado,
      stockActual: inv?.stockActual || 0,
      stockIdeal:  inv?.stockIdeal  || 0,
      pctStock:    inv ? Math.round(((inv.stockActual || 0) / (inv.stockIdeal || 1)) * 100) : 0,
    }
  }).filter(p => p.totalComprado > 0 || invCliente.find(i => i.productoId === p.id))
    .sort((a,b) => b.totalComprado - a.totalComprado)

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGuardar = async () => {
    setSaving(true)
    try {
      await actualizarCliente(c.id, {
        nombre:    form.nombre,
        contacto:  form.contacto,
        telefono:  form.telefono,
        direccion: form.direccion,
        email:     form.email    || '',
        notas:     form.notas,
        nivel:     form.nivel,
        tipo:      form.tipo,
        limiteCredito: form.limiteCredito || 0,
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
    if (!confirm(`¿Eliminar a ${c.nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarCliente(c.id)
      recargar()
      setDeleted(true)
      setTimeout(onBack, 500)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleGuardarInventario = async () => {
    setSaving(true)
    try {
      for (const [productoId, vals] of Object.entries(invForm)) {
        if (vals.stockIdeal > 0) {
          await setInventarioProducto(c.id, productoId, vals.stockActual || 0, vals.stockIdeal)
        }
      }
      recargar()
      setEditInv(false)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width:'100%', padding:'10px 12px', borderRadius:10,
    border:`1.5px solid ${C.gray200}`, fontSize:14,
    fontFamily:'inherit', boxSizing:'border-box',
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar
        title={editMode ? 'Editar cliente' : c.nombre}
        onBack={editMode ? () => setEditMode(false) : onBack}
        right={!editMode && (
          <button onClick={() => setEditMode(true)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}>
            <Icon name="edit" size={18} color="#fff" />
          </button>
        )}
      />

      {/* Hero */}
      <div style={{ background:C.navy, padding:'0 16px 20px', color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:getTipoColor(c.tipo)+'25', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon name={getTipoIcon(c.tipo)} size={28} color={getTipoColor(c.tipo)} />
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ display:'flex', gap:8, marginBottom:4, flexWrap:'wrap', alignItems:'center' }}>
              <Badge bg={nivelBg(c.nivel)} txt={nivelTxt(c.nivel)}>● Nivel {c.nivel || 'medio'}</Badge>
              <Badge bg={getTipoColor(c.tipo)+'20'} txt={getTipoColor(c.tipo)}>{getTipoLabel(c.tipo)}</Badge>
              {invCliente.length > 0 && (
                <Badge bg={pctColor+'25'} txt={pctColor}>{pct}% inventario</Badge>
              )}
            </div>
            <p style={{ fontSize:13, color:C.gray400, margin:0 }}>{c.contacto}</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom: invCliente.length > 0 ? 12 : 0 }}>
          {[
            { l:'Total compras', v:fmtUSD(total)             },
            { l:'Última visita', v:dias===0?'Hoy':`${dias}d` },
            { l:'Deuda',         v:fmtUSD(c.deuda||0)        },
          ].map((k,i) => (
            <div key={i} style={{ textAlign:'center', background:'#ffffff15', borderRadius:12, padding:'10px 4px' }}>
              <p style={{ fontSize:15, fontWeight:900, color:'#fff', margin:0 }}>{k.v}</p>
              <p style={{ fontSize:10, color:C.gray400, margin:0 }}>{k.l}</p>
            </div>
          ))}
        </div>

        {/* Barra de inventario */}
        {invCliente.length > 0 && (
          <div style={{ background:'#ffffff10', borderRadius:12, padding:'10px 12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:12, color:C.gray400 }}>Inventario de tienda</span>
              <span style={{ fontSize:13, fontWeight:800, color:pctColor }}>{pct}%</span>
            </div>
            <div style={{ height:8, background:'#ffffff20', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:pctColor, borderRadius:4, transition:'width 0.5s' }} />
            </div>
            <p style={{ fontSize:11, color:pctColor, margin:'4px 0 0', fontWeight:700 }}>{pctLabel}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      {!editMode && (
        <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}`, overflowX:'auto' }}>
          {[['info','Info'],['ventas','Ventas'],['inventario','Inventario'],['visitas','Visitas'],['notas','Notas']].map(([key,lbl]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flexShrink:0, padding:'12px 14px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:tab===key?700:400, color:tab===key?C.teal:C.gray400, borderBottom:`2px solid ${tab===key?C.teal:'transparent'}`, fontFamily:'inherit' }}>
              {lbl}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:14 }}>

        {/* EDICIÓN */}
        {editMode && (
          <>
            <Card>
              <p style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:12 }}>Editar información</p>

              <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:6 }}>Tipo de cliente</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                {config.tiposCliente.map(t => (
                  <button key={t.key} onClick={() => upd('tipo', t.key)}
                    style={{ padding:'6px 12px', borderRadius:10, border:`2px solid ${form.tipo===t.key?t.color:C.gray200}`, background:form.tipo===t.key?t.color+'12':'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, color:form.tipo===t.key?t.color:C.gray600, display:'flex', alignItems:'center', gap:6 }}>
                    <Icon name={t.icon} size={14} color={t.color} />
                    {t.label}
                  </button>
                ))}
              </div>

              <p style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:6 }}>Nivel de compra</p>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {['alto','medio','bajo'].map(n => (
                  <button key={n} onClick={() => upd('nivel', n)}
                    style={{ flex:1, padding:'8px', borderRadius:10, border:`2px solid ${form.nivel===n?C.teal:C.gray200}`, background:form.nivel===n?C.teal+'12':'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700, color:C.gray800 }}>
                    {n.charAt(0).toUpperCase()+n.slice(1)}
                  </button>
                ))}
              </div>

              {[
                { k:'nombre',         l:'Nombre *'           },
                { k:'contacto',       l:'Contacto principal' },
                { k:'telefono',       l:'Teléfono'           },
                { k:'email',          l:'Email'              },
                { k:'direccion',      l:'Dirección'          },
                { k:'limiteCredito',  l:'Límite de crédito ($)', type:'number' },
              ].map(f => (
                <div key={f.k} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>{f.l}</label>
                  <input type={f.type||'text'} value={form[f.k]||''} onChange={e => upd(f.k, e.target.value)} style={inputStyle} />
                </div>
              ))}

              <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>Notas</label>
              <textarea value={form.notas||''} onChange={e => upd('notas', e.target.value)} rows={3}
                style={{ ...inputStyle, resize:'vertical' }} />
            </Card>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <Button icon="ok_circle" fullWidth disabled={saving} onClick={handleGuardar}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setEditMode(false)}>Cancelar</Button>
            </div>
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
                { icon:'phone',    lbl:'Teléfono',        val:c.telefono       || '—' },
                { icon:'globe',    lbl:'Email',           val:c.email          || '—' },
                { icon:'pin',      lbl:'Dirección',       val:c.direccion      || '—' },
                { icon:'dollar',   lbl:'Límite crédito',  val:c.limiteCredito ? fmtUSD(c.limiteCredito) : '—' },
              ].map((r,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:i<3?12:0 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:C.gray100, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name={r.icon} size={14} color={C.gray600} />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{r.lbl}</p>
                    <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0 }}>{r.val}</p>
                  </div>
                </div>
              ))}
            </Card>

            {/* Top productos del cliente */}
            {productosComprados.length > 0 && (
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Icon name="star" size={15} color={C.amber} />
                  <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Productos más comprados</span>
                </div>
                {productosComprados.slice(0,5).map((p,i) => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:i<4?10:0 }}>
                    <span style={{ fontSize:14, fontWeight:900, color:C.gray400, width:18, flexShrink:0 }}>#{i+1}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nombre}</p>
                      <div style={{ height:4, background:C.gray100, borderRadius:2, marginTop:4 }}>
                        <div style={{ height:'100%', width:`${(p.totalComprado/productosComprados[0].totalComprado)*100}%`, background:C.teal, borderRadius:2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize:13, fontWeight:800, color:C.teal, flexShrink:0 }}>{p.totalComprado} uds</span>
                  </div>
                ))}
              </Card>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Button icon="plus" fullWidth onClick={() => nav('addSale', { clienteId:c.id })}>Nueva venta</Button>
              <Button icon="calendar" variant="secondary" fullWidth>Registrar visita</Button>
            </div>
          </>
        )}

        {/* INVENTARIO */}
        {!editMode && tab === 'inventario' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.gray800, margin:0 }}>Inventario de la tienda</p>
                <p style={{ fontSize:12, color:C.gray400, margin:'2px 0 0' }}>Lo que tiene vs lo que debería tener</p>
              </div>
              <button onClick={() => {
                const initForm = {}
                productos.forEach(p => {
                  const inv = invCliente.find(i => i.productoId === p.id)
                  initForm[p.id] = { stockActual: inv?.stockActual || 0, stockIdeal: inv?.stockIdeal || 0 }
                })
                setInvForm(initForm)
                setEditInv(true)
              }}
                style={{ background:C.teal, border:'none', borderRadius:10, padding:'6px 12px', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                Editar
              </button>
            </div>

            {/* Barra general */}
            <Card style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>Completitud total</span>
                <span style={{ fontSize:20, fontWeight:900, color:pctColor }}>{pct}%</span>
              </div>
              <div style={{ height:12, background:C.gray100, borderRadius:6, overflow:'hidden', marginBottom:6 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:pctColor, borderRadius:6, transition:'width 0.5s' }} />
              </div>
              <p style={{ fontSize:12, color:pctColor, margin:0, fontWeight:700 }}>{pctLabel}</p>
            </Card>

            {invCliente.length === 0 ? (
              <div style={{ textAlign:'center', padding:'30px 0' }}>
                <Icon name="pkg" size={32} color={C.gray400} />
                <p style={{ fontSize:13, color:C.gray400, marginTop:10 }}>
                  Sin inventario configurado para esta tienda
                </p>
                <p style={{ fontSize:12, color:C.gray400 }}>Toca "Editar" para configurar el inventario ideal</p>
              </div>
            ) : productos.filter(p => invCliente.find(i => i.productoId === p.id)).map(p => {
              const inv    = invCliente.find(i => i.productoId === p.id)
              if (!inv) return null
              const pctP   = inv.stockIdeal > 0 ? Math.round((inv.stockActual / inv.stockIdeal) * 100) : 0
              const colP   = colorPorcentaje(Math.min(pctP, 100))
              const falta  = Math.max(0, inv.stockIdeal - inv.stockActual)
              return (
                <Card key={p.id} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nombre}</p>
                      <p style={{ fontSize:12, color:C.gray400, margin:'2px 0 0' }}>{p.marca || ''}</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, marginLeft:8 }}>
                      <span style={{ fontSize:16, fontWeight:900, color:colP }}>{Math.min(pctP,100)}%</span>
                    </div>
                  </div>

                  <div style={{ height:8, background:C.gray100, borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                    <div style={{ height:'100%', width:`${Math.min(pctP,100)}%`, background:colP, borderRadius:4 }} />
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', gap:16 }}>
                      <div>
                        <p style={{ fontSize:11, color:C.gray400, margin:0 }}>En tienda</p>
                        <p style={{ fontSize:14, fontWeight:800, color:colP, margin:0 }}>{inv.stockActual}</p>
                      </div>
                      <div>
                        <p style={{ fontSize:11, color:C.gray400, margin:0 }}>Ideal (100%)</p>
                        <p style={{ fontSize:14, fontWeight:800, color:C.gray800, margin:0 }}>{inv.stockIdeal}</p>
                      </div>
                      {falta > 0 && (
                        <div>
                          <p style={{ fontSize:11, color:C.red, margin:0 }}>Falta venderle</p>
                          <p style={{ fontSize:14, fontWeight:800, color:C.red, margin:0 }}>{falta} uds</p>
                        </div>
                      )}
                    </div>
                    {falta > 0 && (
                      <div style={{ background:'#FEE2E2', borderRadius:8, padding:'4px 8px', display:'flex', alignItems:'center' }}>
                        <Icon name="alert" size={13} color={C.red} />
                      </div>
                    )}
                    {falta === 0 && (
                      <div style={{ background:'#DCFCE7', borderRadius:8, padding:'4px 8px', display:'flex', alignItems:'center' }}>
                        <Icon name="ok_circle" size={13} color={C.green} />
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
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
                        <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>
                          {v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString('es-VE') : ''} · {metodoPagoLabel(v.metodoPago)}
                        </p>
                        <p style={{ fontSize:12, color:C.gray600, margin:0 }}>{v.items?.length||0} producto(s)</p>
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
                    <div style={{ width:40, height:40, borderRadius:12, background:v.vendio?'#DCFCE7':'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name={v.vendio?'ok_circle':'x_circle'} size={20} color={v.vendio?C.green:C.red} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>
                        {v.vendio ? 'Venta exitosa' : 'Sin venta'}
                      </p>
                      <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>
                        {v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString('es-VE') : v.fecha}
                      </p>
                      {v.notas && <p style={{ fontSize:12, color:C.gray600, margin:0 }}>{v.notas}</p>}
                    </div>
                    <Badge bg={v.vendio?'#DCFCE7':'#FEE2E2'} txt={v.vendio?'#166534':'#991B1B'}>
                      {v.vendio?'Vendió':'Sin venta'}
                    </Badge>
                  </div>
                </Card>
              ))
        )}

        {/* NOTAS */}
        {!editMode && tab === 'notas' && (
          <Card>
            <p style={{ fontSize:14, color:C.gray600, margin:0, lineHeight:1.7 }}>
              {c.notas || 'Sin notas registradas.'}
            </p>
          </Card>
        )}
      </div>

      {/* Modal editar inventario */}
      {editInv && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:480, maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontSize:16, fontWeight:800, color:C.gray800, margin:0 }}>Configurar inventario</h3>
              <button onClick={() => setEditInv(false)} style={{ background:'none', border:'none', cursor:'pointer' }}>
                <Icon name="x_circle" size={22} color={C.gray400} />
              </button>
            </div>
            <p style={{ fontSize:12, color:C.gray400, marginBottom:16 }}>
              Define cuántas unidades debería tener esta tienda de cada producto (100%). El stock actual es lo que tiene ahora.
            </p>
            {productos.map(p => (
              <div key={p.id} style={{ marginBottom:14, padding:'12px', background:C.gray50, borderRadius:12 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:'0 0 8px' }}>{p.nombre}</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>Stock actual (tiene)</label>
                    <input type="number" min="0"
                      value={invForm[p.id]?.stockActual || 0}
                      onChange={e => setInvForm(f => ({ ...f, [p.id]: { ...f[p.id], stockActual: parseInt(e.target.value)||0 } }))}
                      style={{ ...inputStyle, padding:'8px', borderColor: '#E2E8F0' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>Stock ideal (100%)</label>
                    <input type="number" min="0"
                      value={invForm[p.id]?.stockIdeal || 0}
                      onChange={e => setInvForm(f => ({ ...f, [p.id]: { ...f[p.id], stockIdeal: parseInt(e.target.value)||0 } }))}
                      style={{ ...inputStyle, padding:'8px', borderColor: '#E2E8F0' }} />
                  </div>
                </div>
              </div>
            ))}
            <Button icon="ok_circle" size="lg" fullWidth disabled={saving} onClick={handleGuardarInventario}>
              {saving ? 'Guardando...' : 'Guardar inventario'}
            </Button>
          </div>
        </div>
      )}

      <div style={{ height:90 }} />
    </div>
  )
}

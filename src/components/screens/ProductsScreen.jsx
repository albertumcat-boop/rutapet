/**
 * ProductsScreen.jsx — Catálogo de productos
 * Auditado: Firebase real, categorías dinámicas, agregar producto funcional
 */
import { useState } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { agregarProducto, actualizarProducto } from '../../services/firestore'
import { fmtUSD } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

export default function ProductsScreen({ onBack }) {
  const { productos, recargar, loading } = useAppData()
  const { config }                       = useConfig()

  const [cat,      setCat]      = useState('todos')
  const [search,   setSearch]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error,    setError]    = useState('')
  const [form, setForm] = useState({
    nombre:'', categoria:'', marca:'', precio:'', stock:'', descripcion:''
  })

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getCatColor = (key) => config.categoriasProducto.find(c => c.key === key)?.color || C.gray400
  const getCatIcon  = (key) => config.categoriasProducto.find(c => c.key === key)?.icon  || 'pkg'
  const getCatLabel = (key) => config.categoriasProducto.find(c => c.key === key)?.label || key || '—'

  const filtered = productos.filter(p =>
    (cat === 'todos' || p.categoria === cat) &&
    (p.nombre || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleGuardar = async () => {
    setError('')
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (!form.precio || isNaN(parseFloat(form.precio)) || parseFloat(form.precio) < 0) {
      return setError('Ingresa un precio válido')
    }

    setSaving(true)
    try {
      await agregarProducto({
        nombre:      form.nombre.trim(),
        categoria:   form.categoria || config.categoriasProducto[0]?.key || '',
        marca:       form.marca.trim(),
        precio:      parseFloat(form.precio),
        stock:       parseInt(form.stock) || 0,
        descripcion: form.descripcion.trim(),
      })
      recargar()
      setGuardado(true)
      setTimeout(() => {
        setShowForm(false)
        setGuardado(false)
        setForm({ nombre:'', categoria:'', marca:'', precio:'', stock:'', descripcion:'' })
        setError('')
      }, 1500)
    } catch (err) {
      setError('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar
        title="Catálogo"
        onBack={onBack}
        right={
          <button onClick={() => setShowForm(true)}
            style={{ background:C.teal, border:'none', borderRadius:10, padding:'6px 14px', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            <Icon name="plus" size={14} color="#fff" /> Nuevo
          </button>
        }
      />

      {/* Búsqueda */}
      <div style={{ background:C.navy, padding:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', background:'#ffffff20', borderRadius:12, padding:'8px 12px', gap:8 }}>
          <Icon name="search" size={16} color={C.gray400} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            style={{ background:'none', border:'none', color:'#fff', fontSize:14, flex:1, fontFamily:'inherit' }} />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex' }}>
              <Icon name="x_circle" size={16} color={C.gray400} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs categorías — dinámicas desde config */}
      <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}`, overflowX:'auto' }}>
        <button onClick={() => setCat('todos')}
          style={{ flexShrink:0, padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:cat==='todos'?700:400, color:cat==='todos'?C.teal:C.gray400, borderBottom:`2px solid ${cat==='todos'?C.teal:'transparent'}`, fontFamily:'inherit' }}>
          Todos ({productos.length})
        </button>
        {config.categoriasProducto.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            style={{ flexShrink:0, padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:cat===c.key?700:400, color:cat===c.key?c.color:C.gray400, borderBottom:`2px solid ${cat===c.key?c.color:'transparent'}`, fontFamily:'inherit', whiteSpace:'nowrap' }}>
            {c.label} ({productos.filter(p => p.categoria === c.key).length})
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ padding:'12px 14px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <span style={{ width:32, height:32, border:`3px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <Icon name="pkg" size={36} color={C.gray400} />
            <p style={{ fontSize:14, color:C.gray400, marginTop:10 }}>
              {productos.length === 0 ? 'Sin productos todavía' : 'Sin resultados'}
            </p>
            {productos.length === 0 && (
              <Button icon="plus" style={{ marginTop:14 }} onClick={() => setShowForm(true)}>
                Agregar producto
              </Button>
            )}
          </div>
        ) : filtered.map(p => {
          const color = getCatColor(p.categoria)
          const icon  = getCatIcon(p.categoria)
          const label = getCatLabel(p.categoria)
          const stockBajo = (p.stock || 0) <= 5

          return (
            <Card key={p.id}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:46, height:46, borderRadius:14, background:color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={icon} size={22} color={color} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.nombre}
                  </p>
                  <p style={{ fontSize:11, color:C.gray400, margin:'2px 0' }}>{p.marca || '—'}</p>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <Badge bg={color+'15'} txt={color}>{label}</Badge>
                    {stockBajo && (
                      <Badge bg="#FEE2E2" txt="#991B1B">Stock bajo</Badge>
                    )}
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:16, fontWeight:900, color:C.teal, margin:0 }}>{fmtUSD(p.precio)}</p>
                  <p style={{ fontSize:11, color:stockBajo?C.red:C.gray400, fontWeight:stockBajo?700:400 }}>
                    Stock: {p.stock || 0}
                  </p>
                </div>
              </div>
              {p.descripcion && (
                <p style={{ fontSize:12, color:C.gray400, margin:'8px 0 0', lineHeight:1.5 }}>{p.descripcion}</p>
              )}
            </Card>
          )
        })}
      </div>

      {/* Modal nuevo producto */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:24, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            {guardado ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <Icon name="ok_circle" size={32} color={C.green} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:800, color:C.gray800 }}>¡Producto guardado!</h3>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <h3 style={{ fontSize:16, fontWeight:800, color:C.gray800, margin:0 }}>Nuevo producto</h3>
                  <button onClick={() => { setShowForm(false); setError('') }}
                    style={{ background:'none', border:'none', cursor:'pointer' }}>
                    <Icon name="x_circle" size={22} color={C.gray400} />
                  </button>
                </div>

                {/* Categoría */}
                {config.categoriasProducto.length > 0 && (
                  <>
                    <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Categoría</label>
                    <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(config.categoriasProducto.length,3)},1fr)`, gap:8, marginBottom:14 }}>
                      {config.categoriasProducto.map(c => (
                        <button key={c.key} onClick={() => upd('categoria', c.key)}
                          style={{ padding:'8px 6px', borderRadius:10, border:`2px solid ${form.categoria===c.key?c.color:C.gray200}`, background:form.categoria===c.key?c.color+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
                          <Icon name={c.icon} size={16} color={c.color} style={{ display:'block', margin:'0 auto 3px' }} />
                          <span style={{ fontSize:11, fontWeight:700, color:form.categoria===c.key?c.color:C.gray600 }}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Campos */}
                {[
                  { k:'nombre',  l:'Nombre del producto *', placeholder:'Ej: Producto A 1kg'   },
                  { k:'marca',   l:'Marca',                  placeholder:'Ej: Marca X'           },
                  { k:'descripcion', l:'Descripción (opcional)', placeholder:'Descripción breve' },
                ].map(f => (
                  <div key={f.k} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>{f.l}</label>
                    <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ width:'100%', padding:'10px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
                  </div>
                ))}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>Precio *</label>
                    <input type="number" min="0" step="0.01" value={form.precio} onChange={e => upd('precio', e.target.value)}
                      placeholder="0.00"
                      style={{ width:'100%', padding:'10px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:C.gray600, display:'block', marginBottom:4 }}>Stock inicial</label>
                    <input type="number" min="0" value={form.stock} onChange={e => upd('stock', e.target.value)}
                      placeholder="0"
                      style={{ width:'100%', padding:'10px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
                  </div>
                </div>

                {error && (
                  <p style={{ fontSize:12, color:C.red, fontWeight:600, marginBottom:10 }}>⚠ {error}</p>
                )}

                <Button icon="ok_circle" size="lg" fullWidth
                  disabled={!form.nombre || !form.precio || saving}
                  onClick={handleGuardar}>
                  {saving ? 'Guardando...' : 'Guardar producto'}
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

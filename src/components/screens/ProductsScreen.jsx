/**
 * ProductsScreen.jsx — Catálogo de medicamentos y productos veterinarios
 * Campos especiales: lote, vencimiento, cadena frío, receta, principio activo
 */
import { useState, useMemo } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { useToast } from '../../context/ToastContext'
import { agregarProducto, actualizarProducto, eliminarProducto } from '../../services/firestore'
import { fmtUSD } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

const UNIDADES = ['unidad', 'caja', 'frasco', 'ampolla', 'blister', 'sobre', 'ml', 'mg', 'comprimidos']

const COND_PAGO = ['contado', '7 días', '15 días', '30 días', '45 días', '60 días']

function diasParaVencer(fechaStr) {
  if (!fechaStr) return null
  const diff = Math.ceil((new Date(fechaStr) - new Date()) / 86_400_000)
  return diff
}

function colorVencimiento(dias) {
  if (dias === null) return null
  if (dias < 0)   return { bg: '#FEE2E2', txt: '#991B1B', label: 'Vencido' }
  if (dias <= 30)  return { bg: '#FEE2E2', txt: '#991B1B', label: `Vence en ${dias}d` }
  if (dias <= 90)  return { bg: '#FEF9C3', txt: '#854D0E', label: `Vence en ${dias}d` }
  return { bg: '#DCFCE7', txt: '#166534', label: `Vence en ${dias}d` }
}

const EMPTY_FORM = {
  nombre: '', categoria: '', marca: '', precio: '', stock: '', stockMinimo: '', descripcion: '',
  principioActivo: '', concentracion: '', presentacion: '', unidad: 'unidad', lote: '',
  fechaVencimiento: '', registroSanitario: '', cadenaFrio: false, requiereReceta: false, esMedicamento: true,
  precios: {}, // { [tipoKey]: precio }
}

export default function ProductsScreen({ onBack, nav }) {
  const { productos, recargar, loading } = useAppData()
  const { config }  = useConfig()
  const toast       = useToast()

  const [cat,        setCat]        = useState('todos')
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [tab,        setTab]        = useState('info') // info | med
  const [form, setForm] = useState(EMPTY_FORM)

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getCatColor = (key) => config.categoriasProducto.find(c => c.key === key)?.color || C.gray400
  const getCatIcon  = (key) => config.categoriasProducto.find(c => c.key === key)?.icon  || 'pkg'
  const getCatLabel = (key) => config.categoriasProducto.find(c => c.key === key)?.label || key || '—'

  const filtered = useMemo(() => productos.filter(p =>
    (cat === 'todos' || p.categoria === cat) &&
    ((p.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
     (p.principioActivo || '').toLowerCase().includes(search.toLowerCase()) ||
     (p.marca || '').toLowerCase().includes(search.toLowerCase()))
  ), [productos, cat, search])

  const porVencer = useMemo(() =>
    productos.filter(p => {
      const d = diasParaVencer(p.fechaVencimiento)
      return d !== null && d <= 90
    }).length,
    [productos]
  )

  const openForm = (p = null) => {
    if (p) {
      setEditId(p.id)
      setForm({
        nombre:           p.nombre           || '',
        categoria:        p.categoria        || '',
        marca:            p.marca            || '',
        precio:           String(p.precio    || ''),
        stock:            String(p.stock     || ''),
        stockMinimo:      String(p.stockMinimo || ''),
        descripcion:      p.descripcion      || '',
        principioActivo:  p.principioActivo  || '',
        concentracion:    p.concentracion    || '',
        presentacion:     p.presentacion     || '',
        unidad:           p.unidad           || 'unidad',
        lote:             p.lote             || '',
        fechaVencimiento: p.fechaVencimiento || '',
        registroSanitario:p.registroSanitario|| '',
        cadenaFrio:       Boolean(p.cadenaFrio),
        requiereReceta:   Boolean(p.requiereReceta),
        esMedicamento:    p.esMedicamento !== false,
        precios:          p.precios         || {},
      })
    } else {
      setEditId(null)
      setForm(EMPTY_FORM)
    }
    setTab('info')
    setShowForm(true)
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim())   return toast.warning('El nombre es obligatorio')
    if (!form.precio || isNaN(parseFloat(form.precio)) || parseFloat(form.precio) < 0)
      return toast.warning('Ingresa un precio válido')

    setSaving(true)
    try {
      const payload = {
        nombre:           form.nombre.trim(),
        categoria:        form.categoria || config.categoriasProducto[0]?.key || '',
        marca:            form.marca.trim(),
        precio:           parseFloat(form.precio),
        // 'stock' solo se incluye al crear — al editar se omite intencionalmente
        // para no pisar el contador real que mantiene agregarVenta con increment().
        // Para ajustar stock existente se debe usar un flujo de ajuste dedicado.
        ...(!editId && { stock: parseInt(form.stock) || 0 }),
        stockMinimo:      parseInt(form.stockMinimo) || 0,
        descripcion:      form.descripcion.trim(),
        principioActivo:  form.principioActivo.trim(),
        concentracion:    form.concentracion.trim(),
        presentacion:     form.presentacion.trim(),
        unidad:           form.unidad,
        lote:             form.lote.trim(),
        fechaVencimiento: form.fechaVencimiento,
        registroSanitario:form.registroSanitario.trim(),
        cadenaFrio:       form.cadenaFrio,
        requiereReceta:   form.requiereReceta,
        esMedicamento:    form.esMedicamento,
        precios:          form.precios || {},
      }
      if (editId) {
        await actualizarProducto(editId, payload)
        toast.success('Producto actualizado')
      } else {
        await agregarProducto(payload)
        toast.success('Producto guardado')
      }
      recargar()
      setShowForm(false)
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return
    try {
      await eliminarProducto(id)
      toast.success('Producto eliminado')
      recargar()
      setShowDetail(null)
    } catch (err) {
      toast.error('No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar
        title="Catálogo"
        onBack={onBack}
        right={
          <button onClick={() => openForm()}
            style={{ background: C.teal, border: 'none', borderRadius: 10, padding: '6px 14px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} color="#fff" /> Nuevo
          </button>
        }
      />

      {/* Alerta vencimientos */}
      {porVencer > 0 && (
        <div onClick={() => nav?.('expiry')}
          style={{ margin: '10px 14px 0', background: '#FFF7ED', border: '1.5px solid #FDBA74', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Icon name="alert" size={16} color="#F97316" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', flex: 1 }}>
            {porVencer} producto{porVencer > 1 ? 's' : ''} próximo{porVencer > 1 ? 's' : ''} a vencer
          </span>
          <Icon name="chevron" size={14} color="#F97316" />
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ background: C.navy, padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff20', borderRadius: 12, padding: '8px 12px', gap: 8 }}>
          <Icon name="search" size={16} color={C.gray400} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nombre, principio activo, marca..."
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, flex: 1, fontFamily: 'inherit' }} />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icon name="x_circle" size={16} color={C.gray400} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs categorías */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: `1px solid ${C.gray200}`, overflowX: 'auto' }}>
        <button onClick={() => setCat('todos')}
          style={{ flexShrink: 0, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: cat === 'todos' ? 700 : 400, color: cat === 'todos' ? C.teal : C.gray400, borderBottom: `2px solid ${cat === 'todos' ? C.teal : 'transparent'}`, fontFamily: 'inherit' }}>
          Todos ({productos.length})
        </button>
        {config.categoriasProducto.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            style={{ flexShrink: 0, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: cat === c.key ? 700 : 400, color: cat === c.key ? c.color : C.gray400, borderBottom: `2px solid ${cat === c.key ? c.color : 'transparent'}`, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {c.label} ({productos.filter(p => p.categoria === c.key).length})
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ padding: '12px 14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ width: 32, height: 32, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Icon name="pill" size={36} color={C.gray400} />
            <p style={{ fontSize: 14, color: C.gray400, marginTop: 10 }}>
              {productos.length === 0 ? 'Sin productos todavía' : 'Sin resultados'}
            </p>
            {productos.length === 0 && (
              <Button icon="plus" style={{ marginTop: 14 }} onClick={() => openForm()}>
                Agregar medicamento
              </Button>
            )}
          </div>
        ) : filtered.map(p => {
          const color     = getCatColor(p.categoria)
          const icon      = p.esMedicamento ? 'pill' : getCatIcon(p.categoria)
          const label     = getCatLabel(p.categoria)
          const stockBajo = (p.stockMinimo > 0) ? (p.stock ?? 0) <= p.stockMinimo : (p.stock ?? 0) === 0
          const dias      = diasParaVencer(p.fechaVencimiento)
          const vencInfo  = colorVencimiento(dias)

          return (
            <Card key={p.id} onClick={() => setShowDetail(p)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  <Icon name={icon} size={22} color={color} />
                  {p.cadenaFrio && (
                    <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="thermometer" size={9} color="#fff" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.nombre}
                  </p>
                  {p.principioActivo && (
                    <p style={{ fontSize: 11, color: C.teal, margin: '1px 0', fontWeight: 600 }}>
                      {p.principioActivo} {p.concentracion && `· ${p.concentracion}`}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: C.gray400, margin: '1px 0' }}>{p.marca || '—'}</p>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', marginTop: 3 }}>
                    <Badge bg={color + '15'} txt={color}>{label}</Badge>
                    {p.requiereReceta && (
                      <Badge bg="#EDE9FE" txt="#6D28D9">Receta</Badge>
                    )}
                    {stockBajo && (
                      <Badge bg="#FEE2E2" txt="#991B1B">Stock bajo</Badge>
                    )}
                    {vencInfo && (
                      <Badge bg={vencInfo.bg} txt={vencInfo.txt}>{vencInfo.label}</Badge>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: C.teal, margin: 0 }}>{fmtUSD(p.precio)}</p>
                  <p style={{ fontSize: 11, color: stockBajo ? C.red : C.gray400, fontWeight: stockBajo ? 700 : 400, margin: '2px 0 0' }}>
                    Stock: {p.stock || 0}
                  </p>
                  {p.lote && (
                    <p style={{ fontSize: 10, color: C.gray400, margin: '1px 0 0' }}>Lote: {p.lote}</p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── MODAL DETALLE ── */}
      {showDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: C.gray800, margin: '0 0 4px', lineHeight: 1.3 }}>{showDetail.nombre}</h3>
                {showDetail.principioActivo && (
                  <p style={{ fontSize: 12, color: C.teal, fontWeight: 600, margin: 0 }}>
                    {showDetail.principioActivo} {showDetail.concentracion && `· ${showDetail.concentracion}`}
                  </p>
                )}
              </div>
              <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Icon name="x_circle" size={22} color={C.gray400} />
              </button>
            </div>

            <div style={{ padding: '16px 20px 24px' }}>
              {/* Precio y stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: C.gray50, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: C.teal, margin: 0 }}>{fmtUSD(showDetail.precio)}</p>
                  <p style={{ fontSize: 10, color: C.gray400, margin: 0 }}>Precio base</p>
                </div>
                <div style={{ background: C.gray50, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: (showDetail.stock || 0) <= (showDetail.stockMinimo || 5) ? C.red : C.gray800, margin: 0 }}>{showDetail.stock || 0}</p>
                  <p style={{ fontSize: 10, color: C.gray400, margin: 0 }}>Stock</p>
                </div>
                <div style={{ background: C.gray50, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: C.gray800, margin: 0 }}>{showDetail.stockMinimo || 0}</p>
                  <p style={{ fontSize: 10, color: C.gray400, margin: 0 }}>Mín.</p>
                </div>
              </div>

              {/* Precios por tipo de cliente */}
              {showDetail.precios && Object.keys(showDetail.precios).some(k => showDetail.precios[k]) && (
                <div style={{ background: C.gray50, borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: `1px solid ${C.gray200}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.gray600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="tag" size={12} color={C.teal} /> Lista de precios
                  </p>
                  {config.tiposCliente?.filter(t => showDetail.precios[t.key]).map(t => (
                    <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ fontSize: 12, color: t.color || C.gray400, fontWeight: 600 }}>{t.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.gray800 }}>{fmtUSD(showDetail.precios[t.key])}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {showDetail.cadenaFrio   && <Badge bg="#EFF6FF" txt="#1E40AF">❄️ Cadena frío</Badge>}
                {showDetail.requiereReceta && <Badge bg="#EDE9FE" txt="#6D28D9">📋 Receta</Badge>}
                {showDetail.esMedicamento  && <Badge bg="#FEF3C7" txt="#92400E">💊 Medicamento</Badge>}
              </div>

              {/* Info farmacéutica */}
              {[
                { label: 'Marca',              val: showDetail.marca             },
                { label: 'Presentación',       val: showDetail.presentacion      },
                { label: 'Unidad',             val: showDetail.unidad            },
                { label: 'Lote',               val: showDetail.lote              },
                { label: 'Vencimiento',        val: showDetail.fechaVencimiento  },
                { label: 'Reg. Sanitario',     val: showDetail.registroSanitario },
                { label: 'Categoría',          val: getCatLabel(showDetail.categoria) },
              ].filter(r => r.val).map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.gray100}` }}>
                  <span style={{ fontSize: 12, color: C.gray400 }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gray800 }}>{r.val}</span>
                </div>
              ))}

              {showDetail.descripcion && (
                <p style={{ fontSize: 12, color: C.gray400, marginTop: 12, lineHeight: 1.6 }}>{showDetail.descripcion}</p>
              )}

              {/* Acciones */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
                <Button variant="secondary" icon="edit" onClick={() => { setShowDetail(null); openForm(showDetail) }}>
                  Editar
                </Button>
                <Button variant="danger" icon="trash" onClick={() => handleEliminar(showDetail.id, showDetail.nombre)}>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVO / EDITAR ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '0', width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 0' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.gray800, margin: 0 }}>
                {editId ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="x_circle" size={22} color={C.gray400} />
              </button>
            </div>

            {/* Tabs info / medicamento */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.gray200}`, margin: '14px 0 0' }}>
              {[
                { key: 'info', label: 'Info general' },
                { key: 'med',  label: '💊 Medicamento' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? C.teal : C.gray400, borderBottom: `2px solid ${tab === t.key ? C.teal : 'transparent'}` }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '16px 20px 24px' }}>
              {tab === 'info' && (
                <>
                  {/* Categoría */}
                  {config.categoriasProducto.length > 0 && (
                    <>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>Categoría</label>
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(config.categoriasProducto.length, 3)}, 1fr)`, gap: 8, marginBottom: 14 }}>
                        {config.categoriasProducto.map(c => (
                          <button key={c.key} onClick={() => upd('categoria', c.key)}
                            style={{ padding: '8px 6px', borderRadius: 10, border: `2px solid ${form.categoria === c.key ? c.color : C.gray200}`, background: form.categoria === c.key ? c.color + '12' : '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                            <Icon name={c.icon} size={16} color={c.color} style={{ display: 'block', margin: '0 auto 3px' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: form.categoria === c.key ? c.color : C.gray600 }}>{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {[
                    { k: 'nombre',      l: 'Nombre *',        placeholder: 'Ej: Amoxicilina 250mg' },
                    { k: 'marca',       l: 'Laboratorio / Marca', placeholder: 'Ej: Laboratorio Vet' },
                    { k: 'presentacion',l: 'Presentación',    placeholder: 'Ej: Frasco x 120ml' },
                    { k: 'descripcion', l: 'Descripción',     placeholder: 'Indicaciones, contraindicaciones...' },
                  ].map(f => (
                    <div key={f.k} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 4 }}>{f.l}</label>
                      <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 4 }}>Precio base *</label>
                      <input type="number" min="0" step="0.01" value={form.precio} onChange={e => upd('precio', e.target.value)}
                        placeholder="0.00"
                        style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 4 }}>Unidad</label>
                      <select value={form.unidad} onChange={e => upd('unidad', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }}>
                        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Precios por tipo de cliente */}
                  {config.tiposCliente?.length > 0 && (
                    <div style={{ background: C.gray50, borderRadius: 14, padding: '12px 14px', marginBottom: 12, border: `1px solid ${C.gray200}` }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.gray600, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="tag" size={13} color={C.teal} />
                        Precios por tipo de cliente (opcional)
                      </p>
                      <p style={{ fontSize: 11, color: C.gray400, margin: '0 0 10px' }}>
                        Deja en blanco para usar el precio base
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {config.tiposCliente.map(tipo => (
                          <div key={tipo.key}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: tipo.color || C.gray600, display: 'block', marginBottom: 3 }}>
                              {tipo.label}
                            </label>
                            <input
                              type="number" min="0" step="0.01"
                              value={form.precios?.[tipo.key] ?? ''}
                              onChange={e => {
                                const val = e.target.value
                                upd('precios', { ...form.precios, [tipo.key]: val === '' ? undefined : val })
                              }}
                              placeholder={form.precio || '0.00'}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${C.gray200}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 4 }}>
                        {editId ? 'Stock actual' : 'Stock inicial'}
                      </label>
                      {editId ? (
                        // Al editar: mostrar stock como read-only para no pisar
                        // el contador que mantienen las ventas (agregarVenta usa increment)
                        <div style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, boxSizing: 'border-box', background: C.gray50, color: C.gray400 }}>
                          {form.stock || 0} <span style={{ fontSize: 11 }}>(solo ventas lo modifican)</span>
                        </div>
                      ) : (
                        <input type="number" min="0" value={form.stock} onChange={e => upd('stock', e.target.value)}
                          placeholder="0"
                          style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 4 }}>Stock mínimo</label>
                      <input type="number" min="0" value={form.stockMinimo} onChange={e => upd('stockMinimo', e.target.value)}
                        placeholder="5"
                        style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </>
              )}

              {tab === 'med' && (
                <>
                  {/* Flags */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      { k: 'esMedicamento',  label: '💊 Medicamento', color: '#F59E0B' },
                      { k: 'cadenaFrio',     label: '❄️ Cadena frío',  color: '#3B82F6' },
                      { k: 'requiereReceta', label: '📋 Receta',       color: '#8B5CF6' },
                    ].map(fl => (
                      <button key={fl.k} onClick={() => upd(fl.k, !form[fl.k])}
                        style={{ padding: '10px 6px', borderRadius: 12, border: `2px solid ${form[fl.k] ? fl.color : C.gray200}`, background: form[fl.k] ? fl.color + '15' : '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', fontSize: 11, fontWeight: 700, color: form[fl.k] ? fl.color : C.gray400 }}>
                        {fl.label}
                      </button>
                    ))}
                  </div>

                  {[
                    { k: 'principioActivo',   l: 'Principio activo',    placeholder: 'Ej: Amoxicilina'     },
                    { k: 'concentracion',     l: 'Concentración',       placeholder: 'Ej: 250mg/5ml'       },
                    { k: 'lote',              l: 'Número de lote',      placeholder: 'Ej: LT-2024-001'     },
                    { k: 'registroSanitario', l: 'Registro sanitario',  placeholder: 'Ej: RS-123456'       },
                  ].map(f => (
                    <div key={f.k} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 4 }}>{f.l}</label>
                      <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  ))}

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 4 }}>
                      Fecha de vencimiento
                    </label>
                    <input type="date" value={form.fechaVencimiento} onChange={e => upd('fechaVencimiento', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                </>
              )}

              <Button
                icon="ok_circle" size="lg" fullWidth
                disabled={!form.nombre || !form.precio || saving}
                onClick={handleGuardar}
                style={{ marginTop: 18 }}>
                {saving ? 'Guardando...' : editId ? 'Actualizar producto' : 'Guardar producto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 90 }} />
    </div>
  )
}

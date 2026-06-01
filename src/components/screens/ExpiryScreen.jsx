/**
 * ExpiryScreen.jsx — Control de vencimientos de medicamentos
 * Vista especializada para gestión farmacéutica
 */
import { useState, useMemo } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useToast } from '../../context/ToastContext'
import { actualizarProducto } from '../../services/firestore'
import { fmtUSD } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

function diasParaVencer(fechaStr) {
  if (!fechaStr) return null
  return Math.ceil((new Date(fechaStr) - new Date()) / 86_400_000)
}

function getVencColor(dias) {
  if (dias === null)  return { bg: C.gray100,  txt: C.gray400,  border: C.gray200,  label: 'Sin fecha' }
  if (dias < 0)       return { bg: '#FEE2E2',  txt: '#991B1B',  border: '#FCA5A5',  label: `Vencido hace ${Math.abs(dias)}d` }
  if (dias <= 30)     return { bg: '#FEE2E2',  txt: '#991B1B',  border: '#FCA5A5',  label: `Vence en ${dias}d` }
  if (dias <= 60)     return { bg: '#FEF9C3',  txt: '#854D0E',  border: '#FDE047',  label: `Vence en ${dias}d` }
  if (dias <= 90)     return { bg: '#FFF7ED',  txt: '#9A3412',  border: '#FDBA74',  label: `Vence en ${dias}d` }
  return               { bg: '#DCFCE7',  txt: '#166534',  border: '#86EFAC',  label: `Vence en ${dias}d` }
}

const FILTROS = [
  { key: 'todos',      label: 'Todos'         },
  { key: 'vencidos',   label: '🔴 Vencidos'    },
  { key: 'criticos',   label: '🟠 <30 días'    },
  { key: 'proximos',   label: '🟡 30-90 días'  },
  { key: 'sin_fecha',  label: 'Sin fecha'      },
]

export default function ExpiryScreen({ onBack }) {
  const { productos, recargar } = useAppData()
  const toast = useToast()
  const [filtro,     setFiltro]     = useState('todos')
  const [search,     setSearch]     = useState('')
  const [editingId,  setEditingId]  = useState(null)
  const [newFecha,   setNewFecha]   = useState('')
  const [newLote,    setNewLote]    = useState('')
  const [saving,     setSaving]     = useState(false)

  // Solo productos que tienen fecha O son medicamentos
  const conFecha = useMemo(() => productos.filter(p => p.fechaVencimiento || p.esMedicamento), [productos])

  const filtered = useMemo(() => {
    let list = conFecha.filter(p =>
      (p.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.lote   || '').toLowerCase().includes(search.toLowerCase())
    )
    if (filtro === 'vencidos')  list = list.filter(p => { const d = diasParaVencer(p.fechaVencimiento); return d !== null && d < 0 })
    if (filtro === 'criticos')  list = list.filter(p => { const d = diasParaVencer(p.fechaVencimiento); return d !== null && d >= 0 && d <= 30 })
    if (filtro === 'proximos')  list = list.filter(p => { const d = diasParaVencer(p.fechaVencimiento); return d !== null && d > 30 && d <= 90 })
    if (filtro === 'sin_fecha') list = list.filter(p => !p.fechaVencimiento)
    return list.sort((a, b) => {
      const da = diasParaVencer(a.fechaVencimiento) ?? 9999
      const db = diasParaVencer(b.fechaVencimiento) ?? 9999
      return da - db
    })
  }, [conFecha, filtro, search])

  // Contadores
  const counts = useMemo(() => ({
    vencidos:  conFecha.filter(p => { const d = diasParaVencer(p.fechaVencimiento); return d !== null && d < 0 }).length,
    criticos:  conFecha.filter(p => { const d = diasParaVencer(p.fechaVencimiento); return d !== null && d >= 0 && d <= 30 }).length,
    proximos:  conFecha.filter(p => { const d = diasParaVencer(p.fechaVencimiento); return d !== null && d > 30 && d <= 90 }).length,
    sin_fecha: conFecha.filter(p => !p.fechaVencimiento).length,
  }), [conFecha])

  const startEdit = (p) => {
    setEditingId(p.id)
    setNewFecha(p.fechaVencimiento || '')
    setNewLote(p.lote || '')
  }

  const handleSave = async (id) => {
    setSaving(true)
    try {
      await actualizarProducto(id, {
        fechaVencimiento: newFecha,
        lote: newLote.trim(),
      })
      toast.success('Actualizado correctamente')
      recargar()
      setEditingId(null)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar title="Control de vencimientos" onBack={onBack} />

      {/* Resumen KPIs */}
      <div style={{ background: C.navy, padding: '14px 14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { label: 'Vencidos',    val: counts.vencidos,  color: C.red,     icon: 'alert_circle' },
            { label: '<30 días',    val: counts.criticos,  color: '#F97316', icon: 'clock'        },
            { label: '30-90 días',  val: counts.proximos,  color: C.amber,   icon: 'calendar'     },
            { label: 'Sin fecha',   val: counts.sin_fecha, color: C.gray400, icon: 'tag'          },
          ].map(k => (
            <div key={k.label} style={{ background: '#ffffff10', borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
              <Icon name={k.icon} size={16} color={k.color} style={{ margin: '0 auto 4px' }} />
              <p style={{ fontSize: 20, fontWeight: 900, color: k.val > 0 ? k.color : '#ffffff60', margin: 0, lineHeight: 1 }}>{k.val}</p>
              <p style={{ fontSize: 9, color: C.gray400, margin: '3px 0 0', lineHeight: 1.2 }}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Búsqueda */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: `1.5px solid ${C.gray200}`, borderRadius: 12, padding: '8px 12px', gap: 8 }}>
          <Icon name="search" size={16} color={C.gray400} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o lote..."
            style={{ background: 'none', border: 'none', fontSize: 14, flex: 1, fontFamily: 'inherit', color: C.gray800 }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icon name="x_circle" size={16} color={C.gray400} />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', overflowX: 'auto', padding: '10px 14px', gap: 8 }}>
        {FILTROS.map(f => {
          const count = f.key === 'todos' ? conFecha.length : (counts[f.key] || 0)
          const active = filtro === f.key
          return (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${active ? C.teal : C.gray200}`, background: active ? C.teal + '15' : '#fff', color: active ? C.teal : C.gray600, fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {f.label} {count > 0 && <span style={{ fontWeight: 800 }}>({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Lista */}
      <div style={{ padding: '0 14px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Icon name="ok_circle" size={36} color={C.green} />
            <p style={{ fontSize: 14, color: C.gray400, marginTop: 10 }}>
              {filtro === 'todos' ? 'No hay productos con fecha de vencimiento registrada' : 'Sin resultados en esta categoría'}
            </p>
          </div>
        ) : filtered.map(p => {
          const dias    = diasParaVencer(p.fechaVencimiento)
          const vInfo   = getVencColor(dias)
          const editing = editingId === p.id

          return (
            <Card key={p.id} style={{ marginBottom: 8, border: `1.5px solid ${vInfo.border}`, background: dias !== null && dias < 0 ? '#FFF5F5' : '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: vInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={dias !== null && dias < 0 ? 'alert_circle' : 'pill'} size={20} color={vInfo.txt} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.gray800, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.nombre}
                  </p>
                  {p.principioActivo && (
                    <p style={{ fontSize: 11, color: C.teal, fontWeight: 600, margin: '0 0 2px' }}>{p.principioActivo}</p>
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge bg={vInfo.bg} txt={vInfo.txt}>{vInfo.label}</Badge>
                    {p.lote && <Badge bg={C.gray100} txt={C.gray600}>Lote: {p.lote}</Badge>}
                    {p.cadenaFrio && <Badge bg="#EFF6FF" txt="#1E40AF">❄️ Frío</Badge>}
                  </div>

                  {/* Edición inline */}
                  {editing ? (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 3 }}>Lote</label>
                          <input value={newLote} onChange={e => setNewLote(e.target.value)}
                            placeholder="Nº lote"
                            style={{ width: '100%', padding: '7px 10px', borderRadius: 10, border: `1.5px solid ${C.gray200}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 3 }}>Vencimiento</label>
                          <input type="date" value={newFecha} onChange={e => setNewFecha(e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: 10, border: `1.5px solid ${C.gray200}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button size="sm" icon="ok_circle" disabled={saving} onClick={() => handleSave(p.id)}>
                          {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 4 }}>
                      <p style={{ fontSize: 11, color: C.gray400, margin: 0 }}>
                        Vence: {p.fechaVencimiento || 'No registrado'} · Stock: {p.stock || 0} {p.unidad || ''}
                      </p>
                    </div>
                  )}
                </div>

                {!editing && (
                  <button onClick={() => startEdit(p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <Icon name="edit" size={16} color={C.gray400} />
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div style={{ height: 90 }} />
    </div>
  )
}

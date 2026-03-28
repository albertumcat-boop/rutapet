import { useState } from 'react'
import { useConfig } from '../../context/ConfigContext'
import Icon from '../shared/Icon'
import Button from '../shared/Button'

const C = {
  navy: '#0B1929', teal: '#0FBCAA', amber: '#F5A623',
  gray200: '#E2E8F0', gray400: '#94A3B8', gray600: '#475569',
  gray800: '#1E293B', gray50: '#F8FAFC', green: '#22C55E',
  red: '#EF4444',
}

const ICONOS_DISPONIBLES = [
  'users','shopping','pkg','pill','truck','activity',
  'globe','star','zap','target','calendar','dollar',
]

const COLORES_DISPONIBLES = [
  '#0FBCAA','#3B82F6','#22C55E','#F5A623','#EF4444',
  '#A78BFA','#EC4899','#F97316','#14B8A6','#6366F1',
]

const RUBROS = [
  'Productos de mascotas','Alimentos y bebidas','Farmacia / Medicina',
  'Repuestos y cauchos','Ferretería','Cosméticos','Tecnología',
  'Ropa y calzado','Material de oficina','Otro',
]

export default function OnboardingScreen() {
  const { completarOnboarding } = useConfig()
  const [paso, setPaso] = useState(1)

  // Paso 1 — Empresa
  const [nombre,   setNombre]   = useState('')
  const [rubro,    setRubro]    = useState('')
  const [rubroCustom, setRubroCustom] = useState('')
  const [moneda,   setMoneda]   = useState('USD')

  // Paso 2 — Tipos de cliente (hasta 4)
  const [tipos, setTipos] = useState([
    { key: 't1', label: '', icon: 'users',    color: '#3B82F6' },
    { key: 't2', label: '', icon: 'shopping', color: '#0FBCAA' },
    { key: 't3', label: '', icon: 'pkg',      color: '#22C55E' },
  ])

  // Paso 3 — Categorías de producto (hasta 4)
  const [cats, setCats] = useState([
    { key: 'c1', label: '', icon: 'pkg',      color: '#22C55E' },
    { key: 'c2', label: '', icon: 'pill',     color: '#EF4444' },
    { key: 'c3', label: '', icon: 'shopping', color: '#A78BFA' },
  ])

  const updTipo = (i, k, v) => setTipos(ts => ts.map((t, j) => j === i ? { ...t, [k]: v } : t))
  const updCat  = (i, k, v) => setCats(cs => cs.map((c, j) => j === i ? { ...c, [k]: v } : c))

  const addTipo = () => {
    if (tipos.length >= 4) return
    setTipos(ts => [...ts, { key: `t${Date.now()}`, label: '', icon: 'users', color: '#94A3B8' }])
  }
  const addCat = () => {
    if (cats.length >= 4) return
    setCats(cs => [...cs, { key: `c${Date.now()}`, label: '', icon: 'pkg', color: '#94A3B8' }])
  }

  const rmTipo = (i) => setTipos(ts => ts.filter((_, j) => j !== i))
  const rmCat  = (i) => setCats(cs => cs.filter((_, j) => j !== i))

  const handleFinalizar = () => {
    const rubroFinal = rubro === 'Otro' ? rubroCustom : rubro
    completarOnboarding({
      empresa: { nombre, rubro: rubroFinal, logo: null, moneda },
      tiposCliente: tipos.filter(t => t.label.trim()),
      categoriasProducto: cats.filter(c => c.label.trim()),
    })
  }

  const inputStyle = {
    width: '100%', padding: '11px 12px', borderRadius: 12,
    border: `1.5px solid ${C.gray200}`, fontSize: 14,
    fontFamily: 'inherit', boxSizing: 'border-box',
  }

  // ── Indicador de pasos ──────────────────────────────
  const Stepper = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: paso >= n ? C.teal : C.gray200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14,
            color: paso >= n ? '#fff' : C.gray400,
            transition: 'all 0.2s',
          }}>
            {paso > n ? <Icon name="ok_circle" size={16} color="#fff" /> : n}
          </div>
          {n < 3 && <div style={{ width: 32, height: 2, background: paso > n ? C.teal : C.gray200, borderRadius: 2 }} />}
        </div>
      ))}
    </div>
  )

  // ── Selector de ícono ────────────────────────────────
  const IconPicker = ({ selected, onSelect }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
      {ICONOS_DISPONIBLES.map(ic => (
        <button key={ic} onClick={() => onSelect(ic)}
          style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${selected === ic ? C.teal : C.gray200}`, background: selected === ic ? C.teal + '15' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={ic} size={16} color={selected === ic ? C.teal : C.gray400} />
        </button>
      ))}
    </div>
  )

  // ── Selector de color ────────────────────────────────
  const ColorPicker = ({ selected, onSelect }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
      {COLORES_DISPONIBLES.map(col => (
        <button key={col} onClick={() => onSelect(col)}
          style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: `3px solid ${selected === col ? C.gray800 : 'transparent'}`, cursor: 'pointer' }} />
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: `0 8px 32px ${C.teal}55` }}>
            <Icon name="route" size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0 }}>Configura tu app</h1>
          <p style={{ fontSize: 13, color: C.gray400, marginTop: 4 }}>
            {paso === 1 ? 'Tu empresa' : paso === 2 ? 'Tipos de cliente' : 'Categorías de producto'}
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 20px' }}>
          <Stepper />

          {/* ── PASO 1: Empresa ── */}
          {paso === 1 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray800, marginBottom: 4 }}>Tu empresa</h2>
              <p style={{ fontSize: 13, color: C.gray400, marginBottom: 20 }}>Esta información aparece en tu app</p>

              <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>Nombre de la empresa *</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Distribuidora García"
                style={{ ...inputStyle, marginBottom: 14 }} />

              <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>Rubro *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                {RUBROS.map(r => (
                  <button key={r} onClick={() => setRubro(r)}
                    style={{ padding: '8px 10px', borderRadius: 10, border: `2px solid ${rubro === r ? C.teal : C.gray200}`, background: rubro === r ? C.teal + '12' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: rubro === r ? C.teal : C.gray600, textAlign: 'left' }}>
                    {r}
                  </button>
                ))}
              </div>
              {rubro === 'Otro' && (
                <input value={rubroCustom} onChange={e => setRubroCustom(e.target.value)} placeholder="Describe tu rubro..."
                  style={{ ...inputStyle, marginBottom: 14 }} />
              )}

              <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 8 }}>Moneda principal</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['USD', 'VES', 'COP', 'BRL', 'MXN'].map(m => (
                  <button key={m} onClick={() => setMoneda(m)}
                    style={{ flex: 1, padding: '10px 4px', borderRadius: 10, border: `2px solid ${moneda === m ? C.teal : C.gray200}`, background: moneda === m ? C.teal + '12' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: moneda === m ? C.teal : C.gray600 }}>
                    {m}
                  </button>
                ))}
              </div>

              <Button size="lg" fullWidth icon="chevron"
                disabled={!nombre || !rubro || (rubro === 'Otro' && !rubroCustom)}
                onClick={() => setPaso(2)}>
                Siguiente
              </Button>
            </>
          )}

          {/* ── PASO 2: Tipos de cliente ── */}
          {paso === 2 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray800, marginBottom: 4 }}>Tipos de cliente</h2>
              <p style={{ fontSize: 13, color: C.gray400, marginBottom: 16 }}>Define cómo clasificas a tus clientes</p>

              <div style={{ marginBottom: 16 }}>
                {tipos.map((t, i) => (
                  <div key={t.key} style={{ background: C.gray50, borderRadius: 14, padding: '14px', marginBottom: 10, border: `1px solid ${C.gray200}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.gray600 }}>Tipo {i + 1}</span>
                      {tipos.length > 1 && (
                        <button onClick={() => rmTipo(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                          Eliminar
                        </button>
                      )}
                    </div>
                    <input value={t.label} onChange={e => updTipo(i, 'label', e.target.value)}
                      placeholder={`Ej: ${['Distribuidor','Mayorista','Minorista','Tienda'][i] || 'Tipo de cliente'}`}
                      style={{ ...inputStyle, marginBottom: 10 }} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.gray600, margin: '0 0 4px' }}>Ícono</p>
                    <IconPicker selected={t.icon} onSelect={v => updTipo(i, 'icon', v)} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.gray600, margin: '10px 0 4px' }}>Color</p>
                    <ColorPicker selected={t.color} onSelect={v => updTipo(i, 'color', v)} />
                    {/* Preview */}
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={t.icon} size={18} color={t.color} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.label || 'Vista previa'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {tipos.length < 4 && (
                <button onClick={addTipo}
                  style={{ width: '100%', padding: '11px', borderRadius: 12, border: `1.5px dashed ${C.teal}`, background: C.teal + '08', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="plus" size={15} color={C.teal} /> Agregar tipo
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Button variant="ghost" fullWidth onClick={() => setPaso(1)}>Atrás</Button>
                <Button size="lg" fullWidth icon="chevron"
                  disabled={tipos.filter(t => t.label.trim()).length === 0}
                  onClick={() => setPaso(3)}>
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {/* ── PASO 3: Categorías de producto ── */}
          {paso === 3 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.gray800, marginBottom: 4 }}>Categorías de producto</h2>
              <p style={{ fontSize: 13, color: C.gray400, marginBottom: 16 }}>Define cómo organizas tus productos</p>

              <div style={{ marginBottom: 16 }}>
                {cats.map((cat, i) => (
                  <div key={cat.key} style={{ background: C.gray50, borderRadius: 14, padding: '14px', marginBottom: 10, border: `1px solid ${C.gray200}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.gray600 }}>Categoría {i + 1}</span>
                      {cats.length > 1 && (
                        <button onClick={() => rmCat(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                          Eliminar
                        </button>
                      )}
                    </div>
                    <input value={cat.label} onChange={e => updCat(i, 'label', e.target.value)}
                      placeholder={`Ej: ${['Línea A','Línea B','Línea C','Línea D'][i] || 'Categoría'}`}
                      style={{ ...inputStyle, marginBottom: 10 }} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.gray600, margin: '0 0 4px' }}>Ícono</p>
                    <IconPicker selected={cat.icon} onSelect={v => updCat(i, 'icon', v)} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.gray600, margin: '10px 0 4px' }}>Color</p>
                    <ColorPicker selected={cat.color} onSelect={v => updCat(i, 'color', v)} />
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={cat.icon} size={18} color={cat.color} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.label || 'Vista previa'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {cats.length < 4 && (
                <button onClick={addCat}
                  style={{ width: '100%', padding: '11px', borderRadius: 12, border: `1.5px dashed ${C.teal}`, background: C.teal + '08', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="plus" size={15} color={C.teal} /> Agregar categoría
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Button variant="ghost" fullWidth onClick={() => setPaso(2)}>Atrás</Button>
                <Button size="lg" fullWidth icon="ok_circle"
                  disabled={cats.filter(c => c.label.trim()).length === 0}
                  onClick={handleFinalizar}>
                  ¡Listo!
                </Button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: C.gray400, fontSize: 12, marginTop: 16 }}>
          Puedes cambiar esto después desde Configuración
        </p>
      </div>
    </div>
  )
}

import Icon from '../shared/Icon'

const C = {
  navy: '#0B1929', navyLight: '#1E2F47', teal: '#0FBCAA',
  amber: '#F5A623', green: '#22C55E', red: '#EF4444',
  gray400: '#94A3B8', gray600: '#475569', gray800: '#1E293B',
}

const FEATURES = [
  { icon: 'pill',        color: '#EF4444', title: 'Catálogo de medicamentos', desc: 'Registra principio activo, concentración, lote, vencimiento y registro sanitario' },
  { icon: 'clock',       color: '#F97316', title: 'Control de vencimientos',  desc: 'Alertas automáticas para productos que vencen en 30, 60 y 90 días'              },
  { icon: 'thermometer', color: '#3B82F6', title: 'Cadena de frío',           desc: 'Identifica los productos que requieren refrigeración y temperatura controlada'    },
  { icon: 'users',       color: C.teal,   title: 'Gestión de clientes',       desc: 'Clínicas, farmacias, veterinarias y petshops organizados por tipo y nivel'        },
  { icon: 'map',         color: C.amber,  title: 'Rutas optimizadas',         desc: 'Planifica visitas diarias y navega directo desde la app con GPS'                  },
  { icon: 'dollar',      color: C.green,  title: 'Ventas y cobros',           desc: 'Registra ventas, controla deudas y límites de crédito por cliente'               },
  { icon: 'chart',       color: '#A78BFA', title: 'Analítica en tiempo real', desc: 'KPIs de ventas, cobertura de inventario y métricas de rendimiento'               },
  { icon: 'team',        color: '#6D28D9', title: 'Multi-vendedor',           desc: 'Admin + equipo de vendedores. Cada uno ve solo sus clientes y rutas'             },
  { icon: 'shield',      color: C.green,  title: 'Control de prescripciones', desc: 'Marca qué productos requieren receta veterinaria para su despacho'               },
  { icon: 'wifi',        color: '#3B82F6', title: 'Funciona sin internet',    desc: 'PWA instalable en celular. Trabaja offline y sincroniza al conectarse'           },
]

const STATS = [
  { val: '100%', label: 'Veterinario'    },
  { val: 'PWA',  label: 'Instala en iOS/Android' },
  { val: 'GPS',  label: 'Rutas reales'   },
  { val: 'Offline', label: 'Sin internet' },
]

const TIPOS_CLIENTE = [
  { emoji: '🏥', label: 'Clínicas veterinarias' },
  { emoji: '💊', label: 'Farmacias veterinarias' },
  { emoji: '🐾', label: 'Pet Shops'              },
  { emoji: '🏪', label: 'Distribuidoras'         },
  { emoji: '🐄', label: 'Granjas / Agro'         },
  { emoji: '🏨', label: 'Hoteles mascotas'        },
  { emoji: '🔬', label: 'Laboratorios'           },
  { emoji: '📦', label: 'Mayoristas'             },
]

export default function LandingScreen({ onEntrar }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', background: '#fff', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.navy, borderBottom: '1px solid #ffffff10' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="paw" size={16} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>VetRuta</span>
              <span style={{ fontSize: 10, color: C.teal, display: 'block', lineHeight: 1, fontWeight: 700 }}>Medicamentos para mascotas</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => scrollTo('features')}
              style={{ background: 'none', border: 'none', color: C.gray400, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Funciones
            </button>
            <button onClick={onEntrar}
              style={{ background: C.teal, border: 'none', borderRadius: 10, padding: '7px 14px', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Entrar →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg,${C.navy},${C.navyLight})`, padding: '60px 20px 50px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.teal + '20', border: `1px solid ${C.teal}40`, borderRadius: 20, padding: '5px 14px', marginBottom: 22 }}>
            <Icon name="pill" size={13} color={C.teal} />
            <span style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>Especializado en ventas de medicamentos veterinarios</span>
          </div>

          <h1 style={{ fontSize: 'clamp(26px,7vw,44px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.2, letterSpacing: -1 }}>
            Vende medicamentos<br />
            <span style={{ color: C.teal }}>para mascotas</span> como un pro
          </h1>

          <p style={{ fontSize: 'clamp(13px,3.5vw,16px)', color: C.gray400, margin: '0 0 28px', lineHeight: 1.7 }}>
            Controla lotes, vencimientos, cadena de frío, recetas y rutas.<br />
            Todo desde el celular, incluso sin internet.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEntrar}
              style={{ background: C.teal, border: 'none', borderRadius: 12, padding: '13px 26px', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 24px ${C.teal}50` }}>
              Comenzar gratis →
            </button>
            <button onClick={() => scrollTo('features')}
              style={{ background: 'transparent', border: '1.5px solid #ffffff30', borderRadius: 12, padding: '13px 18px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Ver funciones
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: 36, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            {STATS.map(s => (
              <div key={s.val} style={{ background: '#ffffff10', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 900, color: C.teal, margin: 0 }}>{s.val}</p>
                <p style={{ fontSize: 11, color: C.gray400, margin: '3px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIPOS DE CLIENTE ── */}
      <section style={{ background: '#F8FAFC', padding: '44px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Para cualquier canal de venta</p>
          <h2 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 900, color: C.gray800, margin: '0 0 10px' }}>
            Un vendedor, múltiples canales
          </h2>
          <p style={{ fontSize: 14, color: C.gray600, margin: '0 0 28px', lineHeight: 1.6 }}>
            Desde clínicas veterinarias hasta distribuidoras mayoristas, en un solo lugar.
          </p>
          <div className="rubros-grid">
            {TIPOS_CLIENTE.map(r => (
              <div key={r.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 6px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <span style={{ fontSize: 26 }}>{r.emoji}</span>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.gray800, margin: '8px 0 0', lineHeight: 1.3 }}>{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHT: Vencimientos ── */}
      <section style={{ background: C.navy, padding: '44px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Control farmacéutico</p>
            <h2 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 900, color: '#fff', margin: '0 0 10px' }}>
              Nunca más un medicamento vencido en el campo
            </h2>
            <p style={{ fontSize: 14, color: C.gray400, lineHeight: 1.6 }}>
              Registra lotes y fechas de vencimiento. Recibe alertas automáticas a 30, 60 y 90 días.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14 }}>
            {[
              { color: C.red,    icon: 'alert_circle', title: 'VENCIDO',      desc: 'Alerta inmediata en el dashboard. Requiere acción urgente.',           dias: '< 0 días'  },
              { color: '#F97316',icon: 'clock',        title: 'Crítico',      desc: 'Menos de 30 días. Planifica devolución o descuento de urgencia.',      dias: '< 30 días' },
              { color: C.amber,  icon: 'calendar',     title: 'En seguimiento', desc: 'Entre 30 y 90 días. Monitoreo activo, coordina con el cliente.',     dias: '< 90 días' },
              { color: C.green,  icon: 'ok_circle',    title: 'OK',           desc: 'Más de 90 días de vigencia. Sin acción necesaria.',                    dias: '> 90 días' },
            ].map(item => (
              <div key={item.title} style={{ background: '#ffffff0A', border: `1px solid ${item.color}30`, borderRadius: 14, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={item.icon} size={16} color={item.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0 }}>{item.title}</p>
                    <span style={{ fontSize: 11, color: item.color, fontWeight: 700 }}>{item.dias}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: C.gray400, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '44px 16px', background: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Funcionalidades</p>
            <h2 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 900, color: C.gray800, margin: '0 0 10px' }}>
              Todo lo que un vendedor de veterinaria necesita
            </h2>
            <p style={{ fontSize: 14, color: C.gray600 }}>Una sola app para reemplazar planillas, WhatsApp y llamadas.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#F8FAFC', borderRadius: 14, padding: '16px', border: '1px solid #E2E8F0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: f.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.icon} size={19} color={f.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: C.gray800, margin: '0 0 3px' }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: C.gray600, margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ background: '#F8FAFC', padding: '44px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Simple de usar</p>
          <h2 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 900, color: C.gray800, margin: '0 0 32px' }}>En 3 pasos ya estás trabajando</h2>
          <div className="pasos-grid">
            {[
              { icon: 'settings', color: C.teal,  title: 'Configura en 5 min', desc: 'Nombre de empresa, tipos de cliente (clínica, farmacia, petshop) y categorías de producto.' },
              { icon: 'users',    color: C.amber,  title: 'Carga tu cartera',    desc: 'Importa o registra tus clientes con GPS. Define inventario ideal por establecimiento.' },
              { icon: 'pill',     color: '#EF4444', title: 'Vende y controla',   desc: 'Registra ventas, controla lotes/vencimientos y cobra. Todo desde el celular.' },
            ].map(s => (
              <div key={s.title} style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: s.color + '25', border: `2px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Icon name={s.icon} size={22} color={s.color} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.gray800, margin: '0 0 6px' }}>{s.title}</p>
                <p style={{ fontSize: 12, color: C.gray600, lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, padding: '56px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 32px ${C.teal}55` }}>
            <Icon name="paw" size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>
            ¿Listo para transformar tu fuerza de ventas?
          </h2>
          <p style={{ fontSize: 14, color: C.gray400, margin: '0 0 24px', lineHeight: 1.7 }}>
            Diseñado para empresas de medicamentos para mascotas en LATAM.<br />
            Sin tarjeta de crédito. Configura en minutos.
          </p>
          <button onClick={onEntrar}
            style={{ background: C.teal, border: 'none', borderRadius: 14, padding: '14px 32px', color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 32px ${C.teal}50` }}>
            Empezar ahora 🐾
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.navy, borderTop: '1px solid #ffffff10', padding: '18px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="paw" size={13} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>VetRuta</span>
        </div>
        <p style={{ fontSize: 11, color: C.gray400, margin: 0 }}>© 2025 VetRuta · Plataforma de ventas en ruta para medicamentos veterinarios · LATAM</p>
      </footer>

    </div>
  )
}

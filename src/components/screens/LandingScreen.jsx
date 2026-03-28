import { useState } from 'react'
import Icon from '../shared/Icon'

const C = {
  navy: '#0B1929', navyLight: '#1E2F47', teal: '#0FBCAA',
  amber: '#F5A623', green: '#22C55E', gray400: '#94A3B8',
  gray600: '#475569', gray800: '#1E293B', white: '#FFFFFF',
}

const FEATURES = [
  { icon: 'users',    color: '#3B82F6', title: 'Gestión de clientes',     desc: 'Registra y clasifica tus clientes por tipo y nivel de compra' },
  { icon: 'map',      color: C.amber,   title: 'Mapa inteligente',        desc: 'Visualiza todos tus clientes en un mapa real e interactivo' },
  { icon: 'route',    color: C.teal,    title: 'Rutas optimizadas',       desc: 'Planifica tus visitas diarias y ahorra tiempo en la calle' },
  { icon: 'dollar',   color: C.green,   title: 'Ventas y cobros',         desc: 'Registra ventas, pagos parciales y controla deudas' },
  { icon: 'chart',    color: '#A78BFA', title: 'Analítica completa',      desc: 'Dashboard con métricas de rendimiento y productos top' },
  { icon: 'wifi',     color: C.teal,    title: 'Funciona sin internet',   desc: 'Trabaja offline y sincroniza cuando tengas señal' },
  { icon: 'target',   color: C.amber,   title: 'GPS y cercanos',          desc: 'Detecta qué clientes tienes cerca en tiempo real' },
  { icon: 'settings', color: '#A78BFA', title: '100% personalizable',     desc: 'Configura la app para cualquier rubro o industria' },
]

const RUBROS = [
  { emoji: '🐾', label: 'Mascotas' },
  { emoji: '🍺', label: 'Bebidas' },
  { emoji: '💊', label: 'Farmacia' },
  { emoji: '🔧', label: 'Repuestos' },
  { emoji: '🌽', label: 'Alimentos' },
  { emoji: '💄', label: 'Cosméticos' },
  { emoji: '⚙️', label: 'Ferretería' },
  { emoji: '📦', label: 'Cualquier rubro' },
]

const PLANES = [
  {
    nombre: 'Free',
    precio: '$0',
    periodo: 'para siempre',
    color: C.gray600,
    features: ['1 vendedor', '20 clientes', 'Mapa básico', 'Registro de ventas'],
    cta: 'Empezar gratis',
    destacado: false,
  },
  {
    nombre: 'Pro',
    precio: '$19',
    periodo: 'por mes',
    color: C.teal,
    features: ['Hasta 3 vendedores', 'Clientes ilimitados', 'Mapa + GPS', 'Analítica completa', 'Rutas optimizadas', 'Soporte WhatsApp'],
    cta: 'Comenzar prueba',
    destacado: true,
  },
  {
    nombre: 'Business',
    precio: '$49',
    periodo: 'por mes',
    color: '#A78BFA',
    features: ['Hasta 10 vendedores', 'Todo lo de Pro', 'Panel admin avanzado', 'Exportar reportes', 'API de integración', 'Soporte prioritario'],
    cta: 'Contactar',
    destacado: false,
  },
]

export default function LandingScreen({ onEntrar }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', background: '#fff', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.navy, borderBottom: `1px solid #ffffff10`, padding: '0 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="route" size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>RutaVentas</span>
          </div>

          {/* Nav links desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['Funciones','features'],['Rubros','rubros'],['Precios','precios']].map(([l, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{ background: 'none', border: 'none', color: C.gray400, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {l}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button onClick={onEntrar}
            style={{ background: C.teal, border: 'none', borderRadius: 10, padding: '8px 20px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            Entrar a la app
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: '80px 20px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.teal + '20', border: `1px solid ${C.teal}40`, borderRadius: 20, padding: '6px 16px', marginBottom: 28 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal }} />
            <span style={{ fontSize: 13, color: C.teal, fontWeight: 700 }}>App de ventas en ruta para cualquier rubro</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: -1 }}>
            Gestiona tus ventas<br />
            <span style={{ color: C.teal }}>en la calle</span> como un pro
          </h1>

          <p style={{ fontSize: 18, color: C.gray400, margin: '0 0 36px', lineHeight: 1.7 }}>
            Controla clientes, ventas, cobros y rutas desde tu celular.<br />
            Funciona offline. Se adapta a cualquier negocio.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEntrar}
              style={{ background: C.teal, border: 'none', borderRadius: 14, padding: '14px 32px', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 32px ${C.teal}50` }}>
              Empezar gratis →
            </button>
            <button onClick={() => scrollTo('features')}
              style={{ background: 'transparent', border: `1.5px solid #ffffff30`, borderRadius: 14, padding: '14px 28px', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Ver funciones
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 52, flexWrap: 'wrap' }}>
            {[['100%', 'Gratis para empezar'], ['Offline', 'Sin internet funciona'], ['GPS', 'Clientes cercanos'], ['PWA', 'Instala en tu celular']].map(([v, l]) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: C.teal, margin: 0 }}>{v}</p>
                <p style={{ fontSize: 12, color: C.gray400, margin: '4px 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ES ── */}
      <section id="rubros" style={{ background: '#F8FAFC', padding: '60px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Para cualquier rubro</p>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: C.gray800, margin: '0 0 14px' }}>
            No importa lo que vendas
          </h2>
          <p style={{ fontSize: 16, color: C.gray600, margin: '0 0 40px', lineHeight: 1.7 }}>
            Configuras la app en 3 minutos con tus propios tipos de cliente y categorías de producto.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {RUBROS.map((r) => (
              <div key={r.label}
                style={{ background: '#fff', borderRadius: 16, padding: '20px 10px', border: `1px solid #E2E8F0`, textAlign: 'center' }}>
                <span style={{ fontSize: 32 }}>{r.emoji}</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.gray800, margin: '10px 0 0' }}>{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="features" style={{ padding: '60px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Funcionalidades</p>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: C.gray800, margin: '0 0 14px' }}>Todo lo que necesitas en la calle</h2>
            <p style={{ fontSize: 16, color: C.gray600 }}>Una sola app para reemplazar las notas, hojas de Excel y llamadas.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.title}
                style={{ background: '#F8FAFC', borderRadius: 16, padding: '20px', border: `1px solid #E2E8F0`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.icon} size={22} color={f.color} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.gray800, margin: '0 0 4px' }}>{f.title}</p>
                  <p style={{ fontSize: 13, color: C.gray600, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ background: C.navy, padding: '60px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Simple de usar</p>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: '0 0 44px' }}>En 3 pasos ya estás trabajando</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { n:'1', icon:'settings', color: C.teal,  title:'Configura tu app',   desc:'Pon el nombre de tu empresa, tus tipos de cliente y categorías de producto en 3 minutos.' },
              { n:'2', icon:'users',    color: C.amber,  title:'Registra clientes',  desc:'Agrega tus clientes con foto, dirección GPS, notas y tipo. Aparecen en el mapa al instante.' },
              { n:'3', icon:'dollar',   color: C.green,  title:'Vende y cobra',      desc:'Registra ventas en 30 segundos, controla deudas y visualiza tus métricas en tiempo real.' },
            ].map((s) => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: s.color + '25', border: `2px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon name={s.icon} size={24} color={s.color} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{s.title}</p>
                <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ background: '#F8FAFC', padding: '60px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.teal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Precios</p>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: C.gray800, margin: '0 0 14px' }}>Planes para cada etapa</h2>
            <p style={{ fontSize: 16, color: C.gray600 }}>Empieza gratis. Crece cuando estés listo.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {PLANES.map((p) => (
              <div key={p.nombre}
                style={{ background: p.destacado ? C.navy : '#fff', borderRadius: 20, padding: '28px 20px', border: p.destacado ? `2px solid ${C.teal}` : `1px solid #E2E8F0`, position: 'relative', boxShadow: p.destacado ? `0 12px 40px ${C.teal}30` : 'none' }}>
                {p.destacado && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: C.teal, borderRadius: 20, padding: '4px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>⭐ Más popular</span>
                  </div>
                )}
                <p style={{ fontSize: 15, fontWeight: 800, color: p.destacado ? '#fff' : C.gray800, margin: '0 0 8px' }}>{p.nombre}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: p.destacado ? C.teal : C.gray800 }}>{p.precio}</span>
                  <span style={{ fontSize: 13, color: C.gray400 }}>/{p.periodo}</span>
                </div>
                <div style={{ borderTop: `1px solid ${p.destacado ? '#ffffff15' : '#E2E8F0'}`, paddingTop: 16, marginBottom: 20 }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Icon name="ok_circle" size={15} color={p.destacado ? C.teal : C.green} />
                      <span style={{ fontSize: 13, color: p.destacado ? C.gray400 : C.gray600 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={onEntrar}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${p.destacado ? C.teal : '#E2E8F0'}`, background: p.destacado ? C.teal : 'transparent', color: p.destacado ? '#fff' : C.gray800, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: C.gray400, marginTop: 24 }}>
            Pagos por Stripe · Zelle · Zinli · Pago Móvil · PayPal
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, padding: '70px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 32px ${C.teal}55` }}>
            <Icon name="route" size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: -0.5 }}>
            ¿Listo para vender mejor?
          </h2>
          <p style={{ fontSize: 16, color: C.gray400, margin: '0 0 32px', lineHeight: 1.7 }}>
            Configura tu app en 3 minutos.<br />Sin tarjeta de crédito. Sin límite de tiempo en el plan gratuito.
          </p>
          <button onClick={onEntrar}
            style={{ background: C.teal, border: 'none', borderRadius: 14, padding: '16px 40px', color: '#fff', fontSize: 17, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 32px ${C.teal}50` }}>
            Empezar ahora — es gratis 🚀
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.navy, borderTop: `1px solid #ffffff10`, padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="route" size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>RutaVentas</span>
        </div>
        <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>
          © 2025 RutaVentas · Gestión de ventas en ruta para LATAM
        </p>
      </footer>

    </div>
  )
}

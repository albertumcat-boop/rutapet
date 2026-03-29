import { useState } from 'react'
import Icon from '../shared/Icon'

const C = {
  navy: '#0B1929', navyLight: '#1E2F47', teal: '#0FBCAA',
  amber: '#F5A623', green: '#22C55E', gray400: '#94A3B8',
  gray600: '#475569', gray800: '#1E293B',
}

const FEATURES = [
  { icon:'users',    color:'#3B82F6', title:'Gestión de clientes',   desc:'Registra y clasifica tus clientes por tipo y nivel de compra' },
  { icon:'map',      color:C.amber,   title:'Mapa inteligente',      desc:'Visualiza todos tus clientes en un mapa real e interactivo'   },
  { icon:'route',    color:C.teal,    title:'Rutas optimizadas',     desc:'Planifica tus visitas diarias y ahorra tiempo en la calle'    },
  { icon:'dollar',   color:C.green,   title:'Ventas y cobros',       desc:'Registra ventas, pagos y controla deudas fácilmente'          },
  { icon:'chart',    color:'#A78BFA', title:'Analítica completa',    desc:'Dashboard con métricas de rendimiento en tiempo real'         },
  { icon:'wifi',     color:C.teal,    title:'Funciona sin internet', desc:'Trabaja offline y sincroniza cuando tengas señal'             },
  { icon:'target',   color:C.amber,   title:'GPS y cercanos',        desc:'Detecta qué clientes tienes cerca en tiempo real'            },
  { icon:'settings', color:'#A78BFA', title:'100% personalizable',   desc:'Configura la app para cualquier rubro o industria'           },
]

const RUBROS = [
  { emoji:'🐾', label:'Mascotas'  },
  { emoji:'🍺', label:'Bebidas'   },
  { emoji:'💊', label:'Farmacia'  },
  { emoji:'🔧', label:'Repuestos' },
  { emoji:'🌽', label:'Alimentos' },
  { emoji:'💄', label:'Cosméticos'},
  { emoji:'⚙️', label:'Ferretería'},
  { emoji:'📦', label:'Otro rubro'},
]

const PLANES = [
  {
    nombre:'Free', precio:'$0', periodo:'para siempre', color:C.gray600, destacado:false,
    features:['1 vendedor','20 clientes','Mapa básico','Registro de ventas'],
    cta:'Empezar gratis',
  },
  {
    nombre:'Pro', precio:'$19', periodo:'por mes', color:C.teal, destacado:true,
    features:['Hasta 3 vendedores','Clientes ilimitados','Mapa + GPS','Analítica completa','Rutas optimizadas','Soporte WhatsApp'],
    cta:'Comenzar prueba',
  },
  {
    nombre:'Business', precio:'$49', periodo:'por mes', color:'#A78BFA', destacado:false,
    features:['Hasta 10 vendedores','Todo lo de Pro','Panel admin avanzado','Exportar reportes','API integración','Soporte prioritario'],
    cta:'Contactar',
  },
]

export default function LandingScreen({ onEntrar }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })

  return (
    <div style={{ fontFamily:'Nunito, sans-serif', background:'#fff', overflowX:'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:C.navy, borderBottom:'1px solid #ffffff10' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="route" size={16} color="#fff" />
            </div>
            <span style={{ fontSize:17, fontWeight:900, color:'#fff' }}>RutaVentas</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => scrollTo('precios')}
              style={{ background:'none', border:'none', color:C.gray400, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Precios
            </button>
            <button onClick={onEntrar}
              style={{ background:C.teal, border:'none', borderRadius:10, padding:'8px 14px', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
              Entrar →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background:`linear-gradient(160deg,${C.navy},${C.navyLight})`, padding:'60px 20px 50px', textAlign:'center' }}>
        <div style={{ maxWidth:580, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.teal+'20', border:`1px solid ${C.teal}40`, borderRadius:20, padding:'5px 14px', marginBottom:22 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.teal, flexShrink:0 }} />
            <span style={{ fontSize:12, color:C.teal, fontWeight:700 }}>Para cualquier negocio de ventas en ruta</span>
          </div>
          <h1 style={{ fontSize:'clamp(26px,7vw,44px)', fontWeight:900, color:'#fff', margin:'0 0 16px', lineHeight:1.2, letterSpacing:-1 }}>
            Gestiona tus ventas<br /><span style={{ color:C.teal }}>en la calle</span> como un pro
          </h1>
          <p style={{ fontSize:'clamp(13px,3.5vw,16px)', color:C.gray400, margin:'0 0 28px', lineHeight:1.7 }}>
            Controla clientes, ventas, cobros y rutas desde tu celular.<br />Funciona offline. Se adapta a cualquier negocio.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={onEntrar}
              style={{ background:C.teal, border:'none', borderRadius:12, padding:'13px 26px', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 6px 24px ${C.teal}50` }}>
              Empezar gratis →
            </button>
            <button onClick={() => scrollTo('features')}
              style={{ background:'transparent', border:'1.5px solid #ffffff30', borderRadius:12, padding:'13px 18px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Ver funciones
            </button>
          </div>

          {/* Stats 2x2 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginTop:36, maxWidth:320, marginLeft:'auto', marginRight:'auto' }}>
            {[['Gratis','Para empezar'],['Offline','Sin internet'],['GPS real','Clientes cercanos'],['PWA','Instala en celular']].map(([v,l]) => (
              <div key={v} style={{ background:'#ffffff10', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                <p style={{ fontSize:15, fontWeight:900, color:C.teal, margin:0 }}>{v}</p>
                <p style={{ fontSize:11, color:C.gray400, margin:'3px 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RUBROS ── */}
      <section style={{ background:'#F8FAFC', padding:'44px 20px' }}>
        <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:800, color:C.teal, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Para cualquier rubro</p>
          <h2 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:900, color:C.gray800, margin:'0 0 10px' }}>No importa lo que vendas</h2>
          <p style={{ fontSize:14, color:C.gray600, margin:'0 0 28px', lineHeight:1.6 }}>Configura la app en 3 minutos con tus propios tipos de cliente y categorías.</p>
          <div className="rubros-grid">
            {RUBROS.map(r => (
              <div key={r.label} style={{ background:'#fff', borderRadius:12, padding:'14px 6px', border:'1px solid #E2E8F0', textAlign:'center' }}>
                <span style={{ fontSize:26 }}>{r.emoji}</span>
                <p style={{ fontSize:11, fontWeight:700, color:C.gray800, margin:'8px 0 0', lineHeight:1.3 }}>{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'44px 20px', background:'#fff' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <p style={{ fontSize:11, fontWeight:800, color:C.teal, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Funcionalidades</p>
            <h2 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:900, color:C.gray800, margin:'0 0 10px' }}>Todo lo que necesitas en la calle</h2>
            <p style={{ fontSize:14, color:C.gray600 }}>Una sola app para reemplazar notas, Excel y llamadas.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} style={{ background:'#F8FAFC', borderRadius:14, padding:'16px', border:'1px solid #E2E8F0', display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:40, height:40, borderRadius:11, background:f.color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={f.icon} size={19} color={f.color} />
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:800, color:C.gray800, margin:'0 0 3px' }}>{f.title}</p>
                  <p style={{ fontSize:12, color:C.gray600, margin:0, lineHeight:1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ background:C.navy, padding:'44px 20px' }}>
        <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:800, color:C.teal, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Simple de usar</p>
          <h2 style={{ fontSize:'clamp(20px,5vw,26px)', fontWeight:900, color:'#fff', margin:'0 0 32px' }}>En 3 pasos ya estás trabajando</h2>
          <div className="pasos-grid">
            {[
              { icon:'settings', color:C.teal,  title:'Configura tu app',  desc:'Nombre de empresa, tipos de cliente y categorías en 3 minutos.' },
              { icon:'users',    color:C.amber,  title:'Registra clientes', desc:'Agrega clientes con foto y GPS. Aparecen en el mapa al instante.' },
              { icon:'dollar',   color:C.green,  title:'Vende y cobra',     desc:'Registra ventas en 30 segundos y controla tus métricas.' },
            ].map(s => (
              <div key={s.title} style={{ textAlign:'center', padding:'0 8px' }}>
                <div style={{ width:50, height:50, borderRadius:'50%', background:s.color+'25', border:`2px solid ${s.color}40`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <Icon name={s.icon} size={22} color={s.color} />
                </div>
                <p style={{ fontSize:14, fontWeight:800, color:'#fff', margin:'0 0 6px' }}>{s.title}</p>
                <p style={{ fontSize:12, color:C.gray400, lineHeight:1.5, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ background:'#F8FAFC', padding:'44px 20px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <p style={{ fontSize:11, fontWeight:800, color:C.teal, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Precios</p>
            <h2 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:900, color:C.gray800, margin:'0 0 10px' }}>Planes para cada etapa</h2>
            <p style={{ fontSize:14, color:C.gray600 }}>Empieza gratis. Crece cuando estés listo.</p>
          </div>

          {/* Usa clase CSS para cambiar a 3 col en desktop */}
          <div className="planes-grid">
            {PLANES.map(p => (
              <div key={p.nombre} style={{
                background: p.destacado ? C.navy : '#fff',
                borderRadius: 20,
                padding: '24px 20px',
                border: p.destacado ? `2px solid ${C.teal}` : '1px solid #E2E8F0',
                boxShadow: p.destacado ? `0 8px 32px ${C.teal}25` : 'none',
                position: 'relative',
              }}>
                {p.destacado && (
                  <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', background:C.teal, borderRadius:20, padding:'3px 14px', whiteSpace:'nowrap' }}>
                    <span style={{ fontSize:11, fontWeight:800, color:'#fff' }}>⭐ Más popular</span>
                  </div>
                )}

                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:15, fontWeight:800, color:p.destacado?'#fff':C.gray800, margin:'0 0 6px' }}>{p.nombre}</p>
                  <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:14 }}>
                    <span style={{ fontSize:30, fontWeight:900, color:p.destacado?C.teal:C.gray800 }}>{p.precio}</span>
                    <span style={{ fontSize:12, color:C.gray400 }}>/{p.periodo}</span>
                  </div>
                  <button onClick={onEntrar}
                    style={{ width:'100%', padding:'10px', borderRadius:12, border:`1.5px solid ${p.destacado?C.teal:'#E2E8F0'}`, background:p.destacado?C.teal:'transparent', color:p.destacado?'#fff':C.gray800, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>
                    {p.cta}
                  </button>
                </div>

                <div style={{ borderTop:`1px solid ${p.destacado?'#ffffff15':'#E2E8F0'}`, paddingTop:14 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                      <Icon name="ok_circle" size={14} color={p.destacado?C.teal:C.green} style={{ flexShrink:0, marginTop:2 }} />
                      <span style={{ fontSize:13, color:p.destacado?C.gray400:C.gray600, lineHeight:1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign:'center', fontSize:12, color:C.gray400, marginTop:18 }}>Stripe · Zelle · Zinli · Pago Móvil · PayPal</p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, padding:'56px 20px', textAlign:'center' }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <div style={{ width:64, height:64, borderRadius:18, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:`0 8px 32px ${C.teal}55` }}>
            <Icon name="route" size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:900, color:'#fff', margin:'0 0 12px' }}>¿Listo para vender mejor?</h2>
          <p style={{ fontSize:14, color:C.gray400, margin:'0 0 24px', lineHeight:1.7 }}>Configura tu app en 3 minutos.<br />Sin tarjeta de crédito requerida.</p>
          <button onClick={onEntrar}
            style={{ background:C.teal, border:'none', borderRadius:14, padding:'14px 32px', color:'#fff', fontSize:16, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 8px 32px ${C.teal}50` }}>
            Empezar ahora — es gratis 🚀
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:C.navy, borderTop:'1px solid #ffffff10', padding:'18px 20px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="route" size={13} color="#fff" />
          </div>
          <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>RutaVentas</span>
        </div>
        <p style={{ fontSize:11, color:C.gray400, margin:0 }}>© 2025 RutaVentas · Gestión de ventas en ruta para LATAM</p>
      </footer>
    </div>
  )
}

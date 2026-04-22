import Icon from '../shared/Icon'

const C = {
  navy: '#0B1929', navyLight: '#1E2F47', teal: '#0FBCAA',
  amber: '#F5A623', green: '#22C55E', gray400: '#94A3B8',
  gray600: '#475569', gray800: '#1E293B',
}

const FEATURES = [
  { icon:'users',    color:'#3B82F6', title:'Gestión de clientes',      desc:'Registra y clasifica tus clientes por tipo y nivel de compra' },
  { icon:'map',      color:C.amber,   title:'Mapa inteligente',         desc:'Visualiza todos tus clientes en un mapa real e interactivo'   },
  { icon:'route',    color:C.teal,    title:'Rutas optimizadas',        desc:'Planifica tus visitas diarias y ahorra tiempo en la calle'    },
  { icon:'dollar',   color:C.green,   title:'Ventas y cobros',          desc:'Registra ventas, pagos y controla deudas fácilmente'          },
  { icon:'chart',    color:'#A78BFA', title:'Analítica completa',       desc:'Dashboard con métricas de rendimiento en tiempo real'         },
  { icon:'pkg',      color:C.teal,    title:'Control de inventario',    desc:'Sabe qué tiene cada tienda y qué necesita reponer'            },
  { icon:'wifi',     color:'#3B82F6', title:'Funciona sin internet',    desc:'Trabaja offline y sincroniza cuando tengas señal'             },
  { icon:'settings', color:'#A78BFA', title:'100% personalizable',      desc:'Configura la app para cualquier rubro o industria'           },
]

const RUBROS = [
  { emoji:'🐾', label:'Mascotas'   },
  { emoji:'🍺', label:'Bebidas'    },
  { emoji:'💊', label:'Farmacia'   },
  { emoji:'🔧', label:'Repuestos'  },
  { emoji:'🌽', label:'Alimentos'  },
  { emoji:'💄', label:'Cosméticos' },
  { emoji:'⚙️', label:'Ferretería' },
  { emoji:'📦', label:'Otro rubro' },
]

export default function LandingScreen({ onEntrar }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })

  return (
    <div style={{ fontFamily:'Nunito, sans-serif', background:'#fff', overflowX:'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:C.navy, borderBottom:'1px solid #ffffff10' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 14px', display:'flex', alignItems:'center', justifyContent:'space-between', height:52 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="route" size={15} color="#fff" />
            </div>
            <span style={{ fontSize:16, fontWeight:900, color:'#fff', whiteSpace:'nowrap' }}>RutaVentas</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => scrollTo('features')}
              style={{ background:'none', border:'none', color:C.gray400, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', display:'var(--nav-btn-display, flex)' }}>
              Funciones
            </button>
            <button onClick={onEntrar}
              style={{ background:C.teal, border:'none', borderRadius:10, padding:'7px 14px', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
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
            Gestiona tus ventas<br />
            <span style={{ color:C.teal }}>en la calle</span> como un pro
          </h1>

          <p style={{ fontSize:'clamp(13px,3.5vw,16px)', color:C.gray400, margin:'0 0 28px', lineHeight:1.7 }}>
            Controla clientes, ventas, cobros, inventario y rutas.<br />
            Funciona offline. Se adapta a cualquier negocio.
          </p>

          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={onEntrar}
              style={{ background:C.teal, border:'none', borderRadius:12, padding:'13px 26px', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 6px 24px ${C.teal}50` }}>
              Comenzar ahora →
            </button>
            <button onClick={() => scrollTo('features')}
              style={{ background:'transparent', border:'1.5px solid #ffffff30', borderRadius:12, padding:'13px 18px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Ver funciones
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginTop:36, maxWidth:320, marginLeft:'auto', marginRight:'auto' }}>
            {[
              ['Gratis',    'Para empezar'      ],
              ['Offline',   'Sin internet'       ],
              ['GPS real',  'Clientes cercanos'  ],
              ['Inventario','Control por tienda' ],
            ].map(([v,l]) => (
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
          <p style={{ fontSize:14, color:C.gray600, margin:'0 0 28px', lineHeight:1.6 }}>
            Configura la app en 3 minutos con tus propios tipos de cliente y categorías de producto.
          </p>
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
      <section id="features" style={{ padding:'44px 16px', background:'#fff' }}>
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
                <div style={{ minWidth:0 }}>
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
              { icon:'users',    color:C.amber,  title:'Registra clientes', desc:'Agrega clientes con GPS. Configura el inventario ideal de cada tienda.' },
              { icon:'dollar',   color:C.green,  title:'Vende y cobra',     desc:'Registra ventas, controla inventarios y ve tus métricas en tiempo real.' },
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

      {/* ── INVENTARIO FEATURE ── */}
      <section style={{ background:'#F8FAFC', padding:'44px 16px' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <p style={{ fontSize:11, fontWeight:800, color:C.teal, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Control de inventario</p>
            <h2 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:900, color:C.gray800, margin:'0 0 10px' }}>
              Sabe exactamente qué necesita cada tienda
            </h2>
            <p style={{ fontSize:14, color:C.gray600, lineHeight:1.7 }}>
              Define el inventario ideal de cada cliente y visualiza al instante qué porcentaje tienen en tienda.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:14 }}>
            {[
              { color:C.green,    icon:'ok_circle', title:'Tienda bien surtida',   desc:'Verde cuando el cliente tiene más del 80% del inventario ideal', pct:92 },
              { color:'#EAB308',  icon:'alert',     title:'Surtido medio',         desc:'Amarillo entre 50-80%. Es momento de visitar y reponer',         pct:60 },
              { color:'#EF4444',  icon:'x_circle',  title:'Necesita restock',      desc:'Rojo cuando tiene menos del 50%. Prioridad de visita',           pct:30 },
            ].map(item => (
              <div key={item.title} style={{ background:'#fff', borderRadius:16, padding:'20px', border:'1px solid #E2E8F0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:item.color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name={item.icon} size={18} color={item.color} />
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:800, color:C.gray800, margin:0 }}>{item.title}</p>
                    <span style={{ fontSize:16, fontWeight:900, color:item.color }}>{item.pct}%</span>
                  </div>
                </div>
                <div style={{ height:8, background:'#F1F5F9', borderRadius:4, overflow:'hidden', marginBottom:8 }}>
                  <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:4 }} />
                </div>
                <p style={{ fontSize:12, color:C.gray600, margin:0, lineHeight:1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, padding:'56px 20px', textAlign:'center' }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <div style={{ width:64, height:64, borderRadius:18, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:`0 8px 32px ${C.teal}55` }}>
            <Icon name="route" size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:900, color:'#fff', margin:'0 0 12px' }}>
            ¿Listo para vender mejor?
          </h2>
          <p style={{ fontSize:14, color:C.gray400, margin:'0 0 24px', lineHeight:1.7 }}>
            Configura tu app en 3 minutos.<br />Sin tarjeta de crédito requerida.
          </p>
          <button onClick={onEntrar}
            style={{ background:C.teal, border:'none', borderRadius:14, padding:'14px 32px', color:'#fff', fontSize:16, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 8px 32px ${C.teal}50` }}>
            Empezar ahora 🚀
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

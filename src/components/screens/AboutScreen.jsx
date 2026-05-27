/**
 * AboutScreen.jsx — Info de la app
 * Auditado: datos reales de config y Firebase
 */
import { C } from '../../constants/colors'
import { useConfig } from '../../context/ConfigContext'
import { useAppData } from '../../hooks/useAppData'
import { auth } from '../../../firebase/firebase.config'
import Icon from '../shared/Icon'
import TopBar from '../shared/TopBar'

const VERSION = '1.2.0'

export default function AboutScreen({ onBack }) {
  const { config }                      = useConfig()
  const { clientes, ventas, productos, visitas } = useAppData()
  const user = auth.currentUser

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:11, fontWeight:800, color:C.gray400, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
        {title}
      </p>
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${C.gray200}`, overflow:'hidden' }}>
        {children}
      </div>
    </div>
  )

  const Row = ({ icon, label, value, last = false }) => (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:last?'none':`1px solid ${C.gray100}` }}>
      <div style={{ width:34, height:34, borderRadius:9, background:C.teal+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon name={icon} size={16} color={C.teal} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{label}</p>
        <p style={{ fontSize:13, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {value}
        </p>
      </div>
    </div>
  )

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Acerca de" onBack={onBack} />

      {/* Hero */}
      <div style={{ background:C.navy, padding:'24px 20px 32px', textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:24, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:`0 8px 32px ${C.teal}55` }}>
          <Icon name="route" size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', margin:0 }}>RutaVentas</h1>
        <p style={{ fontSize:13, color:C.gray400, margin:'6px 0 12px' }}>
          {config.empresa?.nombre || 'Gestión de ventas en ruta'}
        </p>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#ffffff15', borderRadius:20, padding:'6px 14px' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:C.green }} />
          <span style={{ fontSize:12, color:'#fff', fontWeight:700 }}>Versión {VERSION} · Activa</span>
        </div>
      </div>

      <div style={{ padding:16 }}>

        {/* Tu cuenta */}
        <Section title="Tu cuenta">
          <Row icon="users"    label="Usuario"   value={user?.displayName || user?.email?.split('@')[0] || 'Usuario'} />
          <Row icon="globe"    label="Email"     value={user?.email || '—'} />
          <Row icon="dollar"   label="Moneda"    value={config.empresa?.moneda || 'USD'} last />
        </Section>

        {/* Tu empresa */}
        <Section title="Tu empresa">
          <Row icon="activity" label="Nombre"    value={config.empresa?.nombre || '—'} />
          <Row icon="settings" label="Rubro"     value={config.empresa?.rubro  || '—'} last />
        </Section>

        {/* Estadísticas reales */}
        <Section title="Resumen de tu actividad">
          <Row icon="users"    label="Clientes registrados"  value={`${clientes.length} clientes`} />
          <Row icon="dollar"   label="Ventas registradas"    value={`${ventas.length} ventas`} />
          <Row icon="pkg"      label="Productos en catálogo" value={`${productos.length} productos`} />
          <Row icon="calendar" label="Visitas registradas"   value={`${visitas.length} visitas`} last />
        </Section>

        {/* Tipos configurados */}
        {config.tiposCliente.length > 0 && (
          <Section title="Tipos de cliente configurados">
            {config.tiposCliente.map((t, i) => (
              <div key={t.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<config.tiposCliente.length-1?`1px solid ${C.gray100}`:'none' }}>
                <div style={{ width:34, height:34, borderRadius:9, background:t.color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={t.icon} size={16} color={t.color} />
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:t.color }}>{t.label}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Categorías */}
        {config.categoriasProducto.length > 0 && (
          <Section title="Categorías de producto">
            {config.categoriasProducto.map((cat, i) => (
              <div key={cat.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<config.categoriasProducto.length-1?`1px solid ${C.gray100}`:'none' }}>
                <div style={{ width:34, height:34, borderRadius:9, background:cat.color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={cat.icon} size={16} color={cat.color} />
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:cat.color }}>{cat.label}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Info técnica */}
        <Section title="Información técnica">
          <Row icon="zap"      label="Versión"       value={VERSION} />
          <Row icon="globe"    label="Plataforma"    value="Web PWA — Instalable" />
          <Row icon="activity" label="Base de datos" value="Firebase Firestore" />
          <Row icon="map"      label="Mapas"         value="OpenStreetMap (gratis)" />
          <Row icon="wifi"     label="Modo offline"  value="Sí — Service Worker" last />
        </Section>

        <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
          <p style={{ fontSize:12, color:C.gray400 }}>React · Firebase · OpenStreetMap · Vite</p>
          <p style={{ fontSize:12, color:C.gray400, marginTop:4 }}>© 2025 RutaVentas · Todos los derechos reservados</p>
        </div>
      </div>

      <div style={{ height:90 }} />
    </div>
  )
}

import { C } from '../../constants/colors'
import { useConfig } from '../../context/ConfigContext'
import Icon from '../shared/Icon'
import TopBar from '../shared/TopBar'

const VERSION = '1.0.0'

export default function AboutScreen({ onBack }) {
  const { config } = useConfig()

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        {title}
      </p>
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.gray200}`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )

  const Row = ({ icon, label, value, color = C.gray800, last = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: last ? 'none' : `1px solid ${C.gray100}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} color={C.teal} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: C.gray400, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color, margin: 0 }}>{value}</p>
      </div>
    </div>
  )

  const Feature = ({ icon, title, desc, color }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${C.gray100}` }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={19} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.gray800, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: C.gray400, margin: '2px 0 0' }}>{desc}</p>
      </div>
    </div>
  )

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar title="Acerca de la app" onBack={onBack} />

      {/* Hero */}
      <div style={{ background: C.navy, padding: '24px 20px 32px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 32px ${C.teal}55` }}>
          <Icon name="route" size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>
          {config.empresa.nombre}
        </h1>
        <p style={{ fontSize: 14, color: C.gray400, margin: '6px 0 0' }}>
          {config.empresa.rubro}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff15', borderRadius: 20, padding: '6px 14px', marginTop: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>Versión {VERSION} · Activa</span>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* Info de la empresa */}
        <Section title="Tu empresa">
          <Row icon="users"    label="Nombre"  value={config.empresa.nombre} />
          <Row icon="activity" label="Rubro"   value={config.empresa.rubro} />
          <Row icon="dollar"   label="Moneda"  value={config.empresa.moneda} />
          <Row icon="pkg"      label="Tipos de cliente"    value={`${config.tiposCliente.length} tipos configurados`} />
          <Row icon="shopping" label="Categorías de producto" value={`${config.categoriasProducto.length} categorías`} last />
        </Section>

        {/* Funcionalidades */}
        <Section title="Funcionalidades">
          <Feature icon="users"    color="#3B82F6" title="Gestión de clientes"    desc="Registro, clasificación y seguimiento de tus clientes" />
          <Feature icon="map"      color={C.amber}  title="Mapa inteligente"       desc="Visualiza clientes en mapa real con OpenStreetMap" />
          <Feature icon="route"    color={C.teal}   title="Rutas optimizadas"      desc="Planifica tus visitas diarias por zona" />
          <Feature icon="dollar"   color={C.green}  title="Ventas y cobros"        desc="Registra ventas, pagos y controla deudas" />
          <Feature icon="chart"    color="#A78BFA"  title="Analítica"              desc="Dashboard con métricas de rendimiento" />
          <Feature icon="target"   color={C.red}    title="GPS y cercanos"         desc="Detecta clientes cerca de tu ubicación actual" />
          <Feature icon="wifi"     color={C.teal}   title="Modo offline"           desc="Trabaja sin internet y sincroniza después" />
          <Feature icon="calendar" color={C.amber}  title="Historial de visitas"   desc="Registro completo de visitas y conversiones" last />
        </Section>

        {/* Info técnica */}
        <Section title="Información técnica">
          <Row icon="zap"      label="Versión"       value={VERSION} />
          <Row icon="globe"    label="Plataforma"    value="Web PWA — Instalable" />
          <Row icon="activity" label="Base de datos" value="Firebase Firestore" />
          <Row icon="map"      label="Mapas"         value="OpenStreetMap (gratis)" />
          <Row icon="wifi"     label="Offline"       value="Sí — Service Worker" last />
        </Section>

        {/* Tipos configurados */}
        <Section title="Tipos de cliente configurados">
          {config.tiposCliente.map((t, i) => (
            <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < config.tiposCliente.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={t.icon} size={18} color={t.color} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.label}</span>
            </div>
          ))}
        </Section>

        {/* Categorías configuradas */}
        <Section title="Categorías de producto configuradas">
          {config.categoriasProducto.map((cat, i) => (
            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < config.categoriasProducto.length - 1 ? `1px solid ${C.gray100}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={cat.icon} size={18} color={cat.color} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.label}</span>
            </div>
          ))}
        </Section>

        {/* Créditos */}
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <p style={{ fontSize: 12, color: C.gray400 }}>
            Construido con React · Firebase · OpenStreetMap
          </p>
          <p style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>
            © 2025 — Todos los derechos reservados
          </p>
        </div>
      </div>

      <div style={{ height: 90 }} />
    </div>
  )
}

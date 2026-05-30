/**
 * Sidebar.jsx — Navegación lateral para desktop
 * Se muestra en pantallas >= 768px
 */
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { auth } from '../../../firebase/firebase.config'
import { fmtUSD, sumVentas, sumDeuda, iniciales } from '../../utils/helpers'
import Icon from './Icon'
import Avatar from './Avatar'

const NAV_ITEMS = [
  { key:'dashboard', icon:'home',     label:'Inicio'       },
  { key:'clients',   icon:'users',    label:'Clientes'     },
  { key:'map',       icon:'map',      label:'Mapa'         },
  { key:'analytics', icon:'chart',    label:'Analítica'    },
  { key:'products',  icon:'pkg',      label:'Catálogo'     },
  { key:'payments',  icon:'card',     label:'Cobros'       },
  { key:'routes',    icon:'route',    label:'Rutas'        },
  { key:'visits',    icon:'calendar', label:'Visitas'      },
  { key:'admin',     icon:'settings', label:'Administración'},
]

export default function Sidebar({ current, onChange, onLogout }) {
  const { clientes, ventas } = useAppData()
  const { config }           = useConfig()
  const user    = auth.currentUser
  const nombre  = user?.displayName || user?.email?.split('@')[0] || 'Usuario'
  const avatar  = iniciales(nombre)
  const empresa = config.empresa?.nombre || 'RutaVentas'
  const total   = sumVentas(ventas)
  const deuda   = sumDeuda(clientes)

  return (
    <aside style={{
      width:          240,
      minHeight:      '100vh',
      background:     C.navy,
      display:        'flex',
      flexDirection:  'column',
      borderRight:    '1px solid #ffffff10',
      flexShrink:     0,
      position:       'sticky',
      top:            0,
      height:         '100vh',
      overflowY:      'auto',
    }}>

      {/* Logo */}
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid #ffffff10' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon name="route" size={20} color="#fff" />
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:15, fontWeight:900, color:'#fff', margin:0 }}>RutaVentas</p>
            <p style={{ fontSize:11, color:C.teal, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{empresa}</p>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div style={{ background:'#ffffff10', borderRadius:10, padding:'8px 10px' }}>
            <p style={{ fontSize:11, color:C.teal, fontWeight:900, margin:0 }}>{fmtUSD(total)}</p>
            <p style={{ fontSize:10, color:C.gray400, margin:0 }}>Ventas</p>
          </div>
          <div style={{ background:'#ffffff10', borderRadius:10, padding:'8px 10px' }}>
            <p style={{ fontSize:11, color:deuda > 0 ? '#EF4444' : C.green, fontWeight:900, margin:0 }}>{fmtUSD(deuda)}</p>
            <p style={{ fontSize:10, color:C.gray400, margin:0 }}>Deuda</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex:1, padding:'10px 10px 0' }}>
        {NAV_ITEMS.map(item => {
          const isActive = current === item.key
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              style={{
                width:          '100%',
                display:        'flex',
                alignItems:     'center',
                gap:            10,
                padding:        '10px 12px',
                borderRadius:   12,
                border:         'none',
                background:     isActive ? C.teal + '20' : 'transparent',
                cursor:         'pointer',
                marginBottom:   4,
                fontFamily:     'inherit',
                textAlign:      'left',
                transition:     'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#ffffff08' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width:          34,
                height:         34,
                borderRadius:   9,
                background:     isActive ? C.teal + '30' : '#ffffff10',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}>
                <Icon name={item.icon} size={17} color={isActive ? C.teal : C.gray400} />
              </div>
              <span style={{
                fontSize:   13,
                fontWeight: isActive ? 800 : 500,
                color:      isActive ? C.teal : '#cbd5e1',
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{ marginLeft:'auto', width:4, height:20, borderRadius:2, background:C.teal }} />
              )}
            </button>
          )
        })}

        {/* Acción rápida */}
        <div style={{ padding:'10px 0' }}>
          <button
            onClick={() => onChange('addSale')}
            style={{
              width:          '100%',
              padding:        '11px 14px',
              borderRadius:   12,
              border:         'none',
              background:     C.teal,
              color:          '#fff',
              fontSize:       13,
              fontWeight:     800,
              cursor:         'pointer',
              fontFamily:     'inherit',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
            }}>
            <Icon name="plus" size={16} color="#fff" />
            Nueva venta
          </button>
        </div>
      </nav>

      {/* Perfil y logout */}
      <div style={{ padding:'12px 10px', borderTop:'1px solid #ffffff10' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <Avatar initials={avatar} size={36} />
          <div style={{ minWidth:0, flex:1 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#fff', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nombre}</p>
            <p style={{ fontSize:10, color:C.gray400, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width:          '100%',
            padding:        '8px',
            borderRadius:   10,
            border:         '1px solid #ffffff15',
            background:     'transparent',
            color:          C.gray400,
            fontSize:       12,
            fontWeight:     600,
            cursor:         'pointer',
            fontFamily:     'inherit',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            6,
          }}>
          <Icon name="logout" size={14} color={C.gray400} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

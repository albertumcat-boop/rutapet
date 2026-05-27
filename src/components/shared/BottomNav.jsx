/**
 * BottomNav.jsx — Navegación inferior
 * Auditado: safe area iPhone, accesibilidad
 */
import { C } from '../../constants/colors'
import Icon from './Icon'

const TABS = [
  { key:'dashboard', icon:'home',  label:'Inicio'    },
  { key:'clients',   icon:'users', label:'Clientes'  },
  { key:'map',       icon:'map',   label:'Mapa'      },
  { key:'analytics', icon:'chart', label:'Analítica' },
  { key:'more',      icon:'menu',  label:'Más'       },
]

export default function BottomNav({ current, onChange }) {
  return (
    <div style={{
      position: 'fixed',
      bottom:   0,
      left:     0,
      right:    0,
      background:   '#fff',
      borderTop:    `1px solid ${C.gray200}`,
      display:      'flex',
      zIndex:       100,
      paddingBottom:'env(safe-area-inset-bottom, 0px)',
    }}>
      {TABS.map(t => {
        const isActive = current === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            aria-label={t.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex:        1,
              padding:     '10px 0 8px',
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              display:     'flex',
              flexDirection:'column',
              alignItems:  'center',
              gap:         3,
              fontFamily:  'inherit',
              WebkitTapHighlightColor: 'transparent',
            }}>
            <Icon
              name={t.icon}
              size={22}
              color={isActive ? C.teal : C.gray400}
            />
            <span style={{
              fontSize:   10,
              fontWeight: isActive ? 700 : 400,
              color:      isActive ? C.teal : C.gray400,
            }}>
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

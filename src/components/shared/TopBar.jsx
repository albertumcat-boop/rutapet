/**
 * TopBar.jsx — Barra de navegación superior
 * Auditado: accesibilidad, overflow en títulos largos
 */
import { C } from '../../constants/colors'
import Icon from './Icon'

export default function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      background:  C.navy,
      padding:     '14px 16px',
      display:     'flex',
      alignItems:  'center',
      gap:         10,
      color:       '#fff',
      position:    'sticky',
      top:         0,
      zIndex:      20,
      minHeight:   52,
    }}>
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Volver"
          style={{
            background: 'none',
            border:     'none',
            color:      '#fff',
            cursor:     'pointer',
            display:    'flex',
            padding:    4,
            flexShrink: 0,
            WebkitTapHighlightColor:'transparent',
          }}>
          <Icon name="back" size={22} color="#fff" />
        </button>
      )}

      <h1 style={{
        fontSize:     16,
        fontWeight:   800,
        flex:         1,
        margin:       0,
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        whiteSpace:   'nowrap',
      }}>
        {title}
      </h1>

      {right && (
        <div style={{ flexShrink:0 }}>
          {right}
        </div>
      )}
    </div>
  )
}

/**
 * Button.jsx — Botón reutilizable
 * Auditado: accesibilidad, variantes, disabled state
 */
import { C } from '../../constants/colors'
import Icon from './Icon'

const VARIANTS = {
  primary:   { background:C.teal,     color:'#fff',    border:'none'                      },
  secondary: { background:'transparent', color:C.teal, border:`1.5px solid ${C.teal}`     },
  ghost:     { background:C.gray100,  color:C.gray800,  border:'none'                     },
  danger:    { background:C.red,      color:'#fff',    border:'none'                      },
  amber:     { background:C.amber,    color:'#fff',    border:'none'                      },
}

const SIZES = {
  sm: { padding:'6px 12px',  fontSize:12, gap:5  },
  md: { padding:'10px 18px', fontSize:14, gap:6  },
  lg: { padding:'13px 24px', fontSize:15, gap:8  },
}

export default function Button({
  children, onClick, variant='primary', size='md',
  icon, disabled=false, fullWidth=false, style:s={},
}) {
  const v        = VARIANTS[variant] || VARIANTS.primary
  const sz       = SIZES[size]       || SIZES.md
  const iconColor = (variant === 'primary' || variant === 'danger' || variant === 'amber')
    ? '#fff' : C.teal

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      style={{
        ...v,
        padding:    sz.padding,
        fontSize:   sz.fontSize,
        borderRadius: 12,
        fontWeight:  700,
        cursor:      disabled ? 'not-allowed' : 'pointer',
        opacity:     disabled ? 0.5 : 1,
        display:     'inline-flex',
        alignItems:  'center',
        gap:         sz.gap,
        fontFamily:  'inherit',
        width:       fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        transition:  'opacity 0.15s',
        ...s,
      }}>
      {icon && <Icon name={icon} size={sz.fontSize + 1} color={iconColor} />}
      {children}
    </button>
  )
}

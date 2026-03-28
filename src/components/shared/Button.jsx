import { C } from '../../constants/colors'
import Icon from './Icon'

const VARIANTS = {
  primary:   { background: C.teal,        color: '#fff',    border: 'none' },
  secondary: { background: 'transparent', color: C.teal,    border: `1.5px solid ${C.teal}` },
  ghost:     { background: C.gray100,     color: C.gray800, border: 'none' },
  danger:    { background: C.red,         color: '#fff',    border: 'none' },
  amber:     { background: C.amber,       color: '#fff',    border: 'none' },
}

const SIZES = {
  sm: { padding: '6px 12px',  fontSize: 12 },
  md: { padding: '10px 18px', fontSize: 14 },
  lg: { padding: '13px 24px', fontSize: 15 },
}

export default function Button({ children, onClick, variant='primary', size='md', icon, disabled=false, fullWidth=false, style: s={} }) {
  const iconColor = (variant === 'primary' || variant === 'danger' || variant === 'amber') ? '#fff' : C.teal
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        ...VARIANTS[variant], ...SIZES[size],
        borderRadius: 12, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'inherit',
        width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        ...s,
      }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} color={iconColor} />}
      {children}
    </button>
  )
}

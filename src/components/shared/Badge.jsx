/**
 * Card.jsx — Tarjeta contenedora reutilizable
 */
import { C } from '../../constants/colors'

export default function Card({ children, onClick, style: s = {} }) {
  const isClickable = typeof onClick === 'function'
  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      style={{
        background:   '#fff',
        borderRadius: 16,
        padding:      '14px',
        marginBottom: 10,
        border:       `1px solid ${C.gray200}`,
        cursor:       isClickable ? 'pointer' : 'default',
        transition:   'box-shadow 0.15s',
        WebkitTapHighlightColor: 'transparent',
        ...s,
      }}
    >
      {children}
    </div>
  )
}

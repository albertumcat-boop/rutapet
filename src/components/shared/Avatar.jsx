/**
 * Avatar.jsx — Avatar con iniciales
 * Auditado: fallback si no hay initials
 */
export default function Avatar({ initials = '?', size = 40, bg = '#0FBCAA', style: s = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width:          size,
        height:         size,
        borderRadius:   size * 0.35,
        background:     bg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        ...s,
      }}
    >
      <span style={{
        fontSize:   size * 0.38,
        fontWeight: 900,
        color:      '#fff',
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {String(initials).slice(0, 2).toUpperCase() || '?'}
      </span>
    </div>
  )
}

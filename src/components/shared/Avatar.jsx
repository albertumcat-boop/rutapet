import { C } from '../../constants/colors'

export default function Avatar({ initials = '?', size = 40, bg = C.teal }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg + '25',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.34, fontWeight: 800, color: bg }}>
        {initials}
      </span>
    </div>
  )
}

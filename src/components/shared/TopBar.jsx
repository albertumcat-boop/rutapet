import { C } from '../../constants/colors'
import Icon from './Icon'

export default function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      background: C.navy, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      color: '#fff', position: 'sticky', top: 0, zIndex: 20,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <Icon name="back" size={22} color="#fff" />
        </button>
      )}
      <h1 style={{ fontSize: 17, fontWeight: 800, flex: 1, margin: 0 }}>{title}</h1>
      {right}
    </div>
  )
}

/**
 * NetworkBanner.jsx
 * Banner fijo en la parte superior que avisa cuando no hay conexión
 * y confirma cuando se restaura.
 */
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import Icon from './Icon'

export default function NetworkBanner() {
  const { isOnline, wasOffline } = useNetworkStatus()

  // Online y nunca ha estado offline → no mostrar nada
  if (isOnline && !wasOffline) return null

  const offline = {
    bg:   '#1E293B',
    icon: 'wifi_off',
    color:'#F87171',
    text: 'Sin conexión — los cambios se guardarán cuando vuelva la red',
  }
  const online = {
    bg:   '#14532D',
    icon: 'wifi',
    color:'#4ADE80',
    text: 'Conexión restaurada',
  }

  const cfg = isOnline ? online : offline

  return (
    <div style={{
      position:       'fixed',
      top:            0,
      left:           0,
      right:          0,
      zIndex:         9999,
      background:     cfg.bg,
      color:          '#fff',
      fontSize:       13,
      fontWeight:     600,
      padding:        '8px 16px',
      display:        'flex',
      alignItems:     'center',
      gap:            8,
      justifyContent: 'center',
      boxShadow:      '0 2px 8px #0004',
      transition:     'background 0.3s',
    }}>
      <Icon name={cfg.icon} size={16} color={cfg.color} />
      <span style={{ color: cfg.color }}>{cfg.text}</span>
    </div>
  )
}

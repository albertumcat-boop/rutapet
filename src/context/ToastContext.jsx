import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { C } from '../constants/colors'
import Icon from '../components/shared/Icon'

const ToastCtx = createContext(null)

const TYPES = {
  success: { bg: '#DCFCE7', txt: '#166534', border: '#86EFAC', icon: 'ok_circle',  iconColor: '#22C55E' },
  error:   { bg: '#FEE2E2', txt: '#991B1B', border: '#FCA5A5', icon: 'x_circle',   iconColor: '#EF4444' },
  warning: { bg: '#FEF9C3', txt: '#854D0E', border: '#FDE047', icon: 'alert',      iconColor: '#EAB308' },
  info:    { bg: '#EFF6FF', txt: '#1E40AF', border: '#93C5FD', icon: 'bell',       iconColor: '#3B82F6' },
  expiry:  { bg: '#FFF7ED', txt: '#9A3412', border: '#FDBA74', icon: 'calendar',   iconColor: '#F97316' },
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter
    setToasts(prev => [...prev.slice(-4), { id, message, type }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast])
  const error   = useCallback((msg, dur) => toast(msg, 'error',   dur ?? 5000), [toast])
  const warning = useCallback((msg, dur) => toast(msg, 'warning', dur), [toast])
  const info    = useCallback((msg, dur) => toast(msg, 'info',    dur), [toast])
  const expiry  = useCallback((msg, dur) => toast(msg, 'expiry',  dur ?? 6000), [toast])

  return (
    <ToastCtx.Provider value={{ toast, success, error, warning, info, expiry }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div style={{
      position:   'fixed',
      top:        16,
      right:      16,
      left:       16,
      zIndex:     9999,
      display:    'flex',
      flexDirection: 'column',
      gap:        8,
      pointerEvents: 'none',
      maxWidth:   400,
      margin:     '0 auto',
    }}>
      {toasts.map(t => {
        const s = TYPES[t.type] || TYPES.info
        return (
          <div key={t.id}
            style={{
              background:    s.bg,
              border:        `1.5px solid ${s.border}`,
              borderRadius:  14,
              padding:       '12px 14px',
              display:       'flex',
              alignItems:    'flex-start',
              gap:           10,
              boxShadow:     '0 4px 20px rgba(0,0,0,0.12)',
              pointerEvents: 'all',
              animation:     'fadeIn 0.2s ease',
            }}>
            <Icon name={s.icon} size={18} color={s.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.txt, lineHeight: 1.5 }}>
              {t.message}
            </span>
            <button onClick={() => onDismiss(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
              <Icon name="close" size={14} color={s.txt} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

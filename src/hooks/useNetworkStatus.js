/**
 * useNetworkStatus.js
 * Detecta si el navegador está online/offline en tiempo real.
 * Retorna { isOnline, wasOffline } para mostrar banners de reconexión.
 */
import { useState, useEffect, useRef } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline]     = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      // Ocultar el banner "reconectado" después de 3 s
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setWasOffline(false), 3000)
    }
    const goOffline = () => {
      setIsOnline(false)
      setWasOffline(false)
      clearTimeout(timerRef.current)
    }

    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
      clearTimeout(timerRef.current)
    }
  }, [])

  return { isOnline, wasOffline }
}

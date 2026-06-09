/**
 * usePushNotifications.js
 * Solicita permiso de notificaciones al iniciar sesión y
 * guarda el token FCM en Firestore.
 *
 * También expone `notificarStockBajo` para disparar alertas locales
 * cuando se detectan productos con stock crítico.
 */
import { useEffect, useRef } from 'react'
import { auth } from '../../firebase/firebase.config'
import {
  solicitarPermisoPush,
  guardarTokenFCM,
  enviarNotificacionLocal,
} from '../services/notifications'

export function usePushNotifications() {
  const iniciadoRef = useRef(false)

  useEffect(() => {
    // Solo pedir una vez por sesión
    if (iniciadoRef.current) return
    iniciadoRef.current = true

    const uid = auth.currentUser?.uid
    if (!uid) return

    solicitarPermisoPush()
      .then(token => { if (token) guardarTokenFCM(token, uid) })
      .catch(() => {}) // silencioso — no bloquear la app
  }, [])

  /**
   * Envía notificación local de stock bajo.
   * @param {Array} productos — lista de productos con stock crítico
   */
  function notificarStockBajo(productos) {
    if (!productos?.length) return
    if (Notification.permission !== 'granted') return

    if (productos.length === 1) {
      enviarNotificacionLocal(
        '⚠️ Stock bajo',
        `${productos[0].nombre}: solo ${productos[0].stock ?? 0} unidades`,
      )
    } else {
      enviarNotificacionLocal(
        `⚠️ ${productos.length} productos con stock bajo`,
        productos.slice(0, 3).map(p => p.nombre).join(', ') +
          (productos.length > 3 ? ` y ${productos.length - 3} más` : ''),
      )
    }
  }

  return { notificarStockBajo }
}

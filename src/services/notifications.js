/**
 * notifications.js — Servicio de notificaciones push (FCM)
 *
 * Uso:
 *   import { solicitarPermisoPush, enviarNotificacionLocal } from './notifications'
 *
 *   // Al iniciar sesión:
 *   const token = await solicitarPermisoPush()
 *   if (token) await guardarTokenFCM(token, uid)
 *
 *   // Para notificar algo localmente (sin servidor):
 *   enviarNotificacionLocal('Stock bajo', 'Amoxicilina tiene solo 2 unidades')
 */
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { db } from '../../firebase/firebase.config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import app from '../../firebase/firebase.config'

// VAPID key pública — se obtiene en Firebase Console > Cloud Messaging > Web Push certificates
// Reemplaza este valor con el de tu proyecto:
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? ''

let messaging = null

function getMsg() {
  if (!messaging) {
    try { messaging = getMessaging(app) } catch { return null }
  }
  return messaging
}

/**
 * Solicita permiso para notificaciones y retorna el FCM token.
 * Retorna null si el usuario lo niega o si no está soportado.
 */
export async function solicitarPermisoPush() {
  if (!('Notification' in window)) return null
  if (!VAPID_KEY) {
    console.warn('[FCM] VITE_FIREBASE_VAPID_KEY no configurada — push desactivado')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    // Registrar el SW de mensajería
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

    // Enviar la config al SW para que pueda inicializar Firebase
    const firebaseConfig = {
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    }
    swReg.active?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig })

    const msg   = getMsg()
    if (!msg) return null
    const token = await getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg })
    return token || null
  } catch (err) {
    console.error('[FCM] Error solicitando permiso:', err)
    return null
  }
}

/**
 * Guarda el FCM token del usuario en Firestore.
 * El admin puede usar estos tokens para enviar push desde Cloud Functions.
 */
export async function guardarTokenFCM(token, uid) {
  if (!token || !uid) return
  try {
    await setDoc(
      doc(db, 'usuarios', uid),
      { fcmToken: token, fcmTokenAt: serverTimestamp() },
      { merge: true }
    )
  } catch (err) {
    console.error('[FCM] Error guardando token:', err)
  }
}

/**
 * Escucha notificaciones cuando la app está en primer plano.
 * Retorna la función de limpieza (unsubscribe).
 */
export function escucharPushForeground(callback) {
  const msg = getMsg()
  if (!msg) return () => {}
  return onMessage(msg, (payload) => {
    callback?.(payload)
    // También mostrar notificación nativa si el usuario la tiene activada
    const { title, body } = payload.notification ?? {}
    if (Notification.permission === 'granted' && title) {
      new Notification(title, {
        body:  body  || '',
        icon:  '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
      })
    }
  })
}

/**
 * Envía una notificación LOCAL (sin servidor) usando la Notifications API.
 * Útil para alertas de stock bajo detectadas en el cliente.
 */
export function enviarNotificacionLocal(titulo, cuerpo, opciones = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(titulo, {
    body:  cuerpo,
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    ...opciones,
  })
}

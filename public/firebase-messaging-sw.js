/**
 * firebase-messaging-sw.js
 * Service Worker para notificaciones push en background (FCM).
 * Este archivo DEBE estar en /public (raíz del dominio).
 *
 * La config de Firebase se incrusta aquí directamente porque los Service Workers
 * no tienen acceso a import.meta.env (se sirven como archivos estáticos).
 * Las claves de Firebase del lado cliente NO son secretas — se envían al navegador
 * de todas formas y son públicamente visibles. Nunca incluir Service Account Keys.
 */
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js')

// La app principal envía la config via postMessage al activarse el SW.
// Guardamos la config para inicializar Firebase cuando llegue.
let firebaseInitialized = false

function tryInit(config) {
  if (firebaseInitialized || !config) return
  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(config)
    }
    const messaging = firebase.messaging()
    messaging.onBackgroundMessage((payload) => {
      const { title, body, icon } = payload.notification ?? {}
      self.registration.showNotification(title || 'VetRuta', {
        body:    body  || '',
        icon:    icon  || '/icons/icon-192.png',
        badge:   '/icons/icon-192.png',
        data:    payload.data ?? {},
        vibrate: [200, 100, 200],
      })
    })
    firebaseInitialized = true
  } catch (err) {
    console.error('[SW] Error inicializando Firebase:', err)
  }
}

// Recibe config de la app principal
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    tryInit(event.data.config)
  }
})

// Cuando el SW toma control, pide la config a todos los clientes activos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'REQUEST_FIREBASE_CONFIG' }))
    })
  )
})

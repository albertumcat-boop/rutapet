/**
 * firebase-messaging-sw.js
 * Service Worker para notificaciones push en background (FCM)
 * Este archivo DEBE estar en /public (raíz del dominio).
 */
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js')

// La config pública va aquí (no es secreta — es la misma que el cliente)
// Se inyecta en tiempo de build via __FIREBASE_CONFIG__ o se hardcodea.
// Para no exponer keys en el repo, leemos del meta del documento si está disponible,
// o usamos los valores que el admin configura al instalar la app.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(event.data.config)
    }
    const messaging = firebase.messaging()

    messaging.onBackgroundMessage((payload) => {
      const { title, body, icon } = payload.notification ?? {}
      self.registration.showNotification(title || 'VetRuta', {
        body:  body  || '',
        icon:  icon  || '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data:  payload.data ?? {},
        vibrate: [200, 100, 200],
      })
    })
  }
})

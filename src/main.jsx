/**
 * main.jsx — Punto de entrada
 * Auditado: StrictMode, providers correctamente anidados
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import { ConfigProvider } from './context/ConfigContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'

const root = document.getElementById('root')

if (!root) {
  throw new Error('No se encontró el elemento #root en index.html')
}

// Verificación de variables de entorno críticas — si faltan en el build de
// producción (ej. no configuradas en el pipeline de hosting/CI), antes
// fallaban en silencio (push notifications desactivadas sin avisar a nadie).
// Ahora se loguea un error visible en consola apenas arranca la app.
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]
const missing = REQUIRED_ENV_VARS.filter(k => !import.meta.env[k])
if (missing.length > 0) {
  console.error(
    `[CONFIG] Faltan variables de entorno críticas: ${missing.join(', ')}. ` +
    `La app puede no funcionar correctamente (login, base de datos). ` +
    `Verifica la configuración de .env.local o las variables del proveedor de hosting.`
  )
}
if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) {
  console.warn('[CONFIG] VITE_FIREBASE_VAPID_KEY no configurada — las notificaciones push estarán desactivadas.')
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <ConfigProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ConfigProvider>
    </ErrorBoundary>
  </StrictMode>
)

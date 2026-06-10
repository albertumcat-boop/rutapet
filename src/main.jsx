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

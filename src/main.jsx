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

const root = document.getElementById('root')

if (!root) {
  throw new Error('No se encontró el elemento #root en index.html')
}

createRoot(root).render(
  <StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </StrictMode>
)

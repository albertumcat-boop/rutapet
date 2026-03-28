import { createContext, useContext, useState, useEffect } from 'react'

// ── Config por defecto (se reemplaza en el onboarding) ──
const DEFAULT_CONFIG = {
  empresa: {
    nombre:  'Mi Empresa',
    rubro:   'Ventas en ruta',
    logo:    null,
    moneda:  'USD',
  },
  tiposCliente: [
    { key: 't1', label: 'Tipo 1', icon: 'users',    color: '#3B82F6' },
    { key: 't2', label: 'Tipo 2', icon: 'shopping', color: '#0FBCAA' },
    { key: 't3', label: 'Tipo 3', icon: 'pkg',      color: '#22C55E' },
  ],
  categoriasProducto: [
    { key: 'c1', label: 'Categoría 1', icon: 'pkg',      color: '#22C55E' },
    { key: 'c2', label: 'Categoría 2', icon: 'pill',     color: '#EF4444' },
    { key: 'c3', label: 'Categoría 3', icon: 'shopping', color: '#A78BFA' },
  ],
  onboardingCompleto: false,
}

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('rutapet_config')
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  })

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('rutapet_config', JSON.stringify(config))
  }, [config])

  const updateConfig = (partial) => {
    setConfig(prev => ({ ...prev, ...partial }))
  }

  const updateEmpresa = (partial) => {
    setConfig(prev => ({ ...prev, empresa: { ...prev.empresa, ...partial } }))
  }

  const completarOnboarding = (data) => {
    setConfig({
      ...data,
      onboardingCompleto: true,
    })
  }

  const resetConfig = () => {
    setConfig({ ...DEFAULT_CONFIG, onboardingCompleto: false })
    localStorage.removeItem('rutapet_config')
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, updateEmpresa, completarOnboarding, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)

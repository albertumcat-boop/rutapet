/**
 * ConfigContext.jsx — Contexto de configuración por tenant
 * Auditado: race conditions, cleanup, manejo de errores
 */
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { auth } from '../../firebase/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase.config'
import { setupUsuarioNuevo } from '../services/setupFirestore'

const DEFAULT_CONFIG = {
  empresa: {
    nombre: '',
    rubro:  '',
    logo:   null,
    moneda: 'USD',
  },
  tiposCliente:       [],
  categoriasProducto: [],
  onboardingCompleto: false,
}

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config,   setConfig]   = useState(DEFAULT_CONFIG)
  const [tenantId, setTenantId] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!mountedRef.current) return

      if (!user) {
        setConfig(DEFAULT_CONFIG)
        setTenantId(null)
        setLoading(false)
        return
      }

      try {
        // Setup automático si es primera vez
        const { tenantId: tid } = await setupUsuarioNuevo(user)
        if (!mountedRef.current) return

        setTenantId(tid)

        // Cargar config desde Firestore
        const configSnap = await getDoc(doc(db, 'config', tid))
        if (!mountedRef.current) return

        if (configSnap.exists()) {
          const data = configSnap.data()
          setConfig({
            empresa: data.empresa || DEFAULT_CONFIG.empresa,
            tiposCliente:       Array.isArray(data.tiposCliente)       ? data.tiposCliente       : [],
            categoriasProducto: Array.isArray(data.categoriasProducto) ? data.categoriasProducto : [],
            onboardingCompleto: Boolean(data.onboardingCompleto),
          })
        } else {
          setConfig(DEFAULT_CONFIG)
        }
      } catch (err) {
        console.error('ConfigContext error:', err)
        if (mountedRef.current) setConfig(DEFAULT_CONFIG)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    })

    return () => {
      mountedRef.current = false
      unsub()
    }
  }, [])

  const guardarEnFirestore = async (newConfig, tid) => {
    const id = tid || tenantId
    if (!id) {
      console.error('guardarEnFirestore: sin tenantId')
      return
    }
    await setDoc(doc(db, 'config', id), {
      ...newConfig,
      tenantId:      id,
      actualizadoEn: serverTimestamp(),
    }, { merge: true })
  }

  const completarOnboarding = async (data) => {
    const newConfig = {
      empresa:            data.empresa            || DEFAULT_CONFIG.empresa,
      tiposCliente:       data.tiposCliente       || [],
      categoriasProducto: data.categoriasProducto || [],
      onboardingCompleto: true,
    }
    setConfig(newConfig)
    await guardarEnFirestore(newConfig)
  }

  const updateEmpresa = async (partial) => {
    const newConfig = {
      ...config,
      empresa: { ...config.empresa, ...partial },
    }
    setConfig(newConfig)
    await guardarEnFirestore(newConfig)
  }

  const resetConfig = async () => {
    const empty = { ...DEFAULT_CONFIG, onboardingCompleto: false }
    setConfig(empty)
    await guardarEnFirestore(empty)
  }

  return (
    <ConfigContext.Provider value={{
      config,
      tenantId,
      loading,
      completarOnboarding,
      updateEmpresa,
      resetConfig,
    }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig debe usarse dentro de ConfigProvider')
  return ctx
}

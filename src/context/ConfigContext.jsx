/**
 * ConfigContext.jsx — Contexto de configuración multi-empresa
 * Soporta: usuario individual (tenantId=uid) y equipo (empresaId)
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
    rubro:  'veterinaria',
    logo:   null,
    moneda: 'USD',
  },
  tiposCliente:       [],
  categoriasProducto: [],
  onboardingCompleto: false,
  comisionPct:        5,   // % de comisión por defecto
}

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config,    setConfig]    = useState(DEFAULT_CONFIG)
  const [tenantId,  setTenantId]  = useState(null)
  const [userRole,  setUserRole]  = useState(null)   // 'admin' | 'vendedor' | null
  const [empresaId, setEmpresaId] = useState(null)   // null = solo, uid = empresa
  const [loading,   setLoading]   = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!mountedRef.current) return

      if (!user) {
        setConfig(DEFAULT_CONFIG)
        setTenantId(null)
        setUserRole(null)
        setEmpresaId(null)
        setLoading(false)
        return
      }

      try {
        const { tenantId: tid } = await setupUsuarioNuevo(user)
        if (!mountedRef.current) return
        setTenantId(tid)

        // Obtener datos del usuario para rol y empresaId
        const userSnap = await getDoc(doc(db, 'usuarios', user.uid))
        if (!mountedRef.current) return

        let rol       = null
        let empId     = null
        let configId  = tid  // por defecto config = uid propio

        if (userSnap.exists()) {
          const userData = userSnap.data()
          rol   = userData.rol       || null
          empId = userData.empresaId || null

          // Si el usuario es vendedor de una empresa, cargar config de la empresa
          if (rol === 'vendedor' && empId) {
            configId = empId
          }
        }

        if (mountedRef.current) {
          setUserRole(rol)
          setEmpresaId(empId)
        }

        // Cargar config desde Firestore (del tenant o empresa)
        const configSnap = await getDoc(doc(db, 'config', configId))
        if (!mountedRef.current) return

        if (configSnap.exists()) {
          const data = configSnap.data()
          setConfig({
            empresa:            data.empresa            || DEFAULT_CONFIG.empresa,
            tiposCliente:       Array.isArray(data.tiposCliente)       ? data.tiposCliente       : [],
            categoriasProducto: Array.isArray(data.categoriasProducto) ? data.categoriasProducto : [],
            onboardingCompleto: Boolean(data.onboardingCompleto),
            comisionPct:        data.comisionPct !== undefined ? Number(data.comisionPct) : 5,
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

  const getConfigId = () => {
    // Admin y solo-user: guardan en su propio uid
    // Vendedor: guarda en empresaId
    if (userRole === 'vendedor' && empresaId) return empresaId
    return tenantId
  }

  const guardarEnFirestore = async (newConfig, tid) => {
    const id = tid || getConfigId()
    if (!id) {
      console.error('guardarEnFirestore: sin configId')
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

  // Actualizar campos sueltos en la config (ej: comisionPct)
  const actualizarConfig = async (partial) => {
    const newConfig = { ...config, ...partial }
    setConfig(newConfig)
    await guardarEnFirestore(newConfig)
  }

  const isAdmin = userRole === 'admin'

  return (
    <ConfigContext.Provider value={{
      config,
      tenantId,
      userRole,
      empresaId,
      isAdmin,
      loading,
      completarOnboarding,
      updateEmpresa,
      resetConfig,
      actualizarConfig,
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

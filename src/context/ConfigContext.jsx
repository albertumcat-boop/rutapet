import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../../firebase/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase.config'
import { setupUsuarioNuevo } from '../services/setupFirestore'

const DEFAULT_CONFIG = {
  empresa: { nombre: '', rubro: '', logo: null, moneda: 'USD' },
  tiposCliente:       [],
  categoriasProducto: [],
  onboardingCompleto: false,
}

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config,   setConfig]   = useState(DEFAULT_CONFIG)
  const [tenantId, setTenantId] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setConfig(DEFAULT_CONFIG)
        setTenantId(null)
        setLoading(false)
        return
      }

      try {
        // Setup automático si es nuevo usuario
        const { tenantId: tid } = await setupUsuarioNuevo(user)
        setTenantId(tid)

        // Cargar config desde Firestore
        const configSnap = await getDoc(doc(db, 'config', tid))
        if (configSnap.exists()) {
          const data = configSnap.data()
          setConfig({
            empresa:            data.empresa            || DEFAULT_CONFIG.empresa,
            tiposCliente:       data.tiposCliente       || [],
            categoriasProducto: data.categoriasProducto || [],
            onboardingCompleto: data.onboardingCompleto || false,
          })
        } else {
          setConfig(DEFAULT_CONFIG)
        }
      } catch (err) {
        console.error('Error en ConfigContext:', err)
        setConfig(DEFAULT_CONFIG)
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  // Guardar config completa en Firestore
  const guardarConfigFirestore = async (newConfig, tid) => {
    const id = tid || tenantId
    if (!id) return
    await setDoc(doc(db, 'config', id), {
      ...newConfig,
      tenantId:      id,
      actualizadoEn: serverTimestamp(),
    }, { merge: true })
  }

  const completarOnboarding = async (data) => {
    const newConfig = { ...data, onboardingCompleto: true }
    setConfig(newConfig)
    await guardarConfigFirestore(newConfig)
  }

  const updateEmpresa = async (partial) => {
    const newConfig = { ...config, empresa: { ...config.empresa, ...partial } }
    setConfig(newConfig)
    await guardarConfigFirestore(newConfig)
  }

  const resetConfig = async () => {
    const empty = { ...DEFAULT_CONFIG, onboardingCompleto: false }
    setConfig(empty)
    await guardarConfigFirestore(empty)
  }

  return (
    <ConfigContext.Provider value={{
      config, tenantId, loading,
      completarOnboarding, updateEmpresa, resetConfig,
    }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)

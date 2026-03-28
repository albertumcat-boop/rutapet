import { useState, useEffect } from 'react'
import { auth } from '../../firebase/firebase.config'
import {
  obtenerClientes,
  obtenerVentas,
  obtenerProductos,
  obtenerVisitas,
  obtenerRutas,
} from '../services/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// ═══════════════════════════════════════════════════
//  Hook central — carga TODOS los datos desde Firebase
//  Reemplaza los imports de constants/data.js
// ═══════════════════════════════════════════════════

let cachedData = null

export function useAppData() {
  const [data,    setData]    = useState(cachedData || {
    clientes:  [],
    ventas:    [],
    productos: [],
    visitas:   [],
    rutas:     [],
  })
  const [loading, setLoading] = useState(!cachedData)
  const [error,   setError]   = useState(null)

  const cargarTodo = async () => {
    setLoading(true)
    setError(null)
    try {
      const [clientes, ventas, productos, visitas, rutas] = await Promise.all([
        obtenerClientes(),
        obtenerVentas(),
        obtenerProductos(),
        obtenerVisitas(),
        obtenerRutas(),
      ])
      const newData = { clientes, ventas, productos, visitas, rutas }
      cachedData = newData
      setData(newData)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        cachedData = null
        cargarTodo()
      } else {
        cachedData = null
        setData({ clientes:[], ventas:[], productos:[], visitas:[], rutas:[] })
      }
    })
    return unsub
  }, [])

  return { ...data, loading, error, recargar: cargarTodo }
}

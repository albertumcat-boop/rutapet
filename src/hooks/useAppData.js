import { useState, useEffect } from 'react'
import { auth } from '../../firebase/firebase.config'
import {
  obtenerClientes,
  obtenerVentas,
  obtenerProductos,
  obtenerVisitas,
  obtenerRutas,
  obtenerTodoInventario,
} from '../services/firestore'
import { onAuthStateChanged } from 'firebase/auth'

let cachedData = null

export function useAppData() {
  const [data,    setData]    = useState(cachedData || {
    clientes:   [],
    ventas:     [],
    productos:  [],
    visitas:    [],
    rutas:      [],
    inventario: [],
  })
  const [loading, setLoading] = useState(!cachedData)
  const [error,   setError]   = useState(null)

  const cargarTodo = async () => {
    setLoading(true)
    setError(null)
    try {
      const [clientes, ventas, productos, visitas, rutas, inventario] = await Promise.all([
        obtenerClientes(),
        obtenerVentas(),
        obtenerProductos(),
        obtenerVisitas(),
        obtenerRutas(),
        obtenerTodoInventario(),
      ])
      const newData = { clientes, ventas, productos, visitas, rutas, inventario }
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
        setData({ clientes:[], ventas:[], productos:[], visitas:[], rutas:[], inventario:[] })
      }
    })
    return unsub
  }, [])

  return { ...data, loading, error, recargar: cargarTodo }
}

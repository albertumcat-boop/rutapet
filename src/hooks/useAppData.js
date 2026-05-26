/**
 * useAppData.js — Hook central de datos
 * Auditado: memory leak, race conditions, cache invalidation
 */
import { useState, useEffect, useRef } from 'react'
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

const EMPTY_DATA = {
  clientes:   [],
  ventas:     [],
  productos:  [],
  visitas:    [],
  rutas:      [],
  inventario: [],
}

// Cache en memoria — se limpia al cambiar de usuario
let cache     = null
let cacheUid  = null

export function useAppData() {
  const [data,    setData]    = useState(cache || EMPTY_DATA)
  const [loading, setLoading] = useState(!cache)
  const [error,   setError]   = useState(null)
  const mountedRef = useRef(true)

  const cargarTodo = async (uid) => {
    if (!mountedRef.current) return
    setLoading(true)
    setError(null)
    try {
      const [clientes, ventas, productos, visitas, rutas, inventario] =
        await Promise.all([
          obtenerClientes(),
          obtenerVentas(),
          obtenerProductos(),
          obtenerVisitas(),
          obtenerRutas(),
          obtenerTodoInventario(),
        ])

      if (!mountedRef.current) return

      const newData = { clientes, ventas, productos, visitas, rutas, inventario }
      cache    = newData
      cacheUid = uid
      setData(newData)
    } catch (err) {
      if (!mountedRef.current) return
      console.error('useAppData error:', err)
      setError(err.message || 'Error cargando datos')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!mountedRef.current) return

      if (user) {
        // Si el usuario cambió, limpiar cache del usuario anterior
        if (cacheUid && cacheUid !== user.uid) {
          cache    = null
          cacheUid = null
        }
        // Usar cache si es del mismo usuario
        if (cache && cacheUid === user.uid) {
          setData(cache)
          setLoading(false)
        } else {
          cargarTodo(user.uid)
        }
      } else {
        cache    = null
        cacheUid = null
        setData(EMPTY_DATA)
        setLoading(false)
      }
    })

    return () => {
      mountedRef.current = false
      unsub()
    }
  }, [])

  const recargar = async () => {
    cache    = null
    cacheUid = null
    const user = auth.currentUser
    if (user) await cargarTodo(user.uid)
  }

  return { ...data, loading, error, recargar }
}

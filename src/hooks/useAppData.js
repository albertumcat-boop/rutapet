/**
 * useAppData.js — Hook central de datos
 * Fase 4: Admin ve datos consolidados de todo el equipo
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
  obtenerMiembrosEquipo,
  obtenerClientesPorVendedor,
  obtenerVentasPorVendedor,
  obtenerVisitasPorVendedor,
  obtenerUsuario,
} from '../services/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const EMPTY_DATA = {
  clientes:   [],
  ventas:     [],
  productos:  [],
  visitas:    [],
  rutas:      [],
  inventario: [],
  equipo:     [],   // miembros del equipo (solo admin)
}

// Cache en memoria — se limpia al cambiar de usuario
let cache     = null
let cacheUid  = null

function uniq(arr, key = 'id') {
  const seen = new Set()
  return arr.filter(item => {
    if (seen.has(item[key])) return false
    seen.add(item[key])
    return true
  })
}

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
      // Cargar datos propios
      const [clientes, ventas, productos, visitas, rutas, inventario] =
        await Promise.all([
          obtenerClientes(),
          obtenerVentas(),
          obtenerProductos(),
          obtenerVisitas(),
          obtenerRutas(),
          obtenerTodoInventario(),
        ])

      let todosClientes  = clientes
      let todasVentas    = ventas
      let todasVisitas   = visitas
      let equipo         = []

      // Si es admin, cargar datos de todo el equipo
      try {
        const usuario = await obtenerUsuario()
        const empresaId = usuario?.empresaId || uid
        const isAdmin   = usuario?.rol === 'admin' || !usuario?.rol

        if (isAdmin) {
          equipo = await obtenerMiembrosEquipo(empresaId)
          // Filtrar solo vendedores (no el admin mismo)
          const vendedores = equipo.filter(m => m.id !== uid && m.rol === 'vendedor')

          if (vendedores.length > 0) {
            const equipoData = await Promise.all(
              vendedores.map(async (v) => ({
                vendedorId: v.id,
                clientes:   await obtenerClientesPorVendedor(v.id),
                ventas:     await obtenerVentasPorVendedor(v.id),
                visitas:    await obtenerVisitasPorVendedor(v.id),
              }))
            )
            for (const d of equipoData) {
              todosClientes = uniq([...todosClientes, ...d.clientes])
              todasVentas   = uniq([...todasVentas,   ...d.ventas  ])
              todasVisitas  = uniq([...todasVisitas,  ...d.visitas ])
            }
          }
        }
      } catch (err) {
        // Si falla la carga del equipo, seguir con datos propios
        console.warn('useAppData: no se pudo cargar equipo:', err)
      }

      if (!mountedRef.current) return

      const newData = {
        clientes:  todosClientes,
        ventas:    todasVentas,
        productos,
        visitas:   todasVisitas,
        rutas,
        inventario,
        equipo,
      }
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
        if (cacheUid && cacheUid !== user.uid) {
          cache    = null
          cacheUid = null
        }
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

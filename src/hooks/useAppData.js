/**
 * useAppData.js — Hook central de datos
 * Fase 5: Listeners en tiempo real (onSnapshot) para clientes, ventas y productos.
 * Admin ve datos consolidados de todo el equipo.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { auth } from '../../firebase/firebase.config'
import {
  obtenerRutas,
  obtenerTodoInventario,
  obtenerMiembrosEquipo,
  obtenerClientesPorVendedor,
  obtenerVentasPorVendedor,
  obtenerVisitasPorVendedor,
  obtenerUsuario,
  suscribirClientes,
  suscribirVentas,
  suscribirProductos,
} from '../services/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const EMPTY_DATA = {
  clientes:   [],
  ventas:     [],
  productos:  [],
  visitas:    [],
  rutas:      [],
  inventario: [],
  equipo:     [],
}

function uniq(arr, key = 'id') {
  const seen = new Set()
  return arr.filter(item => {
    if (seen.has(item[key])) return false
    seen.add(item[key])
    return true
  })
}

export function useAppData() {
  const [data,    setData]    = useState(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Referencias a datos en tiempo real para combinar con equipo
  const propiosRef = useRef({ clientes: [], ventas: [], productos: [] })
  const equipoRef  = useRef({ clientes: [], ventas: [] })
  const mountedRef = useRef(true)

  // Merge helper — combina propios + equipo y retorna datos completos
  const merge = useCallback((overrides = {}) => {
    if (!mountedRef.current) return
    setData(prev => ({
      ...prev,
      clientes:  uniq([...propiosRef.current.clientes, ...equipoRef.current.clientes]),
      ventas:    uniq([...propiosRef.current.ventas,   ...equipoRef.current.ventas  ]),
      productos: propiosRef.current.productos,
      ...overrides,
    }))
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const unsubs = []

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!mountedRef.current) return

      // Limpiar suscripciones anteriores
      unsubs.forEach(fn => fn())
      unsubs.length = 0

      if (!user) {
        propiosRef.current = { clientes: [], ventas: [], productos: [] }
        equipoRef.current  = { clientes: [], ventas: [] }
        setData(EMPTY_DATA)
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Obtener tenantId del usuario (para productos multi-empresa)
        const userData = await obtenerUsuario()
        const isAdmin  = userData?.rol === 'admin'
        const tenantId = (userData?.rol === 'vendedor' && userData?.empresaId)
          ? userData.empresaId
          : user.uid

        // ── Listeners en tiempo real ──────────────────────────

        // Clientes propios
        unsubs.push(suscribirClientes(user.uid, clientes => {
          propiosRef.current.clientes = clientes
          merge()
        }))

        // Ventas propias
        unsubs.push(suscribirVentas(user.uid, ventas => {
          propiosRef.current.ventas = ventas
          merge()
        }))

        // Productos (del tenant/empresa)
        unsubs.push(suscribirProductos(tenantId, productos => {
          propiosRef.current.productos = productos
          merge()
          setLoading(false) // primer snapshot = datos disponibles
        }))

        // ── One-time fetch para colecciones menos críticas ────
        const [rutas, inventario] = await Promise.all([
          obtenerRutas(),
          obtenerTodoInventario(),
        ])

        if (!mountedRef.current) return
        setData(prev => ({ ...prev, rutas, inventario }))

        // ── Datos del equipo (solo admin) ─────────────────────
        if (isAdmin) {
          try {
            const empresaId = userData?.empresaId || user.uid
            const equipo    = await obtenerMiembrosEquipo(empresaId)
            const vendedores = equipo.filter(m => m.id !== user.uid && m.rol === 'vendedor')

            setData(prev => ({ ...prev, equipo }))

            if (vendedores.length > 0) {
              const resultados = await Promise.all(
                vendedores.map(async v => ({
                  clientes: await obtenerClientesPorVendedor(v.id),
                  ventas:   await obtenerVentasPorVendedor(v.id),
                  visitas:  await obtenerVisitasPorVendedor(v.id),
                }))
              )
              equipoRef.current.clientes = uniq(resultados.flatMap(r => r.clientes))
              equipoRef.current.ventas   = uniq(resultados.flatMap(r => r.ventas))
              const todasVisitas         = uniq(resultados.flatMap(r => r.visitas))
              if (mountedRef.current) {
                setData(prev => ({ ...prev, visitas: todasVisitas, equipo }))
                merge()
              }
            }
          } catch (err) {
            console.warn('useAppData: no se pudo cargar equipo:', err)
          }
        }

        // Visitas propias (one-time, no cambian en tiempo real con frecuencia)
        const { obtenerVisitas } = await import('../services/firestore')
        const visitas = await obtenerVisitas()
        if (mountedRef.current) {
          setData(prev => ({ ...prev, visitas: uniq([...visitas, ...(prev.visitas || [])]) }))
        }

      } catch (err) {
        if (!mountedRef.current) return
        console.error('useAppData error:', err)
        setError(err.message || 'Error al cargar los datos')
        setLoading(false)
      }
    })

    return () => {
      mountedRef.current = false
      unsub()
      unsubs.forEach(fn => fn())
    }
  }, [merge])

  const recargar = useCallback(async () => {
    // Con onSnapshot los datos ya se actualizan solos.
    // Esta función refresca las colecciones one-time (rutas, inventario, equipo).
    const user = auth.currentUser
    if (!user) return
    try {
      const [rutas, inventario] = await Promise.all([
        obtenerRutas(),
        obtenerTodoInventario(),
      ])
      if (mountedRef.current) setData(prev => ({ ...prev, rutas, inventario }))
    } catch (err) {
      console.warn('recargar:', err)
    }
  }, [])

  return { ...data, loading, error, recargar }
}

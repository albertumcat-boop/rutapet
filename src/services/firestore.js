import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, setDoc, query, where,
  serverTimestamp
} from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase.config'

const uid    = ()      => auth.currentUser?.uid
const col    = (name)  => collection(db, name)
const docRef = (c, id) => doc(db, c, id)

// ── USUARIO ───────────────────────────────────────────
export const obtenerUsuario = async () => {
  if (!uid()) return null
  const snap = await getDoc(docRef('usuarios', uid()))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ── CLIENTES ──────────────────────────────────────────
export const agregarCliente = async (data) => {
  return await addDoc(col('clientes'), {
    ...data,
    vendedorId:   uid(),
    tenantId:     uid(),
    activo:       true,
    creadoEn:     serverTimestamp(),
    ultimaVisita: serverTimestamp(),
  })
}

export const obtenerClientes = async () => {
  const q    = query(col('clientes'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.activo !== false)
}

export const actualizarCliente = async (id, data) => {
  await updateDoc(docRef('clientes', id), {
    ...data, actualizadoEn: serverTimestamp(),
  })
}

export const eliminarCliente = async (id) => {
  await updateDoc(docRef('clientes', id), { activo: false })
}

// ── PRODUCTOS ─────────────────────────────────────────
export const agregarProducto = async (data) => {
  return await addDoc(col('productos'), {
    ...data, tenantId: uid(), activo: true, creadoEn: serverTimestamp(),
  })
}

export const obtenerProductos = async () => {
  const q    = query(col('productos'), where('tenantId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => p.activo !== false)
}

export const actualizarProducto = async (id, data) => {
  await updateDoc(docRef('productos', id), { ...data, actualizadoEn: serverTimestamp() })
}

// ── VENTAS ────────────────────────────────────────────
export const agregarVenta = async (data) => {
  const ref = await addDoc(col('ventas'), {
    ...data, vendedorId: uid(), tenantId: uid(),
    fecha: serverTimestamp(), creadoEn: serverTimestamp(),
  })
  if (data.clienteId) {
    await actualizarCliente(data.clienteId, { ultimaVisita: serverTimestamp() })
  }
  // Actualizar inventario del cliente al registrar venta
  if (data.clienteId && data.items) {
    for (const item of data.items) {
      if (item.pId) {
        await actualizarInventarioCliente(data.clienteId, item.pId, item.qty || 1)
      }
    }
  }
  return ref
}

export const obtenerVentas = async () => {
  const q    = query(col('ventas'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarVenta = async (id, data) => {
  await updateDoc(docRef('ventas', id), data)
}

// ── VISITAS ───────────────────────────────────────────
export const agregarVisita = async (data) => {
  const ref = await addDoc(col('visitas'), {
    ...data, vendedorId: uid(), tenantId: uid(),
    fecha: serverTimestamp(), creadoEn: serverTimestamp(),
  })
  if (data.clienteId) {
    await actualizarCliente(data.clienteId, { ultimaVisita: serverTimestamp() })
  }
  return ref
}

export const obtenerVisitas = async () => {
  const q    = query(col('visitas'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── RUTAS ─────────────────────────────────────────────
export const agregarRuta = async (data) => {
  return await addDoc(col('rutas'), {
    ...data, vendedorId: uid(), tenantId: uid(), creadoEn: serverTimestamp(),
  })
}

export const obtenerRutas = async () => {
  const q    = query(col('rutas'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarRuta = async (id, data) => {
  await updateDoc(docRef('rutas', id), data)
}

export const eliminarRuta = async (id) => {
  await deleteDoc(docRef('rutas', id))
}

// ── COBROS ────────────────────────────────────────────
export const registrarPago = async (clienteId, montoPagado, deudaActual) => {
  const nuevaDeuda = Math.max(0, deudaActual - montoPagado)
  await actualizarCliente(clienteId, { deuda: nuevaDeuda })
  await addDoc(col('pagos'), {
    clienteId, monto: montoPagado,
    vendedorId: uid(), tenantId: uid(),
    fecha: serverTimestamp(), creadoEn: serverTimestamp(),
  })
  return nuevaDeuda
}

// ── INVENTARIO POR CLIENTE ────────────────────────────
// Cada cliente tiene su propio inventario de productos
// stockActual = lo que tiene en tienda ahora
// stockIdeal  = lo que debería tener (100%)

export const obtenerInventarioCliente = async (clienteId) => {
  const q    = query(col('inventario'), where('clienteId', '==', clienteId), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const obtenerTodoInventario = async () => {
  const q    = query(col('inventario'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const setInventarioProducto = async (clienteId, productoId, stockActual, stockIdeal) => {
  // Buscar si ya existe
  const q    = query(col('inventario'),
    where('clienteId',   '==', clienteId),
    where('productoId',  '==', productoId),
    where('vendedorId',  '==', uid())
  )
  const snap = await getDocs(q)

  if (snap.empty) {
    await addDoc(col('inventario'), {
      clienteId, productoId,
      stockActual:  stockActual || 0,
      stockIdeal:   stockIdeal  || 10,
      vendedorId:   uid(),
      tenantId:     uid(),
      actualizadoEn: serverTimestamp(),
    })
  } else {
    await updateDoc(snap.docs[0].ref, {
      stockActual, stockIdeal,
      actualizadoEn: serverTimestamp(),
    })
  }
}

export const actualizarInventarioCliente = async (clienteId, productoId, cantidadVendida) => {
  const q    = query(col('inventario'),
    where('clienteId',  '==', clienteId),
    where('productoId', '==', productoId),
    where('vendedorId', '==', uid())
  )
  const snap = await getDocs(q)
  if (!snap.empty) {
    const actual = snap.docs[0].data().stockActual || 0
    await updateDoc(snap.docs[0].ref, {
      stockActual:   actual + cantidadVendida,
      actualizadoEn: serverTimestamp(),
    })
  }
}

// ── CALCULAR % COMPLETITUD DE INVENTARIO ─────────────
export const calcularPorcentajeInventario = (inventarioCliente) => {
  if (!inventarioCliente || inventarioCliente.length === 0) return 0
  const total = inventarioCliente.reduce((s, i) => s + (i.stockIdeal || 10), 0)
  const actual = inventarioCliente.reduce((s, i) => s + Math.min(i.stockActual || 0, i.stockIdeal || 10), 0)
  return total > 0 ? Math.round((actual / total) * 100) : 0
}

export const colorPorcentaje = (pct) => {
  if (pct >= 80) return '#22C55E'  // Verde
  if (pct >= 50) return '#EAB308'  // Amarillo
  return '#EF4444'                  // Rojo
}

export const labelPorcentaje = (pct) => {
  if (pct >= 80) return '✓ Bien surtida'
  if (pct >= 50) return '⚠ Surtido medio'
  return '✗ Necesita restock'
}

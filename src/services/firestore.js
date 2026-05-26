/**
 * firestore.js — Capa de acceso a datos Firebase
 * Auditado: manejo de errores, multi-tenant, índices
 */
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, setDoc, query, where,
  serverTimestamp, orderBy, limit,
} from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase.config'

// ── Helpers internos ──────────────────────────────────
const uid    = ()      => auth.currentUser?.uid
const col    = (name)  => collection(db, name)
const docRef = (c, id) => doc(db, c, id)

const requireAuth = () => {
  if (!uid()) throw new Error('Usuario no autenticado')
}

// ── USUARIO ───────────────────────────────────────────
export const obtenerUsuario = async () => {
  if (!uid()) return null
  try {
    const snap = await getDoc(docRef('usuarios', uid()))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (err) {
    console.error('obtenerUsuario:', err)
    return null
  }
}

// ── CLIENTES ──────────────────────────────────────────
export const agregarCliente = async (data) => {
  requireAuth()
  return await addDoc(col('clientes'), {
    nombre:       data.nombre       || '',
    tipo:         data.tipo         || '',
    contacto:     data.contacto     || '',
    telefono:     data.telefono     || '',
    email:        data.email        || '',
    direccion:    data.direccion    || '',
    notas:        data.notas        || '',
    nivel:        data.nivel        || 'medio',
    deuda:        Number(data.deuda) || 0,
    limiteCredito:Number(data.limiteCredito) || 0,
    lat:          Number(data.lat)  || 0,
    lng:          Number(data.lng)  || 0,
    foto:         data.foto         || null,
    vendedorId:   uid(),
    tenantId:     uid(),
    activo:       true,
    creadoEn:     serverTimestamp(),
    ultimaVisita: serverTimestamp(),
  })
}

export const obtenerClientes = async () => {
  requireAuth()
  // Sin índice compuesto — filtramos activo en cliente
  const q    = query(col('clientes'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.activo !== false)
}

export const actualizarCliente = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de cliente requerido')
  // Solo actualizar campos permitidos
  const permitidos = ['nombre','tipo','contacto','telefono','email',
    'direccion','notas','nivel','deuda','limiteCredito','lat','lng',
    'foto','activo','ultimaVisita']
  const update = {}
  for (const key of permitidos) {
    if (data[key] !== undefined) update[key] = data[key]
  }
  update.actualizadoEn = serverTimestamp()
  await updateDoc(docRef('clientes', id), update)
}

export const eliminarCliente = async (id) => {
  requireAuth()
  if (!id) throw new Error('ID de cliente requerido')
  // Soft delete
  await updateDoc(docRef('clientes', id), {
    activo:       false,
    eliminadoEn:  serverTimestamp(),
  })
}

// ── PRODUCTOS ─────────────────────────────────────────
export const agregarProducto = async (data) => {
  requireAuth()
  return await addDoc(col('productos'), {
    nombre:    data.nombre    || '',
    categoria: data.categoria || '',
    marca:     data.marca     || '',
    precio:    Number(data.precio) || 0,
    stock:     Number(data.stock)  || 0,
    descripcion: data.descripcion || '',
    tenantId:  uid(),
    activo:    true,
    creadoEn:  serverTimestamp(),
  })
}

export const obtenerProductos = async () => {
  requireAuth()
  const q    = query(col('productos'), where('tenantId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => p.activo !== false)
}

export const actualizarProducto = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de producto requerido')
  await updateDoc(docRef('productos', id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

export const eliminarProducto = async (id) => {
  requireAuth()
  await updateDoc(docRef('productos', id), {
    activo: false, eliminadoEn: serverTimestamp(),
  })
}

// ── VENTAS ────────────────────────────────────────────
export const agregarVenta = async (data) => {
  requireAuth()
  if (!data.clienteId) throw new Error('clienteId requerido')
  if (!data.total || data.total <= 0) throw new Error('total inválido')

  const ref = await addDoc(col('ventas'), {
    clienteId:  data.clienteId,
    items:      data.items     || [],
    total:      Number(data.total),
    metodoPago: data.metodoPago || 'efectivo',
    estado:     data.estado    || 'pendiente',
    notas:      data.notas     || '',
    vendedorId: uid(),
    tenantId:   uid(),
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })

  // Actualizar última visita del cliente
  await actualizarCliente(data.clienteId, {
    ultimaVisita: serverTimestamp(),
  })

  // Si la venta es a crédito, actualizar deuda
  if (data.estado === 'pendiente' || data.estado === 'parcial') {
    const clienteSnap = await getDoc(docRef('clientes', data.clienteId))
    if (clienteSnap.exists()) {
      const deudaActual = clienteSnap.data().deuda || 0
      const montoPagado = data.montoPagado || 0
      const nuevaDeuda  = deudaActual + (Number(data.total) - montoPagado)
      await actualizarCliente(data.clienteId, { deuda: Math.max(0, nuevaDeuda) })
    }
  }

  return ref
}

export const obtenerVentas = async () => {
  requireAuth()
  const q    = query(col('ventas'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarVenta = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de venta requerido')
  await updateDoc(docRef('ventas', id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

// ── VISITAS ───────────────────────────────────────────
export const agregarVisita = async (data) => {
  requireAuth()
  if (!data.clienteId) throw new Error('clienteId requerido')

  const ref = await addDoc(col('visitas'), {
    clienteId:  data.clienteId,
    vendio:     data.vendio !== undefined ? data.vendio : false,
    notas:      data.notas     || '',
    vendedorId: uid(),
    tenantId:   uid(),
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })

  // Actualizar última visita del cliente siempre
  await actualizarCliente(data.clienteId, {
    ultimaVisita: serverTimestamp(),
  })

  return ref
}

export const obtenerVisitas = async () => {
  requireAuth()
  const q    = query(col('visitas'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── RUTAS ─────────────────────────────────────────────
export const agregarRuta = async (data) => {
  requireAuth()
  if (!data.nombre) throw new Error('Nombre de ruta requerido')

  return await addDoc(col('rutas'), {
    nombre:    data.nombre,
    clientes:  data.clientes  || [],
    fecha:     data.fecha     || new Date().toISOString().split('T')[0],
    estado:    data.estado    || 'pendiente',
    km:        Number(data.km) || 0,
    notas:     data.notas     || '',
    vendedorId:uid(),
    tenantId:  uid(),
    creadoEn:  serverTimestamp(),
  })
}

export const obtenerRutas = async () => {
  requireAuth()
  const q    = query(col('rutas'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarRuta = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de ruta requerido')
  await updateDoc(docRef('rutas', id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

export const eliminarRuta = async (id) => {
  requireAuth()
  if (!id) throw new Error('ID de ruta requerido')
  await deleteDoc(docRef('rutas', id))
}

// ── COBROS / PAGOS ────────────────────────────────────
export const registrarPago = async (clienteId, montoPagado, deudaActual) => {
  requireAuth()
  if (!clienteId)    throw new Error('clienteId requerido')
  if (montoPagado <= 0) throw new Error('Monto debe ser mayor a 0')

  const nuevaDeuda = Math.max(0, (Number(deudaActual) || 0) - Number(montoPagado))

  await actualizarCliente(clienteId, { deuda: nuevaDeuda })

  await addDoc(col('pagos'), {
    clienteId,
    monto:      Number(montoPagado),
    deudaAntes: Number(deudaActual) || 0,
    deudaDespues: nuevaDeuda,
    vendedorId: uid(),
    tenantId:   uid(),
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })

  return nuevaDeuda
}

export const obtenerPagos = async (clienteId = null) => {
  requireAuth()
  let q
  if (clienteId) {
    q = query(col('pagos'),
      where('vendedorId', '==', uid()),
      where('clienteId', '==', clienteId)
    )
  } else {
    q = query(col('pagos'), where('vendedorId', '==', uid()))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── INVENTARIO POR CLIENTE ────────────────────────────
export const obtenerInventarioCliente = async (clienteId) => {
  requireAuth()
  if (!clienteId) return []
  const q    = query(col('inventario'),
    where('clienteId',  '==', clienteId),
    where('vendedorId', '==', uid())
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const obtenerTodoInventario = async () => {
  requireAuth()
  const q    = query(col('inventario'), where('vendedorId', '==', uid()))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const setInventarioProducto = async (clienteId, productoId, stockActual, stockIdeal) => {
  requireAuth()
  if (!clienteId)  throw new Error('clienteId requerido')
  if (!productoId) throw new Error('productoId requerido')

  const sActual = Math.max(0, Number(stockActual) || 0)
  const sIdeal  = Math.max(0, Number(stockIdeal)  || 0)

  const q    = query(col('inventario'),
    where('clienteId',  '==', clienteId),
    where('productoId', '==', productoId),
    where('vendedorId', '==', uid())
  )
  const snap = await getDocs(q)

  if (snap.empty) {
    await addDoc(col('inventario'), {
      clienteId,
      productoId,
      stockActual:   sActual,
      stockIdeal:    sIdeal,
      vendedorId:    uid(),
      tenantId:      uid(),
      creadoEn:      serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    })
  } else {
    await updateDoc(snap.docs[0].ref, {
      stockActual:   sActual,
      stockIdeal:    sIdeal,
      actualizadoEn: serverTimestamp(),
    })
  }
}

export const actualizarStockCliente = async (clienteId, productoId, cantidad) => {
  requireAuth()
  const q    = query(col('inventario'),
    where('clienteId',  '==', clienteId),
    where('productoId', '==', productoId),
    where('vendedorId', '==', uid())
  )
  const snap = await getDocs(q)
  if (!snap.empty) {
    const actual    = snap.docs[0].data().stockActual || 0
    const nuevo     = Math.max(0, actual + Number(cantidad))
    await updateDoc(snap.docs[0].ref, {
      stockActual:   nuevo,
      actualizadoEn: serverTimestamp(),
    })
  }
}

// ── HELPERS DE INVENTARIO ─────────────────────────────
export const calcularPorcentajeInventario = (inventarioCliente) => {
  if (!inventarioCliente || inventarioCliente.length === 0) return 0
  const conIdeal = inventarioCliente.filter(i => (i.stockIdeal || 0) > 0)
  if (conIdeal.length === 0) return 0
  const totalIdeal  = conIdeal.reduce((s, i) => s + i.stockIdeal, 0)
  const totalActual = conIdeal.reduce((s, i) => s + Math.min(i.stockActual || 0, i.stockIdeal), 0)
  return totalIdeal > 0 ? Math.round((totalActual / totalIdeal) * 100) : 0
}

export const colorPorcentaje = (pct) => {
  if (pct >= 80) return '#22C55E'
  if (pct >= 50) return '#EAB308'
  return '#EF4444'
}

export const labelPorcentaje = (pct) => {
  if (pct >= 80) return '✓ Bien surtida'
  if (pct >= 50) return '⚠ Surtido medio'
  return '✗ Necesita restock'
}

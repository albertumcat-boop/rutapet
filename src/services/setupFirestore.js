import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, setDoc, query, where,
  serverTimestamp
} from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase.config'

const uid    = ()        => auth.currentUser?.uid
const col    = (name)    => collection(db, name)
const docRef = (c, id)   => doc(db, c, id)

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
  const q    = query(col('clientes'),
    where('vendedorId', '==', uid()),
    where('activo', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarCliente = async (id, data) => {
  await updateDoc(docRef('clientes', id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

export const eliminarCliente = async (id) => {
  await updateDoc(docRef('clientes', id), { activo: false })
}

// ── PRODUCTOS ─────────────────────────────────────────
export const agregarProducto = async (data) => {
  return await addDoc(col('productos'), {
    ...data,
    tenantId: uid(),
    activo:   true,
    creadoEn: serverTimestamp(),
  })
}

export const obtenerProductos = async () => {
  const q    = query(col('productos'),
    where('tenantId', '==', uid()),
    where('activo', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarProducto = async (id, data) => {
  await updateDoc(docRef('productos', id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}

// ── VENTAS ────────────────────────────────────────────
export const agregarVenta = async (data) => {
  const ref = await addDoc(col('ventas'), {
    ...data,
    vendedorId: uid(),
    tenantId:   uid(),
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })
  if (data.clienteId) {
    await actualizarCliente(data.clienteId, {
      ultimaVisita: serverTimestamp()
    })
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
    ...data,
    vendedorId: uid(),
    tenantId:   uid(),
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })
  if (data.clienteId) {
    await actualizarCliente(data.clienteId, {
      ultimaVisita: serverTimestamp()
    })
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
    ...data,
    vendedorId: uid(),
    tenantId:   uid(),
    creadoEn:   serverTimestamp(),
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
    clienteId,
    monto:      montoPagado,
    vendedorId: uid(),
    tenantId:   uid(),
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })
  return nuevaDeuda
}

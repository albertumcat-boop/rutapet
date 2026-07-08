/**
 * firestore.js — Capa de acceso a datos Firebase
 * Multi-tenant + multi-usuario (empresaId/rol)
 * Campos medicamentos: lote, vencimiento, cadenaFrio, receta, principioActivo
 */
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, setDoc, query, where,
  serverTimestamp, orderBy, limit,
  increment, onSnapshot, runTransaction,
} from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase.config'

// ── Helpers internos ──────────────────────────────────
const uid    = ()      => auth.currentUser?.uid
const col    = (name)  => collection(db, name)
const docRef = (c, id) => doc(db, c, id)

const requireAuth = () => {
  if (!uid()) throw new Error('Usuario no autenticado')
}

// Resuelve el tenantId correcto para escrituras:
// - Admin/solo: uid propio
// - Vendedor de empresa: empresaId del admin (para que el admin vea sus datos)
// Si la lectura de /usuarios falla (red), registra el error y usa uid() como fallback
// en lugar de silenciar el problema con catch{}.
const getTenantId = async () => {
  try {
    const userSnap = await getDoc(docRef('usuarios', uid()))
    if (userSnap.exists()) {
      const d = userSnap.data()
      if (d.rol === 'vendedor' && d.empresaId) return d.empresaId
    }
  } catch (e) {
    console.warn('getTenantId: no se pudo leer userData, usando uid como tenantId', e)
  }
  return uid()
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

export const actualizarUsuario = async (data) => {
  requireAuth()
  // SECURITY: 'rol', 'empresaId', 'tenantId', 'uid' son campos de seguridad
  // que NO deben ser modificables por el usuario desde el cliente
  const permitidos = ['nombre', 'telefono', 'foto']
  const update = {}
  for (const key of permitidos) {
    if (data[key] !== undefined) update[key] = data[key]
  }
  update.actualizadoEn = serverTimestamp()
  await setDoc(docRef('usuarios', uid()), update, { merge: true })
}

// ── EMPRESA (multi-usuario) ───────────────────────────
export const crearEmpresa = async (nombre) => {
  requireAuth()
  const empresaId = uid()
  await setDoc(docRef('empresas', empresaId), {
    nombre,
    adminId:   uid(),
    creadoEn:  serverTimestamp(),
    activo:    true,
  })
  // Marcar al usuario como admin de esta empresa
  await setDoc(docRef('usuarios', uid()), {
    rol:       'admin',
    empresaId: uid(),
    actualizadoEn: serverTimestamp(),
  }, { merge: true })
  return empresaId
}

export const obtenerMiembrosEquipo = async (empresaId) => {
  requireAuth()
  const q    = query(col('usuarios'), where('empresaId', '==', empresaId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Admin: activar/desactivar a un vendedor de su equipo.
// Las reglas de Firestore solo permiten que el admin toque 'activo' y
// 'actualizadoEn' en el doc de OTRO usuario — ningún otro campo es editable.
export const setActivoVendedor = async (vendedorId, activo) => {
  requireAuth()
  if (!vendedorId) throw new Error('vendedorId requerido')
  await updateDoc(docRef('usuarios', vendedorId), {
    activo: Boolean(activo),
    actualizadoEn: serverTimestamp(),
  })
}

// ── INVITACIONES ──────────────────────────────────────
export const invitarVendedor = async (email) => {
  requireAuth()
  if (!email) throw new Error('Email requerido')
  const user = await obtenerUsuario()
  const empresaId = user?.empresaId || uid()

  // Verificar que no exista ya
  const q = query(col('invitaciones'),
    where('emailInvitado', '==', email.toLowerCase()),
    where('empresaId', '==', empresaId),
    where('estado', '==', 'pendiente')
  )
  const snap = await getDocs(q)
  if (!snap.empty) throw new Error('Ya existe una invitación pendiente para ese email')

  return await addDoc(col('invitaciones'), {
    emailInvitado: email.toLowerCase(),
    empresaId,
    adminId:   uid(),
    estado:    'pendiente',
    creadoEn:  serverTimestamp(),
  })
}

export const aceptarInvitacion = async (invitacionId) => {
  requireAuth()
  const snap = await getDoc(docRef('invitaciones', invitacionId))
  if (!snap.exists()) throw new Error('Invitación no encontrada')
  const inv = snap.data()
  if (inv.estado !== 'pendiente') throw new Error('Invitación ya procesada')
  // SECURITY: verificar que la invitación sea para el usuario actual
  const emailActual = auth.currentUser?.email?.toLowerCase()
  if (inv.emailInvitado && emailActual && inv.emailInvitado !== emailActual) {
    throw new Error('Esta invitación no es para tu correo electrónico')
  }

  await updateDoc(docRef('invitaciones', invitacionId), {
    estado:    'aceptada',
    aceptadoEn: serverTimestamp(),
    vendedorId: uid(),
  })
  // Vincular usuario a la empresa
  await setDoc(docRef('usuarios', uid()), {
    rol:       'vendedor',
    empresaId: inv.empresaId,
    actualizadoEn: serverTimestamp(),
  }, { merge: true })
}

export const obtenerInvitacionesPendientes = async (empresaId) => {
  requireAuth()
  const q    = query(col('invitaciones'),
    where('empresaId', '==', empresaId),
    where('estado',    '==', 'pendiente')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── CLIENTES ──────────────────────────────────────────
export const agregarCliente = async (data) => {
  requireAuth()
  return await addDoc(col('clientes'), {
    nombre:              data.nombre              || '',
    tipo:                data.tipo                || '',
    contacto:            data.contacto            || '',
    telefono:            data.telefono            || '',
    email:               data.email               || '',
    direccion:           data.direccion           || '',
    notas:               data.notas               || '',
    nivel:               data.nivel               || 'medio',
    deuda:               Number(data.deuda)       || 0,
    limiteCredito:       Number(data.limiteCredito) || 0,
    condicionPago:       data.condicionPago        || 'contado',
    ruc:                 data.ruc                  || '',
    veterinario:         data.veterinario          || '',
    tipoEstablecimiento: data.tipoEstablecimiento  || '',
    lat:                 (data.lat != null && data.lat !== '') ? Number(data.lat) : null,
    lng:                 (data.lng != null && data.lng !== '') ? Number(data.lng) : null,
    foto:                data.foto                 || null,
    vendedorId:          uid(),
    tenantId:            uid(),
    activo:              true,
    creadoEn:            serverTimestamp(),
    ultimaVisita:        serverTimestamp(),
  })
}

export const obtenerClientes = async () => {
  requireAuth()
  const q    = query(col('clientes'), where('vendedorId', '==', uid()), limit(500))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.activo !== false)
}

// Admin: obtener clientes de toda la empresa
export const obtenerClientesEmpresa = async (empresaId) => {
  requireAuth()
  const q    = query(col('clientes'), where('tenantId', '==', empresaId))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.activo !== false)
}

export const actualizarCliente = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de cliente requerido')
  // SECURITY: 'deuda' fue removido intencionalmente de esta whitelist.
  // El saldo del cliente SOLO debe cambiar a través de flujos atómicos y
  // auditados: agregarVenta(), registrarPago() o marcarVentaPagada().
  // Permitir su edición libre aquí abriría la puerta a que un vendedor
  // infle o borre deuda sin dejar rastro en /pagos.
  const permitidos = ['nombre','tipo','contacto','telefono','email',
    'direccion','notas','nivel','limiteCredito','condicionPago',
    'ruc','veterinario','tipoEstablecimiento',
    'lat','lng','foto','activo','ultimaVisita']
  const update = {}
  for (const key of permitidos) {
    if (data[key] !== undefined) update[key] = data[key]
  }
  update.actualizadoEn = serverTimestamp()
  await updateDoc(docRef('clientes', id), update)
}

// Marca una venta como totalmente pagada y reduce la deuda del cliente
// en el monto pendiente — TODO en una sola transacción atómica para que
// dos usuarios marcando ventas pagadas simultáneamente no se pisen.
export const marcarVentaPagada = async (ventaId, clienteId) => {
  requireAuth()
  if (!ventaId)   throw new Error('ventaId requerido')
  if (!clienteId) throw new Error('clienteId requerido')

  const ventaRef   = docRef('ventas', ventaId)
  const clienteRef = docRef('clientes', clienteId)

  return await runTransaction(db, async (tx) => {
    const ventaSnap   = await tx.get(ventaRef)
    const clienteSnap = await tx.get(clienteRef)
    if (!ventaSnap.exists())   throw new Error('Venta no encontrada')
    if (!clienteSnap.exists()) throw new Error('Cliente no encontrado')

    const venta     = ventaSnap.data()
    const deudaReal  = Number(clienteSnap.data().deuda) || 0
    const pendiente  = Math.max(0, Number(venta.total || 0) - Number(venta.montoPagado || 0))
    const nuevaDeuda = Math.max(0, deudaReal - pendiente)

    tx.update(ventaRef, {
      estado:        'pagado',
      montoPagado:   Number(venta.total) || 0,
      actualizadoEn: serverTimestamp(),
    })
    tx.update(clienteRef, {
      deuda:         nuevaDeuda,
      actualizadoEn: serverTimestamp(),
    })

    return nuevaDeuda
  })
}

export const eliminarCliente = async (id) => {
  requireAuth()
  if (!id) throw new Error('ID de cliente requerido')
  await updateDoc(docRef('clientes', id), {
    activo:      false,
    eliminadoEn: serverTimestamp(),
  })
}

// ── PRODUCTOS (con campos de medicamentos) ─────────────
export const agregarProducto = async (data) => {
  requireAuth()
  const tenantId = await getTenantId()

  return await addDoc(col('productos'), {
    // Campos base
    nombre:          data.nombre          || '',
    categoria:       data.categoria       || '',
    marca:           data.marca           || '',
    precio:          Number(data.precio)  || 0,
    stock:           Number(data.stock)   || 0,
    stockMinimo:     Number(data.stockMinimo) || 0,
    descripcion:     data.descripcion     || '',

    // Campos medicamentos veterinarios
    principioActivo: data.principioActivo || '',
    concentracion:   data.concentracion   || '',
    presentacion:    data.presentacion    || '',
    unidad:          data.unidad          || 'unidad',
    lote:            data.lote            || '',
    fechaVencimiento:data.fechaVencimiento|| '',   // YYYY-MM-DD
    registroSanitario: data.registroSanitario || '',
    cadenaFrio:      Boolean(data.cadenaFrio),
    requiereReceta:  Boolean(data.requiereReceta),
    esMedicamento:   Boolean(data.esMedicamento),
    precios:         data.precios || {},   // { [tipoClienteKey]: precio }

    tenantId,
    activo:          true,
    creadoEn:        serverTimestamp(),
  })
}

export const obtenerProductos = async () => {
  requireAuth()
  const tenantId = await getTenantId()

  const q    = query(col('productos'), where('tenantId', '==', tenantId))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => p.activo !== false)
}

export const actualizarProducto = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de producto requerido')
  // SECURITY: whitelist — 'stock' excluido intencionalmente: el stock real
  // lo mantiene agregarVenta con increment(). El admin puede ver el stock
  // pero no sobreescribirlo desde el formulario de edición.
  const permitidos = [
    'nombre','categoria','marca','precio','stockMinimo','descripcion',
    'principioActivo','concentracion','presentacion','unidad','lote',
    'fechaVencimiento','registroSanitario','cadenaFrio','requiereReceta',
    'esMedicamento','precios','activo',
  ]
  const update = {}
  for (const key of permitidos) {
    if (data[key] !== undefined) update[key] = data[key]
  }
  if (Object.keys(update).length === 0) return
  update.actualizadoEn = serverTimestamp()
  await updateDoc(docRef('productos', id), update)
}

export const eliminarProducto = async (id) => {
  requireAuth()
  await updateDoc(docRef('productos', id), {
    activo: false, eliminadoEn: serverTimestamp(),
  })
}

// Obtener productos próximos a vencer (días)
export const obtenerProductosPorVencer = async (diasAlerta = 90) => {
  requireAuth()
  const productos = await obtenerProductos()
  const hoy    = new Date()
  const limite = new Date(hoy.getTime() + diasAlerta * 86_400_000)
    .toISOString().split('T')[0]

  return productos.filter(p => {
    if (!p.fechaVencimiento) return false
    return p.fechaVencimiento <= limite
  }).map(p => {
    const venc  = new Date(p.fechaVencimiento)
    const diff  = Math.ceil((venc - hoy) / 86_400_000)
    return { ...p, diasParaVencer: diff, yaVencio: diff < 0 }
  }).sort((a, b) => a.diasParaVencer - b.diasParaVencer)
}

// ── VENTAS ────────────────────────────────────────────
// agregarVenta es ATÓMICA: la venta, el descuento de stock y el incremento
// de deuda ocurren todos dentro de una sola transacción de Firestore.
// Si el stock de algún producto es insuficiente, TODA la operación se
// cancela (no queda una venta "fantasma" sin reflejo real en inventario/deuda).
export const agregarVenta = async (data) => {
  requireAuth()
  if (!data.clienteId) throw new Error('clienteId requerido')
  if (!data.total || data.total <= 0) throw new Error('total inválido')

  const montoPagado = Number(data.montoPagado) || 0
  const estado      = data.estado || 'pendiente'
  const items       = (data.items || []).filter(it => it.pId && it.qty)

  const tenantId = await getTenantId()
  const ventaId = doc(col('ventas')).id
  const ventaRef = docRef('ventas', ventaId)

  await runTransaction(db, async (tx) => {
    // 1) Leer stock actual de todos los productos involucrados (dentro de la tx)
    const productSnaps = []
    for (const item of items) {
      const pRef  = docRef('productos', item.pId)
      const pSnap = await tx.get(pRef)
      if (!pSnap.exists()) throw new Error(`Producto ${item.pId} no existe`)
      const stockActual = Number(pSnap.data().stock) || 0
      const qty = Math.abs(Number(item.qty))
      if (stockActual < qty) {
        throw new Error(
          `Stock insuficiente para "${pSnap.data().nombre || item.pId}" ` +
          `(disponible: ${stockActual}, solicitado: ${qty})`
        )
      }
      productSnaps.push({ ref: pRef, qty })
    }

    // 2) Leer cliente para validar que existe
    const clienteRef  = docRef('clientes', data.clienteId)
    const clienteSnap = await tx.get(clienteRef)
    if (!clienteSnap.exists()) throw new Error('Cliente no encontrado')

    // 3) Crear la venta
    tx.set(ventaRef, {
      clienteId:      data.clienteId,
      items:          data.items       || [],
      subtotal:       Number(data.subtotal || data.total),
      descuento:      Number(data.descuento)  || 0,   // porcentaje
      descValor:      Number(data.descValor)  || 0,   // monto descontado
      total:          Number(data.total),
      montoPagado:    montoPagado,
      metodoPago:     data.metodoPago  || 'efectivo',
      estado,
      notas:          data.notas       || '',
      vendedorNombre: data.vendedorNombre || '',
      vendedorId:     uid(),
      tenantId,
      fecha:          serverTimestamp(),
      creadoEn:       serverTimestamp(),
    })

    // 4) Descontar stock — atómico, garantizado >= 0 por la verificación previa
    for (const { ref, qty } of productSnaps) {
      tx.update(ref, {
        stock:         increment(-qty),
        actualizadoEn: serverTimestamp(),
      })
    }

    // 5) Actualizar última visita del cliente y, si quedó saldo pendiente,
    //    incrementar su deuda — en UNA sola escritura combinada (evita que
    //    dos tx.update() al mismo doc se sobreescriban entre sí)
    const clienteUpdate = { ultimaVisita: serverTimestamp() }
    if (estado === 'pendiente' || estado === 'parcial') {
      const montoADeuda = Math.max(0, Number(data.total) - montoPagado)
      if (montoADeuda > 0) {
        clienteUpdate.deuda         = increment(montoADeuda)
        clienteUpdate.actualizadoEn = serverTimestamp()
      }
    }
    tx.update(clienteRef, clienteUpdate)
  })

  return ventaRef
}

export const obtenerVentas = async () => {
  requireAuth()
  const q    = query(col('ventas'), where('vendedorId', '==', uid()), limit(500))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Admin: ventas de toda la empresa
export const obtenerVentasEmpresa = async (empresaId) => {
  requireAuth()
  const q    = query(col('ventas'), where('tenantId', '==', empresaId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarVenta = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de venta requerido')
  // SECURITY: si se intenta marcar como pagado, usar marcarVentaPagada() en su lugar
  // para que la deuda del cliente se reduzca atómicamente.
  if (data.estado === 'pagado') {
    throw new Error('Para marcar una venta como pagada usa marcarVentaPagada() — actualiza la deuda del cliente en la misma transacción.')
  }
  const permitidos = ['estado', 'montoPagado', 'notas', 'metodoPago', 'referencia']
  const update = {}
  for (const key of permitidos) {
    if (data[key] !== undefined) update[key] = data[key]
  }
  if (Object.keys(update).length === 0) return
  update.actualizadoEn = serverTimestamp()
  await updateDoc(docRef('ventas', id), update)
}

// ── VISITAS ───────────────────────────────────────────
export const agregarVisita = async (data) => {
  requireAuth()
  if (!data.clienteId) throw new Error('clienteId requerido')
  const tenantId = await getTenantId()

  const ref = await addDoc(col('visitas'), {
    clienteId:  data.clienteId,
    vendio:     data.vendio !== undefined ? data.vendio : false,
    notas:      data.notas      || '',
    firma:      data.firma      || null,
    vendedorId: uid(),
    tenantId,
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })

  await actualizarCliente(data.clienteId, {
    ultimaVisita: serverTimestamp(),
  })

  return ref
}

export const obtenerVisitas = async () => {
  requireAuth()
  const q    = query(col('visitas'), where('vendedorId', '==', uid()), limit(500))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── RUTAS ─────────────────────────────────────────────
export const agregarRuta = async (data) => {
  requireAuth()
  if (!data.nombre) throw new Error('Nombre de ruta requerido')
  if ((data.clientes?.length || 0) > 200) throw new Error('Límite de 200 clientes por ruta')
  const tenantId = await getTenantId()

  return await addDoc(col('rutas'), {
    nombre:    data.nombre,
    clientes:  data.clientes  || [],
    fecha:     data.fecha     || new Date().toISOString().split('T')[0],
    estado:    data.estado    || 'pendiente',
    km:        Number(data.km) || 0,
    notas:     data.notas     || '',
    vendedorId:uid(),
    tenantId,
    creadoEn:  serverTimestamp(),
  })
}

export const obtenerRutas = async () => {
  requireAuth()
  const q    = query(col('rutas'), where('vendedorId', '==', uid()), limit(500))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const actualizarRuta = async (id, data) => {
  requireAuth()
  if (!id) throw new Error('ID de ruta requerido')
  // SECURITY: whitelist — no se permiten cambiar vendedorId ni tenantId
  const permitidos = ['nombre', 'clientes', 'fecha', 'estado', 'km', 'notas']
  const update = {}
  for (const key of permitidos) {
    if (data[key] !== undefined) update[key] = data[key]
  }
  if (Object.keys(update).length === 0) return
  update.actualizadoEn = serverTimestamp()
  await updateDoc(docRef('rutas', id), update)
}

export const eliminarRuta = async (id) => {
  requireAuth()
  if (!id) throw new Error('ID de ruta requerido')
  await deleteDoc(docRef('rutas', id))
}

// ── QUERIES POR VENDEDOR (para vistas de admin) ───────────────
export const obtenerClientesPorVendedor = async (vendedorId) => {
  requireAuth()
  if (!vendedorId) return []
  const q    = query(col('clientes'), where('vendedorId', '==', vendedorId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.activo !== false)
}

export const obtenerVentasPorVendedor = async (vendedorId) => {
  requireAuth()
  if (!vendedorId) return []
  const q    = query(col('ventas'), where('vendedorId', '==', vendedorId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const obtenerVisitasPorVendedor = async (vendedorId) => {
  requireAuth()
  if (!vendedorId) return []
  const q    = query(col('visitas'), where('vendedorId', '==', vendedorId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── COBROS / PAGOS ────────────────────────────────────
// registrarPago es ATÓMICO: la lectura de la deuda real, el descuento de la
// deuda del cliente y la creación del registro de pago ocurren todos dentro
// de una sola transacción — evita que dos pagos simultáneos al mismo cliente
// se pisen entre sí (cada uno lee el valor más reciente antes de escribir).
export const registrarPago = async (clienteId, montoPagado, deudaActual, metodoPago = 'efectivo', referencia = '') => {
  requireAuth()
  if (!clienteId)       throw new Error('clienteId requerido')
  if (montoPagado <= 0) throw new Error('Monto debe ser mayor a 0')

  const tenantId   = await getTenantId()
  const clienteRef = docRef('clientes', clienteId)
  const pagoRef    = doc(col('pagos'))

  const nuevaDeuda = await runTransaction(db, async (tx) => {
    // Leer la deuda real DENTRO de la transacción (no antes) para que dos
    // pagos concurrentes se serialicen en vez de pisarse.
    const clienteSnap = await tx.get(clienteRef)
    if (!clienteSnap.exists()) throw new Error('Cliente no encontrado')
    const deudaReal = Number(clienteSnap.data().deuda) || 0

    if (Number(montoPagado) > deudaReal + 0.01) // +0.01 tolerancia de punto flotante
      throw new Error(`Monto (${montoPagado}) supera la deuda real (${deudaReal})`)

    const nueva = Math.max(0, deudaReal - Number(montoPagado))

    tx.update(clienteRef, { deuda: nueva, actualizadoEn: serverTimestamp() })
    tx.set(pagoRef, {
      clienteId,
      monto:        Number(montoPagado),
      deudaAntes:   deudaReal,
      deudaDespues: nueva,
      metodoPago,
      referencia,
      vendedorId:   uid(),
      tenantId,
      fecha:        serverTimestamp(),
      creadoEn:     serverTimestamp(),
    })

    return nueva
  })

  return nuevaDeuda
}

export const obtenerPagos = async (clienteId = null) => {
  requireAuth()
  let q
  if (clienteId) {
    q = query(col('pagos'),
      where('vendedorId', '==', uid()),
      where('clienteId',  '==', clienteId)
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
    const actual = snap.docs[0].data().stockActual || 0
    const nuevo  = Math.max(0, actual + Number(cantidad))
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

// ── LISTENERS EN TIEMPO REAL ──────────────────────────
// Retornan la función unsubscribe — llamar en el cleanup del useEffect.

export const suscribirClientes = (vendedorId, callback) => {
  const q = query(col('clientes'), where('vendedorId', '==', vendedorId), limit(500))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.activo !== false))
  }, err => console.error('suscribirClientes:', err))
}

export const suscribirVentas = (vendedorId, callback) => {
  const q = query(col('ventas'), where('vendedorId', '==', vendedorId), limit(500))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, err => console.error('suscribirVentas:', err))
}

export const suscribirProductos = (tenantId, callback) => {
  const q = query(col('productos'), where('tenantId', '==', tenantId), limit(300))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.activo !== false))
  }, err => console.error('suscribirProductos:', err))
}

export const suscribirVisitas = (vendedorId, callback) => {
  const q = query(col('visitas'), where('vendedorId', '==', vendedorId), limit(500))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, err => console.error('suscribirVisitas:', err))
}

export const suscribirUsuario = (uid, callback) => {
  return onSnapshot(doc(db, 'usuarios', uid), snap => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  }, err => console.error('suscribirUsuario:', err))
}

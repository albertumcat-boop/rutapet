/**
 * setupFirestore.js — Setup automático primer login
 * Auditado: idempotente, manejo de errores, datos limpios
 */
import {
  doc, getDoc, setDoc, collection, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase/firebase.config'

export async function setupUsuarioNuevo(user) {
  if (!user?.uid) throw new Error('Usuario inválido')

  const uid = user.uid

  // Verificar si ya existe
  const usuarioRef  = doc(db, 'usuarios', uid)
  const usuarioSnap = await getDoc(usuarioRef)

  if (usuarioSnap.exists()) {
    // Ya existe — no hacer nada, solo retornar tenantId
    return { esNuevo: false, tenantId: usuarioSnap.data().tenantId || uid }
  }

  // ── Crear usuario ─────────────────────────────────
  await setDoc(usuarioRef, {
    uid,
    email:    user.email    || '',
    nombre:   user.displayName || user.email?.split('@')[0] || 'Usuario',
    rol:      'admin',
    tenantId: uid,
    zona:     'Sin asignar',
    activo:   true,
    creadoEn: serverTimestamp(),
  })

  // ── Crear config inicial ──────────────────────────
  const configRef = doc(db, 'config', uid)
  await setDoc(configRef, {
    tenantId:           uid,
    onboardingCompleto: false,
    empresa: {
      nombre: '',
      rubro:  '',
      moneda: 'USD',
      logo:   null,
    },
    tiposCliente:       [],
    categoriasProducto: [],
    creadoEn:           serverTimestamp(),
  })

  // ── Crear productos de ejemplo ────────────────────
  const productosEjemplo = [
    { nombre:'Producto Ejemplo 1', categoria:'', marca:'', precio:10.00, stock:50 },
    { nombre:'Producto Ejemplo 2', categoria:'', marca:'', precio:25.00, stock:30 },
    { nombre:'Producto Ejemplo 3', categoria:'', marca:'', precio:15.00, stock:80 },
  ]

  for (const p of productosEjemplo) {
    await addDoc(collection(db, 'productos'), {
      ...p,
      descripcion: '',
      tenantId:    uid,
      activo:      true,
      creadoEn:    serverTimestamp(),
    })
  }

  // ── Crear cliente de ejemplo ──────────────────────
  const clienteRef = await addDoc(collection(db, 'clientes'), {
    nombre:       'Cliente de ejemplo',
    tipo:         '',
    contacto:     'Contacto principal',
    telefono:     '',
    email:        '',
    direccion:    'Dirección de ejemplo',
    notas:        'Este es un cliente de ejemplo. Puedes editarlo o eliminarlo.',
    nivel:        'medio',
    deuda:        0,
    limiteCredito:0,
    lat:          10.48,
    lng:          -66.87,
    foto:         null,
    vendedorId:   uid,
    tenantId:     uid,
    activo:       true,
    ultimaVisita: serverTimestamp(),
    creadoEn:     serverTimestamp(),
  })

  // ── Crear visita de ejemplo ───────────────────────
  await addDoc(collection(db, 'visitas'), {
    clienteId:  clienteRef.id,
    vendio:     true,
    notas:      'Primera visita registrada',
    vendedorId: uid,
    tenantId:   uid,
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })

  // ── Crear ruta de ejemplo ─────────────────────────
  await addDoc(collection(db, 'rutas'), {
    nombre:    'Mi primera ruta',
    clientes:  [clienteRef.id],
    fecha:     new Date().toISOString().split('T')[0],
    estado:    'pendiente',
    km:        0,
    notas:     '',
    vendedorId:uid,
    tenantId:  uid,
    creadoEn:  serverTimestamp(),
  })

  return { esNuevo: true, tenantId: uid }
}

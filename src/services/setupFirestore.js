import {
  doc, getDoc, setDoc, collection, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase/firebase.config'

// ═══════════════════════════════════════════════════
//  SETUP AUTOMÁTICO — se ejecuta la primera vez
//  que un usuario entra a la app
// ═══════════════════════════════════════════════════

export async function setupUsuarioNuevo(user) {
  const uid = user.uid

  // ── 1. Verificar si ya existe el usuario ────────
  const usuarioRef = doc(db, 'usuarios', uid)
  const usuarioSnap = await getDoc(usuarioRef)

  if (usuarioSnap.exists()) {
    // Ya existe — no hacer nada
    return { esNuevo: false, tenantId: usuarioSnap.data().tenantId }
  }

  // ── 2. Crear documento de usuario ───────────────
  await setDoc(usuarioRef, {
    uid,
    email:     user.email || '',
    nombre:    user.displayName || user.email?.split('@')[0] || 'Usuario',
    rol:       'admin',
    tenantId:  uid,
    zona:      'Sin asignar',
    activo:    true,
    creadoEn:  serverTimestamp(),
  })

  // ── 3. Crear config del tenant ───────────────────
  const configRef = doc(db, 'config', uid)
  await setDoc(configRef, {
    tenantId: uid,
    onboardingCompleto: false,
    empresa: {
      nombre: '',
      rubro:  '',
      moneda: 'USD',
      logo:   null,
    },
    tiposCliente:       [],
    categoriasProducto: [],
    creadoEn: serverTimestamp(),
  })

  // ── 4. Crear productos de ejemplo ────────────────
  const productosEjemplo = [
    { nombre: 'Producto 1', categoria: 'cat1', marca: 'Marca A', precio: 10.00, stock: 50 },
    { nombre: 'Producto 2', categoria: 'cat1', marca: 'Marca B', precio: 25.00, stock: 30 },
    { nombre: 'Producto 3', categoria: 'cat2', marca: 'Marca A', precio: 15.00, stock: 80 },
  ]

  for (const p of productosEjemplo) {
    await addDoc(collection(db, 'productos'), {
      ...p,
      tenantId: uid,
      activo:   true,
      creadoEn: serverTimestamp(),
    })
  }

  // ── 5. Crear cliente de ejemplo ──────────────────
  const clienteRef = await addDoc(collection(db, 'clientes'), {
    tenantId:     uid,
    vendedorId:   uid,
    nombre:       'Cliente de ejemplo',
    tipo:         'tipo1',
    contacto:     'Contacto principal',
    telefono:     '+58 412-000-0000',
    direccion:    'Dirección de ejemplo',
    lat:          10.48,
    lng:          -66.87,
    nivel:        'medio',
    deuda:        0,
    notas:        'Este es un cliente de ejemplo. Puedes editarlo o eliminarlo.',
    activo:       true,
    ultimaVisita: serverTimestamp(),
    creadoEn:     serverTimestamp(),
  })

  // ── 6. Crear visita de ejemplo ───────────────────
  await addDoc(collection(db, 'visitas'), {
    tenantId:   uid,
    vendedorId: uid,
    clienteId:  clienteRef.id,
    vendio:     true,
    notas:      'Primera visita de ejemplo',
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })

  // ── 7. Crear ruta de ejemplo ─────────────────────
  await addDoc(collection(db, 'rutas'), {
    tenantId:   uid,
    vendedorId: uid,
    nombre:     'Mi primera ruta',
    fecha:      new Date().toISOString().split('T')[0],
    estado:     'pendiente',
    km:         0,
    clientes:   [clienteRef.id],
    creadoEn:   serverTimestamp(),
  })

  console.log('✅ Setup completado para:', uid)
  return { esNuevo: true, tenantId: uid }
}

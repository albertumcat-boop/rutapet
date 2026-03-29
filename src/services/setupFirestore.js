import {
  doc, getDoc, setDoc, collection, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase/firebase.config'

export async function setupUsuarioNuevo(user) {
  const uid = user.uid

  const usuarioRef  = doc(db, 'usuarios', uid)
  const usuarioSnap = await getDoc(usuarioRef)

  if (usuarioSnap.exists()) {
    return { esNuevo: false, tenantId: usuarioSnap.data().tenantId }
  }

  await setDoc(usuarioRef, {
    uid,
    email:    user.email || '',
    nombre:   user.displayName || user.email?.split('@')[0] || 'Usuario',
    rol:      'admin',
    tenantId: uid,
    zona:     'Sin asignar',
    activo:   true,
    creadoEn: serverTimestamp(),
  })

  await setDoc(doc(db, 'config', uid), {
    tenantId:           uid,
    onboardingCompleto: false,
    empresa:            { nombre:'', rubro:'', moneda:'USD', logo:null },
    tiposCliente:       [],
    categoriasProducto: [],
    creadoEn:           serverTimestamp(),
  })

  const productosEjemplo = [
    { nombre:'Producto 1', categoria:'cat1', marca:'Marca A', precio:10.00, stock:50 },
    { nombre:'Producto 2', categoria:'cat1', marca:'Marca B', precio:25.00, stock:30 },
    { nombre:'Producto 3', categoria:'cat2', marca:'Marca A', precio:15.00, stock:80 },
  ]
  for (const p of productosEjemplo) {
    await addDoc(collection(db, 'productos'), {
      ...p, tenantId:uid, activo:true, creadoEn:serverTimestamp(),
    })
  }

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
    notas:        'Cliente de ejemplo. Puedes editarlo o eliminarlo.',
    activo:       true,
    ultimaVisita: serverTimestamp(),
    creadoEn:     serverTimestamp(),
  })

  await addDoc(collection(db, 'visitas'), {
    tenantId:   uid,
    vendedorId: uid,
    clienteId:  clienteRef.id,
    vendio:     true,
    notas:      'Primera visita de ejemplo',
    fecha:      serverTimestamp(),
    creadoEn:   serverTimestamp(),
  })

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

  return { esNuevo: true, tenantId: uid }
}

/**
 * setupFirestore.js — Setup automático primer login
 * Auditado: idempotente, manejo de errores, datos limpios
 * Fase 4: detecta invitación pendiente y vincula al vendedor a la empresa
 */
import {
  doc, getDoc, setDoc, collection, addDoc, getDocs,
  query, where, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase.config'

// ── Detectar invitación pendiente por email ────────────────────
async function aceptarInvitacionPorEmail(email, uid) {
  if (!email) return null
  try {
    const q    = query(
      collection(db, 'invitaciones'),
      where('emailInvitado', '==', email.toLowerCase()),
      where('estado',        '==', 'pendiente')
    )
    const snap = await getDocs(q)
    if (snap.empty) return null

    const invDoc  = snap.docs[0]
    const inv     = invDoc.data()

    // Aceptar la invitación
    await updateDoc(invDoc.ref, {
      estado:     'aceptada',
      aceptadoEn: serverTimestamp(),
      vendedorId: uid,
    })

    return { empresaId: inv.empresaId, adminId: inv.adminId }
  } catch (err) {
    console.warn('aceptarInvitacionPorEmail error:', err)
    return null
  }
}

export async function setupUsuarioNuevo(user) {
  if (!user?.uid) throw new Error('Usuario inválido')

  const uid   = user.uid
  const email = user.email || ''

  // Verificar si ya existe
  const usuarioRef  = doc(db, 'usuarios', uid)
  const usuarioSnap = await getDoc(usuarioRef)

  if (usuarioSnap.exists()) {
    // Ya existe — no hacer nada, solo retornar tenantId
    return { esNuevo: false, tenantId: usuarioSnap.data().tenantId || uid }
  }

  // ── Detectar si hay invitación pendiente ──────────────────────
  const invitacion = await aceptarInvitacionPorEmail(email, uid)

  if (invitacion) {
    // Es un vendedor invitado → vincular a la empresa
    await setDoc(usuarioRef, {
      uid,
      email,
      nombre:    user.displayName || email.split('@')[0] || 'Vendedor',
      rol:       'vendedor',
      empresaId: invitacion.empresaId,
      tenantId:  uid,
      zona:      'Sin asignar',
      activo:    true,
      creadoEn:  serverTimestamp(),
    })
    return { esNuevo: true, tenantId: uid, esVendedor: true, empresaId: invitacion.empresaId }
  }

  // ── Usuario nuevo (admin / independiente) ─────────────────────
  await setDoc(usuarioRef, {
    uid,
    email,
    nombre:   user.displayName || email.split('@')[0] || 'Usuario',
    rol:      'admin',
    empresaId: uid,   // su propia empresa = su uid
    tenantId:  uid,
    zona:      'Sin asignar',
    activo:    true,
    creadoEn:  serverTimestamp(),
  })

  // ── Config inicial ──────────────────────────────────────────
  await setDoc(doc(db, 'config', uid), {
    tenantId:           uid,
    onboardingCompleto: false,
    empresa: { nombre: '', rubro: '', moneda: 'USD', logo: null },
    tiposCliente:       [],
    categoriasProducto: [],
    comisionPct:        5,
    creadoEn:           serverTimestamp(),
  })

  // ── Empresa (para multi-usuario) ────────────────────────────
  await setDoc(doc(db, 'empresas', uid), {
    nombre:   '',
    adminId:  uid,
    activo:   true,
    creadoEn: serverTimestamp(),
  })

  // ── Productos de ejemplo (veterinarios) ─────────────────────
  const productosEjemplo = [
    {
      nombre: 'Amoxicilina 250mg/5ml', categoria: '', marca: 'Lab. Vet',
      precio: 8.50, stock: 50, stockMinimo: 10,
      principioActivo: 'Amoxicilina', concentracion: '250mg/5ml',
      presentacion: 'Frasco 120ml', unidad: 'frasco',
      esMedicamento: true, requiereReceta: true, cadenaFrio: false,
    },
    {
      nombre: 'Ivermectina 1% Injectable', categoria: '', marca: 'Lab. Vet',
      precio: 12.00, stock: 30, stockMinimo: 5,
      principioActivo: 'Ivermectina', concentracion: '1%',
      presentacion: 'Frasco 50ml', unidad: 'frasco',
      esMedicamento: true, requiereReceta: false, cadenaFrio: false,
    },
    {
      nombre: 'Vacuna Antirrábica', categoria: '', marca: 'Biovet',
      precio: 6.00, stock: 100, stockMinimo: 20,
      principioActivo: 'Virus rábico inactivado', concentracion: '1 dosis',
      presentacion: 'Vial 1ml', unidad: 'ampolla',
      esMedicamento: true, requiereReceta: false, cadenaFrio: true,
    },
  ]

  for (const p of productosEjemplo) {
    await addDoc(collection(db, 'productos'), {
      ...p, descripcion: '', lote: '', fechaVencimiento: '',
      registroSanitario: '', precios: {},
      tenantId: uid, activo: true, creadoEn: serverTimestamp(),
    })
  }

  // ── Cliente de ejemplo ──────────────────────────────────────
  const clienteRef = await addDoc(collection(db, 'clientes'), {
    nombre: 'Clínica Veterinaria Ejemplo', tipo: '', contacto: 'Dr. García',
    telefono: '', email: '', direccion: 'Av. Principal 123',
    notas: 'Cliente de ejemplo. Puedes editarlo o eliminarlo.',
    nivel: 'alto', deuda: 0, limiteCredito: 500,
    condicionPago: '30 días', ruc: '', veterinario: 'Dr. García',
    tipoEstablecimiento: 'Clínica',
    lat: null, lng: null, foto: null,
    vendedorId: uid, tenantId: uid, activo: true,
    ultimaVisita: serverTimestamp(), creadoEn: serverTimestamp(),
  })

  // ── Visita de ejemplo ───────────────────────────────────────
  await addDoc(collection(db, 'visitas'), {
    clienteId: clienteRef.id, vendio: true,
    notas: 'Primera visita de demostración',
    firma: null, vendedorId: uid, tenantId: uid,
    fecha: serverTimestamp(), creadoEn: serverTimestamp(),
  })

  // ── Ruta de ejemplo ─────────────────────────────────────────
  await addDoc(collection(db, 'rutas'), {
    nombre: 'Ruta Norte — Zona Veterinaria',
    clientes: [clienteRef.id],
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente', km: 0, notas: '',
    vendedorId: uid, tenantId: uid, creadoEn: serverTimestamp(),
  })

  return { esNuevo: true, tenantId: uid }
}

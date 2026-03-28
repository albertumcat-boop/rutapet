export const CURRENT_USER = {
  id:     'v1',
  nombre: 'Carlos Mendoza',
  email:  'carlos@rutapet.com',
  role:   'vendedor',
  avatar: 'CM',
  zona:   'Caracas Norte',
}

export const CLIENTES = [
  { id:'c1', vendedorId:'v1', nombre:'Veterinaria San Marcos', tipo:'veterinaria', contacto:'Dr. Ramírez', telefono:'+58 412-555-0111', direccion:'Av. Libertador, Las Mercedes', lat:10.491, lng:-66.879, nivel:'alto',  ultimaVisita:'2025-03-20', deuda:0,    notas:'Cliente VIP, siempre paga puntual.' },
  { id:'c2', vendedorId:'v1', nombre:'Pet Shop La Mascota',    tipo:'petshop',      contacto:'Ana González',  telefono:'+58 414-555-0222', direccion:'CC El Recreo, Local 24',       lat:10.484, lng:-66.891, nivel:'alto',  ultimaVisita:'2025-03-22', deuda:45.50,notas:'Prefiere pago móvil.' },
  { id:'c3', vendedorId:'v1', nombre:'Agropecuaria El Campo',  tipo:'agropecuaria', contacto:'Miguel Torres', telefono:'+58 416-555-0333', direccion:'Calle Real de Petare 45',      lat:10.498, lng:-66.813, nivel:'medio', ultimaVisita:'2025-03-15', deuda:120,  notas:'Compra alimentos a granel.' },
  { id:'c4', vendedorId:'v1', nombre:'Clínica Mascotas Felices',tipo:'veterinaria', contacto:'Dra. López',   telefono:'+58 412-555-0444', direccion:'Av. Principal El Paraíso',     lat:10.475, lng:-66.872, nivel:'medio', ultimaVisita:'2025-03-10', deuda:200,  notas:'Necesita recordatorio de pago.' },
  { id:'c5', vendedorId:'v1', nombre:'Pet Zone Chacao',        tipo:'petshop',      contacto:'Roberto Jiménez',telefono:'+58 424-555-0555',direccion:'Av. Francisco de Miranda',     lat:10.493, lng:-66.845, nivel:'bajo',  ultimaVisita:'2025-02-28', deuda:0,    notas:'Compra poco, requiere seguimiento.' },
  { id:'c6', vendedorId:'v1', nombre:'Mundo Animal Altamira',  tipo:'petshop',      contacto:'Sandra Peña',  telefono:'+58 414-555-0666', direccion:'Av. Luis Roche, Altamira',     lat:10.501, lng:-66.854, nivel:'alto',  ultimaVisita:'2025-03-24', deuda:0,    notas:'Siempre pide descuento en volumen.' },
  { id:'c7', vendedorId:'v1', nombre:'Veterinaria San Agustín',tipo:'veterinaria',  contacto:'Dr. Morales',  telefono:'+58 416-555-0777', direccion:'Calle El Río, San Agustín',    lat:10.481, lng:-66.921, nivel:'bajo',  ultimaVisita:'2025-02-14', deuda:75,   notas:'Inactivo hace más de 40 días.' },
  { id:'c8', vendedorId:'v1', nombre:'Agro & Pet Baruta',      tipo:'agropecuaria', contacto:'Luisa Martínez',telefono:'+58 424-555-0888',direccion:'Calle Páez, Baruta',           lat:10.456, lng:-66.887, nivel:'medio', ultimaVisita:'2025-03-18', deuda:55,   notas:'Interesada en línea de medicamentos.' },
]

export const PRODUCTOS = [
  { id:'p1',  nombre:'Royal Canin Adult 15kg',   categoria:'alimento',  marca:'Royal Canin', precio:35.00, stock:45  },
  { id:'p2',  nombre:'ProPlan Puppy 8kg',         categoria:'alimento',  marca:'Purina',      precio:28.50, stock:30  },
  { id:'p3',  nombre:'Pedigree Adult 10kg',       categoria:'alimento',  marca:'Pedigree',    precio:18.00, stock:60  },
  { id:'p4',  nombre:'Antipulgas Frontline Plus', categoria:'medicina',  marca:'Boehringer',  precio:12.00, stock:80  },
  { id:'p5',  nombre:'Desparasitante Drontal',    categoria:'medicina',  marca:'Bayer',       precio:8.50,  stock:100 },
  { id:'p6',  nombre:'Vitaminas Nutriflex',       categoria:'medicina',  marca:'Vetoquinol',  precio:15.00, stock:40  },
  { id:'p7',  nombre:'Collar Antipulgas Seresto', categoria:'accesorio', marca:'Bayer',       precio:22.00, stock:25  },
  { id:'p8',  nombre:'Cama para perro L',         categoria:'accesorio', marca:'PetHome',     precio:30.00, stock:15  },
  { id:'p9',  nombre:"Hill's Science Diet 8kg",   categoria:'alimento',  marca:"Hill's",      precio:42.00, stock:20  },
  { id:'p10', nombre:'Shampoo Antipulgas 500ml',  categoria:'accesorio', marca:'Tropiclean',  precio:9.00,  stock:55  },
  { id:'p11', nombre:'Dentastix Pedigree x7',     categoria:'alimento',  marca:'Pedigree',    precio:5.50,  stock:120 },
  { id:'p12', nombre:'Vacuna Antirrábica',        categoria:'medicina',  marca:'Merial',      precio:7.00,  stock:200 },
]

export const VENTAS = [
  { id:'vt1', clienteId:'c1', fecha:'2025-03-20', items:[{pId:'p1',qty:3},{pId:'p4',qty:5}],    total:165.00, metodoPago:'transferencia', estado:'pagado'    },
  { id:'vt2', clienteId:'c2', fecha:'2025-03-22', items:[{pId:'p2',qty:2},{pId:'p7',qty:3}],    total:123.00, metodoPago:'pagoMovil',     estado:'parcial'   },
  { id:'vt3', clienteId:'c3', fecha:'2025-03-15', items:[{pId:'p3',qty:5},{pId:'p5',qty:10}],   total:175.00, metodoPago:'efectivo',      estado:'pendiente' },
  { id:'vt4', clienteId:'c6', fecha:'2025-03-24', items:[{pId:'p9',qty:2},{pId:'p11',qty:10}],  total:139.00, metodoPago:'transferencia', estado:'pagado'    },
  { id:'vt5', clienteId:'c4', fecha:'2025-03-10', items:[{pId:'p12',qty:20},{pId:'p6',qty:5}],  total:215.00, metodoPago:'transferencia', estado:'pendiente' },
  { id:'vt6', clienteId:'c8', fecha:'2025-03-18', items:[{pId:'p5',qty:8},{pId:'p10',qty:6}],   total:122.00, metodoPago:'pagoMovil',     estado:'parcial'   },
  { id:'vt7', clienteId:'c1', fecha:'2025-03-05', items:[{pId:'p1',qty:2}],                      total:70.00,  metodoPago:'efectivo',      estado:'pagado'    },
  { id:'vt8', clienteId:'c2', fecha:'2025-03-01', items:[{pId:'p7',qty:5},{pId:'p8',qty:2}],    total:170.00, metodoPago:'efectivo',      estado:'pagado'    },
]

export const VISITAS = [
  { id:'vi1', clienteId:'c1', fecha:'2025-03-20', vendio:true,  notas:'Pedido completo, muy satisfecho.'  },
  { id:'vi2', clienteId:'c5', fecha:'2025-03-19', vendio:false, notas:'Dueño no estaba, reagendar.'       },
  { id:'vi3', clienteId:'c6', fecha:'2025-03-24', vendio:true,  notas:'Compró más de lo esperado.'        },
  { id:'vi4', clienteId:'c4', fecha:'2025-03-10', vendio:true,  notas:'Pendiente factura.'                },
]

export const RUTAS = [
  { id:'r1', nombre:'Ruta Norte — Lunes',    clientes:['c6','c1','c5'], fecha:'2025-03-24', estado:'completada', km:12.4, ok:3 },
  { id:'r2', nombre:'Ruta Centro — Martes',  clientes:['c2','c4','c8'], fecha:'2025-03-25', estado:'pendiente',  km:8.7,  ok:0 },
  { id:'r3', nombre:'Ruta Este — Miércoles', clientes:['c3','c7'],      fecha:'2025-03-26', estado:'pendiente',  km:15.2, ok:0 },
]

export const VENTAS_MES = [
  { mes:'Oct', ventas:820,  meta:900  },
  { mes:'Nov', ventas:1050, meta:900  },
  { mes:'Dic', ventas:980,  meta:1000 },
  { mes:'Ene', ventas:740,  meta:1000 },
  { mes:'Feb', ventas:890,  meta:1000 },
  { mes:'Mar', ventas:1180, meta:1000 },
]

export const TOP_PRODUCTOS = [
  { nombre:'Royal Canin 15kg',     ventas:48, color:'#0FBCAA' },
  { nombre:'Antipulgas Frontline', ventas:35, color:'#F5A623' },
  { nombre:'ProPlan Puppy 8kg',    ventas:28, color:'#22C55E' },
  { nombre:'Drontal Despar.',      ventas:22, color:'#EAB308' },
  { nombre:"Hill's Science Diet",  ventas:18, color:'#A78BFA' },
]

export const PIE_CATEGORIAS = [
  { name:'Alimentos',  value:58, color:'#0FBCAA' },
  { name:'Medicina',   value:28, color:'#F5A623' },
  { name:'Accesorios', value:14, color:'#A78BFA' },
]

export const VENDEDORES_ADMIN = [
  { id:'v1', nombre:'Carlos Mendoza',  zona:'Caracas Norte', ventas:1180, cls:8,  av:'CM', activo:true  },
  { id:'v2', nombre:'María Rodríguez', zona:'Caracas Sur',   ventas:940,  cls:11, av:'MR', activo:true  },
  { id:'v3', nombre:'José Pérez',      zona:'Aragua',        ventas:760,  cls:6,  av:'JP', activo:false },
]

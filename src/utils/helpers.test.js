/**
 * helpers.test.js — Tests unitarios para funciones utilitarias
 */
import { describe, it, expect } from 'vitest'
import {
  fmtUSD, daysSince, fmtFecha, sumVentas, sumDeuda,
  ticketPromedio, clientesConDeuda, clientesInactivos,
  pctCambio, distanciaKm, fmtDistancia, capitalize,
  truncar, iniciales,
} from './helpers'

// ─── fmtUSD ───────────────────────────────────────────────────────────────────
describe('fmtUSD', () => {
  it('formatea número positivo', () => expect(fmtUSD(100)).toBe('$100.00'))
  it('formatea decimal',          () => expect(fmtUSD(9.5)).toBe('$9.50'))
  it('formatea cero',             () => expect(fmtUSD(0)).toBe('$0.00'))
  it('retorna $0.00 para NaN',    () => expect(fmtUSD('abc')).toBe('$0.00'))
  it('retorna $0.00 para null',   () => expect(fmtUSD(null)).toBe('$0.00'))
  it('acepta string numérico',    () => expect(fmtUSD('25.99')).toBe('$25.99'))
})

// ─── daysSince ────────────────────────────────────────────────────────────────
describe('daysSince', () => {
  it('retorna 0 para null',      () => expect(daysSince(null)).toBe(0))
  it('retorna 0 para undefined', () => expect(daysSince(undefined)).toBe(0))
  it('retorna 0 para fecha inválida', () => expect(daysSince('no-es-fecha')).toBe(0))
  it('retorna ~0 para fecha de hoy', () => {
    expect(daysSince(new Date())).toBe(0)
  })
  it('retorna días correctos', () => {
    const hace5 = new Date(Date.now() - 5 * 86_400_000)
    expect(daysSince(hace5)).toBe(5)
  })
  it('acepta timestamp Firestore simulado', () => {
    const hace2 = new Date(Date.now() - 2 * 86_400_000)
    const firestoreTs = { toDate: () => hace2 }
    expect(daysSince(firestoreTs)).toBe(2)
  })
})

// ─── fmtFecha ─────────────────────────────────────────────────────────────────
describe('fmtFecha', () => {
  it('retorna — para null',      () => expect(fmtFecha(null)).toBe('—'))
  it('retorna — para undefined', () => expect(fmtFecha(undefined)).toBe('—'))
  it('formatea Date válida',     () => {
    const d = new Date(2024, 0, 15) // 15 ene 2024
    const s = fmtFecha(d)
    expect(s).toMatch(/15/)
    expect(s).toMatch(/2024/)
  })
  it('acepta timestamp Firestore', () => {
    const d = new Date(2024, 5, 1)
    const ts = { toDate: () => d }
    expect(fmtFecha(ts)).toMatch(/2024/)
  })
})

// ─── sumVentas ────────────────────────────────────────────────────────────────
describe('sumVentas', () => {
  it('suma correctamente',        () => expect(sumVentas([{ total: 10 }, { total: 20 }])).toBe(30))
  it('ignora valores no numéricos', () => expect(sumVentas([{ total: 'x' }, { total: 5 }])).toBe(5))
  it('retorna 0 para array vacío', () => expect(sumVentas([])).toBe(0))
  it('retorna 0 para null',        () => expect(sumVentas(null)).toBe(0))
})

// ─── sumDeuda ─────────────────────────────────────────────────────────────────
describe('sumDeuda', () => {
  it('suma deudas',               () => expect(sumDeuda([{ deuda: 50 }, { deuda: 30 }])).toBe(80))
  it('retorna 0 para array vacío', () => expect(sumDeuda([])).toBe(0))
  it('retorna 0 para null',        () => expect(sumDeuda(null)).toBe(0))
})

// ─── ticketPromedio ───────────────────────────────────────────────────────────
describe('ticketPromedio', () => {
  it('calcula promedio',           () => expect(ticketPromedio([{ total: 10 }, { total: 20 }])).toBe(15))
  it('retorna 0 para array vacío', () => expect(ticketPromedio([])).toBe(0))
  it('retorna 0 para null',        () => expect(ticketPromedio(null)).toBe(0))
})

// ─── clientesConDeuda ─────────────────────────────────────────────────────────
describe('clientesConDeuda', () => {
  const lista = [{ deuda: 0 }, { deuda: 100 }, { deuda: null }, { deuda: 50 }]
  it('filtra clientes con deuda > 0', () => {
    expect(clientesConDeuda(lista)).toHaveLength(2)
  })
  it('retorna [] para null', () => {
    expect(clientesConDeuda(null)).toEqual([])
  })
})

// ─── clientesInactivos ────────────────────────────────────────────────────────
describe('clientesInactivos', () => {
  it('retorna [] para null', () => expect(clientesInactivos(null)).toEqual([]))
  it('filtra correctamente', () => {
    const hace40 = new Date(Date.now() - 40 * 86_400_000)
    const hace10 = new Date(Date.now() - 10 * 86_400_000)
    const lista = [{ ultimaVisita: hace40 }, { ultimaVisita: hace10 }]
    expect(clientesInactivos(lista, 30)).toHaveLength(1)
  })
})

// ─── pctCambio ────────────────────────────────────────────────────────────────
describe('pctCambio', () => {
  it('calcula incremento',   () => expect(pctCambio(120, 100)).toBe(20))
  it('calcula decremento',   () => expect(pctCambio(80, 100)).toBe(-20))
  it('retorna 0 si base 0', () => expect(pctCambio(50, 0)).toBe(0))
})

// ─── distanciaKm ──────────────────────────────────────────────────────────────
describe('distanciaKm', () => {
  it('calcula distancia aproximada entre Caracas y Maracay (~95 km)', () => {
    const d = distanciaKm(10.48, -66.87, 10.24, -67.59)
    expect(d).toBeGreaterThan(70)
    expect(d).toBeLessThan(120)
  })
  it('retorna 0 si coordenadas nulas', () => {
    expect(distanciaKm(null, null, 10, -66)).toBe(0)
  })
  it('retorna ~0 para misma coordenada', () => {
    expect(distanciaKm(10, -66, 10, -66)).toBeCloseTo(0, 1)
  })
})

// ─── fmtDistancia ─────────────────────────────────────────────────────────────
describe('fmtDistancia', () => {
  it('muestra metros para < 1 km', () => expect(fmtDistancia(0.5)).toBe('500 m'))
  it('muestra km para >= 1 km',    () => expect(fmtDistancia(3.456)).toBe('3.5 km'))
})

// ─── capitalize ───────────────────────────────────────────────────────────────
describe('capitalize', () => {
  it('capitaliza primera letra',  () => expect(capitalize('hola mundo')).toBe('Hola mundo'))
  it('retorna "" para cadena vacía', () => expect(capitalize('')).toBe(''))
  it('retorna "" para null',       () => expect(capitalize(null)).toBe(''))
})

// ─── truncar ──────────────────────────────────────────────────────────────────
describe('truncar', () => {
  it('no trunca texto corto',  () => expect(truncar('Hola', 10)).toBe('Hola'))
  it('trunca texto largo',     () => expect(truncar('Texto muy largo aquí', 10)).toBe('Texto muy …'))
  it('retorna "" para null',   () => expect(truncar(null)).toBe(''))
})

// ─── iniciales ────────────────────────────────────────────────────────────────
describe('iniciales', () => {
  it('dos palabras',    () => expect(iniciales('Juan Pérez')).toBe('JP'))
  it('una palabra',     () => expect(iniciales('Carlos')).toBe('C'))
  it('tres palabras',   () => expect(iniciales('Ana María López')).toBe('AM'))
  it('null → ?',        () => expect(iniciales(null)).toBe('?'))
  it('vacío → ?',       () => expect(iniciales('')).toBe('?'))
})

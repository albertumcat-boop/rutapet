/**
 * CommissionsScreen.jsx — Reporte de comisiones por vendedor
 * Admin: ve todos los vendedores y sus comisiones
 * Vendedor: ve solo sus propias comisiones
 */
import { useState, useMemo } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { fmtUSD, fmtFecha } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import TopBar from '../shared/TopBar'
import { auth } from '../../../firebase/firebase.config'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function getMesActual() {
  const hoy = new Date()
  return { mes: hoy.getMonth(), anio: hoy.getFullYear() }
}

function ventasDelMes(ventas, mes, anio) {
  return ventas.filter(v => {
    const fecha = v.fecha?.toDate?.() || (v.fecha ? new Date(v.fecha) : null)
    if (!fecha) return false
    return fecha.getMonth() === mes && fecha.getFullYear() === anio
  })
}

export default function CommissionsScreen({ onBack }) {
  const { ventas, loading }  = useAppData()
  const { config, isAdmin }  = useConfig()
  const user = auth.currentUser

  const { mes: mesHoy, anio: anioHoy } = getMesActual()
  const [mes,  setMes]  = useState(mesHoy)
  const [anio, setAnio] = useState(anioHoy)

  // Porcentaje de comisión global (configurable desde Admin)
  const pctComision = Number(config.comisionPct) || 5

  const ventasMes = useMemo(() => ventasDelMes(ventas, mes, anio), [ventas, mes, anio])

  // Agrupar ventas por vendedorId
  const porVendedor = useMemo(() => {
    const map = {}
    ventasMes.forEach(v => {
      const vid = v.vendedorId || 'desconocido'
      if (!map[vid]) map[vid] = { vendedorId: vid, ventas: [], total: 0, comision: 0 }
      map[vid].ventas.push(v)
      map[vid].total     += Number(v.total) || 0
      map[vid].comision  += ((Number(v.total) || 0) * pctComision) / 100
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [ventasMes, pctComision])

  // Si no es admin, filtra solo el vendedor actual
  const filas = isAdmin
    ? porVendedor
    : porVendedor.filter(r => r.vendedorId === user?.uid)

  const totalMes     = filas.reduce((s, r) => s + r.total, 0)
  const comisionMes  = filas.reduce((s, r) => s + r.comision, 0)

  const prevMes = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1) }
    else setMes(m => m - 1)
  }
  const nextMes = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1) }
    else setMes(m => m + 1)
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar title="Comisiones" onBack={onBack} />

      {/* Selector de mes */}
      <div style={{ background: C.navy, padding: '0 14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={prevMes} style={{ background: '#ffffff15', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>
            ‹
          </button>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
            {MESES[mes]} {anio}
          </span>
          <button onClick={nextMes} style={{ background: '#ffffff15', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>
            ›
          </button>
        </div>

        {/* KPIs del mes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ background: '#ffffff10', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: C.teal, margin: 0 }}>{fmtUSD(totalMes)}</p>
            <p style={{ fontSize: 10, color: C.gray400, margin: '3px 0 0' }}>Ventas</p>
          </div>
          <div style={{ background: '#ffffff10', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#22C55E', margin: 0 }}>{fmtUSD(comisionMes)}</p>
            <p style={{ fontSize: 10, color: C.gray400, margin: '3px 0 0' }}>Comisión</p>
          </div>
          <div style={{ background: '#ffffff10', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>{pctComision}%</p>
            <p style={{ fontSize: 10, color: C.gray400, margin: '3px 0 0' }}>Tasa</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ width: 32, height: 32, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : filas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Icon name="activity" size={36} color={C.gray400} />
            <p style={{ fontSize: 14, color: C.gray400, marginTop: 10 }}>Sin ventas en {MESES[mes]} {anio}</p>
          </div>
        ) : (
          <>
            {filas.map((fila, idx) => (
              <Card key={fila.vendedorId}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Ranking badge */}
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: idx === 0 ? '#FEF3C7' : C.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: idx === 0 ? '#D97706' : C.gray400 }}>
                      {idx === 0 ? '🥇' : `#${idx + 1}`}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.gray800, margin: 0 }}>
                      {isAdmin
                        ? (fila.vendedorId === user?.uid ? 'Tú (Admin)' : `Vendedor ${fila.vendedorId.slice(-6)}`)
                        : 'Mi comisión'}
                    </p>
                    <p style={{ fontSize: 11, color: C.gray400, margin: '2px 0 0' }}>
                      {fila.ventas.length} venta{fila.ventas.length !== 1 ? 's' : ''} · {pctComision}% de comisión
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 15, fontWeight: 900, color: C.teal, margin: 0 }}>{fmtUSD(fila.total)}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#22C55E', margin: '2px 0 0' }}>
                      +{fmtUSD(fila.comision)}
                    </p>
                  </div>
                </div>

                {/* Desglose de ventas */}
                {fila.ventas.length <= 5 && (
                  <div style={{ marginTop: 10, borderTop: `1px solid ${C.gray100}`, paddingTop: 8 }}>
                    {fila.ventas.map(v => (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span style={{ fontSize: 11, color: C.gray400 }}>{fmtFecha(v.fecha)}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.gray600 }}>{fmtUSD(v.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}

            {/* Nota de configuración */}
            {isAdmin && (
              <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '12px 14px', marginTop: 8, border: '1px solid #BFDBFE' }}>
                <p style={{ fontSize: 12, color: '#1E40AF', margin: 0, fontWeight: 600 }}>
                  💡 Puedes cambiar el % de comisión desde Configuración → Empresa
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ height: 90 }} />
    </div>
  )
}

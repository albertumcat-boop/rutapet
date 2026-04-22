import { useState } from 'react'
import { C, nivelColor } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { useConfig } from '../../context/ConfigContext'
import { calcularPorcentajeInventario, colorPorcentaje } from '../../services/firestore'
import { fmtUSD, daysSince } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function ClientsScreen({ nav }) {
  const { clientes, inventario, loading } = useAppData()
  const { config }                        = useConfig()
  const [search, setSearch] = useState('')
  const [tipo,   setTipo]   = useState('todos')
  const [orden,  setOrden]  = useState('nombre')

  const getTipoColor = (key) => config.tiposCliente.find(t => t.key === key)?.color || C.gray400
  const getTipoIcon  = (key) => config.tiposCliente.find(t => t.key === key)?.icon  || 'users'
  const getTipoLabel = (key) => config.tiposCliente.find(t => t.key === key)?.label || key

  const getInvPct = (clienteId) => {
    const inv = inventario.filter(i => i.clienteId === clienteId)
    return calcularPorcentajeInventario(inv)
  }

  let filtered = clientes.filter(c =>
    (tipo === 'todos' || c.tipo === tipo) &&
    (c.nombre || '').toLowerCase().includes(search.toLowerCase())
  )

  // Ordenar
  if (orden === 'inventario') {
    filtered = [...filtered].sort((a,b) => getInvPct(a.id) - getInvPct(b.id))
  } else if (orden === 'deuda') {
    filtered = [...filtered].sort((a,b) => (b.deuda||0) - (a.deuda||0))
  } else if (orden === 'visita') {
    filtered = [...filtered].sort((a,b) => {
      const da = daysSince(a.ultimaVisita?.toDate?.() || a.ultimaVisita || new Date())
      const db = daysSince(b.ultimaVisita?.toDate?.() || b.ultimaVisita || new Date())
      return db - da
    })
  }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 14px', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h1 style={{ fontSize:20, fontWeight:900, margin:0 }}>Clientes</h1>
          <Button icon="plus" size="sm" onClick={() => nav('addClient')}>Nuevo</Button>
        </div>
        <div style={{ display:'flex', alignItems:'center', background:'#ffffff20', borderRadius:12, padding:'8px 12px', gap:8, marginBottom:10 }}>
          <Icon name="search" size={16} color={C.gray400} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
            style={{ background:'none', border:'none', color:'#fff', fontSize:14, flex:1, fontFamily:'inherit' }} />
        </div>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          <button onClick={() => setTipo('todos')}
            style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', background:tipo==='todos'?C.teal:'#ffffff20', color:'#fff', border:'none', flexShrink:0 }}>
            Todos
          </button>
          {config.tiposCliente.map(t => (
            <button key={t.key} onClick={() => setTipo(t.key)}
              style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', background:tipo===t.key?t.color:'#ffffff20', color:'#fff', border:'none', flexShrink:0 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}` }}>
        {[
          { label:'Total', val:clientes.length,                                color:C.gray800 },
          { label:'Alto',  val:clientes.filter(c=>c.nivel==='alto').length,   color:C.green   },
          { label:'Medio', val:clientes.filter(c=>c.nivel==='medio').length,  color:'#EAB308' },
          { label:'Bajo',  val:clientes.filter(c=>c.nivel==='bajo').length,   color:C.red     },
        ].map((s,i) => (
          <div key={i} style={{ flex:1, textAlign:'center', padding:'10px 0', borderRight:i<3?`1px solid ${C.gray200}`:'none' }}>
            <p style={{ fontSize:18, fontWeight:900, color:s.color, margin:0 }}>{s.val}</p>
            <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Orden */}
      <div style={{ background:'#fff', padding:'8px 14px', borderBottom:`1px solid ${C.gray200}`, display:'flex', gap:6, overflowX:'auto' }}>
        <span style={{ fontSize:11, color:C.gray400, flexShrink:0, display:'flex', alignItems:'center' }}>Ordenar:</span>
        {[['nombre','Nombre'],['inventario','Inventario ↑'],['deuda','Deuda ↓'],['visita','Sin visita']].map(([k,l]) => (
          <button key={k} onClick={() => setOrden(k)}
            style={{ padding:'4px 10px', borderRadius:16, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', background:orden===k?C.teal+'15':'transparent', color:orden===k?C.teal:C.gray400, border:`1px solid ${orden===k?C.teal:C.gray200}`, flexShrink:0 }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 14px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <span style={{ width:32, height:32, border:`3px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            <p style={{ fontSize:13, color:C.gray400, marginTop:12 }}>Cargando clientes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <Icon name="users" size={36} color={C.gray400} />
            <p style={{ fontSize:14, color:C.gray400, marginTop:10 }}>
              {clientes.length === 0 ? 'Aún no tienes clientes' : 'Sin resultados'}
            </p>
            {clientes.length === 0 && (
              <Button icon="plus" style={{ marginTop:14 }} onClick={() => nav('addClient')}>
                Agregar primer cliente
              </Button>
            )}
          </div>
        ) : filtered.map(c => {
          const dias   = daysSince(c.ultimaVisita?.toDate?.() || c.ultimaVisita || new Date())
          const tColor = getTipoColor(c.tipo)
          const tIcon  = getTipoIcon(c.tipo)
          const tLabel = getTipoLabel(c.tipo)
          const pct    = getInvPct(c.id)
          const invs   = inventario.filter(i => i.clienteId === c.id)
          const pctCol = colorPorcentaje(pct)

          return (
            <Card key={c.id} onClick={() => nav('clientDetail', c)}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                {/* Ícono con indicador de inventario */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:46, height:46, borderRadius:14, background:tColor+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name={tIcon} size={22} color={tColor} />
                  </div>
                  {invs.length > 0 && (
                    <div style={{ position:'absolute', bottom:-2, right:-2, width:16, height:16, borderRadius:'50%', background:pctCol, border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:7, color:'#fff', fontWeight:900 }}>{pct}</span>
                    </div>
                  )}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>{c.nombre}</span>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:nivelColor(c.nivel), flexShrink:0 }} />
                  </div>
                  <p style={{ fontSize:12, color:C.gray600, margin:'2px 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {c.contacto ? `${c.contacto} · ` : ''}{tLabel}
                  </p>
                  <div style={{ display:'flex', gap:8, marginTop:4, flexWrap:'wrap', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Icon name="calendar" size={11} color={dias>30?C.red:C.gray400} />
                      <span style={{ fontSize:11, color:dias>30?C.red:C.gray400, fontWeight:dias>30?700:400 }}>
                        {dias===0?'Hoy':`Hace ${dias}d`}
                      </span>
                    </div>
                    {c.deuda > 0 && <Badge bg="#FEE2E2" txt="#991B1B">Debe {fmtUSD(c.deuda)}</Badge>}
                    {invs.length > 0 && (
                      <Badge bg={pctCol+'20'} txt={pctCol}>{pct}% inv.</Badge>
                    )}
                  </div>

                  {/* Mini barra inventario */}
                  {invs.length > 0 && (
                    <div style={{ height:3, background:C.gray100, borderRadius:2, marginTop:6, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:pctCol, borderRadius:2 }} />
                    </div>
                  )}
                </div>
                <Icon name="chevron" size={16} color={C.gray400} />
              </div>
            </Card>
          )
        })}
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

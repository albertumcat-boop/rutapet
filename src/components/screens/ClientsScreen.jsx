import { useState } from 'react'
import { C, nivelColor, tipoColor, tipoIconName } from '../../constants/colors'
import { CLIENTES } from '../../constants/data'
import { fmtUSD, daysSince } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function ClientsScreen({ nav }) {
  const [search, setSearch] = useState('')
  const [tipo,   setTipo]   = useState('todos')

  const filtered = CLIENTES.filter((c) =>
    (tipo === 'todos' || c.tipo === tipo) &&
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <div style={{ background: C.navy, padding: '20px 14px 14px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Clientes</h1>
          <Button icon="plus" size="sm" onClick={() => nav('addClient')}>Nuevo</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff20', borderRadius: 12, padding: '8px 12px', gap: 8, marginBottom: 10 }}>
          <Icon name="search" size={16} color={C.gray400} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, flex: 1, fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {['todos','veterinaria','petshop','agropecuaria'].map((t) => (
            <button key={t} onClick={() => setTipo(t)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', background: tipo === t ? C.teal : '#ffffff20', color: '#fff', border: 'none', flexShrink: 0 }}>
              {t === 'todos' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', background: '#fff', borderBottom: `1px solid ${C.gray200}` }}>
        {[
          { label:'Total', val:CLIENTES.length,                                color:C.gray800 },
          { label:'Alto',  val:CLIENTES.filter(c=>c.nivel==='alto').length,  color:C.green   },
          { label:'Medio', val:CLIENTES.filter(c=>c.nivel==='medio').length, color:C.yellow  },
          { label:'Bajo',  val:CLIENTES.filter(c=>c.nivel==='bajo').length,  color:C.red     },
        ].map((s, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', padding:'10px 0', borderRight: i<3?`1px solid ${C.gray200}`:'none' }}>
            <p style={{ fontSize:18, fontWeight:900, color:s.color, margin:0 }}>{s.val}</p>
            <p style={{ fontSize:11, color:C.gray400, margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 14px' }}>
        {filtered.length === 0
          ? <div style={{ textAlign:'center', padding:'40px 0' }}><Icon name="users" size={36} color={C.gray400} /><p style={{ fontSize:14, color:C.gray400, marginTop:10 }}>Sin resultados</p></div>
          : filtered.map((c) => {
              const dias = daysSince(c.ultimaVisita)
              return (
                <Card key={c.id} onClick={() => nav('clientDetail', c)}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:46, height:46, borderRadius:14, background:tipoColor(c.tipo)+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name={tipoIconName(c.tipo)} size={22} color={tipoColor(c.tipo)} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>{c.nombre}</span>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:nivelColor(c.nivel) }} />
                      </div>
                      <p style={{ fontSize:12, color:C.gray600, margin:'2px 0' }}>{c.contacto} · {c.tipo}</p>
                      <div style={{ display:'flex', gap:8, marginTop:4, flexWrap:'wrap', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <Icon name="calendar" size={11} color={dias>30?C.red:C.gray400} />
                          <span style={{ fontSize:11, color:dias>30?C.red:C.gray400, fontWeight:dias>30?700:400 }}>{dias===0?'Hoy':`Hace ${dias}d`}</span>
                        </div>
                        {c.deuda>0 && <Badge bg="#FEE2E2" txt="#991B1B">Debe {fmtUSD(c.deuda)}</Badge>}
                      </div>
                    </div>
                    <Icon name="chevron" size={16} color={C.gray400} />
                  </div>
                </Card>
              )
            })}
      </div>
      <div style={{ height: 90 }} />
    </div>
  )
}

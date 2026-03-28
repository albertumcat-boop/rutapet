import { useState } from 'react'
import { C } from '../../constants/colors'
import { useAppData } from '../../hooks/useAppData'
import { agregarVenta } from '../../services/firestore'
import { fmtUSD } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

const METODOS = [
  { key:'efectivo',      label:'Efectivo',      icon:'dollar' },
  { key:'transferencia', label:'Transferencia', icon:'send'   },
  { key:'pagoMovil',     label:'Pago Móvil',    icon:'phone'  },
]

export default function AddSaleScreen({ onBack, initCId }) {
  const { clientes, productos } = useAppData()
  const [cId,    setCId]   = useState(initCId || '')
  const [items,  setItems] = useState([{ pId:'', qty:1 }])
  const [metodo, setMet]   = useState('efectivo')
  const [saving, setSaving] = useState(false)
  const [done,   setDone]  = useState(false)

  const addItem  = () => setItems(i => [...i, { pId:'', qty:1 }])
  const rmItem   = idx => setItems(i => i.filter((_,j) => j !== idx))
  const updItem  = (idx,k,v) => setItems(i => i.map((it,j) => j===idx ? {...it,[k]:v} : it))
  const total    = items.reduce((s,it) => {
    const p = productos.find(x => x.id === it.pId)
    return s + (p ? p.precio * it.qty : 0)
  }, 0)

  const handleSave = async () => {
    if (!cId)   return alert('Selecciona un cliente')
    if (!total) return alert('Agrega al menos un producto')
    setSaving(true)
    try {
      await agregarVenta({
        clienteId:  cId,
        items:      items.filter(it => it.pId),
        total,
        metodoPago: metodo,
        estado:     'pendiente',
      })
      setDone(true)
      setTimeout(onBack, 1800)
    } catch (err) {
      alert('Error: ' + err.message)
      setSaving(false)
    }
  }

  if (done) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:76, height:76, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
        <Icon name="ok_circle" size={38} color={C.green} />
      </div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.gray800 }}>¡Venta registrada!</h2>
      <p style={{ fontSize:28, fontWeight:900, color:C.teal }}>{fmtUSD(total)}</p>
    </div>
  )

  const sel = { width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, background:'#fff', fontFamily:'inherit', boxSizing:'border-box' }

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Nueva venta" onBack={onBack} />
      <div style={{ padding:14 }}>

        <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Cliente *</label>
        <select value={cId} onChange={e => setCId(e.target.value)} style={{ ...sel, marginBottom:16 }}>
          <option value="">Seleccionar cliente...</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.gray600 }}>Productos *</span>
          <button onClick={addItem} style={{ fontSize:13, color:C.teal, background:'none', border:'none', cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>+ Agregar</button>
        </div>

        {items.map((it, idx) => {
          const p = productos.find(x => x.id === it.pId)
          return (
            <Card key={idx} style={{ padding:'12px', marginBottom:8 }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <select value={it.pId} onChange={e => updItem(idx,'pId',e.target.value)} style={{ ...sel, marginBottom:8 }}>
                    <option value="">Seleccionar producto...</option>
                    {productos.map(pr => <option key={pr.id} value={pr.id}>{pr.nombre} — {fmtUSD(pr.precio)}</option>)}
                  </select>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, background:C.gray100, borderRadius:8, padding:'4px 10px' }}>
                      <button onClick={() => updItem(idx,'qty',Math.max(1,it.qty-1))} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                        <Icon name="minus_c" size={18} color={C.teal} />
                      </button>
                      <span style={{ fontSize:15, fontWeight:800, minWidth:20, textAlign:'center' }}>{it.qty}</span>
                      <button onClick={() => updItem(idx,'qty',it.qty+1)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                        <Icon name="plus_c" size={18} color={C.teal} />
                      </button>
                    </div>
                    <span style={{ fontSize:14, fontWeight:800, color:C.teal }}>{p ? fmtUSD(p.precio*it.qty) : '$0.00'}</span>
                  </div>
                </div>
                {items.length > 1 && (
                  <button onClick={() => rmItem(idx)} style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex' }}>
                    <Icon name="x_circle" size={16} color={C.red} />
                  </button>
                )}
              </div>
            </Card>
          )
        })}

        <p style={{ fontSize:13, fontWeight:700, color:C.gray600, margin:'14px 0 8px' }}>Método de pago</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
          {METODOS.map(m => (
            <button key={m.key} onClick={() => setMet(m.key)}
              style={{ padding:'10px 6px', borderRadius:12, border:`2px solid ${metodo===m.key?C.teal:C.gray200}`, background:metodo===m.key?C.teal+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
              <Icon name={m.icon} size={18} color={metodo===m.key?C.teal:C.gray400} style={{ display:'block', margin:'0 auto 4px' }} />
              <span style={{ fontSize:11, fontWeight:700, color:metodo===m.key?C.teal:C.gray600 }}>{m.label}</span>
            </button>
          ))}
        </div>

        <div style={{ background:C.navy, borderRadius:16, padding:'16px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:15, color:C.gray400 }}>Total a cobrar</span>
          <span style={{ fontSize:30, fontWeight:900, color:'#fff' }}>{fmtUSD(total)}</span>
        </div>

        <Button icon="ok_circle" size="lg" fullWidth disabled={!cId || total===0 || saving} onClick={handleSave}>
          {saving ? 'Guardando...' : 'Registrar venta'}
        </Button>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

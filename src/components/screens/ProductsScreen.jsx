import { useState } from 'react'
import { C, categoriaColor, categoriaIcon } from '../../constants/colors'
import { PRODUCTOS } from '../../constants/data'
import { fmtUSD } from '../../utils/helpers'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'

export default function ProductsScreen() {
  const [cat,    setCat]    = useState('todos')
  const [search, setSearch] = useState('')
  const filtered = PRODUCTOS.filter(p=>(cat==='todos'||p.categoria===cat)&&p.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <div style={{ background:C.navy, padding:'20px 14px 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:0 }}>Catálogo</h1>
          <span style={{ fontSize:13, color:C.teal, fontWeight:700 }}>{PRODUCTOS.length} productos</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', background:'#ffffff20', borderRadius:12, padding:'8px 12px', gap:8 }}>
          <Icon name="search" size={16} color={C.gray400} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto..." style={{ background:'none', border:'none', color:'#fff', fontSize:14, flex:1, fontFamily:'inherit' }} />
        </div>
      </div>
      <div style={{ display:'flex', background:'#fff', borderBottom:`1px solid ${C.gray200}` }}>
        {[['todos','Todos'],['alimento','Alimentos'],['medicina','Medicina'],['accesorio','Accesorios']].map(([key,lbl])=>(
          <button key={key} onClick={()=>setCat(key)} style={{ flex:1, padding:'12px 4px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:cat===key?700:400, color:cat===key?C.teal:C.gray400, borderBottom:`2px solid ${cat===key?C.teal:'transparent'}`, fontFamily:'inherit' }}>{lbl}</button>
        ))}
      </div>
      <div style={{ padding:'12px 14px' }}>
        {filtered.map(p=>(
          <Card key={p.id}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:46, height:46, borderRadius:14, background:categoriaColor(p.categoria)+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name={categoriaIcon(p.categoria)} size={22} color={categoriaColor(p.categoria)} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nombre}</p>
                <p style={{ fontSize:12, color:C.gray400, margin:'2px 0' }}>{p.marca}</p>
                <Badge bg={categoriaColor(p.categoria)+'15'} txt={categoriaColor(p.categoria)}>{p.categoria}</Badge>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:17, fontWeight:900, color:C.teal, margin:0 }}>{fmtUSD(p.precio)}</p>
                <p style={{ fontSize:11, color:C.gray400 }}>Stock: {p.stock}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

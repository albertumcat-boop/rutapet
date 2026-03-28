import { useState } from 'react'
import { C, tipoColor, tipoIconName } from '../../constants/colors'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'

const TIPOS = [
  { key:'veterinaria',  label:'Veterinaria',  icon:'steth'    },
  { key:'petshop',      label:'Pet Shop',     icon:'shopping' },
  { key:'agropecuaria', label:'Agropecuaria', icon:'leaf'     },
]

export default function AddClientScreen({ onBack }) {
  const [form, setForm] = useState({ nombre:'', tipo:'petshop', contacto:'', telefono:'', direccion:'', notas:'' })
  const [done, setDone] = useState(false)
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  if (done) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
        <Icon name="ok_circle" size={36} color={C.green} />
      </div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.gray800 }}>¡Cliente guardado!</h2>
    </div>
  )

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar title="Nuevo cliente" onBack={onBack} />
      <div style={{ padding: 14 }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
          <div style={{ width:80, height:80, borderRadius:20, background:C.gray100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', border:`2px dashed ${C.gray200}` }}>
            <Icon name="camera" size={24} color={C.gray400} />
            <span style={{ fontSize:11, color:C.gray400, marginTop:4 }}>Foto</span>
          </div>
        </div>

        <Card>
          <p style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:10 }}>Tipo de negocio</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {TIPOS.map((t) => (
              <button key={t.key} onClick={() => upd('tipo', t.key)} style={{ padding:'10px 6px', borderRadius:12, border:`2px solid ${form.tipo===t.key?tipoColor(t.key):C.gray200}`, background:form.tipo===t.key?tipoColor(t.key)+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
                <Icon name={t.icon} size={20} color={tipoColor(t.key)} style={{ display:'block', margin:'0 auto 4px' }} />
                <span style={{ fontSize:11, fontWeight:700, color:form.tipo===t.key?tipoColor(t.key):C.gray600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {[
          { key:'nombre',    label:'Nombre del negocio *', placeholder:'Ej: Veterinaria San Pedro' },
          { key:'contacto',  label:'Contacto',              placeholder:'Ej: Dr. García'            },
          { key:'telefono',  label:'Teléfono',              placeholder:'+58 412-XXX-XXXX'          },
          { key:'direccion', label:'Dirección',             placeholder:'Av. Principal, Local 5...' },
        ].map((f) => (
          <div key={f.key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>{f.label}</label>
            <input value={form[f.key]} onChange={(e) => upd(f.key, e.target.value)} placeholder={f.placeholder} style={{ width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
        ))}

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Notas (opcional)</label>
          <textarea value={form.notas} onChange={(e) => upd('notas', e.target.value)} placeholder="Preferencias, observaciones..." rows={3} style={{ width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }} />
        </div>

        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Ubicación en mapa</label>
          <div style={{ height:110, background:'linear-gradient(135deg,#E3F2FD,#E8F5E9)', borderRadius:12, border:`1.5px solid ${C.gray200}`, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer' }}>
            <Icon name="pin" size={20} color={C.teal} />
            <span style={{ fontSize:14, color:C.teal, fontWeight:700 }}>Seleccionar en Google Maps</span>
          </div>
        </div>

        <Button icon="ok_circle" size="lg" fullWidth onClick={() => { setDone(true); setTimeout(onBack, 1400) }}>Guardar cliente</Button>
      </div>
      <div style={{ height: 90 }} />
    </div>
  )
}

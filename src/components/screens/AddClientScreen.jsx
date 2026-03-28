import { useState, useRef } from 'react'
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

// ── Comprime imagen al tamaño y calidad indicados ──────
function comprimirImagen(file, maxWidth = 800, calidad = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height

        // Escalar si es más ancha que maxWidth
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w)
          w = maxWidth
        }

        canvas.width  = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)

        // Exportar como JPEG comprimido
        const base64 = canvas.toDataURL('image/jpeg', calidad)
        resolve(base64)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function AddClientScreen({ onBack }) {
  const [form,         setForm]        = useState({ nombre:'', tipo:'petshop', contacto:'', telefono:'', direccion:'', notas:'' })
  const [foto,         setFoto]        = useState(null)
  const [fotoSize,     setFotoSize]    = useState(null)
  const [comprimiendo, setComprimiendo]= useState(false)
  const [done,         setDone]        = useState(false)
  const fileRef = useRef()

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const originalKB = Math.round(file.size / 1024)
    setComprimiendo(true)

    try {
      // Comprimir a máx 800px de ancho y 70% de calidad
      const base64 = await comprimirImagen(file, 800, 0.7)

      // Calcular tamaño comprimido (base64 a KB aproximado)
      const comprimidoKB = Math.round((base64.length * 0.75) / 1024)

      setFoto(base64)
      setFotoSize({ original: originalKB, comprimido: comprimidoKB })
    } catch (err) {
      alert('Error al procesar la imagen')
    } finally {
      setComprimiendo(false)
    }
  }

  const handleMapa = () => {
    if (form.direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(form.direccion + ', Caracas, Venezuela')}`, '_blank')
    } else {
      window.open('https://www.google.com/maps', '_blank')
    }
  }

  if (done) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
        <Icon name="ok_circle" size={36} color={C.green} />
      </div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.gray800 }}>¡Cliente guardado!</h2>
      <p style={{ color:C.gray400 }}>Redirigiendo...</p>
    </div>
  )

  return (
    <div className="screen-enter" style={{ background:C.gray50, minHeight:'100vh' }}>
      <TopBar title="Nuevo cliente" onBack={onBack} />
      <div style={{ padding:14 }}>

        {/* Foto con compresión */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:18 }}>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              width:100, height:100, borderRadius:22,
              background: foto ? 'transparent' : C.gray100,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              cursor:'pointer', border:`2px dashed ${foto ? C.teal : C.gray200}`,
              overflow:'hidden', position:'relative',
            }}
          >
            {comprimiendo ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <span style={{ width:20, height:20, border:`2px solid ${C.teal}`, borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                <span style={{ fontSize:10, color:C.gray400 }}>Comprimiendo...</span>
              </div>
            ) : foto ? (
              <>
                <img src={foto} alt="foto" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.5)', padding:'4px 0', textAlign:'center' }}>
                  <span style={{ fontSize:9, color:'#fff', fontWeight:700 }}>Cambiar foto</span>
                </div>
              </>
            ) : (
              <>
                <Icon name="camera" size={26} color={C.gray400} />
                <span style={{ fontSize:11, color:C.gray400, marginTop:6 }}>Agregar foto</span>
              </>
            )}
          </div>

          {/* Info de compresión */}
          {fotoSize && (
            <div style={{ marginTop:8, background:'#DCFCE7', borderRadius:10, padding:'6px 14px', display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="ok_circle" size={14} color={C.green} />
              <span style={{ fontSize:11, color:'#166534', fontWeight:700 }}>
                Comprimida: {fotoSize.original} KB → {fotoSize.comprimido} KB
                {' '}({Math.round((1 - fotoSize.comprimido / fotoSize.original) * 100)}% menos)
              </span>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFoto}
            style={{ display:'none' }}
          />
        </div>

        {/* Tipo de negocio */}
        <Card>
          <p style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:10 }}>Tipo de negocio</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {TIPOS.map(t => (
              <button key={t.key} onClick={() => upd('tipo', t.key)}
                style={{ padding:'10px 6px', borderRadius:12, border:`2px solid ${form.tipo===t.key?tipoColor(t.key):C.gray200}`, background:form.tipo===t.key?tipoColor(t.key)+'12':'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
                <Icon name={t.icon} size={20} color={tipoColor(t.key)} style={{ display:'block', margin:'0 auto 4px' }} />
                <span style={{ fontSize:11, fontWeight:700, color:form.tipo===t.key?tipoColor(t.key):C.gray600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Campos de texto */}
        {[
          { key:'nombre',    label:'Nombre del negocio *', placeholder:'Ej: Veterinaria San Pedro' },
          { key:'contacto',  label:'Contacto',              placeholder:'Ej: Dr. García'            },
          { key:'telefono',  label:'Teléfono',              placeholder:'+58 412-XXX-XXXX'          },
          { key:'direccion', label:'Dirección',             placeholder:'Av. Principal, Local 5...' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>{f.label}</label>
            <input
              value={form[f.key]}
              onChange={e => upd(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{ width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }}
            />
          </div>
        ))}

        {/* Notas */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Notas (opcional)</label>
          <textarea
            value={form.notas}
            onChange={e => upd('notas', e.target.value)}
            placeholder="Preferencias, observaciones..."
            rows={3}
            style={{ width:'100%', padding:'11px 12px', borderRadius:12, border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}
          />
        </div>

        {/* Ubicación — abre Google Maps */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>Ubicación</label>
          <div onClick={handleMapa}
            style={{ height:100, background:'linear-gradient(135deg,#E3F2FD,#E8F5E9)', borderRadius:12, border:`1.5px solid ${C.gray200}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer' }}>
            <Icon name="map" size={28} color={C.teal} />
            <span style={{ fontSize:13, color:C.teal, fontWeight:700 }}>
              {form.direccion ? 'Ver en Google Maps ↗' : 'Abrir Google Maps ↗'}
            </span>
            <span style={{ fontSize:11, color:C.gray400 }}>Toca para verificar la dirección</span>
          </div>
        </div>

        <Button
          icon="ok_circle"
          size="lg"
          fullWidth
          onClick={() => {
            if (!form.nombre) { alert('El nombre del negocio es obligatorio'); return }
            setDone(true)
            setTimeout(onBack, 1400)
          }}
        >
          Guardar cliente
        </Button>
      </div>
      <div style={{ height:90 }} />
    </div>
  )
}

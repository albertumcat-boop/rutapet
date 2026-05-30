/**
 * KpiCard.jsx — Tarjeta de métrica clave
 * Auditado: overflow en valores largos, ícono alineado
 */
import { C } from '../../constants/colors'
import Icon from './Icon'

export default function KpiCard({ label, val, sub, icon, color = C.teal, style: s = {} }) {
  return (
    <div style={{
      background:   '#fff',
      borderRadius: 16,
      padding:      '14px',
      border:       `1px solid ${C.gray200}`,
      ...s,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <p style={{ fontSize:12, color:C.gray400, margin:0, fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:6 }}>
          {label}
        </p>
        {icon && (
          <div style={{ width:32, height:32, borderRadius:9, background:color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon name={icon} size={15} color={color} />
          </div>
        )}
      </div>
      <p style={{ fontSize:22, fontWeight:900, color:C.gray800, margin:0, lineHeight:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {val}
      </p>
      {sub && (
        <p style={{ fontSize:11, color:C.gray400, margin:'4px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

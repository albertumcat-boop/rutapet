import { C } from '../../constants/colors'
import Icon from './Icon'

export default function KpiCard({ label, val, sub, icon, color = C.teal, trend }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '14px',
      border: `1px solid ${C.gray200}`, flex: 1, minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, color: C.gray600, margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: C.gray800, margin: 0 }}>{val}</p>
          {sub && <p style={{ fontSize: 11, color: C.gray400, margin: '2px 0 0' }}>{sub}</p>}
        </div>
        {icon && (
          <div style={{ background: color + '20', borderRadius: 10, padding: 8 }}>
            <Icon name={icon} size={18} color={color} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Icon name={trend >= 0 ? 'trending_up' : 'trending_dn'} size={13} color={trend >= 0 ? C.green : C.red} />
          <span style={{ fontSize: 11, color: trend >= 0 ? C.green : C.red, fontWeight: 700 }}>
            {trend >= 0 ? '+' : ''}{trend}% vs mes anterior
          </span>
        </div>
      )}
    </div>
  )
}

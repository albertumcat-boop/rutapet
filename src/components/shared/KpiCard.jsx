import { C } from '../../constants/colors'
import Icon from './Icon'

export default function KpiCard({ label, val, sub, icon, color = C.teal, trend }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '12px',
      border: `1px solid ${C.gray200}`, flex: 1, minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: C.gray600, margin: '0 0 4px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </p>
          <p style={{ fontSize: 18, fontWeight: 900, color: C.gray800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {val}
          </p>
          {sub && (
            <p style={{ fontSize: 10, color: C.gray400, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div style={{ background: color + '20', borderRadius: 10, padding: 7, flexShrink: 0 }}>
            <Icon name={icon} size={16} color={color} />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Icon
            name={trend >= 0 ? 'trending_up' : 'trending_dn'}
            size={12}
            color={trend >= 0 ? C.green : C.red}
          />
          <span style={{ fontSize: 10, color: trend >= 0 ? C.green : C.red, fontWeight: 700 }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </div>
  )
}

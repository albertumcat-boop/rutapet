import { C } from '../../constants/colors'

export default function Card({ children, onClick, style: s = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${C.gray200}`,
        padding: '14px',
        marginBottom: 10,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        minWidth: 0,
        ...s,
      }}
    >
      {children}
    </div>
  )
}

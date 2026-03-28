export default function Badge({ children, bg = '#E0F2F1', txt = '#0F4C41' }) {
  return (
    <span style={{
      background: bg, color: txt,
      fontSize: 11, fontWeight: 700,
      padding: '2px 8px', borderRadius: 20,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

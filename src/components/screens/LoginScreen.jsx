import { useState } from 'react'
import { C } from '../../constants/colors'
import Icon from '../shared/Icon'

export default function LoginScreen({ onLogin }) {
  const [email,   setEmail]   = useState('carlos@rutapet.com')
  const [pass,    setPass]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleLogin = () => {
    if (!email || !pass) { setError('Completa todos los campos'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1100)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${C.gray200}`, fontSize: 15,
    fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14,
  }

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 76, height: 76, borderRadius: 22, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 8px 40px ${C.teal}55` }}>
            <Icon name="route" size={38} color="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>RutaPet</h1>
          <p style={{ fontSize: 14, color: C.gray400, marginTop: 6 }}>Gestión de ventas en ruta · Venezuela</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: C.navy, marginBottom: 4 }}>Bienvenido 👋</h2>
          <p style={{ fontSize: 13, color: C.gray600, marginBottom: 22 }}>Ingresa tus credenciales para continuar</p>

          <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>Correo electrónico</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empresa.com" style={inputStyle} />

          <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>Contraseña</label>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} style={{ ...inputStyle, marginBottom: 6 }} />

          <p style={{ textAlign: 'right', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: C.teal, cursor: 'pointer', fontWeight: 700 }}>¿Olvidaste tu contraseña?</span>
          </p>

          {error && <p style={{ fontSize: 13, color: C.red, marginBottom: 14, fontWeight: 600 }}>{error}</p>}

          <button onClick={handleLogin} disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? C.gray200 : C.teal, color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading && <span style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <div style={{ marginTop: 18, padding: '10px 12px', background: C.gray50, borderRadius: 10, fontSize: 12, color: C.gray600 }}>
            <strong>Demo vendedor:</strong> carlos@rutapet.com / 123456<br />
            <strong>Demo admin:</strong> admin@rutapet.com / admin123
          </div>
        </div>
      </div>
    </div>
  )
}

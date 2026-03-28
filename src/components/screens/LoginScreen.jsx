import { useState } from 'react'
import { C } from '../../constants/colors'
import Icon from '../shared/Icon'
import { auth } from '../../../firebase/firebase.config'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'

export default function LoginScreen({ onLogin }) {
  const [modo,    setModo]    = useState('login')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (!email || !pass) { setError('Completa todos los campos'); return }
    if (pass.length < 6)  { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setError('')
    setLoading(true)
    try {
      if (modo === 'login') {
        await signInWithEmailAndPassword(auth, email, pass)
      } else {
        await createUserWithEmailAndPassword(auth, email, pass)
      }
      onLogin()
    } catch (e) {
      const msgs = {
        'auth/user-not-found':    'Correo no registrado',
        'auth/wrong-password':    'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/invalid-email':     'Correo inválido',
        'auth/invalid-credential': 'Correo o contraseña incorrectos',
      }
      setError(msgs[e.code] || 'Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${C.gray200}`, fontSize: 15,
    fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14,
  }

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 76, height: 76, borderRadius: 22, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 8px 40px ${C.teal}55` }}>
            <Icon name="route" size={38} color="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>RutaPet</h1>
          <p style={{ fontSize: 14, color: C.gray400, marginTop: 6 }}>Gestión de ventas en ruta · Venezuela</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: C.navy, marginBottom: 4 }}>
            {modo === 'login' ? 'Bienvenido 👋' : 'Crear cuenta 🐾'}
          </h2>
          <p style={{ fontSize: 13, color: C.gray600, marginBottom: 22 }}>
            {modo === 'login' ? 'Ingresa tus credenciales' : 'Regístrate para comenzar'}
          </p>

          <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
            style={inputStyle}
          />

          <label style={{ fontSize: 13, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>Contraseña</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ ...inputStyle, marginBottom: 6 }}
          />

          {error && (
            <p style={{ fontSize: 13, color: C.red, marginBottom: 14, fontWeight: 600 }}>{error}</p>
          )}

          <div style={{ marginBottom: 16 }} />

          {/* Botón principal */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? C.gray200 : C.teal, color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}
          >
            {loading && (
              <span style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            )}
            {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Registrarme'}
          </button>

          {/* Cambiar modo */}
          <p style={{ textAlign: 'center', fontSize: 13, color: C.gray600 }}>
            {modo === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span
              onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError('') }}
              style={{ color: C.teal, fontWeight: 800, cursor: 'pointer' }}
            >
              {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

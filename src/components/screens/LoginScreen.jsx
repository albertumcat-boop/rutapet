/**
 * LoginScreen.jsx — Autenticación
 * Auditado: manejo de errores Firebase, Google OAuth, UX
 */
import { useState } from 'react'
import { C } from '../../constants/colors'
import Icon from '../shared/Icon'
import { auth } from '../../../firebase/firebase.config'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'

const provider = new GoogleAuthProvider()

const ERROR_MESSAGES = {
  'auth/user-not-found':        'Correo no registrado',
  'auth/wrong-password':        'Contraseña incorrecta',
  'auth/email-already-in-use':  'Este correo ya está registrado',
  'auth/invalid-email':         'Correo inválido',
  'auth/invalid-credential':    'Correo o contraseña incorrectos',
  'auth/weak-password':         'La contraseña debe tener al menos 6 caracteres',
  'auth/popup-closed-by-user':  'Cerraste la ventana de Google',
  'auth/cancelled-popup-request':'Solicitud cancelada',
  'auth/network-request-failed':'Sin conexión a internet',
  'auth/too-many-requests':     'Demasiados intentos. Intenta en unos minutos',
  'auth/user-disabled':         'Tu cuenta ha sido deshabilitada. Contacta al administrador',
}

const getErrorMsg = (code) => ERROR_MESSAGES[code] || 'Ocurrió un error. Intenta de nuevo'

export default function LoginScreen({ onLogin, onVolver }) {
  const [modo,         setModo]         = useState('login')
  const [email,        setEmail]        = useState('')
  const [pass,         setPass]         = useState('')
  const [loading,      setLoading]      = useState(false)
  const [loadingG,     setLoadingG]     = useState(false)
  const [error,        setError]        = useState('')
  const [resetSent,    setResetSent]    = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email.trim()) return setError('Ingresa tu correo')
    if (!pass)         return setError('Ingresa tu contraseña')
    if (modo === 'registro' && pass.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres')
    }

    setLoading(true)
    try {
      if (modo === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), pass)
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), pass)
      }
      onLogin()
    } catch (e) {
      setError(getErrorMsg(e.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoadingG(true)
    try {
      await signInWithPopup(auth, provider)
      onLogin()
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' &&
          e.code !== 'auth/cancelled-popup-request') {
        setError(getErrorMsg(e.code))
      }
    } finally {
      setLoadingG(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    if (!email.trim()) return setError('Ingresa tu correo para restablecer la contraseña')
    setLoadingReset(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setResetSent(true)
    } catch (e) {
      setError(getErrorMsg(e.code))
    } finally {
      setLoadingReset(false)
    }
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setError('')
    setPass('')
    setResetSent(false)
  }

  const inputStyle = {
    width:'100%', padding:'12px 14px', borderRadius:12,
    border:`1.5px solid ${C.gray200}`, fontSize:15,
    fontFamily:'inherit', boxSizing:'border-box', marginBottom:14,
  }

  const btnBase = {
    width:'100%', padding:'13px', border:'none', borderRadius:14,
    fontSize:15, fontWeight:800, cursor:'pointer',
    fontFamily:'inherit', display:'flex', alignItems:'center',
    justifyContent:'center', gap:10,
  }

  return (
    <div style={{ minHeight:'100vh', background:C.navy, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 20px' }}>
      <div style={{ width:'100%', maxWidth:380 }}>

        {/* Botón volver */}
        {onVolver && (
          <button onClick={onVolver}
            style={{ background:'none', border:'none', color:C.gray400, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, fontSize:13, marginBottom:20, padding:0 }}>
            ← Volver al inicio
          </button>
        )}

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:76, height:76, borderRadius:22, background:C.teal, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:`0 8px 40px ${C.teal}55` }}>
            <Icon name="paw" size={38} color="#fff" />
          </div>
          <h1 style={{ fontSize:30, fontWeight:900, color:'#fff', margin:0, letterSpacing:-1 }}>VetRuta</h1>
          <p style={{ fontSize:13, color:C.gray400, marginTop:6 }}>Ventas de medicamentos veterinarios</p>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:24, padding:'28px 24px' }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:C.navy, marginBottom:4 }}>
            {modo === 'login' ? 'Bienvenido 👋' : 'Crear cuenta'}
          </h2>
          <p style={{ fontSize:13, color:C.gray600, marginBottom:22 }}>
            {modo === 'login' ? 'Ingresa a tu cuenta' : 'Regístrate para comenzar'}
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loadingG || loading}
            style={{ ...btnBase, background:'#fff', border:`1.5px solid ${C.gray200}`, color:C.gray800, marginBottom:16, opacity:loadingG?0.7:1 }}>
            {loadingG ? (
              <span style={{ width:18, height:18, border:'2px solid #ccc', borderTopColor:C.teal, borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink:0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {loadingG ? 'Conectando...' : 'Continuar con Google'}
          </button>

          {/* Separador */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:C.gray200 }} />
            <span style={{ fontSize:12, color:C.gray400, fontWeight:600 }}>o con correo</span>
            <div style={{ flex:1, height:1, background:C.gray200 }} />
          </div>

          {/* Email */}
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
            Correo electrónico
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
            disabled={loading || loadingG}
            style={inputStyle} />

          {/* Password */}
          <label style={{ fontSize:13, fontWeight:700, color:C.gray600, display:'block', marginBottom:6 }}>
            Contraseña
          </label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder="••••••••"
            disabled={loading || loadingG}
            onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
            style={{ ...inputStyle, marginBottom:6 }} />

          {/* Olvidé contraseña — solo en modo login */}
          {modo === 'login' && (
            <div style={{ textAlign:'right', marginBottom:8 }}>
              <span
                onClick={!loadingReset ? handleForgotPassword : undefined}
                style={{ fontSize:12, color:C.teal, fontWeight:700, cursor:'pointer', opacity:loadingReset?0.5:1 }}>
                {loadingReset ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
              </span>
            </div>
          )}

          {resetSent && (
            <p style={{ fontSize:13, color:'#22C55E', marginBottom:10, fontWeight:600 }}>
              ✓ Revisa tu correo — te enviamos el enlace de restablecimiento
            </p>
          )}

          {error && (
            <p style={{ fontSize:13, color:C.red, marginBottom:10, fontWeight:600 }}>⚠ {error}</p>
          )}

          <div style={{ marginBottom:14 }} />

          {/* Botón principal */}
          <button onClick={handleSubmit} disabled={loading || loadingG}
            style={{ ...btnBase, background:loading?C.gray200:C.teal, color:'#fff', marginBottom:14, opacity:(loading||loadingG)?0.7:1, cursor:(loading||loadingG)?'not-allowed':'pointer' }}>
            {loading && (
              <span style={{ width:18, height:18, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            )}
            {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Registrarme'}
          </button>

          {/* Cambiar modo */}
          <p style={{ textAlign:'center', fontSize:13, color:C.gray600, margin:0 }}>
            {modo === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span onClick={() => cambiarModo(modo==='login'?'registro':'login')}
              style={{ color:C.teal, fontWeight:800, cursor:'pointer' }}>
              {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </span>
          </p>
        </div>

        <p style={{ textAlign:'center', color:C.gray400, fontSize:11, marginTop:20 }}>
          Al continuar aceptas los términos de uso
        </p>
      </div>
    </div>
  )
}

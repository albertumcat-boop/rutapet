/**
 * App.jsx — Router principal
 * Auditado: manejo de estado, limpieza de efectos, rutas
 */
import { useState, useEffect } from 'react'
import { auth } from '../firebase/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { useConfig } from './context/ConfigContext'
import Icon from './components/shared/Icon'
import BottomNav           from './components/shared/BottomNav'
import LandingScreen       from './components/screens/LandingScreen'
import LoginScreen         from './components/screens/LoginScreen'
import OnboardingScreen    from './components/screens/OnboardingScreen'
import DashboardScreen     from './components/screens/DashboardScreen'
import ClientsScreen       from './components/screens/ClientsScreen'
import ClientDetailScreen  from './components/screens/ClientDetailScreen'
import AddClientScreen     from './components/screens/AddClientScreen'
import MapScreen           from './components/screens/MapScreen'
import AddSaleScreen       from './components/screens/AddSaleScreen'
import ProductsScreen      from './components/screens/ProductsScreen'
import PaymentsScreen      from './components/screens/PaymentsScreen'
import AnalyticsScreen     from './components/screens/AnalyticsScreen'
import RoutesScreen        from './components/screens/RoutesScreen'
import VisitsScreen        from './components/screens/VisitsScreen'
import MoreScreen          from './components/screens/MoreScreen'
import AdminScreen         from './components/screens/AdminScreen'
import AboutScreen         from './components/screens/AboutScreen'
import { C } from './constants/colors'

// Pantallas que muestran la barra de navegación inferior
const NAV_SCREENS = ['dashboard', 'clients', 'map', 'analytics', 'more']

const LoadingScreen = () => (
  <div style={{
    minHeight:'100vh', background:C.navy,
    display:'flex', alignItems:'center', justifyContent:'center',
  }}>
    <div style={{ textAlign:'center' }}>
      <div style={{
        width:60, height:60, borderRadius:16, background:C.teal,
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 16px',
        boxShadow:`0 8px 32px ${C.teal}55`,
      }}>
        <Icon name="route" size={30} color="#fff" />
      </div>
      <div style={{
        width:28, height:28,
        border:`3px solid ${C.teal}`,
        borderTopColor:'transparent',
        borderRadius:'50%',
        animation:'spin 0.7s linear infinite',
        margin:'0 auto 12px',
      }} />
      <p style={{ color:C.gray400, fontSize:13 }}>Cargando RutaVentas...</p>
    </div>
  </div>
)

export default function App() {
  const { config, loading: configLoading } = useConfig()
  const [loggedIn,    setLoggedIn]    = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [showLanding, setShowLanding] = useState(false)
  const [screen,      setScreen]      = useState('dashboard')
  const [screenData,  setScreenData]  = useState(null)
  const [history,     setHistory]     = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user)
      setAuthChecked(true)
      if (!user) setShowLanding(true)
    })
    return unsub
  }, [])

  const nav = (to, data = null) => {
    setHistory(h => [...h, { screen, data: screenData }])
    setScreen(to)
    setScreenData(data)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setHistory(h => h.slice(0, -1))
      setScreen(prev.screen)
      setScreenData(prev.data)
    } else {
      setScreen('dashboard')
      setScreenData(null)
    }
    window.scrollTo(0, 0)
  }

  const tabChange = (tab) => {
    setHistory([])
    setScreen(tab)
    setScreenData(null)
    window.scrollTo(0, 0)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
    setLoggedIn(false)
    setShowLanding(true)
    setScreen('dashboard')
    setHistory([])
    setScreenData(null)
  }

  // ── Estados de carga ──────────────────────────────────
  if (!authChecked || configLoading) return <LoadingScreen />

  // ── Landing — visitante no logueado ───────────────────
  if (!loggedIn && showLanding) {
    return <LandingScreen onEntrar={() => setShowLanding(false)} />
  }

  // ── Login ─────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={() => { setLoggedIn(true); setShowLanding(false) }}
        onVolver={() => setShowLanding(true)}
      />
    )
  }

  // ── Onboarding — primera vez ──────────────────────────
  if (!config.onboardingCompleto) {
    return <OnboardingScreen />
  }

  // ── App principal ─────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':    return <DashboardScreen    nav={nav} />
      case 'clients':      return <ClientsScreen      nav={nav} />
      case 'clientDetail': return <ClientDetailScreen cliente={screenData} onBack={goBack} nav={nav} />
      case 'addClient':    return <AddClientScreen    onBack={goBack} />
      case 'map':          return <MapScreen          nav={nav} onBack={goBack} />
      case 'addSale':      return <AddSaleScreen      onBack={goBack} initCId={screenData?.clienteId} />
      case 'products':     return <ProductsScreen     onBack={goBack} />
      case 'payments':     return <PaymentsScreen     onBack={goBack} />
      case 'analytics':    return <AnalyticsScreen    onBack={goBack} />
      case 'routes':       return <RoutesScreen       onBack={goBack} />
      case 'visits':       return <VisitsScreen       nav={nav} onBack={goBack} />
      case 'more':         return <MoreScreen         nav={nav} onLogout={handleLogout} />
      case 'admin':        return <AdminScreen        onBack={goBack} />
      case 'about':        return <AboutScreen        onBack={goBack} />
      default:             return <DashboardScreen    nav={nav} />
    }
  }

  return (
    <div style={{ maxWidth:480, margin:'0 auto', position:'relative', minHeight:'100vh' }}>
      {renderScreen()}
      {NAV_SCREENS.includes(screen) && (
        <BottomNav current={screen} onChange={tabChange} />
      )}
    </div>
  )
}
